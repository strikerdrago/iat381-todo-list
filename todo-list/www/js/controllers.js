angular.module('starter.controllers', [])

// all controllers located here as done by Ionic Framework

.controller('HomeCtrl', function($scope, $state) {
  $scope.changeState = function () {
      console.log("edit mode on!");
      $state.go('edit');
  }

  $scope.textInput = function(){
  	  
  };
})

.controller('EditCtrl', function($scope, $state) {
  $scope.changeState = function () {
      console.log("back to the main");
      $state.go('home');
  };
});
