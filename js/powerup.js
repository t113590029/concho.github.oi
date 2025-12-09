/**
 * ===== POWERUP CLASS =====
 * Power-ups rơi xuống trong đại dương
 * - Bubble Shield (màu xanh dương): Bảo vệ khỏi 1 va chạm
 * - Speed Boost (màu vàng): Tăng tốc độ di chuyển
 */

class PowerUp {
    /**
     * Constructor - Khởi tạo power-up
     * @param {number} canvasWidth - Chiều rộng canvas
     * @param {string} type - Loại ('shield' hoặc 'speed')
     */
    constructor(canvasWidth, type) {
        this.x = Math.random() * canvasWidth;
        this.y = -30;
        this.type = type;
        this.radius = 16;
        this.speed = 1.2;
        this.active = true;
        this.rotation = 0;
        this.pulseOffset = 0;
        this.floatOffset = 0;
        
        if (type === 'shield') {
            this.color = '#00c8ff'; // Xanh dương
            this.symbol = '💧'; // Droplet/Bubble
            this.secondaryColor = '#39CCCC';
        } else if (type === 'speed') {
            this.color = '#FFD700'; // Vàng
            this.symbol = '⚡'; // Lightning
            this.secondaryColor = '#FFDC00';
        }
    }

    /**
     * Update - Cập nhật vị trí và animation
     * @param {number} speedMultiplier - Hệ số tốc độ
     */
    update(speedMultiplier = 1) {
        this.y += this.speed * speedMultiplier;
        this.rotation += 0.03;
        this.pulseOffset += 0.08;
        this.floatOffset += 0.05;
        
        // Floating motion (di chuyển ngang nhẹ)
        this.x += Math.sin(this.floatOffset) * 0.5;
    }

    /**
     * Draw - Vẽ power-up
     * @param {CanvasRenderingContext2D} ctx - Context của canvas
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Hiệu ứng pulse
        const pulse = 1 + Math.sin(this.pulseOffset) * 0.15;
        const currentRadius = this.radius * pulse;
        
        // Outer glow rings
        for (let i = 2; i >= 0; i--) {
            const alpha = (0.2 - i * 0.05) * (0.5 + Math.sin(this.pulseOffset + i) * 0.5);
            ctx.strokeStyle = `${this.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius + i * 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Main power-up body
        ctx.rotate(this.rotation);
        
        // Shadow
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        
        // Gradient background
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.6, this.secondaryColor);
        gradient.addColorStop(1, `${this.color}88`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Inner circle
        ctx.fillStyle = `${this.color}CC`;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Rotating decorative elements
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.moveTo(
                Math.cos(angle) * currentRadius * 0.4,
                Math.sin(angle) * currentRadius * 0.4
            );
            ctx.lineTo(
                Math.cos(angle) * currentRadius * 0.7,
                Math.sin(angle) * currentRadius * 0.7
            );
            ctx.stroke();
        }
        
        // Symbol/Emoji
        ctx.shadowBlur = 0;
        ctx.font = `${currentRadius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        
        ctx.restore();
    }

    /**
     * getBounds - Lấy vùng va chạm
     * @returns {Object} Object chứa x, y, radius
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }

    /**
     * isOffScreen - Kiểm tra đã ra khỏi màn hình
     * @param {number} canvasHeight - Chiều cao canvas
     * @returns {boolean} True nếu ra khỏi màn hình
     */
    isOffScreen(canvasHeight) {
        return this.y - this.radius > canvasHeight;
    }
}
