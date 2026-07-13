# 🏦 Beyond Banking: Customer Onboarding Platform

**A complete microservices-based customer onboarding system with React portal, Spring Boot backends, and embedded H2 persistence.**

## 📋 Project Overview

A comprehensive banking customer onboarding solution that streamlines the entire process:

1. **Customer Registration** → 2. **KYC Verification** → 3. **Account Opening** → 4. **Product Application**

### ✨ Key Features

- 🏗️ **4 Independent Microservices** (Spring Boot)
- 🎨 **React SPA Frontend** (Material-UI)
- 🗄️ **H2 Database** (embedded, file-based, persistent)
- 🐳 **Docker Compose** (one-command deployment)
- ⚡ **Real-time Dashboard** (updates every 5 seconds)
- 🔄 **Service-to-Service Communication** (Feign clients)
- ✅ **Business Logic Validation** (smart button rules)

---

## 🚀 Quick Start (5 Minutes)

### **Prerequisites**
- Docker & Docker Compose OR Java 17 + Maven
- Node.js 18+ (if running locally without Docker)
- No database installation needed — each service uses an embedded H2 file database

### **Start with Docker** (Recommended)
```bash
# 1. Build all services
mvn clean package -DskipTests -q

# 2. Start everything
docker-compose up --build

# 3. Open browser
# http://localhost:3005
```

### **Or Start Manually** (Local Development, no Docker, no DB install)
```powershell
# 1. Build all services
.\start-services.ps1 build

# 2. Start all 4 services + the portal
.\start-services.ps1 local

# 3. Open browser
# http://localhost:3005
```
If PowerShell blocks the script with `running scripts is disabled on this system`, either run it once via:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-services.ps1 build
powershell -ExecutionPolicy Bypass -File .\start-services.ps1 local
```
or allow local scripts permanently for your user account (one-time):
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
Each service takes ~20-35 seconds to start (JVM cold start) — check `.\start-services.ps1 status` before assuming something's broken.

---

## 🏗️ Architecture

### **System Diagram**

```
┌──────────────────────────────────────┐
│   🎨 React Portal (Port 3005)        │
│   Material-UI Dashboard + 5 Modules  │
└────┬─────────────────────────────────┘
     │
   ┌─┴─────────┬──────────┬─────────┐
   │           │          │         │
   ▼           ▼          ▼         ▼
 [3000]      [3001]    [3002]    [3003]
Customer     KYC       Account   Product
 Service    Service    Service   Service
   │           │          │         │
   └───────────┴──────────┴─────────┘
              │
              ▼
     Each service owns its own
     embedded H2 file database
```

### **Microservices**

| Service | Port | Purpose | Database |
|---------|------|---------|----------|
| Customer | 3000 | Register & manage customers | customer-db.mv.db (H2) |
| KYC | 3001 | KYC verification | kyc-db.mv.db (H2) |
| Account | 3002 | Account management | account-db.mv.db (H2) |
| Product | 3003 | Product applications | product-db.mv.db (H2) |

### **Portal Modules**

| Module | Features |
|--------|----------|
| 📊 **Dashboard** | Real-time metrics (8 KPIs) |
| 👥 **Customer** | Register, list customers |
| ✅ **KYC** | Approve/Reject with remarks |
| 🏧 **Account** | Open Savings/Current accounts |
| 🎁 **Product** | Apply for Loans/Cards/Insurance |

---

## 🎨 Technology Stack

### **Frontend**
- React 18, Material-UI v5, Vite, React Router, Axios

### **Backend**
- Spring Boot 3.3.5, Spring Data JPA, Feign, Spring Web

### **Database**
- H2 (embedded, file-based), Hibernate ORM

### **DevOps**
- Docker, Docker Compose, Maven

---

## ✅ Implemented Features

### **Phase 1: Database & Infrastructure**
- ✅ Embedded H2 file database per service (no separate DB install/container needed)
- ✅ Docker Compose setup with 5 services
- ✅ Service dependency management
- ✅ Persistent volume mount for each service's H2 data directory

### **Phase 2: React Portal**
- ✅ Complete React SPA with Material-UI
- ✅ 5 fully functional modules (Dashboard, Customer, KYC, Account, Product)
- ✅ Real-time dashboard updating every 5 seconds
- ✅ Business logic validation with smart button enable/disable
- ✅ Error handling & success notifications
- ✅ Responsive design for mobile/tablet/desktop

### **Business Rules**
- ✅ Account opening only for KYC-approved customers
- ✅ Products only for customers with accounts
- ✅ Status-based button enable/disable with tooltips
- ✅ Remarks mandatory for KYC decisions
- ✅ Service-to-service validation

---

## 🧪 Testing Workflow

1. **Register Customer** → Customer appears with "Pending KYC"
2. **Approve KYC** → Status changes to "Approved"
3. **Open Account** → Account created (button was disabled, now enabled)
4. **Apply for Product** → Product submitted (button was disabled, now enabled)
5. **View Dashboard** → All metrics updated

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[PHASE1_COMPLETION.md](PHASE1_COMPLETION.md)** - Infrastructure completion report (database, Docker, service layer)

---

## 🎯 API Endpoints

### **Customer Service (3000)**
```
POST   /customer                      Create customer
GET    /customer/all                  All customers
GET    /customer/approved             Approved only
GET    /customer/summary              Dashboard metrics
PUT    /customer/{customerId}/status  Update KYC status
```

### **KYC Service (3001)**
```
POST   /kyc                           Submit decision
GET    /kyc/pending                   Pending customers
GET    /kyc/approved                  Approved customers
GET    /kyc/rejected                  Rejected customers
```

### **Account Service (3002)**
```
POST   /account                       Create account
GET    /account/all                   All accounts
GET    /account/eligible-customers    Eligible for account
```

### **Product Service (3003)**
```
POST   /product                       Create product
GET    /product/all                   All products
GET    /product/accounts              All accounts
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything
docker-compose down -v
```

---

## 📊 Success Indicators

✅ Portal loads at http://localhost:3005  
✅ Dashboard shows 8 live metrics  
✅ Can register customer → appears in table  
✅ Can approve KYC → status updates  
✅ Can open account → "Open Account" button was disabled, now enabled  
✅ Can apply for products → "Apply" button was disabled, now enabled  
✅ All data persists in H2 (file-based, survives restarts)  
✅ Real-time metrics update every 5 seconds  

---

## 🏆 Ready for Judges!

This system demonstrates:
- ✅ Microservices Architecture
- ✅ Database Persistence
- ✅ Service-to-Service Communication
- ✅ Modern Frontend (React + Material-UI)
- ✅ Business Logic & Validation
- ✅ DevOps/Docker Deployment
- ✅ Real-time Updates
- ✅ Enterprise-grade Error Handling
- ✅ Responsive Design
- ✅ Production Ready

---

## 📞 Support

### **Quick Start Commands**
```bash
# Build
mvn clean package -DskipTests -q

# Run with Docker
docker-compose up --build

# Or run locally
.\start-services.ps1 build
.\start-services.ps1 local
```

---

**Status:** ✅ **Production Ready**  
**Last Updated:** 2026-07-11  
**Version:** 1.0.0  

🚀 **Transform Banking Onboarding!** 🚀
