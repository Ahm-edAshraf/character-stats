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
    ninjutsu: Number,
    taijutsu: Number,
    genjutsu: Number,
    health: Number,
    strength: Number,
    speed: Number,
    stamina: Number,
    handSeals: Number,
    technique: String,
    backstory: String,
    inventory: [inventoryItemSchema],
    skills: [skillSchema]
}, {
    timestamps: true
});

const Character = mongoose.model('Character', characterSchema);
module.exports = Character;
