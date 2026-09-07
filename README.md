# FairShare

A full-stack group expense-splitting app: React + Vite frontend, Node/Express + Prisma (SQLite) backend, JWT + bcrypt auth, a real debt-simplification settlement engine, and click-to-explain balances.

```
fairshare/
├── backend/     Express API, Prisma schema, seed script
└── frontend/    React + Vite app
```

---

## 1. Requirements

- Node.js 18+ and npm
- Nothing else — SQLite is a file on disk, no database server to install.

---

## 2. Backend setup

```bash
cd fairshare/backend
npm install

cp .env.example .env
# .env already has sane defaults for local dev:
#   DATABASE_URL="file:./dev.db"
#   JWT_SECRET="change-this-to-a-long-random-string"   <- change this for anything beyond local dev
#   PORT=4000

npx prisma generate
npx prisma migrate dev --name init      # creates prisma/dev.db and applies the schema

npm run seed                             # creates the demo account + Goa Trip group + 4 expenses

npm run dev                              # starts the API on http://localhost:4000
```

Leave this terminal running. You should see:
```
FairShare API listening on http://localhost:4000
```

**Demo login created by the seed script:**
- Email: `demo@fairshare.app`
- Password: `password123`

If you ever want to reset the demo data: stop the server, delete `backend/prisma/dev.db`, then re-run the `migrate dev` and `seed` commands above.

---

## 3. Frontend setup

Open a **second terminal** (leave the backend running in the first):

```bash
cd fairshare/frontend
npm install
npm run dev                              # starts the app on http://localhost:5173
```

The Vite dev server proxies every `/api/...` request straight to `http://localhost:4000`, so there's no CORS setup or environment URL to configure — as long as the backend is running on port 4000, the frontend just works.

Open **http://localhost:5173**.

### Demo video (optional)
The Landing page's "Watch demo" button plays `frontend/public/videos/fairshare-demo.mp4`. Drop your own `.mp4` at that exact path if you have one; the button and modal work either way, but the video element will show a broken player until a real file is there.

---

## 4. Testing the complete flow

1. **Landing** (`/`) — click **Watch demo** to confirm the video modal opens; click **Start Splitting** to confirm it scrolls to the workspace preview and then continues to signup.
2. **Sign up** (`/signup`) — create a real account (any email/password ≥ 6 chars). You're taken straight into the New Split wizard.
3. **New Split wizard**:
   - Choose a type (defaults to **Trip**) → Continue
   - Set the number of people (defaults to **10**) → Continue
   - Name the group (defaults to **Goa Trip**), pick a currency → Continue
   - Name the other members (defaulted to B, C, D…) → **Create**
   - You land on the new group's **Group Dashboard**, and you (the account holder) are already member "A".
4. **Add Expense — equal split**: click **+ Add Expense**, title "Concert Tickets", paid by A, amount ₹12,000, select 8 of the 10 avatars (deselect two) — watch the live calculation update automatically (e.g. 8 people → ₹1,500 each; reselect all 10 and watch it recalculate to ₹1,200). Save.
5. **Add Expense — advanced split**: add another expense, switch to **Unequal / Advanced**, type in custom amounts that don't add up to the total — the red "Your split doesn't add up" card appears with Expected / Entered / Difference, and Save is disabled. Click **Fix with equal split** (or correct the numbers by hand) until it turns into a green "adds up" banner, then Save.
6. **Balances tab** — confirm every member's Gets/Owes/Settled figure is present and that they net to zero overall.
7. **Overview tab** — scroll down to **Who Pays Whom**: confirm the payment count and rows. Click any row to expand the **"Why does X owe Y?"** explanation, listing every contributing expense.
8. **History tab (inside the group)** — click an expense to expand its participant breakdown; try **Edit** (changes should recalculate everything) and **Delete** (balances/settlements update immediately).
9. **Sidebar → My Splits** — confirms the group shows up with the right totals and balance; the filter tabs work by group type.
10. **Sidebar → History** — global history across all your groups, filterable by group.
11. **Sidebar → Settings** — shows your profile, currency preference, and **Log out** (should return you to the landing page and require login again for any protected route).
12. **Log out, then Log in** (`/login`) with the demo account (`demo@fairshare.app` / `password123`) to see the pre-seeded Goa Trip group with Hotel / Food / Concert Tickets / Flights already in it, and a fully computed settlement.

If anything 401s unexpectedly, it means the token expired or was cleared — just log in again; this is expected behavior, not a bug.

---

## 5. API reference

All routes are prefixed with `/api` and (except `/auth/*`) require `Authorization: Bearer <token>`.

```
POST   /api/auth/register            { name, email, password }
POST   /api/auth/login               { email, password }
GET    /api/auth/me

GET    /api/users/me

POST   /api/groups                   { name, type, currency }
GET    /api/groups
GET    /api/groups/:id
PUT    /api/groups/:id
DELETE /api/groups/:id

POST   /api/groups/:id/members       { displayName }
GET    /api/groups/:id/members
DELETE /api/groups/:id/members/:memberId

POST   /api/groups/:id/expenses      { title, amount, paidById, splitType, participants }
GET    /api/groups/:id/expenses
GET    /api/groups/:id/expenses/:expenseId
PUT    /api/groups/:id/expenses/:expenseId
DELETE /api/groups/:id/expenses/:expenseId

GET    /api/groups/:id/balances
GET    /api/groups/:id/settlements
```

`participants` for `POST/PUT expenses`:
- `splitType: "equal"` → array of member id strings: `["memberId1", "memberId2", ...]`
- `splitType: "unequal"` → array of objects: `[{ "memberId": "...", "amount": 1500 }, ...]` — the backend rejects the request with `{ error, expected, entered, difference }` if these don't sum to `amount`.

---

## 6. How the math works (no hardcoding, anywhere)

- **Balance** per member = total they paid − total of their shares across every expense they participated in. Computed fresh on every request from `backend/src/lib/settlement.js`.
- **Equal splits** distribute leftover paise across participants so shares always sum exactly to the expense total (no floating-point drift).
- **Settlements** ("who pays whom") come from a greedy largest-creditor/largest-debtor matching algorithm — it minimizes the number of payments for whatever the actual balances are, for any group, any time.
- **"Why do I owe this?"** is computed client-side from the real expense/participant data returned by the API — it's not a canned explanation.

---

## 7. Notes on the demo data

The seed script creates one user (`Demo User` / `demo@fairshare.app`) linked to member **A** in a group called **Goa Trip**, with members **A–J** and these expenses: Concert Tickets (₹12,000, equal split among A–H), Food (₹5,000, advanced split: A+B ₹1,100 / C–J ₹3,900), Hotel (₹30,000, equal across all 10), and Flights (₹12,000, equal across all 10). No personal names are used anywhere in demo data — only letters.
