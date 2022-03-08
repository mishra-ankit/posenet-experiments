function getTransformedPos(p1, p2, tfConversionScale, offsetX, offsetY) {
    // find center of the two points
    const pos = p1;
    const scaledX = pos.x * tfConversionScale;
    const scaledY = pos.y * tfConversionScale;
    const transformedX = -scaledX + offsetX;
    const transformedY = -scaledY + offsetY;
    return { x: transformedX, y: transformedY };
}

function renderToCanvas(ctx, keypoints, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    keypoints.forEach(keypoint => {
        ctx.beginPath();
        ctx.arc(width - keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
    });
}

// get random in range
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getBoneByName(bones, name) {
    return bones.find(bone => bone.name === name);
}

function getRandomBallVelocity() {
    const speed = 1.2;
    const y = getRandomInRange(5, 10) * speed;
    const z = getRandomInRange(40, 50) * speed;
    const velocity = new BABYLON.Vector3(0, y, -z);
    return velocity;
}