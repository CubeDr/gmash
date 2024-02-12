from typing import TypedDict

import constants as c


UpdatedElos = TypedDict(
    "UpdatedElos",
    dict(team_a_elo=list[int], team_b_elo=list[int]),
)


def calculate_updated_elos_for_singles(
    team_a_elo: int,
    team_b_elo: int,
    team_a_score: int,
    team_b_score: int,
) -> UpdatedElos:
    if team_a_score > team_b_score:
        updated_elos = calculate_updated_elos_for_singles(
            team_b_elo, team_a_elo, team_b_score, team_a_score
        )
        return {
            "team_a_elo": updated_elos["team_b_elo"],
            "team_b_elo": updated_elos["team_a_elo"],
        }
    x, y = team_a_elo, team_b_elo
    delta = (team_b_score - team_a_score) / team_b_score / c.T_SCORE
    x_ = (x * (2 - c.T_ELO) + y * c.T_ELO - delta * c.T_ELO) / 2
    y_ = (x * c.T_ELO + y * (2 - c.T_ELO) + delta * c.T_ELO) / 2
    return {"team_a_elo": [x_], "team_b_elo": [y_]}


def calculate_updated_elos_for_doubles(
    team_a_elo: list[int],
    team_b_elo: list[int],
    team_a_score: int,
    team_b_score: int,
) -> UpdatedElos:
    assert len(team_a_elo) == 2
    assert len(team_b_elo) == 2
    if team_a_score > team_b_score:
        updated_elos = calculate_updated_elos_for_doubles(
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

    x_1_ = x_1 + c.T_ELO * (-delta - x + y) / divider
    x_2_ = x_2 + c.T_ELO * (-c.C_ELO * delta - x + y) / divider
    y_1_ = y_1 + c.T_ELO * (delta + x - y) / divider
    y_2_ = y_2 + c.T_ELO * (c.C_ELO * delta + x - y) / divider

    if x_swapped:
        x_1_, x_2_ = x_2_, x_1_
    if y_swapped:
        y_1_, y_2_ = y_2_, y_1_
    x_1_, x_2_, y_1_, y_2_ = map(round, [x_1_, x_2_, y_1_, y_2_])
    return {"team_a_elo": [x_1_, x_2_], "team_b_elo": [y_1_, y_2_]}
