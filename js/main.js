$(function() {
  var $ship = $(".ship");
  var shipSize = [30, 50];
  $ship.css({"width": shipSize[0] + "px", "height": shipSize[1] + "px"});
  var baseVelocity = 1;
  var shipVelocity = [null, null]
  var wasdKeys = [false, false, false, false];
  var refreshTime = 17;
  var maxShipVelocity = 10;
  var shipTotalV = null;
  var shipDampening = 0.985;
  var shipPosition = [null, null]

  var asteroidVelocityRange = [6, 12];
  var asteroidRadiusRange = [30, 150];
  var refreshTime = 17;
  var viewingCircleRadius = 350;
  var spawnCircleRadius = 645;
  var asteroidArray = [];
  var $asteroidElements = $(".asteroid");

  var collision = false;

  var asteroidSpawnTime = [500, 1500];

  // Get left: & top: CSS values
  shipPosition[0] = parseFloat($ship.css("left").match(/\d/g).join(""));
  shipPosition[1] = parseFloat($ship.css("top").match(/\d/g).join(""));

  // Get Cos(theta) from the transformation matrix
  var shipTheta = parseFloat($ship.css("transform").split("(")[1].split(")")[0].split(",")[0]);

  // Convert to theta, then convert from radians to degrees
  shipTheta = Math.round(Math.acos(shipTheta) * (180/Math.PI))

  // Gives random value between a minimum and maximum
  function randomValue(min, max) {
    var output = Math.floor((Math.random() * (max - min + 1)) + min);
    return output;
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

    var newShipPosition = [null, null];
    newShipPosition[0] = shipPosition[0] + (shipVelocity[0] * (refreshTime / 40));
    newShipPosition[1] = shipPosition[1] + (shipVelocity[1] * (refreshTime / 40));

    var deltaX = 0.5 * (  (shipSize[0] * Math.cos(shipTheta * (Math.PI/180)) )  -  (shipSize[1] * Math.sin(shipTheta * (Math.PI/180)) )  );
    var deltaY = 0.5 * (  (shipSize[1] * Math.cos(shipTheta * (Math.PI/180)) )  +  (shipSize[0] * Math.sin(shipTheta * (Math.PI/180)) )  );

    if ((0 < (newShipPosition[0] + deltaX) && (newShipPosition[0] - deltaX) < 700) && (0 < (newShipPosition[1] + deltaY) && (newShipPosition[1] - deltaY) < 700)) {
      shipPosition[0] = newShipPosition[0];
      shipPosition[1] = newShipPosition[1];
      $ship.css({"left": shipPosition[0] + "px", "top": shipPosition[1] + "px"});

    } else {
      shipVelocity[0] = 0;
      shipVelocity[1] = 0;
    }

  }

  // Calculates new velocity for ship
  function changeShipVelocity(direction) {
    var newShipVelocity = [null, null];
    newShipVelocity[0] = shipVelocity[0] + (direction * baseVelocity * Math.sin(shipTheta * (Math.PI/180)));
    newShipVelocity[1] = shipVelocity[1] - (direction * baseVelocity * Math.cos(shipTheta * (Math.PI/180)));
    var newShipTotalV = Math.sqrt((newShipVelocity[0]**2) + (newShipVelocity[1]**2));

    if (newShipTotalV >= maxShipVelocity) {
      shipVelocity[0] *= maxShipVelocity / shipTotalV;
      shipVelocity[1] *= maxShipVelocity / shipTotalV;
    } else {
      shipVelocity[0] = newShipVelocity[0];
      shipVelocity[1] = newShipVelocity[1];
    }
      shipTotalV = Math.sqrt((shipVelocity[0]**2) + (shipVelocity[1]**2));
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
  var Asteroid = function(position, velocity, radius, enteredCenter) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.enteredCenter = enteredCenter;
  }

  // Makes an asteroid
  function makeAsteroid() {
    var startAngle = Math.floor((Math.random() * 360));

    var velocityAngleMax = startAngle + 90 + (Math.asin(viewingCircleRadius/spawnCircleRadius) * (180/Math.PI));
    var velocityAngleMin = startAngle + 90 - (Math.asin(viewingCircleRadius/spawnCircleRadius) * (180/Math.PI));
    var velocityAngle = randomValue(velocityAngleMin, velocityAngleMax);
    var velocityTotal = randomValue(asteroidVelocityRange[0], asteroidVelocityRange[1]);
    var velocity = [null, null];
    velocity[0] = velocityTotal * Math.cos(velocityAngle * (Math.PI/180));
    velocity[1] = velocityTotal * Math.sin(velocityAngle * (Math.PI/180));

    var radius = randomValue(asteroidRadiusRange[0], asteroidRadiusRange[1]);

    var position = [null, null];
    position[0] = (viewingCircleRadius - radius) + (spawnCircleRadius * Math.sin(startAngle * (Math.PI/180)));
    position[1] = (viewingCircleRadius - radius) - (spawnCircleRadius * Math.cos(startAngle * (Math.PI/180)));

    var newAsteroid = new Asteroid(position, velocity, radius, false);
    var $asteroidDiv = $('<div class="asteroid"></div>');
    $(".screen").append($asteroidDiv);

    asteroidArray.push(newAsteroid);
    $asteroidElements = $(".asteroids");
    $asteroidElements.last().css({"left": newAsteroid.position[0] + "px", "top": newAsteroid.position[1] + "px", "height": radius*2, "width": radius*2});

  }

  // Moves asteroid based on velocity
  function asteroidMovement() {
    for (var i = 0; i < asteroidArray.length; i++) {
      var asteroid = asteroidArray[i];
      var $asteroidElements = $(".asteroid");
      asteroid.position[0] += asteroid.velocity[0] * (refreshTime / 40);
      asteroid.position[1] += asteroid.velocity[1] * (refreshTime / 40);
      $asteroidElements.eq(i).css({"left": asteroid.position[0] + "px", "top": asteroid.position[1] + "px", "height": asteroid.radius*2, "width": asteroid.radius*2});
    }
  }

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
      shipPointsRotated[i][0] = (shipPointsTranslated[i][0] * Math.cos(shipTheta * (Math.PI / 180))) - (shipPointsTranslated[i][1] * Math.sin(shipTheta * (Math.PI / 180)));
      shipPointsRotated[i][1] = (shipPointsTranslated[i][0] * Math.sin(shipTheta * (Math.PI / 180))) + (shipPointsTranslated[i][1] * Math.cos(shipTheta * (Math.PI / 180)));
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
        if ( (xMinusPos <= shipPointsReTranslated[j][0] && shipPointsReTranslated[j][0] <= xPlusPos) || (xMinusPos <= shipPointsReTranslated[(j + 1) % 4][0] && shipPointsReTranslated[(j + 1) % 4][0] <= xPlusPos) ) {
          console.log("Collision");
        }

      }
    }
  }

  function asteroidDespawn() {
    var newAsteroidArray = [];

    for (var i = 0; i < asteroidArray.length; i++) {
      var asteroid = asteroidArray[i];
      var xCoord = asteroid.position[0];
      var yCoord = asteroid.position[1];
      var distanceFromCenter = Math.sqrt((xCoord - viewingCircleRadius + asteroid.radius)**2 + (yCoord - viewingCircleRadius + asteroid.radius)**2);

      if (distanceFromCenter <= viewingCircleRadius) {
        asteroid.enteredCenter = true;
      }

      if ((distanceFromCenter >= spawnCircleRadius) && asteroid.enteredCenter == true) {
        $asteroidElements.eq(i).addClass("remove-asteroid");
      } else {
        newAsteroidArray.push(asteroidArray[i]);
      }

    }

    asteroidArray = newAsteroidArray;
    $(".remove-asteroid").remove();
    $asteroidElements = $(".asteroid");
  }

  makeAsteroid();
  var currentTime = 0;
  var timeToSpawn = randomValue(asteroidSpawnTime[0], asteroidSpawnTime[1]);

  // refresh rate
  setInterval(function() {
    shipVelocity[0] *= shipDampening;
    shipVelocity[1] *= shipDampening;

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

    changeShipMovement();
    asteroidMovement();
    asteroidCollision();
    asteroidDespawn();


    if (currentTime > timeToSpawn) {
      makeAsteroid();
      currentTime = 0;
      timeToSpawn = randomValue(asteroidSpawnTime[0], asteroidSpawnTime[1]);
    } else {
      currentTime += refreshTime;
    }


  }, refreshTime);







});
