let detector;
const whichNet = poseDetection.SupportedModels.MoveNet;
(async () => {
    detector = await poseDetection.createDetector(whichNet);
})()

let isTFReady = false;
const tfVideo = document.getElementById('tfVideo');
const tfCanvas = document.getElementById('skeletonCanvas');
const ctx = tfCanvas.getContext('2d');

const mixamoToTFPairIndexMap = {
    7: {name: "RightArm", height: 2, offsetAngle: Math.PI, defaultAngel: 0},
    5: {name: "LeftArm", height: 2, defaultAngel: 0},
    9: {name: "LeftForeArm", height: 2, defaultAngel: Math.PI / 2},
    10: {name: "RightForeArm", height: 2, offsetAngle: Math.PI, defaultAngel: - Math.PI / 2},
    13: {name: "RightUpLeg", height: 2, offsetAngle: -Math.PI/2},
    12: {name: "LeftUpLeg", height: 2, offsetAngle: -Math.PI/2},
    0: {name: 'Head', height: 0.5, offsetAngle: Math.PI/2 - Math.PI/3.5, cylinderRotate: Math.PI/2},
}

const adjacentPairs = poseDetection.util.getAdjacentPairs(whichNet);//.slice(9, 10);
console.log(adjacentPairs);

tfVideo.addEventListener('loadeddata', () => {
    isTFReady = true;
});

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            tfVideo.srcObject = stream;
        })
        .catch(function () {
            console.log("Something went wrong!");
        });
}

async function getPose() {
    const poses = await detector.estimatePoses(tfVideo, {
        flipHorizontal: true
    });
    return poses[0];
}

function isReady() {
    return isTFReady && detector;
}

async function getBonesPosition() {
    const pos = await getPose();
    tfCanvas.width = tfVideo.clientWidth;
    tfCanvas.height = tfVideo.clientHeight;
    renderToCanvas(ctx, pos.keypoints, tfVideo.clientWidth, tfVideo.clientHeight);
    return pos.keypoints;
}