const assert = require("node:assert/strict");
const test = require("node:test");
const { EARTH_RADIUS_KM, STEPS, simulate } = require("./orbit-model.js");

const earthOrbit = { distanceKm: 12000, muKm3S2: 398600 };

test("the default project settings produce a non-impacting elliptical orbit", () => {
  const result = simulate({ distanceKm: 14000, speedKmS: 4.7, muKm3S2: 398600 });

  assert.equal(result.type, "ELLIPTICAL ORBIT");
  assert.equal(result.impact, false);
  assert.equal(result.closed, true);
});

test("the elliptical preset stays above Earth at the minimum control distance", () => {
  const distanceKm = 8000;
  const muKm3S2 = 398600 * 1.5;
  const circularSpeed = Math.sqrt(muKm3S2 / distanceKm);
  const safeRatio = Math.max(
    0.88,
    Math.sqrt(2 * EARTH_RADIUS_KM / (distanceKm + EARTH_RADIUS_KM)) * 1.03
  );
  const result = simulate({ distanceKm, muKm3S2, speedKmS: circularSpeed * safeRatio });

  assert.equal(result.type, "ELLIPTICAL ORBIT");
  assert.equal(result.impact, false);
  assert.ok(Math.min(...result.points.map(({ x, y }) => Math.hypot(x, y))) > EARTH_RADIUS_KM);
});

test("classifies a circular orbit and keeps its radius nearly constant", () => {
  const circularSpeed = Math.sqrt(earthOrbit.muKm3S2 / earthOrbit.distanceKm);
  const result = simulate({ ...earthOrbit, speedKmS: circularSpeed });
  const radii = result.points.map(({ x, y }) => Math.hypot(x, y));

  assert.equal(result.type, "CIRCULAR ORBIT");
  assert.equal(result.points.length, STEPS);
  assert.ok(Math.max(...radii) - Math.min(...radii) < 3);
  assert.ok(Math.abs(result.points.at(-1).x - earthOrbit.distanceKm) < 5);
});

test("classifies a slower bound orbit as elliptical", () => {
  const distanceKm = 20000;
  const circularSpeed = Math.sqrt(earthOrbit.muKm3S2 / distanceKm);
  const result = simulate({ ...earthOrbit, distanceKm, speedKmS: circularSpeed * 0.78 });

  assert.equal(result.type, "ELLIPTICAL ORBIT");
  assert.equal(result.closed, true);
  assert.ok(result.eccentricity > 0.35 && result.eccentricity < 0.45);
  assert.ok(result.period < result.circularPeriod);
  assert.ok(Math.min(...result.points.map(({ x, y }) => Math.hypot(x, y))) > EARTH_RADIUS_KM);
});

test("classifies a speed above escape velocity as an open trajectory", () => {
  const escapeSpeed = Math.sqrt(2 * earthOrbit.muKm3S2 / earthOrbit.distanceKm);
  const result = simulate({ ...earthOrbit, speedKmS: escapeSpeed * 1.08 });

  assert.equal(result.type, "ESCAPE TRAJECTORY");
  assert.equal(result.closed, false);
  assert.ok(Math.hypot(result.points.at(-1).x, result.points.at(-1).y) > earthOrbit.distanceKm * 2);
});

test("stops an intersecting orbit at the modeled Earth surface", () => {
  const result = simulate({ ...earthOrbit, speedKmS: 2 });
  const lastPoint = result.points.at(-1);

  assert.equal(result.type, "IMPACT PATH");
  assert.equal(result.impact, true);
  assert.ok(Math.abs(Math.hypot(lastPoint.x, lastPoint.y) - EARTH_RADIUS_KM) < 1e-8);
});

