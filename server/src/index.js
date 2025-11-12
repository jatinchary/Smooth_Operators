import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';

dotenv.config();

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false // Customize CSP as needed for your app
  })
);

// CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api', healthRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (no stack traces to clients)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err); // Avoid logging PII
  res.status(500).json({ error: 'Internal server error' });
});

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});


