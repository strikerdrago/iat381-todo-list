angular.module('starter.controllers', [])

// all controllers located here as done by Ionic Framework

.controller('HomeCtrl', function($scope, $state) {
  $scope.changeState = function () {
      console.log("edit mode on!");
      $state.go('edit');
  };

  paper.install(window);
  paper.setup('rainBalls');
  var path = new Path.Rectangle([75, 75], [100, 100]);
  path.strokeColor = 'black';

  view.onFrame = function(event) {
    // On each frame, rotate the path by 3 degrees:
    path.rotate(3);
  }
})

.controller('EditCtrl', function($scope, $state) {
  $scope.changeState = function () {
      console.log("back to the main");
      $state.go('home');
  };
});
