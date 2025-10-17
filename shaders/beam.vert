uniform float time;
varying vec2 vUv;
varying float vHeight;

void main() {
  vUv = uv;
  vHeight = position.y;

  vec3 pos = position;

  // Add slight wave motion to beam
  float wave = sin(time * 2.0 + position.y * 3.0) * 0.02;
  pos.x += wave;
  pos.z += wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
