const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.send('CampusRunner API is running...');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = { app, server };
