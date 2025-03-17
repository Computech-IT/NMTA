const path = require('path');  
const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const { promisify } = require('util');
const app = express();
const port = process.env.PORT || 3000;

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


// Registration endpoint
app.post('/register', async (req, res) => {
    try {
        const { memberName, email, phone, businessDetails } = req.body;

        // Validation
        if (!memberName || !email || !phone) {
            return res.status(400).json({ 
                error: 'All required fields (name, email, phone) must be provided' 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!validatePhone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Insert into database
        const result = await dbRun(
            `INSERT INTO members (memberName, email, phone, businessDetails)
             VALUES (?, ?, ?, ?)`,
            [memberName, email, phone, businessDetails || null]
        );

        res.status(201).json({
            success: true,
            memberId: result.lastID,
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('UNIQUE')) {
            return res.status(409).json({ 
                error: 'Email or phone number already exists in our system' 
            });
        }

        res.status(500).json({ 
            error: 'Internal server error during registration' 
        });
    }
});

// Get members endpoint
app.get('/api/members', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM members');
        const members = rows.map(member => ({
            ...member,
            registrationDate: new Date(member.registrationDate).toISOString()
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