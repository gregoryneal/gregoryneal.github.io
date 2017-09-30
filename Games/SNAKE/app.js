var SNAKE = (function () {
    function SNAKE() {
        this.timer = 0;
        this.bodies = []; //a Phaser.Sprite queue
        this.canTurn = true;
        this.goForward = null;
        this.wallHitExtraTicks = 15; //how many ticks after the player hits the wall before game over
        this.snapToGridValue = function (value) {
            return (Math.round(value / this.TILESIZE) * this.TILESIZE);
        };
        this.pointOnWall = function (vector) {
            if (vector.x == this.maxX || vector.x == 0) {
                return true;
            }
            if (vector.y == this.maxY || vector.y == 0) {
                return true;
            }
            return false;
        };
        this.movePlayer = function (dx, dy) {
            if (this.player) {
                var newX = this.snapToGridValue(this.player.x + (dx * this.TILESIZE));
                var newY = this.snapToGridValue(this.player.y + (dy * this.TILESIZE));
                //Oh noe a wall!
                if (newX <= this.maxX && newX >= 0) {
                    this.player.x = newX;
                }
                else {
                    //give the player time to move
                    if (this.wallHitTicksLeft <= 0) {
                        this.gameOver();
                    }
                    else {
                        this.wallHitTicksLeft -= 1;
                    }
                    return false;
                }
                if (newY <= this.maxY && newY >= 0) {
                    this.player.y = newY;
                }
                else {
                    //give the player time to move
                    if (this.wallHitTicksLeft <= 0) {
                        this.gameOver();
                    }
                    else {
                        this.wallHitTicksLeft -= 1;
                    }
                    return false;
                }
                //reset our allowed ticks after a successful move
                if (this.wallHitTicksLeft < this.wallHitExtraTicks) {
                    this.wallHitTicksLeft = this.wallHitExtraTicks;
                }
                return true;
            }
            return false;
        };
        this.intersectsPlayer = function (x, y) {
            if (x == this.player.x && y == this.player.y) {
                return true;
            }
            if (this.bodies.some(function (item, index, array) {
                return (x == item.x && y == item.y);
            })) {
                return true;
            }
            return false;
        };
        this.intersectsBodyOnly = function (x, y) {
            if (this.bodies.some(function (item, index, array) {
                return (x == item.x && y == item.y);
            })) {
                return true;
            }
            return false;
        };
        this.randomPoint = function () {
            var x;
            var y;
            var isGood = true;
            do {
                isGood = true;
                x = this.snapToGridValue(this.game.world.randomX);
                y = this.snapToGridValue(this.game.world.randomY);
                if (x < 0 || x > this.maxX) {
                    isGood = false;
                }
                if (y < 0 || y > this.maxY) {
                    isGood = false;
                }
                if (this.intersectsPlayer(x, y)) {
                    isGood = false;
                }
            } while (!isGood);
            return { x: x, y: y };
        };
        this.moveBug = function () {
            var pos = this.randomPoint();
            if (!this.bug) {
                this.bug = this.game.add.sprite(pos.x, pos.y, 'bug');
                this.bug.scale.set((this.TILESIZE * 1.0) / this.bug.width, (this.TILESIZE * 1.0) / this.bug.height);
                this.bug.anchor.set(0, 0);
            }
            this.bug.x = pos.x;
            this.bug.y = pos.y;
        };
        this.addBody = function () {
            //always add a new body directly behind the head, just move the head before you shift the bodies up
            //and add the new body piece to the front of the array
            var newX = this.player.x;
            var newY = this.player.y;
            var go = false;
            switch (this.facing) {
                case 'up':
                    newY += this.TILESIZE;
                    go = true;
                    break;
                case 'down':
                    newY -= this.TILESIZE;
                    go = true;
                    break;
                case 'left':
                    newX += this.TILESIZE;
                    go = true;
                    break;
                case 'right':
                    newX -= this.TILESIZE;
                    go = true;
                    break;
            }
            if (go) {
                var newBody = this.game.add.sprite(this.snapToGridValue(newX), this.snapToGridValue(newY), 'snakebody');
                newBody.scale.set((this.TILESIZE * 1.0) / newBody.width, (this.TILESIZE * 1.0) / newBody.height);
                newBody.angle = this.player.angle;
                newBody.anchor.set(this.player.anchor.x, this.player.anchor.y);
                this.bodies.unshift(newBody); //unshift -> prepend
            }
        };
        this.moveBodies = function (emptyX, emptyY) {
            //take the last body and make it the first body in the list, and physically move it
            //to (emptyX, emptyY) which is the last place the player head was before it moved forward
            if (this.bodies.length == 0) {
                return;
            }
            var lastBody = this.bodies.pop();
            lastBody.x = emptyX;
            lastBody.y = emptyY;
            lastBody.angle = this.player.angle;
            lastBody.anchor.set(this.player.anchor.x, this.player.anchor.y);
            this.bodies.unshift(lastBody);
        };
        this.turnUp = function () {
            var _this = this;
            if (!this.canTurn || (this.bodies.length > 0 && this.facing == 'down')) {
                return;
            }
            this.canTurn = false;
            this.facing = 'up';
            this.player.angle = 0;
            this.player.anchor.set(0, 0);
            this.goForward = function () { return _this.movePlayer(0, -1); };
        };
        this.turnDown = function () {
            var _this = this;
            if (!this.canTurn || (this.bodies.length > 0 && this.facing == 'up')) {
                return;
            }
            this.canTurn = false;
            this.facing = 'down';
            this.player.angle = 180;
            this.player.anchor.set(1, 1);
            this.goForward = function () { return _this.movePlayer(0, 1); };
        };
        this.turnLeft = function () {
            var _this = this;
            if (!this.canTurn || (this.bodies.length > 0 && this.facing == 'right')) {
                return;
            }
            this.canTurn = false;
            this.facing = 'left';
            this.player.angle = 270;
            this.player.anchor.set(1, 0);
            this.goForward = function () { return _this.movePlayer(-1, 0); };
        };
        this.turnRight = function () {
            var _this = this;
            if (!this.canTurn || (this.bodies.length > 0 && this.facing == 'left')) {
                return;
            }
            this.canTurn = false;
            this.facing = 'right';
            this.player.angle = 90;
            this.player.anchor.set(0, 1);
            this.goForward = function () { return _this.movePlayer(1, 0); };
        };
        //One game tick
        this.tick = function () {
            var oldX = this.player.x;
            var oldY = this.player.y;
            var moved = this.goForward();
            if (this.intersectsBodyOnly(this.player.x, this.player.y)) {
                this.gameOver();
            }
            if (this.intersectsPlayer(this.bug.x, this.bug.y)) {
                this.addBody();
                this.moveBug();
                this.score += 1;
            }
            else {
                if (moved) {
                    this.moveBodies(oldX, oldY);
                }
            }
            console.log("tick.");
            this.canTurn = true; //only allow one turn per tick, each turn makes this false until here
        };
        this.gameOver = function () {
            var _this = this;
            this.canTurn = false;
            this.startText.text = 'Game over! Press space to restart...';
            this.started = false;
            this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.addOnce(function () { _this.restartGame(); });
            if (this.score > this.highscore) {
                if (typeof (Storage) !== 'undefined') {
                    localStorage.snake_highscore = this.score;
                }
                this.highscore = this.score;
            }
            this.highscoreText.text = 'highscore: ' + this.highscore.toString();
            this.controls.visible = true;
        };
        this.restartGame = function () {
            var _this = this;
            for (var i = 0; i < this.bodies.length; i++) {
                this.bodies[i].destroy();
            }
            this.bodies = [];
            this.score = 0;
            var newPos = this.randomPoint();
            while (this.pointOnWall(newPos)) {
                newPos = this.randomPoint();
            }
            this.player.x = newPos.x;
            this.player.y = newPos.y;
            this.canTurn = true;
            this.turnUp();
            this.moveBug();
            this.started = false;
            this.wallHitTicksLeft = this.wallHitExtraTicks;
            //starts the game after a spacebar press
            this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.addOnce(function () { _this.started = true; _this.startText.text = ""; _this.highscoreText.text = ""; _this.controls.visible = false; });
            this.startText.text = 'press space to start...';
        };
        this.preload = function () {
            this.game.load.image('bug', './Games/SNAKE/Resources/bug.png');
            this.game.load.image('snakehead', './Games/SNAKE/Resources/snakehead.png');
            this.game.load.image('snakebody', './Games/SNAKE/Resources/snakebody.png');
            this.game.load.image('controls', './Games/SNAKE/Resources/controls.png');
        };
        this.create = function () {
            //add all the input to use WASD or UDLR
            var keyboard = this.game.input.keyboard;
            var wKey = keyboard.addKey(Phaser.Keyboard.W);
            var upKey = keyboard.addKey(Phaser.Keyboard.UP);
            var sKey = keyboard.addKey(Phaser.Keyboard.S);
            var downKey = keyboard.addKey(Phaser.Keyboard.DOWN);
            var aKey = keyboard.addKey(Phaser.Keyboard.A);
            var dKey = keyboard.addKey(Phaser.Keyboard.D);
            var leftKey = keyboard.addKey(Phaser.Keyboard.LEFT);
            var rightKey = keyboard.addKey(Phaser.Keyboard.RIGHT);
            wKey.onDown.add(this.turnUp, this);
            upKey.onDown.add(this.turnUp, this);
            sKey.onDown.add(this.turnDown, this);
            downKey.onDown.add(this.turnDown, this);
            aKey.onDown.add(this.turnLeft, this);
            leftKey.onDown.add(this.turnLeft, this);
            dKey.onDown.add(this.turnRight, this);
            rightKey.onDown.add(this.turnRight, this);
            this.player = this.game.add.sprite(this.snapToGridValue(this.maxX / 2.0), this.maxY, 'snakehead');
            //scale the player to fit the tilesize
            this.player.scale.set((this.TILESIZE * 1.0) / this.player.width, (this.TILESIZE * 1.0) / this.player.height);
            this.highscore = 0;
            if (typeof (Storage) !== 'undefined') {
                if (localStorage.snake_highscore) {
                    this.highscore = parseInt(localStorage.snake_highscore);
                }
                else {
                    localStorage.snake_highscore = this.highscore.toString();
                }
            }
            this.startText = this.game.add.text(16, this.game.height - 16, 'press space to start...', { fill: '#ffffff' });
            this.startText.fontSize = 20;
            this.startText.anchor.set(0, 1);
            this.scoreText = this.game.add.text(this.game.width - 16, 16, 'score: 0 highscore: ' + this.highscore.toString(), { fill: '#ffffff' });
            this.scoreText.anchor.set(1, 0);
            this.highscoreText = this.game.add.text(16, 16, 'highscore: ' + this.highscore.toString(), { fill: '#ffffff' });
            this.controls = this.game.add.sprite(this.game.width - 16, this.game.height - 16, 'controls');
            this.controls.anchor.set(1, 1);
            this.restartGame();
        };
        this.update = function () {
            if (this.timer >= this.tickTimeMS && this.started) {
                this.tick();
                this.timer = 0;
            }
            else {
                this.timer += this.game.time.physicsElapsedMS;
            }
            this.scoreText.text = 'score: ' + this.score.toString();
        };
        this.checkOverlap = function (spriteA, spriteB) {
            var boundsA = spriteA.getBounds();
            var boundsB = spriteB.getBounds();
            return Phaser.Rectangle.intersects(boundsA, boundsB);
        };
        this.TILESIZE = 20;
        this.ROWS = 35;
        this.COLUMNS = 35;
        this.tickTimeMS = 40;
        this.maxX = this.TILESIZE * (this.COLUMNS - 1);
        this.maxY = this.TILESIZE * (this.ROWS - 1);
        this.game = new Phaser.Game(this.TILESIZE * this.COLUMNS, this.TILESIZE * this.ROWS, Phaser.AUTO, 'snakegame', this);
        this.bodies = [];
        this.started = false;
        this.wallHitTicksLeft = this.wallHitExtraTicks;
    }
    return SNAKE;
}());
window.onload = function () {
    var game = new SNAKE();
};
//# sourceMappingURL=app.js.map