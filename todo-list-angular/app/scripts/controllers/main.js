'use strict';

/**
 * @ngdoc function
 * @name todoListAngularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the todoListAngularApp
 */
angular.module('todoListAngularApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

  // element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);
  window.addEventListener('resize', resizeCanvas, false);

  init();
  function init(){
    // console.log("DERPDinosuar");
    // console.log($('#rainBalls').width());
    // $('#rainBalls').width(window.innerWidth);
    // $('#rainBalls').height(2500);
    // resize the canvas to fill browser window dynamically

    resizeCanvas();
    paper.install(window);
    paper.setup('rainBalls');

    var path = new paper.Path();
    // Give the stroke a color
    path.strokeColor = 'black';
    var start = new paper.Point(100, 100);
    // Move to start and draw a line from there
    path.moveTo(start);
    // Note that the plus operator on Point objects does not work
    // in JavaScript. Instead, we need to call the add() function:
    path.lineTo(start.add([ 200, -50 ]));
    // Draw the view now:
    paper.view.draw();
  }

  function resizeCanvas() {
    $('#rainBalls').width(window.innerWidth);
    $('#rainBalls').height(2500);

    /**
     * Your drawings need to be inside this function otherwise they will be reset when 
     * you resize the browser window and the canvas goes will be cleared.
     */
    // drawStuff(); 
  }
});
