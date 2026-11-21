# 🎓 Enterprise Student Management & Leaderboard System

A production-grade, end-to-end full-stack Student Management System built in a clean monorepo architecture with a high-performance **Spring Boot 3.x** backend and an **Expo / React Native (TypeScript)** mobile frontend.

---

## 🏛️ System Architecture

```
Full_Stack_Final_Project/
├── docker-compose.yml              # 1-command PostgreSQL 16 container setup
├── README.md                       # Comprehensive system guide & API reference
│
├── backend/                        # Java 17+, Spring Boot 3.2.x, Spring Security, JPA
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd             # Self-contained Maven Wrappers
│   └── src/main/
│       ├── resources/
│       │   └── application.yml     # Database, HikariCP, and JWT settings
│       └── java/com/studentmanagement/
│           ├── StudentManagementApplication.java
│           ├── config/             # SecurityConfig, JwtService, JwtAuthenticationFilter, DataSeeder
│           ├── controller/         # AuthController, LeaderboardController, StudentController
│           ├── dto/                # Request & Response contracts, ErrorResponse
│           ├── entity/             # User, StudentProfile, PointTransaction, Role
│           ├── exception/          # GlobalExceptionHandler (@RestControllerAdvice), Custom exceptions
│           ├── repository/         # UserRepository, StudentProfileRepository, PointTransactionRepository
│           └── service/            # AuthService, LeaderboardService, StudentService, UserDetailsService
│
└── frontend/                       # React Native (Expo SDK 51), TypeScript, Redux Toolkit
    ├── package.json
    ├── app.json
    ├── tsconfig.json
    ├── .env.example / .env         # Backend API host configuration
    ├── App.tsx                     # Root providers (Redux, Theme, SafeArea, Navigation)
    └── src/
        ├── api/                    # Axios client, SecureStore JWT interceptor, 401 handling
        ├── components/             # ThemeToggleSwitch, AwardPointsModal, StatCard, LeaderboardItemRow
        ├── context/                # ThemeContext (Day/Night mode persisted in AsyncStorage)
        ├── navigation/             # RootNavigator, AuthNavigator, AppNavigator (Role-based)
        ├── screens/                # LoginScreen, RegisterScreen, StudentDashboardScreen, TeacherLeaderboardScreen
        ├── store/                  # Redux Toolkit store, authSlice, leaderboardSlice
        └── types/                  # Shared TypeScript interfaces & types
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Docker** and **Docker Compose**
- **Java 17+** (JDK 17 or higher)
- **Node.js 18+** & **npm**

---

### 2. Start PostgreSQL Database
Run the provided Docker Compose file from the repository root:
```bash
docker-compose up -d
```
*This launches PostgreSQL 16 on port `5432` with database `student_db`, user `postgres`, and password `postgres`.*

---

### 3. Run the Spring Boot Backend
Navigate into `backend/` and run using the Maven wrapper:

**On Windows (PowerShell / Command Prompt):**
```cmd
cd backend
.\mvnw.cmd spring-boot:run
```

**On macOS / Linux:**
```bash
cd backend
chmod +x ./mvnw
./mvnw spring-boot:run
```

Upon startup, the `DataSeeder` automatically initializes:
- **1 Faculty/Teacher account** (`teacher@school.com`)
- **12 Sample Student accounts** (`hermione@school.com`, `harry@school.com`, etc.) with varied points for pagination testing
- **Initial point award transactions**

Backend health & API base URL: `http://localhost:8080/api/v1`

---

### 4. Launch the Expo Mobile Frontend
Navigate into `frontend/`:
```bash
cd frontend
npm install
```

#### Network Configuration (`frontend/.env`):
- **Web Browser or Desktop:** Keep default `EXPO_PUBLIC_API_URL=http://localhost:8080`
- **Android Studio Emulator:** Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`
- **Physical Mobile Device (Expo Go via LAN):** Set your machine's local Wi-Fi IP address (e.g., `EXPO_PUBLIC_API_URL=http://192.168.1.105:8080`).

Start the Expo development server:
```bash
npm start
```
- Press **`w`** in the terminal to launch directly in your web browser.
- Or scan the QR code with **Expo Go** on your iOS or Android phone!

---

## 🔑 Demo Credentials

All seeded accounts share the password: **`Password123!`**

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **TEACHER** | `teacher@school.com` | `Password123!` | Prof. Minerva McGonagall (Can adjust points with audit reasons) |
| **STUDENT** | `hermione@school.com` | `Password123!` | Rank #1 (250 pts) |
| **STUDENT** | `harry@school.com` | `Password123!` | Rank #2 (210 pts) |
| **STUDENT** | `ron@school.com` | `Password123!` | Rank #3 (185 pts) |
| **STUDENT** | `draco@school.com` | `Password123!` | Rank #4 (175 pts) |
| **STUDENT** | `luna@school.com` | `Password123!` | Rank #5 (160 pts) |

*(Quick one-click login chips are provided on the Login screen for instant testing!)*

---

## 🛡️ Security, RBAC & Business Rules

1. **Stateless JWT Authentication:**
   - Tokens are signed with HMAC-SHA256 (`app.jwt.secret`) and verified via `JwtAuthenticationFilter`.
   - Client automatically persists token in **`expo-secure-store`** and attaches it to all requests via Axios interceptors.
   - On `401 Unauthorized`, client clears credentials and routes user back to the login screen.

2. **Role-Based Access Control (RBAC):**
   - **`STUDENT` View:** Access to personal profile (`/api/v1/students/me`) and peer leaderboard (`/api/v1/leaderboard`). Point adjustment UI controls are strictly hidden.
   - **`TEACHER` View:** Access to leaderboard with interactive **Award / Adjust Points** modal. Endpoint `POST /api/v1/students/{studentId}/points` is guarded by `@PreAuthorize("hasRole('TEACHER')")`.

3. **Deterministic Tie-Breaking & Ranking:**
   - Students with identical scores are ordered deterministically by `updatedAt ASC`, then by `id ASC`.
   - Accurate global rank calculation:
     $$\text{rank} = \text{page} \times \text{size} + \text{index} + 1$$
   - Point awards instantly update and re-sort the local Redux state for fluid, zero-latency UI re-ranking.

---

## 📡 REST API Reference

### Public Authentication Endpoints
#### 1. Register User
`POST /api/v1/auth/register`
```json
{
  "fullName": "New Student",
  "email": "student@school.com",
  "password": "Password123!",
  "role": "STUDENT"
}
```
*Automatically initializes `StudentProfile` with `0` points.*

#### 2. Login
`POST /api/v1/auth/login`
```json
{
  "email": "teacher@school.com",
  "password": "Password123!"
}
```

### Protected Endpoints
#### 3. Get Paginated Leaderboard
`GET /api/v1/leaderboard?page=0&size=10&sortBy=totalPoints&direction=DESC`
- Headers: `Authorization: Bearer <token>`
- Response:
```json
{
  "items": [
    {
      "studentId": 1,
      "userId": 2,
      "fullName": "Hermione Granger",
      "email": "hermione@school.com",
      "totalPoints": 250,
      "rank": 1,
      "updatedAt": "2026-11-04T14:53:15Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 12,
  "totalPages": 2,
  "last": false
}
```

#### 4. Get Current Student Profile & Audit History
`GET /api/v1/students/me`
- Headers: `Authorization: Bearer <token>` (Student role only)
- Response:
```json
{
  "studentId": 1,
  "userId": 2,
  "fullName": "Hermione Granger",
  "email": "hermione@school.com",
  "totalPoints": 250,
  "rank": 1,
  "updatedAt": "2026-11-04T14:53:15Z",
  "recentTransactions": [
    {
      "id": 1,
      "pointsDelta": 250,
      "reason": "Exemplary performance in Advanced Arithmancy",
      "awardedByName": "Prof. Minerva McGonagall",
      "awardedByEmail": "teacher@school.com",
      "createdAt": "2026-11-04T14:53:15Z"
    }
  ]
}
```

#### 5. Award / Adjust Points (Teacher Only)
`POST /api/v1/students/{studentId}/points`
- Headers: `Authorization: Bearer <token>` (Teacher role only)
- Request Body:
```json
{
  "pointsDelta": 20,
  "reason": "Outstanding project presentation on Quantum Optics"
}
```

---

## 🎨 Design System & Theme Engine
- **Day (Light) & Night (Dark) Modes:** Color palettes configured for optimal contrast, accessible typography, and intuitive rank medals (🥇 Gold, 🥈 Silver, 🥉 Bronze).
- **Persistent Preferences:** The user's theme selection is stored locally via `@react-native-async-storage/async-storage` and restored on app boot.
