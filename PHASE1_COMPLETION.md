# Infrastructure Completion Report: Database, Docker & Service Layer

## ✅ Completed Tasks

### 1. **Database Layer (Embedded H2)**
- ✅ All 4 microservices use `com.h2database:h2` (runtime scope) — no separate database server to install or run
- ✅ Each service owns its own embedded, file-based H2 database under its `data/` directory
- ✅ Data persists across restarts (file-based, not in-memory) and survives `docker-compose down` (per-service volume mount)
- ✅ H2 console enabled per service at `/h2-console` for inspecting data during development

**Files:**
```
Bank-Customer-Id/pom.xml → h2 dependency
Bank-Customer-Id/src/main/resources/application.properties → jdbc:h2:file:./data/customer-db

Bank-KYC-Service/pom.xml → h2 dependency
Bank-KYC-Service/src/main/resources/application.properties → jdbc:h2:file:./data/kyc-db

Bank-Account-Service/pom.xml → h2 dependency
Bank-Account-Service/src/main/resources/application.properties → jdbc:h2:file:./data/account-db

Bank-Product-Service/pom.xml → h2 dependency
Bank-Product-Service/src/main/resources/application.properties → jdbc:h2:file:./data/product-db
```

### 2. **Docker Configuration**
- ✅ `docker-compose.yml` orchestrates 5 services (no separate database container needed)
  - 4 Spring Boot microservices, each with a bind-mounted `data/` volume for its H2 file
  - Portal service (React, built with Vite, served via `http-server`)
  - Service-to-service networking via a shared Docker bridge network
  - `depends_on` ordering so dependent services start after the services they call

- ✅ Dockerfiles for all services
  - `Bank-Customer-Id/Dockerfile` (JRE 17)
  - `Bank-KYC-Service/Dockerfile` (JRE 17)
  - `Bank-Account-Service/Dockerfile` (JRE 17)
  - `Bank-Product-Service/Dockerfile` (JRE 17)
  - `Customer-Onboarding-Portal/Dockerfile` (Node 22, multi-stage build → static `http-server`)

### 3. **Documentation**
- ✅ `SETUP_GUIDE.md` — detailed setup instructions, architecture overview, API reference, troubleshooting
- ✅ `QUICK_START.md` — condensed getting-started guide
- ✅ `README.md` — project overview and quick start
- ✅ `start-services.ps1` (PowerShell automation)
  - Build all services: `.\start-services.ps1 build`
  - Docker start: `.\start-services.ps1 docker`
  - Local start (no DB install needed): `.\start-services.ps1 local`
  - Service status: `.\start-services.ps1 status`

---

## 🎯 Current Architecture

### Database Layer (Embedded H2, per service)
```
Bank-Customer-Id/data/customer-db.mv.db   → Customer Service Data
Bank-KYC-Service/data/kyc-db.mv.db        → KYC Verification Data
Bank-Account-Service/data/account-db.mv.db → Bank Accounts Data
Bank-Product-Service/data/product-db.mv.db → Products Data (Loans, Cards, Insurance)
```

### Service Layer (Spring Boot Microservices)
```
Port 3000 → Customer Service
  ├── POST /customer (create customer)
  ├── GET /customer/all (list customers)
  ├── GET /customer/{customerId} (get customer)
  ├── GET /customer/approved (approved only)
  ├── PUT /customer/{customerId}/status (update KYC status)
  ├── PUT /customer/status (update KYC status by body)
  └── GET /customer/summary (dashboard metrics)

Port 3001 → KYC Service
  ├── Calls Customer Service via Feign
  ├── POST /kyc (create KYC record)
  ├── GET /kyc/all
  ├── GET /kyc/pending
  ├── GET /kyc/approved
  └── GET /kyc/rejected

Port 3002 → Account Service
  ├── Validates with Customer Service via Feign
  ├── POST /account (create account)
  ├── GET /account/all
  └── GET /account/eligible-customers

Port 3003 → Product Service
  ├── Validates with Account Service via Feign
  ├── POST /product (create product)
  ├── GET /product/all
  └── GET /product/accounts
```

### Portal Layer
```
Port 3005 → Customer Onboarding Portal (React 18 + Material-UI, built with Vite)
  └── Calls all 4 backend services directly from the browser
  └── Dashboard, Customer, KYC, Account, and Product modules
  └── Real-time dashboard polling every 5 seconds
```

---

## 📊 Service-to-Service Communication

### Feign Clients Configured
1. **KYC Service** → Calls Customer Service
   - `services.customer-service-url=http://localhost:3000` (or `http://customer-service:3000` in Docker)

2. **Account Service** → Calls Customer Service
   - `services.customer-service-url=http://localhost:3000` (or `http://customer-service:3000` in Docker)

3. **Product Service** → Calls Account Service
   - `services.account-service-url=http://localhost:3002` (or `http://account-service:3002` in Docker)

---

## 🚀 How to Start

### Option A: Local (no Docker, no database install)
```powershell
# 1. Build all services
.\start-services.ps1 build

# 2. Start everything locally (4 services + portal)
.\start-services.ps1 local

# 3. Open http://localhost:3005 in browser
```
If PowerShell blocks the script (`running scripts is disabled on this system`), either run it once with:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-services.ps1 build
powershell -ExecutionPolicy Bypass -File .\start-services.ps1 local
```
or allow local scripts permanently for your user account:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Option B: Docker
```powershell
# 1. Build all services
mvn clean package -DskipTests -q

# 2. Start everything with Docker Compose
docker-compose up --build

# 3. Open http://localhost:3005 in browser
```

---

## ✨ What Works Now

✅ **Database Persistence**
- All customer, KYC, account, and product data persists in embedded H2 files
- Data survives service restarts (as long as the `data/` folder isn't deleted)
- Each service's data is fully isolated (separate H2 file per service)

✅ **Service Communication**
- Feign clients properly configured for inter-service calls
- KYC Service calls Customer Service to fetch/update customer status
- Account Service validates customer KYC status
- Product Service validates account existence

✅ **Docker Deployment**
- All services can be started with a single `docker-compose up --build` command
- No database container to wait on — services start faster
- Per-service volume mounts preserve H2 data across container restarts

✅ **Local Deployment**
- No database to install — `.\start-services.ps1 local` just works with Java/Maven/Node already on PATH

✅ **React Portal**
- Full React 18 + Material-UI SPA (Dashboard, Customer, KYC, Account, Product modules)
- Real-time dashboard polling every 5 seconds
- Business logic validation (buttons disabled based on KYC/account status)

---

## 🔄 Data Persistence Workflow (Example)

1. **Register Customer**
   ```
   Portal → POST /customer → Customer Service
   Customer Service → Saves to Bank-Customer-Id/data/customer-db.mv.db
   Returns customer with ID and status "Pending KYC"
   ```

2. **Restart Service** (data not lost)
   ```
   Stop and restart the service (locally or via docker-compose)
   Service reopens the same H2 file
   All customer data still exists ✅
   ```

3. **Verify Persistence**
   ```
   Portal → GET /customer/all
   Customer Service → Queries customer-db.mv.db
   All previously registered customers returned ✅
   ```

---

## 📞 Support Commands

```powershell
# Check service status
.\start-services.ps1 status

# View Docker logs
docker-compose logs -f

# Stop Docker services
docker-compose down

# Clean up everything (including H2 data volumes)
docker-compose down -v

# Test Customer Service
curl http://localhost:3000/customer/all

# Test Dashboard summary
curl http://localhost:3000/customer/summary
```

---

**Status: ✅ Infrastructure operational** — all 4 microservices, embedded H2 persistence, Docker Compose orchestration, and the React portal are all working end-to-end.
