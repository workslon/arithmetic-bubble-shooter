function Equation(){
  this.equation = '';
  this.operators = ['+', '-'];
  this.operands = [];
  this.correctAnswer = 0;
  this.wrongAnswers = [];

  this.init();
}

Equation.prototype.init = function (n) {
  this.createOperands();
  this.createEquation();
  this.saveCorrectAnswer();
  this.generateWrongAnswers();
};

Equation.prototype.createOperands = function () {
  var n = 2;

  while (n) {
    this.operands.push(Math.ceil(Math.random() * 9));

    n --;
  } 
};

Equation.prototype.createEquation = function () {
  var i,
      operands,
      equation = '';

  operands = (this.operands.sort()).reverse();

  for (i = 0; i < operands.length; i ++) {
    if (i === 0) {
      equation += operands[i];
    } else {
      equation += (' ' + this.operators[Math.round(Math.random())] + ' ' + operands[i]);
    } 
  }

  this.equation = equation;
};

Equation.prototype.saveCorrectAnswer = function () {
  this.correctAnswer = eval(this.equation);
};

Equation.prototype.generateWrongAnswers = function () {
  var n = 4;

  while (n) {
    var answer;

    answer = Math.round(Math.random() * 20);

    if (answer === this.correctAnswer ||
      this.wrongAnswers.indexOf(answer) + 1) {
      continue;
    } else {
      this.wrongAnswers.push(answer);
      n --;
    }
  }
};