$(function() {
  var asteroidVx = 0;
  var asteroidVy = -6;
  var asteroidVelocityRange = [6, 12];
  var asteroidRadiusRange = [30, 150];
  var refreshTime = 17;
  var viewingCircleRadius = 350;
  var spawnCircleRadius = 645;
  var asteroidArray = [];
  var asteroidElements = $(".asteroid");


  var Asteroid = function(position, velocity, radius) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
  }

  function makeAsteroid() {
    var startAngle = Math.floor((Math.random() * 360));
    // var startAngle = 270;
    // console.log(startAngle);

    var velocityAngleMax = startAngle + 90 + (Math.asin(viewingCircleRadius/spawnCircleRadius) * (180/Math.PI));
    var velocityAngleMin = startAngle + 90 - (Math.asin(viewingCircleRadius/spawnCircleRadius) * (180/Math.PI));
    var velocityAngle = Math.floor((Math.random() * (velocityAngleMax - velocityAngleMin + 1)) + velocityAngleMin);
    // console.log(velocityAngleMax + " " + velocityAngleMin);
    var velocityTotal = Math.floor((Math.random() * (asteroidVelocityRange[1] - asteroidVelocityRange[0] + 1)) + asteroidVelocityRange[0]);
    console.log(velocityTotal);
    var velocity = [null, null];
    velocity[0] = velocityTotal * Math.cos(velocityAngle * (Math.PI/180));
    velocity[1] = velocityTotal * Math.sin(velocityAngle * (Math.PI/180));

    var radius = Math.floor((Math.random() * asteroidRadiusRange[1] - asteroidRadiusRange[0] + 1) + asteroidRadiusRange[0]);

    var position = [null, null];
    position[0] = (viewingCircleRadius - radius) + (spawnCircleRadius * Math.sin(startAngle * (Math.PI/180)));
    position[1] = (viewingCircleRadius - radius) - (spawnCircleRadius * Math.cos(startAngle * (Math.PI/180)));

    var newAsteroid = new Asteroid(position, velocity, radius);
    var $asteroidDiv = $('<div class="asteroid"></div>');
    $(".screen").append($asteroidDiv);

    asteroidArray.push(newAsteroid);
    asteroidElements = $(".asteroids");
    asteroidElements.last().css({"left": newAsteroid.position[0] + "px", "top": newAsteroid.position[1] + "px", "height": radius*2, "width": radius*2});

  }


  // Moves ship based on velocity
  function asteroidMovement(i, asteroid) {
    $asteroidElements = $(".asteroid");
    asteroid.position[0] += asteroid.velocity[0] * (refreshTime / 40);
    asteroid.position[1] += asteroid.velocity[1] * (refreshTime / 40);
    $asteroidElements.eq(i).css({"left": asteroid.position[0] + "px", "top": asteroid.position[1] + "px", "height": asteroid.radius*2, "width": asteroid.radius*2});
  }

  makeAsteroid();
  // makeAsteroid();
  // makeAsteroid();


  // refresh rate
  setInterval(function() {

    // for (var i in asteroidList) {
    //   asteroidMovement($asteroidList[i], i);
    // }

    // $asteroidList.each(function(i, asteroid) {
    //   asteroidMovement(i, asteroid);
    // });

    for (var i in asteroidArray) {
      asteroidMovement(i, asteroidArray[i]);
    }

  }, refreshTime);









});
