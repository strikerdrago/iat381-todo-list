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
    // console.log(hammertime);
    hammertime.on('pan', function(ev) {
        console.log(ev);
    });
    hammertime.on('pan', function(ev) {
        console.log(ev);
    });
    var mc = new Hammer.Manager(document.getElementById('rainBalls'),
  {
  recognizers: [
      // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
      // [Hammer.Rotate],
      [Hammer.Pinch, { enable: true }]//, ['rotate']],
      // [Hammer.Swipe,{ direction: Hammer.DIRECTION_HORIZONTAL }],
  ]
});
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan')]);

    mc.on("panstart panmove panend pinchstart pinchmove pinchend", onPan);

    function onPan(ev) {
      console.log(ev);
    }
    // console.log(mc);

    var balls = [];
    var numBalls = 18;
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

      // view.onFrame = function(event) {
      //   // On each frame, rotate the path by 3 degrees:
      //   path.rotate(3);
      // }

      view.onFrame = function(event) {
        for (var i = 0; i < balls.length - 1; i++) {
          for (var j = i + 1; j < balls.length; j++) {
            balls[i].react(balls[j]);
          }
        }
        for (var i = 0, l = balls.length; i < l; i++) {
          balls[i].iterate();
        }
      }

    //--------------------- main ---------------------


      for (var i = 0; i < numBalls; i++) {
        var position = Point.random() * view.size;
        var vector = new Point({
          angle: 360 * Math.random(),
          length: Math.random() * 10
        });
        var radius = Math.random() * 60 + 60;
        balls.push(new Ball(radius, position, vector));
      }      

      function Ball(r, p, v) {
      this.radius = r;
      this.point = p;
      this.vector = v;
      this.maxVec = 15;
      this.numSegment = Math.floor(r / 3 + 2);
      this.boundOffset = [];
      this.boundOffsetBuff = [];
      this.sidePoints = [];
      this.path = new Path({
        fillColor: {
          hue: Math.random() * 360,
          saturation: 1,
          brightness: 1
        },
        blendMode: 'screen'
      });

      for (var i = 0; i < this.numSegment; i ++) {
        this.boundOffset.push(this.radius);
        this.boundOffsetBuff.push(this.radius);
        this.path.add(new Point());
        this.sidePoints.push(new Point({
          angle: 360 / this.numSegment * i,
          length: 1
        }));
      }
    }

    Ball.prototype = {
      iterate: function() {
        this.checkBorders();
        if (this.vector.length > this.maxVec)
          this.vector.length = this.maxVec;
        this.point += this.vector;
        this.updateShape();
      },

      checkBorders: function() {
        var size = view.size;
        if (this.point.x < -this.radius)
          this.point.x = size.width + this.radius;
        if (this.point.x > size.width + this.radius)
          this.point.x = -this.radius;
        if (this.point.y < -this.radius)
          this.point.y = size.height + this.radius;
        if (this.point.y > size.height + this.radius)
          this.point.y = -this.radius;
      },

      updateShape: function() {
        var segments = this.path.segments;
        for (var i = 0; i < this.numSegment; i ++)
          segments[i].point = this.getSidePoint(i);

        this.path.smooth();
        for (var i = 0; i < this.numSegment; i ++) {
          if (this.boundOffset[i] < this.radius / 4)
            this.boundOffset[i] = this.radius / 4;
          var next = (i + 1) % this.numSegment;
          var prev = (i > 0) ? i - 1 : this.numSegment - 1;
          var offset = this.boundOffset[i];
          offset += (this.radius - offset) / 15;
          offset += ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3;
          this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
        }
      },

      react: function(b) {
        var dist = this.point.getDistance(b.point);
        if (dist < this.radius + b.radius && dist != 0) {
          var overlap = this.radius + b.radius - dist;
          var direc = (this.point - b.point).normalize(overlap * 0.015);
          this.vector += direc;
          b.vector -= direc;

          this.calcBounds(b);
          b.calcBounds(this);
          this.updateBounds();
          b.updateBounds();
        }
      },

      getBoundOffset: function(b) {
        var diff = this.point - b;
        var angle = (diff.angle + 180) % 360;
        return this.boundOffset[Math.floor(angle / 360 * this.boundOffset.length)];
      },

      calcBounds: function(b) {
        for (var i = 0; i < this.numSegment; i ++) {
          var tp = this.getSidePoint(i);
          var bLen = b.getBoundOffset(tp);
          var td = tp.getDistance(b.point);
          if (td < bLen) {
            this.boundOffsetBuff[i] -= (bLen  - td) / 2;
          }
        }
      },

      getSidePoint: function(index) {
        return this.point + this.sidePoints[index] * this.boundOffset[index];
      },

      updateBounds: function() {
        for (var i = 0; i < this.numSegment; i ++)
          this.boundOffset[i] = this.boundOffsetBuff[i];
      }
    };

      console.log(balls);
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
