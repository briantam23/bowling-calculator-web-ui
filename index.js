const BowlingGame = function() {
    this.rolls = [];
    this.runningScore = 0;
    this.firstRoll = true;
    this.score2Strikes = false;
    this.score1Strike = false;
    this.scoreSpare = false;
    this.lastFrameSum = 0;
    this.msg = '';
}

BowlingGame.prototype.reset = function() {
    this.rolls = [];
    this.runningScore = 0;
    this.firstRoll = true;
    this.score2Strikes = false;
    this.score1Strike = false;
    this.scoreSpare = false;
    this.lastFrameSum = 0;
    this.setMsg('');

    document.getElementById('input').disabled = false;
    document.getElementById('submitButton').disabled = false;

    // reset innerText to ''
    for(let i = 1; i <= 10; i++) {
        const inputDiv = document.getElementById('input' + i);
        const scoreDiv = document.getElementById('score' + i);
        if(inputDiv.innerText) inputDiv.innerText = '';
        if(scoreDiv.innerText) scoreDiv.innerText = '';
    }
}

BowlingGame.prototype.roll = function() {
    let formInput = document.getElementById('input').value.toLowerCase();
    if(formInput === 'miss') formInput = 0;
    if(Number(formInput)) formInput = Number(formInput);
    this.rolls.push(formInput);
    this.setMsg('');
    
    // set input in UI
    const currFrameInputNum = Math.ceil((this.rolls.length) / 2);
    const currFrameInput = document.getElementById('input' + currFrameInputNum);

    if(this.rolls.length >= 19) return this.rollLastFrame(formInput, currFrameInput);

    if(formInput === 'strike' || formInput === 'spare') {
        if(formInput === 'strike') {
            // cannot have strike on 2nd roll
            if(!this.firstRoll) this.error();
            else {
                this.score(formInput);
                currFrameInput.innerText += ' X';
                // add placeholder to rolls since a strike only has 1 roll
                this.rolls.push('');
                this.firstRoll = true;
            }
        }
        else {
            // cannot have spare on 1st roll
            if(this.firstRoll) this.error();
            else {
                this.scoreSpare = true;
                currFrameInput.innerText += ' /';
                this.firstRoll = true;
                // only score a spare after 1 strike (not 2)
                if(this.score1Strike) this.score(formInput);
            }
        }
    }
    else if(formInput && formInput >= 0 && formInput <= 9) {
        // if sum of rolls >= 10, give error msg
        if(this.rolls.length && this.rolls.length % 2 === 0 && this.rolls[this.rolls.length - 2] + formInput >= 10) this.error();
        else {
            formInput === 0 ? currFrameInput.innerText += ' -' : currFrameInput.innerText += ' ' + formInput;
            if(this.scoreSpare) this.score(formInput);
            if(!this.firstRoll) {
                this.score(formInput);
                this.firstRoll = true;
            }
            else {
                if(this.score2Strikes) this.score(formInput);
                this.firstRoll = false;
            }
        }
    }
    else if(!formInput) this.error();
    else this.error();

    // reset formInput value
    document.getElementById('input').value = ''; 
}

BowlingGame.prototype.score = function(formInput) {
    let currFrameScoreNum = Math.ceil((this.rolls.length - 1) / 2);
    if(this.score1Strike || this.scoreSpare) currFrameScoreNum = Math.ceil((this.rolls.length) / 2);
    const prev2FrameScore = document.getElementById('score' + (currFrameScoreNum - 2));
    const prevFrameScore = document.getElementById('score' + (currFrameScoreNum - 1));
    const currFrameScore = document.getElementById('score' + currFrameScoreNum);

    if(formInput === 'strike') {
        if(this.score2Strikes) {
            this.addScore(30, prev2FrameScore);
            this.score2Strikes = false;
        }
        // no strike bonus in last frame
        if(currFrameScoreNum !== 10) this.score1Strike ? this.score2Strikes = true: this.score1Strike = true;
        // if 2nd roll in last frame
        else if(this.rolls.length === 20 && this.score1Strike) {
            // (1st roll would have to be a Strike)
            this.addScore(30, prevFrameScore);
            this.score1Strikes = false;
        }
    }
    else if(formInput === 'spare') {
        this.addScore(20, prevFrameScore);
        this.score1Strike = false;
    }
    // regular roll
    else {
        if(this.scoreSpare) {
            this.addScore(this.spareBonus(), prevFrameScore);
            this.scoreSpare = false;
        }
        else {
            if(this.score2Strikes) {
                this.addScore(this.twoStrikeBonus(), prev2FrameScore);
                this.score2Strikes = false;
            }
            else {
                if(this.score1Strike) {
                    // if 2nd roll in last frame (need to convert previous strike to 10)
                    if(this.rolls.length === 20 && this.rolls[this.rolls.length - 2] === 'strike') {
                        this.addScore(20 + this.rolls[this.rolls.length - 1], prevFrameScore)
                    }
                    else this.addScore(this.strikeBonus(), prevFrameScore);
                    this.score1Strike = false;
                }
                if(this.rolls.length !== 20) this.addScore(this.sumRolls(), currFrameScore);
            }
        }
    }
}

BowlingGame.prototype.rollLastFrame = function(formInput) {
    if(formInput !== 0 && !formInput) return this.error();
    const currFrameInput = document.getElementById('input10');
    // for strikes / spare that depend on the last frame
    if(this.rolls.length === 19 || this.rolls.length === 20) this.score(formInput);
    if(formInput === 'strike' || formInput === 'spare') {
        if(formInput === 'strike') {
            // on 2nd roll - cannot roll a strike if the 1st roll isn't a strike
            if(this.rolls.length === 20 && this.rolls[18] !== 'strike') this.error();
            else {
                this.lastFrameSum += 10;
                if(this.rolls.length === 21) this.scoreLastFrame();
                currFrameInput.innerText += ' X';
            }
        }
        else {
            // cannot score a spare on 1st roll & also, has to be after a regular roll
            if(this.rolls.length === 19) this.error();
            else if(typeof this.rolls[this.rolls.length - 2] !== 'number') this.error();
            else {
                this.lastFrameSum += 10 - this.rolls[this.rolls.length - 2];
                currFrameInput.innerText += ' /';
                if(this.rolls.length === 21) this.scoreLastFrame();
            }
        }
    }
    else if(formInput >= 0 && formInput <= 9) {
        if(this.rolls[this.rolls.length - 2] + formInput >= 10) this.error();
        else {
            formInput === 0 ? currFrameInput.innerText += ' -' : currFrameInput.innerText += ' ' + formInput;
            this.lastFrameSum += formInput;
            if(this.rolls.length > 19) {
                if(typeof this.rolls[this.rolls.length - 2] === 'number' || this.rolls.length === 21) {
                    this.scoreLastFrame();
                }
            }
        }
    }
    else this.error();

    // reset formInput value
    document.getElementById('input').value = ''; 
}

BowlingGame.prototype.scoreLastFrame = function() {
    this.addScore(this.lastFrameSum, document.getElementById('score10'));

    document.getElementById('submitButton').disabled = true;
    document.getElementById('input').disabled = true;
    this.setMsg(`You finished with a score of ${this.runningScore}!`);
}

BowlingGame.prototype.addScore = function(score, frame, setVar) {
    this.runningScore += score
    frame.innerText = this.runningScore;
}
BowlingGame.prototype.twoStrikeBonus = function() { return 20 + this.rolls[this.rolls.length - 1]; }
BowlingGame.prototype.strikeBonus = function() { return 10 + this.sumRolls(this.rolls.length); }
BowlingGame.prototype.spareBonus = function() { return 10 + this.rolls[this.rolls.length - 1]; }
BowlingGame.prototype.sumRolls = function() { return this.rolls[this.rolls.length - 2] + this.rolls[this.rolls.length - 1]; }
BowlingGame.prototype.setMsg = function(msg) {
    this.msg = msg;
    const msgDiv = document.getElementById('msg');
    msgDiv.innerText = this.msg;
}
BowlingGame.prototype.error = function() {
    this.rolls.pop();
    this.setMsg('Invalid input. Please try again.');
}

const bowlingGame = new BowlingGame();
window.addEventListener('load', bowlingGame.reset());
