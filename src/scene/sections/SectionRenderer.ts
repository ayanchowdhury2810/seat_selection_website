import * as THREE from "three";
import type { SectionLayout } from "@/scene/venue-layout";

export type SectionAppearance = "idle" | "active" | "dimmed";

/** Unlit color used for the deck fill, so tier colors stay readable under the lights. */
const IDLE_FILL_FACTOR = 0.42;
const ACTIVE_FILL_FACTOR = 0.85;
const DIMMED_FILL_FACTOR = 0.2;

function mix(color: THREE.Color, factor: number): THREE.Color {
  return color.clone().multiplyScalar(factor);
}

/**
 * Turns a section's outline into drawable meshes:
 * - a solid slab, which is the clickable surface;
 * - a line loop on top, which keeps neighbouring sections readable.
 */
export class SectionRenderer {
  createDeckMesh(
    layout: SectionLayout,
    deckHeight: number,
    appearance: SectionAppearance
  ): THREE.Mesh {
    const shape = new THREE.Shape();
    // Shape space is (x, -z): the -90 deg X rotation below maps it back to world (x, z).
    const [first, ...rest] = layout.outline;
    shape.moveTo(first.x, -first.z);
    for (const point of rest) shape.lineTo(point.x, -point.z);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: deckHeight,
      bevelEnabled: false,
      curveSegments: 1,
    });
    geometry.rotateX(-Math.PI / 2);

    const base = new THREE.Color(layout.color);
    const factor =
      appearance === "active"
        ? ACTIVE_FILL_FACTOR
        : appearance === "dimmed"
          ? DIMMED_FILL_FACTOR
          : IDLE_FILL_FACTOR;

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: mix(base, factor),
        roughness: 0.85,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    mesh.position.y = layout.elevation;
    mesh.userData.sectionId = layout.id;
    mesh.name = `deck-${layout.id}`;
    return mesh;
  }

  createOutline(
    layout: SectionLayout,
    deckHeight: number,
    appearance: SectionAppearance
  ): THREE.LineLoop {
    const points = layout.outline.map(
      (point) => new THREE.Vector3(point.x, layout.elevation + deckHeight + 0.01, point.z)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: appearance === "active" ? "#ffffff" : new THREE.Color(layout.color).multiplyScalar(1.4),
      transparent: true,
      opacity: appearance === "dimmed" ? 0.35 : 1,
    });
    return new THREE.LineLoop(geometry, material);
  }

  /** Font size that keeps a section label readable at any section size. */
  getLabelFontSize(layout: SectionLayout): number {
    return Math.min(2.4, Math.max(0.7, layout.radius * 0.32));
  }
}
