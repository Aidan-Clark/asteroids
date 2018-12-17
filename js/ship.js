$(function() {
  var $ship = $(".ship");
  var baseVelocity = 1;
  var shipVelocity = [null, null]
  var wasdKeys = [false, false, false, false];
  var refreshTime = 17;
  var maxShipVelocity = 10;
  var shipTotalV = null;
  var shipDampening = 0.985;

  var shipPosition = [null, null]
  // Get left: & top: CSS values
  shipPosition[0] = parseFloat($ship.css("left").match(/\d/g).join(""));
  shipPosition[1] = parseFloat($ship.css("top").match(/\d/g).join(""));

  // Get Cos(theta) from the transformation matrix
  var shipTheta = parseFloat($ship.css("transform").split("(")[1].split(")")[0].split(",")[0]);

  // Convert to theta, then convert from radians to degrees
  shipTheta = Math.round(Math.acos(shipTheta) * (180/Math.PI))

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

    shipPosition[0] += shipVelocity[0] * (refreshTime / 40);
    shipPosition[1] += shipVelocity[1] * (refreshTime / 40);
    $ship.css({"left": shipPosition[0] + "px", "top": shipPosition[1] + "px"});
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

  }, refreshTime);









});
