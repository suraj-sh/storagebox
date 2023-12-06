require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middlewere/logEvents');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const errorhandler = require('./middlewere/errorHandler');
const verifyToken = require('./middlewere/verifyJWT');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;


// Custom middleware
app.use(logger);

// Third-party middleware cross-origin resource sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for JSON
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// Connect to DB
connectDB();

// Routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refreshToken'));
app.use('/storage', require('./routes/api/storage'));
app.use(verifyToken);
app.use('/user',require('./routes/api/user'));


// 404 handler
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404 not found' });
    } else {
        res.type('txt').send('404 not found');
    }
});

// Overall error handling
app.use(errorhandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, (error) => {
        if (error) {
            console.error('Error starting the server:', error);
        } else {
            console.log(`Server running on port ${PORT}`);
        }
    });
});
