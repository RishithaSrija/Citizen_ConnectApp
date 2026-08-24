# CivicLink Full-Stack Express Backend Server

This is the Node.js + Express.js + TypeScript backend for **CivicLink – AI Powered Citizen Connect Platform**. It connects directly with the Next.js frontend, managing database records via Prisma ORM, utilizing Cloudinary for file storage, and integrating OpenAI GPT models for text and image vision inspection.

---

## Technical Architecture & Flow

```
   ┌────────────────────────────────────────────────┐
   │             Next.js Frontend (3000)             │
   └───────────────┬───────────────────▲────────────┘
                   │ /api/* rewrites   │ Socket.IO
                   ▼                   │ Push events
   ┌───────────────────────────────────┴────────────┐
   │             Express Backend (5000)             │
   └───────────────┬───────────────────▲────────────┘
                   │ Prisma Client     │ AI Summaries &
                   ▼                   │ Vision Analysis
   ┌───────────────────────────────┐ ┌─┴────────────┐
   │    PostgreSQL Database (DB)   │ │  OpenAI API  │
   └───────────────────────────────┘ └──────────────┘
```

---

## Technology Stack

- **Server Core:** Node.js, Express.js, TypeScript.
- **Database ORM:** PostgreSQL & Prisma ORM.
- **Security:** Helmet, CORS, Express-Rate-Limit.
- **Real-Time:** Socket.IO server pushing live update notifications.
- **AI Services:** OpenAI SDK (Text Classification and GPT-4 Vision).
- **Blob Storage:** Cloudinary SDK for file evidence uploads.
- **Documentation:** Swagger (OpenAPI 3.0) via `/api/docs`.

---

## Directory Layout

```
backend/
├── prisma/
│   ├── schema.prisma   # PostgreSQL prisma models definition
│   └── seed.ts         # Data seeder containing default accounts and departments
├── src/
│   ├── controllers/    # API Request handlers (auth, complaints, users, notifications)
│   ├── middleware/     # JWT Auth verifier and role validation guards
│   ├── routes/         # Router mounts matching API specifications
│   ├── services/       # Cloudinary file managers and OpenAI wrappers
│   ├── sockets/        # Socket.IO client-joining rooms utilities
│   ├── app.ts          # Main Express server root configuration
│   └── tsconfig.json   # TypeScript compilation definitions
├── Dockerfile          # Container specification
├── docker-compose.yml  # Local developer orchestration (Node + PostgreSQL)
└── README.md           # Setup and instructions guide
```

---

## Environment Variables (.env)

Define the following values in your `backend/.env` file:

```ini
PORT=5000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/citizenconnect?schema=public"
CLIENT_URL="http://localhost:3000"

JWT_SECRET="your-jwt-access-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

OPENAI_API_KEY="your-openai-api-key"
```

---

## Seeder Login Credentials

Run `npm run prisma:seed` to register the following default simulation accounts:

1. **Chief Administrator:**
   - **Email:** `admin@citizenconnect.gov`
   - **Password:** `admin123`
   - **Role:** `admin`

2. **Aria Sterling (Citizen):**
   - **Email:** `citizen@gmail.com`
   - **Password:** `citizen123`
   - **Role:** `citizen`

---

## Getting Started

### Method 1: Local Installation

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Run migrations and seed data:
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

*The Express API will serve on `http://localhost:5000`.*
*Verify Swagger Documentation at `http://localhost:5000/api/docs`.*

### Method 2: Docker Compose

1. Build and run backend + PostgreSQL:
   ```bash
   docker-compose up --build
   ```

---

## API Endpoints List

### Authentication
- `POST /api/auth/register` - Create citizen account
- `POST /api/auth/login` - Verify password, return access & refresh tokens and cookies
- `POST /api/auth/logout` - Invalidate tokens
- `POST /api/auth/refresh` - Generate new access tokens
- `POST /api/auth/forgot-password` - Request a password reset token
- `POST /api/auth/reset-password` - Set new password

### Complaints
- `POST /api/complaints` - Create a complaint (Image uploads to Cloudinary + AI Routing auto-applied)
- `GET /api/complaints` - Query list of complaints (filters automatically by user role)
- `GET /api/complaints/:id` - Fetch details of a single ticket
- `PUT /api/complaints/:id` - Edit status, priority, department, estimation timelines
- `DELETE /api/complaints/:id` - Administrator delete access

### AI Utilities
- `POST /api/ai/summarize` - Analyze text description (category, priority, department, 100-char summary)
- `POST /api/ai/image-analyze` - Vision image inspection for blurry/unrelated photos
- `POST /api/ai/chat` - Chatbot dialog with db retrieval fallback

### Notifications
- `GET /api/notifications` - Fetch user's status update notifications history
- `PUT /api/notifications` - Mark notification(s) as read
- `PATCH /api/notifications/:id` - Mark specific notification as read
