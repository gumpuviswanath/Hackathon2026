# Hackathon 2026: Customer Onboarding Platform - Setup Guide

## 📋 Prerequisites

### Option 1: Local Development (Without Docker)
- **Java 17** or higher
- **Maven 3.8+**
- **Node.js 22+**
- No database install needed — each service uses an embedded H2 file database

### Option 2: Docker & Docker Compose (Recommended)
- **Docker** (version 20+)
- **Docker Compose** (version 1.29+)

---

## 🚀 Quick Start with Docker Compose

### 1. Build all services
```bash
mvn clean package -DskipTests
```

### 2. Start everything with one command
```bash
docker-compose up --build
```

### 3. Access the services
- **Portal Dashboard**: http://localhost:3005
- **Customer Service**: http://localhost:3000
- **KYC Service**: http://localhost:3001
- **Account Service**: http://localhost:3002
- **Product Service**: http://localhost:3003

---

## 🏗️ Architecture Overview

### Microservices (4 Services)

```
┌─────────────────────────────────────────────────────────────┐
│                  Customer Onboarding Portal                  │
│              (React + Material-UI on Port 3005)              │
└────┬────────────────────┬──────────────────────┬─────────────┘
     │                    │                      │
     ▼                    ▼                      ▼
┌──────────────┐   ┌──────────────┐       ┌──────────────┐
│  Customer    │   │     KYC      │       │   Account    │
│  Service     │   │   Service    │       │   Service    │
│  (3000)      │   │   (3001)     │       │   (3002)     │
└──────────────┘   └──────────────┘       └──────────────┘
     │                    │                      │
     └────────────────────┼──────────────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │   Product    │
                    │   Service    │
                    │   (3003)     │
                    └──────────────┘

Each service owns its own embedded H2 file database
```

### Database Schema

Each microservice has its own embedded H2 database file (under its `data/` directory):

- **customer-db**: Stores customers, KYC status
- **kyc-db**: Stores KYC verification details
- **account-db**: Stores bank accounts
- **product-db**: Stores products (Loans, Cards, Insurance)

---

## 📊 Data Flow

### 1. Customer Registration
```
Portal → POST /customer → Customer Service → customer_db
Response: Customer with ID and status "Pending KYC"
```

### 2. KYC Verification
```
Portal → GET /kyc/pending → KYC Service → Fetches from Customer Service
Portal → POST /kyc → KYC Service → Stores in kyc_db
           ↓
      Calls Customer Service to update KYC Status
           ↓
      Customer Service → Updates customer_db
```

### 3. Account Opening
```
Portal → GET /account/eligible-customers → Account Service
         (Fetches approved customers from Customer Service)
         
Portal → POST /account → Account Service
         (Validates KYC status with Customer Service)
         → Stores in account_db
```

### 4. Product Application
```
Portal → GET /product/accounts → Product Service → Fetches from Account Service
Portal → POST /product → Product Service
         (Validates account exists with Account Service)
         → Stores in product_db
```

---

## 🔧 Local Development Setup

### 1. Build Services
```bash
cd C:\Users\hp\IdeaProjects\Hackathon2026
mvn clean package -DskipTests
```
No database install or setup step is needed — each service creates its own embedded H2 file database (under its `data/` directory) automatically on first startup.

### 2. Start Services (in separate terminals)

**Terminal 1 - Customer Service**
```bash
cd Bank-Customer-Id
java -jar target/customer-service-*.jar
```

**Terminal 2 - KYC Service**
```bash
cd Bank-KYC-Service
java -jar target/kyc-service-*.jar
```

**Terminal 3 - Account Service**
```bash
cd Bank-Account-Service
java -jar target/account-service-*.jar
```

**Terminal 4 - Product Service**
```bash
cd Bank-Product-Service
java -jar target/product-service-*.jar
```

**Terminal 5 - Portal**
```bash
cd Customer-Onboarding-Portal
npm install
npm start
```

---

## 🧪 Testing the APIs

### 1. Register a Customer
```bash
curl -X POST http://localhost:3000/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "9876543210",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "governmentId": "AADHAR123456",
    "accountType": "Savings"
  }'
```

### 2. Get All Customers
```bash
curl http://localhost:3000/customer/all
```

### 3. Get Pending KYC Customers
```bash
curl http://localhost:3001/kyc/pending
```

### 4. Approve Customer KYC
```bash
curl -X POST http://localhost:3001/kyc \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "123456789",
    "decision": "Approved",
    "remarks": "All documents verified"
  }'
```

### 5. Open an Account
```bash
curl -X POST http://localhost:3002/account \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "123456789",
    "accountType": "Savings"
  }'
```

### 6. Get Eligible Customers
```bash
curl http://localhost:3002/account/eligible-customers
```

### 7. Apply for Product (Loan)
```bash
curl -X POST http://localhost:3003/product \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "ACC1234567890",
    "productType": "Loan"
  }'
```

### 8. Get Dashboard Summary
```bash
curl http://localhost:3000/customer/summary
```
(The portal's Dashboard page calls this and the other services' endpoints directly from the browser — the portal itself is a static SPA with no backend API of its own.)

---

## 📝 Environment Configuration

### application.properties (Auto-configured)
All services use an embedded H2 file database with these defaults:
- **URL**: jdbc:h2:file:./data/{service}-db
- **Username**: sa
- **Password**: (empty)
- **H2 Console**: http://localhost:{port}/h2-console (enabled per service, for inspecting data during development)

### Override via Environment Variables
```bash
export SPRING_DATASOURCE_URL=jdbc:h2:file:/custom/path/customer-db
export SPRING_DATASOURCE_USERNAME=your_user
export SPRING_DATASOURCE_PASSWORD=your_password
```

---

## 🐳 Docker Compose Commands

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop services
```bash
docker-compose down
```

### Clean up everything (including data)
```bash
docker-compose down -v
```

---

## 📱 Portal Features (Next Phase)

- ✅ Dashboard with live metrics
- ⏳ Customer registration form (UI)
- ⏳ KYC approval workflow (UI)
- ⏳ Account opening form (UI)
- ⏳ Product application form (UI)
- ⏳ Business rule validation (disable buttons based on status)
- ⏳ Real-time status updates

---

## 🔍 Troubleshooting

### Database File Locked or Won't Start
```
Error: Database may be already in use / Locked by another process
Solution: Make sure you don't have two instances of the same service running
  against the same data/ directory at once. Stop the other instance, or
  delete the data/*.mv.db file for that service to start fresh.
```

### Port Already in Use
```
Error: Address already in use: bind
Solution: 
  netstat -ano | findstr :3000  (Windows)
  lsof -i :3000  (macOS/Linux)
  Kill the process using that port
```

### Maven Build Failed
```
Error: [ERROR] Compilation failure
Solution: Ensure Java 17+ is installed: java -version
```

### Feign Client Connection Error
```
Error: feign.FeignException: 404 Not Found
Solution: Ensure all services are running and service URLs in application.properties are correct
```

---

## 📚 API Documentation

### Customer Service (Port 3000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /customer | Create customer |
| GET | /customer/all | Get all customers |
| GET | /customer/{customerId} | Get specific customer |
| GET | /customer/approved | Get approved customers |
| PUT | /customer/{customerId}/status | Update KYC status |
| GET | /customer/summary | Get dashboard summary |

### KYC Service (Port 3001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /kyc | Create KYC record |
| GET | /kyc/all | Get all KYC records |
| GET | /kyc/pending | Get pending customers |
| GET | /kyc/approved | Get approved customers |
| GET | /kyc/rejected | Get rejected customers |

### Account Service (Port 3002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /account | Create account |
| GET | /account/all | Get all accounts |
| GET | /account/eligible-customers | Get customers eligible for accounts |

### Product Service (Port 3003)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /product | Create product application |
| GET | /product/all | Get all products |
| GET | /product/accounts | Get accounts for product selection |

---

## ✅ Success Indicators

✓ All 4 microservices running on ports 3000-3003  
✓ Portal accessible at http://localhost:3005  
✓ Dashboard showing live metrics  
✓ Can create customers with pending KYC status  
✓ Can approve KYC and see status updates  
✓ Can open accounts for approved customers  
✓ Can apply for products  
✓ All data persisting in each service's embedded H2 database  

---

## 📞 Support

For issues:
1. Check logs: `docker-compose logs {service-name}`
2. Ensure all ports (3000-3005) are available
3. Test individual service endpoints with curl

Happy onboarding! 🎉
