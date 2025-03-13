// Game Constants
const GRID_COLS = 9;
const GRID_ROWS = 5;
const INITIAL_SUN = 50;
const SUN_GENERATION_INTERVAL = 10000; // 10 seconds
const ZOMBIE_GENERATION_INTERVAL = 15000; // 15 seconds for first wave
const WAVE_DURATION = 60000; // 60 seconds per wave
const TOTAL_WAVES = 3;

// Plant Types and Costs
const PLANTS = {
    PEASHOOTER: {
        name: 'Peashooter',
        cost: 100,
        cooldown: 7500,
        health: 100,
        damage: 20,
        range: 'full',
        attackSpeed: 1500,
        image: '🌱' // Using emoji as placeholder
    },
    SUNFLOWER: {
        name: 'Sunflower',
        cost: 50,
        cooldown: 5000,
        health: 50,
        sunProduction: 25,
        sunInterval: 24000,
        image: '🌻' // Using emoji as placeholder
    },
    WALLNUT: {
        name: 'Wall-nut',
        cost: 50,
        cooldown: 30000,
        health: 300,
        image: '🌰' // Using emoji as placeholder
    }
};

// Zombie Types
const ZOMBIES = {
    REGULAR: {
        name: 'Regular Zombie',
        health: 100,
        damage: 10,
        speed: 10, // seconds to cross a cell
        image: '🧟' // Using emoji as placeholder
    },
    CONE: {
        name: 'Cone Zombie',
        health: 200,
        damage: 10,
        speed: 12,
        image: '🧟‍♂️' // Using emoji as placeholder
    },
    BUCKET: {
        name: 'Bucket Zombie',
        health: 300,
        damage: 10,
        speed: 15,
        image: '🧟‍♀️' // Using emoji as placeholder
    }
};

// Game State
let gameState = {
    sun: INITIAL_SUN,
    selectedPlant: null,
    plants: [],
    zombies: [],
    projectiles: [],
    suns: [],
    wave: 1,
    waveTimer: 0,
    gameOver: false,
    levelComplete: false,
    paused: false
};

// DOM Elements
let sunCountElement;
let waveNumberElement;
let plantSelectionElement;
let gameBoardElement;
let gameOverModal;
let levelCompleteModal;

// Initialize the game
function initGame() {
    // Get DOM elements
    sunCountElement = document.getElementById('sun-count');
    waveNumberElement = document.getElementById('wave-number');
    plantSelectionElement = document.querySelector('.plant-selection');
    gameBoardElement = document.querySelector('.game-board');
    gameOverModal = document.getElementById('game-over');
    levelCompleteModal = document.getElementById('level-complete');
    
    // Create plant selection cards
    createPlantSelectionCards();
    
    // Create game board grid
    createGameBoard();
    
    // Set up event listeners
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('next-level-button').addEventListener('click', nextLevel);
    
    // Start game loops
    startGameLoops();
    
    // Update UI
    updateUI();
}

// Create plant selection cards
function createPlantSelectionCards() {
    plantSelectionElement.innerHTML = '';
    
    for (const [type, plant] of Object.entries(PLANTS)) {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.dataset.type = type;
        card.innerHTML = `
            <div class="plant-image">${plant.image}</div>
            <div class="plant-cost">${plant.cost}</div>
        `;
        
        card.addEventListener('click', () => selectPlant(type));
        
        plantSelectionElement.appendChild(card);
    }
}

// Create game board grid
function createGameBoard() {
    gameBoardElement.innerHTML = '';
    
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            cell.addEventListener('click', () => placePlant(row, col));
            
            gameBoardElement.appendChild(cell);
        }
    }
}

// Select a plant from the plant selection
function selectPlant(type) {
    // Check if player has enough sun
    if (gameState.sun < PLANTS[type].cost) {
        return; // Not enough sun
    }
    
    // Update selected plant
    gameState.selectedPlant = type;
    
    // Update UI
    document.querySelectorAll('.plant-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelector(`.plant-card[data-type="${type}"]`).classList.add('selected');
}

// Place a plant on the game board
function placePlant(row, col) {
    // Check if a plant is selected
    if (!gameState.selectedPlant) {
        return;
    }
    
    // Check if the cell is empty
    const existingPlant = gameState.plants.find(p => p.row === row && p.col === col);
    if (existingPlant) {
        return; // Cell already has a plant
    }
    
    // Get the selected plant type
    const plantType = gameState.selectedPlant;
    const plantInfo = PLANTS[plantType];
    
    // Deduct sun cost
    gameState.sun -= plantInfo.cost;
    
    // Create plant object
    const plant = {
        type: plantType,
        row,
        col,
        health: plantInfo.health,
        lastAttack: 0,
        lastSunProduction: 0
    };
    
    // Add plant to game state
    gameState.plants.push(plant);
    
    // Create plant element
    createPlantElement(plant);
    
    // Reset selected plant
    gameState.selectedPlant = null;
    document.querySelectorAll('.plant-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Update UI
    updateUI();
}

// Create a plant DOM element
function createPlantElement(plant) {
    const cell = document.querySelector(`.cell[data-row="${plant.row}"][data-col="${plant.col}"]`);
    
    const plantElement = document.createElement('div');
    plantElement.className = `plant ${plant.type.toLowerCase()}`;
    plantElement.dataset.id = gameState.plants.indexOf(plant);
    plantElement.innerHTML = PLANTS[plant.type].image;
    
    cell.appendChild(plantElement);
}

// Generate a zombie
function generateZombie() {
    // Determine zombie type based on wave
    let zombieTypes = ['REGULAR'];
    if (gameState.wave >= 2) {
        zombieTypes.push('CONE');
    }
    if (gameState.wave >= 3) {
        zombieTypes.push('BUCKET');
    }
    
    const type = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
    const zombieInfo = ZOMBIES[type];
    
    // Random row
    const row = Math.floor(Math.random() * GRID_ROWS);
    
    // Create zombie object
    const zombie = {
        type,
        row,
        col: GRID_COLS - 1, // Start at rightmost column
        health: zombieInfo.health,
        position: 0, // 0 to 100 (percentage across cell)
        speed: zombieInfo.speed
    };
    
    // Add zombie to game state
    gameState.zombies.push(zombie);
    
    // Create zombie element
    createZombieElement(zombie);
}

// Create a zombie DOM element
function createZombieElement(zombie) {
    const zombieElement = document.createElement('div');
    zombieElement.className = `zombie ${zombie.type.toLowerCase()}`;
    zombieElement.dataset.id = gameState.zombies.indexOf(zombie);
    zombieElement.innerHTML = ZOMBIES[zombie.type].image;
    
    // Position zombie
    const top = zombie.row * (100 / GRID_ROWS);
    const right = (100 - zombie.position) / GRID_COLS * zombie.col;
    
    zombieElement.style.top = `${top}%`;
    zombieElement.style.right = `${right}%`;
    
    gameBoardElement.appendChild(zombieElement);
}

// Generate sun
function generateSun() {
    // Random column
    const col = Math.floor(Math.random() * GRID_COLS);
    
    // Create sun object
    const sun = {
        col,
        top: 0,
        value: 25
    };
    
    // Add sun to game state
    gameState.suns.push(sun);
    
    // Create sun element
    createSunElement(sun);
}

// Create a sun DOM element
function createSunElement(sun) {
    const sunElement = document.createElement('div');
    sunElement.className = 'sun';
    sunElement.dataset.id = gameState.suns.indexOf(sun);
    
    // Position sun
    const left = (sun.col + 0.5) * (100 / GRID_COLS);
    sunElement.style.left = `${left}%`;
    
    // Add click event
    sunElement.addEventListener('click', () => collectSun(sun));
    
    gameBoardElement.appendChild(sunElement);
}

// Collect sun
function collectSun(sun) {
    // Add sun value to player's sun count
    gameState.sun += sun.value;
    
    // Remove sun from game state
    const index = gameState.suns.indexOf(sun);
    if (index !== -1) {
        gameState.suns.splice(index, 1);
    }
    
    // Remove sun element
    const sunElement = document.querySelector(`.sun[data-id="${index}"]`);
    if (sunElement) {
        sunElement.remove();
    }
    
    // Update UI
    updateUI();
}

// Create a projectile
function createProjectile(plant) {
    // Create projectile object
    const projectile = {
        row: plant.row,
        col: plant.col,
        position: 0, // 0 to 100 (percentage across cell)
        damage: PLANTS[plant.type].damage
    };
    
    // Add projectile to game state
    gameState.projectiles.push(projectile);
    
    // Create projectile element
    const projectileElement = document.createElement('div');
    projectileElement.className = 'pea';
    projectileElement.dataset.id = gameState.projectiles.indexOf(projectile);
    
    // Position projectile
    const top = (plant.row + 0.5) * (100 / GRID_ROWS);
    const left = (plant.col + 0.5) * (100 / GRID_COLS);
    
    projectileElement.style.top = `${top}%`;
    projectileElement.style.left = `${left}%`;
    
    gameBoardElement.appendChild(projectileElement);
}

// Update game state
function updateGame(deltaTime) {
    if (gameState.gameOver || gameState.levelComplete || gameState.paused) {
        return;
    }
    
    // Update wave timer
    gameState.waveTimer += deltaTime;
    if (gameState.waveTimer >= WAVE_DURATION) {
        if (gameState.wave < TOTAL_WAVES) {
            gameState.wave++;
            gameState.waveTimer = 0;
            waveNumberElement.textContent = gameState.wave;
        } else if (gameState.zombies.length === 0) {
            // Level complete
            gameState.levelComplete = true;
            levelCompleteModal.classList.remove('hidden');
        }
    }
    
    // Update plants
    updatePlants(deltaTime);
    
    // Update zombies
    updateZombies(deltaTime);
    
    // Update projectiles
    updateProjectiles(deltaTime);
    
    // Update suns
    updateSuns(deltaTime);
    
    // Check for game over
    checkGameOver();
}

// Update plants
function updatePlants(deltaTime) {
    for (let i = gameState.plants.length - 1; i >= 0; i--) {
        const plant = gameState.plants[i];
        
        // Check plant health
        if (plant.health <= 0) {
            // Remove plant
            gameState.plants.splice(i, 1);
            
            // Remove plant element
            const plantElement = document.querySelector(`.plant[data-id="${i}"]`);
            if (plantElement) {
                plantElement.remove();
            }
            
            continue;
        }
        
        // Handle plant actions
        if (plant.type === 'PEASHOOTER') {
            // Check if there are zombies in the same row
            const zombiesInRow = gameState.zombies.filter(z => z.row === plant.row && z.col > plant.col);
            
            if (zombiesInRow.length > 0 && Date.now() - plant.lastAttack >= PLANTS.PEASHOOTER.attackSpeed) {
                // Attack
                createProjectile(plant);
                plant.lastAttack = Date.now();
            }
        } else if (plant.type === 'SUNFLOWER') {
            // Generate sun
            if (Date.now() - plant.lastSunProduction >= PLANTS.SUNFLOWER.sunInterval) {
                // Create sun at sunflower position
                const sun = {
                    col: plant.col,
                    row: plant.row,
                    value: PLANTS.SUNFLOWER.sunProduction
                };
                
                gameState.suns.push(sun);
                createSunElement(sun);
                
                plant.lastSunProduction = Date.now();
            }
        }
    }
}

// Update zombies
function updateZombies(deltaTime) {
    for (let i = gameState.zombies.length - 1; i >= 0; i--) {
        const zombie = gameState.zombies[i];
        
        // Check zombie health
        if (zombie.health <= 0) {
            // Remove zombie
            gameState.zombies.splice(i, 1);
            
            // Remove zombie element
            const zombieElement = document.querySelector(`.zombie[data-id="${i}"]`);
            if (zombieElement) {
                zombieElement.remove();
            }
            
            continue;
        }
        
        // Move zombie
        zombie.position += deltaTime / (zombie.speed * 1000) * 100;
        
        // Check if zombie has moved to next cell
        if (zombie.position >= 100) {
            zombie.col--;
            zombie.position = 0;
            
            // Check if zombie has reached the leftmost column
            if (zombie.col < 0) {
                // Game over
                gameState.gameOver = true;
                gameOverModal.classList.remove('hidden');
                return;
            }
        }
        
        // Check for plants in the same cell
        const plantsInCell = gameState.plants.filter(p => p.row === zombie.row && p.col === zombie.col);
        
        if (plantsInCell.length > 0) {
            // Attack plant
            const plant = plantsInCell[0];
            plant.health -= ZOMBIES[zombie.type].damage * deltaTime / 1000;
            
            // Zombie stops moving while attacking
            continue;
        }
        
        // Update zombie element position
        const zombieElement = document.querySelector(`.zombie[data-id="${i}"]`);
        if (zombieElement) {
            const top = zombie.row * (100 / GRID_ROWS);
            const right = (100 - zombie.position) / GRID_COLS * zombie.col;
            
            zombieElement.style.top = `${top}%`;
            zombieElement.style.right = `${right}%`;
        }
    }
}

// Update projectiles
function updateProjectiles(deltaTime) {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const projectile = gameState.projectiles[i];
        
        // Move projectile
        projectile.position += deltaTime / 1000 * 300; // 300% per second
        
        // Check if projectile has hit a zombie
        const zombiesInPath = gameState.zombies.filter(z => 
            z.row === projectile.row && 
            z.col > projectile.col && 
            z.col <= projectile.col + projectile.position / 100
        );
        
        if (zombiesInPath.length > 0) {
            // Hit the first zombie in path
            const zombie = zombiesInPath.sort((a, b) => a.col - b.col)[0];
            zombie.health -= projectile.damage;
            
            // Remove projectile
            gameState.projectiles.splice(i, 1);
            
            // Remove projectile element
            const projectileElement = document.querySelector(`.pea[data-id="${i}"]`);
            if (projectileElement) {
                projectileElement.remove();
            }
            
            continue;
        }
        
        // Check if projectile has gone off screen
        if (projectile.col + projectile.position / 100 > GRID_COLS) {
            // Remove projectile
            gameState.projectiles.splice(i, 1);
            
            // Remove projectile element
            const projectileElement = document.querySelector(`.pea[data-id="${i}"]`);
            if (projectileElement) {
                projectileElement.remove();
            }
            
            continue;
        }
        
        // Update projectile element position
        const projectileElement = document.querySelector(`.pea[data-id="${i}"]`);
        if (projectileElement) {
            const top = (projectile.row + 0.5) * (100 / GRID_ROWS);
            const left = (projectile.col + projectile.position / 100) * (100 / GRID_COLS);
            
            projectileElement.style.top = `${top}%`;
            projectileElement.style.left = `${left}%`;
        }
    }
}

// Update suns
function updateSuns(deltaTime) {
    // Nothing to update for suns currently
    // In a more complex implementation, we could animate suns falling
}

// Check for game over
function checkGameOver() {
    // Game is over if a zombie reaches the leftmost column
    // This is handled in updateZombies
}

// Update UI
function updateUI() {
    // Update sun count
    sunCountElement.textContent = gameState.sun;
    
    // Update plant selection cards
    document.querySelectorAll('.plant-card').forEach(card => {
        const type = card.dataset.type;
        const cost = PLANTS[type].cost;
        
        if (gameState.sun < cost) {
            card.classList.add('disabled');
        } else {
            card.classList.remove('disabled');
        }
    });
}

// Start game loops
function startGameLoops() {
    // Sun generation loop
    setInterval(() => {
        if (!gameState.gameOver && !gameState.levelComplete && !gameState.paused) {
            generateSun();
        }
    }, SUN_GENERATION_INTERVAL);
    
    // Zombie generation loop
    setInterval(() => {
        if (!gameState.gameOver && !gameState.levelComplete && !gameState.paused) {
            generateZombie();
        }
    }, ZOMBIE_GENERATION_INTERVAL - (gameState.wave - 1) * 2000); // Zombies come faster in later waves
    
    // Game update loop
    let lastTime = Date.now();
    function gameLoop() {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        updateGame(deltaTime);
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop();
}

// Restart game
function restartGame() {
    // Reset game state
    gameState = {
        sun: INITIAL_SUN,
        selectedPlant: null,
        plants: [],
        zombies: [],
        projectiles: [],
        suns: [],
        wave: 1,
        waveTimer: 0,
        gameOver: false,
        levelComplete: false,
        paused: false
    };
    
    // Clear game board
    gameBoardElement.innerHTML = '';
    
    // Create game board grid
    createGameBoard();
    
    // Hide modals
    gameOverModal.classList.add('hidden');
    levelCompleteModal.classList.add('hidden');
    
    // Update UI
    updateUI();
}

// Next level
function nextLevel() {
    // Increment wave
    gameState.wave++;
    
    // Reset other game state
    gameState.selectedPlant = null;
    gameState.plants = [];
    gameState.zombies = [];
    gameState.projectiles = [];
    gameState.suns = [];
    gameState.waveTimer = 0;
    gameState.levelComplete = false;
    
    // Clear game board
    gameBoardElement.innerHTML = '';
    
    // Create game board grid
    createGameBoard();
    
    // Hide modals
    levelCompleteModal.classList.add('hidden');
    
    // Update UI
    waveNumberElement.textContent = gameState.wave;
    updateUI();
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);