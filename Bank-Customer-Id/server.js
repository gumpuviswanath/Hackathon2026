'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const db = require('./database');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    const MAX_SIZE = 1e6; // 1MB safety limit

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

/**
 * Validates the incoming customer form payload.
 * Returns an array of human-readable error messages (empty = valid).
 */
function validateCustomerPayload(body) {
  const errors = [];
  const required = [
    ['fullName', 'Full name'],
    ['phoneNumber', 'Phone number'],
    ['email', 'Email address'],
    ['dateOfBirth', 'Date of birth'],
    ['address', 'Residential address'],
    ['governmentId', 'Government ID number'],
    ['accountType', 'Account type'],
  ];

  for (const [key, label] of required) {
    if (body[key] === undefined || body[key] === null || String(body[key]).trim() === '') {
      errors.push(`${label} is required.`);
    }
  }
  if (errors.length) return errors; // don't pile on further checks yet

  if (String(body.fullName).trim().length < 2) {
    errors.push('Full name looks too short.');
  }
  if (!PHONE_RE.test(String(body.phoneNumber).trim())) {
    errors.push('Phone number format looks invalid.');
  }
  if (!EMAIL_RE.test(String(body.email).trim())) {
    errors.push('Email address format looks invalid.');
  }
  const dob = new Date(body.dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) {
    errors.push('Date of birth is invalid.');
  } else {
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) errors.push('Customer must be at least 18 years old.');
  }
  const allowedAccountTypes = ['Savings', 'Current', 'Salary'];
  if (!allowedAccountTypes.includes(body.accountType)) {
    errors.push('Account type must be Savings, Current, or Salary.');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleCreateCustomer(req, res) {
  let payload;
  try {
    const raw = await readRequestBody(req);
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    return sendJson(res, 400, { ok: false, errors: ['Invalid request body.'] });
  }

  const errors = validateCustomerPayload(payload);
  if (errors.length) {
    return sendJson(res, 422, { ok: false, errors });
  }

  try {
    const record = db.createCustomer({
      fullName: String(payload.fullName).trim(),
      phoneNumber: String(payload.phoneNumber).trim(),
      email: String(payload.email).trim().toLowerCase(),
      dateOfBirth: String(payload.dateOfBirth).trim(),
      address: String(payload.address).trim(),
      governmentId: String(payload.governmentId).trim(),
      accountType: String(payload.accountType).trim(),
    });

    return sendJson(res, 201, {
      ok: true,
      customer: {
        customerId: record.customer_id,
        fullName: record.full_name,
        accountType: record.account_type,
        createdAt: record.created_at,
      },
    });
  } catch (err) {
    console.error('Error creating customer:', err);
    return sendJson(res, 500, { ok: false, errors: ['Internal server error. Please try again.'] });
  }
}

function handleGetCustomer(res, customerId) {
  const record = db.getCustomerByCustomerId(customerId);
  if (!record) {
    return sendJson(res, 404, { ok: false, errors: ['Customer ID not found.'] });
  }
  return sendJson(res, 200, {
    ok: true,
    customer: {
      customerId: record.customer_id,
      fullName: record.full_name,
      phoneNumber: record.phone_number,
      email: record.email,
      accountType: record.account_type,
      createdAt: record.created_at,
    },
  });
}

function handleListCustomers(res) {
  const records = db.listCustomers();
  return sendJson(res, 200, {
    ok: true,
    count: records.length,
    customers: records.map((r) => ({
      customerId: r.customer_id,
      fullName: r.full_name,
      phoneNumber: r.phone_number,
      email: r.email,
      accountType: r.account_type,
      createdAt: r.created_at,
    })),
  });
}

// ---------------------------------------------------------------------------
// Server / router
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ---- API routes ----
  if (pathname === '/api/customers' && req.method === 'POST') {
    return handleCreateCustomer(req, res);
  }
  if (pathname === '/api/customers' && req.method === 'GET') {
    return handleListCustomers(res);
  }
  if (pathname.startsWith('/api/customers/') && req.method === 'GET') {
    const customerId = decodeURIComponent(pathname.split('/api/customers/')[1] || '');
    return handleGetCustomer(res, customerId);
  }

  // ---- Friendly page routes ----
  if (pathname === '/' || pathname === '/index.html') {
    return serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'));
  }
  if (pathname === '/portal' || pathname === '/portal.html') {
    return serveStaticFile(res, path.join(PUBLIC_DIR, 'portal.html'));
  }
  if (pathname === '/records' || pathname === '/records.html') {
    return serveStaticFile(res, path.join(PUBLIC_DIR, 'records.html'));
  }

  // ---- Static assets (css/js) ----
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (filePath.startsWith(PUBLIC_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveStaticFile(res, filePath);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`Meridian Trust Bank portal running at http://localhost:${PORT}`);
});
