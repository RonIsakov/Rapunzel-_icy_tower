// Platform.js
export class Platform {
    static totalCount = 0;     // permanent counter
    static MOVE_RANGE = 30;
    static MOVE_SPEED = 1;
    static MOVEMENT_CHANCE = 0.06; // 6% chance of moving
    static SPRING_CHANCE = 0.04; // 4% chance of having a spring

    constructor(canvas, i) {
        this.width = Platform.choosePlatformWidth(canvas.width);
        this.x  = Math.random() * (canvas.width - this.width);
        this.y = canvas.height - (i * 100) - 50;
        this.height = 10;

        //falling state
        this.isPlayerOnTop = false;
        this.timePlayerLanded = null;
        this.isFalling = false;

        //platform index and label
        this.index = Platform.totalCount; 
        this.label = this.index % 10 === 0 && this.index !== 0 ? `${this.index}` : null;
        Platform.totalCount++;

        //platform movement
        this.isMoving = Math.random() <= Platform.MOVEMENT_CHANCE;
        this.offsetY = 0; 
        if (this.isMoving) {
            this.startY = this.y;
            this.direction = 1; // Always start moving down
        }
        
        this.hasSpring = Math.random() <= Platform.SPRING_CHANCE; // 10% chance of having a spring
    }
  
    static choosePlatformWidth(canvasWidth) {
        const sizeOptions = [
            { widthFactor: 0.1, probability: 0.05 },  // Very small (5%)
            { widthFactor: 0.15, probability: 0.2 },  // Small (20%)
            { widthFactor: 0.2, probability: 0.5 },   // Medium (50%) ← default
            { widthFactor: 0.3, probability: 0.2 },   // Large (20%)
            { widthFactor: 0.4, probability: 0.05 }   // Very large (5%)
          ];
      const rand = Math.random();
      let cumulative = 0;

      for (let option of sizeOptions) {
        cumulative += option.probability;
        if (rand <= cumulative) {
          return canvasWidth * option.widthFactor;
        }
      }
      return canvasWidth * 0.2;
    }
  
    static generatePlatforms(count, canvas) {
      const platforms = [];
  
      for (let i = 0; i < count; i++) {
        let valid = false;
        let attempts = 0;
  
        while (!valid && attempts < 100) {
          attempts++;

          const newPlatform = new Platform(canvas, i);
  
          const overlapping = platforms.some(p => {
            const horiz = newPlatform.x < p.x + p.width && newPlatform.x + newPlatform.width > p.x;
            const vert = newPlatform.y < p.y + p.height && newPlatform.y + newPlatform.height > p.y;
            return horiz && vert;
          });
  
          if (!overlapping) {
            platforms.push(newPlatform);
            valid = true;
          }
        }
  
        if (attempts === 100) {
          console.warn(`Could not place platform ${i} without overlap`);
        }
      }
  
      return platforms;
    }


    draw(ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y + this.offsetY, this.width, this.height);
      
        // Draw the label if it exists
        if (this.label !== null) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Slightly above the platform
          ctx.fillText(this.label, this.x + this.width / 2, this.y + this.offsetY + this.height / 2);
        }

        if(this.hasSpring) {
            ctx.fillStyle = 'limegreen';
            ctx.fillRect(this.x + this.width / 2 - 5, this.y + this.offsetY - 10, 10, 10); // Draw spring
        }
      }
  
      collidesWith(player) {
        const platformY = this.y + this.offsetY;
      
        const isOverlappingX = 
          player.x < this.x + this.width && 
          player.x + player.width > this.x;
      
        const verticalThreshold = 5; // ← allow for small movement wiggle room
      
        const isLandingNow = 
          player.previousY + player.height <= platformY + verticalThreshold &&
          player.y + player.height >= platformY &&
          player.velY >= 0;
      
        return isOverlappingX && isLandingNow;
      }
  
    recycle(highestY, canvasWidth) {
        this.width = Platform.choosePlatformWidth(canvasWidth);
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = highestY - 100;

        //reset falling state
        this.isPlayerOnTop = false;
        this.timePlayerLanded = null;
        this.isFalling = false;

        //reset index and label
        this.index = Platform.totalCount++;
        this.label = this.index % 10 === 0 && this.index !== 0 ? `${this.index}` : null;

        //reset movement
        this.isMoving = Math.random() < Platform.MOVEMENT_CHANCE;
        if (this.isMoving) {
            this.startY = this.y;
            this.direction = 1;
        }

        //reset spring
        this.hasSpring = Math.random() < Platform.SPRING_CHANCE;
    }

    startFallCheck(player) {
        if (this.collidesWith(player)) {
            if (!this.isPlayerOnTop) {
                this.isPlayerOnTop = true;
                this.timePlayerLanded = performance.now();
                }
        } else {
            this.isPlayerOnTop = false;
            this.timePlayerLanded = null;
        }

    if (this.isPlayerOnTop && !this.isFalling) {
        const now = performance.now();
    if (now - this.timePlayerLanded >= 4000) {
        this.isFalling = true;
        this.isMoving = false; // Stop moving when falling
    }
  } 

  if (this.isFalling) {
     this.y += 10; // Falling speed
     this.offsetY = 0; 
  }
}

update() {
    if (this.isMoving) {
      this.offsetY += this.direction * Platform.MOVE_SPEED;
  
      if (this.offsetY > Platform.MOVE_RANGE || this.offsetY < -Platform.MOVE_RANGE) {
        this.direction *= -1;
      }
    }
  }
  
  


  }
  