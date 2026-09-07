require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const groupsRoutes = require('./routes/groups.routes');
const invitationsRoutes = require('./routes/invitations.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'fairshare-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/invitations', invitationsRoutes);

// 404 for anything else under /api
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// centralized error handler (in case a route forgets its own try/catch)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FairShare API listening on http://localhost:${PORT}`);
});
