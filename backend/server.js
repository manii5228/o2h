const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const initDatabase = async () => {
  try {
    const tempPool = require('mysql2/promise').createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 2
    });
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await tempPool.end();

    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      try {
        await pool.execute(statement.trim());
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log('Schema statement skipped:', err.message.substring(0, 80));
        }
      }
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
};

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/milestones', require('./routes/milestoneRoutes'));
app.use('/api/time-entries', require('./routes/timeEntryRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/risks', require('./routes/riskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
