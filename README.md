# 🧬 Akram Biology — Full Stack Web App

**Node.js + Express + MongoDB + EJS**

Offline tuition website for Akram Biology, Malda, West Bengal.

---

## 📁 Project Structure

```
akram-biology/
├── server.js              ← Main entry point
├── package.json
├── .env.example           ← Copy to .env and fill in your values
├── config/
│   ├── db.js              ← MongoDB connection + seed data
│   └── mailer.js          ← Nodemailer email helper
├── middleware/
│   └── auth.js            ← Admin session protection
├── models/
│   └── index.js           ← Student, Batch, Contact, Admin schemas
├── routes/
│   ├── public.js          ← Home, Enroll, Contact routes
│   └── admin.js           ← All /admin/* routes
├── views/
│   ├── home.ejs           ← Homepage
│   ├── enroll.ejs         ← Enrollment form page
│   ├── 404.ejs
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   └── admin/
│       ├── login.ejs
│       ├── dashboard.ejs
│       ├── students.ejs
│       ├── student-detail.ejs
│       ├── batches.ejs
│       ├── messages.ejs
│       ├── layout-start.ejs
│       └── layout-end.ejs
└── public/
    ├── css/
    │   ├── style.css      ← Public website styles
    │   └── admin.css      ← Admin panel styles
    └── js/                ← (add custom scripts here)
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js v18+ installed
- MongoDB running locally OR MongoDB Atlas URI

### 2. Install dependencies
```bash
cd akram-biology
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/akram_biology

ADMIN_USERNAME=akram
ADMIN_PASSWORD=biology@2025    # CHANGE THIS!

EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_app_password   # Gmail App Password (not regular password)

WHATSAPP_NUMBER=919876543210   # Your WhatsApp number with country code
```

### 4. Run the app
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 5. Open in browser
- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login

---

## 🔐 Default Admin Credentials
```
Username: akram
Password: biology@2025
```
> ⚠️ Change the password in `.env` before going live!

---

## 📧 Gmail Email Setup
1. Go to Google Account → Security → 2-Step Verification (enable it)
2. Then go to **App Passwords**
3. Create an app password for "Mail"
4. Paste that 16-character password as `EMAIL_PASS` in `.env`

---

## 🌐 Features

### Public Website
- ✅ Homepage with hero, about, topics, schedule, testimonials, contact
- ✅ Enrollment form (saves to MongoDB)
- ✅ Contact/enquiry form
- ✅ Dynamic batch listing from database
- ✅ Floating WhatsApp button

### Admin Panel (`/admin`)
- ✅ Secure login with bcrypt + sessions
- ✅ Dashboard with live stats
- ✅ Students list with search + filter by status/class
- ✅ Student detail page — update status, fee status, notes
- ✅ WhatsApp quick-action links
- ✅ Batch management — add, activate/deactivate, delete
- ✅ Messages inbox from contact form
- ✅ Email notifications on new enrollment

---

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Templates | EJS |
| Auth | express-session + bcryptjs |
| Email | Nodemailer (Gmail) |
| Styling | Custom CSS (biology green theme) |

---

## 📞 Deployment (Free Options)
- **Railway.app** — Connect GitHub repo, add env vars, deploy in 2 clicks
- **Render.com** — Free tier, add MongoDB Atlas URI
- **MongoDB Atlas** — Free 512MB cloud MongoDB

---

Made with 🧬 for Akram Biology Tuition, Malda, West Bengal
