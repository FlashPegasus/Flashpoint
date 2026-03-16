---
name: E2E Testing
description: Automated End-to-End testing for FlashPoint using browser subagent to simulate real user interactions
---

# E2E Testing Skill — FlashPoint

## Overview
This skill automates End-to-End testing of the FlashPoint platform by using the **browser subagent** to simulate real user interactions. It covers authentication, tournament management, league operations, and result reporting.

## Prerequisites
- Dev server running at `http://localhost:5173/` (run `npm run dev` in project root)
- Test user accounts created (see credentials below)

## Test User Credentials

| # | Name | Email | Password |
|---|---|---|---|
| 1 | Tester Alfa | alfa@tester.com | 123456 |
| 2 | Tester Bravo | bravo@tester.com | 123456 |
| 3 | Tester Charlie | charlie@tester.com | 123456 |
| 4 | Tester Delta | delta@tester.com | 123456 |
| 5 | Tester Echo | echo@tester.com | 123456 |

## How to Use

### Step 1: Start the dev server
```bash
cd "C:\Users\Gabriel Marc\OneDrive\Documentos\Antig\FlashPoint"
npm run dev
```
Wait for `Local: http://localhost:5173/` output.

### Step 2: Run a test flow
Use the `browser_subagent` tool with one of the test flows below. The subagent will:
1. Navigate to the app
2. Login with test credentials
3. Execute the test flow
4. Capture screenshots and recordings
5. Report results

---

## Test Flows

### Flow 1: Login Test
```
Task: Navigate to http://localhost:5173/login and login with:
- Email: alfa@tester.com
- Password: 123456
Verify that:
- Login succeeds (redirected to main page)
- User name "Tester Alfa" appears in the UI
- No console errors appear
Return: success/failure status and any error messages.
```

### Flow 2: Create Tournament
```
Task: After logging in as Alfa (alfa@tester.com / 123456):
1. Navigate to create tournament page
2. Fill in tournament details:
   - Name: "E2E Test Tournament [timestamp]"
   - Format: Multiplayer (Commander)
   - Max Rounds: 3
3. Create the tournament
4. Publish the tournament
5. Add 4 guest players: "Bot Bravo", "Bot Charlie", "Bot Delta", "Bot Echo"
6. Generate 1st round
Verify: Tournament is created, published, players added, round generated.
Return: Tournament ID and status of each step.
```

### Flow 3: Report Results
```
Task: After creating a tournament and generating a round:
1. Open the first table's result modal
2. Use "Declarar Vencedor" to select the first player as winner
3. Confirm the results
4. Verify the standings tab shows updated points
Return: Whether points were correctly assigned (winner=5, others=0).
```

### Flow 4: Create and Manage League
```
Task: After logging in as Alfa:
1. Create a new league:
   - Name: "E2E Test League [timestamp]"
   - Start date: today
   - End date: 30 days from now
2. Verify the season progress bar appears
3. Copy the invite code
4. Create a tournament and link it to the league
Return: League ID, invite code, and progress bar status.
```

### Flow 5: Full Tournament Lifecycle
```
Task: Execute the complete tournament lifecycle:
1. Login as Alfa
2. Create a Commander tournament with maxRounds=2
3. Add 5 players (use guest names)
4. Generate round 1
5. Report results for all tables (mix of winner/survivor/eliminated)
6. Generate round 2
7. Report results for all tables
8. Finalize tournament
9. Check standings and podium
Return: Comprehensive report of all steps with success/failure status.
```

### Flow 6: Battle Royale Mode
```
Task: Test the Battle Royale format:
1. Login as Alfa
2. Create a Battle Royale tournament
3. Add 5 players
4. Generate round 1
5. Report 1 winner, 1 survivor, 3 eliminated
6. Generate round 2 (only winner + survivor should be in it)
7. Report final results
Return: Verify that eliminated players are correctly excluded from round 2.
```

---

## Reporting
After each test flow, the agent should produce a report with:
- ✅ Passed / ❌ Failed for each step
- Screenshots of key moments
- Console errors captured (if any)
- UI anomalies detected
- Browser recording path (.webp file)

## Tips
- Use `RecordingName` in browser_subagent for descriptive recording filenames
- Break complex flows into sequential subagent calls if needed
- If login fails (user not found), create the user first using the registration flow
- Always wait for page loads/transitions before interacting with elements
- The app uses toast notifications — check for success/error toasts to verify actions
