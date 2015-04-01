'use strict';

/**
 * @ngdoc function
 * @name todoListAngularApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the todoListAngularApp
 */
angular.module('todoListAngularApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
