import { Platform } from './Platform.js';
import { Player } from './Player.js';
import { Score } from './Score.js';
const jumpSound = new Audio('./sounds/jump.mp3');
const springSound = new Audio('./sounds/spring.mp3');
const coinSound = new Audio('./sounds/coin.mp3');
const hitSound = new Audio('./sounds/hit.mp3');
const gameOverSound = new Audio('./sounds/game-over.mp3');
const bgMusic = new Audio('./sounds/background_music.mp3');
bgMusic.loop = true;

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

// gameOver and leader board
let isGameOver = false;
let topScores = (JSON.parse(localStorage.getItem("topScores")) || []).filter(s => typeof s === 'number' && !isNaN(s));

let soundsUnlocked = false;


// Key Listener
let keys = [];
window.addEventListener('keydown', function (e) {
    if (!soundsUnlocked) {
        // Unlock sounds only once
        bgMusic.play();
        bgMusic.playing = true;

        [jumpSound, springSound, coinSound, hitSound, gameOverSound].forEach(sound => {
            sound.volume = 0;
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = 1;
            });
        });

        soundsUnlocked = true;
    }

    keys[e.keyCode] = true;
    if (e.keyCode === 32 && !player.jumping) { // Space key
        jumpSound.play();
        player.jump(baseJump);
        
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});


//////////////////////////////////////////////////////////////////////////////


function updateGame() {
    if (isGameOver) return; // prevent multiple triggers

    // Player movement input
    if (keys[39] && player.velX < player.speed) player.velX++; // Right arrow
    if (keys[37] && player.velX > -player.speed) player.velX--; // Left arrow

    // Apply physics to player
    player.applyPhysics(gravity, friction);
    // Check for Invincibility
    player.checkInvincibility();

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
            if (platform.isMoving) {
                platform.update(); // Move platform (bounce) first
            }
        
            platform.y += scrollAmount; // Then apply scroll shift
        
            if (platform.y > canvas.height) {
                const highestY = Math.min(...platforms.map(p => p.y));
                platform.recycle(highestY, canvas.width);
            }
        });        
    }

    //move platforms
    platforms.forEach(platform => {
        if (platform.isMoving && !platform.isFalling) {
            platform.update(); // Move platform (bounce) first
        }
    });

    // Constrain player to canvas
    player.constrainToCanvas(canvas);

    // Platform collision
    platforms.forEach(platform => {
        if (platform.collidesWith(player)) {
            player.landOn(platform);
            platform.startFallCheck(player);
    
            if (platform.isMoving) {
                player.y = platform.y + platform.offsetY - player.height;
            }

            if (platform.hasSpring) {
                player.springJump();
                springSound.play();
            }

            if (platform.hasStar) {
                coinSound.play();
                score.addBonus(100); // Add bonus points
                platform.hasStar = false; // Remove the star
                player.activateInvincibility(); // Grant power-up
            }}
    });

    platforms.forEach(platform => {
        if (platform.enemy) {
            platform.enemy.update();
    
            if (platform.enemy.collidesWith(player) && !isGameOver && !player.invincible) {
                hitSound.play();
                handleGameOver();
            }
        }
    });
    
    
    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    platforms.forEach(platform => platform.draw(ctx));

    // Drawing enemies
    platforms.forEach(platform => {
        if (platform.enemy) {
            platform.enemy.draw(ctx);
        }
        });

    // Draw player
    player.draw(ctx);

    // Update score based on total scroll
    score.render();

    requestAnimationFrame(updateGame);
}
updateGame();
 

function handleGameOver() {
    gameOverSound.play();
    isGameOver = true;
    document.getElementById("gameOverScreen").style.display = "block";

    // Save score to leaderboard
    topScores.push(score.total());
    topScores.sort((a, b) => b - a);
    topScores = topScores.slice(0, 10); // keep top 10
    localStorage.setItem("topScores", JSON.stringify(topScores));

    // Render leaderboard
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";
    topScores.forEach((s, i) => {
        const li = document.createElement("li");
        li.textContent = `#${i + 1}: ${s}`;
        leaderboard.appendChild(li);
    });
}

window.restartGame = function () {
    // Reset top-level state (optional cleanup)
    isGameOver = false;
    localStorage.setItem("topScores", JSON.stringify(topScores)); // re-save just in case
    location.reload(); // simplest and cleanest reset
};


