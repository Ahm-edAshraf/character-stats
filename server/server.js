const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config');
const User = require('./models/User');
const Character = require('./models/Character');
const { protect, admin } = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins temporarily for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
connectDB();

// Create admin user if it doesn't exist
const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin123' });
        if (!adminExists) {
            await User.create({
                email: 'admin123',
                password: 'admin12345',
                isAdmin: true
            });
            console.log('Admin user created');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};
createAdminUser();

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, securityQuestion, securityAnswer } = req.body;

        // Validate required fields
        if (!email || !password || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ 
                message: 'All fields are required: email, password, securityQuestion, and securityAnswer' 
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            securityQuestion,
            securityAnswer
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Character Routes
app.post('/api/characters', protect, async (req, res) => {
    try {
        const character = new Character({
            ...req.body,
            user: req.user._id
        });
        const savedCharacter = await character.save();
        res.status(201).json(savedCharacter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/characters', protect, async (req, res) => {
    try {
        const character = await Character.findOne({ user: req.user._id });
        res.json(character || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/characters/:id', protect, async (req, res) => {
    try {
        const character = await Character.findById(req.params.id).populate('user', 'email');
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }
        // Allow access if user is admin or if it's their own character
        if (req.user.isAdmin || character.user._id.toString() === req.user._id.toString()) {
            res.json(character);
        } else {
            res.status(401).json({ message: 'Not authorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/characters/:id', protect, async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }

        if (character.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedCharacter = await Character.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedCharacter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Routes
app.get('/api/admin/characters', protect, admin, async (req, res) => {
    try {
        const characters = await Character.find().populate('user', 'email');
        res.json(characters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/admin/characters/:id', protect, admin, async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }

        await Character.findByIdAndDelete(req.params.id);
        res.json({ message: 'Character deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/reset-request', async (req, res) => {
    try {
        const { email, securityQuestion, securityAnswer } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.securityQuestion || !user.securityAnswer) {
            return res.status(400).json({ message: 'Security question not set up for this account' });
        }

        if (user.securityQuestion !== securityQuestion || user.securityAnswer !== securityAnswer) {
            return res.status(401).json({ message: 'Incorrect security answer' });
        }

        // Generate a temporary reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        res.json({ resetToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        
        const user = await User.findOne({
            _id: decoded.id,
            resetToken,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
