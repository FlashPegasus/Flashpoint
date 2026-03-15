📄 Flashpoint Tournament System – Technical Handoff
Overview

This document defines the tournament pairing engine, result system, and ranking logic for the Flashpoint platform.

Target formats:

Commander Swiss

Battle Royale

Casual Pods

Supported scale:

2 → 1000 players

Design goals:

Multiplayer-first pairing

Minimal TO friction

Commander-compatible edge cases

Deterministic ranking

Scalable pairing engine

Tournament Configuration

These parameters are defined when creating the tournament.

preferred_table_size: 4
min_players_per_table: 3
max_players_per_table: 5

bye_if_players_less_equal: 2

avoid_repeated_matchups: true

epic_final_enabled: true
epic_final_max_players: 5
Player Data Model
Player {
  id: string
  name: string

  points: number
  wins: number
  survivals: number
  losses: number

  opponents: string[]
}
Table Model
Table {
  id: string
  round: number
  players: Player[]
}
Result Model
Result {
  player_id: string
  status: ResultStatus
  points_awarded: number
}

Result status enum:

WINNER
SURVIVED
ELIMINATED
ALL_DEFEATED
BYE
Scoring System
WINNER = 5
SURVIVED = 2
ELIMINATED = 0
ALL_DEFEATED = 0
BYE = 5

Rationale:

Avoids elimination ordering

Works for pods of 3–5 players

Simplifies UX reporting

Commander Edge Case – All Players Die

Commander allows rare situations where all players lose simultaneously.

Example causes:

global damage loop

pact-style interactions

stack misresolution

Result recorded as:

ALL_DEFEATED

Applied to every player in the table.

Effects:

winner: none
survivors: none
points: 0 for all players
Pairing Algorithm
Step 1 – Sort Players

Players are sorted by tournament standing.

sort(players by points DESC)
Table Size Generation

Goal:

3–5 players per table
ideal = 4

Function:

function generateTableSizes(players) {

  sizes = []

  while (players > 0) {

    if (players == 5) {
      sizes.push(5)
      break
    }

    if (players == 6) {
      sizes.push(3)
      sizes.push(3)
      break
    }

    if (players == 7) {
      sizes.push(4)
      sizes.push(3)
      break
    }

    if (players == 8) {
      sizes.push(4)
      sizes.push(4)
      break
    }

    if (players == 9) {
      sizes.push(3)
      sizes.push(3)
      sizes.push(3)
      break
    }

    if (players >= 10) {

      if (players % 4 == 0) {
        sizes.push(4)
        players -= 4
        continue
      }

      if (players % 4 == 1) {
        sizes.push(5)
        players -= 5
        continue
      }

      if (players % 4 == 2) {
        sizes.push(3)
        players -= 3
        continue
      }

      if (players % 4 == 3) {
        sizes.push(3)
        players -= 3
        continue
      }
    }
  }

  return sizes
}
Building Tables

Example sizes:

[4,4,3,3,3]

Table construction:

tables = []
index = 0

for size in sizes {

  table_players = players[index : index + size]

  tables.push(table_players)

  index += size
}
Anti-Repeat Matchmaking

Optional toggle:

avoid_repeated_matchups = true

Match history stored as:

MatchHistory {
  player_id
  opponent_id
  times_played
}

Optimization step:

function optimizeTables(tables) {

  for table in tables {

    if playersAlreadyPlayedTogether(table) {

      swapPlayerWithAnotherTable()

    }

  }

}

Goal:

minimize repeated matchups

Perfect avoidance is not required.

BYE Handling

If a generated table contains too few players:

table_size ≤ bye_if_players_less_equal

Then:

assign BYE

Example implementation:

if table_size <= 2 {

  for player in table {

    result.status = BYE

  }

}
Result Reporting

Each table returns a result status for every player.

Example:

Alice   WINNER
Bob     ELIMINATED
Carol   ELIMINATED
Dan     ELIMINATED
Timeout Scenario

Example:

Alice   SURVIVED
Bob     SURVIVED
Carol   ELIMINATED
Dan     ELIMINATED
All Defeated Case
Alice   ALL_DEFEATED
Bob     ALL_DEFEATED
Carol   ALL_DEFEATED
Dan     ALL_DEFEATED
Ranking Update

Pseudo logic:

for result in results {

  player.points += points(status)

  if status == WINNER
    player.wins += 1

  if status == SURVIVED
    player.survivals += 1

  if status == ELIMINATED
    player.losses += 1
}
Tiebreakers

Ranking order:

1. Total Points
2. Opponent Match Win %
3. Opponent Points
4. Wins
Opponent Match Win %

Calculated using the performance of players faced.

Example algorithm:

for player {

  scores = []

  for opponent in player.opponents {

    scores.push(opponent.points)

  }

  OMW = average(scores)

}
Battle Royale Mode

Battle Royale acts as an elimination tournament.

Rule:

survivors + winners advance
eliminated players are removed

Example logic:

next_round_players = []

for table_result {

  for player {

    if status == WINNER or status == SURVIVED {

      next_round_players.push(player)

    }

  }

}
Epic Final

Optional configuration:

epic_final_enabled = true

Final round rule:

players ≤ epic_final_max_players

Then create a single final table.

Example:

Top 5 players → one final table
Round Timer Behavior

The system does not automatically end matches.

Instead:

Round timer only notifies organizers

Example UI message:

ROUND TIME EXPIRED
Please call a judge or organizer.
Result Reporting UI (Recommended)

Example table display:

TABLE 5

Alice   🏆 Winner
Bob     💀 Eliminated
Carol   💀 Eliminated
Dan     💀 Eliminated

Suggested quick actions:

Declare Winner
Timeout
All Defeated
Manual Entry

This reduces reporting time for TOs to a few seconds.

Scalability

At maximum scale:

1000 players
≈ 250 tables

Pairing complexity:

O(n log n)

This remains computationally inexpensive.

Edge Cases Covered

✔ multiplayer pods
✔ timeout survival
✔ multiple survivors
✔ all players defeated
✔ BYE tables
✔ repeated opponent avoidance
✔ Battle Royale elimination
✔ epic multiplayer final