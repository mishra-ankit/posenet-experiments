/**
 * Draw a point on a canvas
 * @param {Object} ctx - The canvas context
 * @param {Number} x - The point x position
 * @param {Number} y - The point y position
 * @param {Number} radian - The point radian
 * @param {Number} scale - Scale the point position
 * @param {String} color - The point fill color
 */
function drawPoint(ctx, x, y, radian, scale, color) {
  ctx.beginPath();
  ctx.arc(x*scale, y*scale, radian*scale, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draw pose keypoints onto a canvas
 * @param {Object} ctx - The canvas context
 * @param {Object} keypoints - The pose keypoints
 * @param {Number} radian - The radian of the Keypoints
 * @param {Number} scale - Scale the keypoints position
 * @param {String} color - The keypoints fill color
 */
function drawKeypoints(ctx, keypoints, radian, scale, color) {
  keypoints.forEach((keypoint) => {
    const pos = keypoint;
    drawPoint(ctx, pos.x, pos.y, radian, scale, color);
  });
}

/**
 * Draws a line on a canvas, i.e. a joint
 * @param {Object} ctx - The canvas context
 * @param {Object} a - Te segment a position
 * @param {Object} b - Te segment b position
 * @param {Number} scale - Scale the segment position
 * @param {String} color - The segment stroke color
 * @param {Number} lineWidth - The width of the segment line
 */
function drawSegment(ctx, a, b, scale, color, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(a.x*scale, a.y*scale);
  ctx.lineTo(b.x*scale, b.y*scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 * @param {Object} ctx - The canvas context
 * @param {Object} keypoints - The pose keypoints
 * @param {Number} scale - Scale the skeleton position
 * @param {String} color - The skeleton stroke color
 * @param {Number} lineWidth - The width of the skeleton lines
 */
function drawSkeleton(ctx, keypoints, scale, color, lineWidth) {
  const adjacentKeyPoints = poseDetection.util.getAdjacentPairs("PoseNet");
  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(ctx, keypoints[0].position, keypoints[1].position,
      scale, color, lineWidth);
  });
}

/**
 * Draw the Keypoints and Skeleton
 * @param {Object} ctx - The canvas context
 * @param {Object} keypoints - The pose keypoints
 * @param {Number} radian - The radian of the Keypoints
 * @param {Number} scale -Scale the pose
 * @param {String} pointsColor - The points fill color
 * @param {String} skeletonColor - The skeleton stroke color
 * @param {String} skeletonLineWidth - The width of the skeleton lines
 */
function drawPose(ctx, keypoints, radian, scale,
  pointsColor, skeletonColor, skeletonLineWidth) {
//   drawSkeleton(ctx, keypoints, scale, skeletonColor, skeletonLineWidth);
  drawKeypoints(ctx, keypoints, radian, scale, pointsColor);
}

/**
 * Render the pose to the canvas
 * @param {String} id - The id of the canvas
 * @param {Array}  data - The posenet data array
 * @param {Number} w - The width of the canvas
 * @param {Number} h - The height of the canvas
 * @param {Number} radian - The radian of the Keypoints
 * @param {Number} scale -Scale the pose
 * @param {String} backgroundColor - The canvas background color
 * @param {String} pointsColor - The points fill color
 * @param {String} skeletonColor - The skeleton stroke color
 * @param {String} skeletonLineWidth - The width of the skeleton lines
 */
function renderToCanvas(id, data, w, h, radian = 3, scale = 1,
  backgroundColor ='yellow', pointsColor = 'red', skeletonColor = 'blue',
  skeletonLineWidth = 2) {
  const canvas = document.getElementById(id);
  let ctx = canvas.getContext('2d');
  // draw the background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, w, h);
  // draw the pose
//   drawPose(ctx, data, radian, scale,
//     pointsColor, skeletonColor, skeletonLineWidth);
}