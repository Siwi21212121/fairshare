# FairShare

A full-stack group expense-splitting application that makes it easy to track shared expenses, calculate individual balances, and simplify settlements.

FairShare allows users to create groups for trips, dinners, events, or other shared expenses, add members, record expenses, choose equal or unequal splits, and see exactly who owes whom.

## 🚀 Live Demo

**Website:** https://fairshare-lovat.vercel.app/

> **Demo note:** Email delivery through Resend is currently disabled in the demo environment. Invitations are still created successfully and a secure invitation link is generated that can be copied and shared manually.

---

## ✨ Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Create and manage expense groups
- Add and manage group members
- Invite members using secure invitation links
- Editor and Viewer permissions
- Equal expense splitting
- Unequal/advanced expense splitting
- Automatic balance calculation
- Debt simplification and settlement generation
- "Who Pays Whom" settlement view
- Click-to-explain settlement breakdown
- Expense history
- Edit and delete expenses
- Group history and global history
- Currency support
- Dashboard showing group totals and balances
- Demo video on the landing page
- Responsive dark-themed interface

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- React Router
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite
- JWT
- bcrypt

### Deployment
- Vercel — Frontend
- Render — Backend
- Resend — Email delivery integration

---

## 📁 Project Structure

```text
fairshare/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── lib/
│       └── ...
│
├── frontend/
│   ├── public/
│   │   ├── videos/
│   │   │   └── fairshare-demo.mp4
│   │   └── fairshare-logo.png
│   │
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── utils/
│       └── ...
│
├── .gitignore
└── README.md
```

---

# 1. Requirements

You need:

- Node.js 18+
- npm

SQLite is used as the database, so no separate database server is required for local development.

---

# 2. Backend Setup

Open a terminal and run:

```bash
cd fairshare/backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

The local development environment uses settings similar to:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=4000
```

Generate the Prisma client:

```bash
npx prisma generate
```

Create the database and apply the schema:

```bash
npx prisma migrate dev --name init
```

Seed the database with demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:4000
```

Keep this terminal running.

---

## Demo Account

The seed script creates a demo account:

```text
Email:    demo@fairshare.app
Password: password123
```

The demo account contains a pre-populated **Goa Trip** group with sample expenses.

---

## Resetting Demo Data

To reset the local demo database:

1. Stop the backend server.
2. Delete:

```text
backend/prisma/dev.db
```

3. Run:

```bash
npx prisma migrate dev --name init
npm run seed
```

---

# 3. Frontend Setup

Open a **second terminal** while the backend is still running.

```bash
cd fairshare/frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

The Vite development server proxies API requests to the backend running on port `4000`.

---

# 4. Demo Video

The landing page includes a **Watch Demo** button.

The video is stored at:

```text
frontend/public/videos/fairshare-demo.mp4
```

The application loads it using:

```text
/videos/fairshare-demo.mp4
```

---

# 5. Testing the Application

## 5.1 Landing Page

Open:

```text
http://localhost:5173
```

Test:

- FairShare logo and branding
- Navigation
- Features section
- How It Works section
- Start Splitting button
- Watch Demo button
- Demo video modal

---

## 5.2 Sign Up

Go to:

```text
/signup
```

Create an account using:

- Your name
- A valid email
- A password of at least 6 characters

After registration, the application takes you to the New Split flow.

---

## 5.3 Create a New Split

The New Split wizard allows you to:

1. Choose the group type.
2. Select the number of people.
3. Enter the group name.
4. Select a currency.
5. Add member names.
6. Create the group.

After creation, you are taken to the Group Dashboard.

---

## 5.4 Add an Equal Expense

Inside a group:

1. Click **+ Add Expense**.
2. Enter an expense name.
3. Select who paid.
4. Enter the amount.
5. Choose **Equal Split**.
6. Select the participants.
7. Save the expense.

FairShare automatically calculates each participant's share.

For example:

```text
Total expense: ₹12,000
Participants: 8

Each person's share:
₹12,000 / 8 = ₹1,500
```

Changing the participants automatically recalculates the split.

---

## 5.5 Add an Unequal Expense

Create another expense and choose:

```text
Unequal / Advanced
```

Enter custom amounts for the participants.

The application validates that:

```text
Sum of participant shares = Expense total
```

If the amounts do not match, the application displays:

- Expected amount
- Entered amount
- Difference

Saving is disabled until the split is corrected.

The **Fix with equal split** option can also be used to automatically correct the values.

---

# 6. Balances

The **Balances** section calculates the current financial position of every group member.

For each member, FairShare determines whether they:

- Owe money
- Are owed money
- Are settled

The balances are calculated from the actual expenses recorded in the group.

---

# 7. Settlement Engine

FairShare includes a debt-simplification settlement engine.

Instead of showing every individual expense transaction, the application calculates the most useful payments between members.

For example:

```text
A is owed ₹5,000
B owes ₹3,000
C owes ₹2,000
```

The settlement engine can simplify this into:

```text
B → A : ₹3,000
C → A : ₹2,000
```

The settlement calculations are generated dynamically from the group's actual balances.

The settlement logic is implemented in:

```text
backend/src/lib/settlement.js
```

---

# 8. "Who Pays Whom?"

The Overview section contains a **Who Pays Whom** area.

Each settlement can be expanded to explain why one person owes another.

For example:

```text
Why does B owe A?

- Hotel: ₹1,500
- Food: ₹500
- Concert Tickets: ₹1,000

Total: ₹3,000
```

The explanation is generated from the actual expense and participant data rather than being hardcoded.

---

# 9. Expense History

The History section allows users to:

- View previous expenses
- Expand an expense
- See participant breakdowns
- Edit expenses
- Delete expenses

When an expense is edited or deleted, the application recalculates:

- Balances
- Settlements
- Who Pays Whom
- Group totals

---

# 10. Members and Invitations

Group owners can invite members using their email address.

Invitations include:

- Email address
- Permission level
- Expiration date
- Secure invitation token

Supported roles:

### Owner

Can manage the group and members.

### Editor

Can add and manage expenses.

### Viewer

Can view the group's information without managing expenses.

---

## Email Delivery

FairShare includes an integration with **Resend** for sending invitation emails.

In the current demo environment, real email delivery is disabled because the required email environment variables are not configured.

When email delivery is unavailable, the application still:

1. Creates the invitation.
2. Generates the secure invitation URL.
3. Displays the URL to the owner.
4. Allows the owner to copy and share the invitation link manually.

For a production deployment, the required email configuration can be added through environment variables.

---

# 11. Dashboard

The main Dashboard provides an overview of the user's groups.

It displays:

- Total amount owed
- Total amount owed to the user
- Total spending across groups
- Number of groups
- Individual group summaries

Users can select a group to open its Group Dashboard.

---

# 12. My Splits

The **My Splits** section provides an overview of the user's expense groups.

Groups can be viewed and filtered according to their type, such as:

- Trips
- Dinners
- Events
- Other groups

---

# 13. Global History

The History section provides expense history across the user's groups.

Expenses can be filtered according to the associated group.

---

# 14. Settings

The Settings page provides:

- User profile information
- Currency preference
- Logout functionality

Logging out clears the authentication information and returns the user to the landing page.

---

# 15. API Reference

The backend API uses the `/api` prefix.

Authentication-protected routes require:

```text
Authorization: Bearer <token>
```

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/users/me
```

## Groups

```text
POST   /api/groups
GET    /api/groups
GET    /api/groups/:id
PUT    /api/groups/:id
DELETE /api/groups/:id
```

## Members

```text
POST   /api/groups/:id/members
GET    /api/groups/:id/members
DELETE /api/groups/:id/members/:memberId
PATCH  /api/groups/:id/members/:memberId/role
```

## Expenses

```text
POST   /api/groups/:id/expenses
GET    /api/groups/:id/expenses
GET    /api/groups/:id/expenses/:expenseId
PUT    /api/groups/:id/expenses/:expenseId
DELETE /api/groups/:id/expenses/:expenseId
```

## Invitations

```text
POST   /api/groups/:id/invitations
GET    /api/groups/:id/invitations
DELETE /api/groups/:id/invitations/:invitationId

GET    /api/invitations/:token
POST   /api/invitations/:token/accept
```

## Balances and Settlements

```text
GET /api/groups/:id/balances
GET /api/groups/:id/settlements
```

---

# 16. Expense Split Format

For an equal split:

```json
{
  "splitType": "equal",
  "participants": [
    "memberId1",
    "memberId2",
    "memberId3"
  ]
}
```

For an unequal split:

```json
{
  "splitType": "unequal",
  "participants": [
    {
      "memberId": "memberId1",
      "amount": 1500
    },
    {
      "memberId": "memberId2",
      "amount": 2500
    }
  ]
}
```

The backend validates unequal splits and rejects them if the participant amounts do not equal the expense total.

---

# 17. How the Math Works

## Balance Calculation

For each member:

```text
Balance = Total Paid - Total Share
```

A positive balance means the member should receive money.

A negative balance means the member owes money.

---

## Equal Splits

Equal expenses are distributed across the selected participants.

The application ensures that the calculated shares add up exactly to the original expense amount, avoiding rounding errors.

---

## Unequal Splits

Users can manually specify how much each participant owes.

The backend validates:

```text
Participant shares = Expense total
```

If they do not match, the request is rejected.

---

## Settlement Calculation

The settlement engine separates members into:

- Creditors — members who should receive money
- Debtors — members who owe money

It then matches debtors and creditors to generate simplified payments.

This means the settlement result is calculated from the current group data rather than being hardcoded.

---

# 18. Demo Data

The seed script creates a demo user:

```text
Name: Demo User
Email: demo@fairshare.app
Password: password123
```

The demo group is:

```text
Goa Trip
```

Members:

```text
A, B, C, D, E, F, G, H, I, J
```

Sample expenses include:

```text
Concert Tickets — ₹12,000
Food             — ₹5,000
Hotel            — ₹30,000
Flights          — ₹12,000
```

The demo data allows the balance and settlement calculations to be viewed immediately after logging in.

---

# 19. Security

FairShare uses several security mechanisms:

- JWT-based authentication
- bcrypt password hashing
- Protected API routes
- Authenticated group access
- Role-based group permissions
- Secure invitation tokens
- Invitation expiration
- Email matching for invitation acceptance

Environment secrets such as JWT secrets and email API keys should never be committed to the repository.

---

# 20. Future Improvements

Potential future improvements include:

- Enable production email delivery through Resend
- Password reset functionality
- Social login
- Push/email notifications
- Recurring expenses
- Receipt/image uploads
- Export expenses to CSV or PDF
- More advanced settlement optimization
- Multi-currency conversion
- Mobile application
- Improved analytics and spending charts

---

# 21. Project Highlights

FairShare demonstrates practical full-stack development concepts including:

- React component-based UI development
- REST API development
- Authentication and authorization
- Database design with Prisma
- CRUD operations
- Role-based access control
- API integration
- Client-side state management
- Form validation
- Expense calculation logic
- Debt simplification algorithms
- Secure invitation workflows
- Frontend/backend deployment
- Error handling
- Responsive UI design

---

## 👩‍💻 Author

**Siwi**

Built as a full-stack software project to explore real-world application development, backend APIs, authentication, database management, financial calculations, and deployment.