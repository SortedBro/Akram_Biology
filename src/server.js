const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');
const bootstrapAdmin = require('./services/bootstrapAdmin');

async function start() {
  try {
    await connectDatabase();
    await bootstrapAdmin();

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`${env.appName} running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

start();
