class Game {
    _ballCreationInterval = 100;
    _passedTime = 0;
    _balls = [];
    _score = 0;
    static get MaxMisses() { return 5 };
    _miss = 0;
    _isRunning = false;
    btnStart = document.getElementById('startBtn');
    handImg = document.getElementById('hand');
    soundBg;
    soundMiss
    soundHit
    soundOver

    get isRunning() {
        return this._isRunning;
    }

    set isRunning(value) {
        this._isRunning = value;
    }

    constructor(scene, playerPositionZ) {
        this._scene = scene;

        Ball.PLAYER_POSITION_Z = playerPositionZ;

        this.btnStart.addEventListener('click', () => {
            this.start();
        });

        this.soundMiss = new BABYLON.Sound("miss", "./assets/error.mp3", scene);
        this.soundHit = new BABYLON.Sound("hit", "./assets/ball_hit.mp3", scene);
        this.soundOver = new BABYLON.Sound("over", "./assets/over.mp3", scene);
        this.soundBg = new BABYLON.Sound("startSong", "./assets/bg2.mp3", scene, function () {
        }, {
            volume: 0.2,
            loop: true,
            autoplay: true
        });
    }

    start() {
        showHideToggle(false, 'start');
        showHideToggle(false, 'hand');
        this.isRunning = true;
    }

    getBonesPosition() {
        return getBonesPosition();
    }

    get balls() {
        return this._balls;
    }

    async update() {
        if (!this.isRunning) {
            const bones = await this.getBonesPosition();
            if (bones) {
                const rHand = bones[10];
                this.handImg.style.top = rHand.y + 'px';
                this.handImg.style.left = (window.innerWidth - rHand.x - (window.innerWidth * 0.2)) + 'px';

                if (isHovering(this.handImg, this.btnStart)) {
                    this.start();
                }
            }

            return;
        }
        this._passedTime++;
        if (this._passedTime % this._ballCreationInterval === 0) {
            this._passedTime = 0;
            const handleBallDestroy = (ball) => {
                this.cleanup();
            }

            const handleMiss = () => {
                this.soundMiss.play();
                this.incrementMiss();
            }
            this._balls.push(new Ball(this._scene, handleBallDestroy, handleMiss));
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
        this.soundHit.play();
        this._score++;
        updateScore(this._score, this._miss);
    }

    incrementMiss() {
        this._miss++;
        updateScore(this._score, this._miss);
    }

    end() {
        if (this.isRunning) {
            this.soundBg.stop();
            this.soundOver.play();
            this.isRunning = false;
            showHideToggle(true, 'over');
        }
    }
}