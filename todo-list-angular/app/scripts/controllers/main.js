// 'use strict';

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
    
    // var hammertime = new Hammer(document.getElementById('rainBalls'));
    // hammertime.on('pan', function(ev) {
    //     console.log(ev);
    //     alert('HUHAHAHA');
    // });

    // init();
    // function init(){
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
      // }

      view.onFrame = function(event) {
        // On each frame, rotate the path by 3 degrees:
        path.rotate(3);
        // if (!tapped){
          for (var i = 0; i < balls.length - 1; i++) {
            for (var j = i + 1; j < balls.length; j++) {
            balls[i].react(balls[j]);
            }
          }
          for (var i = 0, l = balls.length; i < l; i++) {
            balls[i].iterate();
          }
        // }
        
        if (balls.length != 0){
          noitemsoverlay.style.display = "none";
        } else {
          noitemsoverlay.style.display = "block";
        }
      }

      // kynd.info 2014

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
      mc.add( new Hammer.Press({ time: '200' }) );
      mc.add( new Hammer.Tap({ event: 'singletap' }) );


      function Ball(r, p, v, textInput) {
        this.radius = r;
        this.point = p;
        this.vector = v;
        this.maxVec = 2;
        this.numSegment = Math.floor(r / 3 + 2);
        this.boundOffset = [];
        this.boundOffsetBuff = [];
        this.sidePoints = [];
        this.weight = -0.1;


        // this.textInput = textInput;
        // console.log(this.textInput);

        
        // console.log(textInput);
        this.path = new Path({
          fillColor: {
            hue: Math.round((this.radius/120)*360),//Math.random() * 360,
            saturation: 1,
            brightness: 1
          }//,
          // blendMode: 'screen'
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
        this.tempPath = this.path.clone();
        
        this.textInput = textInput;
        this.textInput.justification = 'left';
        this.textInput.content = "";
        this.textInput.bringToFront();
        this.textInput.position.x -= this.radius;

        // Make clipping path visable
        var tempGroup = new Group([this.tempPath,this.textInput]);
        tempGroup.clipped = true;

        paper.view.draw();
      }

      Ball.prototype = {
        iterate: function() {
          this.checkBorders();
          if (this.vector.length > this.maxVec)
            this.vector.length = this.maxVec;
          this.point += this.vector;
          this.vector.y += this.weight;
          this.textInput.point = this.point;
          this.textInput.point.x -= this.radius - 10;
          this.textInput.point.y += 10;
          this.updateShape();
        },

        checkBorders: function() {
          var size = view.size;

          if (this.point.x < this.radius) {
            this.point.x = this.radius;
            // this.vector.angle = 180-this.vector.angle;
          }

          if (this.point.x > size.width - this.radius) {
            this.point.x = size.width - this.radius;
            // this.vector.angle = 180-this.vector.angle;
          }

          if (this.point.y < this.radius) {
            this.point.y = this.radius;
            // this.vector.angle = -this.vector.angle;
          }

          if (this.point.y > size.height - this.radius) {
            this.point.y = size.height - this.radius;
            // this.vector.angle = -this.vector.angle;
          }
        },

        updateShape: function() {
          var segments = this.path.segments;
          for (var i = 0; i < this.numSegment; i ++)
            segments[i].point = this.getSidePoint(i);

          this.path.smooth();
          this.tempPath.smooth();
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

          var segmentsOverlay = this.tempPath.segments;
          for (var i = 0; i < this.numSegment; i ++)
            segmentsOverlay[i].point = this.getSidePoint(i);

          this.tempPath.smooth();
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

      //--------------------- main ---------------------

      var balls = [];
      // var numBalls = 3;
      // for (var i = 0; i < numBalls; i++) {
      //  var position = Point.random() * view.size;
      //  var vector = new Point({
      //    angle: 360 * Math.random(),
      //    length: Math.random() * 10
      //  });
      //  var radius = Math.random() * 60 + 60;
      //  var textInput = 'derp';
      //  balls.push(new Ball(radius, position, vector));
      // }
      mc.on("panstart panmove panend", onPan);
      mc.on('pinchstart pinchmove pinchend', onPinch);
      // mc.on("press pressup", onPress);
      mc.on("singletap", onTap);

      var interactingWithExistingCircle = false;
      var creatingCircle = false;
      var currentBall;
      var tempWeight;
      var tempVector;
      var minRadius = 60;
      var maxRadius = 120;
      var tempText = '';
      var overlay = document.getElementById("overlay");
      var overlayDisplay = document.getElementById("overlay").style.display;
      var noitemsoverlay = document.getElementById("noitemstext");
      // var todofield = document.getElementById("todofield");
      var currentBallIndex;

      var tapped = false;

      function onTap(ev) {

        if(ev.type == 'singletap') {
          // loop through the balls array
            for (var i = 0; i < balls.length; i++) {
              // check if the pinch point was in a circle
              if (inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y)) {
                currentBall = balls[i];
                // currentBall.path.fillColor = 'blue';
                interactingWithExistingCircle = true;
                currentBallIndex = balls.indexOf(currentBall);
                tapped = true;
                tappedTodo();
                break;
              }
            }
        }

      }

      function onPinch(ev) {
        // console.log(ev);


        if(ev.type == 'pinchstart') {
          // loop through the balls array
          for (var i = 0; i < balls.length; i++) {
            // check if the pinch point was in a circle
            if (inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y) && !interactingWithExistingCircle) {
              // console.log('ball center: ' + balls[i].point.x + ', ' + balls[i].point.y + ', radius is ' + balls[i].radius);
              // console.log('pinch center: ' + ev.center.x + ', ' + ev.center.y);
              currentBall = balls[i];
              // currentBall.path.fillColor = 'black';
              interactingWithExistingCircle = true;
              tempText = currentBall.textInput.content;

              // save the current weight and stuff
              tempVector = currentBall.vector;
              tempWeight = currentBall.weight;

              // make the ball stop trying to move while being dragged or whatever
              currentBall.vector = new Point({
                angle: 0,
                length: 0
              });
              currentBall.weight = 0;
              break;
            }
          }

          // if not pinching in an existing circle
          if (!interactingWithExistingCircle) {
            creatingCircle = true;
            var radius = Math.random() * 60 + 60;
            var position = new Point(ev.center.x, ev.center.y);
            var tempBall = new Ball(
              radius, 
              position, 
              new Point({
                angle: 360 * Math.random(),
                length: Math.random() * 10
              }),
              new PointText({
                fillColor: '#ffffff',
                fontFamily: 'Open Sans',
                fontWeight: 'bold',
                fontSize: 18
            }));
            balls.push(tempBall);
            tempText = tempBall.textInput.content;


            currentBallIndex = balls.indexOf(tempBall);
            // tapped = true;
            // tappedTodo();
            // var tempGroup = new Group([text1,text2]);
            // tempGroup.position += 50;

            // balls.push(new Ball(
            //   radius,
            //   position,
            //   new Point({
            //     angle: 360 * Math.random(),
            //     length: Math.random() * 10
            //   }),
            //   'derp'
            // ));
          }
        }

        else if (ev.type == 'pinchmove') {
          if (interactingWithExistingCircle) {
            currentBall.radius = ev.scale*50;

            if (currentBall.radius < minRadius) {
              currentBall.path.fillColor = '#ff0000';
              currentBall.textInput.content = 'DELETE!';
            }

            else if (currentBall.radius > maxRadius) {
              // currentBall.path.fillColor = 'green';
              currentBall.radius = maxRadius;
              currentBall.path.fillColor.hue = String(Math.round((currentBall.radius/120)*360));
              if (!creatingCircle) {
                currentBall.textInput.content = tempText;
              }
              else {
                currentBall.textInput.content = tempText;
              }
            }
            else {
              // console.log(String(Math.round((currentBall.radius/120)*360)+50));
              currentBall.path.fillColor.hue = String(Math.round((currentBall.radius/120)*360));
              if (!creatingCircle) {
                currentBall.textInput.content = tempText;
              }
              else {
                currentBall.textInput.content = tempText;
              }
            }
          }
        }

        else if (ev.type == 'pinchend') {
          // remove the ball if it's too small
          if (currentBall) {
            if (currentBall.radius < minRadius) {
              var index = balls.indexOf(currentBall);
              currentBall.path.remove();
              currentBall.tempPath.remove();
              currentBall.textInput.remove();
              // console.log('index: ' + index);
              if (index > -1) {
                  balls.splice(index, 1);
              }
            }
          }

          if (creatingCircle) {
            creatingCircle = false;
            // if (currentBall) {
            //   if (currentBall.radius > minRadius) {
            //     tapped = true;
            //     tappedTodo();
            //   }
            // }
            // else {
            //   tapped = true;
            //   tappedTodo();
            // }
          }

          if (tempVector && tempWeight && currentBall) {
            currentBall.vector = tempVector;
            currentBall.weight = tempWeight;
          }

          tempVector = null;
          tempWeight = null;
          interactingWithExistingCircle = false;
          currentBall = null;
        }
      }

      function onPan(ev) {
          if(ev.type == 'panstart') {
          // loop through the balls array
          for (var i = 0; i < balls.length; i++) {
            // check if the pinch point was in a circle
            if (inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y) && !interactingWithExistingCircle) {
              currentBall = balls[i];
              // currentBall.path.fillColor = 'red';
              interactingWithExistingCircle = true;

              // save the current weight and stuff
              tempVector = currentBall.vector;
              tempWeight = currentBall.weight;

              // make the ball stop trying to move while being dragged or whatever
              currentBall.vector = new Point({
                angle: 0,
                length: 0
              });
              currentBall.weight = 0;

              break;
            }
          }
        }

        else if (ev.type == 'panmove') {
          if (interactingWithExistingCircle) {
            currentBall.point.x = ev.center.x;
            currentBall.point.y = ev.center.y;
          }
        }

        else if (ev.type == 'panend') {
          // remove the ball if it's too small
          if (currentBall) {
            if (currentBall.radius < minRadius) {
              var index = balls.indexOf(currentBall);
              currentBall.path.remove();
              currentBall.tempPath.remove();
              currentBall.textInput.remove();
              // console.log('index: ' + index);
              if (index > -1) {
                  balls.splice(index, 1);
              }
            }
          }

          if (creatingCircle) {
            creatingCircle = false;
            // if (currentBall) {
            //   if (currentBall.radius > minRadius) {
            //     tapped = true;
            //     tappedTodo();
            //   }
            // }
            // else {
            //   tapped = true;
            //   tappedTodo();
            // }
          }

          if (tempVector && tempWeight && currentBall) {
            currentBall.vector = tempVector;
            currentBall.weight = tempWeight;
          }
          tempVector = null;
          tempWeight = null;
          interactingWithExistingCircle = false;
          currentBall = null;
        }
      }

      function onFrame() {
        // if (!tapped){
        //   for (var i = 0; i < balls.length - 1; i++) {
        //     for (var j = i + 1; j < balls.length; j++) {
        //     balls[i].react(balls[j]);
        //     }
        //   }
        //   for (var i = 0, l = balls.length; i < l; i++) {
        //     balls[i].iterate();
        //   }
        // }
        
        // if (balls.length != 0){
        //   noitemsoverlay.style.display = "none";
        // } else {
        //   noitemsoverlay.style.display = "block";
        // }
      }

      // function to check if a point is inside a circle
      function inCircle(center_x, center_y, radius, x, y) {
        var dx = Math.abs(x-center_x);
        var dy = Math.abs(y-center_y);
        var R = radius;

        // if the distance from the point to the X center point, its not in the circle
        if (dx>R) {
          return false;
        }
        // if the distance from the point to the Y center point, its not in the circle
        if (dy>R) {
          return false;
        }
        if (dx + dy <= R) {
          return true;
        }
        // Pythagoras
        if (dx^2 + dy^2 <= R^2) {
          return true;
        }
        else {
          return false;
        }
      }

      function tappedTodo(){
        var ballIndex = currentBallIndex;
        var tempContent = "";

        console.log(balls[ballIndex].textInput.content);
        tempContent = balls[ballIndex].textInput.content;
        // todofield.value = tempContent;
        // console.log(overlay.style.display);
        // overlay.style.display = "block";
        // $( "#overlay" ).toggleClass( "shown" );
        // $( "#todolist" ).show();
        // console.log("hsl("+balls[ballIndex].path.fillColor.hue+", 100%, 50%)");
        // $( "#overlay" ).css("background-color", "hsl("+balls[ballIndex].path.fillColor.hue+", 75%, 50%)");
      }

      // Text Input script currently in progress
      function textEditSubmit() {
        var ballIndex = currentBallIndex;
        console.log(ballIndex);
        if (balls.length > 0) {
           // console.log(balls[ballIndex].textInput.content);
           // tempContent = balls[ballIndex].textInput.content;
        }
        tapped = false;
        interactingWithExistingCircle = false;
        // balls[ballIndex].textInput.content = todofield.value;
        // overlay.style.display = "none";
        // $( "#overlay" ).toggleClass( "shown" );
        // $( "#todolist" ).hide();
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

    paper.view.draw();

});
