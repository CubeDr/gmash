import dataclasses

import constants as c


@dataclasses.dataclass
class Googler:
    name: str
    elo: int
    role: str
    id: str | None = None

    @classmethod
    def from_dict(cls, data: dict, id: str | None = None):
        return Googler(
            name=data.get(c.NAME, ""),
            elo=data.get(c.ELO, c.DEFAULT_ELO),
            role=data.get(c.ROLE, "member"),
            id=id,
        )


@dataclasses.dataclass
class TeamResult:
    players_id: list[str]
    score: int

    @classmethod
    def from_dict(cls, data: dict):
        return TeamResult(
            players_id=data.get(c.PLAYERS_ID, []),
            score=data.get(c.SCORE, 0),
        )


@dataclasses.dataclass
class GameResult:
    win: TeamResult
    lose: TeamResult
    session_id: str
    id: str | None = None

    @classmethod
    def from_dict(cls, data: dict, id: str | None = None):
        return GameResult(
            win=TeamResult.from_dict(data.get(c.WIN, {})),
            lose=TeamResult.from_dict(data.get(c.LOSE, {})),
            session_id=data.get(c.SESSION_ID, ""),
            id=id,
        )


@dataclasses.dataclass
class EndedSession:
    session_id: str
    members_id: list[str]

    @classmethod
    def from_dict(cls, data: dict):
        return EndedSession(
            session_id=data.get(c.ID, ""), members_id=list(data.get(c.MEMBERS, []))
        )
