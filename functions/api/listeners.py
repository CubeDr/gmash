import collections
from firebase_functions import db_fn, firestore_fn
from firebase_admin import db, firestore
from typing import Any

from api import common
import constants as c
import datatypes as d


def initialize_member(
    event: db_fn.Event[Any] | None,
) -> None:
    """Initialize DB "members" record (i.e., set played and pending to 0s)."""
    if event.data is None:
        return
    db.reference(event.reference).update({c.PLAYED: 0, c.UPCOMING: 0})


def update_member_for_upcoming_db(
    data: dict | None,
    is_increment: bool = True,
) -> None:
    """For "upcoming" DB creation, and change "upcoming" count for the "members"."""
    if data is None:
        return

    def update_member_upcoming_transaction(current_data):
        if current_data is None:
            print(
                f"Member {id} not found, skipping update (update_member_for_upcoming_db)."
            )
            return {}
        current_data[c.UPCOMING] = current_data.get(
            c.UPCOMING, 0 if is_increment else 1
        ) + (1 if is_increment else -1)
        return current_data

    def convert_to_list(e: Any):
        if isinstance(e, collections.abc.Mapping):
            return list(e.values())
        return list(e)

    team1_ids, team2_ids = data[c.TEAM1], data[c.TEAM2]
    team1_ids, team2_ids = map(convert_to_list, (team1_ids, team2_ids))
    for id in [*team1_ids, *team2_ids]:
        ref = db.reference(f"/{c.MEMBERS}/{id}")
        ref.transaction(update_member_upcoming_transaction)


def update_records_from_single_game_result(
    game_result: d.GameResult,
    current_session_id: str | None = None,
) -> None:
    """For a "gameResult" doc creation, update the members' records."""
    store = firestore.client()
    players = common.get_googlers_of_ids(
        [*game_result.win.players_id, *game_result.lose.players_id]
    )

    def increment_member_played_transaction(current_data):
        if current_data is None:
            print(
                f"Member {id} not found, skipping update (update_records_from_single_game_result)."
            )
            return {}
        current_data[c.PLAYED] = current_data.get(c.PLAYED, 0) + 1
        return current_data

    if current_session_id is None:
        current_session_id = common.get_current_session_id()

    if current_session_id == game_result.session_id:
        for player in players:
            db.reference(f"/{c.MEMBERS}/{player.id}").transaction(
                increment_member_played_transaction
            )


def update_records_from_ended_session(
    session: d.EndedSession,
) -> None:
    """For session doc creation, and update the googlers' records."""
    store = firestore.client()
    elo_diffs = collections.defaultdict(int)
    if session.session_id:
        game_results = (
            store.collection(c.GAME_RESULT)
            .where(c.SESSION_ID, "==", session.session_id)
            .get()
        )
    else:
        game_results = store.collection(c.GAME_RESULT).get()
        game_results = [
            r for r in game_results if not r.to_dict().get(c.SESSION_ID, "")
        ]
    googlers = common.get_googlers_of_ids(session.members_id)
    id_to_googler = {g.id: g for g in googlers}

    for game_result in game_results:
        game_result = d.GameResult.from_dict(game_result.to_dict(), id=game_result.id)
        try:
            elo_diffs_from_a_game = common.compute_elo_diffs(
                [id_to_googler[id] for id in game_result.win.players_id],
                [id_to_googler[id] for id in game_result.lose.players_id],
                game_result.win.score,
                game_result.lose.score,
            )
            print(
                f"{', '.join([id_to_googler[id].name for id in game_result.win.players_id])} "
                f"{game_result.win.score}:{game_result.lose.score} "
                f"{', '.join([id_to_googler[id].name for id in game_result.lose.players_id])} "
            )
            for player_id, diff in elo_diffs_from_a_game.items():
                googler = id_to_googler[player_id]
                elo_diffs[player_id] += diff
                print(
                    f">> {googler.name} got {diff} (Before Today: {googler.elo}, "
                    f"Accumulated {googler.elo + elo_diffs[player_id] - diff} --> {googler.elo + elo_diffs[player_id]})"
                )
        except ValueError as e:
            print(
                f"Value error occurred when computing ELOs from {game_result}, will be omitted."
            )

    googlers = common.get_googlers_of_ids(list(elo_diffs.keys()))
    print(f"Updating ELOs from the ended session {session.session_id}")
    for googler in googlers:
        print(
            f">> {googler.name}'s ELO {googler.elo} --> {googler.elo + elo_diffs[googler.id]}"
        )
        store.collection(c.GOOGLERS).document(googler.id).update(
            {c.ELO: googler.elo + elo_diffs[googler.id]}
        )
