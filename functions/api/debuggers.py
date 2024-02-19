import collections
from firebase_functions import https_fn
from firebase_admin import db, firestore
import flask
import time
import traceback


from api import common
import constants as c
import datatypes as d


debug_bp = flask.Blueprint("debug", __name__)


_NAMES = ["Hyuni", "Seayeon", "Woosung", "Jiwoo"]


@debug_bp.patch("/start_session")
def start_session() -> https_fn.Response:
    """Start a session."""
    if (session_id := common.get_current_session_id()) is not None:
        return https_fn.Response(f"Session {session_id} already in run")
    store = firestore.client()
    all_googlers = common.get_all_registered_googlers()
    db.reference(c.MEMBERS).update(
        {
            googler.id: {
                c.PLAYED: 0,
                c.UPCOMING: 0,
            }
            for googler in all_googlers
        }
    )
    new_session_id = str(int(time.time()))
    db.reference("/").update({c.SESSION_ID: new_session_id})
    return https_fn.Response(f"Started a session {new_session_id}")


@debug_bp.patch("/end_session")
def end_session() -> https_fn.Response:
    """End a session and store the result to "sessions" storage."""
    store = firestore.client()
    session_id = common.get_current_session_id()
    if session_id is None:
        return https_fn.Response(f"Session not in run")
    members = db.reference(c.MEMBERS).get()
    store.collection(c.SESSION).add(
        {
            c.ID: session_id,
            c.MEMBERS: members,
        }
    )
    db.reference("/").update({c.SESSION_ID: None})
    db.reference(c.UPCOMING).delete()
    db.reference(c.MEMBERS).delete()
    return https_fn.Response(f"Ended a session {session_id}")


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
    session_id = common.get_current_session_id()
    if session_id is None:
        return https_fn.Response(f"Session is not running")
    try:
        game_result = {
            c.WIN: {c.PLAYERS_ID: [], c.SCORE: 0},
            c.LOSE: {c.PLAYERS_ID: [], c.SCORE: 0},
            c.SESSION_ID: session_id,
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


@debug_bp.patch("/make_fake_db")
def make_fake_db() -> https_fn.Response:
    """Make fake Firestore DB."""
    store = firestore.client()
    try:
        ids = []
        googlers = store.collection(c.GOOGLERS)
        common.delete_all_documents_of_collection(googlers)
        for i in range(4):
            _, doc_ref = googlers.add(
                {
                    c.NAME: _NAMES[i],
                    c.ELO: c.DEFAULT_ELO,
                }
            )
            ids.append(doc_ref.id)

        games = store.collection(c.GAME_RESULT)
        sessions = store.collection(c.SESSION)
        common.delete_all_documents_of_collection(games)
        common.delete_all_documents_of_collection(sessions)

        db.reference(c.UPCOMING).delete()
        db.reference(c.MEMBERS).delete()
        db.reference(c.MEMBERS).update(
            {
                id: {
                    c.PLAYED: 0,
                    c.UPCOMING: 0,
                }
                for id in ids
            }
        )
        db.reference(c.UPCOMING).update(
            {
                0: {c.TEAM1: [ids[0], ids[1]], c.TEAM2: [ids[2], ids[3]]},
                1: {c.TEAM1: [ids[1], ids[2]], c.TEAM2: [ids[0], ids[3]]},
            },
        )
        db.reference("/").update({c.SESSION_ID: "1"})

        games.add(
            {
                c.WIN: {c.PLAYERS_ID: [ids[0], ids[1]], c.SCORE: 21},
                c.LOSE: {c.PLAYERS_ID: [ids[2], ids[3]], c.SCORE: 10},
                c.SESSION_ID: "0",
            }
        )
        games.add(
            {
                c.WIN: {c.PLAYERS_ID: [ids[0], ids[2]], c.SCORE: 21},
                c.LOSE: {c.PLAYERS_ID: [ids[1], ids[3]], c.SCORE: 5},
                c.SESSION_ID: "0",
            }
        )
        sessions.add(
            {
                c.ID: "0",
                c.MEMBERS: ids,
            }
        )
        games.add(
            {
                c.WIN: {c.PLAYERS_ID: [ids[0], ids[1]], c.SCORE: 21},
                c.LOSE: {c.PLAYERS_ID: [ids[2], ids[3]], c.SCORE: 15},
                c.SESSION_ID: "1",
            }
        )
        games.add(
            {
                c.WIN: {c.PLAYERS_ID: [ids[0], ids[2]], c.SCORE: 21},
                c.LOSE: {c.PLAYERS_ID: [ids[1], ids[3]], c.SCORE: 17},
                c.SESSION_ID: "1",
            }
        )
    except Exception as e:
        return https_fn.Response(f"Failed to make_fake_db {e}, {traceback.print_exc()}")
    return https_fn.Response("Made a fake db")
