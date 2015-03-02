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
			hue: 100,//Math.random() * 360,
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
	this.tempPath = this.path.clone();
	
	this.textInput = textInput;
	this.textInput.justification = 'left';
	this.textInput.content = "Hello World";
	this.textInput.bringToFront();
	this.textInput.position.x -= this.radius;

	// Make clipping path visable
	var tempGroup = new Group([this.tempPath,this.textInput]);
	tempGroup.clipped = true;
}

Ball.prototype = {
	iterate: function() {
		this.checkBorders();
		if (this.vector.length > this.maxVec)
			this.vector.length = this.maxVec;
		this.point += this.vector;
    this.vector.y += this.weight;
		this.textInput.point = this.point;
		this.textInput.point.x -= this.radius - 5;
		this.updateShape();
	},

	checkBorders: function() {
		var size = view.size;

		if (this.point.x < this.radius) {
			this.point.x = this.radius;
      this.vector.angle = 180-this.vector.angle;
    }

		if (this.point.x > size.width - this.radius) {
			this.point.x = size.width - this.radius;
      this.vector.angle = 180-this.vector.angle;
    }

		if (this.point.y < this.radius) {
			this.point.y = this.radius;
      this.vector.angle = -this.vector.angle;
    }

		if (this.point.y > size.height - this.radius) {
			this.point.y = size.height - this.radius;
      this.vector.angle = -this.vector.angle;
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
// 	var position = Point.random() * view.size;
// 	var vector = new Point({
// 		angle: 360 * Math.random(),
// 		length: Math.random() * 10
// 	});
// 	var radius = Math.random() * 60 + 60;
// 	var textInput = 'derp';
// 	balls.push(new Ball(radius, position, vector));
// }
mc.on("panstart panmove panend", onPan);
mc.on('pinchstart pinchmove pinchend', onPinch);

var interactingWithExistingCircle = false;
var currentBall;
var tempWeight;
var tempVector;

var text1 = new PointText({
			point: [50,50],
			content: 'test',
		    fillColor: 'black',
		    fontFamily: 'Courier New',
		    fontWeight: 'bold',
		    fontSize: 25
		});

var text2 = new PointText({
      point: [50,75],
      content: 'super long testing thing',
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontWeight: 'bold',
        fontSize: 25
    });
var group = new Group([text1,text2]);

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
        currentBall.path.fillColor = 'black';
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

    // if not pinching in an existing circle
    if (!interactingWithExistingCircle) {
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
          fillColor: 'black',
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize: 25
      }));
      balls.push(tempBall);
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
    }
  }

  else if (ev.type == 'pinchend') {
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
        currentBall.path.fillColor = 'red';
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

function onRotate(ev) {
}

function onFrame() {
  for (var i = 0; i < balls.length - 1; i++) {
    for (var j = i + 1; j < balls.length; j++) {
    balls[i].react(balls[j]);
    }
  }
  for (var i = 0, l = balls.length; i < l; i++) {
    balls[i].iterate();
  }
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