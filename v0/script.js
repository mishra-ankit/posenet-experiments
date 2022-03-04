// Create a detector.
const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);


function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.color = "blue";
    this.vx = 0;
    this.vy = 5
}

Ball.prototype = {
    draw: function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    },
    update: function () {
        this.y += this.vy;
    }
};

// Pass in a video stream to the model to detect poses.
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ballObj = new Ball(50, 10);
const boxObj = {
    x: 0,
    width: 100,
    height: 10,
};

video.addEventListener('loadeddata', () => {
    render();
});

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
        })
        .catch(function () {
            console.log("Something went wrong!");
        });
}

async function render() {
    const poses = await detector.estimatePoses(video);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ballObj.draw(); // this will draw current ball
    ballObj.update(); // this will update its position
    
    gameLogic();

    try {
        const rightHandX = poses[0].keypoints[10].x;
        boxObj.x = canvas.width - rightHandX;
        rect(boxObj.x, canvas.height - boxObj.height, boxObj.width, boxObj.height, ctx);
    } catch (e) {
        console.error(e);
    }

    requestAnimationFrame(render);
}

function gameLogic() {
    const isXInBox = ballObj.x > boxObj.x && ballObj.x < boxObj.x + boxObj.width;
    const isYInBox = ballObj.y > (canvas.height - boxObj.height);
    const isCollisionDetected = isXInBox && isYInBox;
    if (isCollisionDetected) {
        console.log("You win!");
    }

    if (ballObj.y > canvas.height + ballObj.radius || isCollisionDetected) {
        ballObj.y = 0;
        ballObj.x = Math.random() * canvas.width;
    }
}

function rect(x, y, w, h, ctx) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

