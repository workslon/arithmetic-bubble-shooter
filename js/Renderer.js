;(function (root) {
  var bubbleShooter = root.bubbleShooter = (root.bubbleShooter || {});

  var Renderer = bubbleShooter.Renderer = (function () {
    var windowHeight = window.innerHeight;
    var colors;

    colors = ['#64d387', '#f6ce27', '#9d52ba', '#f0624c', '#63a5e3'];

    return {
      // created elements
      elements: {},
 
      drawGameBgBase: function (canvas, stage) {
        var COLOR,
            gameBgRect,
            width,
            height;

        COLOR = 'rgba(0,0,0,0.3)';
        gameBgRect = new createjs.Shape();
        width = canvas.width;
        height = canvas.height;

        gameBgRect.graphics
          .f(COLOR)
          .r(Math.floor(width * 0.1), 0, Math.floor(width * 0.8), height);
        
        // add to stage
        stage.addChild(gameBgRect);
        stage.update();

        // save reference
        this.elements['gameBgRect'] = gameBgRect;
      },

      drawEarth: function (stage, imgs) {
        var earth,
            earthImg,
            earthImgHeight;

        earthImg = imgs['earth'];
        earth = new createjs.Bitmap(earthImg);
        earth.y = windowHeight - earthImg.height;

        // add to stage
        stage.addChild(earth);
        stage.update();
        
        // save reference
        this.elements['earth'] = earth;
      },

      drawTower: function (canvas, stage, imgs) {
        var towerBase,
            cloud,
            bottomEllipse,            
            middleEllipse,
            topEllipse;

        // draw tower base
        towerBase = new createjs.Bitmap(imgs['tower']);
        towerBase.x = (canvas.width - imgs['tower'].width) / 2;
        towerBase.y = windowHeight - Math.floor(imgs['tower'].height * 1.3);

        // draw cloud over the tower
        cloud = new createjs.Bitmap(imgs['cloud']);
        cloud.x = (canvas.width - imgs['cloud'].width) / 2;
        cloud.y = towerBase.y + imgs['tower'].height / 1.5;

        // draw ellipses
        bottomEllipse = new createjs.Bitmap(imgs['bottomEllipse']);
        bottomEllipse.set({
          regX: imgs['bottomEllipse'].width / 2,
          regY: imgs['bottomEllipse'].height / 2,
          x: canvas.width / 2,
          y: towerBase.y - imgs['bottomEllipse'].height / 2 + 2
        });

        middleEllipse = new createjs.Bitmap(imgs['middleEllipse']);
        middleEllipse.set({
          regX: imgs['middleEllipse'].width / 2,
          regY: imgs['middleEllipse'].height / 2,
          x: canvas.width / 2,
          y: bottomEllipse.y - imgs['middleEllipse'].height
        });

        topEllipse = new createjs.Bitmap(imgs['topEllipse']);
        topEllipse.set({
          regX: imgs['topEllipse'].width / 2,
          regY: imgs['topEllipse'].height / 2,
          x: canvas.width / 2,
          y: middleEllipse.y - imgs['topEllipse'].height
        });

        // add all elements to stage
        stage.addChild(towerBase);
        stage.addChild(cloud);
        stage.addChild(bottomEllipse);
        stage.addChild(middleEllipse);
        stage.addChild(topEllipse);
        stage.update();

        // save references to created elements
        this.elements['towerBase'] = towerBase;
        this.elements['cloud'] = cloud;
        this.elements['bottomEllipse'] = bottomEllipse;
        this.elements['middleEllipse'] = middleEllipse;
        this.elements['topEllipse'] = topEllipse;
      },

      drawExerciseRectangle: function (canvas, stage) {
        var rectangle,
            COLOR,
            width,
            height;

        width = canvas.width;
        height = canvas.height;
        COLOR = '0, 0, 0';
        rectangle = new createjs.Shape();
        rectangle.graphics.f(COLOR).r(0, 0, width, Math.floor(height * 0.06));

        // add to stage
        stage.addChild(rectangle);
        stage.update();

        // save reference
        this.elements['exerciseRectangle'] = rectangle;
      },

      // --- OpenAri specific method
      drawAnswer: function (stage, bubble) {
        var answer,
            text;

        answer = bubble.correctAnswer || bubble.incorrectAnswer
        text = new createjs.Text(answer);
        text.x = bubble.p.x;
        text.y = bubble.p.y;
        text.font = 'bold ' + bubble.radius + 'px Arial';
        text.textAlign = 'center';
        text.textBaseline = 'middle';
        stage.addChild(text);
        stage.update();
      },

      drawRightAnswer: function () {
        var answerEl;

        answerEl = document.getElementById('answer');

        answerEl.textContent = answerEl.getAttribute('data-correctanswer');
      },

      drawBubble: function (bubble, stage) {
        var shape;

        shape = new createjs.Shape();
        shape.graphics.f(colors[bubble.value]).dc(bubble.p.x, bubble.p.y, bubble.radius);
        stage.addChild(shape);
        stage.update();

        return shape;
      },

      drawPlayingArea: function (game, stage) {
        var bubble;

        this.drawBubbleGrid(game, stage);
        this.drawPlayBubble(game, stage);
      },

      drawPlayBubble: function (game, stage) {
        var bubble;

        stage.removeChild(this.elements['nextBubble']);
        stage.removeChild(this.elements['firedBubble']);
        stage.update();

        bubble = game.firedBubble;
        if (bubble !== null) {
          this.elements['firedBubble'] = this.drawBubble(bubble, stage);
        }

        // draw "play" bubble
        bubble = game.nextBubble;
        this.elements['nextBubble'] = this.drawBubble(bubble, stage);
      },

      drawBubbleGrid: function (game, stage) {
        var bubble;

        // clear stage
        stage.removeAllChildren();
        stage.update();

        // draw common bubbles
        for (var i = 0; i < game.bubbleGrid.slots.length; i ++) {
          for (var j = 0; j < game.bubbleGrid.slots[i].length; j ++) {
            if (game.bubbleGrid.slots[i][j] !== null) {
              bubble = game.bubbleGrid.slots[i][j];
              this.drawBubble(bubble, stage);
              if (bubble.correctAnswer || bubble.incorrectAnswer) {
                this.drawAnswer(stage, bubble);
              }
            }
          }
        }
      }
    }
  })();
  
})(this);