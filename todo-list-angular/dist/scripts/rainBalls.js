// kynd.info 2014
var firstRun = true;

var dbName = 'dbtest';
var options = {
    version: 2,
    migration: {
        '1': function (database) {
            var objStore = database.createObjectStore('balltable', {keyPath: 'index', autoIncrement: true});
            
        },
        '2': function (database) {
            var objStore = database.createObjectStore('email', {keyPath: 'index'});
        }
    }
}

function pushEmail(email){
  sklad.open(dbName, options, function (err, conn) {
    // console.log("attempting to push your email");
    var data = {
      email: [{index: 1, value: email}
      ]
    };
    console.log(data);
    conn.upsert(data, function (err, upsertedKeys) {
        if (err) {
            throw new Error(err.message);
        }
        console.log("That was ball " + upsertedKeys + " in the db");
    })
  });
}

function pushBall(ball, index){
  sklad.open(dbName, options, function (err, conn) {
    console.log("attempting to push a single ball");
    var tempBall = JSON.parse(JSON.stringify(ball));
    console.log(tempBall);
    var data = {
      balltable: [{index: index, value: tempBall}
      ]
    };
    console.log(data);
    conn.upsert(data, function (err, upsertedKeys) {
        if (err) {
            throw new Error(err.message);
        }
        console.log("That was ball " + upsertedKeys + " in the db");
    })
  });
}

function pushBalls(balls){
  sklad.open(dbName, options, function (err, conn) {
    // console.log("attempting to push all the balls");
    var tempBalls = JSON.parse(JSON.stringify(balls));
    for (var i = 0; i < tempBalls.length; i++) {
      // console.log(tempBalls[i]);
      var balltable = {index:i, value:tempBalls[i]};
        conn.upsert('balltable', balltable, function (err, upsertedKeys) {
          if (err) {
              throw new Error(err.message);
          }
          // console.log("That was ball " + upsertedKeys + " in the db");
      });
    };
  });
}

function deleteBalls(){
  sklad.open(dbName, options, function (err, conn) {
    // console.log("attempting to delete balls");

    conn.clear('balltable', function (err) {
        if (err) {
            throw new Error(err.message);
        }
        // console.log("all clear!");
        // objects stores are empty
     });
  });
}


function getEmail(){
  // console.log("attempting to get balls");
    sklad.open(dbName, options, function (err, conn) {
      conn.get({
              email: {}
          }, function (err, data) {
              if (err) {
                  throw new Error(err.message);
              }
              // console.log("attempting to get email");
              if (data.email.length != 0){
                if (data.email[0].value.value != ""){
                  console.log("updating email");
                  userEmail = data.email[0].value.value;
                }
              }
              // console.log(data.email[0].value.value);
       });

  });
}

function getBalls(){
  // console.log("attempting to get balls");
    sklad.open(dbName, options, function (err, conn) {
      conn.get({
              balltable: {}
          }, function (err, data) {
              if (err) {
                  throw new Error(err.message);
              }
              // console.log(data.balltable);
              // data contains all needed records
              if (balls.length == 0 && data.balltable.length != 0){
                // console.log("we are happening");
                firstRun = false;
                data.balltable.forEach(function(element,index){
                    if (element.key >= 0){
                      var ballitem = element.value.value;
                      // console.log(ballitem);
                      var radius = ballitem.radius;
                      var position = new Point(ballitem.point[1], ballitem.point[2]);
                      // console.log(ballitem.vector);
                      var vector = new Point({
                        angle: 270,
                        length: 3
                      });
                      // console.log(vector);
                      
                      var textStyle = new PointText({
                          fillColor: '#ffffff',
                          fontFamily: 'Open Sans',
                          fontWeight: 'bold',
                          fontSize: 18
                      });

                      // console.log(ballitem.textInput[1].content);
                      var textInput = ballitem.textInput[1].content;
                      var nextText = ballitem.nextText[1].content;
                      // if (textInput = " "){
                      //   console.log("empty!");
                        // textInput = "hello world";
                      // }
                      var tempBall = new Ball(radius, position, vector, textStyle);
                      tempBall.textInput.content = textInput;
                      tempBall.nextText.content = nextText;

                      var timeInMs = ballitem.alarmTimeMilliseconds;
                      tempBall.alarmTimeMilliseconds = timeInMs;

                      if (timeInMs != undefined){
                        nextAlarm = new Date(timeInMs);
                        parsedAlarm = nextAlarm.toString();
                        parsedArray = parsedAlarm.split(" ", 5);
                        // console.log(parsedArray);
                        // monthdayParsed = nextAlarm.getMonth() + " " + nextAlarm.getDate();
                        // hmsParsed = nextAlarm.getHours() + ":"+ 
                        // nextAlarm.getMinutes()+":"+nextAlarm.getSeconds();
                        // console.log(monthdayParsed + " " + hmsParsed);
                        tempBall.timerText.content = parsedArray[4];
                        tempBall.dateText.content = parsedArray[1]+" "+parsedArray[2];
                        tempBall.timeUntilAlarm = ballitem.timeUntilAlarm;
                      }
                      // console.log(tempBall);
                      balls.push(tempBall);
                    }
                });
              } else if (data.balltable.length == 0){
                console.log("nothing here");
                firstRun = false;
              }
       });
       // conn.clear(['balltable'], function (err) {
       //      if (err) {
       //          throw new Error(err.message);
       //      }
            
       //      // objects stores are empty
       //  });
  });
}

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

function onFrame() {
  if (!tapped){
    for (var i = 0; i < balls.length - 1; i++) {
      for (var j = i + 1; j < balls.length; j++) {
      balls[i].react(balls[j]);
      }
    }
    for (var i = 0, l = balls.length; i < l; i++) {
      balls[i].iterate();

      // fire the alarm!
      if ((balls[i].timeUntilAlarm) && (balls[i].alarmTimeMilliseconds) && (balls[i].alarmTimeMilliseconds <= new Date().getTime())) {
        balls[i].alarmTimeMilliseconds = null;
        balls[i].timeUntilAlarm = null;
        balls[i].timeUntilAlarmUnits = null;

        balls[i].timerText.content = "";
        balls[i].dateText.content = "";
        pushBalls(balls);
        alert("To-do reminder: " + balls[i].textInput.content);
        
        // create a new instance of the Mandrill class with your API key
        if (userEmail) {
          // create a variable for the API call parameters
          var m = new mandrill.Mandrill('1v6xLdleNNB5t5G3RaHkBA');
          console.log(userEmail);
          var params = {
              "message": {
                  "from_email":"dannyblackstock@gmail.com",
                  "to":[{"email":userEmail}],
                  "subject": "To-do reminder: " + balls[i].textInput.content,
                  "text": "To-do reminder: " + balls[i].textInput.content
              }
          };

          m.messages.send(params, function(res) {
              // log(res);
              console.log(res);
          }, function(err) {
              // log(err);
              console.log(res);
          });
        }
      }
    }
  }
  
  if (balls.length != 0){
    noitemsoverlay.style.display = "none";
  } else {
    noitemsoverlay.style.display = "block";
    if (firstRun){
      getEmail();
      getBalls();
    }
  }
}

function Ball(r, p, v, textInput) {
  this.radius = r;
  this.point = p;
  this.vector = v;
  this.maxVec = 2;
  this.numSegment = 8;//Math.floor(r / 3 + 2);
  this.boundOffset = [];
  this.boundOffsetBuff = [];
  this.sidePoints = [];
  this.weight = -0.1;
  this.timeUntilAlarm;
  this.timeUntilAlarmUnits = "seconds";
  this.alarmTimeMilliseconds;

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
  // console.log(this.textInput);
  // this.textInput.bringToFront();
  this.textInput.position.x -= this.radius;
  this.nextText = textInput.clone();
  // change this to empty later, only have content when above 20 chars
  this.nextText.content = ""; 

  // clone = same properties at time of creation, 
  // but it starts blank since the content isn't set here
  this.timerText = textInput.clone();
  this.timerText.justification = 'center';
  this.timerText.fontSize = 12;

  this.timerText.content = this.alarmTimeMilliseconds == undefined ? "": new Date(this.alarmTimeMilliseconds);

  this.dateText = textInput.clone();
  this.dateText.justification = 'center';
  this.dateText.fontSize = 12;

  // console.log(this.textInput);
  // console.log(this.nextText);
  // console.log(this.timerText);

  // first object = clipping mask
  // the rest are displayed as normal
  var tempGroup = new Group([this.tempPath,this.textInput, this.nextText, this.timerText, this.dateText]);
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
    this.textInput.point.x -= this.radius - 15;
    this.textInput.point.y += 10;

    //new line
    this.nextText.point = this.point;
    this.nextText.point.x -= this.radius - 15;
    this.nextText.point.y += 30;
    this.nextText.fontSize = this.textInput.fontSize;

    this.timerText.point = this.point;
    // this.timerText.point.x += this.radius;
    this.timerText.point.y += this.radius - 25;

    this.dateText.point = this.point;
    this.dateText.point.y += this.radius - 45;
    // if (this.alarmTimeMilliseconds != undefined)
    //  console.log(new Date(this.alarmTimeMilliseconds));
    // this.timerText.content = this.alarmTimeMilliseconds == undefined ? "": this.alarmTimeMilliseconds;

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

    // if (this.point.y > size.height - this.radius) {
    //   this.point.y = size.height - this.radius;
    //   // this.vector.angle = -this.vector.angle;
    // }
  },

  updateShape: function() {
    var segments = this.path.segments;
    for (var i = 0; i < this.numSegment; i ++)
      segments[i].point = this.getSidePoint(i);

    // this.path.smooth();
    // this.tempPath.smooth();
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

    // this.tempPath.smooth();
    // for (var i = 0; i < this.numSegment; i ++) {
    //   if (this.boundOffset[i] < this.radius / 4)
    //     this.boundOffset[i] = this.radius / 4;
    //   var next = (i + 1) % this.numSegment;
    //   var prev = (i > 0) ? i - 1 : this.numSegment - 1;
    //   var offset = this.boundOffset[i];
    //   offset += (this.radius - offset) / 15;
    //   offset += ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3;
    //   this.boundOffsetBuff[i] = this.boundOffset[i] = offset;
    // }
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
var todofield = document.getElementById("todofield");
var numTimeUnits = $("#numTimeUnits");
var timeUnits = $("#timeUnits");
var scrolling = false;
var tapped = false;
var userEmail;

function onTap(ev) {

  if(ev.type == 'singletap') {
    // loop through the balls array
      for (var i = 0; i < balls.length; i++) {
        // check if the pinch point was in a circle
        if (inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y + paper.view.bounds.y)) {
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
      if (inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y + paper.view.bounds.y) && !interactingWithExistingCircle) {
        // console.log('ball center: ' + balls[i].point.x + ', ' + balls[i].point.y + ', radius is ' + balls[i].radius);
        // console.log('pinch center: ' + ev.center.x + ', ' + ev.center.y);
        currentBall = balls[i];
        console.log("I am in ball " + i);
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
      var position = new Point(ev.center.x, ev.center.y + paper.view.bounds.y);
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
    }
  }

  else if (ev.type == 'pinchmove') {
    if (interactingWithExistingCircle) {
      // console.log(ev);
      currentBall.radius = ev.scale*50;

      if (currentBall.radius < minRadius) {
        currentBall.path.fillColor = '#ff0000';
        currentBall.textInput.content = 'DELETE!';
        currentBall.nextText.visible = false;
        currentBall.timerText.visible = false;
        currentBall.dateText.visible = false;
      }

      else if (currentBall.radius > maxRadius) {
        // currentBall.path.fillColor = 'green';
        currentBall.radius = maxRadius;
        currentBall.path.fillColor.hue = String(Math.round((currentBall.radius/120)*360));
        // console.log(currentBall.textInput.fontSize);
        currentBall.nextText.visible = true;
        currentBall.timerText.visible = true;
        currentBall.dateText.visible = true;
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
        // console.log(currentBall.radius);
        // console.log(currentBall.textInput.fontSize);
        // console.log(currentBall.textInput.content.length);
        currentBall.nextText.visible = true;
        currentBall.timerText.visible = true;
        currentBall.dateText.visible = true;
        currentBall.textInput.fontSize = (currentBall.radius/120)*18;

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
    interactionEnd();
  }
}

function onPan(ev) {
    if(ev.type == 'panstart') {
    // loop through the balls array
    for (var i = 0; i < balls.length; i++) {
      // check if the pinch point was in a circle
      if (inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y + paper.view.bounds.y) && !interactingWithExistingCircle) {
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
      else if ((!inCircle(balls[i].point.x, balls[i].point.y, balls[i].radius, ev.center.x, ev.center.y + paper.view.bounds.y) && !interactingWithExistingCircle)) {
        scrolling = true;
        // console.log(ev);
        if ((paper.view.bounds.y + (-ev.deltaY/10)) > 0) {
          paper.view.scrollBy(new Point(0, -ev.deltaY/10));
          // console.log(paper.view.bounds);
        }
      }
    }
  }

  else if (ev.type == 'panmove') {
    if (interactingWithExistingCircle) {
      currentBall.point.x = ev.center.x;
      currentBall.point.y = ev.center.y + paper.view.bounds.y;

      // console.log(paper.view.bounds);

      // scroll down 7px at a time if the user ius holding the circle near the bottom of the view
      if (currentBall.point.y > (paper.view.bounds.height + paper.view.bounds.y - 50)) {
        paper.view.scrollBy(new Point(0, 7));
      }
      // scroll up 7px at a time if the user is holding the circle near the bottom of the view, 
      // and its not past the "top edge"
      else if ((currentBall.point.y < (paper.view.bounds.y + 50)) &&  (paper.view.bounds.y -5 > 0)) {
        paper.view.scrollBy(new Point(0, -7));
      }
    }
    else {
      if ((paper.view.bounds.y + (-ev.deltaY/10)) > 0) {
        paper.view.scrollBy(new Point(0, -ev.deltaY/10));
        // console.log(paper.view.bounds);
      }
    }
  }

  else if (ev.type == 'panend') {
    interactionEnd();
  }
}

function interactionEnd() {
  // remove the ball if it's too small
  var index;
  if (currentBall) {
    index = balls.indexOf(currentBall);
    if (currentBall.radius < minRadius) {
      // var index = balls.indexOf(currentBall);
      currentBall.path.remove();
      currentBall.tempPath.remove();
      currentBall.textInput.remove();
      // console.log('index: ' + index);
      if (index > -1) {
          balls.splice(index, 1);
          deleteBalls();
      }
    }
  }

  if (creatingCircle) {
    creatingCircle = false;
    if (currentBall) {
      if (currentBall.radius > minRadius) {
        tapped = true;
        tappedTodo();
      }
    }
    else {
      tapped = true;
      tappedTodo();
    }
  }

  if (tempVector && tempWeight && currentBall) {
    currentBall.vector = tempVector;
    currentBall.weight = tempWeight;
  }
  tempVector = null;
  tempWeight = null;
  interactingWithExistingCircle = false;
  currentBall = null;
  scrolling = false;

  console.log(index);
  // Checks to see if a ball is interacting
  // subsequently updates all the balls in the db
  if(index != undefined){
    // console.log(balls[index]);
    pushBalls(balls);
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

tappedTodo = function(){
  var ballIndex = currentBallIndex;
  var tempContent = "";

  console.log(balls[ballIndex].textInput.content);
  tempContent = balls[ballIndex].textInput.content + balls[ballIndex].nextText.content;
  todofield.value = tempContent;

  // numTimeUnits.value = balls[ballIndex].timeUntilAlarm;
  numTimeUnits.val(balls[ballIndex].timeUntilAlarm);

  $("#email-field").val(userEmail);

  if (numTimeUnits.val()) {
    $("#remind-me-button").hide();
    $("#timer-container").show();
  }
  else {
    $("#remind-me-button").show();
    $("#timer-container").hide();
  }

  // console.log(overlay.style.display);
  // overlay.style.display = "block";
  $( "#overlay" ).toggleClass( "shown" );
  $( "#todolist" ).show();
  // console.log("hsl("+balls[ballIndex].path.fillColor.hue+", 100%, 50%)");
  $( "#overlay" ).css("background-color", "hsl("+balls[ballIndex].path.fillColor.hue+", 75%, 50%)");
}

// Text Input script currently in progress
textEditSubmit = function() {
  var ballIndex = currentBallIndex;
  console.log(ballIndex);
  if (balls.length > 0) {
     // console.log(balls[ballIndex].textInput.content);
     // tempContent = balls[ballIndex].textInput.content;
  }
  tapped = false;
  interactingWithExistingCircle = false;
  balls[ballIndex].textInput.content = todofield.value;

  // parse time units with base 10
  balls[ballIndex].timeUntilAlarm = +(numTimeUnits.val());
  balls[ballIndex].timeUntilAlarmUnits = timeUnits.val();

  var timeUnitsMultiplier = 0;

  switch(timeUnits.val()) {
    case "seconds":
      timeUnitsMultiplier = 1000;
      break;
    case "minutes":
      timeUnitsMultiplier = 60 * 1000;
      break;
    case "hours":
      timeUnitsMultiplier = 60 * 60 * 1000;
      break;
    case "days":
      timeUnitsMultiplier = 24 * 60 * 60 * 1000;
      break;
    default:
      break;
  }
  if (todofield.value.length > -1 && todofield.value.length <= 20){
    console.log('just right');
    balls[ballIndex].nextText.content = "";
  } else if (todofield.value.length > 20){
    console.log("halp I'm too big");
    var slicedTextA = todofield.value.slice(0,20);
    var slicedTextB = todofield.value.slice(20);
    console.log(slicedTextA);
    console.log(slicedTextB);
    balls[ballIndex].textInput.content = slicedTextA;
    balls[ballIndex].nextText.content = slicedTextB;
  }

  var alarmTimeMilliseconds = new Date().getTime() + (numTimeUnits.val() * timeUnitsMultiplier);
  

  userEmail = $("#email-field").val();
  pushEmail(userEmail);
  // console.log(alarmTimeMilliseconds);
  if (alarmTimeMilliseconds > new Date().getTime()){
    balls[ballIndex].alarmTimeMilliseconds = alarmTimeMilliseconds;
    console.log(alarmTimeMilliseconds);
    nextAlarm = new Date(alarmTimeMilliseconds);
    parsedAlarm = nextAlarm.toString();
    parsedArray = parsedAlarm.split(" ", 5);
    // monthdayParsed = nextAlarm.getMonth() + " " + nextAlarm.getDate();
    // hmsParsed = nextAlarm.getHours() + ":"+ 
    // nextAlarm.getMinutes()+":"+nextAlarm.getSeconds();
    // console.log(monthdayParsed + " " + hmsParsed);
    balls[ballIndex].timerText.content = parsedArray[4];
    balls[ballIndex].dateText.content = parsedArray[1]+" "+parsedArray[2];
  } else if (alarmTimeMilliseconds <= new Date().getTime()){
    console.log("wow");
    balls[ballIndex].timerText.content = "";
    balls[ballIndex].alarmTimeMilliseconds = undefined;
  }

  console.log(balls[ballIndex]);

  pushBall(balls[ballIndex], ballIndex);
  // overlay.style.display = "none";
  $( "#overlay" ).toggleClass( "shown" );
  $( "#todolist" ).hide();
}

$("#remind-me-button").on("click", function() {
  $("#remind-me-button").slideUp(200);
  $("#timer-container").show();
});

$("#cancel-button").on("click", function() {
  numTimeUnits.val(null);
  timeUnits.val("seconds");
  $("#timer-container").slideUp(200);
  $("#remind-me-button").show();
});


    

    // $("#rainBalls").click(function(){
    //     if(balls.length != 0){
    //         console.log("we got balls");
    //         console.log(balls);
    //     }

    // });

// Attempting to catch the user closing tab, but fails on mobile
// window.onunload = window.onbeforeunload = function() {
//   return "Bye now!";
//   alert("Bye now!");
// };

// $( window ).unload(function() {
//   return "Bye now!";
// });