/**
 * ===== OCEAN DEFENDER - MAIN GAME FILE =====
 * Game bảo vệ đại dương khỏi ô nhiễm
 * 
 * Game States: Opening → Ready → Playing ⇄ Paused → GameOver
 * Player: Dolphin (Cá heo)
 * Enemies: Trash (Rác thải) - 2 types
 * Power-ups: Shield & Speed Boost
 */

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game states
        this.states = {
            OPENING: 'opening',
            READY: 'ready',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAMEOVER: 'gameover'
        };
        this.currentState = this.states.OPENING;
        
        // Game objects
        this.dolphin = new Dolphin(
            this.canvas.width / 2,
            this.canvas.height - 100,
            this.canvas.width
        );
        this.bubbles = [];
        this.trashes = [];
        this.powerups = [];
        this.explosions = [];
        
        // Background elements
        this.waves = this.createWaves();
        this.bubblesBg = this.createBackgroundBubbles(30);
        this.fish = this.createBackgroundFish(5);
        
        // Game stats
        this.score = 0;
        this.lives = 3;
        this.speedMultiplier = 1.0;
        
        // Spawn timers
        this.trashSpawnTimer = 0;
        this.trashSpawnRate = 70;
        this.powerupSpawnTimer = 0;
        this.powerupSpawnRate = 600;
        
        // Opening animation
        this.openingTimer = 0;
        this.openingDuration = 180;
        this.openingWaves = this.createOpeningWaves();
        
        // Difficulty
        this.difficultyTimer = 0;
        this.difficultyInterval = 600;
        
        // Setup and start
        this.setupControls();
        this.updateUI();
        this.gameLoop();
    }

    /**
     * createWaves - Tạo sóng biển nền
     */
    createWaves() {
        const waves = [];
        for (let i = 0; i < 3; i++) {
            waves.push({
                offset: i * 100,
                amplitude: 10 + i * 5,
                frequency: 0.01 + i * 0.005,
                speed: 0.5 + i * 0.3,
                y: this.canvas.height * (0.2 + i * 0.15),
                alpha: 0.1 + i * 0.05
            });
        }
        return waves;
    }

    /**
     * createBackgroundBubbles - Tạo bong bóng nền
     */
    createBackgroundBubbles(count) {
        const bubbles = [];
        for (let i = 0; i < count; i++) {
            bubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 2 + Math.random() * 5,
                speed: 0.3 + Math.random() * 0.7,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.03
            });
        }
        return bubbles;
    }

    /**
     * createBackgroundFish - Tạo cá nhỏ bơi nền
     */
    createBackgroundFish(count) {
        const fish = [];
        for (let i = 0; i < count; i++) {
            fish.push({
                x: Math.random() * this.canvas.width,
                y: 100 + Math.random() * (this.canvas.height - 200),
                width: 15 + Math.random() * 10,
                height: 8 + Math.random() * 5,
                speed: 0.5 + Math.random() * 1,
                direction: Math.random() < 0.5 ? 1 : -1,
                tailSwing: Math.random() * Math.PI * 2,
                color: `hsl(${180 + Math.random() * 40}, 70%, 60%)`
            });
        }
        return fish;
    }

    /**
     * createOpeningWaves - Tạo sóng cho opening animation
     */
    createOpeningWaves() {
        const waves = [];
        for (let i = 0; i < 5; i++) {
            waves.push({
                y: this.canvas.height / 2 + i * 40 - 80,
                amplitude: 30,
                frequency: 0.02,
                offset: i * Math.PI / 2,
                alpha: 0.6 - i * 0.1
            });
        }
        return waves;
    }

    /**
     * setupControls - Thiết lập controls
     */
    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.dolphin.moveLeft = true;
            if (e.key === 'ArrowRight') this.dolphin.moveRight = true;
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (this.currentState === this.states.PLAYING) {
                    const bubble = this.dolphin.shoot();
                    if (bubble) this.bubbles.push(bubble);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.dolphin.moveLeft = false;
            if (e.key === 'ArrowRight') this.dolphin.moveRight = false;
        });

        // Canvas click
        this.canvas.addEventListener('click', () => {
            if (this.currentState === this.states.PLAYING) {
                const bubble = this.dolphin.shoot();
                if (bubble) this.bubbles.push(bubble);
            }
        });

        // Buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('speedUpBtn').addEventListener('click', () => this.changeSpeed(0.2));
        document.getElementById('speedDownBtn').addEventListener('click', () => this.changeSpeed(-0.2));
    }

    startGame() {
        if (this.currentState === this.states.OPENING) {
            this.currentState = this.states.READY;
        }
        if (this.currentState === this.states.READY || this.currentState === this.states.GAMEOVER) {
            this.currentState = this.states.PLAYING;
            this.updateButtonStates();
        }
    }

    togglePause() {
        if (this.currentState === this.states.PLAYING) {
            this.currentState = this.states.PAUSED;
            document.getElementById('pauseBtn').textContent = '▶️ Resume';
        } else if (this.currentState === this.states.PAUSED) {
            this.currentState = this.states.PLAYING;
            document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        }
        this.updateButtonStates();
    }

    resetGame() {
        this.dolphin.reset(this.canvas.width / 2, this.canvas.height - 100);
        this.bubbles = [];
        this.trashes = [];
        this.powerups = [];
        this.explosions = [];
        this.score = 0;
        this.lives = 3;
        this.speedMultiplier = 1.0;
        this.trashSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        this.difficultyTimer = 0;
        this.trashSpawnRate = 70;
        this.currentState = this.states.READY;
        document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        this.updateUI();
        this.updateButtonStates();
    }

    changeSpeed(delta) {
        this.speedMultiplier += delta;
        this.speedMultiplier = Math.max(0.2, Math.min(3.0, this.speedMultiplier));
        this.updateUI();
    }

    updateButtonStates() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.currentState === this.states.PLAYING || this.currentState === this.states.PAUSED) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('speed').textContent = `x${this.speedMultiplier.toFixed(1)}`;
        
        const stateNames = {
            [this.states.OPENING]: 'Opening',
            [this.states.READY]: 'Ready',
            [this.states.PLAYING]: 'Playing',
            [this.states.PAUSED]: 'Paused',
            [this.states.GAMEOVER]: 'Game Over'
        };
        document.getElementById('gameState').textContent = stateNames[this.currentState];
    }

    spawnTrash() {
        const type = Math.random() < 0.7 ? 1 : 2;
        this.trashes.push(new Trash(this.canvas.width, type));
    }

    spawnPowerUp() {
        const type = Math.random() < 0.5 ? 'shield' : 'speed';
        this.powerups.push(new PowerUp(this.canvas.width, type));
    }

    createExplosion(x, y, color) {
        this.explosions.push(new Explosion(x, y, color, 15));
    }

    /**
     * update - Main update logic
     */
    update() {
        if (this.currentState === this.states.OPENING) {
            this.updateOpening();
            return;
        }
        if (this.currentState === this.states.READY || 
            this.currentState === this.states.PAUSED ||
            this.currentState === this.states.GAMEOVER) {
            return;
        }
        
        // Playing state
        this.updatePlaying();
    }

    updateOpening() {
        this.openingTimer++;
        if (this.openingTimer >= this.openingDuration) {
            this.currentState = this.states.READY;
            this.updateUI();
            this.updateButtonStates();
        }
    }

    updatePlaying() {
        // Update dolphin
        this.dolphin.update();

        // Update bubbles
        this.bubbles.forEach(b => b.update());
        this.bubbles = this.bubbles.filter(b => b.active);

        // Update trashes
        this.trashes.forEach(t => t.update(this.speedMultiplier));
        this.trashes.forEach(trash => {
            if (trash.isOffScreen(this.canvas.height) && trash.active) {
                trash.active = false;
                this.lives--;
                this.updateUI();
                if (this.lives <= 0) this.gameOver();
            }
        });
        this.trashes = this.trashes.filter(t => !t.isOffScreen(this.canvas.height));

        // Update powerups
        this.powerups.forEach(p => p.update(this.speedMultiplier));
        this.powerups = this.powerups.filter(p => !p.isOffScreen(this.canvas.height));

        // Update explosions
        this.explosions.forEach(e => e.update());
        this.explosions = this.explosions.filter(e => e.active);

        // Update background
        this.updateBackground();

        // Spawning
        this.trashSpawnTimer++;
        if (this.trashSpawnTimer >= this.trashSpawnRate) {
            this.spawnTrash();
            this.trashSpawnTimer = 0;
        }

        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer >= this.powerupSpawnRate) {
            this.spawnPowerUp();
            this.powerupSpawnTimer = 0;
        }

        // Difficulty
        this.difficultyTimer++;
        if (this.difficultyTimer >= this.difficultyInterval) {
            this.trashSpawnRate = Math.max(35, this.trashSpawnRate - 5);
            this.difficultyTimer = 0;
        }

        // Collisions
        this.checkCollisions();
    }

    updateBackground() {
        // Waves
        this.waves.forEach(wave => {
            wave.offset += wave.speed;
        });

        // Background bubbles
        this.bubblesBg.forEach(bubble => {
            bubble.y -= bubble.speed;
            bubble.wobble += bubble.wobbleSpeed;
            bubble.x += Math.sin(bubble.wobble) * 0.5;
            if (bubble.y < -bubble.radius) {
                bubble.y = this.canvas.height + bubble.radius;
                bubble.x = Math.random() * this.canvas.width;
            }
        });

        // Background fish
        this.fish.forEach(f => {
            f.x += f.speed * f.direction;
            f.tailSwing += 0.2;
            if (f.x < -f.width || f.x > this.canvas.width + f.width) {
                f.direction *= -1;
                f.x = f.direction > 0 ? -f.width : this.canvas.width + f.width;
                f.y = 100 + Math.random() * (this.canvas.height - 200);
            }
        });
    }

    checkCollisions() {
        // Bubble vs Trash
        const bubbleTrashCollisions = checkBubbleTrashCollisions(this.bubbles, this.trashes);
        bubbleTrashCollisions.trashes.forEach(index => {
            const trash = this.trashes[index];
            if (trash) {
                this.createExplosion(trash.x, trash.y, trash.color);
                this.score += 10;
                this.updateUI();
            }
        });

        // Dolphin vs Trash
        const dolphinTrashCollisions = checkDolphinTrashCollisions(this.dolphin, this.trashes);
        dolphinTrashCollisions.forEach(index => {
            const trash = this.trashes[index];
            if (trash) {
                this.createExplosion(trash.x, trash.y, trash.color);
                if (!this.dolphin.hasShield) {
                    this.lives--;
                    this.updateUI();
                    if (this.lives <= 0) this.gameOver();
                }
            }
        });

        // Dolphin vs PowerUp
        const powerupCollisions = checkDolphinPowerUpCollisions(this.dolphin, this.powerups);
        powerupCollisions.forEach(index => {
            const powerup = this.powerups[index];
            if (powerup) {
                this.createExplosion(powerup.x, powerup.y, powerup.color);
                this.score += 5;
                this.updateUI();
            }
        });
    }

    gameOver() {
        this.currentState = this.states.GAMEOVER;
        this.dolphin.die();
        this.updateUI();
        this.updateButtonStates();
    }

    /**
     * draw - Main draw function
     */
    draw() {
        // Ocean gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#003d7a');
        gradient.addColorStop(0.5, '#0074D9');
        gradient.addColorStop(1, '#39CCCC');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background elements
        this.drawWaves();
        this.drawBackgroundBubbles();
        this.drawBackgroundFish();

        if (this.currentState === this.states.OPENING) {
            this.drawOpening();
            return;
        }

        // Draw game objects
        this.dolphin.draw(this.ctx);
        this.bubbles.forEach(b => b.draw(this.ctx));
        this.trashes.forEach(t => t.draw(this.ctx));
        this.powerups.forEach(p => p.draw(this.ctx));
        this.explosions.forEach(e => e.draw(this.ctx));

        // Draw state messages
        if (this.currentState === this.states.READY) this.drawReadyMessage();
        else if (this.currentState === this.states.PAUSED) this.drawPausedMessage();
        else if (this.currentState === this.states.GAMEOVER) this.drawGameOverMessage();
    }

    drawWaves() {
        this.waves.forEach(wave => {
            this.ctx.save();
            this.ctx.globalAlpha = wave.alpha;
            this.ctx.strokeStyle = '#7FDBFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = wave.y + Math.sin((x + wave.offset) * wave.frequency) * wave.amplitude;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    drawBackgroundBubbles() {
        this.bubblesBg.forEach(bubble => {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#7FDBFF';
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawBackgroundFish() {
        this.fish.forEach(f => {
            this.ctx.save();
            this.ctx.globalAlpha = 0.4;
            this.ctx.translate(f.x, f.y);
            this.ctx.scale(f.direction, 1);
            
            // Body
            this.ctx.fillStyle = f.color;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, f.width/2, f.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Tail
            const tailWave = Math.sin(f.tailSwing) * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(-f.width/2, 0);
            this.ctx.lineTo(-f.width/2 - 5, tailWave - 3);
            this.ctx.lineTo(-f.width/2 - 5, tailWave + 3);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    drawOpening() {
        const progress = this.openingTimer / this.openingDuration;
        
        // Animated waves
        this.openingWaves.forEach((wave, i) => {
            this.ctx.save();
            this.ctx.globalAlpha = wave.alpha * Math.min(1, progress * 2);
            this.ctx.strokeStyle = '#39CCCC';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = wave.y + Math.sin((x + this.openingTimer * 2 + wave.offset) * wave.frequency) * wave.amplitude;
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            this.ctx.restore();
        });
        
        // Title
        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1, progress * 1.5);
        this.ctx.fillStyle = '#39CCCC';
        this.ctx.font = 'bold 52px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = '#39CCCC';
        this.ctx.fillText('🌊 OCEAN DEFENDER 🐬', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '26px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#FFD700';
        this.ctx.fillText('Save Our Ocean!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.restore();
    }

    drawReadyMessage() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 31, 63, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#39CCCC';
        this.ctx.font = 'bold 42px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#39CCCC';
        this.ctx.fillText('🎮 PRESS START 🎮', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#7FDBFF';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('← → to move  |  Space to shoot', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.restore();
    }

    drawPausedMessage() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 54px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#FFD700';
        this.ctx.fillText('⏸️ PAUSED ⏸️', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();
    }

    drawGameOverMessage() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF4136';
        this.ctx.font = 'bold 50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#FF4136';
        this.ctx.fillText('💔 GAME OVER 💔', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.fillText(`🏆 Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        this.ctx.font = '22px Arial';
        this.ctx.fillStyle = '#7FDBFF';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText('🌍 Thanks for protecting our ocean!', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Press RESET to play again', this.canvas.width / 2, this.canvas.height / 2 + 95);
        this.ctx.restore();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
