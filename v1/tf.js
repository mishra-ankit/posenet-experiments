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
    7: {name: "RightArm", offsetAngle: Math.PI},
    5: {name: "LeftArm"},
    9: {name: "LeftForeArm"},
    10: {name: "RightForeArm", offsetAngle: Math.PI},
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