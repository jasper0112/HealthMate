# 🩺 HealthMate – AI-Powered Holistic Health Companion

## 📘 Overview  
**HealthMate** is an AI-powered holistic health and lifestyle assistant designed to help users monitor, assess, and improve their wellbeing.  
It enables users to track daily health data, receive personalized lifestyle recommendations, and access smart triage services that connect them with healthcare professionals when needed.  
HealthMate is not only for medical situations—it is a lifelong health partner for everyday wellbeing.

---

## 🎯 Objectives & Scope  
- **Objectives**
  - Improve pre-consultation efficiency.  
  - Provide accessible and personalized health information.  
  - Reduce patient anxiety through clear self-care guidance.  

- **Scope**
  - Includes: Symptom intake, health monitoring, lifestyle recommendations, pre-consultation guidance.  
  - Excludes: Professional diagnosis, prescriptions, or treatment decisions.  

- **Significance**
  - Supports patients with timely, accessible health advice.  
  - Assists GPs and healthcare providers by streamlining consultations.  

---

## 👥 Intended Users
| User Group | Profile | Key Needs | Value from HealthMate |
|-------------|----------|------------|------------------------|
| **Busy Workers** | Long hours, irregular schedules | Time-efficient wellness management | Quick tracking and reminders |
| **Health-Conscious Individuals** | Students or families focused on wellness | Evidence-based lifestyle guidance | Personalized diet and fitness planning |
| **Newcomers to Healthcare System** | International students, migrants | Confusion about when/where to seek care | Smart triage and multilingual GP connection |

---

## ⚙️ Core & Optional Features
### Integrated Features (7)
1. **Daily Health Data Record** – Track BMI, weight, mood, and other metrics.  
2. **Health Assessment** – Analyze data with LLM and provide detailed reports.  
3. **Personalized Health Plan** – Generate customized diet, exercise, and lifestyle plans.  
4. **Online Smart Triage & GP Connection** – Suggest appropriate medical action and assist booking.  
5. **Offline Guide to Nearby Hospitals/Clinics** – Provide directions and details for urgent care.  
6. **OTC Medicine & Pharmacy Guidance** – Recommend non-prescription options and nearest pharmacies.  
7. **Diet & Supplement Advice** – Suggest food and supplement plans based on user profile.

### Optional Features (3)
1. **Health Insurance Recommendation** – Especially for international users.  
2. **Hardware Device Integration** – Sync with wearables for real-time monitoring.  
3. **Daily Check-In Challenge & Rewards** – Gamified health engagement.

---

## 🧠 AI & MBSE Architecture
### Key Design Principles
- **Separation of control and function** – LLM agent manages decision logic; UI handles presentation.  
- **Layered architecture (4+1 View Model)**  
  - Logical View → UML Class Diagram  
  - Process View → Activity Diagram  
  - Development View → Package Diagram  
  - Physical View → Deployment Diagram  
  - Use Case View → User Scenarios (Patients, Doctors, Tech Team)

### Core Agentic AI Design
- **LLM Agent Architecture** based on **BDI (Belief–Desire–Intention)** model:  
  - *Beliefs:* User data & knowledge base  
  - *Desires:* Health goals & queries  
  - *Intentions:* Executable plans (triage, advice, scheduling)

---

## 🧩 UML & Model Artifacts (Stage 1)
| Diagram Type | Description |
|---------------|-------------|
| **Ad-hoc Diagram** | Overall concept of AI-driven health assistant |
| **Feature Diagram** | Classifies 7 core + 3 optional features |
| **Use Case Diagram** | Captures user–system interactions (patients, doctors, tech team) |
| **Class Diagram** | Shows system entities and relationships (User, HealthData, Agent, GPConnection, etc.) |
| **Activity Diagram** | Describes workflow for triage and health plan generation |
| **Sequence Diagram** | Depicts LLM-based interaction between Patient, Agent, and GP service |
| **State Machine Diagram** | Illustrates agent’s behavior states (Idle → Assess → Recommend → Connect) |
| **Package Diagram** | Logical organization: Patient, CoreAgent, HealthData, Appointment, etc. |
| **Deployment Diagram** | Maps backend services and LLM components on cloud infrastructure |



---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security
- **Build Tool**: Maven
- **AI Integration**: Google Gemini API

### Frontend
- **Framework**: Next.js 15.5.6 (React 19.1.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Export**: html2canvas, jsPDF (for PDF/Image export)

### Database
- **RDBMS**: MySQL 8.0

### Deployment
- **Containerization**: Docker & Docker Compose
- **Runtime**: 
  - Backend: Eclipse Temurin JRE 17
  - Frontend: Node.js 20

---

## 🧾 Project Structure

```
HealthMate/
│
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/backend/
│   │   │   │   ├── config/          # Configuration (Security, Gemini)
│   │   │   │   ├── controller/     # REST Controllers (13 APIs)
│   │   │   │   ├── dto/            # Data Transfer Objects (46 DTOs)
│   │   │   │   ├── entity/         # JPA Entities (13 entities)
│   │   │   │   ├── repository/     # JPA Repositories (13 repos)
│   │   │   │   ├── service/        # Business Logic (18 services)
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml # Spring configuration
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   ├── pom.xml                      # Maven dependencies
│   └── mvnw, mvnw.cmd              # Maven Wrapper
│
├── frontend/                        # Next.js Frontend
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Registration page
│   │   │   ├── dashboard/          # Dashboard
│   │   │   ├── assessment/         # Health Assessment
│   │   │   ├── record/             # Health Data Record
│   │   │   ├── health-plans/       # Health Plans
│   │   │   ├── diet-guidance/      # Diet Guidance
│   │   │   ├── profile/            # User Profile
│   │   │   └── admin/              # Admin panel
│   │   ├── components/             # React Components
│   │   │   ├── AssessmentHistory.tsx
│   │   │   ├── AssessmentSummary.tsx
│   │   │   ├── DataRecordForm.tsx
│   │   │   └── ...
│   │   ├── lib/                    # Utilities
│   │   │   ├── api.ts             # API client
│   │   │   ├── types.ts           # TypeScript types
│   │   │   ├── auth.ts            # Authentication
│   │   │   ├── csv.ts             # CSV export
│   │   │   └── pdf.ts             # PDF export
│   │   └── styles/                 # CSS files
│   ├── public/                     # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── Dockerfile                  # Frontend Docker image
│
├── build.sh                         # Build script (Linux/macOS)
├── build.ps1                       # Build script (Windows PowerShell)
├── build.cmd                        # Build script (Windows CMD)
├── docker-compose.yml               # Docker Compose configuration
├── env.example                      # Environment variables template
├── api-tests.http                   # HTTP API test file (IntelliJ/Rider)
├── HealthMate-API.postman_collection.json  # Postman collection
└── README.md                        # This file
```

### Key Directories

- **`backend/src/main/java/com/example/backend/`**: Main backend source code
  - `controller/`: REST API endpoints (13 controllers)
  - `service/`: Business logic layer (18 services)
  - `entity/`: Database entities (13 entities)
  - `repository/`: Data access layer (13 repositories)
  - `dto/`: Request/Response DTOs (46 DTOs)

- **`frontend/src/app/`**: Next.js pages (App Router)
- **`frontend/src/components/`**: Reusable React components
- **`frontend/src/lib/`**: Utility functions and API client

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** installed and running
- **Java 17+** (for building backend locally)
- **Maven** (or Maven Wrapper included in project)
- **Node.js 20+** (optional, for local frontend development)

### Environment Configuration

1. **Create `.env` file** (if using local MySQL):
   ```bash
   cp env.example .env
   ```
   
2. **Edit `.env`** and set:
   ```env
   MYSQL_ROOT_PASSWORD=your_secure_password
   ```
   
   > **Note**: The backend is currently configured to use a cloud MySQL database.  
   > If you want to use local MySQL, update `SPRING_DATASOURCE_URL` in `docker-compose.yml`.

### API Testing

- **HTTP Client**: Use `api-tests.http` file (IntelliJ IDEA / JetBrains Rider)
- **Postman**: Import `HealthMate-API.postman_collection.json`

### First-Time Setup

After cloning or downloading this project, follow these steps:

#### Method 1: Using Build Scripts (Recommended) ✨

The build scripts automatically handle all setup steps:
- Build backend JAR file
- Check Docker environment
- Create `.env` file from template (if needed)
- Start all Docker services

##### Linux / macOS

```bash
# 1. Make build script executable (if needed)
chmod +x build.sh

# 2. Run the build script
./build.sh
```

##### Windows PowerShell

```powershell
# Run the PowerShell build script
.\build.ps1
```

##### Windows CMD

```cmd
# Run the batch build script
build.cmd
```

#### Method 2: Manual Build Steps

If you prefer manual control, follow these steps:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Build the backend JAR file
# On Linux/macOS:
./mvnw clean package -DskipTests

# On Windows:
mvnw.cmd clean package -DskipTests

# 3. Return to project root
cd ..

# 4. Create .env file (if not exists)
# Copy from .env.example and edit as needed
cp .env.example .env  # Linux/macOS
copy .env.example .env  # Windows

# Edit .env and set MYSQL_ROOT_PASSWORD (if using local MySQL)

# 5. Start Docker Compose services
docker compose up -d
```

### Verify Services

```bash
# Check service status
docker compose ps

# View backend logs (should see "Started BackendApplication")
docker compose logs backend --tail 50

# View frontend logs
docker compose logs frontend --tail 50

# View all logs in real-time
docker compose logs -f
```

### Access Services

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080

### Common Commands

```bash
# Stop all services
docker compose down

# Restart all services
docker compose restart

# View real-time logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop and remove all containers and volumes
docker compose down -v

# Rebuild and restart services
docker compose up -d --build
```

### Troubleshooting

#### Issue: Docker container shows "Restarting" or "Invalid or corrupt jarfile"

**Cause**: Backend JAR file was not built before starting Docker

**Solution**: Run the build script or manually build the backend first:
```bash
cd backend
./mvnw clean package -DskipTests  # Linux/macOS
mvnw.cmd clean package -DskipTests  # Windows
cd ..
docker compose restart backend
```

#### Issue: Docker is not running

**Solution**: Start Docker Desktop before running the build script

#### Issue: Build script fails on Windows PowerShell

**Solution**: Ensure PowerShell execution policy allows scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Issue: Frontend cannot connect to backend

**Solution**: 
- Verify backend is running: `docker compose logs backend`
- Check `NEXT_PUBLIC_API_BASE_URL` environment variable
- Ensure both services are up: `docker compose ps`

#### Issue: Backend cannot connect to database

**Solution**:
- Verify database connection string in `docker-compose.yml` (`SPRING_DATASOURCE_URL`)
- Check database credentials in `docker-compose.yml`
- For cloud database: Ensure network connectivity and firewall rules
- For local MySQL: Ensure MySQL container is healthy: `docker compose ps mysql`

---

## 📚 Additional Resources

### API Documentation
- Import `HealthMate-API.postman_collection.json` into Postman for API testing
- Use `api-tests.http` for HTTP client testing in IntelliJ/Rider

### Development
- Backend API base URL: `http://localhost:8080/api`
- Frontend dev server: `http://localhost:3000`
- Backend Spring Boot admin: Check logs for startup information

### Database
- MySQL port (if using local): `3307` (mapped to container port `3306`)
- Database name: `5620` (configured in docker-compose.yml)

---

