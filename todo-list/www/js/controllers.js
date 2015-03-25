angular.module('starter.controllers', [])

// all controllers located here as done by Ionic Framework

.controller('HomeCtrl', function($scope, $state) {
  $scope.changeState = function () {
      $state.go('edit');
  };
})

.controller('EditCtrl', function($scope, $state) {
  $scope.changeState = function () {
      $state.go('home');
  };
});
