'use strict';

/**
 * Database layer for the Meridian Trust Bank onboarding portal.
 *
 * Uses Node.js's built-in `node:sqlite` module (SQLite embedded engine).
 * SQLite is free, open-source, and requires no separate server process or
 * npm install — the entire database lives in a single file on disk at
 * ./data/bank.db
 */

const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'bank.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Create the customers table if it does not already exist.
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id     TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    phone_number    TEXT NOT NULL,
    email           TEXT NOT NULL,
    date_of_birth   TEXT NOT NULL,
    address         TEXT NOT NULL,
    government_id   TEXT NOT NULL,
    account_type    TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const CUSTOMER_ID_MIN = 100000000; // smallest 9-digit number
const CUSTOMER_ID_MAX = 999999999; // largest 9-digit number
const MAX_ID_ATTEMPTS = 20;

/**
 * Generates a random 9-digit customer ID (100000000-999999999) and
 * guarantees it isn't already in use by checking the database. Collisions
 * are astronomically unlikely (~900 million possible IDs) but this makes
 * the guarantee explicit rather than assumed.
 */
function generateUniqueCustomerId() {
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    const candidate = String(
      Math.floor(Math.random() * (CUSTOMER_ID_MAX - CUSTOMER_ID_MIN + 1)) + CUSTOMER_ID_MIN
    );
    if (!getCustomerByCustomerId(candidate)) {
      return candidate;
    }
  }
  throw new Error('Could not generate a unique customer ID after several attempts.');
}

/**
 * Inserts a new customer record with a freshly generated 9-digit customer
 * ID and returns the stored record.
 */
function createCustomer(data) {
  const customerId = generateUniqueCustomerId();

  const insertStmt = db.prepare(`
    INSERT INTO customers
      (customer_id, full_name, phone_number, email, date_of_birth, address, government_id, account_type)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    customerId,
    data.fullName,
    data.phoneNumber,
    data.email,
    data.dateOfBirth,
    data.address,
    data.governmentId,
    data.accountType
  );

  return getCustomerByCustomerId(customerId);
}

function getCustomerByCustomerId(customerId) {
  const stmt = db.prepare('SELECT * FROM customers WHERE customer_id = ?');
  return stmt.get(customerId) || null;
}

function listCustomers() {
  const stmt = db.prepare('SELECT * FROM customers ORDER BY id DESC');
  return stmt.all();
}

module.exports = {
  createCustomer,
  getCustomerByCustomerId,
  listCustomers,
};
