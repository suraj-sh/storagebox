require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const { logger } = require('./middlewere/logEvents');
const cors = require('cors');
const socketIo = require('socket.io');
const corsOptions = require('./config/corsOptions');
const errorhandler = require('./middlewere/errorHandler');
const verifyToken = require('./middlewere/verifyJWT');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;
const server = http.createServer(app);
const io = socketIo(server);

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

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, './client/dist/client/')));

// Connect to DB
connectDB();

// Routes
app.use('/public/document',express.static(__dirname+'/public/document'))
app.use('/public/upload',express.static(__dirname + '/public/upload'));
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/logout',require('./routes/logout'));
app.use('/refresh', require('./routes/refreshToken'));
app.use('/storage', require('./routes/api/storage'));
app.use(verifyToken);
app.use('/user',require('./routes/api/user'));
app.use('/chat',require('./routes/chat'));

// Define a catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

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

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
    // Handle custom events
    socket.on('customEvent', (data) => {
        console.log('Received data:', data);
        // Broadcast the data to all connected clients
        io.emit('customEvent', data);
    });
});



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

