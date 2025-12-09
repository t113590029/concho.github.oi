/**
 * ===== BUBBLE CLASS =====
 * Bong bóng được bắn từ cá heo để phá hủy rác
 * - Di chuyển lên trên
 * - Hiệu ứng bong bóng trong suốt với shine
 */

class Bubble {
    /**
     * Constructor - Khởi tạo bong bóng
     * @param {number} x - Vị trí x ban đầu
     * @param {number} y - Vị trí y ban đầu
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;       // Bán kính bong bóng
        this.speed = 6;        // Tốc độ di chuyển
        this.active = true;    // Trạng thái hoạt động
        
        // Animation
        this.wobble = 0;       // Độ lắc lư của bong bóng
        this.wobbleSpeed = 0.15;
    }

    /**
     * Update - Cập nhật vị trí và animation
     */
    update() {
        // Di chuyển lên trên
        this.y -= this.speed;
        
        // Wobble animation (bong bóng lắc lư khi bay)
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;
        
        // Nếu ra khỏi màn hình thì không hoạt động
        if (this.y < -this.radius * 2) {
            this.active = false;
        }
    }

    /**
     * Draw - Vẽ bong bóng lên canvas
     * @param {CanvasRenderingContext2D} ctx - Context của canvas
     */
    draw(ctx) {
        ctx.save();
        
        // Vẽ outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(127, 219, 255, 0.8)';
        
        // Vẽ bong bóng chính - gradient radial
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.2,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(127, 219, 255, 0.6)');
        gradient.addColorStop(0.7, 'rgba(57, 204, 204, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 116, 217, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Vẽ viền bong bóng
        ctx.strokeStyle = 'rgba(127, 219, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Vẽ shine spot (điểm sáng)
        const shineGradient = ctx.createRadialGradient(
            this.x - this.radius * 0.4,
            this.y - this.radius * 0.4,
            0,
            this.x - this.radius * 0.4,
            this.y - this.radius * 0.4,
            this.radius * 0.4
        );
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = shineGradient;
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.4,
            this.y - this.radius * 0.4,
            this.radius * 0.4,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * getBounds - Lấy vùng giới hạn để kiểm tra va chạm
     * @returns {Object} Object chứa x, y, radius
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius
        };
    }
}
