// Player.js
export class Player {
    constructor(canvas) {
      this.width = 20;
      this.height = 20;
      this.x = canvas.width / 2;
      this.y = canvas.height - 150;
      this.previousY = this.y;
      this.velX = 0;
      this.velY = 0;
      this.speed = 5;
      this.jumping = false;
      this.invincible = false;
      this.invincibleUntil = 0;
    }
  
    applyPhysics(gravity, friction) {
        this.previousY = this.y;       
        this.velX *= friction;
        this.velY += gravity;
        this.x += this.velX;
        this.y += this.velY;
      }
  
    jump(baseJump) {
      this.jumping = true;
      this.velY = baseJump - Math.abs(this.velX);
    }
  
    draw(ctx) {
        ctx.fillStyle = this.invincible ? 'yellow' : 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
  
    constrainToCanvas(canvas) {
      if (this.x >= canvas.width - this.width) this.x = canvas.width - this.width;
      if (this.x <= 0) this.x = 0;
      if (this.y >= canvas.height - this.height) {
        this.y = canvas.height - this.height;
        this.jumping = false;
        this.velY = 0;
      }
    }
  
    landOn(platform) {
      this.jumping = false;
      this.velY = 0;
      this.y = platform.y + platform.offsetY - this.height;
    }

    springJump() {
        this.jumping = true;
        this.velY = -25; // much higher than normal jump
      }

      activateInvincibility(duration = 7000) {
        this.invincible = true;
        this.invincibleUntil = performance.now() + duration;
    }
    
    checkInvincibility() {
        if (this.invincible && performance.now() > this.invincibleUntil) {
            this.invincible = false;
        }
    }
    
      
  }
  