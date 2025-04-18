import { Platform } from './Platform.js';
import { Player } from './Player.js';
import { Score } from './Score.js';
const jumpSound = new Audio('./sounds/jump.mp3');
const springSound = new Audio('./sounds/spring.mp3');
const coinSound = new Audio('./sounds/coin.mp3');
const hitSound = new Audio('./sounds/hit.mp3');
const gameOverSound = new Audio('./sounds/game-over.mp3');
const bgMusic = new Audio('./sounds/background_music.mp3');
const playerSelect = new Audio('./sounds/warriorSelect.mp3');
const wizardSelect = new Audio('./sounds/magical-spell-cast.mp3');
const jesterSelect = new Audio('./sounds/jesterSelect.mp3');
const bootsSound = new Audio('./sounds/boots.mp3');

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

// Character selection
let player     = null;
let selectedCharacter = null;

// 2) Pure selector – no listener registration here!
function selectCharacter(character) {
  selectedCharacter = character;
  if(selectedCharacter === 'player') {
    playerSelect.play();}
    else if(selectedCharacter === 'wizard') {
        wizardSelect.play();}
        else if(selectedCharacter === 'courtJester') {
            jesterSelect.play();}
  document.getElementById('characterSelect').style.display = 'none';

  // create your Player instance with the chosen skin
  player = new Player(canvas, selectedCharacter);

  // now we can start the game loop for real
  requestAnimationFrame(updateGame);
}

// 3) One‐time setup to wire up your images
function initCharacterSelection() {
  const container = document.getElementById('characterSelect');
  container.querySelectorAll('img[data-char]').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      selectCharacter(img.dataset.char);
    });
  });
}

// 4) On page load, call the initializer – but DO NOT start the game yet!
initCharacterSelection();



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

        [jumpSound, springSound, coinSound, hitSound, gameOverSound, bootsSound].forEach(sound => {
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
    if (e.keyCode === 32) { // Space key
        jumpSound.play();
        player.jump(baseJump);
        
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});


//////////////////////////////////////////////////////////////////////////////


function updateGame() {
    bgMusic.volume = 0.2; // Set volume for background music
    if (bgMusic.paused) {
        bgMusic.play();
    }

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

    // ** NEW: if we’re touching the bottom and we’ve already scored >1, game over **
  if (!isGameOver && player.y >= canvas.height - player.height && score.total() > 1) {
    handleGameOver();
    return;   // bail out so we don’t keep updating/drawing
  }

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
            }
        
            if (platform.hasChest) {
                coinSound.play();
                score.addBonus(500); // Add bonus points
                platform.hasChest = false; // Remove the treasure
            }

            if(platform.hasBoot){
                bootsSound.play();
                player.hasDoubleJump = true;   // grant the power
                platform.hasBoot = false;       // remove it
                // optional: play a “power‑up” sound here
              }
        }
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
//updateGame();
 

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
        li.textContent = `${s}`;
        leaderboard.appendChild(li);
    });
}

window.restartGame = function () {
    // Reset top-level state (optional cleanup)
    isGameOver = false;
    localStorage.setItem("topScores", JSON.stringify(topScores)); // re-save just in case
    location.reload(); // simplest and cleanest reset
};


