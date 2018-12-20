$(function() {
  // Ship Variables
  var $ship = $(".ship");
  var shipSize = [30, 67];
  $ship.css({"width": shipSize[0] + "px", "height": shipSize[1] + "px"});
  var baseVelocity = 1;
  var shipVelocity = [null, null]
  var wasdKeys = [false, false, false, false];
  var refreshTime = 20;
  var maxShipVelocity = 10;
  var shipTotalV = null;
  var shipDampening = 0.985;
  var shipPosition = [null, null];

  // Asteroid Variables
  var asteroidVelocityRange = [6, 12];
  var asteroidRadiusRange = [30, 150];
  var refreshTime = 17;
  var viewingCircleRadius = 350;
  var spawnCircleRadius = 645;
  var asteroidArray = [];
  var $asteroidElements = $(".asteroid");
  var asteroidSpawnTime = [500, 1500];

  // Game variables
  var gameOver = false;
  var resetTimes = 0;
  var gameState = 0;

  // Initial asteroid spawn values
  var currentTime = 0;
  var timeToSpawn = 0;

  // Initial score values
  var scoreWait = 50;
  var scoreWaitCount = 0;
  var score = 0;

  // Shoot values
  var spacebar = false;
  var beamInterval = 25;
  var beamTimer = 0;
  var beamDespawnTime = 40;
  var beamVelocity = 15;
  var beamSize = [5, 10];
  var beamArray = [];
  var $beamElements = $(".beam");

  // Get left: & top: CSS values
  shipPosition[0] = parseFloat($ship.css("left").match(/\d/g).join(""));
  shipPosition[1] = parseFloat($ship.css("top").match(/\d/g).join(""));

  // Get Cos(theta) from the transformation matrix
  // var shipTheta = parseFloat($ship.css("transform").split("(")[1].split(")")[0].split(",")[0]);

  // Convert to theta, then convert from radians to degrees
  // shipTheta = Math.round(Math.acos(shipTheta) * (180/Math.PI))
  shipTheta = 0;

  // Gives random value between a minimum and maximum
  function randomValue(min, max) {
    var output = Math.floor((Math.random() * (max - min + 1)) + min);
    return output;
  }

  function sinDeg(angle) {
    return Math.sin(angle * (Math.PI / 180));
  }

  function cosDeg(angle) {
    return Math.cos(angle * (Math.PI / 180));
  }

  function pythagoras(a, b) {
    return Math.sqrt(a**2 + b**2);
  }

  // Sets value to true if true if key has been pressed down
  $(document).keydown(function(event) {
    switch(event.which) {
      case 87: // w
        wasdKeys[0] = true;
        break;

      case 65: // a
        wasdKeys[1] = true;
        break;

      case 83: // s
        wasdKeys[2] = true;
        break;

      case 68: // d
        wasdKeys[3] = true;
        break;

      case 32: // spacebar
        spacebar = true;
        break;

      default: return;
    }
    event.preventDefault();
  });

  // Sets value to false if key has been released
  $(document).keyup(function(event) {
    switch(event.which) {
      case 87: // w
        wasdKeys[0] = false;
        break;

      case 65: // a
        wasdKeys[1] = false;
        break;

      case 83: // s
        wasdKeys[2] = false;
        break;

      case 68: // d
        wasdKeys[3] = false;
        break;

      case 32: //spacebar
        spacebar = false;
        beamTimer = 0;
        break;

        default: return;
    }
    event.preventDefault();
  });

  // Moves ship based on velocity
  function changeShipMovement() {
    if (shipTotalV < 0.2) {
      shipVelocity[0] = 0;
      shipVelocity[1] = 0;
    }

    // Generates new Position
    var newShipPosition = [null, null];
    newShipPosition[0] = shipPosition[0] + (shipVelocity[0] * (refreshTime / 40));
    newShipPosition[1] = shipPosition[1] + (shipVelocity[1] * (refreshTime / 40));


    var deltaX = 0.5 * (  (shipSize[0] * cosDeg(shipTheta))  -  (shipSize[1] * sinDeg(shipTheta))  );
    var deltaY = 0.5 * (  (shipSize[1] * cosDeg(shipTheta))  +  (shipSize[0] * sinDeg(shipTheta))  );

    // Checks if new position causes center of ship to move outside the screen.
    if ((0 < (newShipPosition[0] + deltaX) && (newShipPosition[0] - deltaX) < 700) && (0 < (newShipPosition[1] + deltaY) && (newShipPosition[1] - deltaY) < 700)) {
      shipPosition[0] = newShipPosition[0];
      shipPosition[1] = newShipPosition[1];
      $ship.css({"left": shipPosition[0] + "px", "top": shipPosition[1] + "px"});

    } else {
      shipVelocity[0] = 0;
      shipVelocity[1] = 0;
    }

  }

  function playThrusters() {
    $(".sound-thrust")[0].play();
  }

  function pauseThrusters() {
    $(".sound-thrust")[0].pause();
  }

  function playGas() {
    $(".sound-turn")[0].play();
  }

  function pauseGas() {
    $(".sound-turn")[0].pause();
    $(".sound-turn")[0].currentTime = 0;
  }

  // Calculates new velocity for ship
  function changeShipVelocity(direction) {
    playThrusters();
    var newShipVelocity = [null, null];
    newShipVelocity[0] = shipVelocity[0] + (direction * baseVelocity * sinDeg(shipTheta));
    newShipVelocity[1] = shipVelocity[1] - (direction * baseVelocity * cosDeg(shipTheta));
    var newShipTotalV = pythagoras(newShipVelocity[0], newShipVelocity[1]);

    // Increases velocity if max velocity hasn't been reached.
    if (newShipTotalV >= maxShipVelocity) {
      shipVelocity[0] *= maxShipVelocity / shipTotalV;
      shipVelocity[1] *= maxShipVelocity / shipTotalV;
    } else {
      shipVelocity[0] = newShipVelocity[0];
      shipVelocity[1] = newShipVelocity[1];
    }
      shipTotalV = pythagoras(shipVelocity[0], shipVelocity[1]);
  }

  // Calculates new ship angle
  function changeShipRotation(direction) {
    playGas();
    shipTheta += direction * 5;
    if (shipTheta < 0) {
      shipTheta += 360;
    }

    if (shipTheta >= 360) {
      shipTheta -= 360;
    }
    $ship.css("transform", "rotate(" + shipTheta + "deg)");
  }

  // Asteroid constructor function
  var Asteroid = function(position, velocity, radius, enteredCenter, aliveTime) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.enteredCenter = enteredCenter;
    this.aliveTime = aliveTime;
  }

  var Beam = function(position, velocity, aliveTime) {
    this.position = position;
    this.velocity = velocity;
    this.aliveTime = aliveTime;
  }

  function makeBeam() {
    var velocity = [null, null];
    velocity[0] = beamVelocity * cosDeg(shipTheta - 90);
    velocity[1] = beamVelocity * sinDeg(shipTheta - 90);

    var position = [null, null];
    position[0] = shipPosition[0] + (0.5 * shipSize[0]) + (0.5 * shipSize[1] * sinDeg(shipTheta)) + (0.5 * beamSize[1] * sinDeg(shipTheta)) - (0.5 * beamSize[0]);

    position[1] = shipPosition[1] + (0.5 * shipSize[1]) - (0.5 * shipSize[1] * cosDeg(shipTheta)) - (0.5 * beamSize[1] * cosDeg(shipTheta)) - (0.5 * beamSize[1]);

    var newBeam = new Beam(position, velocity, 0);
    var $beamDiv = $('<div class="beam"></div>');

    $(".screen").append($beamDiv);
    beamArray.push(newBeam);
    $beamElements = $(".beam");
    $beamElements.last().css({"left": newBeam.position[0] + "px", "top": newBeam.position[1] + "px", "height": beamSize[1], "width": beamSize[0], "transform": "rotate(" + shipTheta + "deg)"});
  }

  function fireBeam() {
    // console.log(beamTimer);
    if (beamTimer == 0) {
      makeBeam();
      beamTimer = beamInterval;
    } else {
      beamTimer--;
    }
  }

  // Makes an asteroid
  function makeAsteroid() {

    // Makes variables for random new asteroids
    var startAngle = randomValue(0, 360);
    var velocityAngleMax = startAngle + 90 + (Math.asin(viewingCircleRadius/spawnCircleRadius) * (180/Math.PI));
    var velocityAngleMin = startAngle + 90 - (Math.asin(viewingCircleRadius/spawnCircleRadius) * (180/Math.PI));
    var velocityAngle = randomValue(velocityAngleMin, velocityAngleMax);
    var velocityTotal = randomValue(asteroidVelocityRange[0], asteroidVelocityRange[1]);
    var deathTime = (spawnCircleRadius * 4) / velocityTotal;
    var velocity = [null, null];
    velocity[0] = velocityTotal * cosDeg(velocityAngle);
    velocity[1] = velocityTotal * sinDeg(velocityAngle);

    var radius = randomValue(asteroidRadiusRange[0], asteroidRadiusRange[1]);
    var position = [null, null];
    position[0] = (viewingCircleRadius - radius) + (spawnCircleRadius * sinDeg(startAngle));
    position[1] = (viewingCircleRadius - radius) - (spawnCircleRadius * cosDeg(startAngle));

    // Makes new asteroid
    var newAsteroid = new Asteroid(position, velocity, radius, false, 0);
    var $asteroidDiv = $('<div class="asteroid"></div>');

    $($asteroidDiv).hide().appendTo(".screen").fadeIn(1000);

    // $(".screen").append($asteroidDiv);
    asteroidArray.push(newAsteroid);
    $asteroidElements = $(".asteroid");
    // $asteroidElements.last().fadeIn();



    $asteroidElements.last().css({"left": newAsteroid.position[0] + "px", "top": newAsteroid.position[1] + "px", "height": radius*2, "width": radius*2});

  }

  // Moves asteroid based on velocity
  function asteroidMovement() {
    for (var i = 0; i < asteroidArray.length; i++) {
      var asteroid = asteroidArray[i];
      var $asteroidElements = $(".asteroid");
      asteroid.position[0] += asteroid.velocity[0] * (refreshTime / 40);
      asteroid.position[1] += asteroid.velocity[1] * (refreshTime / 40);
      $asteroidElements.eq(i).css({"left": asteroid.position[0] + "px", "top": asteroid.position[1] + "px", "height": asteroid.radius*2 + "px", "width": asteroid.radius*2 + "px"});
    }
  }

  function beamMovement() {
    for (var i = 0; i < beamArray.length; i++) {
      var beam = beamArray[i];
      var $beamElements = $(".beam");
      beam.position[0] += beam.velocity[0] * (refreshTime / 40);
      beam.position[1] += beam.velocity[1] * (refreshTime / 40);
      $beamElements.eq(i).css({"left": beam.position[0] + "px", "top": beam.position[1] + "px", "height": beamSize[1] + "px", "width": beamSize[0] + "px"});
    }
  }

  // function firePositionMovement() {
  //   var position = [null, null];
  //   // position[0] = shipPosition[0] + (0.5 * shipSize[0] * cosDeg(shipTheta)) + (0.5 * beamSize[1] * sinDeg(shipTheta)) - (0.5 * beamSize[0]);
  //   //
  //   // position[1] = shipPosition[1] + (0.5 * shipSize[0] * sinDeg(shipTheta)) - (0.5 * beamSize[1] * cosDeg(shipTheta)) - (0.5 * beamSize[1]);
  //
  //   position[0] = shipPosition[0] + (0.5 * shipSize[0]) + (0.5 * shipSize[1] * sinDeg(shipTheta)) + (beamSize[1] * sinDeg(shipTheta)) - (0.5 * beamSize[0] * cosDeg(shipTheta));
  //
  //   position[1] = shipPosition[1] + (0.5 * shipSize[1]) - (0.5 * shipSize[1] * cosDeg(shipTheta)) - (beamSize[1] * cosDeg(shipTheta)) - (0.5 * beamSize[0] * sinDeg(shipTheta));
  //
  //   var $fireElements = $(".fire-position");
  //   $fireElements.eq(0).css({"left": position[0] + "px", "top": position[1] + "px", "height": "2px", "width": "2px"});
  // }



  // Test if the ship has collided with an asteroid
  function asteroidCollision() {
    // Get coordinates of ship rectangle
    var shipPoints = [null, null, null, null]
    shipPoints[0] = [shipPosition[0], shipPosition[1]];
    shipPoints[1] = [shipPosition[0], shipPosition[1] + shipSize[1]];
    shipPoints[2] = [shipPosition[0] + shipSize[0], shipPosition[1]];
    shipPoints[3] = [shipPosition[0] + shipSize[0], shipPosition[1] + shipSize[1]];

    // Get coordinates of center of ship
    var shipCenter = [null, null];
    shipCenter[0] = shipPosition[0] + (0.5 * shipSize[0]);
    shipCenter[1] = shipPosition[1] + (0.5 * shipSize[1]);

    // Translate ship coordinates to be centered on origin
    var shipPointsTranslated = [null, null, null, null];
    for (i in shipPointsTranslated) {
      shipPointsTranslated[i] = [null, null];
      shipPointsTranslated[i][0] = shipPoints[i][0] - shipCenter[0];
      shipPointsTranslated[i][1] = shipPoints[i][1] - shipCenter[1];
    }

    // Rotate ship coordinates
    var shipPointsRotated = [null, null, null, null];
    for (var i = 0; i < shipPointsRotated.length; i++) {
      shipPointsRotated[i] = [null, null];
      shipPointsRotated[i][0] = (shipPointsTranslated[i][0] * cosDeg(shipTheta)) - (shipPointsTranslated[i][1] * sinDeg(shipTheta));
      shipPointsRotated[i][1] = (shipPointsTranslated[i][0] * sinDeg(shipTheta)) + (shipPointsTranslated[i][1] * cosDeg(shipTheta));
    }

    // Translate ship coordinates back to actual position
    var shipPointsReTranslated = [null, null, null, null];
    for (var i = 0; i < shipPointsReTranslated.length; i++) {
      shipPointsReTranslated[i] = [null, null];
      shipPointsReTranslated[i][0] = shipPointsRotated[i][0] + shipCenter[0];
      shipPointsReTranslated[i][1] = shipPointsRotated[i][1] + shipCenter[1];
    }

    // Calculate gradients of each ship line
    var shipLineGradients = [null, null, null, null];
    for (var i = 0; i < shipLineGradients.length; i++) {
      i = parseInt(i);
      shipLineGradients[i] = ((shipPointsReTranslated[(i + 1) % 4][1]) - (shipPointsReTranslated[i][1])) / ((shipPointsReTranslated[(i + 1) % 4][0]) - (shipPointsReTranslated[i][0]));
    }

    // Calculate constants of each ship line
    var shipLineConstants = [null, null, null, null];
    for (var i = 0; i < shipLineConstants.length; i++) {
      shipLineConstants[i] = shipPointsReTranslated[i][1] - (shipLineGradients[i] * shipPointsReTranslated[i][0]);
    }

    // Calculates if ship lines and asteroid circle intersect
    for (var i = 0; i < asteroidArray.length; i++) {
      // Set up some constants for the quadratic equation formula
      var r = asteroidArray[i].radius;
      var lr = asteroidArray[i].position[0] + r;
      var tr = - asteroidArray[i].position[1] - r;

      for (var j = 0; j < shipLineGradients.length; j++) {
        // More constants
        var j = parseInt(j);
        var m = shipLineGradients[j];
        var c = shipLineConstants[j];

        var x2Const = (m**2) + 1;
        var x1Const = 2 * ((m * c) + (m * tr) - lr);
        var x0Const = (lr**2) + (c**2) + (tr**2) - (r**2) + (2 * c * tr);

        // The positions of any intersections
        var xPlusPos = (- x1Const + Math.sqrt((x1Const**2) - (4 * x2Const * x0Const))) / (2 * x2Const);
        var xMinusPos = (- x1Const - Math.sqrt((x1Const**2) - (4 * x2Const * x0Const))) / (2 * x2Const);

        // Collision occurs if intersection is between ends of ship lines
        if ( (Math.abs(shipPointsReTranslated[j][0] - xMinusPos) > 0.1) || (Math.abs(shipPointsReTranslated[j][0] - xPlusPos) > 0.1) || (Math.abs(shipPointsReTranslated[(j + 1) % 4][0] - xMinusPos) > 0.1) || (Math.abs(shipPointsReTranslated[(j + 1) % 4][0] - xPlusPos) > 0.1) ) {
          if (xMinusPos < shipPointsReTranslated[j][0] && shipPointsReTranslated[j][0] < xPlusPos) {
            gameOver = true;
          }

          if (xMinusPos < shipPointsReTranslated[(j + 1) % 4][0] && shipPointsReTranslated[(j + 1) % 4][0] < xPlusPos) {
            gameOver = true;
          }
        }
      }
    }
  }

  // Despawns asteroid
  function asteroidDespawn() {
    var newAsteroidArray = [];

    for (var i = 0; i < asteroidArray.length; i++) {
      var asteroid = asteroidArray[i];
      asteroid.aliveTime++;
      var xCoord = asteroid.position[0];
      var yCoord = asteroid.position[1];
      var distanceFromCenter = pythagoras(xCoord - viewingCircleRadius + asteroid.radius, yCoord - viewingCircleRadius + asteroid.radius);

      // Keeps track if asteroid has entered screen yet
      if (distanceFromCenter <= viewingCircleRadius) {
        asteroid.enteredCenter = true;
      }

      // Despawns asteroid if it exits the screen after entering it, or if it's alive for too long (To fix a bug where they didn't despawn)
      if (((distanceFromCenter >= spawnCircleRadius) && asteroid.enteredCenter == true) || (asteroid.aliveTime >= ((spawnCircleRadius * 6) / asteroidVelocityRange[0])) ) {
        $asteroidElements.eq(i).addClass("remove-asteroid");
      } else {
        newAsteroidArray.push(asteroidArray[i]);
      }

    }

    // Does the despawning
    asteroidArray = newAsteroidArray;
    $(".remove-asteroid").remove();
    $asteroidElements = $(".asteroid");
  }

  function beamDespawn() {
    var newBeamArray = [];

    for (var i = 0; i < beamArray.length; i++) {
      var beam = beamArray[i];
      if (beam.aliveTime >= beamDespawnTime) {
        $beamElements.eq(i).addClass("remove-beam");
      } else {
        beam.aliveTime++
        newBeamArray.push(beam);
      }
    }

    // Does the despawning
    beamArray = newBeamArray;
    $(".remove-beam").remove();
    $beamElements = $(".beam");
  }


  // makeAsteroid();

  // Increases score
  function scoreCounter() {
    if (scoreWaitCount == scoreWait) {
      score += 10;
      scoreWaitCount = 0;
    } else {
      scoreWaitCount++
    }

    $(".score").html("Score: " + score);

  }



  // Starts the game
  function startAsteroids() {
    $(".instructions").css("display", "none");
    $(".screen").css("display", "inline-block");
    $(".score").css("display", "block");
    $(".reset-button").css("display", "block");
    gameState = 1;
  }

  $(".start-button").click(startAsteroids);

  // Resets game on button press
  function resetAsteroids() {
    resetTimes = 0;
    shipVelocity = [null, null]
    asteroidArray = [];
    gameOver = false;
    shipTotalV = null;
    shipPosition = [335, 335]
    $(".asteroid").remove();
    $asteroidElements = $(".asteroid");
    shipTheta = 0;
    $ship.css("transform", "rotate(" + shipTheta + "deg)");
    $ship.css({"left": "335px", "top": "335px"});
    scoreWaitCount = 0;
    score = 0;
    var wasdKeys = [false, false, false, false];
    gameState = 0;

    $(".instructions").css("display", "block");
    $(".game-over").css("display", "none");
    $(".score").css("display", "none");
    $(".reset-button").css("display", "none");
    $(".start-button").css("display", "block");
    gameState = 0;
  }

  $(".reset-button").click(resetAsteroids);

  function gameFinished() {
    gameState = 2;
    $(".screen").css("display", "none");
    $(".score").css("display", "none");
    $(".reset-button").css("display", "block");
    $(".game-over").css("display", "inline-block");
    $(".game-over p").html("Your Score: " + score);
    pauseGas();
    pauseThrusters();
  }

  // Runs the game
  function runAsteroids() {
    if (gameState == 1) {
      if (gameOver == false && resetTimes == 0) {
        // Applies slowdown
        shipVelocity[0] *= shipDampening;
        shipVelocity[1] *= shipDampening;

        // Increases velocity/changes rotation on keypress
        if (wasdKeys[0] == true) {
          changeShipVelocity(1);
        }

        if (wasdKeys[1] == true) {
          changeShipRotation(-1);
        }

        if (wasdKeys[2] == true) {
          changeShipVelocity(-1);
        }

        if (wasdKeys[3] == true) {
          changeShipRotation(1);
        }

        if (wasdKeys[0] == false && wasdKeys[2] == false) {
          pauseThrusters();
        }

        if (wasdKeys[1] == false && wasdKeys[3] == false) {
          pauseGas();
        }

        if (spacebar == true) {
          fireBeam();
        }

        // Moves ships & asteroid, asteroid collision, asteroid despawn
        changeShipMovement();
        asteroidMovement();
        asteroidCollision();
        asteroidDespawn();
        beamMovement();
        beamDespawn();
        // firePositionMovement();

        // Makes new asteroid after random time
        if (currentTime > timeToSpawn) {
          makeAsteroid();
          currentTime = 0;
          timeToSpawn = randomValue(asteroidSpawnTime[0], asteroidSpawnTime[1]);
        } else {
          currentTime += refreshTime;
        }

        // Increases score
        scoreCounter();

        // On Collision, game over
      } else if (gameOver == true && resetTimes == 0){
        gameFinished();
        $(".score").html("GAME OVER. Your Score: " + score);
        resetTimes = 1;
        gameState = 2;
      }

      // The setInterval that runs the game
    }
  }

  var refreshInterval = setInterval(runAsteroids, refreshTime);

});
