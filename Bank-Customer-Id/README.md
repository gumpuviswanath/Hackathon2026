# Meridian Trust — Bank Customer Onboarding Portal

A complete, self-contained end-to-end web app: a bank portal landing page,
an 8-field customer registration form, a Node.js backend, and a free,
open-source embedded database (SQLite) that stores every customer and
returns a generated **Customer ID** on submit.

No external services, no API keys, no npm install required.

## Tech stack

| Layer     | Choice                                      | Why |
|-----------|----------------------------------------------|-----|
| Frontend  | Plain HTML / CSS / JS                        | No build step, opens instantly, easy to customize |
| Backend   | Node.js built-in `http` module                | Zero dependencies — nothing to `npm install` |
| Database  | Node's built-in `node:sqlite` (SQLite engine) | Free, open-source, embedded — single file, no DB server to install |

The whole app runs with a single command: `node server.js`.

## Project structure

```
bank-portal/
├── server.js            # HTTP server + routing + REST API
├── database.js           # SQLite schema, customer-ID generation, queries
├── package.json
├── data/
│   └── bank.db            # created automatically on first run
└── public/
    ├── index.html         # landing page → "Enter Customer Portal"
    ├── portal.html         # the 8-field registration form + confirmation
    ├── records.html         # internal ledger view (demo/admin) of all customers
    ├── css/style.css
    └── js/portal.js         # form validation + submit + render customer ID
```

## Running it

Requires **Node.js 22.5+** (uses the built-in SQLite module — no install needed).

```bash
cd bank-portal
node server.js
```

Then open **http://localhost:3000** in a browser.

- `/` — landing page. Click **Enter Customer Portal**.
- `/portal` — the registration form.
- `/records` — a simple internal table of everyone who has registered (demo view — no auth, don't expose this publicly).

To change the port: `PORT=4000 node server.js`.

## The form (7 fields)

1. Full legal name
2. Phone number
3. Email address
4. Date of birth (must be 18+)
5. Government ID number (Aadhaar / Passport / National ID)
6. Account type (Savings / Current / Salary)
7. Residential address

All fields sit in a uniform two-column grid so every input box lines up
consistently. On submit, the backend validates every field (format checks
for email/phone, age check, etc.) and returns clear error messages if
anything is invalid — the form highlights the offending fields inline.

## How the Customer ID is generated

Each successful submission gets a **random 9-digit customer ID**
(`100000000`-`999999999`). Before saving, the backend checks the database
to make sure that number isn't already assigned to someone else - if it
ever collided (practically never, out of ~900 million possible values),
it would simply generate another one.

```
e.g. 483920156, 719004832, ...
```

This ID is returned to the browser and displayed on a "ledger stamp"
confirmation card, and it's what you'd use going forward to look up the
customer (`GET /api/customers/:customerId`).

## REST API

| Method | Route                          | Purpose                                  |
|--------|---------------------------------|-------------------------------------------|
| POST   | `/api/customers`                 | Create a customer, returns the customer ID |
| GET    | `/api/customers/:customerId`       | Look up a single customer by ID            |
| GET    | `/api/customers`                  | List all customers (used by `/records`)    |

Example:

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Asha Rao",
    "phoneNumber": "+91 98765 43210",
    "email": "asha.rao@email.com",
    "dateOfBirth": "1994-05-12",
    "address": "12 MG Road, Bengaluru",
    "governmentId": "AADHAAR-1234-5678",
    "accountType": "Savings"
  }'
```

Response:

```json
{
  "ok": true,
  "customer": {
    "customerId": "591391428",
    "fullName": "Asha Rao",
    "accountType": "Savings",
    "createdAt": "2026-07-09 07:44:26"
  }
}
```

## Where your data lives

Everything is stored in `data/bank.db` — a single SQLite file. You can:
- Inspect it with any SQLite browser (e.g. [DB Browser for SQLite](https://sqlitebrowser.org/), free).
- Delete it any time to reset the ledger — it's recreated automatically on the next run.
- Back it up by copying the file.

## Notes on going to production

This project is a genuine, working end-to-end app, but a few things you'd
want to add before handling real customers/PII in production:

- **HTTPS** and a reverse proxy (e.g. Nginx) in front of Node.
- **Authentication** on `/records` and the `GET /api/customers` list route — right now they're open, which is fine for a local demo only.
- **Encryption at rest** for sensitive fields (government ID, etc.) and a secrets-managed environment.
- **Rate limiting** and stronger input sanitization on the API.
- Swapping SQLite for a managed Postgres/MySQL instance if you expect concurrent write traffic at scale (SQLite handles this project's load easily, but isn't ideal for many simultaneous writers).

## Customizing

- Add/remove fields: edit the form in `public/portal.html`, the validation list in `server.js` (`validateCustomerPayload`), and the table schema in `database.js`.
- Change the customer ID format: edit `buildCustomerId()` in `database.js`.
- Re-theme: all design tokens (colors, fonts) are CSS variables at the top of `public/css/style.css`.
