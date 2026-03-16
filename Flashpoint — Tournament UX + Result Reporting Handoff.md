Flashpoint — Tournament UX + Result Reporting Handoff
Objective

Improve the match result reporting system and standings UX for multiplayer Magic tournaments (Commander / Battle Royale formats), ensuring:

Clear elimination tracking

Support for edge cases

Transparent tiebreakers

Distributed result reporting (players + organizer)

Secure permissions model

1 — Match Result Model

Each match must store player elimination order.

Example:

MatchResult
match_id
players: [A, B, C, D]

elimination_order:
1 -> D
2 -> B
3 -> C
winner -> A

Meaning:

Player	Position
A	1st
C	2nd
B	3rd
D	4th
2 — Edge Case: All Players Eliminated

Commander interactions can occasionally cause all players to lose simultaneously.

Example:

Global damage

Forced draw condition

Shared life loss

System must support:

match_end_type = "simultaneous_elimination"

Then:

elimination_order = [A,B,C,D]
simultaneous = true

Handling:

Mode	Result
Commander	Use tie-breaker
Battle Royale	Players treated as tied
3 — Tie Resolution

If final placement cannot be determined:

Commander

Winner determined using tiebreakers:

Match Wins

Opponent Match Win %

Game Win %

Opponent Game Win %

These follow conventional MTG tournament rules.

Battle Royale

If tied and players survive:

both advance
4 — Standings Calculation

Each player accumulates:

Wins
Losses
Draws
Match Points
Tiebreaker Scores

Example standings:

Player	W	L	D	Points	OMW%	GW%
Alice	3	0	0	9	67%	75%
Bob	2	1	0	6	58%	60%

System must show how ranking was resolved.

5 — Result Reporting Permissions
Players

Players can report only matches they participated in.

Rules:

can_report = player in match.players

Players may only submit results for their own table.

Organizer

Organizer permissions:

edit_any_match = true
override_results = true
resolve_conflicts = true

Organizer may:

edit results

correct mistakes

resolve disagreements

Guests

Guests can participate in matches but cannot report results.

role = guest
can_report = false

Reason:

Security and prevention of malicious reporting.

6 — Conflict Resolution

When two players submit conflicting reports:

System state:

match_status = conflict

UI displays warning:

⚠ Conflicting match results detected
Waiting for organizer review

Organizer resolves manually.

7 — UX Improvements
7.1 Visual Elimination Bar

To keep current UI intact, add a horizontal elimination timeline.

Example:

[A]───[C]───[B]───[D]
1st   2nd   3rd   4th

Benefits:

Immediate visual understanding

Works well on mobile

Minimal UI disruption

7.2 Result Input UI

Players report results using a simple elimination selector.

Example UI:

Select elimination order

☑ 1st  Alice
☑ 2nd  Carlos
☑ 3rd  Bruno
☑ 4th  Daniel

Alternative option:

All players eliminated simultaneously
☑ Yes
☐ No
7.3 Result Confirmation

Before submitting:

Confirm Match Result

1st  Alice
2nd  Carlos
3rd  Bruno
4th  Daniel

Submit Result

Prevents accidental submissions.

8 — Transparency in Rankings

Standings page must include tiebreaker explanation.

Example tooltip:

Ranking decided by:
1. Match Points
2. Opponent Match Win %
3. Game Win %

Optional UI:

ℹ How ranking works
9 — Data Structure

Suggested match schema:

Match {
  id
  tournament_id
  players[]
  elimination_order[]
  simultaneous_elimination
  reported_by
  verified
  conflict
}
10 — Implementation Priority

Recommended order:

1️⃣ Match result model
2️⃣ Result reporting permissions
3️⃣ Conflict detection
4️⃣ Elimination UX bar
5️⃣ Tiebreaker display
6️⃣ Simultaneous elimination support