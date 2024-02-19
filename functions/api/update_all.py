import collections
from firebase_functions import https_fn
from firebase_admin import db, firestore
import flask


from api import common
from api import listeners
import constants as c
import datatypes as d


update_all_bp = flask.Blueprint("update_all", __name__)


@update_all_bp.patch("/update_all_game_records")
def update_all_game_records() -> https_fn.Response:
    """Update all game records in minimal transactions, intended to be a one-time job."""
    store = firestore.client()
    common.initialize_all_googlers_elos()
    common.initialize_all_members_records()
    sessions = store.collection(c.SESSION).order_by(c.ID).get() or []

    # Update for the old DB entries without sessionId
    empty_session = d.EndedSession(
        session_id="", members_id=[g.id for g in common.get_all_registered_googlers()]
    )
    listeners.update_records_from_ended_session(session=empty_session)

    for session in sessions:
        session = d.EndedSession.from_dict(session.to_dict())
        listeners.update_records_from_ended_session(session=session)

    current_session_id = common.get_current_session_id()
    if current_session_id is not None:
        current_session_game_results = (
            store.collection(c.GAME_RESULT)
            .where(c.SESSION_ID, "==", current_session_id)
            .get()
        ) or []
        current_session_game_results = [
            d.GameResult.from_dict(r.to_dict()) for r in current_session_game_results
        ]
        for game_result in current_session_game_results:
            listeners.update_records_from_single_game_result(
                game_result=game_result, current_session_id=current_session_id
            )

        for data in db.reference(c.UPCOMING).get() or []:
            listeners.update_member_for_upcoming_db(data, is_increment=True)

    return https_fn.Response("Initialized and updated all game records!")
