import * as THREE from "three";
import type { Point2 } from "./coordinates";

export function createSeatGeometry(): THREE.BoxGeometry {
  return new THREE.BoxGeometry(0.5, 0.5, 0.5);
}

/**
 * Convex hull of 2D points (monotone chain).
 * Used to turn a section's seat cloud into a drawable outline.
 */
export function computeConvexHull(points: Point2[]): Point2[] {
  if (points.length < 3) return points.slice();

  const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Point2, a: Point2, b: Point2) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point2[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: Point2[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const point = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function polygonCentroid(points: Point2[]): Point2 {
  if (points.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
}

/** Pushes every vertex away from the centroid. Convex shapes only, so no self-intersection. */
export function expandPolygon(points: Point2[], margin: number): Point2[] {
  const centroid = polygonCentroid(points);
  return points.map((point) => {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return point;
    return {
      x: point.x + (dx / length) * margin,
      y: point.y + (dy / length) * margin,
    };
  });
}

export function createSectionPlane(
  width: number,
  height: number,
  position: { x: number; y: number; z: number }
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(position.x, position.y, position.z);
  plane.rotation.x = -Math.PI / 2;
  return plane;
}

export function createStage(width: number, depth: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, 0.3, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const stage = new THREE.Mesh(geometry, material);
  stage.position.y = 0.15;
  return stage;
}

export function createFloor(width: number, depth: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  return floor;
}
