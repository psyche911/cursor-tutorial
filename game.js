// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 10;
const ENEMY_SPACING = 60;
const ENEMY_START_X = 100;
const ENEMY_START_Y = 50;
const ENEMY_MOVE_DOWN = 30;
const BARRIER_COUNT = 4;
const BARRIER_Y = 450;

// Game state
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    PAUSED: 'paused'
};

// Entity classes
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 30;
        this.speed = PLAYER_SPEED;
        this.alive = true;
    }

    update(keys) {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < CANVAS_WIDTH - this.width) {
            this.x += this.speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#0f0';
        // Draw ship (triangle)
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Enemy {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.row = row;
        this.alive = true;
        this.health = 1;
        this.maxHealth = 1;
    }

    draw(ctx) {
        if (!this.alive) return;
        
        // Draw with reduced opacity if damaged
        const alpha = this.health < this.maxHealth ? 0.6 : 1.0;
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = this.row === 0 ? '#f00' : this.row === 1 ? '#ff0' : '#0ff';
        // Draw alien shape
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 5, this.y + 5, 10, 10);
        ctx.fillRect(this.x + 25, this.y + 5, 10, 10);
        ctx.fillRect(this.x + 10, this.y + 20, 20, 5);
        
        ctx.globalAlpha = 1.0;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getPoints() {
        // Top row worth most points
        return (5 - this.row) * 10;
    }
}

class Bullet {
    constructor(x, y, direction, damage = 1) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.direction = direction; // 1 for up, -1 for down
        this.speed = direction === 1 ? BULLET_SPEED : ENEMY_BULLET_SPEED;
        this.active = true;
        this.damage = damage;
    }

    update() {
        this.y -= this.speed * this.direction;
        if (this.y < 0 || this.y > CANVAS_HEIGHT) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        if (this.direction === 1) {
            // Player bullet - different color if powered up
            ctx.fillStyle = this.damage > 1 ? '#ff0' : '#0f0';
            // Make powered-up bullets bigger
            const size = this.damage > 1 ? 6 : 4;
            ctx.fillRect(this.x - (size - this.width) / 2, this.y, size, this.height);
        } else {
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.lifetime = 0;
        this.maxLifetime = 20;
        
        // Create particles
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 50}%)`
            });
        }
    }
    
    update() {
        this.lifetime++;
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.size *= 0.95; // shrink
        });
    }
    
    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    isDone() {
        return this.lifetime >= this.maxLifetime;
    }
}

class Barrier {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 50;
        this.blocks = [];
        this.initBlocks();
    }

    initBlocks() {
        const blockSize = 4;
        const cols = this.width / blockSize;
        const rows = this.height / blockSize;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Create arch shape
                const centerX = cols / 2;
                const centerY = rows / 2;
                const distFromCenter = Math.sqrt(
                    Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2)
                );
                
                if (distFromCenter < rows / 2 && r > rows * 0.3) {
                    this.blocks.push({
                        x: this.x + c * blockSize,
                        y: this.y + r * blockSize,
                        width: blockSize,
                        height: blockSize,
                        alive: true
                    });
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#0f0';
        this.blocks.forEach(block => {
            if (block.alive) {
                ctx.fillRect(block.x, block.y, block.width, block.height);
            }
        });
    }

    checkCollision(bullet) {
        const bulletBounds = bullet.getBounds();
        let hit = false;
        
        this.blocks.forEach(block => {
            if (block.alive && 
                bulletBounds.x < block.x + block.width &&
                bulletBounds.x + bulletBounds.width > block.x &&
                bulletBounds.y < block.y + block.height &&
                bulletBounds.y + bulletBounds.height > block.y) {
                block.alive = false;
                hit = true;
            }
        });
        
        return hit;
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        
        this.state = GAME_STATE.START;
        this.keys = {};
        this.score = 0;
        this.lives = 3;
        this.enemyDirection = 1;
        this.enemySpeed = 1;
        this.lastEnemyShot = 0;
        this.enemyShotInterval = 2000;
        this.powerUpActive = false;
        this.explosions = [];
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.player = new Player(CANVAS_WIDTH / 2 - 25, CANVAS_HEIGHT - 50);
        // Set player speed based on power-up status
        if (this.powerUpActive) {
            this.player.speed = PLAYER_SPEED * 1.5;
        }
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.barriers = [];
        this.explosions = [];
        
        // Create enemies
        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                const enemy = new Enemy(
                    ENEMY_START_X + col * ENEMY_SPACING,
                    ENEMY_START_Y + row * ENEMY_SPACING,
                    row
                );
                // Enemies have more health when power-up is active
                if (this.powerUpActive) {
                    enemy.health = 2;
                    enemy.maxHealth = 2;
                }
                this.enemies.push(enemy);
            }
        }
        
        // Create barriers
        const barrierSpacing = CANVAS_WIDTH / (BARRIER_COUNT + 1);
        for (let i = 0; i < BARRIER_COUNT; i++) {
            this.barriers.push(new Barrier(
                barrierSpacing * (i + 1) - 40,
                BARRIER_Y
            ));
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for arrow keys to stop page scrolling
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
            
            this.keys[e.key] = true;
            
            if (e.key === ' ' && this.state === GAME_STATE.START) {
                this.startGame();
            } else if (e.key === ' ' && this.state === GAME_STATE.GAME_OVER) {
                this.restart();
            } else if (e.key === ' ' && this.state === GAME_STATE.PLAYING) {
                this.shoot();
            } else if (e.key === 'p' && (this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED)) {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.overlay.classList.add('hidden');
        this.gameLoop();
    }

    togglePause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            this.overlay.classList.remove('hidden');
            this.overlayTitle.textContent = 'PAUSED';
            this.overlayMessage.textContent = 'Press P to resume';
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.overlay.classList.add('hidden');
            this.gameLoop();
        }
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.enemyDirection = 1;
        this.enemySpeed = 1;
        this.powerUpActive = false;
        this.init();
        // Reset player speed
        this.player.speed = PLAYER_SPEED;
        this.startGame();
    }

    shoot() {
        // Only allow one bullet at a time for player
        if (this.playerBullets.length === 0) {
            const damage = this.powerUpActive ? 2 : 1;
            this.playerBullets.push(new Bullet(
                this.player.x + this.player.width / 2 - 2,
                this.player.y,
                1,
                damage
            ));
        }
    }

    enemyShoot() {
        const now = Date.now();
        if (now - this.lastEnemyShot < this.enemyShotInterval) return;
        
        // Find bottom-most alive enemy in each column
        const bottomEnemies = [];
        for (let col = 0; col < ENEMY_COLS; col++) {
            let bottomEnemy = null;
            for (let row = ENEMY_ROWS - 1; row >= 0; row--) {
                const enemy = this.enemies[row * ENEMY_COLS + col];
                if (enemy && enemy.alive) {
                    bottomEnemy = enemy;
                    break;
                }
            }
            if (bottomEnemy) {
                bottomEnemies.push(bottomEnemy);
            }
        }
        
        if (bottomEnemies.length > 0 && Math.random() < 0.3) {
            const shooter = bottomEnemies[Math.floor(Math.random() * bottomEnemies.length)];
            this.enemyBullets.push(new Bullet(
                shooter.x + shooter.width / 2 - 2,
                shooter.y + shooter.height,
                -1
            ));
            this.lastEnemyShot = now;
        }
    }

    updateEnemies() {
        const aliveEnemies = this.enemies.filter(e => e.alive);
        if (aliveEnemies.length === 0) {
            // New wave
            this.init();
            this.enemySpeed += 0.5;
            return;
        }

        // Check if enemies hit edge
        let hitEdge = false;
        for (const enemy of aliveEnemies) {
            if ((enemy.x <= 0 && this.enemyDirection === -1) ||
                (enemy.x + enemy.width >= CANVAS_WIDTH && this.enemyDirection === 1)) {
                hitEdge = true;
                break;
            }
        }

        if (hitEdge) {
            this.enemyDirection *= -1;
            aliveEnemies.forEach(enemy => {
                enemy.y += ENEMY_MOVE_DOWN;
            });
        } else {
            aliveEnemies.forEach(enemy => {
                enemy.x += this.enemySpeed * this.enemyDirection;
            });
        }

        // Check if enemies reached player
        for (const enemy of aliveEnemies) {
            if (enemy.y + enemy.height >= this.player.y) {
                this.gameOver();
                return;
            }
        }
    }

    updateBullets() {
        // Update player bullets
        this.playerBullets.forEach(bullet => {
            bullet.update();
        });
        this.playerBullets = this.playerBullets.filter(b => b.active);

        // Update enemy bullets
        this.enemyBullets.forEach(bullet => {
            bullet.update();
        });
        this.enemyBullets = this.enemyBullets.filter(b => b.active);
    }

    checkCollisions() {
        // Check for power-up activation
        if (this.score >= 100 && !this.powerUpActive) {
            this.powerUpActive = true;
            // Increase player speed
            this.player.speed = PLAYER_SPEED * 1.5;
            // Update existing enemies to have more health
            this.enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.health = 2;
                    enemy.maxHealth = 2;
                }
            });
        }
        
        // Player bullets vs enemies
        this.playerBullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach(enemy => {
                if (enemy.alive && checkCollision(bullet.getBounds(), enemy.getBounds())) {
                    enemy.health -= bullet.damage;
                    if (enemy.health <= 0) {
                        enemy.alive = false;
                        // Create explosion
                        this.explosions.push(new Explosion(
                            enemy.x + enemy.width / 2,
                            enemy.y + enemy.height / 2
                        ));
                        this.score += enemy.getPoints();
                        this.scoreDisplay.textContent = `Score: ${this.score}`;
                    }
                    bullet.active = false;
                }
            });
        });

        // Player bullets vs barriers
        this.playerBullets.forEach(bullet => {
            this.barriers.forEach(barrier => {
                if (barrier.checkCollision(bullet)) {
                    bullet.active = false;
                }
            });
        });

        // Enemy bullets vs player
        this.enemyBullets.forEach(bullet => {
            if (checkCollision(bullet.getBounds(), this.player.getBounds())) {
                bullet.active = false;
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // Enemy bullets vs barriers
        this.enemyBullets.forEach(bullet => {
            this.barriers.forEach(barrier => {
                if (barrier.checkCollision(bullet)) {
                    bullet.active = false;
                }
            });
        });
    }

    gameOver() {
        this.state = GAME_STATE.GAME_OVER;
        this.overlay.classList.remove('hidden');
        this.overlayTitle.textContent = 'GAME OVER';
        this.overlayMessage.textContent = `Final Score: ${this.score}\nPress SPACE to restart`;
    }

    update() {
        if (this.state !== GAME_STATE.PLAYING) return;

        this.player.update(this.keys);
        this.updateEnemies();
        this.updateBullets();
        this.enemyShoot();
        this.checkCollisions();
        
        // Update explosions
        this.explosions.forEach(explosion => explosion.update());
        this.explosions = this.explosions.filter(e => !e.isDone());
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw game entities
        this.player.draw(this.ctx);
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.playerBullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.barriers.forEach(barrier => barrier.draw(this.ctx));

        // Draw explosions
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        
        // Draw UI
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 30);
        this.ctx.fillText(`Score: ${this.score}`, 10, 60);
        
        // Draw power-up indicator
        if (this.powerUpActive) {
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = '16px monospace';
            this.ctx.fillText('POWER-UP ACTIVE!', 10, 90);
        }
    }

    gameLoop() {
        if (this.state !== GAME_STATE.PLAYING && this.state !== GAME_STATE.PAUSED) return;

        this.update();
        this.draw();
        
        if (this.state === GAME_STATE.PLAYING) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});

