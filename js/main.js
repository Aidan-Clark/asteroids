$(function() {
  var $ship = $(".ship");
  var baseMovement = 5;
  var baseVelocity = 1;
  var shipVx = 0;
  var shipVy = 0;
  var wasdKeys = [false, false, false, false];
  var refreshTime = 17;
  var maxVelocity = 10;
  var shipDampening = 0.985;

  // Get left: & top: CSS values
  var shipX = parseFloat($ship.css("left").match(/\d/g).join(""));
  var shipY = parseFloat($ship.css("top").match(/\d/g).join(""));

  // Get Cos(theta) from the transformation matrix
  var shipTheta = parseFloat($ship.css("transform").split("(")[1].split(")")[0].split(",")[0]);

  // Convert to theta, then convert from radians to degrees
  shipTheta = Math.round(Math.acos(shipTheta) * (180/Math.PI))

  function shipMovement() {
    shipX += shipVx * (refreshTime / 40);
    shipY += shipVy * (refreshTime / 40);
    $ship.css({"left": shipX + "px", "top": shipY + "px"});
  }

  function shipVelocity(direction) {
    var shipTotalV = Math.sqrt((shipVx**2) + (shipVy**2));
    var newShipVx = shipVx + (direction * baseVelocity * Math.sin(shipTheta * (Math.PI/180)));
    var newShipVy = shipVy - (direction * baseVelocity * Math.cos(shipTheta * (Math.PI/180)));
    var newShipTotalV = Math.sqrt((newShipVx**2) + (newShipVy**2));

    if (newShipTotalV >= maxVelocity) {
      shipVx *= maxVelocity / shipTotalV;
      shipVy *= maxVelocity / shipTotalV;
    } else {
      shipVx = newShipVx;
      shipVy = newShipVy;
    }
  }

  // Calculates new ship angle
  function shipRotation(direction) {
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
    shipVx *= shipDampening;
    shipVy *= shipDampening;

    if (wasdKeys[0] == true) {
      shipVelocity(1);
    }

    if (wasdKeys[1] == true) {
      shipRotation(-1);
    }

    if (wasdKeys[2] == true) {
      shipVelocity(-1);
    }

    if (wasdKeys[3] == true) {
      shipRotation(1);
    }

    shipMovement();

  }, refreshTime);

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








});
