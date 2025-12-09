/**
 * ===== TRASH CLASS =====
 * Rác thải rơi xuống đại dương
 * - Type 1: Plastic Bottle (chai nhựa) - lớn, chậm
 * - Type 2: Metal Can (lon kim loại) - nhỏ, nhanh
 */

class Trash {
    /**
     * Constructor - Khởi tạo rác thải
     * @param {number} canvasWidth - Chiều rộng canvas
     * @param {number} type - Loại rác (1 = bottle, 2 = can)
     */
    constructor(canvasWidth, type = 1) {
        this.x = Math.random() * canvasWidth;
        this.y = -50;
        this.type = type;
        this.active = true;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.08;
        
        if (type === 1) {
            // Type 1: Plastic Bottle - lớn, chậm, màu xanh lá
            this.width = 15;
            this.height = 35;
            this.speed = 1.5 + Math.random() * 1;
            this.color = '#2ECC40'; // Màu xanh lá (plastic)
        } else {
            // Type 2: Metal Can - nhỏ, nhanh, màu bạc
            this.width = 20;
            this.height = 25;
            this.speed = 2.5 + Math.random() * 1.5;
            this.color = '#AAAAAA'; // Màu bạc (metal)
        }
    }

    /**
     * Update - Cập nhật vị trí và xoay
     * @param {number} speedMultiplier - Hệ số tốc độ
     */
    update(speedMultiplier = 1) {
        this.y += this.speed * speedMultiplier;
        this.rotation += this.rotationSpeed;
    }

    /**
     * Draw - Vẽ rác lên canvas
     * @param {CanvasRenderingContext2D} ctx - Context của canvas
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.type === 1) {
            this.drawBottle(ctx);
        } else {
            this.drawCan(ctx);
        }
        
        ctx.restore();
    }

    /**
     * drawBottle - Vẽ chai nhựa
     * @param {CanvasRenderingContext2D} ctx
     */
    drawBottle(ctx) {
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Body của chai
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Nắp chai
        ctx.fillStyle = this.darkenColor(this.color, 40);
        ctx.fillRect(-this.width/2 - 2, -this.height/2 - 5, this.width + 4, 5);
        
        // Viền
        ctx.strokeStyle = this.darkenColor(this.color, 60);
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Label trên chai
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-this.width/2 + 2, 0, this.width - 4, 8);
        
        // Text "PLASTIC"
        ctx.fillStyle = '#001f3f';
        ctx.font = 'bold 6px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText('PLASTIC', 0, 4);
    }

    /**
     * drawCan - Vẽ lon kim loại
     * @param {CanvasRenderingContext2D} ctx
     */
    drawCan(ctx) {
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#DDDDDD';
        
        // Gradient cho metal
        const gradient = ctx.createLinearGradient(
            -this.width/2, 0,
            this.width/2, 0
        );
        gradient.addColorStop(0, '#999999');
        gradient.addColorStop(0.5, '#CCCCCC');
        gradient.addColorStop(1, '#999999');
        
        ctx.fillStyle = gradient;
        
        // Body của lon (cylinder)
        ctx.beginPath();
        ctx.ellipse(0, -this.height/2, this.width/2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.beginPath();
        ctx.ellipse(0, this.height/2, this.width/2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Viền
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Highlight trên lon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-this.width/2 + 2, -this.height/2 + 5, 3, this.height - 10);
        
        // Top rim
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -this.height/2, this.width/2, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * darkenColor - Làm tối màu
     * @param {string} color - Màu hex
     * @param {number} amount - Độ tối thêm
     * @returns {string} Màu mới
     */
    darkenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, ((num >> 16) & 0xFF) - amount);
        const g = Math.max(0, ((num >> 8) & 0xFF) - amount);
        const b = Math.max(0, (num & 0xFF) - amount);
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * getBounds - Lấy vùng va chạm (rectangle)
     * @returns {Object} Object chứa x, y, width, height
     */
    getBounds() {
        return {
            x: this.x - this.width/2,
            y: this.y - this.height/2,
            width: this.width,
            height: this.height,
            // Thêm circle bounds cho va chạm đơn giản hơn
            centerX: this.x,
            centerY: this.y,
            radius: Math.max(this.width, this.height) / 2
        };
    }

    /**
     * isOffScreen - Kiểm tra rác đã rơi ra khỏi màn hình
     * @param {number} canvasHeight - Chiều cao canvas
     * @returns {boolean} True nếu ra khỏi màn hình
     */
    isOffScreen(canvasHeight) {
        return this.y - this.height/2 > canvasHeight;
    }
}
