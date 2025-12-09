/**
 * ===== COLLISION DETECTION =====
 * Các hàm kiểm tra va chạm cho Ocean Defender
 */

/**
 * circleCollision - Kiểm tra va chạm giữa 2 hình tròn
 * @param {Object} circle1 - Object có x, y, radius
 * @param {Object} circle2 - Object có x, y, radius
 * @returns {boolean} True nếu va chạm
 */
function circleCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle1.radius + circle2.radius;
}

/**
 * circleRectCollision - Kiểm tra va chạm circle vs rectangle
 * Sử dụng cho bubble (circle) vs trash (rect)
 * @param {Object} circle - Object có x, y, radius
 * @param {Object} rect - Object có x, y, width, height hoặc centerX, centerY, radius
 * @returns {boolean} True nếu va chạm
 */
function circleRectCollision(circle, rect) {
    // Nếu rect có circle bounds (centerX, centerY, radius) thì dùng circle collision
    if (rect.centerX !== undefined && rect.centerY !== undefined && rect.radius !== undefined) {
        const dx = circle.x - rect.centerX;
        const dy = circle.y - rect.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle.radius + rect.radius;
    }
    
    // Nếu không thì dùng rect collision thông thường
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle.radius;
}

/**
 * checkBubbleTrashCollisions - Kiểm tra va chạm giữa bong bóng và rác
 * @param {Array} bubbles - Mảng các bong bóng
 * @param {Array} trashes - Mảng các rác
 * @returns {Object} Object chứa các collision xảy ra
 */
function checkBubbleTrashCollisions(bubbles, trashes) {
    const collisions = {
        bubbles: [],
        trashes: []
    };
    
    bubbles.forEach((bubble, bubbleIndex) => {
        if (!bubble.active) return;
        
        trashes.forEach((trash, trashIndex) => {
            if (!trash.active) return;
            
            const bubbleBounds = bubble.getBounds();
            const trashBounds = trash.getBounds();
            
            if (circleRectCollision(bubbleBounds, trashBounds)) {
                collisions.bubbles.push(bubbleIndex);
                collisions.trashes.push(trashIndex);
                
                bubble.active = false;
                trash.active = false;
            }
        });
    });
    
    return collisions;
}

/**
 * checkDolphinTrashCollisions - Kiểm tra va chạm giữa cá heo và rác
 * @param {Dolphin} dolphin - Cá heo
 * @param {Array} trashes - Mảng các rác
 * @returns {Array} Mảng index của trashes va chạm
 */
function checkDolphinTrashCollisions(dolphin, trashes) {
    if (!dolphin.alive) return [];
    
    // Nếu có shield, va chạm sẽ mất shield thay vì mất mạng
    if (dolphin.hasShield) {
        const collisions = [];
        trashes.forEach((trash, index) => {
            if (!trash.active) return;
            
            const dolphinBounds = dolphin.getBounds();
            const trashBounds = trash.getBounds();
            
            if (circleRectCollision(dolphinBounds, trashBounds)) {
                collisions.push(index);
                trash.active = false;
                dolphin.hasShield = false;
                dolphin.shieldTimer = 0;
            }
        });
        return collisions;
    }
    
    // Không có shield - kiểm tra va chạm bình thường
    const collisions = [];
    trashes.forEach((trash, index) => {
        if (!trash.active) return;
        
        const dolphinBounds = dolphin.getBounds();
        const trashBounds = trash.getBounds();
        
        if (circleRectCollision(dolphinBounds, trashBounds)) {
            collisions.push(index);
            trash.active = false;
        }
    });
    
    return collisions;
}

/**
 * checkDolphinPowerUpCollisions - Kiểm tra va chạm giữa cá heo và power-ups
 * @param {Dolphin} dolphin - Cá heo
 * @param {Array} powerups - Mảng các power-ups
 * @returns {Array} Mảng các power-ups bị thu thập
 */
function checkDolphinPowerUpCollisions(dolphin, powerups) {
    if (!dolphin.alive) return [];
    
    const collected = [];
    
    powerups.forEach((powerup, index) => {
        if (!powerup.active) return;
        
        const dolphinBounds = dolphin.getBounds();
        const powerupBounds = powerup.getBounds();
        
        if (circleCollision(dolphinBounds, powerupBounds)) {
            collected.push(index);
            powerup.active = false;
            
            // Áp dụng power-up
            if (powerup.type === 'shield') {
                dolphin.activateShield();
            } else if (powerup.type === 'speed') {
                dolphin.activateSpeedBoost();
            }
        }
    });
    
    return collected;
}
