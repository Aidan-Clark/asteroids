$(function() {
  var $ship = $(".ship");
  var baseMovement = 10;

  // Get left: & top: CSS values
  var shipX = parseFloat($ship.css("left").match(/\d/g).join(""));
  var shipY = parseFloat($ship.css("top").match(/\d/g).join(""));

  // Get Cos(theta) from the transformation matrix
  var shipTheta = parseFloat($ship.css("transform").split("(")[1].split(")")[0].split(",")[0]);

  // Convert to theta, then convert from radians to degrees
  shipTheta = Math.round(Math.acos(shipTheta) * (180/Math.PI))


  function moveForwards() {
    console.log(shipTheta);
    shipX += baseMovement * Math.sin(shipTheta * (Math.PI/180));
    shipY -= baseMovement * Math.cos(shipTheta * (Math.PI/180));
    $ship.css({"left": shipX + "px", "top": shipY + "px"})
  }

  function moveBackwards() {
    console.log(shipTheta);
    shipX -= baseMovement * Math.sin(shipTheta * (Math.PI/180));
    shipY += baseMovement * Math.cos(shipTheta * (Math.PI/180));
    $ship.css({"left": shipX + "px", "top": shipY + "px"})
  }

  function rotateLeft() {
    shipTheta -= 10;
    if (shipTheta < 0) {
      shipTheta += 360;
    }

    if (shipTheta >= 360) {
      shipTheta -= 360;
    }

    $ship.css("transform", "rotate(" + shipTheta + "deg)");
    console.log(shipTheta);
  }

  function rotateRight() {
    shipTheta += 10;
    if (shipTheta < 0) {
      shipTheta += 360;
    }

    if (shipTheta >= 360) {
      shipTheta -= 360;
    }
    $ship.css("transform", "rotate(" + shipTheta + "deg)");
    console.log(shipTheta);
  }

  $(document).keydown(function(event) {
    switch(event.which) {
        case 87: // w
          moveForwards();
          break;

        case 65: // a
          rotateLeft();
          break;

        case 83: // s
          moveBackwards();
          break;

        case 68: // d
          rotateRight();
          break;

        default: return; // exit this handler for other keys
    }
    event.preventDefault(); // prevent the default action (scroll / move caret)
  });




});
