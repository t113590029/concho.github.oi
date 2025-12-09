/**
 * ===== PARTICLE CLASS =====
 * Manages particles for explosion effects
 * - Creates explosion effects when trash is destroyed
 * - Particles fly in all directions and fade out
 */

class Particle {
    /**
     * Constructor - Initialize particle
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} color - Particle color
     */
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Random velocity in all directions
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.radius = 2 + Math.random() * 3;
        this.alpha = 1.0; // Opacity
        this.decay = 0.02 + Math.random() * 0.02; // Fade speed
        this.active = true;
    }

    /**
     * Update - Update position and opacity
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        
        // Gradually slow down
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        if (this.alpha <= 0) {
            this.active = false;
        }
    }

    /**
     * Draw - Draw particle on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * ===== EXPLOSION CLASS =====
 * Manages a complete explosion (multiple particles)
 */
class Explosion {
    /**
     * Constructor - Create explosion at given position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Main explosion color
     * @param {number} particleCount - Number of particles
     */
    constructor(x, y, color = '#ff6b35', particleCount = 20) {
        this.particles = [];
        this.active = true;
        
        // Create multiple particles with color variations
        for (let i = 0; i < particleCount; i++) {
            // Create color gradient: white -> main color -> red
            let particleColor = color;
            const rand = Math.random();
            if (rand < 0.3) {
                particleColor = '#ffffff'; // Bright white
            } else if (rand < 0.6) {
                particleColor = color; // Main color
            } else {
                particleColor = '#ff0000'; // Red
            }
            
            this.particles.push(new Particle(x, y, particleColor));
        }
    }

    /**
     * Update - Update all particles
     */
    update() {
        // Update each particle
        this.particles.forEach(particle => particle.update());
        
        // Remove inactive particles
        this.particles = this.particles.filter(p => p.active);
        
        // If no particles left, explosion is inactive
        if (this.particles.length === 0) {
            this.active = false;
        }
    }

    /**
     * Draw - Draw all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}
