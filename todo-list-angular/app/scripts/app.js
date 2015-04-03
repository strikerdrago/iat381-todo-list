'use strict';

/**
 * @ngdoc overview
 * @name todoListAngularApp
 * @description
 * # todoListAngularApp
 *
 * Main module of the application.
 */
var app = angular
  .module('todoListAngularApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'hmTouchEvents'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });


// app.directive('draw', function () {
//     return {
//         restrict: 'AEC',
//         link: function postLink(scope, element, attrs) {
//             var path;
//             var drag = false;

//             function mouseUp(event) {
//                 //Clear Mouse Drag Flag
//                 drag = false;
//             }

//             function mouseDrag(event) {
//                 if (drag) {
//                     path.add(new paper.Point(event.layerX, event.layerY));
//                     path.smooth();
//                 }
//             }

//             function mouseDown(event) {
//                 //Set  flag to detect mouse drag
//                 console.log(event);
//                 drag = true;
//                 path = new paper.Path();
//                 path.strokeColor = 'black';
//                 path.add(new paper.Point(event.layerX, event.layerY));
//             }

//             function initPaper() {
//                 paper.install(window);
//                 paper.setup('canvas');
//             }

//             element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag);

//             initPaper();

//         }
//     };
// });