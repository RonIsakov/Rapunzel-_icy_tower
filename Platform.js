// Platform.js
import { Enemy } from "./Enemy.js"; 
const platformImage = new Image();
platformImage.src = './platform.png';

const coinImage = new Image();
coinImage.src = './goldCoin.png';

const springImage = new Image();
springImage.src = './spring.png';

const chestImage = new Image();
chestImage.src = './tresure.png';

const bootImage = new Image();
bootImage.src = './boots.png';   

export class Platform {
    static totalCount = 0;     // permanent counter
    static MOVE_RANGE = 30;
    static MOVE_SPEED = 1;
    static MOVEMENT_CHANCE = 0.06; // 6% chance of moving
    static SPRING_CHANCE = 0.04; // 4% chance of having a spring
    static ENEMY_CHANCE = 0.2 ; // 5% chance of having an enemy
    static STAR_CHANCE = 0.05; // 5% of platforms will get a star
    static TRESURE_CHANCE = 0.2; // 5% of platforms will get a treasure
    static BOOT_CHANCE = 0.5; // 5% of platforms will get a boot

    constructor(canvas, i) {
        this.width = Platform.choosePlatformWidth(canvas.width);
        this.x  = Math.random() * (canvas.width - this.width);
        this.y = canvas.height - (i * 100) - 50;
        this.height = 30;

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
      
        
        //spring
        this.hasSpring = Math.random() <= Platform.SPRING_CHANCE;
        
        //star
        this.hasStar = !this.hasSpring && Math.random() <= Platform.STAR_CHANCE;

        //treasure
        this.hasChest = !this.hasSpring && !this.hasStar && Math.random() <= Platform.TRESURE_CHANCE;

        //boot
        this.hasBoot = !this.hasSpring && !this.hasStar && !this.hasChest && Math.random() <= Platform.BOOT_CHANCE;

        //enemy
        if (Math.random() <= Platform.ENEMY_CHANCE && !this.hasSpring && !this.hasStar && !this.hasChest && !this.hasBoot) {
          const enemyType = Math.random() < 0.5 ? 1 : 2; // 50% chance each
          this.enemy = new Enemy(this, enemyType);
        } else {
          this.enemy = null;
        }

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
      const SPRITE_CROP = {
        x: 20,              // crop 10px from left
        y: 20,              // crop 10px from top
        width: platformImage.width - 40,  // crop left + right
        height: platformImage.height - 20
      };
       
      ctx.drawImage(
        platformImage,
        SPRITE_CROP.x, SPRITE_CROP.y, SPRITE_CROP.width, SPRITE_CROP.height, // crop source rect
        this.x, this.y + this.offsetY, this.width, this.height               // destination box
      );
      
      
      // Draw the label if it exists
      if (this.label !== null) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.offsetY + this.height / 2);
      }
  
      if (this.hasSpring) {
        ctx.drawImage(
          springImage,
          this.x + (this.width / 2) - (100 / 2),      // center horizontally
          this.y + this.offsetY - 30,                // adjust vertical position as needed
          100, 50
        );
      }
      
      
      if (this.hasStar) {
        ctx.drawImage(
          coinImage,
          this.x + (this.width / 2) - 16,            // 32 / 2 = 16
          this.y + this.offsetY - 20,                // vertical offset for floating above
          32, 32
        );
      }
      
      if (this.hasChest) {
        if (this.hasChest) {
          ctx.drawImage(
            chestImage,                             // preload your chest image at top of file
            this.x + (this.width/2) - 16,           // center (assuming chest is 24×24px)
            this.y + this.offsetY - 20,             // float just above
            32, 32
          );
        }
      }

      if(this.hasBoot){
        ctx.drawImage(
          bootImage,
          this.x + this.width/2 - 16,    // center of platform
          this.y + this.offsetY - 20,    // floating just above
          32,32                          // size of your boot sprite
        );
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
    
        // Reset falling state
        this.isPlayerOnTop = false;
        this.timePlayerLanded = null;
        this.isFalling = false;
    
        // Reset index and label
        this.index = Platform.totalCount++;
        this.label = this.index % 10 === 0 && this.index !== 0 ? `${this.index}` : null;
    
        // Reset movement
        this.isMoving = Math.random() < Platform.MOVEMENT_CHANCE;
        if (this.isMoving) {
            this.startY = this.y;
            this.direction = 1;
        }
    
        // Reset spring
        this.hasSpring = Math.random() < Platform.SPRING_CHANCE;
    
        // Reset star (only if no spring)
        this.hasStar = !this.hasSpring && Math.random() < Platform.STAR_CHANCE;

        //reset treasure (only if no spring and no star)
        this.hasChest = !this.hasSpring && !this.hasStar && Math.random() < Platform.TRESURE_CHANCE;
        if (this.hasChest) {
            this.hasChest = true;
        } else {
            this.hasChest = false;
        }

        this.boot = !this.hasSpring && !this.hasStar && Math.random() && !this.hasChest < Platform.BOOT_CHANCE;
        if (this.hasBoot) {
            this.hasBoot = true;
        } else {
            this.hasBoot = false;
        }
    
        // Reset enemy (only if no spring and no star)
        if (
          !this.hasSpring &&
          !this.hasStar &&
          !this.hasChest &&
          !this.hasBoot &&            // <-- NO parentheses here!
          Math.random() < Platform.ENEMY_CHANCE
        ) {
          const enemyType = Math.random() < 0.5 ? 1 : 2;
          this.enemy = new Enemy(this, enemyType);
        } else {
          this.enemy = null;
        }
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



  
  