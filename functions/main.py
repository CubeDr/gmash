# Deploy with `firebase deploy`
from firebase_functions import db_fn, firestore_fn, https_fn
from firebase_admin import initialize_app
import flask
from typing import Any

import constants as c
import datatypes as d

from api.debuggers import debug_bp
from api.update_all import update_all_bp
from api import listeners


_MODE = "DEPLOYMENT"
_REGION = "asia-southeast1"


initialize_app()
app = flask.Flask(__name__)

app.register_blueprint(update_all_bp)
if _MODE == "DEBUG":
    app.register_blueprint(debug_bp)


@https_fn.on_request(region=_REGION)
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()


@firestore_fn.on_document_created(
    document=f"{c.GAME_RESULT}/{{resultId}}", region=_REGION
)
def update_records_from_single_game_result(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    """Listen for "gameResult" doc creation, and update the members' records."""
    if event.data is None:
        return
    game_result = d.GameResult.from_dict(event.data.to_dict(), event.id)
    listeners.update_records_from_single_game_result(game_result)


@firestore_fn.on_document_created(document=f"{c.SESSION}/{{resultId}}", region=_REGION)
def update_records_from_ended_session(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    """Listen for "session" doc creation, and update the googlers' records."""
    if event.data is None:
        return
    session = d.EndedSession.from_dict(event.data.to_dict())
    listeners.update_records_from_ended_session(session)


@db_fn.on_value_created(reference=f"/{c.MEMBERS}/{{pushId}}", region=_REGION)
def initialize_member(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for "members" DB creation, and initialize played and pending to 0."""
    listeners.initialize_member(event)


@db_fn.on_value_created(reference=f"/{c.UPCOMING}/{{pushId}}", region=_REGION)
def increment_member_for_upcoming_events(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for "upcoming" DB creation, and increment "played" count for the members."""
    listeners.update_member_for_upcoming_db(event.data, is_increment=True)


@db_fn.on_value_deleted(reference=f"/{c.UPCOMING}/{{pushId}}", region=_REGION)
def decrement_member_for_upcoming_events(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for "upcoming" DB creation, and decrement "played" count for the members."""
    listeners.update_member_for_upcoming_db(event.data, is_increment=False)


@db_fn.on_value_updated(reference=f"/{c.UPCOMING}/{{pushId}}", region=_REGION)
def update_member_for_upcoming_events(
    event: db_fn.Event[db_fn.Change[Any]] | None,
) -> None:
    """Listen for "upcoming" DB creation, and decrement "played" count for the members."""
    listeners.update_member_for_upcoming_db(event.data.before, is_increment=False)
    listeners.update_member_for_upcoming_db(event.data.after, is_increment=True)
