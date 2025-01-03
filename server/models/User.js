const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    securityQuestion: {
        type: String,
        required: [true, 'Security question is required'],
        enum: [
            'What was your first pet\'s name?',
            'What city were you born in?',
            'What is your mother\'s maiden name?',
            'What was the name of your first school?',
            'What is your favorite book?'
        ]
    },
    securityAnswer: {
        type: String,
        required: [true, 'Security answer is required'],
        trim: true,
        lowercase: true // Store in lowercase for case-insensitive comparison
    },
    resetToken: String,
    resetTokenExpiry: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    // Convert security answer to lowercase
    if (this.isModified('securityAnswer')) {
        this.securityAnswer = this.securityAnswer.toLowerCase().trim();
    }
    
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
