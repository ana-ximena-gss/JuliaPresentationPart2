(function (root, factory) {
  const model = factory();
  if (typeof module === "object" && module.exports) module.exports = model;
  else root.OrbitModel = model;
})(globalThis, function () {
  const EARTH_RADIUS_KM = 6371;
  const STEPS = 1600;

  function acceleration(x, y, mu) {
    const radiusSquared = x * x + y * y;
    const radiusCubed = radiusSquared * Math.sqrt(radiusSquared);
    return { x: -mu * x / radiusCubed, y: -mu * y / radiusCubed };
  }

  function surfaceIntersection(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const a = dx * dx + dy * dy;
    const b = 2 * (startX * dx + startY * dy);
    const c = startX * startX + startY * startY - EARTH_RADIUS_KM ** 2;
    const discriminant = Math.max(0, b * b - 4 * a * c);
    const fraction = a === 0 ? 0 : Math.max(0, Math.min(1, (-b - Math.sqrt(discriminant)) / (2 * a)));
    return { x: startX + fraction * dx, y: startY + fraction * dy };
  }

  function simulate({ distanceKm, speedKmS, muKm3S2 }) {
    const circularSpeed = Math.sqrt(muKm3S2 / distanceKm);
    const escapeSpeed = Math.sqrt(2 * muKm3S2 / distanceKm);
    const specificEnergy = speedKmS ** 2 / 2 - muKm3S2 / distanceKm;
    const circularPeriod = 2 * Math.PI * Math.sqrt(distanceKm ** 3 / muKm3S2);
    const semiMajorAxis = specificEnergy < 0 ? -muKm3S2 / (2 * specificEnergy) : null;
    const period = semiMajorAxis
      ? 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / muKm3S2)
      : null;
    const duration = period ? Math.min(period, circularPeriod * 6) : circularPeriod * 2;
    const dt = duration / (STEPS - 1);

    let x = distanceKm;
    let y = 0;
    let vx = 0;
    let vy = speedKmS;
    let currentAcceleration = acceleration(x, y, muKm3S2);
    const points = [{ x, y }];
    let impact = false;

    for (let step = 1; step < STEPS; step += 1) {
      const halfVx = vx + currentAcceleration.x * dt / 2;
      const halfVy = vy + currentAcceleration.y * dt / 2;
      x += halfVx * dt;
      y += halfVy * dt;

      const radius = Math.hypot(x, y);
      if (radius <= EARTH_RADIUS_KM) {
        const impactPoint = surfaceIntersection(points.at(-1).x, points.at(-1).y, x, y);
        x = impactPoint.x;
        y = impactPoint.y;
        points.push({ x, y });
        impact = true;
        break;
      }

      currentAcceleration = acceleration(x, y, muKm3S2);
      vx = halfVx + currentAcceleration.x * dt / 2;
      vy = halfVy + currentAcceleration.y * dt / 2;
      points.push({ x, y });
    }

    const circular = !impact && Math.abs(speedKmS - circularSpeed) / circularSpeed < 0.012;
    const type = impact
      ? "IMPACT PATH"
      : circular
        ? "CIRCULAR ORBIT"
        : specificEnergy < 0
          ? "ELLIPTICAL ORBIT"
          : "ESCAPE TRAJECTORY";

    return {
      points,
      type,
      impact,
      closed: specificEnergy < 0 && !impact,
      circularSpeed,
      escapeSpeed,
      circularPeriod,
      period,
      semiMajorAxis,
      specificEnergy,
      eccentricity: semiMajorAxis
        ? Math.sqrt(Math.max(0, 1 - (distanceKm * speedKmS) ** 2 / (muKm3S2 * semiMajorAxis)))
        : null,
      duration,
      dt
    };
  }

  return { EARTH_RADIUS_KM, STEPS, simulate };
});
