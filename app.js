// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ahmed:Ah@med1215$@waste-mgmt.viyfl.mongodb.net/?retryWrites=true&w=majority&appName=waste-mgmt';

// DOM Elements
const authContainer = document.getElementById('auth-container');
const statsContainer = document.getElementById('stats-container');
const adminContainer = document.getElementById('admin-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if (user.email === 'admin123') {
            showAdminPanel();
        } else {
            showStatsPanel();
            loadCharacter();
        }
    }
});

// Toggle between login and register forms
function toggleForms() {
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
}

// Login function
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email === 'admin123' && password === 'admin12345') {
        localStorage.setItem('user', JSON.stringify({ email: 'admin123' }));
        showAdminPanel();
        return;
    }

    try {
        // Here you would typically make an API call to verify credentials
        // For now, we'll just store the email in localStorage
        localStorage.setItem('user', JSON.stringify({ email }));
        showStatsPanel();
        loadCharacter();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Register function
async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        // Here you would typically make an API call to create a new user
        localStorage.setItem('user', JSON.stringify({ email }));
        showStatsPanel();
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// Show stats panel
function showStatsPanel() {
    authContainer.classList.add('hidden');
    adminContainer.classList.add('hidden');
    statsContainer.classList.remove('hidden');
}

// Show admin panel
function showAdminPanel() {
    authContainer.classList.add('hidden');
    statsContainer.classList.add('hidden');
    adminContainer.classList.remove('hidden');
    loadAllCharacters();
}

// Load character data
async function loadCharacter() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        // Here you would typically fetch character data from the database
        const savedCharacter = localStorage.getItem(`character_${user.email}`);
        if (savedCharacter) {
            const character = JSON.parse(savedCharacter);
            populateCharacterForm(character);
        }
    } catch (error) {
        alert('Failed to load character: ' + error.message);
    }
}

// Save character data
async function saveCharacter() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const character = {
        name: document.getElementById('char-name').value,
        role: document.getElementById('char-role').value,
        gender: document.getElementById('char-gender').value,
        age: document.getElementById('char-age').value,
        class: document.getElementById('char-class').value,
        level: document.getElementById('char-level').value,
        ninjutsu: document.getElementById('char-ninjutsu').value,
        taijutsu: document.getElementById('char-taijutsu').value,
        genjutsu: document.getElementById('char-genjutsu').value,
        health: document.getElementById('char-health').value,
        strength: document.getElementById('char-strength').value,
        speed: document.getElementById('char-speed').value,
        stamina: document.getElementById('char-stamina').value,
        handSeals: document.getElementById('char-hand-seals').value,
        technique: document.getElementById('char-technique').value,
        backstory: document.getElementById('char-backstory').value,
        inventory: getInventoryItems(),
        skills: getSkillItems()
    };

    try {
        // Here you would typically save to the database
        localStorage.setItem(`character_${user.email}`, JSON.stringify(character));
        alert('Character saved successfully!');
    } catch (error) {
        alert('Failed to save character: ' + error.message);
    }
}

// Populate character form with data
function populateCharacterForm(character) {
    document.getElementById('char-name').value = character.name || '';
    document.getElementById('char-role').value = character.role || '';
    document.getElementById('char-gender').value = character.gender || '';
    document.getElementById('char-age').value = character.age || '';
    document.getElementById('char-class').value = character.class || '';
    document.getElementById('char-level').value = character.level || '';
    document.getElementById('char-ninjutsu').value = character.ninjutsu || '';
    document.getElementById('char-taijutsu').value = character.taijutsu || '';
    document.getElementById('char-genjutsu').value = character.genjutsu || '';
    document.getElementById('char-health').value = character.health || '';
    document.getElementById('char-strength').value = character.strength || '';
    document.getElementById('char-speed').value = character.speed || '';
    document.getElementById('char-stamina').value = character.stamina || '';
    document.getElementById('char-hand-seals').value = character.handSeals || '';
    document.getElementById('char-technique').value = character.technique || '';
    document.getElementById('char-backstory').value = character.backstory || '';

    // Populate inventory and skills
    const inventoryList = document.getElementById('inventory-list');
    const skillsList = document.getElementById('skills-list');
    
    inventoryList.innerHTML = '';
    skillsList.innerHTML = '';

    character.inventory?.forEach(item => {
        addInventoryItemToDOM(item.name, item.description);
    });

    character.skills?.forEach(skill => {
        addSkillItemToDOM(skill.name, skill.description);
    });
}

// Inventory management
function addInventoryItem() {
    const name = document.getElementById('new-item').value;
    const description = document.getElementById('new-item-desc').value;
    
    if (name && description) {
        addInventoryItemToDOM(name, description);
        document.getElementById('new-item').value = '';
        document.getElementById('new-item-desc').value = '';
    }
}

function addInventoryItemToDOM(name, description) {
    const inventoryList = document.getElementById('inventory-list');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-card flex justify-between items-center p-2 rounded-md';
    itemDiv.innerHTML = `
        <div>
            <strong>${name}</strong>: ${description}
        </div>
        <button onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">×</button>
    `;
    inventoryList.appendChild(itemDiv);
}

function getInventoryItems() {
    const items = [];
    document.querySelectorAll('#inventory-list .item-card').forEach(item => {
        const [name, description] = item.querySelector('div').textContent.split(': ');
        items.push({ name: name.trim(), description: description.trim() });
    });
    return items;
}

// Skills management
function addSkill() {
    const name = document.getElementById('new-skill').value;
    const description = document.getElementById('new-skill-desc').value;
    
    if (name && description) {
        addSkillItemToDOM(name, description);
        document.getElementById('new-skill').value = '';
        document.getElementById('new-skill-desc').value = '';
    }
}

function addSkillItemToDOM(name, description) {
    const skillsList = document.getElementById('skills-list');
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-card flex justify-between items-center p-2 rounded-md';
    skillDiv.innerHTML = `
        <div>
            <strong>${name}</strong>: ${description}
        </div>
        <button onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">×</button>
    `;
    skillsList.appendChild(skillDiv);
}

function getSkillItems() {
    const skills = [];
    document.querySelectorAll('#skills-list .skill-card').forEach(skill => {
        const [name, description] = skill.querySelector('div').textContent.split(': ');
        skills.push({ name: name.trim(), description: description.trim() });
    });
    return skills;
}

// Admin functions
async function loadAllCharacters() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    // Get all items from localStorage that start with 'character_'
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('character_')) {
            const email = key.replace('character_', '');
            const character = JSON.parse(localStorage.getItem(key));
            
            const characterDiv = document.createElement('div');
            characterDiv.className = 'bg-gray-700 p-4 rounded-md';
            characterDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold">${character.name || 'Unnamed'}</h3>
                    <span class="text-gray-400">${email}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>Level: ${character.level || 'N/A'}</div>
                    <div>Class: ${character.class || 'N/A'}</div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Ninjutsu: ${character.ninjutsu || '0'}</div>
                    <div>Taijutsu: ${character.taijutsu || '0'}</div>
                    <div>Genjutsu: ${character.genjutsu || '0'}</div>
                    <div>Health: ${character.health || '0'}</div>
                    <div>Strength: ${character.strength || '0'}</div>
                    <div>Speed: ${character.speed || '0'}</div>
                    <div>Stamina: ${character.stamina || '0'}</div>
                    <div>Hand Seals: ${character.handSeals || '0'}</div>
                </div>
                <div class="mt-2">
                    <button onclick="viewCharacterDetails('${email}')" class="text-blue-400 hover:text-blue-500">View Details</button>
                    <button onclick="deleteCharacter('${email}')" class="text-red-400 hover:text-red-500 ml-2">Delete</button>
                </div>
            `;
            userList.appendChild(characterDiv);
        }
    }
}

function viewCharacterDetails(email) {
    const character = JSON.parse(localStorage.getItem(`character_${email}`));
    if (!character) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">${character.name}'s Details</h2>
                <button onclick="this.closest('.fixed').remove()" 
                        class="text-gray-400 hover:text-white">×</button>
            </div>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>Role: ${character.role}</div>
                    <div>Class: ${character.class}</div>
                    <div>Level: ${character.level}</div>
                    <div>Gender: ${character.gender}</div>
                    <div>Age: ${character.age}</div>
                </div>
                
                <div class="border-t border-gray-700 pt-4">
                    <h3 class="font-semibold mb-2">Stats</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>Strength: ${character.strength}</div>
                        <div>Health: ${character.health}</div>
                        <div>Speed: ${character.speed}</div>
                        <div>Stamina: ${character.stamina}</div>
                        <div>Cursed Energy: ${character.cursedEnergy}</div>
                        <div>Intelligence: ${character.intelligence}</div>
                        <div>Technique: ${character.technique}</div>
                    </div>
                </div>
                
                <div class="border-t border-gray-700 pt-4">
                    <h3 class="font-semibold mb-2">Back Story</h3>
                    <p>${character.backstory}</p>
                </div>
                
                <div class="border-t border-gray-700 pt-4">
                    <h3 class="font-semibold mb-2">Inventory</h3>
                    <div class="space-y-2">
                        ${character.inventory?.map(item => `
                            <div class="bg-gray-700 p-2 rounded">
                                <strong>${item.name}</strong>: ${item.description}
                            </div>
                        `).join('') || 'No items'}
                    </div>
                </div>
                
                <div class="border-t border-gray-700 pt-4">
                    <h3 class="font-semibold mb-2">Skills/Techniques</h3>
                    <div class="space-y-2">
                        ${character.skills?.map(skill => `
                            <div class="bg-gray-700 p-2 rounded">
                                <strong>${skill.name}</strong>: ${skill.description}
                            </div>
                        `).join('') || 'No skills'}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
