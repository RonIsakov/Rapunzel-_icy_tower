// Enemy.js
export class Enemy {
    constructor(platform, type) {
      this.type = type; // 1 = static, 2 = moving
      this.width = 20;
      this.height = 20;
  
      this.platform = platform;
      this.x = platform.x + platform.width / 2 - this.width / 2;
      this.y = platform.y + (platform.offsetY || 0) - this.height;
  
      if (type === 2) {
        this.velocity = 1.2;
      }
    }
  
    update() {
      if (this.type === 2) {
        this.x += this.velocity;
  
        const leftBound = this.platform.x;
        const rightBound = this.platform.x + this.platform.width - this.width;
  
        if (this.x <= leftBound || this.x >= rightBound) {
          this.velocity *= -1; // Bounce off edges
          this.x = Math.max(leftBound, Math.min(this.x, rightBound));
        }
      }
  
      // Always keep enemy vertically aligned with platform
      this.y = this.platform.y + (this.platform.offsetY || 0) - this.height;
    }
  
    draw(ctx) {
        //console.log("its alive")
        ctx.fillStyle = "red"
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
  
    collidesWith(player) {
      return (
        player.x < this.x + this.width &&
        player.x + player.width > this.x &&
        player.y < this.y + this.height &&
        player.y + player.height > this.y
      );
    }
  }
  