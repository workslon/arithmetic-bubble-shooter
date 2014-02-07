;(function (root) {
  var bubbleShooter = root.bubbleShooter = (root.bubbleShooter || {});

  var GridSpace = bubbleShooter.GridSpace = function (rows, cols, bubbleRadius, width) {
    this.width = width;
    this.rows = rows;
    this.cols = cols;
    this.bubbleVerticalMargin = 4;
    this.bubbleRadius = bubbleRadius;
    // left margin of bubbles grid after bubbles centering
    this.baseX = Math.floor((this.width - (this.cols * 2) - (this.cols * (this.bubbleRadius * 2))) / 2);
    
    this.slots = [];
    this.marked = [];

    this.nextY = 0;
    this.bubblePopUpCallback = null;

    for (var i = 0; i < rows; i ++) {
        var r = [];

        for (var j = 0; j < (cols - (i - Math.floor(i / 2) * 2)); j ++) {
          r.push(null);
        }        

        this.slots.push(r);
    }
  };

  GridSpace.prototype.getBubblesValues = function() {
    var colors = [],
        i, j;

    for(i = 0; i < this.slots.length; i ++) {
      for (j = 0; j < this.slots[i].length; j ++) {
        if (this.slots[i][j]) {
          if (colors.indexOf(this.slots[i][j].value)) {
            colors.push(this.slots[i][j].value);
          }
        }
      }
    }

    return colors;
  };

  GridSpace.prototype.addBubble = function (bubble, i, j) {
    if (this.slots[i][j] === null) {
      this.slots[i][j] = bubble;
    }
  };

  GridSpace.prototype.getCellIndexForCoord = function (x, y) {
    var row,
        col;

    row = Math.floor((Math.round(y) - (this.bubbleVerticalMargin - Math.floor(this.bubbleRadius / 3)) * Math.floor(y / (this.bubbleRadius * 2))) / (this.bubbleRadius * 2));
    col = Math.floor((x - (this.width - (this.cols - (row - 2 * Math.floor(row / 2))) * (this.bubbleRadius * 2)) / 2) / (this.bubbleRadius * 2));
    col = col > 0 ? col : 0;

    return (row >= 0 && col >= 0) ? { i: row, j: col} : null;
  };

  GridSpace.prototype.markBubble2 = function(i, j){
    var adj;

    this.slots[i][j].setOrphan(false);
    adj = this.getAdjacentBubbles(i,j);
    
    for (var i = 0; i < adj.length; i ++) {
      if(adj[i].orphan){
        var pos = this.getCellIndexForCoord(adj[i].p.x, adj[i].p.y);   
        this.markBubble2(pos.i, pos.j);
      }
    }
  };

  GridSpace.prototype.markBubble = function(i, j, value){
    var adj;

    this.slots[i][j].setMarked(true);
    this.marked.push({i: i, j: j});
    adj = this.getAdjacentBubbles(i,j);

    for(var i = 0; i < adj.length; i ++) {
      if((adj[i].mark === false) && (adj[i].value === value)){
        var pos = this.getCellIndexForCoord(adj[i].p.x, adj[i].p.y);   
        this.markBubble(pos.i, pos.j, value);
      }
    }
  };

  GridSpace.prototype.getAdjacentBubbles = function (i, j) {
    var bubbles = [];

    if (this.hasBubbleLeft(i, j)) bubbles.push(this.getBubbleLeft(i, j));
    if (this.hasBubbleRight(i, j)) bubbles.push(this.getBubbleRight(i, j));
    if (this.hasBubbleUpRight(i, j)) bubbles.push(this.getBubbleUpRight(i, j));
    if (this.hasBubbleUpLeft(i, j)) bubbles.push(this.getBubbleUpLeft(i, j));
    if (this.hasBubbleDownLeft(i, j)) bubbles.push(this.getBubbleDownLeft(i, j));
    if (this.hasBubbleDownRight(i, j)) bubbles.push(this.getBubbleDownRight(i, j));

    return bubbles;
  };

  GridSpace.prototype.isRowEven = function (i) {
    return ((i - Math.floor(i / 2) * 2) == 0) ? true : false;
  };

  GridSpace.prototype.hasBubbleLeft = function (i, j) {
    return ((j - 1) >= 0 && (this.slots[i][j - 1] != null)) ? true : false;
  };

  GridSpace.prototype.getBubbleLeft = function (i, j) {
    return (this.hasBubbleLeft(i, j)) ? this.slots[i][j - 1] : null;
  };

  GridSpace.prototype.hasBubbleRight = function (i,j) {
    return ((j + 1) < this.cols && (this.slots[i][j + 1] != null)) ? true : false;
  };

  GridSpace.prototype.getBubbleRight = function (i, j) {
    return (this.hasBubbleRight(i,j)) ? this.slots[i][j + 1] : null;
  };

  GridSpace.prototype.hasBubbleUpRight = function (i, j) {
    var evenRow,
        jj;

    if((i - 1) < 0 || (i > this.slots.length)) return false;

    evenRow = this.isRowEven(i);
    jj = (evenRow) ? j: j + 1;
    
    return (jj < (this.slots[i - 1].length)) ? (this.slots[i - 1][jj] != null) : false;
  };

  GridSpace.prototype.getBubbleUpRight = function (i, j) {
    if (this.hasBubbleUpRight(i, j)) {
      return this.slots[i - 1][(this.isRowEven(i)) ? j: j + 1];
    }
    return null;
  };

  GridSpace.prototype.hasBubbleUpLeft = function (i, j) {
    var evenRow,
        jj;

    if((i - 1) < 0 || (i > this.slots.length)) return false;
    
    evenRow = this.isRowEven(i);
    jj = (evenRow) ? j - 1: j;
    
    return (jj >= 0 && jj < this.slots[i - 1].length) ? (this.slots[i - 1][jj] !== null) : false;
  };

  GridSpace.prototype.getBubbleUpLeft = function (i, j) {
    if (this.hasBubbleUpLeft(i,j)) {
      return this.slots[i - 1][(this.isRowEven(i)) ? j - 1 : j];
    }
    return null;
  };

  GridSpace.prototype.hasBubbleDownLeft = function (i, j) {
    var evenRow,
        jj;

    if((i < 0) || (i > this.slots.length)) return false;
    
    evenRow = this.isRowEven(i,j);
    jj = (evenRow) ? j - 1: j;

    return (jj >= 0 && jj < this.slots[i + 1].length) ? (this.slots[i + 1][jj] !== null) : false;
  };

  GridSpace.prototype.getBubbleDownLeft = function (i,j) {
    if (this.hasBubbleDownLeft(i, j)) {
      return this.slots[i + 1][(this.isRowEven(i)) ? j - 1 : j];
    }
    return null;
  };

  GridSpace.prototype.hasBubbleDownRight = function (i, j) {
    var evenRow,
        jj;

    if((i < 0) || (i > this.slots.length)) return false;
    
    evenRow = this.isRowEven(i,j);
    jj = (evenRow) ? j: j + 1;
    
    return (jj < (this.slots[i + 1].length)) ? (this.slots[i + 1][jj] !== null) : false;
  };

  GridSpace.prototype.getBubbleDownRight = function(i, j){
    if (this.hasBubbleDownRight(i, j)) {
      return this.slots[i + 1][(this.isRowEven(i)) ? j: j + 1];
    }
    return null;
  };

  GridSpace.prototype.removeBubble = function (i, j) {
    this.slots[i][j] = null;
  };

  GridSpace.prototype.popMarkedBubbles = function(){
    var marked,
        bubble,
        i;

    if(this.marked.length > 2) {
      for(i = 0; i < this.marked.length; i ++){
        marked = this.marked[i];
        bubble = this.getBubbleAt(marked.i, marked.j);
        this.bubblePopUpCallback(bubble);
        bubble.pop();        
        this.removeBubble(marked.i, marked.j);
      }
    }
  };

  GridSpace.prototype.getBubbleAt = function (i , j) {
    return this.slots[i][j];
  };

  GridSpace.prototype.setBubblePopUpCallback = function (callback) {
    if (callback && typeof callback === 'function') {
      this.bubblePopUpCallback = callback;
    }
  };

  GridSpace.prototype.setBubbleFallCallback = function (callback) {
    if (callback && typeof callback === 'function') {
      this.bubbleFallCallback = callback;
    }
  };

  GridSpace.prototype.clearMarkedBubbles = function() {
    var marked,
        bubble,
        i;

    for(i = 0; i < this.marked.length; i++){
        marked = this.marked[i];
        bubble = this.getBubbleAt(marked.i, marked.j);
        if(bubble) {
          bubble.setMarked(false);
        }
    }

    this.marked.length = 0;
  };

  GridSpace.prototype.markAllBubblesAsOrphan = function () {
    var i, j, bubble;

    for (i = 0; i < this.slots.length; i++) {
      for (j = 0; j < this.slots[i].length; j ++) {
        if (this.slots[i][j] !== null) {
          this.slots[i][j].setOrphan(true);
        }
      }
    }    
  };

  GridSpace.prototype.defineOrphan = function () {
    var i;

    for (i = 0; i < this.slots[0].length; i ++) {
      if (this.slots[0][i]) {
        this.markBubble2(0, i);
      }
    }
  };

  GridSpace.prototype.detachOrphanBubbles = function () {
    var i, j, bubble;

    for (i = 0; i < this.slots.length; i ++) {
      for (j = 0; j < this.slots[i].length; j ++) {
        bubble = this.slots[i][j];

        if (bubble && this.slots[i][j].orphan) {
          this.removeBubble(i,j);
          bubble.fall();
          this.bubbleFallCallback(bubble);
        }
      }
    }
  };
})(this);