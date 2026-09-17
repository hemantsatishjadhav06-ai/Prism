import * as THREE from 'three';

/**
 * Camera path splines (spec §6.1).
 *
 * Two curves: one the camera travels along, one it looks at. The two-spline
 * approach is what gives natural head-turning into corners instead of a rigid
 * forward stare.
 *
 * `arcLengthDivisions` is raised to 2000 from its default of 200.
 * `getPointAt` is arc-length reparameterised using a cached lookup table of
 * that many segments; across a long multi-section path, 200 quantises to
 * visible stepping during slow scrub. This is the single cheapest fix in the
 * whole rig and the bug it prevents is maddening to diagnose.
 */

const ARC_LENGTH_DIVISIONS = 2000;

export interface CameraPath {
  path: THREE.CatmullRomCurve3;
  look: THREE.CatmullRomCurve3;
  dispose: () => void;
}

/**
 * Home tunnel path.
 *
 * Runs forward along -Z with gentle lateral drift. The full path covers the
 * whole Home narrative so that Phase 4 only has to add station geometry at
 * the `t` values in §6.1's table — the spline itself does not change.
 *
 * `straighten` produces the touch variant (§6.2): tight curves at a narrow
 * FOV on a handheld screen cause genuine motion discomfort, so phones get a
 * flatter path rather than the same path scrubbed faster.
 */
export function buildHomePath(straighten = false): CameraPath {
  const lateral = straighten ? 0.25 : 1;

  // Waypoints. Z marches away from the viewer; X/Y give the tunnel its sway.
  const pathPoints: [number, number, number][] = [
    [0, 0, 6], // t=0 hero — camera sits just inside the mouth of the tunnel
    [0, 0, 0],
    [0.8 * lateral, 0.3, -8],
    [-0.6 * lateral, -0.2, -17],
    [0.9 * lateral, 0.4, -26],
    [-0.8 * lateral, 0.1, -35],
    [0.5 * lateral, -0.3, -44],
    [0, 0.2, -53],
    // Platform chamber — the tunnel widens and the camera rises slightly.
    [0, 1.0, -62],
    [0, 1.2, -70],
    /**
     * Testimonial region — the camera decelerates to a near-stop here, and
     * it does so WITHOUT a pin. `ScrollTrigger.pin` injects a spacer, which
     * changes document height, which shifts the scroll-to-t mapping for
     * every later section and re-shifts it on every resize (§1.1, §6.1).
     *
     * CORRECTION TO §6.1's STATED MECHANISM. The spec says dwell comes from
     * "several spline keyframes at nearly-identical positions", and that is
     * not what does it here. `getPointAt` is ARC-LENGTH reparameterised, so
     * equal steps in t are equal steps in distance no matter how the control
     * points are spaced — clustering them changes the curve's shape, not the
     * camera's speed. If anything, a near-coincident cluster contributes
     * almost no arc length and is therefore traversed in less t, not more.
     *
     * The dwell actually comes from HOME_SECTIONS in lib/scroll.ts: the
     * testimonial row maps 10% of scroll (0.82–0.92) onto 4% of path length
     * (t 0.80–0.84). The table is the mechanism; the keyframes below merely
     * keep the path straight and level through the dwell so the near-stop
     * does not read as drift. Worth knowing before Phase 4 tries to tune
     * dwell by moving control points and finds it has no effect.
     */
    [0, 1.25, -74.0],
    [0, 1.26, -74.4],
    [0, 1.27, -74.7],
    [0, 1.28, -75.0],
    // FAQ: canvas idles here, camera held.
    [0, 1.3, -77],
    [0, 1.3, -80],
  ];

  // The look curve runs ahead of and slightly above the travel curve.
  const lookPoints: [number, number, number][] = [
    [0, 0, -2],
    [0, 0, -8],
    [0.4 * lateral, 0.2, -17],
    [-0.3 * lateral, 0, -26],
    [0.5 * lateral, 0.2, -35],
    [-0.4 * lateral, 0.1, -44],
    [0.2 * lateral, -0.1, -53],
    [0, 0.3, -62],
    [0, 1.1, -70],
    [0, 1.25, -75],
    [0, 1.28, -78],
    [0, 1.3, -82],
    [0, 1.3, -84],
    [0, 1.3, -86],
    [0, 1.3, -88],
    [0, 1.3, -90],
  ];

  const path = new THREE.CatmullRomCurve3(
    pathPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'catmullrom',
    0.5,
  );
  path.arcLengthDivisions = ARC_LENGTH_DIVISIONS;
  path.updateArcLengths();

  const look = new THREE.CatmullRomCurve3(
    lookPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    'catmullrom',
    0.5,
  );
  look.arcLengthDivisions = ARC_LENGTH_DIVISIONS;
  look.updateArcLengths();

  return {
    path,
    look,
    // CatmullRomCurve3 holds no GPU resources, but the arc-length cache is a
    // sizable array and the disposal contract (§5.3) is a habit worth keeping
    // uniform across everything the scene creates.
    dispose: () => {
      path.arcLengthDivisions = 1;
      look.arcLengthDivisions = 1;
    },
  };
}
