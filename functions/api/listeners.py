from firebase_functions import db_fn, firestore_fn
from firebase_admin import db, firestore
from typing import Any

from api import common
import constants as c


def initialize_member(
    event: db_fn.Event[Any] | None,
) -> None:
    """Listen for members DB creation, and initialize played and pending to 0."""
    if event.data is None:
        return
    db.reference(event.reference).update({c.PLAYED: 0, c.UPCOMING: 0})


def update_member_for_upcoming_db(
    data: dict | None,
    is_increment: bool = True,
) -> None:
    """Listen for upcoming DB creation, and change "upcoming" count for the members."""
    if data is None:
        return

    def update_member_upcoming_transaction(current_data):
        if current_data is None:
            print(f"Member {id} not found, skipping update.")
            return {}
        current_data[c.UPCOMING] = current_data.get(
            c.UPCOMING, 0 if is_increment else 1
        ) + (1 if is_increment else -1)
        return current_data

    team1_ids, team2_ids = data[c.TEAM1], data[c.TEAM2]
    for id in [*team1_ids.values(), *team2_ids.values()]:
        ref = db.reference(f"/{c.MEMBERS}/{id}")
        ref.transaction(update_member_upcoming_transaction)


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
    try:
        updated_elos = common.compute_elo(
            winners, losers, game_result.win.score, game_result.lose.score
        )
    except ValueError as e:
        print(
            f"Value error occurred when computing ELOs from {game_result}, will be omitted."
        )
        updated_elos = {}
        updated_elos.update({player.id: player.elo for player in winners})
        updated_elos.update({player.id: player.elo for player in losers})

    def increment_member_played_transaction(current_data):
        if current_data is None:
            print(f"Member {id} not found, skipping update.")
            return {}
        current_data[c.PLAYED] = current_data.get(c.PLAYED, 0) + 1
        return current_data

    googlers = store.collection(c.GOOGLERS)
    for player in [*winners, *losers]:
        if (player_doc := googlers.document(player.id).get()) is not None:
            player_doc.reference.update({c.ELO: updated_elos[player.id]})
        db.reference(f"/{c.MEMBERS}/{player.id}").transaction(
            increment_member_played_transaction
        )
