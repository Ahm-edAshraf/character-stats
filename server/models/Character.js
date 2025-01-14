const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name: String,
    description: String
});

const skillSchema = new mongoose.Schema({
    name: String,
    description: String
});

const characterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: String,
    role: String,
    gender: String,
    age: Number,
    class: String,
    level: Number,
    strength: Number,
    health: Number,
    speed: Number,
    stamina: Number,
    cursedEnergy: {
        type: Number,
        alias: 'cursed-energy'
    },
    technique: Number,
    intelligence: Number,
    backstory: String,
    inventory: [inventoryItemSchema],
    skills: [skillSchema]
}, {
    timestamps: true
});

const Character = mongoose.model('Character', characterSchema);
module.exports = Character;
