from typing import TypedDict

import constants as c


EloDiffs = TypedDict(
    "EloDiffs",
    dict(team_a_elo_diffs=list[int], team_b_elo_diffs=list[int]),
)


def calculate_elo_diffs_for_singles(
    team_a_elo: int,
    team_b_elo: int,
    team_a_score: int,
    team_b_score: int,
) -> EloDiffs:
    if team_a_score > team_b_score:
        updated_elos = calculate_elo_diffs_for_singles(
            team_b_elo, team_a_elo, team_b_score, team_a_score
        )
        return {
            "team_a_elo": updated_elos["team_b_elo"],
            "team_b_elo": updated_elos["team_a_elo"],
        }
    x, y = team_a_elo, team_b_elo
    delta = (team_b_score - team_a_score) / team_b_score / c.T_SCORE

    dx = c.T_ELO * (-x + y - delta) / 2
    dy = c.T_ELO * (x - y + delta) / 2
    dx, dy = round(dx), round(dy)
    return {"team_a_elo_diffs": [dx], "team_b_elo_diffs": [dy]}


def calculate_elo_diffs_for_doubles(
    team_a_elo: list[int],
    team_b_elo: list[int],
    team_a_score: int,
    team_b_score: int,
) -> EloDiffs:
    assert len(team_a_elo) == 2
    assert len(team_b_elo) == 2
    if team_a_score > team_b_score:
        updated_elos = calculate_elo_diffs_for_doubles(
            team_b_elo, team_a_elo, team_b_score, team_a_score
        )
        return {
            "team_a_elo": updated_elos["team_b_elo"],
            "team_b_elo": updated_elos["team_a_elo"],
        }
    x_1, x_2 = team_a_elo
    y_1, y_2 = team_b_elo
    x_swapped, y_swapped = x_1 > x_2, y_1 > y_2
    if x_swapped:
        x_1, x_2 = x_2, x_1
    if y_swapped:
        y_1, y_2 = y_2, y_1

    divider = 2 * c.C_ELO * c.Q_ELO + 2 * c.P_ELO
    delta = (team_b_score - team_a_score) / team_b_score / c.T_SCORE
    x, y = c.P_ELO * x_1 + c.Q_ELO * x_2, c.P_ELO * y_1 + c.Q_ELO * y_2

    dx_1 = c.T_ELO * (-delta - x + y) / divider
    dx_2 = c.T_ELO * (-c.C_ELO * delta - x + y) / divider
    dy_1 = c.T_ELO * (delta + x - y) / divider
    dy_2 = c.T_ELO * (c.C_ELO * delta + x - y) / divider

    if x_swapped:
        dx_1, dx_2 = dx_2, dx_1
    if y_swapped:
        dy_1, dy_2 = dy_2, dy_1
    dx_1, dx_2, dy_1, dy_2 = map(round, [dx_1, dx_2, dy_1, dy_2])
    return {"team_a_elo_diffs": [dx_1, dx_2], "team_b_elo_diffs": [dy_1, dy_2]}
