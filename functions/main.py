# Deploy with `firebase deploy`
from firebase_functions import db_fn, firestore_fn, https_fn
from firebase_admin import initialize_app
import flask
from typing import Any

import constants as c

from api.debuggers import debug_bp
from api import listeners


initialize_app()
app = flask.Flask(__name__)

app.register_blueprint(debug_bp)


@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()


@firestore_fn.on_document_created(document=f"{c.GAME_RESULT}/{{resultId}}")
def update_records_from_single_game_result(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    """Listen for gameResult doc creation, and update the members' records."""
    listeners.update_records_from_single_game_result(event)


@db_fn.on_value_created(reference=f"/{c.MEMBERS}/{{pushId}}")
def initialize_member(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for members DB creation, and initialize played and pending to 0."""
    listeners.initialize_member(event)


@db_fn.on_value_created(reference=f"/{c.UPCOMING}/{{pushId}}")
def increment_member_for_upcoming_events(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for upcoming DB creation, and increment "played" count for the members."""
    listeners.update_member_for_upcoming_db(event.data, is_increment=True)


@db_fn.on_value_deleted(reference=f"/{c.UPCOMING}/{{pushId}}")
def decrement_member_for_upcoming_events(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for upcoming DB creation, and decrement "played" count for the members."""
    listeners.update_member_for_upcoming_db(event.data, is_increment=False)


@db_fn.on_value_updated(reference=f"/{c.UPCOMING}/{{pushId}}")
def update_member_for_upcoming_events(
    event: db_fn.Event[db_fn.Change[Any]] | None,
) -> None:
    """Listen for upcoming DB creation, and decrement "played" count for the members."""
    listeners.update_member_for_upcoming_db(event.data.before, is_increment=False)
    listeners.update_member_for_upcoming_db(event.data.after, is_increment=True)
