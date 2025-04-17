import { Platform } from './Platform.js';

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
  


// Game settings
const gravity = 0.5;
const friction = 0.8;
const baseJump = -15; // Base jump velocity
let score = 0;
let totalScroll = 0;
let lastScrollTime = performance.now();
let bonusPoints = 0;
  

const scoreDisplay = document.getElementById('score');

// Player
let player = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 20,
    height: 20,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false
};

// Platform generation
let platforms = Platform.generatePlatforms(10, canvas);
console.log(platforms);

// Key Listener
let keys = [];
window.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
    if (e.keyCode === 32 && !player.jumping) { // Space key
        player.jumping = true;
        player.velY = baseJump - Math.abs(player.velX); // More velocity = higher jump
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

function updateGame() {
    // Player movement input
    if (keys[39] && player.velX < player.speed) player.velX++; // Right arrow
    if (keys[37] && player.velX > -player.speed) player.velX--; // Left arrow

    // Apply physics
    player.velX *= friction;
    player.velY += gravity;
    player.x += player.velX;
    player.y += player.velY;

    // Screen scroll when player climbs
    if (player.y < canvas.height / 4) {
        let scrollAmount = Math.abs(player.velY);
        player.y += scrollAmount;
        totalScroll += scrollAmount;
        
        // ⏱️ Calculate time since last scroll
        let now = performance.now();
        let timeElapsed = now - lastScrollTime;
        
        if (timeElapsed < 500) { // climbed again in under 0.5 seconds? reward!
            bonusPoints += 5; // or whatever value feels good
        }
        lastScrollTime = now;
        
        platforms.forEach(platform => {
            platform.y += scrollAmount;
            if (platform.y > canvas.height) {
                const highestY = Math.min(...platforms.map(p => p.y));
                platform.y = highestY - 100; // 100px above the highest platform
                platform.recycle(highestY, canvas.width);
            }
        });
    }

    // Wall collision
    if (player.x >= canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.x <= 0) player.x = 0;

    // Floor collision
    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.velY = 0;
    }

    // Platform collision
    platforms.forEach(platform => {
        if (platform.collidesWith(player)) {
            player.jumping = false;
            player.velY = 0;
            player.y = platform.y - player.height;
        }
    });

    // Update score based on total scroll
    score = Math.floor(totalScroll + bonusPoints);
    scoreDisplay.innerText = "Score: " + score;

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw platforms
    platforms.forEach(platform => platform.draw(ctx));

    requestAnimationFrame(updateGame);
}

updateGame();
 