uniform vec3 glowColor;
uniform float opacity;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Fresnel effect - stronger glow at edges
  vec3 viewDirection = normalize(-vPosition);
  float intensity = pow(1.0 - dot(viewDirection, vNormal), 2.5);

  // Add subtle pulse
  float pulse = sin(vPosition.x * 10.0 + vPosition.y * 10.0) * 0.05 + 0.95;
  intensity *= pulse;

  vec3 glow = glowColor * intensity;
  float alpha = intensity * opacity;

  gl_FragColor = vec4(glow, alpha);
}
