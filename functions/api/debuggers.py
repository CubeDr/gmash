import collections
from datetime import datetime
from firebase_functions import https_fn
from firebase_admin import db, firestore
import flask


from api import common
import constants as c


debug_bp = flask.Blueprint("debug", __name__)

_NAMES = ["Hyuni", "Seayeon", "Woosung", "Jiwoo"]


@debug_bp.patch("/update_all_game_records")
def update_all_game_records() -> https_fn.Response:
    """Update all game records in minimal transactions, intended to be a one-time job."""
    store = firestore.client()
    try:
        googlers = store.collection(c.GOOGLERS).get()
        members = [
            common.Googler.from_json(member.to_dict(), member.id) for member in googlers
        ]
        id_to_member = {member.id: member for member in members}
        for member in members:
            member.elo = c.DEFAULT_ELO

        num_played = collections.defaultdict(int)
        num_wins = collections.defaultdict(int)
        game_result = store.collection(c.GAME_RESULT).get()

        for doc in game_result:
            game = common.GameResult.from_json(doc.to_dict())
            for player_id in game.win.playersId:
                num_played[player_id] += 1
                num_wins[player_id] += 1
            for player_id in game.lose.playersId:
                num_played[player_id] += 1
            for id, updated_elo in common.compute_elo(
                winners=[id_to_member[id] for id in game.win.playersId],
                losers=[id_to_member[id] for id in game.lose.playersId],
                win_score=game.win.score,
                lose_score=game.lose.score,
            ).items():
                id_to_member[id].elo = updated_elo

        for doc in googlers:
            doc.reference.update(
                {
                    c.ELO: id_to_member[doc.id].elo,
                    c.NUM_PLAYED: num_played[doc.id],
                    c.NUM_WINS: num_wins[doc.id],
                }
            )
    except Exception as e:
        return https_fn.Response(f"Failed to update_game_record_entirely {e}")
    return https_fn.Response("Updated game records entirely")


@debug_bp.patch("/make_fake_db")
def make_fake_db() -> https_fn.Response:
    """Make fake Firestore DB."""
    store = firestore.client()
    try:
        ids = []
        googlers = store.collection(c.GOOGLERS)
        common.delete_all_documents_of_collection(googlers)
        for i in range(4):
            _, doc_ref = googlers.add({c.NAME: _NAMES[i]})
            ids.append(doc_ref.id)

        games = store.collection(c.GAME_RESULT)
        common.delete_all_documents_of_collection(games)

        db.reference(c.MEMBERS).update({i: id for i, id in enumerate(ids)})
        db.reference(c.SESSION).update({c.ID: "__current_session_id__"})

        games.add(
            {
                c.WIN: {c.PLAYERS_ID: [ids[0], ids[1]], c.SCORE: 21},
                c.LOSE: {c.PLAYERS_ID: [ids[2], ids[3]], c.SCORE: 15},
                c.TIMESTAMP: datetime.now(),
                c.SESSION_ID: "__current_session_id__",
            }
        )
        games.add(
            {
                c.WIN: {c.PLAYERS_ID: [ids[0], ids[2]], c.SCORE: 21},
                c.LOSE: {c.PLAYERS_ID: [ids[1], ids[3]], c.SCORE: 17},
                c.TIMESTAMP: datetime.now(),
                c.SESSION_ID: "__current_session_id__",
            }
        )
    except Exception as e:
        return https_fn.Response(f"Failed to make_fake_db {e}")
    return https_fn.Response("Made a fake db")


@debug_bp.post("/add_game_result_with_names")
def add_game_result_with_names() -> https_fn.Response:
    """Add game result.

    Request example:
    {
        'win': {
            'players': ['Hyuni', 'Seayeon'],
            'score': 21,
        },
        'lose': {
            'players': ['Woosung', 'Jiwoo'],
            'score': 15,
        },
    }
    """
    store = firestore.client()
    request = flask.request.get_json()
    try:
        game_result = {
            c.WIN: {c.PLAYERS_ID: [], c.SCORE: 0},
            c.LOSE: {c.PLAYERS_ID: [], c.SCORE: 0},
        }
        for name in request.get("win", {}).get("players", []):
            player = store.collection(c.GOOGLERS).where(c.NAME, "==", name).get()
            if not player:
                https_fn.Response(f"Failed to find player name {name}")
            player = player[0]
            game_result[c.WIN][c.PLAYERS_ID].append(player.reference.id)
        for name in request.get("lose", {}).get("players", []):
            player = store.collection(c.GOOGLERS).where(c.NAME, "==", name).get()
            if not player:
                https_fn.Response(f"Failed to find player name {name}")
            player = player[0]
            game_result[c.LOSE][c.PLAYERS_ID].append(player.reference.id)
        game_result[c.WIN][c.SCORE] = request.get("win", {}).get(c.SCORE, 0)
        game_result[c.LOSE][c.SCORE] = request.get("lose", {}).get(c.SCORE, 0)
        store.collection(c.GAME_RESULT).add(game_result)
    except Exception as e:
        return https_fn.Response(f"Failed to add_game_result {e}")
    return https_fn.Response("Added a game result successfully")
