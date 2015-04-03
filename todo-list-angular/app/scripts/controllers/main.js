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
    
    var hammertime = new Hammer(document.getElementById('rainBalls'));
    hammertime.on('pan', function(ev) {
        console.log(ev);
        alert('HUHAHAHA');
    });

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

      var path = new Path.Rectangle([75, 75], [100, 100]);
      path.strokeColor = 'black';

      view.onFrame = function(event) {
        // On each frame, rotate the path by 3 degrees:
        path.rotate(3);
      }


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
