const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

const sizeOptions = [
    { widthFactor: 0.1, probability: 0.05 },  // Very small (5%)
    { widthFactor: 0.15, probability: 0.2 },  // Small (20%)
    { widthFactor: 0.2, probability: 0.5 },   // Medium (50%) ← default
    { widthFactor: 0.3, probability: 0.2 },   // Large (20%)
    { widthFactor: 0.4, probability: 0.05 }   // Very large (5%)
  ];
  
  function choosePlatformWidth() {
    const rand = Math.random();
    let cumulative = 0;
  
    for (let option of sizeOptions) {
      cumulative += option.probability;
      if (rand <= cumulative) {
        return canvas.width * option.widthFactor;
      }
    }
  
    // Fallback in case of rounding issues
    return canvas.width * 0.2;
  }
  

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

// Platforms
function generatePlatforms(count) {
    const newPlatforms = [];

    for (let i = 0; i < count; i++) {
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 100) {
            attempts++;

            const width = choosePlatformWidth(); // 20% of screen width
            const x = Math.random() * (canvas.width - width);
            const y = canvas.height - (i * 100) - 50;

            const newPlatform = { x, y, width, height: 10 };

            // Check for overlap with existing platforms
            const overlapping = newPlatforms.some(p => {
                const horizontallyOverlapping = x < p.x + p.width && x + width > p.x;
                const verticallyOverlapping = y < p.y + 10 && y + 10 > p.y;
                return horizontallyOverlapping && verticallyOverlapping;
            });

            if (!overlapping) {
                newPlatforms.push(newPlatform);
                valid = true;
            }
        }

        if (attempts === 100) {
            console.warn(`Could not place platform ${i} without overlap`);
        }
    }

    return newPlatforms;
}

let platforms = generatePlatforms(10);


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
                platform.width = choosePlatformWidth(); // Randomize width
                platform.x = Math.random() * (canvas.width - platform.width);
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
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.velY >= 0
        ) {
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
    ctx.fillStyle = 'black';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    requestAnimationFrame(updateGame);
}

updateGame();
 