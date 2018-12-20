$(function() {

  // Ship Variables
  function setShipVariables() {
    $ship = $(".ship");
    shipSize = [30, 67];
    $ship.css({"width": shipSize[0] + "px", "height": shipSize[1] + "px"});
    baseVelocity = 1;
    shipVelocity = [null, null]
    wasdKeys = [false, false, false, false];
    refreshTime = 20;
    maxShipVelocity = 10;
    shipTotalV = null;
    shipDampening = 0.985;
    initialShipPosition = [335, 335];
    shipPosition = initialShipPosition;
    shipTheta = 0;
  }
  setShipVariables();

  // Asteroid Variables
  function setAsteroidVariables() {
    asteroidVelocityRange = [8, 13];
    asteroidRadiusRange = [30, 150];
    refreshTime = 17;
    viewingCircleRadius = 350;
    spawnCircleRadius = 645;
    asteroidArray = [];
    $asteroidElements = $(".asteroid");
    asteroidSpawnTime = [500, 1000];
  }
  setAsteroidVariables();


  // Game variables
  function setGameVariables() {
    gameOver = false;
    resetTimes = 0;
    gameState = 0;

    // Initial asteroid spawn values
    currentTime = 0;
    timeToSpawn = 0;

    // Initial score value
    score = 0;
    $(".score").html("Score: " + score);
  }
  setGameVariables();

  // Beam values
  function setBeamVariables() {
    spacebar = false;
    beamInterval = 25;
    beamTimer = 0;
    beamDespawnTime = 40;
    beamVelocity = 15;
    beamSize = [10, 30];
    beamArray = [];
    $beamElements = $(".beam");
  }
  setBeamVariables();

  // Gives random value between a minimum and maximum
  function randomValue(min, max) {
    var output = Math.floor((Math.random() * (max - min + 1)) + min);
    return output;
  }

  // Calculates sine of an angle in degrees
  function sinDeg(angle) {
    return Math.sin(angle * (Math.PI / 180));
  }

  // Calculates cosine of an angle in degrees
  function cosDeg(angle) {
    return Math.cos(angle * (Math.PI / 180));
  }

  // Calculates the hypotenuse of a triangle of sides a & b
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

  function playBeam() {
    pauseBeam();
    $(".sound-beam")[0].volume = 0.7;
    $(".sound-beam")[0].play();
  }

  function pauseBeam() {
    $(".sound-beam")[0].pause();
    $(".sound-beam")[0].currentTime = 0;
  }

  function playGameOver() {
    pauseGameOver();
    $(".sound-gameover")[0].play();
  }

  function pauseGameOver() {
    $(".sound-gameover")[0].pause();
    $(".sound-gameover")[0].currentTime = 0;
  }

  function playButtonClick() {
    pauseButtonClick();
    $(".sound-buttonclick")[0].play();
  }

  function pauseButtonClick() {
    $(".sound-buttonclick")[0].pause();
    $(".sound-buttonclick")[0].currentTime = 0;
  }

  function playAsteroidHit() {
    pauseAsteroidHit();
    $(".sound-asteroidhit")[0].volume = 0.7;
    $(".sound-asteroidhit")[0].play();
  }

  function pauseAsteroidHit() {
    $(".sound-asteroidhit")[0].pause();
    $(".sound-asteroidhit")[0].currentTime = 0;
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

  // Laser beam constructor function
  var Beam = function(position, velocity, aliveTime, theta) {
    this.position = position;
    this.velocity = velocity;
    this.aliveTime = aliveTime;
    this.theta = theta;
  }

  // Makes a laser beam
  function makeBeam() {
    var velocity = [null, null];
    var beamTheta = shipTheta;
    velocity[0] = beamVelocity * cosDeg(beamTheta - 90);
    velocity[1] = beamVelocity * sinDeg(beamTheta - 90);

    var position = [null, null];
    position[0] = shipPosition[0] + (0.5 * shipSize[0]) + (0.5 * shipSize[1] * sinDeg(beamTheta)) + (0.5 * beamSize[1] * sinDeg(beamTheta)) - (0.5 * beamSize[0]);

    position[1] = shipPosition[1] + (0.5 * shipSize[1]) - (0.5 * shipSize[1] * cosDeg(beamTheta)) - (0.5 * beamSize[1] * cosDeg(beamTheta)) - (0.5 * beamSize[1]);

    var newBeam = new Beam(position, velocity, 0, beamTheta);
    var $beamDiv = $('<div class="beam"></div>');

    $(".screen").append($beamDiv);
    beamArray.push(newBeam);
    $beamElements = $(".beam");
    $beamElements.last().css({"left": newBeam.position[0] + "px", "top": newBeam.position[1] + "px", "height": beamSize[1], "width": beamSize[0], "transform": "rotate(" + beamTheta + "deg)"});
  }

  // Determines when to make a laser beam
  function fireBeam() {
    // console.log(beamTimer);
    if (beamTimer == 0) {
      makeBeam();
      playBeam();
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

    $($asteroidDiv).hide().appendTo(".screen").fadeIn(500);
    asteroidArray.push(newAsteroid);
    $asteroidElements = $(".asteroid");
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

  // Moves laser beam based on velocity
  function beamMovement() {
    for (var i = 0; i < beamArray.length; i++) {
      var beam = beamArray[i];
      var $beamElements = $(".beam");
      beam.position[0] += beam.velocity[0] * (refreshTime / 40);
      beam.position[1] += beam.velocity[1] * (refreshTime / 40);
      $beamElements.eq(i).css({"left": beam.position[0] + "px", "top": beam.position[1] + "px", "height": beamSize[1] + "px", "width": beamSize[0] + "px"});
    }
  }

  // Finds the 4 corner coordinates of a rectangle of known position and size
  function initialRectanglePoints(position, size) {
    var points = new Array(4);
    points[0] = [position[0], position[1]];
    points[1] = [position[0], position[1] + size[1]];
    points[2] = [position[0] + size[0], position[1]];
    points[3] = [position[0] + size[0], position[1] + size[1]];

    return points;
  }

 // Centres these points around the origin
  function centreOnOrigin(points, center) {
    var pointsCentered = new Array(points.length);
    for (var i = 0; i < points.length; i++) {
      pointsCentered[i] = [null, null];
      pointsCentered[i][0] = points[i][0] - center[0];
      pointsCentered[i][1] = points[i][1] - center[1];
    }

    return pointsCentered;
  }

 // Rotates these points around the origin
  function rotateAroundOrigin(points, angle) {
    var pointsRotated = new Array(points.length);
    for (var i = 0; i < points.length; i++) {
      pointsRotated[i] = [null, null];
      pointsRotated[i][0] = (points[i][0] * cosDeg(angle)) - (points[i][1] * sinDeg(angle));
      pointsRotated[i][1] = (points[i][0] * sinDeg(angle)) + (points[i][1] * cosDeg(angle));
    }

    return pointsRotated;
  }

  // Calculates the gradients between points
  function calculateGradients(points) {
    var gradients = new Array(points.length);
    for (var i = 0; i < points.length; i++) {
      i = parseInt(i);
      gradients[i] = ((points[(i + 1) % 4][1]) - (points[i][1])) / ((points[(i + 1) % 4][0]) - (points[i][0]));

      if (gradients[i] == "Infinity") {
        gradients[i] = 1000000;
      }
      if (gradients[i] == "-Infinity") {
        gradients[i] = -1000000;
      }
    }

    return gradients;
  }

  // Calculates the constant in the equation of a line
  function calculateConstants(points, gradients) {
    var constants = new Array(points.length);
    for (var i = 0; i < constants.length; i++) {
      constants[i] = points[i][1] - (gradients[i] * points[i][0]);
    }

    return constants;
  }

  // Calculates if circle i intersects with line j
  function calculateIntersections(gradients, constants, circles, i, j) {
    var r = circles[i].radius;
    var lr = circles[i].position[0] + r;
    var tr = - circles[i].position[1] - r;
    var j = parseInt(j);
    var m = gradients[j];
    var c = constants[j];
    var x2Const = (m**2) + 1;
    var x1Const = 2 * ((m * c) + (m * tr) - lr);
    var x0Const = (lr**2) + (c**2) + (tr**2) - (r**2) + (2 * c * tr);
    var xPlusPos = (- x1Const + Math.sqrt((x1Const**2) - (4 * x2Const * x0Const))) / (2 * x2Const);
    var xMinusPos = (- x1Const - Math.sqrt((x1Const**2) - (4 * x2Const * x0Const))) / (2 * x2Const);
    return [xMinusPos, xPlusPos];
  }

  function intersectBetweenPoints(lineEnds, intersectPos, i) {
    if (
      (
        (Math.abs(lineEnds[i][0] - intersectPos[0]) > 0.1) ||
        (Math.abs(lineEnds[i][0] - intersectPos[1]) > 0.1) ||
        (Math.abs(lineEnds[(i + 1) % 4][0] - intersectPos[0]) > 0.1) ||
        (Math.abs(lineEnds[(i + 1) % 4][0] - intersectPos[1]) > 0.1)
      ) && (
        (intersectPos[0] < lineEnds[i][0] && lineEnds[i][0] < intersectPos[1]) ||
        (intersectPos[0] < lineEnds[(i + 1) % 4][0] && lineEnds[(i + 1) % 4][0] < intersectPos[1])
      )
    ) {
      return true;

    } else {
      return false;
    }
  }

  // Test if the ship has collided with an asteroid
  function asteroidCollision() {
    // Get coordinates of ship rectangle
    var shipPoints = initialRectanglePoints(shipPosition, shipSize);

    // Get coordinates of center of ship
    var shipCenter = [null, null];
    shipCenter[0] = shipPosition[0] + (0.5 * shipSize[0]);
    shipCenter[1] = shipPosition[1] + (0.5 * shipSize[1]);

    // Translate points to center
    var shipPointsCentered = centreOnOrigin(shipPoints, shipCenter);

    // Rotate ship coordinates
    var shipPointsRotated = rotateAroundOrigin(shipPointsCentered, shipTheta);

    // Translate ship coordinates back to actual position
    var negativeShipCenter = shipCenter.map(function(e) {return (e * -1)});
    var shipPointsUnCentered = centreOnOrigin(shipPointsRotated, negativeShipCenter);

    // Calculate gradients of each ship line
    var shipLineGradients = calculateGradients(shipPointsUnCentered);

    // Calculate constants of each ship line
    var shipLineConstants = calculateConstants(shipPointsUnCentered, shipLineGradients);

    // Calculates if ship lines and asteroid circle intersect
    for (var i = 0; i < asteroidArray.length; i++) {

      for (var j = 0; j < shipLineGradients.length; j++) {

        var xIntersectPos = calculateIntersections(shipLineGradients, shipLineConstants, asteroidArray, i, j);

        if(intersectBetweenPoints(shipPointsUnCentered, xIntersectPos, j)) {
          gameOver = true;
        }
      }
    }
  }

  function beamCollision() {
    var beamsToRemove = [];
    var asteroidsToRemove = [];

    for (var i = 0; i < beamArray.length; i++) {
      var beam = beamArray[i];
      var beamTheta = beam.theta;

      // Initial beam points
      var beamPoints = initialRectanglePoints(beam.position, beamSize);

      // Get coordinates of center of beam
      var beamCentre = [null, null];
      beamCentre[0] = beamPoints[0][0] + (0.5 * beamSize[0]);
      beamCentre[1] = beamPoints[0][1] + (0.5 * beamSize[1]);

      // Translate beam coordinates to be centered on origin
      var beamPointsCentered = centreOnOrigin(beamPoints, beamCentre);

      // Rotate beam coordinates
      var beamPointsRotated = rotateAroundOrigin(beamPointsCentered, beamTheta)

      // Translate beam coordinates back to actual position
      var negativeBeamCentre = beamCentre.map(function(e) {return (e * -1)});
      var beamPointsUnCentered = centreOnOrigin(beamPointsRotated, negativeBeamCentre);

      // Calculate gradients of each beam line
      var beamLineGradients = calculateGradients(beamPointsUnCentered);

      // Calculates constants of each beam line
      var beamLineConstants = calculateConstants(beamPointsUnCentered, beamLineGradients);

      // Calculates if ship lines and asteroid circle intersect
      for (var j = 0; j < asteroidArray.length; j++) {
        var asteroidShot = false;

        for (var k = 0; k < beamLineGradients.length; k++) {
          var xIntersectPos = calculateIntersections(beamLineGradients, beamLineConstants, asteroidArray, j, k);

          // Collision occurs if intersection is between ends of beam lines
          if (intersectBetweenPoints(beamPointsUnCentered, xIntersectPos, k)) {

            if (asteroidShot == false) {
              score += 10;
              $(".score").html("Score: " + score);
              playAsteroidHit();
              asteroidShot = true;
            }

            $beamElements.eq(i).addClass("remove-beam");
            $asteroidElements.eq(j).addClass("remove-asteroid");
            beamsToRemove.push(i);
            asteroidsToRemove.push(j);

          }
        }
      }
    }

    var newBeamArray = [];
    var newAsteroidArray = [];

    // Creates a new array of beam elements excluding beams that collided
    for (var i = 0; i < beamArray.length; i++) {
      var putIntoArray = true;

      for (var j = 0; j < beamsToRemove.length; j++) {
        if (beamsToRemove[j] == i) {
          putIntoArray = false;
        }
      }

      if (putIntoArray == true) {
        newBeamArray.push(beamArray[i]);
      }
    }

    // Creates a new array of asteroid elements excluding asteroids that were destroyed
    for (var i = 0; i < asteroidArray.length; i++) {
      var putIntoArray = true;

      for (var j = 0; j < asteroidsToRemove.length; j++) {
        if (asteroidsToRemove[j] == i) {
          putIntoArray = false;
        }
      }

      if (putIntoArray == true) {
        newAsteroidArray.push(asteroidArray[i]);
      }
    }

    // Does the despawning
    beamArray = newBeamArray;
    asteroidArray = newAsteroidArray;
    $(".remove-beam").remove();
    $(".remove-asteroid").remove();
    $beamElements = $(".beam");
    $asteroidElements = $(".asteroid");
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

  // Despawns asteroid
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

  // Starts the game
  function startAsteroids() {
    playButtonClick();
    $(".instructions").css("display", "none");
    $(".screen").css("display", "inline-block");
    $(".score").css("display", "block");
    $(".reset-button").css("display", "block");
    gameState = 1;
  }

  $(".start-button").click(startAsteroids);

  // Resets game on button press
  function resetAsteroids() {
    playButtonClick();
    resetTimes = 0;
    shipVelocity = [null, null]
    asteroidArray = [];
    beamArray = [];
    gameOver = false;
    shipTotalV = null;
    shipPosition = [335, 335]
    $(".asteroid").remove();
    $asteroidElements = $(".asteroid");
    $(".beam").remove();
    $beamElements = $(".beam");
    shipTheta = 0;
    $ship.css("transform", "rotate(" + shipTheta + "deg)");
    $ship.css({"left": "335px", "top": "335px"});
    score = 0;
    $(".score").html("Score: " + score);
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

  // Shows game over screen
  function gameFinished() {
    gameState = 2;
    $(".screen").css("display", "none");
    $(".score").css("display", "none");
    $(".reset-button").css("display", "block");
    $(".game-over").css("display", "inline-block");
    $(".game-over p").html("Your Score: " + score);
    pauseThrusters();
    playGameOver();
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

        if (spacebar == true) {
          fireBeam();
        }

        // Moves ships & asteroid, asteroid collision, asteroid despawn
        changeShipMovement();
        beamMovement();
        beamCollision();
        beamDespawn();
        asteroidMovement();
        asteroidCollision();
        asteroidDespawn();

        // Makes new asteroid after random time
        if (currentTime > timeToSpawn) {
          makeAsteroid();
          currentTime = 0;
          timeToSpawn = randomValue(asteroidSpawnTime[0], asteroidSpawnTime[1]);
        } else {
          currentTime += refreshTime;
        }

        // On Collision, game over
      } else if (gameOver == true && resetTimes == 0){
        gameFinished();
        resetTimes = 1;
        gameState = 2;
      }
    }
  }

  // The setInterval that runs the game
  var refreshInterval = setInterval(runAsteroids, refreshTime);

});
