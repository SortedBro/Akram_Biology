require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const MongoStore     = require('connect-mongo');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const path           = require('path');
const connectDB      = require('./config/db');

const app = express();

// ─── DB ───────────────────────────────────────────────────────
connectDB();

// ─── VIEW ENGINE ─────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'akram_biology_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/akram_biology',
    ttl: 60 * 60 * 24  // 1 day
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(flash());

// Flash + session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────
app.use('/',      require('./routes/public'));
app.use('/admin', require('./routes/admin'));
app.get('/alive',(req,res)=>{
  res.json({m:"this is text."})
})

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: '404 — Page Not Found' });
});

// ─── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌿 Akram Biology running on http://localhost:${PORT}`);
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin/login`);
});
