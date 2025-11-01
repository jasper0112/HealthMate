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

## 🧾 File Structure Example
```
HealthMate/
│
├── docs/
│   ├── README.md
│   ├── Requirements/
│   ├── Architecture/
│   ├── UML_Diagrams/
│   └── Presentation/
│
├── src/
│   ├── frontend/
│   ├── backend/
│   └── llm_agent/
│
├── tests/
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** installed and running
- **Java 17+** (for building backend locally)
- **Maven** (or Maven Wrapper included in project)
- **Node.js 20+** (optional, for local frontend development)

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

---

