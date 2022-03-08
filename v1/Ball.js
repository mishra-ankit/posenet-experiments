class Ball {
    static get BallOrigin() { return { x: 5, y: 5, z: 22 } };
    static get MaxTimeAfterTouch() { return 100 };

    _isBallTouched = false;
    _timeAfterTouch = 0;
    _isDisposed = false;
    get isDisposed() {
        return this._isDisposed;
    }
    set isDisposed(value) {
        this._isDisposed = value;
    }

    get isBallTouched() {
        return this._isBallTouched;
    }

    set isBallTouched(value) {
        this._isBallTouched = value;
    }

    constructor(scene, onDispose) {
        this.scene = scene;
        this._onDispose = onDispose;

        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 1 }, this.scene);

        const material = new BABYLON.StandardMaterial(this.scene);
        material.alpha = 1;
        material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
        sphere.material = material;
        this._ball = sphere;
        this.setInitialState();
    }

    setInitialState() {
        this._ball.position.x = Math.random() * 10 - 5;
        this._ball.position.y = Ball.BallOrigin.y;
        this._ball.position.z = Ball.BallOrigin.z;
        // set ball velocity to zero
        this._ball.physicsImpostor.setLinearVelocity(getRandomBallVelocity());
    }

    isBelowGround() {
        return this._ball.position.y < -5;
    }

    shouldDispose() {
        return this.isBelowGround() || (this._isBallTouched && this._timeAfterTouch > Ball.MaxTimeAfterTouch);
    }

    update() {
        if (this._isBallTouched) {
            this._timeAfterTouch++;
        }

        if (this.shouldDispose()) {
            this.dispose();
        }
    }

    dispose() {
        this.isDisposed = true;
        this._onDispose(this);
        this._ball.dispose();
    }

    getRawBall() {
        return this._ball;
    }
}