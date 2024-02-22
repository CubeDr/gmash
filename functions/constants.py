# Firestore collection names

GAME_RESULT = "gameResult"
GOOGLERS = "googlers"

# Firestore DB entry

ELO = "elo"
NAME = "name"
ROLE = "role"
NUM_PLAYED = "numPlayed"
NUM_WINS = "numWins"

LOSE = "lose"
WIN = "win"
PLAYERS_ID = "playersId"
SCORE = "score"

SESSION = "session"

# Realtime DB

MEMBERS = "members"
ID = "id"
PLAYED = "played"
SESSION_ID = "sessionId"
UPCOMING = "upcoming"
TEAM1 = "team1"
TEAM2 = "team2"

# ELO computation

DEFAULT_ELO = 1000
P_ELO = 0.6
Q_ELO = 1 - P_ELO
T_ELO = 0.4
C_ELO = 1.0
T_SCORE = 0.001667
