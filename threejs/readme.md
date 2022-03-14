https://web.dev/requestvideoframecallback-rvfc/


https://github.com/bertyhell/video-to-frames


https://stackoverflow.com/questions/32699721/javascript-extract-video-frames-reliably


function boneLookAtLocal(bone, position) {
  bone.updateMatrixWorld()
  let direction = position.clone().normalize()
  let pitch = Math.asin(-direction.y)// + bone.offset
  let yaw = Math.atan2(direction.x, direction.z); //Beware cos(pitch)==0, catch this exception!
  let roll = Math.PI;
  bone.rotation.set(roll, yaw, pitch);
}

function boneLookAtWorld(bone, v) {
  const parent = bone.parent;
  scene.attach(bone)
  boneLookAtLocal(bone, v)
  parent.attach(bone)
}


https://veeenu.github.io/blog/implementing-skeletal-animation/
