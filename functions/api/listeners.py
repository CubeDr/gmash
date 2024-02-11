from firebase_functions import firestore_fn
from firebase_admin import firestore

from api import common
import constants as c


def update_records_from_single_game_result(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    """Listen for gameResult doc creation, and update the members' records."""
    if event.data is None:
        return
    store = firestore.client()
    game_result = common.GameResult.from_json(event.data.to_dict(), event.id)

    winners = common.get_googlers_of_ids(game_result.win.playersId)
    losers = common.get_googlers_of_ids(game_result.lose.playersId)
    updated_elo = common.compute_elo(
        winners, losers, game_result.win.score, game_result.lose.score
    )

    googlers = store.collection(c.GOOGLERS)
    for winner in winners:
        if (player_doc := googlers.document(winner.id).get()) is None:
            continue
        player_doc.reference.update(
            {
                c.ELO: updated_elo[winner.id],
                c.NUM_PLAYED: winner.num_played + 1,
                c.NUM_WINS: winner.num_wins + 1,
            }
        )
    for loser in losers:
        if (player_doc := googlers.document(loser.id).get()) is None:
            continue
        player_doc.reference.update(
            {
                c.ELO: updated_elo[loser.id],
                c.NUM_PLAYED: loser.num_played + 1,
                c.NUM_WINS: loser.num_wins,
            }
        )
