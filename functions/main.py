# Deploy with `firebase deploy`
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app
import flask

import constants as c
from debuggers import debug_bp
import listeners


initialize_app()
app = flask.Flask(__name__)
app.register_blueprint(debug_bp)


@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()


@firestore_fn.on_document_created(document=f"{c.GAME_RESULT}/{{resultId}}")
def update_single_game_result(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    """Listen for gameResult doc creation, and update the members' records."""
    listeners.update_single_game_result(event)
