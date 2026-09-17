// shaders/particles.frag — spec §6.2
//
// Soft radial falloff, additive blending, depthWrite false. That last one is
// not optional: without it additive points z-fight and punch visible holes in
// each other.

precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

varying float vSeed;
varying float vProgress;

void main() {
  // Soft radial falloff from the point centre.
  float d = length(gl_PointCoord - vec2(0.5));
  float alpha = 1.0 - smoothstep(0.0, 0.5, d);
  if (alpha <= 0.001) discard;

  // A touch of per-particle brightness variation so the field does not read
  // as one flat mass. Formed particles sit slightly brighter than drifting
  // chaos, which is what makes "resolved" feel like an arrival.
  float brightness = mix(0.55, 1.0, vProgress) * (0.75 + vSeed * 0.35);

  gl_FragColor = vec4(uColor * brightness, alpha * uOpacity);
}
