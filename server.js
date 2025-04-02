const path = require('path');  
const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const { promisify } = require('util');
const app = express();
const port = process.env.PORT || 3000;

// Add CORS configuration HERE (right after app initialization)
app.use(cors({
    origin: 'http://localhost', // For development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }));

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Now works with path imported

//app.use(express.static(path.join(__dirname, 'public')));


const multer = require('multer');

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // Save in "uploads" folder
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// registration endpoints
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
                else resolve(this);
            });
        });

        if (!result.lastID) throw new Error('Database insert failed');

        res.status(200).json({
            message: 'Registration successful',
            memberId: result.lastID,
            profileImage: profileImage
        });

    } catch (error) {
        res.status(500).json({ error: 'Database operation failed' });
    }
});



// Get members endpoint
app.use('/uploads', express.static('uploads'));

// Get members endpoint (fetches member data including profile images)
app.get('/api/members', async (req, res) => {
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
        res.status(500).json({ 
            error: 'Failed to retrieve member records' 
        });
    }
});






// Validation functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone); // Adjust based on your phone number requirements
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ 
        error: 'An unexpected error occurred', 
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});