// shaders/particles.vert — spec §6.2
//
// The one particle vertex shader. Two vec3 attributes per particle — aChaos
// (noise-field position) and aTarget (formation position) — plus aSeed, mixed
// by a uProgress uniform.
//
// No per-frame CPU position writes, ever. The CPU sets one float per frame;
// the GPU does the interpolation for every particle.

uniform float uProgress;   // 0 = chaos, 1 = formed
uniform float uTime;
uniform float uSize;       // base point size, tier-dependent (§6.2)
uniform float uDriftScale; // 0 under prefers-reduced-motion

attribute vec3 aChaos;
attribute vec3 aTarget;
attribute float aSeed;

varying float vSeed;
varying float vProgress;

float easeInOutCubic(float x) {
  return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
}

void main() {
  // The aSeed offset staggers each particle's arrival so the formation
  // *coalesces* over roughly 0.18 of the transition instead of every point
  // landing on the same frame. Without it the effect reads as mechanical,
  // and this one detail is most of the difference between "expensive" and
  // "tutorial" (§6.2).
  float p = easeInOutCubic(clamp(uProgress + (aSeed - 0.5) * 0.18, 0.0, 1.0));

  // Chaos drifts freely; the formed state barely breathes.
  vec3 drift = vec3(
    sin(uTime * 0.25 + aSeed * 6.283),
    cos(uTime * 0.21 + aSeed * 4.712),
    sin(uTime * 0.19 + aSeed * 3.141)
  ) * mix(0.55, 0.02, p) * uDriftScale;

  vec3 pos = mix(aChaos, aTarget, p) + drift;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Perspective-correct sizing. Clamped so a particle that ends up very
  // close to the near plane cannot blow up into a screen-filling quad and
  // torch fill rate — which is the actual bottleneck here (§6.2).
  //
  // The 6px ceiling is deliberately tight. At 12px, 40,000 additive points
  // near the camera merge into an opaque white sheet that buries the DOM
  // headline behind them — which breaks both the LCP requirement (§11.1)
  // and text contrast (§10.1). Small points read as dust; large ones read
  // as fog.
  gl_PointSize = clamp(uSize * (300.0 / -mv.z), 0.5, 6.0);

  vSeed = aSeed;
  vProgress = p;
}
