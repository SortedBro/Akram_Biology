# Akram Bio-Care (Production-Grade)

This project is a production-ready conversion of a static `index.html` into a full stack application using:

- Node.js
- Express.js
- MongoDB (Mongoose)
- EJS templates

## Features

- Public pages:
  - Home page with active batch listing
  - Class-wise notes page
  - Enrollment form (stored in MongoDB)
  - Contact form (stored in MongoDB)
- Admin panel:
  - Secure login/logout using session auth
  - Students CRUD
  - Batches CRUD
  - Fees CRUD
  - Chapter management
  - Notes file upload (PDF/Image)
  - Contact messages read/delete
  - Enrollment status management
- Production hardening:
  - Helmet
  - Rate limiting
  - Mongo sanitization
  - XSS clean + HPP
  - CSRF protection
  - Flash messages + central error handler

## Project Structure

```
.
|-- public/
|   |-- css/main.css
|   |-- js/main.js
|   `-- uploads/
|-- scripts/seedAdmin.js
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   `-- utils/
|-- views/
|   |-- admin/
|   |-- public/
|   |-- partials/
|   `-- errors/
|-- .env.example
`-- package.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Update `.env` values:

- `MONGO_URI`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

4. Seed admin user:

```bash
npm run seed:admin
```

5. Run app:

```bash
npm run dev
```

Open:

- Public: `http://localhost:5000/`
- Notes: `http://localhost:5000/notes`
- Admin Login: `http://localhost:5000/admin/login`

## Production Run

```bash
NODE_ENV=production npm start
```

## Notes

- Uploaded files are served from `public/uploads`.
- In production, put app behind Nginx/Load Balancer and enable HTTPS.
- Use managed MongoDB backups for safety.
