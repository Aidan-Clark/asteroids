$(function() {
  var $ship = $(".ship");
  var baseMovement = 5;
  var shipVelocity = [0, 0];
  var kHeldDown = false;
  var wasdKeys = [false, false, false, false];

  // Get left: & top: CSS values
  var shipX = parseFloat($ship.css("left").match(/\d/g).join(""));
  var shipY = parseFloat($ship.css("top").match(/\d/g).join(""));

  // Get Cos(theta) from the transformation matrix
  var shipTheta = parseFloat($ship.css("transform").split("(")[1].split(")")[0].split(",")[0]);

  // Convert to theta, then convert from radians to degrees
  shipTheta = Math.round(Math.acos(shipTheta) * (180/Math.PI))


  function shipMovement(direction) {
    shipX += direction * baseMovement * Math.sin(shipTheta * (Math.PI/180));
    shipY -= direction * baseMovement * Math.cos(shipTheta * (Math.PI/180));
    $ship.css({"left": shipX + "px", "top": shipY + "px"});
  }

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

  setInterval(function() {
    if (wasdKeys[0] == true) {
      shipMovement(1);
    }

    if (wasdKeys[1] == true) {
      shipRotation(-1);
    }

    if (wasdKeys[2] == true) {
      shipMovement(-1);
    }

    if (wasdKeys[3] == true) {
      shipRotation(1);
    }

  }, 17);

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
