;(function (root) {
  var bubbleShooter = root.bubbleShooter = (root.bubbleShooter || {});

  var Bubble = bubbleShooter.Bubble = function (x, y, radius) {
    this.p = {x:x, y:y};
    this.v = {x:0, y:0};
    this.g = {x:0, y:0};
    this.radius = radius;
    this.active = true;
    this.popped = false;
    this.mark = false;
    this.orphan = false;
    this.value = this.shuffle([0, 1, 2, 3, 4])[0];
  };

  Bubble.prototype.shuffle = function (o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };

  Bubble.prototype.step = function (delta) {
    this.p.x = this.v.x * delta + this.p.x;
    this.p.y = this.v.y * delta + this.p.y;
  }

  Bubble.prototype.setActive = function(active){
    this.active = active;
  };

  Bubble.prototype.setOrphan = function(orphan){
    this.orphan = orphan;
  };

  Bubble.prototype.setMarked = function(marked){
    this.mark = marked;
  };

  Bubble.prototype.isPopped = function(){
    return this.popped;
  };

  Bubble.prototype.pop = function(){
      this.g = {x: 0, y: 0.001};
      this.v.y = -0.2 - Math.random() * 0.1;
      this.v.x = Math.random() * 0.2 - 0.1;
      this.setActive(true);
      this.popped = true;
  };

  Bubble.prototype.fall = function(){
      this.g = {x: 0 , y: 0.0005};
      this.v.x = 0; this.v.y = 0.02 * this.p.y / this.r;
      this.setActive(true);
      this.popped = true;
  };
})(this);