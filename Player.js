// Player.js
export class Player {
    constructor(canvas, type) {
        this.type = type;
        this.image = new Image();
        this.image.src = `./${type}.png`;
        this.imageBoots = new Image();
        this.imageBoots.src = `./${type}Boots.png`;
        this.width = 32;
    this.height = 32;
    this.x = canvas.width / 2;
    this.y = canvas.height - 150;
    this.previousY = this.y;
    this.velX = 0;
    this.velY = 0;
    this.speed = 5;
    this.jumping = false;
    this.invincible = false;
    this.invincibleUntil = 0;
    this.hasDoubleJump = false;
    this.canDoubleJump = false;
    }
  
    applyPhysics(gravity, friction) {
        this.previousY = this.y;       
        this.velX *= friction;
        this.velY += gravity;
        this.x += this.velX;
        this.y += this.velY;
      }
  
      jump(baseJump) {
        if (!this.jumping) {
          // First jump
          this.jumping = true;
          this.velY = baseJump - Math.abs(this.velX);
      
          // If boots are equipped, allow one extra jump later
          if (this.hasDoubleJump) {
            this.canDoubleJump = true;
          }
        } else if (this.canDoubleJump) {
          // Second (double) jump
          this.velY = baseJump;         // Give upward velocity again
          this.canDoubleJump = false;   // Only once per airtime
          this.loseBoots();            // Lose boots after double jump
        }
      }
    

    draw(ctx) {
        if(this.canDoubleJump){
            ctx.drawImage(this.imageBoots, this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1.0;
        }
        if (this.invincible) ctx.globalAlpha = 0.6;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
      }
      
    
  
      constrainToCanvas(canvas) {
        // Always constrain X
        if (this.x >= canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.x <= 0) this.x = 0;
    
        // Only constrain Y when hitting bottom
        if (this.y >= canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.jumping = false;
            this.velY = 0;
    
            // Reset double-jump if boots are equipped
            if (this.hasDoubleJump) {
                this.canDoubleJump = true;
            }
        }
    }
  
    landOn(platform) {
        this.jumping = false;
        this.velY = 0;
        this.y = platform.y + platform.offsetY - this.height;
      
        // Reset the double jump if boots are equipped
        if (this.hasDoubleJump) {
          this.canDoubleJump = true;
        }
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

    equipBoots() {
        this.hasDoubleJump = true;
      }

      loseBoots() {
        this.hasDoubleJump = false;
        this.canDoubleJump = false;
      }

  }
  