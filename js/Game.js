;(function (root) {
  var bubbleShooter = root.bubbleShooter = (root.bubbleShooter || {});

  var Game = bubbleShooter.Game = function () {
    //-- private fields --
    var self = this;
    var gameBgCanvas,
        gameBgStage,
        gameBgRect,
        earth,
        gameCanvas,
        gameStage,
        playingAreaCanvas,
        playingAreaStage,
        playingArea,
        equationElement,
        gameOverScreen,
        soundIcon,
        mouseClick,
        mousePos,
        deviceState;

    mousePos = null;
    mouseClick = false;

    deviceState = self.deviceState = window.getComputedStyle(
      document.getElementById('state-indicator')
    ).getPropertyValue('z-index');

    // game background canvas element
    gameBgCanvas = document.getElementById('bg-game');
    gameBgCanvas.width = (deviceState != 1) ? window.innerWidth : 796;
    gameBgCanvas.height = window.innerHeight;
    gameBgCanvas.style.marginLeft = -(gameBgCanvas.width / 2) + 'px';
    gameBgStage = new createjs.Stage(gameBgCanvas);
    
    // game canvas element
    gameCanvas = document.getElementById('game');
    gameCanvas.height = window.innerHeight;
    gameCanvas.width = gameBgCanvas.width * 0.8;
    gameCanvas.style.marginLeft = -(Math.floor(gameBgCanvas.width * 0.8) / 2) + 'px';
    gameStage = new createjs.Stage(gameCanvas);

    // playing area canvas element
    playingAreaCanvas = document.getElementById('playing-area');
    playingAreaCanvas.width = gameBgCanvas.width * 0.8;
    playingAreaCanvas.height = window.innerHeight * 0.93;
    playingAreaCanvas.style.top = Math.floor(window.innerHeight * 0.07) + 'px';
    playingAreaCanvas.style.marginLeft = -(Math.floor(gameBgCanvas.width * 0.8) / 2) + 'px';
    playingAreaStage = self.playingAreaStage = new createjs.Stage(playingAreaCanvas);

    // equation element
    equationElement = document.getElementById('equation');
    if (equationElement) {
      equationElement.style.width = playingAreaCanvas.width;
      equationElement.style.height = Math.floor(window.innerHeight * 0.06) + 'px';
      equationElement.style.lineHeight = equationElement.style.height;
      equationElement.style.width = Math.floor(gameBgCanvas.width * 0.8) + 'px';
      equationElement.style.marginLeft = -Math.floor(gameBgCanvas.width * 0.8) / 2 + 'px';
    }

    // sound icon
    soundIcon = document.getElementById('sound-icon');
    function hamdleSoundClick() {
      if (this.className && this.className === 'mute') {
        this.className = '';
        self.isPlayingSound = true;
        self.playGameSong();
      } else {
        this.className = 'mute';
        self.isPlayingSound = false;
        self.stopSound();
      }
    }

    // gameover screen
    gameOverScreen = document.getElementById('screen-gameover');
    gameOverScreen.style.width = Math.floor(gameBgCanvas.width * 0.8) + 'px';
    gameOverScreen.style.marginLeft = -Math.floor(gameBgCanvas.width * 0.8) / 2 + 'px';
    gameOverScreen.style.height = window.innerHeight + 'px';
    gameOverScreen.style.top = -window.innerHeight + 'px';

    //-- public fields --
    // playing area size
    self.width = playingAreaCanvas.width;
    self.height = playingAreaCanvas.height;
    self.bubbleRadius = 20;

    // init grid space
    self.bubbleGrid = new bubbleShooter.GridSpace(
      Math.floor(self.height / (self.bubbleRadius * 2)),
      Math.floor(self.width / (self.bubbleRadius * 2)),
      self.bubbleRadius,
      this.width
    );

    // bubbles
    self.bubbles = [];
    self.deadBubbles = [];
    self.firedBubble = null;

    self.mouseClick = false;
    self.g = {};
    self.quantum = 1000/90;
    
    self.bubbleGrid.setBubblePopUpCallback(function (b) {
      self.bubbles.push(b);
    });
    self.bubbleGrid.setBubbleFallCallback(function (b) {
      self.bubbles.push(b);
    });
    
    self.bubbelVerticalMargin = 4;
    self.images = [];
    self.isPlayingSound = true;

    //-- arithmetic
    self.arithmetic = new Equation();

    // init move of the planets
    function initPlanetMove() {
      var bgPlanets;

      if (navigator.userAgent.indexOf('Chrome') === -1) return; 
      bgPlanets = document.getElementById('bg-planets');

      function movePlanet(e) {
        var x, y;
        x = -(e.pageX + this.offsetLeft) / 20;
        y = -(e.pageY + this.offsetTop) / 20;
        bgPlanets.style.backgroundPosition = x + 'px ' + y + 'px';
      }

      document.body.addEventListener('mousemove', movePlanet);
    }

    // init ellipse rotation
    function initEllipseMove() {
      var renderer,
          elements,
          mouse,
          centerX,
          centerY,
          degree1,
          degree2,
          degree3,
          dx,
          dy;

      elements = bubbleShooter.Renderer.elements;
      mouse = {x: 0, y: 0};
      centerX = elements.topEllipse.x;
      centerY = elements.topEllipse.y;

      return function (e) {
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;

        dx = mouse.x - centerX;
        dy = mouse.y - centerY;
        degree1 = degree2 = degree3 = (180 - (90 + Math.atan2(dy, dx) * (-180/Math.PI)));

        // ellipses should be moving differently
        degree1 = (degree1 > 27) ? 27 : (degree1 < -27) ? -27 : degree1;
        degree2 = (degree2 > 20) ? 20 : (degree2 < -20) ? -20 : degree2;
        degree3 = (degree3 > 10) ? 10 : (degree3 < -10) ? -10 : degree3;

        // ellipse rotation
        createjs.Tween.get(elements.topEllipse, {loop: false}).to({rotation: degree1}, 10);
        createjs.Tween.get(elements.middleEllipse, {loop: false}).to({rotation: degree2}, 10);
        createjs.Tween.get(elements.bottomEllipse, {loop: false}).to({rotation: degree3}, 10);

        gameStage.update();
      };
    }

    function hideLoader() {
      var loader;
      loader = document.getElementById('loader');
      if (loader) {
        loader.parentNode.removeChild(loader);
      }
    }

    function gameLoop (oldTime) {
      var now, delta;

      now = (new Date()).getTime();
      delta = now - oldTime;
      
      if (self.mouseClick) {
        self.fireBubble(mousePos);
        self.step(delta);
        bubbleShooter.Renderer.drawPlayBubble(self, playingAreaStage);
      }

      requestAnimationFrame(function(){
        gameLoop(now);
      });
    }

    self.addArithmetic = function () {
      var questionEl,
          answerEl,
          incorrectAnswers,
          bubblesRows,
          bubblesCols,
          colors,
          flg,
          a, c, i, j;

      // add question
      questionEl = document.getElementById('question');
      question.innerHTML = self.arithmetic.equation;
      answerEl = document.getElementById('answer');
      answerEl.setAttribute('data-correctanswer', self.arithmetic.correctAnswer);

      // add answers to bubbles
      bubblesRows = Math.floor(self.height / (self.bubbleRadius * 6));
      bubblesCols = self.bubbleGrid.cols;
      i = bubblesRows - (Math.ceil(Math.random() * 2) + 1);
      j = Math.round(Math.random() * (bubblesCols - 2));

      self.bubbleGrid.slots[i][j].correctAnswer = self.arithmetic.correctAnswer;

      // add incorrect answers
      incorrectAnswers = self.arithmetic.wrongAnswers;
      colors = [self.bubbleGrid.slots[i][j].value];

      for (a = 0; a < incorrectAnswers.length; a ++) {
        addIncorrectAnswer(a);
      }

      function addIncorrectAnswer(a) {
        flg = false;
        i = Math.floor(Math.random() * (bubblesRows - 1));
        j = Math.floor(Math.random() * (bubblesCols - 1));

        for (c = 0; c < colors.length; c ++) {
          if (self.bubbleGrid.slots[i][j].value === colors[c]) {
            flg = true;
            break;
          }
        }

        if (flg) {
          addIncorrectAnswer(a)
        } else {
          self.bubbleGrid.slots[i][j].incorrectAnswer = incorrectAnswers[a];
          colors.push(self.bubbleGrid.slots[i][j].value);
        }
      }
    };

    self.init = function () {
      var queue,
          renderer,
          moveEllipses,
          moveNextBubble,
          quit;

      window.requestAnimationFrame = (function () {
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame;
      })();

      queue = new createjs.LoadQueue( false, 'assets/');
      queue.installPlugin(createjs.Sound);
      createjs.Sound.alternateExtensions = ["mp3"];

      queue.addEventListener('complete', function (e) {
        self.images['earth'] = queue.getResult('earth');
        self.images['tower'] = queue.getResult('tower');
        self.images['topEllipse'] = queue.getResult('topEllipse');
        self.images['middleEllipse'] = queue.getResult('middleEllipse');
        self.images['bottomEllipse'] = queue.getResult('bottomEllipse');
        self.images['cloud'] = queue.getResult('cloud');

        // draw game elements
        renderer = bubbleShooter.Renderer;
        renderer.drawGameBgBase(gameBgCanvas, gameBgStage, self.images);
        renderer.drawEarth(gameBgStage, self.images);
        renderer.drawTower(gameCanvas, gameStage, self.images);

        // show equation element
        equationElement.style.visibility = 'visible';

        // move planet on mousemove
        initPlanetMove();

        // move ellipses on mousemove
        moveEllipses = initEllipseMove();

        playingAreaCanvas.addEventListener('mousemove', moveEllipses);

        // track mouse click
        playingAreaCanvas.addEventListener('click', function (e) {
          mousePos = this.relMouseCoords(e);
          if (self.nextBubble && (mousePos.y > (self.nextBubble.p.y - self.bubbleRadius * 3))) {
            return;
          }
          self.mouseClick = true;
          self.isPlayingSound && self.playBubbleSound();
        });

        // build playing area
        self.setUpPlayingArea();

        // handle sound click
        soundIcon.addEventListener('click', hamdleSoundClick);

        createjs.Sound.play('gameSong', 'none', 0, 0, -1, 0.2);

        // add open arithmetic
        self.addArithmetic();

        //-- start game
        // draw playing area
        hideLoader();
        bubbleShooter.Renderer.drawPlayingArea(self, playingAreaStage);
        // start game loop
        gameLoop((new Date()).getTime());
      });

      queue.loadManifest([
        {id: 'earth',         src: 'images/earth.png'},
        {id: 'tower',         src: 'images/tower.png'},
        {id: 'topEllipse',    src: 'images/ellipse_1.png'},
        {id: 'middleEllipse', src: 'images/ellipse_2.png'},
        {id: 'bottomEllipse', src: 'images/ellipse_3.png'},
        {id: 'cloud',         src: 'images/cloud.png'},

        {src: 'sounds/bubbleShooter.ogg',   id: 'gameSong'},
        {src: 'sounds/short_pop_sound.ogg', id: 'pop'},
        {src: 'sounds/two_tone_nav.ogg',    id: 'collisionPop'},
        {src: 'sounds/gameover.ogg',        id: 'gameover'},
        {src: 'sounds/victory_song.ogg',    id: 'victorySong'}
      ]);
    }
  };

  Game.prototype.playBubbleSound = function () {
    createjs.Sound.play('pop');
  };

  Game.prototype.playBubbleCollisionSound = function () {
    createjs.Sound.play('collisionPop', 'none', 0, 0, 0, 0.2);
  };

  Game.prototype.playGameSong = function () {
    createjs.Sound.play('gameSong', 'none', 0, 0, -1, 0.2);
  }

  Game.prototype.stopSound = function () {
    createjs.Sound.stop();
  }

  Game.prototype.setUpPlayingArea = function () {
    var bubblesRows,
        bubblesCols,
        grid,
        i, j,
        bubble,
        x, y, radius;

    bubblesRows = Math.floor(this.height / (this.bubbleRadius * 6));
    bubblesCols = this.bubbleGrid.cols;

    for (i = 0; i < bubblesRows; i ++) {
      for (j = 0; j < (bubblesCols - (i - Math.floor(i / 2) * 2)); j ++) {
        x = this.bubbleRadius * (i - Math.floor(i / 2) * 2) + (j * (this.bubbleRadius * 2 + 2) + this.bubbleGrid.baseX) + this.bubbleRadius;
        y = i * (this.bubbleRadius * 2 + this.bubbelVerticalMargin) - i * Math.floor(this.bubbleRadius / 3) + this.bubbleRadius;

        bubble = new bubbleShooter.Bubble(x, y, this.bubbleRadius);
        bubble.setActive(false);
        bubble.v.y = j * 0.01;
        bubble.g = {x: 0, y: 0.0001};
        this.bubbleGrid.addBubble(bubble, i, j);
      }
    }

    this.nextBubble = this.createNextBubble();
  };

  Game.prototype.createNextBubble = function () {
    var ellipse,
        bubble,
        values,
        index,
        x, y;

    ellipse = bubbleShooter.Renderer.elements.topEllipse;
    x = ellipse.x;
    y = ellipse.y - ellipse.regY - this.bubbleRadius - 5 - window.innerHeight * 0.07;

    bubble = new bubbleShooter.Bubble(x, y, this.bubbleRadius);
    values = this.bubbleGrid.getBubblesValues();
    index = Math.floor(Math.random() * values.length);

    if (values.length) {
      bubble.value = values[index];
    }
    
    return bubble;
  };

  Game.prototype.fireBubble = function (target) {
    var dir,
        bubble,
        norma;

    if (!this.firedBubble) {
      dir = {
        x: target.x - this.width / 2,
        y: target.y - this.nextBubble.p.y
      };

      bubble = this.nextBubble;
      this.nextBubble = this.createNextBubble();

      norma = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
      bubble.v.x = dir.x / norma * 0.8;
      bubble.v.y = dir.y / norma * 0.8;
      this.firedBubble = bubble;
    }
  };

  Game.prototype.step = function (delta) {
    var frameTime;

    frameTime = this.quantum;

    for(var t = 0; t <= delta; t = t + frameTime){
      this.stepFiredBubbles(frameTime);
      this.testCollision();
    }
    this.stepFreeBubbles(delta);
  };

  Game.prototype.stepFiredBubbles = function (delta) {
    var bubble;
    
    if (this.firedBubble !== null) {
      bubble = this.firedBubble;
      bubble.step(delta);

      if((bubble.p.x + bubble.v.x) <= this.bubbleRadius ||
        (bubble.p.x + bubble.v.x) >= (this.width - this.bubbleRadius)) {

        bubble.v.x *= -1;
      }
    }
  };

  Game.prototype.stepFreeBubbles = function (delta) {
    var bubble,
        i;

    for(i = 0; i < this.bubbles.length; i ++){
      bubble = this.bubbles[i];
      bubble.step(delta);

      if ((bubble.p.x + bubble.v.x) <= this.bubbleRadius ||
        (bubble.p.x + bubble.v.x) >= (this.width - this.bubbleRadius)) {
        bubble.v.x *= -1;
      }
      
      if (bubble.p.y > this.height) {
        this.deadBubbles.push(i);
      }
    }
    
    if(this.deadBubbles.length){
      for (var j = 0; j < this.deadBubbles.length; j ++) {
        this.bubbles[this.deadBubbles[j]] = null;
      }

      this.bubbles = this.bubbles.filter(function (v) {
        return (v !== null);
      });

      this.deadBubbles.length = 0;
    }
  };

  Game.prototype.circlesColliding = function (x1, y1, radius1, x2, y2, radius2) {
    var dx,
        dy,
        radii;

    dx = x2 - x1;
    dy = y2 - y1;
    radii = radius1 + radius2;
    
    if (((dx * dx) + (dy * dy)) <= (radii * radii)) {
      return true;
    } else {
      return false;
    }
  };

  Game.prototype.testCollision = function () {
    var i,
        j,
        pos,
        bubble,
        bubble2,
        collides;

    bubble = this.firedBubble;

    if (bubble === null) return;

    collides = false;

    for (i = 0; i < this.bubbleGrid.slots.length; i ++) {
      for (j = 0; j < this.bubbleGrid.slots[i].length; j ++) {
        bubble2 = this.bubbleGrid.slots[i][j];

        if (bubble2 &&
            this.circlesColliding(
              bubble.p.x,
              bubble.p.y,
              bubble.radius,
              bubble2.p.x,
              bubble2.p.y,
              bubble2.radius)
            ) {

          collides = true;
          break;
        }
      }

      if (collides) break;
    }

    if (collides || (bubble.p.y < this.bubbleRadius * 2)) {
      pos = this.bubbleGrid.getCellIndexForCoord(bubble.p.x, bubble.p.y);

      if (pos === null) {
        pos = this.bubbleGrid.getCellIndexForCoord(bubble.p.x + bubble.radius, bubble.p.y);
      }

      if (pos.j >= this.bubbleGrid.slots[pos.i].length) {
        pos.j = this.bubbleGrid.slots[pos.i].length - 1;
      }

      bubble.p.x = this.bubbleRadius * (pos.i - Math.floor(pos.i / 2) * 2) + (pos.j * (this.bubbleRadius * 2 + 2) + this.bubbleGrid.baseX) + this.bubbleRadius;
      bubble.p.y = pos.i * (this.bubbleRadius * 2 + 4) - pos.i * Math.floor(this.bubbleRadius / 3) + this.bubbleRadius;

      // play 'collisionPop' sound
      this.isPlayingSound && this.playBubbleCollisionSound();

      this.bubbleGrid.addBubble(bubble, pos.i, pos.j);
      this.bubbleGrid.markBubble(pos.i, pos.j, bubble.value);
      this.bubbleGrid.popMarkedBubbles();
      this.bubbleGrid.clearMarkedBubbles();
      this.bubbleGrid.markAllBubblesAsOrphan();
      this.bubbleGrid.defineOrphan();
      this.bubbleGrid.detachOrphanBubbles();      
      
      // check if game is over
      if (this.isGameOver()) {
        this.gameOver();
      } else if (this.isVictory()) {
        this.victory();
      }

      this.firedBubble = null;
      this.mouseClick = false;
      
      bubbleShooter.Renderer.drawBubbleGrid(this, this.playingAreaStage);
    }
  };

  Game.prototype.isGameOver = function () {
    var i, 
        j,
        slots,
        incorrectAnswers;

    // is nextBubble touched
    if (this.firedBubble &&
        this.nextBubble &&
        (this.firedBubble.p.y + this.bubbleRadius) >= (this.nextBubble.p.y - this.bubbleRadius)) {

      return true;
    }

    // is incorrect answer poped
    slots = this.bubbleGrid.slots;
    incorrectAnswers = [];

    for (i = 0; i < slots.length; i ++) {
      for (j = 0; j < slots[i].length; j ++) {
        if (slots[i][j] && slots[i][j].incorrectAnswer) {
          incorrectAnswers.length += 1;
        }
      }
    }

    return (incorrectAnswers.length !== this.arithmetic.wrongAnswers.length);
  };

  Game.prototype.isVictory = function () {
    var i, j, slots;

    slots = this.bubbleGrid.slots;

    for (i = 0; i < slots.length; i ++) {
      for (j = 0; j < slots[i].length; j ++) {
        if (slots[i][j] && slots[i][j].correctAnswer) {

            return false;
        }
      }
    }

    return true;
  },

  Game.prototype.gameoverAnimation = function (isVictory) {
    var playingArea,
        game,
        equation,
        gameOverScreen,
        img,
        backgroundColor,
        text,
        song;

    playingArea = document.getElementById('playing-area');
    gameOverScreen = document.getElementById('screen-gameover');
    equation = document.getElementById('equation');
    game = document.getElementById('game');
    backgroundColor = isVictory ? '#00664c' : '#8e0000';
    img = isVictory ? 'bg_face_victory.png' : 'bg_face_upset.png';
    text = isVictory ? 'You won!' : 'You loose...'

    // stop play song
    this.stopSound();
    song = isVictory ? 'victorySong' : 'gameover';
    this.isPlayingSound && createjs.Sound.play(song, 'none', 0, 0, 0, 0.3);

    // animate game end
    gameOverScreen.style.background = backgroundColor;
    gameOverScreen.innerHTML = '<div id="screen-gameover-inner">' +
                                  '<h1>Game over</h1>' +
                                  '<div class="face"><img src="assets/images/' + img + '" alt="" /></div>' +
                                  '<h2>' + text + '</h2></div>';
    
    gameOverScreen.className = 'animateTop0';
    playingArea.className = 'animateTop100';
    equation.className = 'animateTop94';
    game.className = 'animateTop100';
  };

  Game.prototype.gameOver = function () {
    // animation
    this.gameoverAnimation(false);
  };

  Game.prototype.victory = function () {
    // draw result
    bubbleShooter.Renderer.drawRightAnswer();

    // animation
    this.gameoverAnimation(true);
  };
})(this);