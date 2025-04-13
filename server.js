const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const { promisify } = require('util');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbGet = promisify(db.get.bind(db));

// Middleware
app.use(cors({
    origin: 'http://localhost', // For development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Session setup — must be placed BEFORE any routes
app.use(session({
    secret: 'your_super_secret_key', // Use a secure value in production
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =========================
// File Upload Configuration
// =========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =========================
// Registration Endpoint
// =========================
app.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const { memberName, email, phone, businessDetails } = req.body;
        const profileImage = req.file ? req.file.filename : null;

        if (!memberName || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone are required' });
        }
        
        const sql = `INSERT INTO members (memberName, email, phone, businessDetails, profileImage) VALUES (?, ?, ?, ?, ?)`;
        const params = [memberName, email, phone, businessDetails || null, profileImage];

        const result = await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this); // 'this' contains 'lastID'
            });
        });
        
        res.status(200).json({
            message: 'Registration successful',
            memberId: result.lastID,
            profileImage: profileImage
        });
        
    } catch (error) {
        console.error('Registration error:', error.message); // logs message
        console.error(error); // logs full stack
        res.status(500).json({ error: 'Database operation failed', details: error.message });
    }
    
    
});

// =========================
// Login Route
// =========================
app.post('/login', async (req, res) => {
    const { exeEmailId, password } = req.body;

    try {
        const row = await dbGet('SELECT * FROM auth_executive_tbl WHERE exeEmailId = ?', [exeEmailId]);

        if (!row) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, row.password);

        if (isMatch) {
            req.session.user = {
                id: row.id,
                exeEmailId: row.exeEmailId,
                exeName: row.exeName
            };
            res.status(200).send('Login successful');
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Error verifying password');
    }
});

// =========================
// Logout Route (Destroy session)
// =========================
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.redirect('/login.html'); // Redirect to login page
    });
});

// =========================
// Authentication Middleware
// =========================
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next(); // User is authenticated
    } else {
        res.status(401).json({ error: 'Unauthorized' }); // User not authenticated
    }
}

// =========================
// Get Members (Protected)
// =========================
app.get('/api/members', isAuthenticated, async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM members');

        const members = rows.map(member => ({
            ...member,
            registrationDate: new Date(member.registrationDate).toISOString(),
            profileImage: member.profileImage
                ? `${req.protocol}://${req.get('host')}/uploads/${member.profileImage}`
                : null
        }));

        res.json(members);
    } catch (error) {
        console.error('Members fetch error:', error);
        res.status(500).json({ error: 'Failed to retrieve member records' });
    }
});

// =========================
// Auth Check (Client-side Check)
// =========================
app.get('/api/check-auth', (req, res) => {
    if (req.session && req.session.user) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// =========================
// Global Error Handler
// =========================
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// =========================
// Start Server
// =========================
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
