import collections
from firebase_functions import https_fn
from firebase_admin import firestore
import flask

import constants as c


debug_bp = flask.Blueprint("debug", __name__)

_NAMES = ["Hyuni", "Seayeon", "Woosung", "Jiwoo"]


@debug_bp.patch("/update_game_records_entirely")
def update_game_records_entirely() -> https_fn.Response:
    """Update all game records, intended to be a one-time job."""
    store = firestore.client()
    try:
        num_played = collections.defaultdict(int)
        num_wins = collections.defaultdict(int)
        game_result = store.collection(c.GAME_RESULT).get()
        for doc in game_result:
            game = doc.to_dict()
            for player_id in game.get(c.WIN, {}).get(c.PLAYERS_ID, []):
                num_played[player_id] += 1
                num_wins[player_id] += 1
            for player_id in game.get(c.LOSE, {}).get(c.PLAYERS_ID, []):
                num_played[player_id] += 1

        googlers = store.collection(c.GOOGLERS).get()
        for doc in googlers:
            doc.reference.update(
                {
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
        members = []
        googlers = store.collection(c.GOOGLERS)
        for doc in googlers.get():
            doc.reference.delete()
        for i in range(4):
            _, doc_ref = googlers.add({c.NAME: _NAMES[i]})
            members.append(doc_ref.id)
        games = store.collection(c.GAME_RESULT)
        for doc in games.get():
            doc.reference.delete()
        """
        games.add(
            {
                "win": {"playersId": [members[0], members[1]], "score": 21},
                "lose": {"playersId": [members[2], members[3]], "score": 15},
            }
        )
        games.add(
            {
                "win": {"playersId": [members[0], members[2]], "score": 21},
                "lose": {"playersId": [members[1], members[3]], "score": 17},
            }
        )
        """
    except Exception as e:
        return https_fn.Response(f"Failed to make_fake_db {e}")
    return https_fn.Response("Made a fake db")


@debug_bp.post("/add_game_result")
def add_game_result() -> https_fn.Response:
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
                print(f"Player name {name} is not found.")
                continue
            player = player[0]
            game_result[c.WIN][c.PLAYERS_ID].append(player.reference.id)
        for name in request.get("lose", {}).get("players", []):
            player = store.collection(c.GOOGLERS).where(c.NAME, "==", name).get()
            if not player:
                print(f"Player name {name} is not found.")
                continue
            player = player[0]
            game_result[c.LOSE][c.PLAYERS_ID].append(player.reference.id)
        game_result[c.WIN][c.SCORE] = request.get("win", {}).get("score", 0)
        game_result[c.LOSE][c.SCORE] = request.get("lose", {}).get("score", 0)
        store.collection(c.GAME_RESULT).add(game_result)
    except Exception as e:
        return https_fn.Response(f"Failed to add_game_result {e}")
    return https_fn.Response("Added a game result successfully")
