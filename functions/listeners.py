from firebase_functions import firestore_fn
from firebase_admin import firestore

import constants as c


def update_single_game_result(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    """Listen for gameResult doc creation, and update the members' records."""
    if event.data is None:
        return
    store = firestore.client()
    game_result = event.data.to_dict()
    googlers = store.collection(c.GOOGLERS)

    for player_id in game_result.get(c.WIN, {}).get(c.PLAYERS_ID, []):
        if (player := googlers.document(player_id).get()) is None:
            continue
        info = player.to_dict()
        player.reference.update(
            {
                c.NUM_PLAYED: info.get(c.NUM_PLAYED, 0) + 1,
                c.NUM_WINS: info.get(c.NUM_WINS, 0) + 1,
            }
        )
    for player_id in game_result.get(c.LOSE, {}).get(c.PLAYERS_ID, []):
        if (player := googlers.document(player_id).get()) is None:
            continue
        info = player.to_dict()
        player.reference.update(
            {
                c.NUM_PLAYED: info.get(c.NUM_PLAYED, 0) + 1,
                c.NUM_WINS: info.get(c.NUM_WINS, 0),
            }
        )
