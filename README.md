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

## 🚀 快速开始 (Quick Start)

### 首次下载/解压后的构建步骤

如果你刚刚从 GitHub 下载并解压了这个项目，请按照以下步骤操作：

#### 方法一：使用构建脚本（推荐）✨

```bash
# 1. 为构建脚本添加执行权限
chmod +x build.sh

# 2. 运行构建脚本（会自动构建后端并启动 Docker）
./build.sh
```

构建脚本会自动完成：
- ✅ 构建后端 JAR 文件
- ✅ 检查 Docker 环境
- ✅ 启动所有 Docker 服务

#### 方法二：手动构建步骤

如果你更喜欢手动操作，按以下步骤：

```bash
# 1. 进入后端目录
cd backend

# 2. 为 Maven Wrapper 添加执行权限
chmod +x mvnw

# 3. 构建 Maven 项目（生成 JAR 文件）
./mvnw clean package -DskipTests

# 4. 返回项目根目录
cd ..

# 5. 启动 Docker Compose 服务
docker compose up -d
```

#### 验证服务是否正常运行

```bash
# 查看所有服务状态
docker compose ps

# 查看后端日志（确认是否启动成功）
docker compose logs backend --tail 50

# 应该看到类似 "Started BackendApplication" 的日志
```

#### 访问服务

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:8080

#### 常用命令

```bash
# 停止所有服务
docker compose down

# 重启所有服务
docker compose restart

# 查看实时日志
docker compose logs -f

# 只查看后端日志
docker compose logs -f backend

# 停止并删除所有容器和网络
docker compose down -v
```

#### 常见问题

**问题**: Docker 容器显示 "Restarting" 状态或报错 "Invalid or corrupt jarfile"

**原因**: 没有先构建后端 JAR 文件就启动了 Docker

**解决**: 按照上面的步骤先构建后端，然后再启动 Docker

---

