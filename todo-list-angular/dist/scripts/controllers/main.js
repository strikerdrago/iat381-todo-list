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
});
