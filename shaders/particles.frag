// shaders/particles.frag — spec §6.2
//
// Soft radial falloff, additive blending, depthWrite false. That last one is
// not optional: without it additive points z-fight and punch visible holes in
// each other.

precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

// Light-resolve endpoints (docs/DESIGN-hero-light-resolve.md). uResolve is a
// scroll-derived 0..1: 0 keeps the original dark-scene colour/opacity, 1 is the
// resolved light-scene appearance. When the extra props are omitted these
// default so that mix() returns the base colour and opacity unchanged.
uniform vec3 uColorResolved;
uniform float uOpacityResolved;
uniform float uResolve;

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

  // Cross-fade colour and opacity toward the resolved (light-scene) values as
  // the backdrop washes to light. Additive blending can only lighten, so the
  // opacity end is what keeps the field from stacking into a haze over the
  // bright ground — the colour shift only matters through the mid-transition.
  vec3 col = mix(uColor, uColorResolved, uResolve);
  float op = mix(uOpacity, uOpacityResolved, uResolve);

  gl_FragColor = vec4(col * brightness, alpha * op);
}
