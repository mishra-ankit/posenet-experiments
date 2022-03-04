var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}


var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
var delayCreateScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.OimoJSPlugin());

    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 8, -40), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    // Attach the camera to the canvas
    camera.attachControl(canvas, true);
    // camera.inputs.addMouseWheel();

    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const groundDimensions = {
        width: 50,
        height: 50,
    };

    // create gronud
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {
        width: groundDimensions.width,
        height: groundDimensions.height,
    }, scene);

    // set ground color to green
    ground.material = new BABYLON.StandardMaterial("ground-material", scene);
    ground.material.diffuseColor = new BABYLON.Color3(0, 1, 0);

    const roomWidth = 15;
    const roomZOffset = 5;
    const roomHeight = 10;
    const roomLength = groundDimensions.width - roomZOffset * 2;
    const wallThickness = 0.1;

    createWall(scene, { x: -roomWidth / 2, y: 0, z: roomZOffset, height: roomHeight, width: wallThickness, depth: roomLength }, groundDimensions);
    createWall(scene, { x: roomWidth / 2, y: 0, z: roomZOffset, height: roomHeight, width: wallThickness, depth: roomLength }, groundDimensions);
    createWall(scene, { x: 0, y: roomHeight, z: roomZOffset, height: wallThickness, width: roomWidth, depth: roomLength }, groundDimensions);
    createWall(scene, { x: 0, y: 0, z: roomLength / 2 + roomZOffset, height: roomHeight, width: roomWidth, depth: wallThickness }, groundDimensions);

    const game = new Game(scene);

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    const cylinders = [];

    scene.beforeRender = async function () {
        if (isReady()) {
            if (!game.isOver()) {
                game.update();
            } else {
                game.end();
            }

            const posArr = await getBonesPosition();
            const nosePos = posArr[0];
            const offsetY = noseTarget + Math.abs(nosePos.y * tfConversionScale);
            const offsetX = nosePos.x * tfConversionScale;

            adjacentPairs.map((pair, index) => {
                const p1 = posArr[pair[0]];
                const p2 = posArr[pair[1]];


                // find center of the two points
                const center = {
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                };

                // find angle between the two points
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

                // find distance between the two points
                const height = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) * tfConversionScale;

                const playerZPosition = -groundDimensions.width / 2 + (roomZOffset * 2);

                const { x, y } = getTransformedPos(center, tfConversionScale, offsetX, offsetY);
                cylinders[index]?.dispose();
                if (confidenceThreshold < p1.score && confidenceThreshold < p2.score) {
                    cylinders[index] = createCylinder(height, scene, index);
                    cylinder = cylinders[index];
                    cylinder.setAbsolutePosition(x, y, playerZPosition);
                    cylinder.rotation.z = angle + Math.PI / 2;
                    cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(cylinder, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, restitution: 1 }, scene);

                    game.balls.forEach(ball => {
                        const rawBall = ball.getRawBall();
                        cylinder.physicsImpostor.registerOnPhysicsCollide(rawBall.physicsImpostor, (main, collided) => {
                            rawBall.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                            if (!ball.isBallTouched) {
                                game.incrementScore();
                                ball.isBallTouched = true;
                            }
                        });
                    })
                }
            });
        }
    }

    return scene;
};

window.initFunction = async function () {

    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = delayCreateScene();
};

initFunction().then(() => {
    sceneToRender = scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});

function createWall(scene, { x, y, z, height, width, depth }, groundDimensions) {
    var material_columns = new BABYLON.StandardMaterial('columnsmat', scene);
    material_columns.diffuseColor = BABYLON.Color3.White();
    var fireTexture = new BABYLON.FireProceduralTexture("fire", 256, scene);
    material_columns.emissiveTexture = fireTexture;
    material_columns.opacityTexture = fireTexture;
    material_columns.alpha = 0.5;

    var cube = BABYLON.MeshBuilder.CreateBox('cube', {
        height,
        width,
        depth,
    }, scene);

    cube.position.x = x;
    cube.position.y = (height / 2) + y;
    cube.position.z = z;
    cube.material = material_columns;

    cube.physicsImpostor = new BABYLON.PhysicsImpostor(cube, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1 }, scene);
}

function getRandomBallVelocity() {
    const y = getRandomInRange(5, 10);
    const z = getRandomInRange(30, 40);
    const velocity = new BABYLON.Vector3(0, y, -z);
    return velocity;
}

function createCylinder(height, scene, name) {
    // create cylinder
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder-" + name, {
        height,
        diameter: 0.5,
    }, scene);

    const material = new BABYLON.StandardMaterial(scene);
    material.alpha = 0.7;
    material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
    cylinder.material = material;

    return cylinder;
}

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

function updateScore(score, miss) {
    document.getElementById("score-text").innerText = `Score: ${score} \n Miss: ${miss}`;
}

function showOver() {
    document.getElementById("over").classList.remove("hidden");
}