// Platform.js
export class Platform {
    constructor(canvas, i) {
        this.width = Platform.choosePlatformWidth(canvas.width);
        this.x  = Math.random() * (canvas.width - this.width);
        this.y = canvas.height - (i * 100) - 50;
        this.height = 10;
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
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
  
    collidesWith(player) {
      return (
        player.x < this.x + this.width &&
        player.x + player.width > this.x &&
        player.y + player.height > this.y &&
        player.y + player.height < this.y + this.height &&
        player.velY >= 0
      );
    }
  
    recycle(highestY, canvasWidth) {
      this.width = Platform.choosePlatformWidth(canvasWidth);
      this.x = Math.random() * (canvasWidth - this.width);
      this.y = highestY - 100;
    }
  }
  