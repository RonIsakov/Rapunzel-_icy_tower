import { Platform } from './Platform.js';
import { Player } from './Player.js';
import { Score } from './Score.js';

// Game setup (canvas and context)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
console.log("Canvas:", canvas.width, canvas.height);


// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  


// Game phisics settings
const gravity = 0.5;
const friction = 0.8;
const baseJump = -15; // Base jump velocity

// Score system
const score = new Score(document.getElementById('score'));
let lastScrollTime = performance.now();

// creating the Player
let player = new Player(canvas);

// creating the Platforms array
let platforms = Platform.generatePlatforms(10, canvas);
console.log(platforms);

// Key Listener
let keys = [];
window.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
    if (e.keyCode === 32 && !player.jumping) { // Space key
        player.jump(baseJump);
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

function updateGame() {
    // Player movement input
    if (keys[39] && player.velX < player.speed) player.velX++; // Right arrow
    if (keys[37] && player.velX > -player.speed) player.velX--; // Left arrow

    // Apply physics to player
    player.applyPhysics(gravity, friction);

    // Screen scroll when player climbs
    if (player.y < canvas.height / 4) {
        let scrollAmount = Math.abs(player.velY);
        player.y += scrollAmount;
        score.update(scrollAmount);
        
        // Calculate time since last scroll
        let now = performance.now();
        let timeElapsed = now - lastScrollTime;
        
        if (timeElapsed < 500) { // climbed again in under 0.5 seconds? reward!
            score.addBonus(scrollAmount * 1.3); // 1.3 times points for fast climbs
        }
        lastScrollTime = now;
        
        platforms.forEach(platform => {
            platform.y += scrollAmount;
            if (platform.y > canvas.height) {
                const highestY = Math.min(...platforms.map(p => p.y));
                platform.recycle(highestY, canvas.width);
            }
        });
    }

    // Constrain player to canvas
    player.constrainToCanvas(canvas);

    // Platform collision
    platforms.forEach(platform => {
        if (platform.collidesWith(player)) {
            player.landOn(platform);
            platform.startFallCheck(player);
        }
    });

    // Update score based on total scroll
    score.render();

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    player.draw(ctx);

    // Draw platforms
    platforms.forEach(platform => platform.draw(ctx));

    requestAnimationFrame(updateGame);
}

updateGame();
 