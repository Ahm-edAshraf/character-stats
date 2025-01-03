const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    securityQuestion: {
        type: String,
        required: true,
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
        required: true
    },
    resetToken: String,
    resetTokenExpiry: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
