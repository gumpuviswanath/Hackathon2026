# 🚀 Quick Start Guide - Hackathon 2026 Portal

## ⚡ 5-Minute Setup

Pick one path — Docker, or local (no Docker, no database install needed either way; every service uses an embedded H2 file database).

### Option A: Docker

**Step 1: Build Services** (2 min)
```bash
cd C:\Users\hp\IdeaProjects\Hackathon2026
mvn clean package -DskipTests -q
```

**Step 2: Start Docker** (1 min)
```bash
docker-compose up --build
```

### Option B: Local (no Docker)

**Step 1: Build Services** (2 min)
```powershell
cd C:\Users\hp\IdeaProjects\Hackathon2026
.\start-services.ps1 build
```

**Step 2: Start everything** (4 services + portal)
```powershell
.\start-services.ps1 local
```

If PowerShell blocks the script (`running scripts is disabled on this system`), run once with:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-services.ps1 build
powershell -ExecutionPolicy Bypass -File .\start-services.ps1 local
```
or allow local scripts permanently: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

Check status any time with `.\start-services.ps1 status`. Each service takes ~20-35 seconds to cold-start.

### **Step 3: Open Portal** (1 min)
Open browser: **http://localhost:3005**

### **Step 4: Start Using!** (1 min)
- Click "Customer" → Register new customer
- Click "KYC" → Approve customer
- Click "Account" → Open account
- Click "Product" → Apply for loans/cards
- Click "Dashboard" → See live metrics

---

## 📊 What You'll See

### **Dashboard** 📈
8 Live metrics updating every 5 seconds:
- 👥 Customers Registered
- ⏳ Pending KYC
- ❌ Rejected
- ✅ Approved
- 🏦 Accounts Opened
- 💰 Loans
- 💳 Credit Cards
- 🛡️ Insurance

### **Customer Module** 👥
- ➕ Register new customers
- 📋 View all customers with status
- 🔄 Track KYC status for each customer

### **KYC Module** ✅
- 📍 Pending customers (with Approve/Reject buttons)
- ✔️ Approved customers list
- ❌ Rejected customers list
- 💬 Add remarks for each decision

### **Account Module** 🏧
- 💼 Eligible customers (KYC approved, no account)
- 🏦 Open Savings or Current accounts
- 📊 View all opened accounts
- ⚠️ Smart button validation (disabled if KYC not approved)

### **Product Module** 🎁
- 💰 Apply for Loans
- 💳 Apply for Credit Cards
- 🛡️ Apply for Insurance
- 📊 View submitted applications by type
- ⚠️ Smart button validation (disabled if no account)

---

## 🧪 Test Workflow

1. **Register Customer**
   - Customer → "+ Register New Customer"
   - Fill name, mobile, email, govt ID
   - ✅ Customer appears in table

2. **Approve KYC**
   - KYC → "Pending" tab
   - Find customer, click "Approve"
   - Add remarks, confirm
   - ✅ Status becomes "Approved"

3. **Open Account**
   - Account → "Customers Eligible for Account"
   - "Open Account" button is now ENABLED (was disabled before)
   - Choose Savings or Current
   - ✅ Account created & appears in accounts list

4. **Apply for Product**
   - Product → "Apply for Products"
   - Find account, click "Apply"
   - Choose Loan/Card/Insurance
   - ✅ Application appears in respective tab

5. **Check Dashboard**
   - Dashboard → All metrics updated in real-time
   - Numbers increment as you add data

---

## 🐳 Docker Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up --build` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
| `docker-compose down -v` | Clean everything (data lost) |

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Portal | http://localhost:3005 | React SPA |
| Customer API | http://localhost:3000 | Register customers |
| KYC API | http://localhost:3001 | KYC verification |
| Account API | http://localhost:3002 | Account management |
| Product API | http://localhost:3003 | Product applications |

---

## 📱 Key Features

✅ **Real-time Dashboard** - Metrics update every 5 seconds  
✅ **Smart Validation** - Buttons disable based on business rules  
✅ **Data Persistence** - Embedded H2 file database per service keeps all data  
✅ **Service Integration** - All 4 microservices working together  
✅ **Responsive Design** - Works on mobile/tablet/desktop  
✅ **Error Handling** - Clear error messages  
✅ **Docker Ready** - One-command deployment  

---

## 🔧 Troubleshooting

### **Portal not loading**
```bash
# Local (dev server)
cd Customer-Onboarding-Portal
npm install
npm start

# Docker (rebuild the image)
docker-compose up --build portal
```

### **Services not connecting**
```bash
# Check service status
curl http://localhost:3000/customer/all
curl http://localhost:3001/kyc/all
curl http://localhost:3002/account/all
curl http://localhost:3003/product/all
```

### **Database connection error**
```bash
# Docker: check a service's logs (each service owns its own embedded H2 file DB)
docker-compose logs customer-service
# Or restart
docker-compose down -v && docker-compose up --build

# Local: delete a service's H2 file to start fresh (e.g. Bank-Customer-Id\data\customer-db.mv.db)
# then re-run .\start-services.ps1 local
```

### **Port already in use**
```powershell
# Windows - find process using port
netstat -ano | findstr :3005
# Kill process
taskkill /PID <PID> /F
```

---

## 📝 API Examples

### **Register Customer**
```bash
curl -X POST http://localhost:3000/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "9876543210",
    "email": "john@test.com",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "governmentId": "AADHAR123",
    "accountType": "Savings"
  }'
```

### **Approve KYC**
```bash
curl -X POST http://localhost:3001/kyc \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "123456789",
    "decision": "Approved",
    "remarks": "All documents verified"
  }'
```

### **Open Account**
```bash
curl -X POST http://localhost:3002/account \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "123456789",
    "accountType": "Savings"
  }'
```

### **Apply for Product**
```bash
curl -X POST http://localhost:3003/product \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "ACC1234567890",
    "productType": "Loan"
  }'
```

---

## 📚 Documentation Files

- **SETUP_GUIDE.md** - Detailed setup instructions
- **PHASE1_COMPLETION.md** - Infrastructure completion report (database, Docker, service layer)
- **README.md** - Project overview

---

## ✅ Verification Checklist

After starting, verify:

- [ ] Portal loads at http://localhost:3005
- [ ] Dashboard shows metrics
- [ ] Can register customer
- [ ] Can approve KYC
- [ ] Can open account
- [ ] Can apply for products
- [ ] Metrics update on dashboard
- [ ] No error messages in browser console

---

## 🎉 Success!

If everything works:
- ✅ You have a fully functional customer onboarding system
- ✅ All 4 microservices operational
- ✅ React portal with Material-UI
- ✅ H2 embedded persistence
- ✅ Docker containerization
- ✅ Ready to impress the judges! 🏆

---

**Last Updated:** 2026-07-11  
**Portal Version:** 1.0.0  
**Status:** ✅ Production Ready  

🚀 **Happy Onboarding!** 🚀
