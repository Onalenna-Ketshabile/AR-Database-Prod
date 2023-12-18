const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const session = require('express-session'); // Add express-session for session management
const SequelizeStore = require('connect-session-sequelize')(session.Store);

dotenv.config();
app.use(cors({
    // origin: 'http://localhost:3000',// need to change this
    // methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Enable credentials (cookies) in cross-origin requests
  }));
app.use(express.json());
app.use(morgan('dev'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'Onalenna@HardisGood!!', // Use a secret for session data encryption
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    sameSite: 'Lax',
    maxAge: 1000 * 60 * 60 * 24, // Session duration in milliseconds (1 day in this example)
  },
  credentials: true,
}));





const db = require('./models');
const taxiRankRouter = require('./routes/TaxiRanks');
const taxiPaths = require('./routes/TaxiPaths');
const authentication = require('./routes/Authentication');

app.use('/taxiranks', taxiRankRouter);
app.use('/routes', taxiPaths);
app.use('/authentication', authentication);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;


db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
    
  });
});

app.get('/', (req,res) => res.json("After Roboto API Running..."))
