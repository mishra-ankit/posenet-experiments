class Game {
    _ballCreationInterval = 100;
    _passedTime = 0;
    _balls = [];
    _score = 0;
    static get MaxMisses() { return 5 };
    _miss = 0;

    constructor(scene) {
        this._scene = scene;
    }

    get balls() {
        return this._balls;
    }

    update() {
        this._passedTime++;
        if (this._passedTime % this._ballCreationInterval === 0) {
            this._passedTime = 0;
            this._balls.push(new Ball(this._scene, (ball) => {
                if (!ball.isBallTouched) {
                    this.incrementMiss();
                }
                this.cleanup();
            }));
        }

        this._balls.forEach(ball => {
            ball.update();
        });
    }

    cleanup() {
        this._balls = this._balls.filter(ball => !ball.isDisposed);
    }

    isOver() {
        return this._miss >= Game.MaxMisses;
    }

    incrementScore() {
        this._score++;
        updateScore(this._score, this._miss);
    }

    incrementMiss() {
        this._miss++;
        updateScore(this._score, this._miss);
    }

    end() {
        showOver();
    }
}