import dataclasses
from datetime import datetime
from firebase_functions import https_fn
from firebase_admin import db, firestore
from typing import Any

import constants as c
import elo


def get_current_session_id() -> str | None:
    return db.reference(c.SESSION).get().to_dict().get(c.ID, None)


def get_all_current_members_ids() -> list[str]:
    return db.reference(c.MEMBERS).get()


def delete_all_documents_of_collection(collection: Any):
    for doc in collection.get():
        doc.reference.delete()


@dataclasses.dataclass
class Googler:
    name: str
    elo: int
    role: str
    num_played: int = 0
    num_wins: int = 0
    id: str | None = None

    @classmethod
    def from_json(cls, data: dict, id: str | None = None):
        return Googler(
            name=data.get(c.NAME, ""),
            elo=data.get(c.ELO, c.DEFAULT_ELO),
            role=data.get(c.ROLE, "member"),
            num_played=data.get(c.NUM_PLAYED, 0),
            num_wins=data.get(c.NUM_WINS, 0),
            id=id,
        )


def get_googler_of_id(id: str) -> Googler | None:
    store = firestore.client()
    data = store.collection(c.GOOGLERS).document(id).get()
    return Googler.from_json(data.to_dict(), id) if data is not None else data


def get_googlers_of_ids(ids: list[str]) -> list[Googler]:
    return list(filter(None, map(get_googler_of_id, ids)))


@dataclasses.dataclass
class TeamResult:
    playersId: list[str]
    score: int

    @classmethod
    def from_json(cls, data: dict):
        return TeamResult(
            playersId=data.get(c.PLAYERS_ID, []),
            score=data.get(c.SCORE, 0),
        )


@dataclasses.dataclass
class GameResult:
    win: TeamResult
    lose: TeamResult
    session_id: str
    timestamp: datetime
    id: str | None = None

    @classmethod
    def from_json(cls, data: dict, id: str | None = None):
        return GameResult(
            win=TeamResult.from_json(data.get(c.WIN, {})),
            lose=TeamResult.from_json(data.get(c.LOSE, {})),
            session_id=data.get(c.SESSION_ID, ""),
            timestamp=data.get(c.TIMESTAMP, datetime.now()),
            id=id,
        )


def get_game_results(session_id: str | None = None) -> list[GameResult]:
    store = firestore.client()
    if session_id:
        game_results = (
            store.collection(c.GAME_RESULT)
            .where(c.SESSION_ID, "==", session_id)
            .order_by(c.TIMESTAMP)
            .get()
        )
    else:
        game_results = store.collection(c.GAME_RESULT).order_by(c.TIMESTAMP).get()
    return [
        GameResult.from_json(game_result.to_dict(), id=game_result.reference.id)
        for game_result in game_results
    ]


def compute_elo(
    winners: list[Googler],
    losers: list[Googler],
    win_score: int,
    lose_score: int,
) -> dict[str, int]:
    result = {}

    if len(winners) == 1 and len(losers) == 1:
        winner, loser = winners[0], losers[0]
        updated_elos = elo.calculate_updated_elos_for_singles(
            team_a_elo=loser.elo,
            team_b_elo=winner.elo,
            team_a_score=lose_score,
            team_b_score=win_score,
        )
        result[loser.id] = updated_elos["team_a_elo"][0]
        result[winner.id] = updated_elos["team_b_elo"][0]
    elif len(winners) == 2 and len(losers) == 2:
        updated_elos = elo.calculate_updated_elos_for_doubles(
            team_a_elo=[p.elo for p in losers],
            team_b_elo=[p.elo for p in winners],
            team_a_score=lose_score,
            team_b_score=win_score,
        )
        for loser, updated_elo in zip(losers, updated_elos["team_a_elo"]):
            result[loser.id] = updated_elo
        for winner, updated_elo in zip(winners, updated_elos["team_b_elo"]):
            result[winner.id] = updated_elo
    else:
        raise ValueError("Not supported team configurations, probably skipped.")

    return result
