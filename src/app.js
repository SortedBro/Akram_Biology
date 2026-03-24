const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');

const env = require('./config/env');
const viewLocals = require('./middleware/viewLocals');
const { csrfValidate, csrfViewToken } = require('./middleware/csrfProtection');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.set('layout', 'layout');

app.use(expressLayouts);
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(cookieParser());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(methodOverride('_method'));
app.use(mongoSanitize());
app.use(hpp());

app.use(
  session({
    name: 'akram.sid',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    },
    store: MongoStore.create({
      mongoUrl: env.mongoUri,
      ttl: 7 * 24 * 60 * 60
    })
  })
);

app.use(flash());
app.use(csrfValidate);
app.use(csrfViewToken);
app.use(viewLocals);

app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
