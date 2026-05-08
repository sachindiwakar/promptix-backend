# PromptixAI Backend

Backend API for PromptixAI built using Node.js, Express, Prisma, Neon PostgreSQL, Clerk Authentication, and AI integrations.

## Features

- REST API
- Clerk Authentication Middleware
- Prisma ORM
- Neon PostgreSQL Database
- Resume PDF Analysis
- AI Content Generation
- AI Image Tools
- Cloudinary Image Uploads
- Premium Subscription Validation

---

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- Neon PostgreSQL
- Clerk Express SDK
- Cloudinary
- OpenAI / Gemini API
- Multer
- PDF Parse

---

## Installation

Clone repository:

```bash
git clone <your-backend-repo-url>
```

Go to backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create `.env` file:

```env
DATABASE_URL=your_neon_database_url

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## Prisma Setup

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

---

## Run Development Server

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:3000
```

---

## API Routes

```bash
/api/user
/api/ai
```

---

## Folder Structure

```bash
backend/
 ├── config/
 ├── controllers/
 ├── middleware/
 ├── prisma/
 ├── routes/
 ├── server.js
```

---

## Deployment

Backend deployed using:

- Vercel

Database hosted on:

- Neon
