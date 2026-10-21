require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const resumesRoutes = require('./routes/resumes');
const recruiterRoutes = require('./routes/recruiter');
const savedJobsRoutes = require('./routes/savedJobs');
const companiesRoutes = require('./routes/companies');
const alertsRoutes = require('./routes/alerts');
const notificationsRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS origins in dev & prod
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin deployment)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HireSphere API Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// Check possible dist paths for client build
const possibleDistPaths = [
  path.resolve(__dirname, '../public'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
];
const clientDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`📦 Serving client production build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all for SPA client routing (React Router)
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('ℹ️ client/dist not detected. Running in pure API backend mode.');
  app.all('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
    }
    res.json({
      status: 'ok',
      service: 'HireSphere Backend API Server',
      message: 'Backend API is running live. Frontend build is loading or hosted separately.',
      endpoints: {
        health: '/api/health',
        jobs: '/api/jobs',
        companies: '/api/companies',
      },
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 HireSphere Server running on port ${PORT}`);
  console.log(`🔗 Local API: http://localhost:${PORT}/api`);
});
