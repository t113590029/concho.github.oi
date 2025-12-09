/**
 * ===== DOLPHIN CLASS =====
 * Cá heo của người chơi
 * - Điều khiển bằng bàn phím
 * - Có animation đuôi vẫy
 * - Có thể bắn bong bóng
 * - Power-ups: Shield và Speed Boost
 */

class Dolphin {
    /**
     * Constructor - Khởi tạo cá heo
     * @param {number} x - Vị trí x ban đầu
     * @param {number} y - Vị trí y ban đầu
     * @param {number} canvasWidth - Chiều rộng canvas
     */
    constructor(x, y, canvasWidth) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 30;
        this.speed = 6;
        this.canvasWidth = canvasWidth;
        
        // Trạng thái
        this.alive = true;
        this.moveLeft = false;
        this.moveRight = false;
        this.direction = 1; // 1 = right, -1 = left
        
        // Animation
        this.tailSwing = 0;
        this.tailSpeed = 0.3;
        this.bodyWave = 0;
        this.bodyWaveSpeed = 0.15;
        
        // Power-ups
        this.hasShield = false;
        this.shieldTimer = 0;
        this.shieldDuration = 300;
        
        this.hasSpeedBoost = false;
        this.speedBoostTimer = 0;
        this.speedBoostDuration = 300;
        
        // Shooting
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownMax = 20;
    }

    /**
     * Update - Cập nhật vị trí và animation
     */
    update() {
        // Tốc độ thực tế (có thể được tăng bởi power-up)
        const currentSpeed = this.hasSpeedBoost ? this.speed * 1.8 : this.speed;
        
        // Di chuyển
        if (this.moveLeft && this.x > this.width / 2) {
            this.x -= currentSpeed;
            this.direction = -1;
        }
        
        if (this.moveRight && this.x < this.canvasWidth - this.width / 2) {
            this.x += currentSpeed;
            this.direction = 1;
        }
        
        // Animations
        this.tailSwing += this.tailSpeed;
        this.bodyWave += this.bodyWaveSpeed;
        
        // Update power-up timers
        if (this.hasShield) {
            this.shieldTimer++;
            if (this.shieldTimer >= this.shieldDuration) {
                this.hasShield = false;
                this.shieldTimer = 0;
            }
        }
        
        if (this.hasSpeedBoost) {
            this.speedBoostTimer++;
            if (this.speedBoostTimer >= this.speedBoostDuration) {
                this.hasSpeedBoost = false;
                this.speedBoostTimer = 0;
            }
        }
        
        // Shooting cooldown
        if (!this.canShoot) {
            this.shootCooldown++;
            if (this.shootCooldown >= this.shootCooldownMax) {
                this.canShoot = true;
                this.shootCooldown = 0;
            }
        }
    }

    /**
     * Draw - Vẽ cá heo
     * @param {CanvasRenderingContext2D} ctx - Context của canvas
     */
    draw(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);
        
        // Vẽ shield nếu có
        if (this.hasShield) {
            this.drawShield(ctx);
        }
        
        // Vẽ speed trails nếu có speed boost
        if (this.hasSpeedBoost) {
            this.drawSpeedTrails(ctx);
        }
        
        // Vẽ cá heo
        this.drawBody(ctx);
        this.drawFin(ctx);
        this.drawTail(ctx);
        this.drawEye(ctx);
        
        ctx.restore();
    }

    /**
     * drawBody - Vẽ thân cá heo
     * @param {CanvasRenderingContext2D} ctx
     */
    drawBody(ctx) {
        const waveOffset = Math.sin(this.bodyWave) * 2;
        
        // Gradient cho thân
        const gradient = ctx.createLinearGradient(0, -15, 0, 15);
        gradient.addColorStop(0, '#0074D9');
        gradient.addColorStop(0.5, '#39CCCC');
        gradient.addColorStop(1, '#7FDBFF');
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(57, 204, 204, 0.6)';
        
        // Thân (ellipse)
        ctx.beginPath();
        ctx.ellipse(waveOffset, 0, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bụng sáng màu
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(waveOffset, 5, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Viền
        ctx.strokeStyle = '#003d7a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(waveOffset, 0, 25, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * drawFin - Vẽ vây lưng
     * @param {CanvasRenderingContext2D} ctx
     */
    drawFin(ctx) {
        ctx.fillStyle = '#0074D9';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 116, 217, 0.6)';
        
        ctx.beginPath();
        ctx.moveTo(-5, -12);
        ctx.lineTo(0, -20);
        ctx.lineTo(5, -12);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#003d7a';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * drawTail - Vẽ đuôi (animated)
     * @param {CanvasRenderingContext2D} ctx
     */
    drawTail(ctx) {
        const tailWave = Math.sin(this.tailSwing) * 8;
        
        ctx.fillStyle = '#0074D9';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 116, 217, 0.6)';
        
        // Đuôi trên
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.quadraticCurveTo(-30, tailWave - 5, -35, tailWave - 10);
        ctx.lineTo(-30, tailWave);
        ctx.closePath();
        ctx.fill();
        
        // Đuôi dưới
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.quadraticCurveTo(-30, tailWave + 5, -35, tailWave + 10);
        ctx.lineTo(-30, tailWave);
        ctx.closePath();
        ctx.fill();
        
        // Viền đuôi
        ctx.strokeStyle = '#003d7a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.quadraticCurveTo(-30, tailWave - 5, -35, tailWave - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.quadraticCurveTo(-30, tailWave + 5, -35, tailWave + 10);
        ctx.stroke();
    }

    /**
     * drawEye - Vẽ mắt
     * @param {CanvasRenderingContext2D} ctx
     */
    drawEye(ctx) {
        ctx.fillStyle = '#001f3f';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(15, -5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(15.5, -5.5, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * drawShield - Vẽ shield bảo vệ
     * @param {CanvasRenderingContext2D} ctx
     */
    drawShield(ctx) {
        const alpha = 0.3 + Math.sin(this.shieldTimer * 0.1) * 0.2;
        
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
        ctx.fillStyle = `rgba(0, 150, 255, ${alpha * 0.2})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00c8ff';
        
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    /**
     * drawSpeedTrails - Vẽ trails khi có speed boost
     * @param {CanvasRenderingContext2D} ctx
     */
    drawSpeedTrails(ctx) {
        ctx.shadowBlur = 0;
        for (let i = 0; i < 3; i++) {
            const alpha = 0.3 - i * 0.1;
            const offset = -10 - i * 8;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            ctx.ellipse(offset, 0, 8 - i * 2, 6 - i * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * shoot - Bắn bong bóng
     * @returns {Bubble|null} Bong bóng mới hoặc null
     */
    shoot() {
        if (!this.canShoot) return null;
        
        this.canShoot = false;
        return new Bubble(this.x + this.direction * 20, this.y - 15);
    }

    /**
     * activateShield - Kích hoạt shield
     */
    activateShield() {
        this.hasShield = true;
        this.shieldTimer = 0;
    }

    /**
     * activateSpeedBoost - Kích hoạt speed boost
     */
    activateSpeedBoost() {
        this.hasSpeedBoost = true;
        this.speedBoostTimer = 0;
    }

    /**
     * getBounds - Lấy vùng va chạm
     * @returns {Object} Object chứa x, y, radius
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: 20
        };
    }

    /**
     * die - Xử lý khi cá heo chết
     */
    die() {
        this.alive = false;
    }

    /**
     * reset - Reset về trạng thái ban đầu
     * @param {number} x - Vị trí x mới
     * @param {number} y - Vị trí y mới
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.alive = true;
        this.moveLeft = false;
        this.moveRight = false;
        this.direction = 1;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.hasSpeedBoost = false;
        this.speedBoostTimer = 0;
    }
}
