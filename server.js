const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'barista_cafe',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Initialize database connection
async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Test connection
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Validation middleware
const validateBooking = [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
    body('people').isInt({ min: 1, max: 20 }).withMessage('Number of people must be between 1 and 20')
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Barista Cafe API is running' });
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Create new booking
app.post('/api/bookings', validateBooking, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phone, date, time, people, message } = req.body;
        
        // Check for existing booking at same time
        const [existingBookings] = await pool.execute(
            'SELECT COUNT(*) as count FROM bookings WHERE booking_date = ? AND booking_time = ?',
            [date, time]
        );

        if (existingBookings[0].count >= 5) { // Max 5 bookings per time slot
            return res.status(409).json({ 
                error: 'This time slot is fully booked. Please choose another time.' 
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO bookings (customer_name, phone, booking_date, booking_time, number_of_people, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, phone, date, time, people, message || '', 'pending']
        );

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: result.insertId
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM bookings WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const [result] = await pool.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// Get menu items
app.get('/api/menu', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM menu_items ORDER BY category, name'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});

// Get available time slots for a date
app.get('/api/available-slots/:date', async (req, res) => {
    try {
        const { date } = req.params;
        
        // Get existing bookings for the date
        const [bookings] = await pool.execute(
            'SELECT booking_time FROM bookings WHERE booking_date = ? AND status != "cancelled"',
            [date]
        );

        // Generate time slots (9:00 AM to 9:00 PM, every 30 minutes)
        const timeSlots = [];
        for (let hour = 9; hour <= 21; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const bookingCount = bookings.filter(b => b.booking_time === timeString).length;
                
                timeSlots.push({
                    time: timeString,
                    available: bookingCount < 5,
                    bookingsCount: bookingCount
                });
            }
        }

        res.json(timeSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
    await initDatabase();
    
    const HOST = process.env.HOST || '0.0.0.0';
    
    app.listen(PORT, HOST, () => {
        console.log(`Barista Cafe API server running on ${HOST}:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
        if (HOST === '0.0.0.0') {
            console.log(`Server is accessible from all network interfaces`);
        }
    });
}

startServer().catch(console.error);
