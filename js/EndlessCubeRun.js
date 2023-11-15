var i = 0;
var assetsToLoad = 200; // Update this count based on the number of assets
var assetsLoaded = 0;
var isLoading = true;

var isGameOver = false;
var isPaused = false;

var gameOverScreenVisible = false; // Add a flag to track if the game over screen is already visible

//The game Score
var gameScore = 0;

function random( min, max ) {
  return Math.round( min + ( Math.random() * ( max - min ) ) );
}

function randomChoice(array){
  return array[ Math.round( random( 0, array.length - 1 ) ) ];
}

//This will load the image
function createImage(img) {
    const image = new Image();
    image.src = img;
    return image;
}

function getHighestScore() {
  const highestScore = localStorage.getItem('highestScore');
  return highestScore ? parseInt(highestScore, 10) : 0;
}


// Function to set the highest score in local storage
function setHighestScore(score) {
  localStorage.setItem('highestScore', score);
}

// Initialize the scoreCountRecord from local storage
var scoreCountRecord = getHighestScore();


function submitHighScore(score) {
  // Replace 'your-api-endpoint' with the actual URL of your server's high score submission endpoint
  const url = 'your-api-endpoint';
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response, e.g., show a message to the player
      console.log(data.message);
    })
    .catch((error) => {
      console.error('Error submitting high score:', error);
    });
}

// Function to retrieve the highest score from the server
function getHighestOnlineScore() {
  // Replace 'your-api-endpoint' with the actual URL of your server's highest score retrieval endpoint
  const url = 'your-api-endpoint';
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Update the scoreCountRecord with the highest online score
      scoreCountRecord = data.highestScore;
    })
    .catch((error) => {
      console.error('Error retrieving highest score:', error);
    });
}

//This hold the loading screen.
var wrap = document.getElementById("wrap");

// Define a function to handle the fading effect of the loading screen
function fadeOutLoadingScreen() {
  var opacity = 1;
  var interval = setInterval(function () {
    opacity -= 0.05; // Adjust the fade out speed as needed
    wrap.style.opacity = opacity;
    if (opacity <= 0) {
      // Hide the loading screen when it's completely faded out
      wrap.style.display = 'none';
      clearInterval(interval);
    }
  }, 50 /*Adjust the fade out speed as needed*/);
}


// Reference to the game over screen and the final score element
var gameOverScreen = document.getElementById("gameOver");
var finalHighScoreElement = document.getElementById("hightScore");
var finalScoreElement = document.getElementById("finalScore");
var gamePauseScreen = document.getElementById("gamePaused");

// Function to display the game over screen
function showGameOverScreen() {
  if (gameOverScreenVisible) {
    return; // Don't run the function again if the game over screen is already visible
  }
  gameOverScreenVisible = true; // Set the flag to true to indicate that the game over screen is 
  var opacity = 0;
  var interval = setInterval(function () {
    opacity += 0.01; // Adjust the fade-in speed as needed (0.02 provides a smooth effect)
    gameOverScreen.style.opacity = opacity; // Update the opacity of the game over screen
    if (opacity >= 0.80) {
      clearInterval(interval);
      console.log(opacity);// check the ticking
    }
    if (gameOverScreenVisible) {
      gameOverScreen.style.display = 'block';
    }
  }, 10);
  finalHighScoreElement.textContent = scoreCountRecord;
  finalScoreElement.textContent = gameScore;
}

function showGamePauseScreen() { 
  gamePauseScreen.style.display = 'block';
}

var onAssetLoad = function () {
  assetsLoaded++;
  if (assetsLoaded === assetsToLoad) {
    // All assets are loaded, transition to the game state
    isLoading = false;
    fadeOutLoadingScreen(); // Start the fade out animation
    startGame();
    getHighestOnlineScore();
  }
};

var background = createImage('RunningCubeBackground.jpg');
var platformSprite = createImage('industrialPlatform.png');

var InfiniteRunner = Sketch.create({
  fullscreen: false,
  width: 840,
  height: 460,
  container: document.getElementById('container')
});

/*******************/
/*****VECTOR2*******/
/******************/

function Vector2(x, y, width, height){
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.previousX = 0;
  this.previousY = 0;
};

Vector2.prototype.setPosition = function(x, y) {

  this.previousX = this.x;
  this.previousY = this.y;

  this.x = x;
  this.y = y;

};

Vector2.prototype.setX = function(x) {

  this.previousX = this.x;
  this.x = x;

};

Vector2.prototype.setY = function(y) {

  this.previousY = this.y;
  this.y = y;

};


Vector2.prototype.insercects = function(obj){

  if(obj.x < this.x + this.width && obj.y < this.y + this.height &&
     obj.x + obj.width > this.x && obj.y + obj.height > this.y ){
    return true;
  }

  return false;
};

Vector2.prototype.insercectsLeft = function(obj){

  if(obj.x < this.x + this.width && obj.y < this.y + this.height ){
    return true;
  }

  return false;
};

/****************/
/*****PLAYER****/
/**************/

function Player(options){
  this.setPosition(options.x, options.y);
  this.width = options.width;
  this.height = options.height;
  this.velocityX = 0;
  this.velocityY = 0;
  this.jumpSize = -13;
  this.color = '#181818';
  // Create an array to store trailing copies of the player
  this.trail = [];
  this.trailLength = 5; // Adjust the number of trailing copies
}

Player.prototype = new Vector2;

Player.prototype.update = function() {
  this.velocityY += 1;
  this.setPosition(this.x + this.velocityX, this.y + this.velocityY);

  // Update the trailing copies
  this.trail.push({ x: this.x, y: this.y, alpha: 1 });
  if (this.trail.length > this.trailLength) {
    this.trail.shift(); // Remove oldest trail copy
  }

  if(this.y > InfiniteRunner.height || this.x + this.width < 0){
    isGameOver = true;
  }

  if((InfiniteRunner.keys.UP || InfiniteRunner.keys.SPACE || InfiniteRunner.keys.W || InfiniteRunner.dragging) && this.velocityY < -8){
    this.velocityY += -0.75;
  }

};

var restartButton = document.getElementById('start-button');
var playAgainButton = document.getElementById('playAgain-button');
var resumeButton = document.getElementById('resume-button');

restartButton.addEventListener('click', function() {
  startGame();
});
playAgainButton.addEventListener('click', function() {
  startGame();
});
resumeButton.addEventListener('click', function() {
  isPaused = false;
  gamePauseScreen.style.display = 'none';
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (!isGameOver) {
      isPaused = !isPaused; // Toggle the pause state
      if (isPaused) {
        showGamePauseScreen(); // Show the pause screen when the game is paused
      } else {
        gamePauseScreen.style.display = 'none'; // Hide the pause screen when the game is resumed
      }
    }
  }
});

function startGame() {
  gameOverScreenVisible = false; // Set the flag to false when starting a new game
  InfiniteRunner.player = new Player({x: 130, y: 30, width: 32, height: 32});
  InfiniteRunner.platformManager = new PlatformManager();
  InfiniteRunner.backgroundManager = new BackgroundManager();
  gameScore = 0;
  InfiniteRunner.aceleration = 0;
  InfiniteRunner.acelerationTweening = 0;
  InfiniteRunner.platformManager.maxDistanceBetween = 260;
  InfiniteRunner.platformManager.updateWhenLose();
  isGameOver = false;
  isPaused = false;
  gameOverScreen.style.display = 'none';
  gamePauseScreen.style.display = 'none';
}

Player.prototype.draw = function() {
  // Draw trailing copies with decreasing opacity
  for (let i = this.trail.length - 1; i >= 0; i--) {
    this.trail[i].x -= 10 + InfiniteRunner.aceleration;
    const trailCopy = this.trail[i];
    const alpha = trailCopy.alpha;
    const hslColor = "rgba(40,48,56,0.30)";

    InfiniteRunner.fillStyle = hslColor;
    InfiniteRunner.fillRect(trailCopy.x, trailCopy.y, this.width, this.height);

    // Reduce the alpha for the next frame
    trailCopy.alpha -= 0.1; // You can adjust the fading speed
  }

  InfiniteRunner.fillStyle = this.color;
  InfiniteRunner.fillRect(this.x, this.y, this.width, this.height);
};


/****************/
/*****Background****/
/**************/

function Background(options){
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.previousX = 0;
    this.previousY = 0;
    this.image = options.image;
}

Background.prototype = new Vector2;

Background.prototype.draw = function() {
    InfiniteRunner.drawImage(this.image, this.x, this.y, this.width, this.height);
};

/*******************BACKGROUND MANAGER*************/

function BackgroundManager() {
  i = 5;
  this.backgrounds = [];
  while (--i) {
    this.backgrounds.push(new Background({
      x: (i - 1) * InfiniteRunner.width, // Set x position based on the index
      y: 0,
      width: InfiniteRunner.width,
      height: InfiniteRunner.height,
      image: background
    }));
  }
}

BackgroundManager.prototype.update = function() {
    for (let i = 0; i < this.backgrounds.length; i++) {
    this.backgrounds[i].x -= 0.5 + InfiniteRunner.aceleration;
    if (this.backgrounds[i].x + this.backgrounds[i].width < 0) {
      // Move the background to the end of the sequence
      const prevBg = this.backgrounds[(i + this.backgrounds.length - 1) % this.backgrounds.length];
      this.backgrounds[i].x = prevBg.x + prevBg.width;
    }
  }
}

/*******************/
/*****platform****/
/******************/

function Platform(options){
  this.x = options.x;
  this.y = options.y;
  this.width = options.width;
  this.height = options.height;
  this.previousX = 0;
  this.previousY = 0;
  this.color = options.color;
}

Platform.prototype = new Vector2;

Platform.prototype.draw = function() {
  InfiniteRunner.fillStyle = this.color;
  InfiniteRunner.fillRect(this.x, this.y, this.width, this.height);
  InfiniteRunner.save();
  InfiniteRunner.fillStyle = this.color;
  InfiniteRunner.shadowColor = this.color;
  InfiniteRunner.shadowBlur = this.width / 50;
  InfiniteRunner.fillRect(this.x, this.y, this.width, this.height); // fills tiles occupied by snake array's coordinates
  InfiniteRunner.restore();

  InfiniteRunner.strokeStyle = "#644ab7";
  InfiniteRunner.strokeRect(this.x, this.y, this.width, this.height);

  // Draw grid lines
  const gridSize = 30; // You can adjust the grid spacing as needed
  InfiniteRunner.strokeStyle = "#644ab7"; // Set grid line color
  InfiniteRunner.lineWidth = 1; // Set grid line width

  for (let i = this.x; i < this.x + this.width; i += gridSize) {
    InfiniteRunner.beginPath();
    InfiniteRunner.moveTo(i, this.y);
    InfiniteRunner.lineTo(i, this.y + this.height);
    InfiniteRunner.stroke();
  }

  for (let j = this.y; j < this.y + this.height; j += gridSize) {
    InfiniteRunner.beginPath();
    InfiniteRunner.moveTo(this.x, j);
    InfiniteRunner.lineTo(this.x + this.width, j);
    InfiniteRunner.stroke();
  }
};

/*******************PLATFORM MANAGER*************/

function PlatformManager(){
  this.maxDistanceBetween = 260;
  this.colors = ['#2ca8c2', '#98cb4a', '#f76d3c', '#f15f74','#5481e6'];

  this.first = new Platform({x: 260, y: InfiniteRunner.width / 2, width: 400, height: 70})
  this.second = new Platform({x: (this.first.x + this.first.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween), y: random(this.first.y - 90, InfiniteRunner.height - 70), width: 400, height: 70})
  this.third = new Platform({x: (this.second.x + this.second.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween), y: random(this.second.y - 90, InfiniteRunner.height - 70), width: 400, height: 70})

  this.first.height = this.first.y + InfiniteRunner.height;
  this.second.height = this.second.y + InfiniteRunner.height;
  this.third.height = this.third.y + InfiniteRunner.height;
  this.first.color = randomChoice(this.colors);
  this.second.color = randomChoice(this.colors);
  this.third.color = randomChoice(this.colors);

  this.colliding = false;
  this.platforms = [this.first, this.second, this.third];
}

PlatformManager.prototype.update = function() {
  this.first.x -= 2 + InfiniteRunner.aceleration;
  if(this.first.x + this.first.width < 0 ){
    this.first.width = random(450, InfiniteRunner.width + 200);
    this.first.x = (this.third.x + this.third.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween);
    this.first.y = random(this.third.y - 32, InfiniteRunner.height - 70);
    this.first.height = this.first.y + InfiniteRunner.height + 10;
    this.first.color = randomChoice(this.colors);
  }

  this.second.x -= 2 + InfiniteRunner.aceleration;
  if(this.second.x + this.second.width < 0 ){
    this.second.width = random(450, InfiniteRunner.width + 200);
    this.second.x = (this.first.x + this.first.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween);
    this.second.y = random(this.first.y - 32, InfiniteRunner.height - 70);
    this.second.height = this.second.y + InfiniteRunner.height + 10;
    this.second.color = randomChoice(this.colors);
    gameScore++
    if(gameScore > scoreCountRecord){
      scoreCountRecord = gameScore;
      setHighestScore(scoreCountRecord); // Update local storage
      submitHighScore(gameScore); // Submit the new high score online
    }
  }

  this.third.x -= 2 + InfiniteRunner.aceleration;
  if(this.third.x + this.third.width < 0 ){
    this.third.width = random(450, InfiniteRunner.width + 200);
    this.third.x = (this.second.x + this.second.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween);
    this.third.y = random(this.second.y - 32, InfiniteRunner.height - 70);
    this.third.height = this.third.y + InfiniteRunner.height + 10;
    this.third.color = randomChoice(this.colors);
  } 
};

PlatformManager.prototype.updateWhenLose = function() {
  this.first.x = 260;
  this.first.color = randomChoice(this.colors);
  this.first.y = InfiniteRunner.width / random(2,3);
  this.second.x = (this.first.x + this.first.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween);
  this.third.x = (this.second.x + this.second.width) + random(this.maxDistanceBetween - 130, this.maxDistanceBetween);
};

/*******************PARTICLE SYSTEM*************/

function Particle(options){
  this.x = options.x;
  this.y = options.y;
  this.size = 10;
  this.velocityX = options.velocityX || random(-(InfiniteRunner.aceleration * 3) + -8,-(InfiniteRunner.aceleration * 3));
  this.velocityY = options.velocityY || random(-(InfiniteRunner.aceleration * 3) + -8,-(InfiniteRunner.aceleration * 3));
  this.color = options.color;
}

Particle.prototype.update = function() {
  this.x += this.velocityX;
  this.y += this.velocityY;
  this.size *= 0.89;
};

Particle.prototype.draw = function() {
  InfiniteRunner.fillStyle = this.color;
  InfiniteRunner.fillRect(this.x, this.y, this.size, this.size);
};

/************************************************/

InfiniteRunner.setup = function () {
  gameScore = 0;
  this.aceleration = 0;
  this.acelerationTweening = 0;
  this.player = new Player({x: 130, y: 30, width: 32, height: 32});
  this.platformManager = new PlatformManager();
  this.backgroundManager = new BackgroundManager();
  this.backGround = new Background({
    x: 0,
    y: 0,
    width: this.width,
    height: this.height,
    image: background
  });
  this.particles = [];
  this.particlesIndex = 0;
  this.particlesMax = 20;
  this.collidedPlatform = null;
  this.scoreColor = '#5481e6';
  scoreCountRecord = 0;
};

InfiniteRunner.update = function() {
  if (!(isGameOver || isPaused)) {
    this.player.update();
    for (i = 0; i < this.backgroundManager.backgrounds.length; i++) {
      this.backgroundManager.update();
    };
  
    for (i = 0; i < this.platformManager.platforms.length; i++) {
      this.platformManager.update();
    };
  
    for (i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    };
  } else if (!isPaused) {
    showGameOverScreen();
  } 

  
  switch(gameScore){
    case 5:
      this.acelerationTweening = 0.5;
      this.platformManager.maxDistanceBetween = 320;
      this.scoreColor = '#5481e6';
      break;
    case 10:
      this.acelerationTweening = 1;
      this.platformManager.maxDistanceBetween = 400;
      this.scoreColor = '#5481e6';
      break;
    case 20:
      this.acelerationTweening = 1.5;
      this.platformManager.maxDistanceBetween = 500;
      this.scoreColor = '#0300A9';
      break;
    case 40:
      this.acelerationTweening = 2;
      this.platformManager.maxDistanceBetween = 590;
      this.scoreColor = '#9F8F00';
      break;
    case 80:
      this.acelerationTweening = 2.5;
      this.platformManager.maxDistanceBetween = 740;
      this.scoreColor = '#9F8F00';
      break;
    case 160:
      this.acelerationTweening = 3;
      this.platformManager.maxDistanceBetween = 780;
      this.scoreColor = '#9F8F00';
      break;
    case 320:
      this.acelerationTweening = 3.5;
      this.platformManager.maxDistanceBetween = 880;
      this.scoreColor = '#9F8F00';
      break;
    case 640:
      this.acelerationTweening = 4;
      this.platformManager.maxDistanceBetween = 880;
      this.scoreColor = '#9F8F00';
      break;
  }

  this.aceleration += (this.acelerationTweening - this.aceleration) * 0.01;

  for (i = 0; i < this.platformManager.platforms.length; i++) {
    if(this.player.insercects(this.platformManager.platforms[i])){
      this.collidedPlatform = this.platformManager.platforms[i];
      if (this.player.y < this.platformManager.platforms[i].y) {
        this.player.y = this.platformManager.platforms[i].y;
        this.player.velocityY = 0;
      }

      this.player.x = this.player.previousX;
      this.player.y = this.player.previousY;

      this.particles[(this.particlesIndex++)%this.particlesMax] = new Particle({
        x: this.player.x,
        y: this.player.y + this.player.height,
        color: this.collidedPlatform.color
      });

      if(this.player.insercectsLeft(this.platformManager.platforms[i])){
        this.player.x = this.collidedPlatform.x - 64;
        for (i = 0; i < 10; i++) {
          this.particles[(this.particlesIndex++)%this.particlesMax] = new Particle({
            x: this.player.x + this.player.width,
            y: random(this.player.y, this.player.y + this.player.height),
            velocityY: random(-30,30),
            color: randomChoice(['#181818','#181818', this.collidedPlatform.color])
          });
        };
        this.player.velocityY = -10 + -(this.aceleration * 4);
        this.player.velocityX = -20 + -(this.aceleration * 4);
        // this.jumpCount = 0;
        // this.aceleration = 0;
        // this.acelerationTweening = 0;
        // this.scoreColor = '#181818';
        // this.platformManager.maxDistanceBetween = 350;
        // this.platformManager.updateWhenLose();


      } else {

        if(this.dragging || this.keys.SPACE || this.keys.UP || this.keys.W){
          this.player.velocityY = this.player.jumpSize;
        }
      }
    }
  };
  background.onload = onAssetLoad(); // Add this to your createImage function
  InfiniteRunner.onload = onAssetLoad();
};

InfiniteRunner.draw = function(){
  for (let i = 0; i < this.backgroundManager.backgrounds.length; i++) {
    this.backgroundManager.backgrounds[i].draw();
  };

  this.player.draw();

  for (i = 0; i < this.platformManager.platforms.length; i++) {
    this.platformManager.platforms[i].draw();
  };

  for (i = 0; i < this.particles.length; i++) {
    this.particles[i].draw();
  };

  this.font = '16pt Orbitron, sans-serif';
  this.fillStyle = '#5481e6';
  this.fillText('RECORD: '+ scoreCountRecord, this.width - (470 + (this.aceleration * 4)), 33 - (this.aceleration * 4));
  this.fillStyle = this.scoreColor;
  this.font = (12 + (this.aceleration * 3))+'pt Orbitron, sans-serif';
  this.fillText('SCORE: '+ gameScore, this.width - (450 + (this.aceleration * 10)), 50);

};

InfiniteRunner.resize = function() {

};