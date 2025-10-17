uniform vec3 baseColor;
uniform vec3 tipColor;
uniform float time;
uniform float opacity;
varying vec2 vUv;
varying float vHeight;

void main() {
  // Gradient from base to tip
  vec3 color = mix(baseColor, tipColor, vHeight);

  // Add glow effect
  float glow = 1.0 - abs(vUv.x - 0.5) * 2.0;
  glow = pow(glow, 2.0);

  // Pulsing effect
  float pulse = sin(time * 3.0 + vHeight * 5.0) * 0.2 + 0.8;

  color *= glow * pulse;

  // Fade at top and bottom
  float alpha = smoothstep(0.0, 0.1, vHeight) * smoothstep(1.0, 0.9, vHeight);
  alpha *= glow * opacity;

  gl_FragColor = vec4(color, alpha);
}
