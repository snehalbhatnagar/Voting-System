# Online Voting System

A web app for running an online election. Voters register with their Aadhaar number and a one-time code sent to their phone, sign in, and cast exactly one ballot (or "none of the above"). Voting officers sign in to a dashboard showing registration, turnout, and live results.

**Live demo:** https://snehalbhatnagar.github.io/Voting-System/

The demo runs entirely in the browser with sample data and fictional candidates. Demo accounts are filled in on the sign-in page; you can also register a new voter (the demo shows the verification code on screen instead of sending an SMS). The full app uses the Express API and MySQL database in this repo.

## How it works

| Concern | Approach |
| --- | --- |
| Registration | Per-number, single-use OTP that expires after 5 minutes and locks after 5 wrong tries |
| Identity | Aadhaar stored only as an HMAC-SHA256 hash, which still blocks duplicate registrations |
| Passwords | bcrypt |
| Sessions | Signed JWT per request, with separate Voter and Officer roles |
| One vote each | `ballots_cast.user_id` is a primary key, so a second ballot fails at the database |
| Secret ballot | `ballots_cast` records *that* someone voted; `votes` records *what* was chosen with no voter reference. Both are written in one transaction. |

## Stack

React 18 and Vite (client), Node.js and Express (API), MySQL via `mysql2`, Node's built-in test runner.

## Project history

- **January 2024:** first version pushed: Express API, MySQL, bcrypt passwords, OTP-based registration, and a React client.
- **2026:** reworked with help from Claude (see commit history):
  - The original API kept one global OTP for all users and one global "authenticated Aadhaar", so whoever signed in last decided whose vote was recorded. Both are now per-request and per-user.
  - Added JWT sessions and role checks on the voting and officer routes, which were previously open.
  - Aadhaar numbers are hashed instead of stored in plain text.
  - Separated voter participation from ballot choice, and made NOTA votes count toward the one-vote limit.
  - The React source was not in the repo (only a compiled build), so the client was rebuilt from the original screens and API calls. It now also has a GitHub Pages demo mode.

## Run it locally

Requires Node.js 18 or later and MySQL 8.

```bash
mysql -u root -p < schema.sql             # tables plus four sample candidates
cp .env.example .env                      # set DB_*, JWT_SECRET, AADHAAR_HASH_KEY
npm install
npm run seed:officer -- --username officer1 --password 'choose-one' --mobile 9876543210 --aadhar 123412341234
npm run dev                               # API on http://localhost:4000

npm --prefix client install
npm run client:dev                        # client on http://localhost:5173, proxies /api to the API
```

No SMS provider is connected. With `OTP_DEV_ECHO=true` the API returns the code so you can test registration. Plug a provider into `sendOTP` in `src/utils/otpUtils.js` before real use.

`npm test` runs the unit tests (OTP rules, validation, Aadhaar hashing, role checks). `npm run client:demo` rebuilds the static demo into `/docs`, which GitHub Pages serves.

## API

| Method | Route | Who | Purpose |
| --- | --- | --- | --- |
| POST | `/api/user/get-otp` | anyone | Send a verification code to a mobile number |
| POST | `/api/user/register` | anyone | Register a voter with the code |
| POST | `/api/user/login` | anyone | Get a token (`userType`: Voter or Officer) |
| GET | `/api/voting/candidates` | voter | Ballot, plus whether this voter has voted |
| POST | `/api/voting/vote` | voter | Vote for `candidateId` |
| POST | `/api/voting/vote/nota` | voter | Vote none of the above |
| GET | `/api/voting-officer/dashboard` | officer | Registration, turnout, and results |
