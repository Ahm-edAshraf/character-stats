// API URL - Change this to your deployed backend URL when deploying
const API_URL = 'https://character-stats-backend.onrender.com/api';

// Auth token management
function getToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.token : null;
}

function getHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// DOM Elements
const authContainer = document.getElementById('auth-container');
const statsContainer = document.getElementById('stats-container');
const adminContainer = document.getElementById('admin-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetForm = document.getElementById('reset-form');

// Show/Hide containers
function showStatsPanel() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('stats-container').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('stats-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    loadAllCharacters();
}

// Toggle between login and register forms
function toggleForms() {
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    resetForm.classList.toggle('hidden');
}

// Show/Hide forms
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('reset-form').style.display = 'none';
}

function showResetForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('reset-form').style.display = 'block';
}

// Login function
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        console.log('Attempting login with:', { email, password });
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('user', JSON.stringify(data));
        
        if (data.user && data.user.isAdmin) {
            console.log('Showing admin panel');
            showAdminPanel();
        } else {
            console.log('Showing stats panel');
            showStatsPanel();
            loadCharacter();
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Register function
async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const securityQuestion = document.getElementById('security-question').value;
    const securityAnswer = document.getElementById('security-answer').value;

    if (!email || !password || !securityQuestion || !securityAnswer) {
        alert('Please fill in all fields');
        return;
    }

    try {
        console.log('Attempting registration with:', { 
            email, 
            password, 
            securityQuestion, 
            securityAnswer 
        });

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password,
                securityQuestion,
                securityAnswer
            })
        });

        const data = await response.json();
        console.log('Registration response:', data);
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        localStorage.setItem('user', JSON.stringify(data));
        showStatsPanel();
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('user');
    if (userData) {
        const { user } = JSON.parse(userData);
        if (user.isAdmin) {
            showAdminPanel();
        } else {
            showStatsPanel();
            loadCharacter();
        }
    }
});

// Load character data
async function loadCharacter() {
    try {
        const response = await fetch(`${API_URL}/characters`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load character');
        }

        const character = await response.json();
        if (character) {
            populateCharacterForm(character);
        }
    } catch (error) {
        alert('Failed to load character: ' + error.message);
    }
}

// Save character data
async function saveCharacter() {
    const characterId = document.getElementById('char-id').value;
    const character = {
        name: document.getElementById('char-name').value,
        role: document.getElementById('char-role').value,
        gender: document.getElementById('char-gender').value,
        age: document.getElementById('char-age').value,
        class: document.getElementById('char-class').value,
        level: document.getElementById('char-level').value,
        strength: document.getElementById('char-strength').value,
        health: document.getElementById('char-health').value,
        speed: document.getElementById('char-speed').value,
        stamina: document.getElementById('char-stamina').value,
        cursedEnergy: document.getElementById('char-cursed-energy').value,
        technique: document.getElementById('char-technique').value,
        intelligence: document.getElementById('char-intelligence').value,
        backstory: document.getElementById('char-backstory').value,
        inventory: getInventoryItems(),
        skills: getSkillItems()
    };

    try {
        const method = characterId ? 'PUT' : 'POST';
        const url = characterId ? 
            `${API_URL}/characters/${characterId}` : 
            `${API_URL}/characters`;

        const response = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(character)
        });

        if (!response.ok) {
            throw new Error('Failed to save character');
        }

        const savedCharacter = await response.json();
        populateCharacterForm(savedCharacter);
        alert('Character saved successfully!');
    } catch (error) {
        alert('Failed to save character: ' + error.message);
    }
}

// Populate character form with data
function populateCharacterForm(character) {
    // Store the character ID in a hidden field
    document.getElementById('char-id').value = character._id || '';
    document.getElementById('char-name').value = character.name || '';
    document.getElementById('char-role').value = character.role || '';
    document.getElementById('char-gender').value = character.gender || '';
    document.getElementById('char-age').value = character.age || '';
    document.getElementById('char-class').value = character.class || '';
    document.getElementById('char-level').value = character.level || '';
    document.getElementById('char-strength').value = character.strength || '';
    document.getElementById('char-health').value = character.health || '';
    document.getElementById('char-speed').value = character.speed || '';
    document.getElementById('char-stamina').value = character.stamina || '';
    document.getElementById('char-cursed-energy').value = character.cursedEnergy || '';
    document.getElementById('char-technique').value = character.technique || '';
    document.getElementById('char-intelligence').value = character.intelligence || '';
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

// Password Reset Functions
let resetToken = '';

async function requestPasswordReset() {
    const email = document.getElementById('reset-email').value;
    const securityQuestion = document.getElementById('reset-security-question').value;
    const securityAnswer = document.getElementById('reset-security-answer').value;

    try {
        const response = await fetch(`${API_URL}/auth/reset-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, securityQuestion, securityAnswer })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        resetToken = data.resetToken;
        document.getElementById('reset-step-1').style.display = 'none';
        document.getElementById('reset-step-2').style.display = 'block';
    } catch (error) {
        alert(error.message);
    }
}

async function resetPassword() {
    const newPassword = document.getElementById('new-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resetToken, newPassword })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        alert('Password reset successful! Please login with your new password.');
        showLoginForm();
    } catch (error) {
        alert(error.message);
    }
}

// Admin functions
async function loadAllCharacters() {
    try {
        const response = await fetch(`${API_URL}/admin/characters`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load characters');
        }

        const characters = await response.json();
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

        characters.forEach(character => {
            const characterDiv = document.createElement('div');
            characterDiv.className = 'bg-gray-700 p-4 rounded-lg';
            characterDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-semibold">${character.name || 'Unnamed Character'}</h3>
                    <span class="text-gray-400">${character.user.email}</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>Role: ${character.role || 'N/A'}</div>
                    <div>Class: ${character.class || 'N/A'}</div>
                    <div>Level: ${character.level || 'N/A'}</div>
                    <div>Gender: ${character.gender || 'N/A'}</div>
                </div>
                <button onclick="viewCharacterDetails('${character._id}')" 
                        class="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full">
                    View Details
                </button>
                <button onclick="deleteCharacter('${character._id}')" 
                        class="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md w-full">
                    Delete Character
                </button>
            `;
            userList.appendChild(characterDiv);
        });
    } catch (error) {
        alert('Failed to load characters: ' + error.message);
    }
}

async function viewCharacterDetails(characterId) {
    try {
        const response = await fetch(`${API_URL}/characters/${characterId}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load character details');
        }

        const character = await response.json();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">${character.name || 'Unnamed Character'}'s Details</h2>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-400 hover:text-white text-xl font-bold">×</button>
                </div>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>Role: ${character.role || 'N/A'}</div>
                        <div>Class: ${character.class || 'N/A'}</div>
                        <div>Level: ${character.level || 'N/A'}</div>
                        <div>Gender: ${character.gender || 'N/A'}</div>
                        <div>Age: ${character.age || 'N/A'}</div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h3 class="font-semibold mb-2">Stats</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>Strength: ${character.strength || 'N/A'}</div>
                            <div>Health: ${character.health || 'N/A'}</div>
                            <div>Speed: ${character.speed || 'N/A'}</div>
                            <div>Stamina: ${character.stamina || 'N/A'}</div>
                            <div>Cursed Energy: ${character.cursedEnergy || 'N/A'}</div>
                            <div>Intelligence: ${character.intelligence || 'N/A'}</div>
                            <div>Technique: ${character.technique || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h3 class="font-semibold mb-2">Back Story</h3>
                        <p>${character.backstory || 'No backstory available'}</p>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h3 class="font-semibold mb-2">Inventory</h3>
                        <div class="space-y-2">
                            ${character.inventory?.length ? character.inventory.map(item => `
                                <div class="bg-gray-700 p-2 rounded">
                                    <strong>${item.name}</strong>: ${item.description}
                                </div>
                            `).join('') : 'No items'}
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h3 class="font-semibold mb-2">Skills/Techniques</h3>
                        <div class="space-y-2">
                            ${character.skills?.length ? character.skills.map(skill => `
                                <div class="bg-gray-700 p-2 rounded">
                                    <strong>${skill.name}</strong>: ${skill.description}
                                </div>
                            `).join('') : 'No skills'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        alert('Failed to load character details: ' + error.message);
    }
}

async function deleteCharacter(characterId) {
    if (!confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/characters/${characterId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }

        alert('Character deleted successfully');
        loadAllCharacters(); // Refresh the admin panel
    } catch (error) {
        alert('Failed to delete character: ' + error.message);
    }
}
