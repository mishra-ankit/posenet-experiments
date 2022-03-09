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
const MODEL_SCALE = 8;

var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
var delayCreateScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.OimoJSPlugin());
    const devMode = false;
    if (devMode !== true) {
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 8, -40), scene);
        // camera.setTarget(BABYLON.Vector3.Zero());
        // Attach the camera to the canvas
        camera.attachControl(canvas, true);
        camera.inputs.addMouseWheel();
    } else {
        var camera = new BABYLON.ArcRotateCamera("camera", 1.5, 1, 10, BABYLON.Vector3.Zero(), scene);
        camera.setTarget(new BABYLON.Vector3(0, 4, 0));
        camera.attachControl(canvas, true);
    }

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
    // ground.material.diffuseColor = new BABYLON.Color3(0, 1, 0);

    // ground set material to wood floor texture
    ground.material.diffuseTexture = new BABYLON.Texture("assets/tile.png", scene);
    

    const roomWidth = 2.5 * MODEL_SCALE + 2;
    const roomZOffset = 5 ;
    const roomHeight = 2 * MODEL_SCALE + 1;
    const roomLength = groundDimensions.width - roomZOffset * 2;
    const wallThickness = 0.1;

    createWall(scene, { x: -roomWidth / 2, y: 0, z: roomZOffset, height: roomHeight, width: wallThickness, depth: roomLength }, groundDimensions);
    createWall(scene, { x: roomWidth / 2, y: 0, z: roomZOffset, height: roomHeight, width: wallThickness, depth: roomLength }, groundDimensions);
    createWall(scene, { x: 0, y: roomHeight, z: roomZOffset, height: wallThickness, width: roomWidth, depth: roomLength }, groundDimensions);
    createWall(scene, { x: 0, y: 0, z: roomLength / 2 + roomZOffset, height: roomHeight, width: roomWidth, depth: wallThickness }, groundDimensions);

    const playerZPosition = -groundDimensions.width / 2 + (roomZOffset * 2) - 2;

    const game = new Game(scene, playerZPosition);

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    const cylinders = [];


    BABYLON.SceneLoader.ImportMesh(null, "", "dummy3.babylon", scene, function (meshes, particleSystems, skeletons) {
        mesh = meshes[0]

        // add material to mesh
        var material_model = new BABYLON.StandardMaterial('model-material', scene);
        material_model.diffuseColor = BABYLON.Color3.White();
        material_model.alpha = 0.8;

        // add material to model
        mesh.material = material_model;

        window.skeleton = skeletons[0];
        window.mesh = mesh;
        console.log(skeleton.bones.map(i => i.name));
        scene.stopAllAnimations();

        // move model on z axis
        mesh.position.z = playerZPosition;

        meshes.forEach(m => {
            mesh.scaling = new BABYLON.Vector3(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
        });
    });

    scene.beforeRender = async function () {
        // console.log(engine.getFps().toFixed());
        if (isReady()) {
            if (!game.isOver()) {
                game.update();
            } else {
                game.end();
            }

            const posArr = await game.getBonesPosition();
            adjacentPairs.map((pair, index) => {
                const p1 = posArr[pair[0]];
                const p2 = posArr[pair[1]];

                // find angle between the two points
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                const boneInfo = mixamoToTFPairIndexMap[index];

                if (boneInfo) {
                    const bone = getBoneByName(skeleton.bones, `mixamorig:${boneInfo.name}`);
                    const defaultHeight = 1.5;
                    const boneHeight = boneInfo.height ?? defaultHeight;
                    const adjustedAngle = angle + (boneInfo?.offsetAngle ?? 0);

                    const sign = boneInfo.sign ?? (boneInfo.name.toLowerCase().startsWith('right') ? 1 : -1);
                    // get x component of verctor from angle
                    const xAdjust = sign *  Math.cos(adjustedAngle) * (boneHeight/2);
                    // get y component of vector from angle
                    const yAdjust = sign *  Math.sin(adjustedAngle) * (boneHeight/2);
                    cylinders[index]?.dispose();
                    if (confidenceThreshold < p1.score && confidenceThreshold < p2.score) {
                        bone.setRotation(new BABYLON.Vector3(0, 0, adjustedAngle), BABYLON.Space.WORLD, mesh);
                        cylinders[index] = createCylinder(boneHeight * MODEL_SCALE * 0.2, scene, index);
                        cylinder = cylinders[index];
                        const bonePos = bone.getAbsolutePosition();
                        cylinder.setAbsolutePosition((bonePos.x * MODEL_SCALE) + xAdjust, (bonePos.y * MODEL_SCALE) + yAdjust , bonePos.z * MODEL_SCALE + playerZPosition);
                        cylinder.rotation.z = adjustedAngle + Math.PI / 2 + (boneInfo.cylinderRotate ?? 0);
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
                        });
                    } else {
                        // bone.setRotation(new BABYLON.Vector3(0, 0, boneInfo.defaultAngel ?? 0), BABYLON.Space.WORLD, mesh);
                    }
                }
            });
        }
    }

    // show fps on screen
    scene.onBeforeRenderObservable.add(function () {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        }
    });

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

function createCylinder(height, scene, name) {
    // create cylinder
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder-" + name, {
        height,
        diameter: 0.8,
    }, scene);

    const material = new BABYLON.StandardMaterial(scene);
    material.alpha = 0;
    material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
    cylinder.material = material;

    return cylinder;
}