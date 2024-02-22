import collections
from firebase_functions import https_fn
from firebase_admin import db, firestore
from typing import Any

import constants as c
import datatypes as d
import elo


def get_current_session_id() -> str | None:
    return db.reference(c.SESSION_ID).get()


def get_all_current_members_ids() -> list[str]:
    return db.reference(c.MEMBERS).get()


def delete_all_documents_of_collection(collection: Any):
    for doc in collection.get():
        doc.reference.delete()


def get_googler_of_id(id: str) -> d.Googler | None:
    store = firestore.client()
    data = store.collection(c.GOOGLERS).document(id).get()
    return d.Googler.from_dict(data.to_dict(), id) if data is not None else data


def get_googlers_of_ids(ids: list[str]) -> list[d.Googler]:
    return list(filter(None, map(get_googler_of_id, ids)))


def get_all_registered_googlers() -> list[d.Googler]:
    store = firestore.client()
    return [
        d.Googler.from_dict(g.to_dict(), g.id)
        for g in store.collection(c.GOOGLERS).get()
    ]


def initialize_all_googlers_elos() -> None:
    store = firestore.client()
    googlers = get_all_registered_googlers()
    for googler in googlers:
        store.collection(c.GOOGLERS).document(googler.id).update({c.ELO: c.DEFAULT_ELO})


def initialize_all_members_records() -> None:
    members_id = get_all_current_members_ids()
    for id in members_id or []:
        db.reference(f"/{c.MEMBERS}/{id}").update({c.PLAYED: 0, c.UPCOMING: 0})


def get_game_results() -> list[d.GameResult]:
    store = firestore.client()
    game_results = store.collection(c.GAME_RESULT).get()
    return [
        GameResult.from_dict(game_result.to_dict(), id=game_result.reference.id)
        for game_result in game_results
    ]


def compute_elo_diffs(
    winners: list[d.Googler],
    losers: list[d.Googler],
    win_score: int,
    lose_score: int,
) -> dict[str, int]:
    result = collections.defaultdict(int)

    if len(winners) == 1 and len(losers) == 1:
        winner, loser = winners[0], losers[0]
        elo_diffs = elo.calculate_elo_diffs_for_singles(
            team_a_elo=loser.elo,
            team_b_elo=winner.elo,
            team_a_score=lose_score,
            team_b_score=win_score,
        )
        result[loser.id] += elo_diffs["team_a_elo_diffs"][0]
        result[winner.id] += elo_diffs["team_b_elo_diffs"][0]
    elif len(winners) == 2 and len(losers) == 2:
        elo_diffs = elo.calculate_elo_diffs_for_doubles(
            team_a_elo=[p.elo for p in losers],
            team_b_elo=[p.elo for p in winners],
            team_a_score=lose_score,
            team_b_score=win_score,
        )
        for loser, elo_diff in zip(losers, elo_diffs["team_a_elo_diffs"]):
            result[loser.id] = elo_diff
        for winner, elo_diff in zip(winners, elo_diffs["team_b_elo_diffs"]):
            result[winner.id] = elo_diff
    else:
        raise ValueError("Not supported team configurations, probably skipped.")

    return result
