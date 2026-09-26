"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useSeatSelection } from "@/state/seat-selection-store";
import { SeatInstanceManager, type SeatInstance } from "@/scene/seats/SeatInstanceManager";
import type { SeatAppearance } from "@/scene/seats/SeatMaterials";
import { TheatreGenerator } from "@/scene/procedural/TheatreGenerator";
import { SectionRenderer, type SectionAppearance } from "@/scene/sections/SectionRenderer";
import { getVenueLayout, type SectionLayout } from "@/scene/venue-layout";
import { largeStadiumSeatMapData } from "@/data/large-stadium-seat-map";
import { projectSeatToWorld } from "@/utils/coordinates";
import type { Venue3DConfig } from "@/domain/venue/venue-types";

const seatManager = new SeatInstanceManager();

/** Pointer travel, in pixels, above which a click counts as a camera drag. */
const DRAG_TOLERANCE_PX = 5;

function buildVenueConfig(raw: Record<string, unknown>): Venue3DConfig {
  const venue = (raw.venue ?? { type: "arena", model_type: "procedural" }) as Venue3DConfig["venue"];
  return {
    enabled: true,
    venue,
    coordinate_system: (raw.coordinate_system ?? {
      type: "right_handed",
      units: "meters",
    }) as Venue3DConfig["coordinate_system"],
    event_focus: (raw.event_focus ?? {
      type: "ring",
      position: { x: 0, y: 1, z: 0 },
    }) as Venue3DConfig["event_focus"],
    camera: (raw.camera ?? { eye_height: 1.6, fov: 60 }) as Venue3DConfig["camera"],
    procedural: (raw.procedural ?? {
      arena: { ring_width: 6.1, ring_depth: 6.1, bowl_tiers: 1, row_spacing: 0.9, seat_spacing: 0.55, tier_height: 0.4 },
    }) as Venue3DConfig["procedural"],
  };
}

export function SeatScene() {
  const venueGroupRef = useRef<THREE.Group>(null);
  const seatContainerRef = useRef<THREE.Group>(null);
  const deckGroupRef = useRef<THREE.Group>(null);
  const outlineGroupRef = useRef<THREE.Group>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const { toggleSeat, setHovered, hoveredId, selectedIds, activeSectionId, openSection } =
    useSeatSelection();
  const { camera, gl } = useThree();

  const layout = useMemo(() => getVenueLayout(largeStadiumSeatMapData), []);
  const sectionRenderer = useMemo(() => new SectionRenderer(), []);

  const activeLayout = activeSectionId ? layout.sectionsById.get(activeSectionId) : undefined;
  const activeTierIndex = activeLayout?.tierIndex;

  const sectionAppearance = useCallback(
    (section: SectionLayout): SectionAppearance => {
      if (section.id === activeSectionId) return "active";
      if (activeTierIndex === undefined) return "idle";
      return section.tierIndex === activeTierIndex ? "idle" : "dimmed";
    },
    [activeSectionId, activeTierIndex]
  );

  // Venue shell: floor, ring or stage, and the outer wall. Built once per seat map.
  useEffect(() => {
    const config = buildVenueConfig(
      (layout.seatMap.web_3d ?? {}) as Record<string, unknown>
    );
    const venueGroup = new TheatreGenerator().generate(config, layout.seatMap, layout.projection);
    if (venueGroupRef.current) venueGroupRef.current.add(venueGroup);
  }, [layout]);

  // Every section is visible from the start as a solid deck. Only geometry changes.
  const decks = useMemo(
    () =>
      layout.sections.map((section) => ({
        id: section.id,
        appearance: sectionAppearance(section),
        mesh: sectionRenderer.createDeckMesh(section, layout.deckHeight, sectionAppearance(section)),
        outline: sectionRenderer.createOutline(section, layout.deckHeight, sectionAppearance(section)),
      })),
    [layout, sectionRenderer, sectionAppearance]
  );

  useEffect(
    () => () => {
      for (const deck of decks) {
        deck.mesh.geometry.dispose();
        (deck.mesh.material as THREE.Material).dispose();
        deck.outline.geometry.dispose();
        (deck.outline.material as THREE.Material).dispose();
      }
    },
    [decks]
  );

  // Only the tapped section gets individual seats. Tables always load.
  useEffect(() => {
    const container = seatContainerRef.current;
    if (!container) return;

    const seatY = activeLayout
      ? activeLayout.elevation + layout.deckHeight + layout.seatBoxSize / 2 + 0.02
      : layout.deckHeight + layout.seatBoxSize / 2 + 0.02;
    const instances: SeatInstance[] = [];

    for (const table of layout.seatMap.tables) {
      const world = projectSeatToWorld(table.x, table.y, layout.projection);
      const tableRadius = (table.radius ?? 20) * layout.projection.scale;
      const seatRadius = tableRadius + layout.seatSpacing * 0.8;
      const count = table.seats.length;
      table.seats.forEach((seat, index) => {
        const angle = (index / count) * Math.PI * 2;
        instances.push({
          objectId: seat.object_id,
          position: new THREE.Vector3(
            world.x + Math.cos(angle) * seatRadius,
            layout.deckHeight + layout.seatBoxSize / 2,
            world.z + Math.sin(angle) * seatRadius
          ),
          color: "#cbd5e1",
        });
      });
    }

    if (activeLayout) {
      for (const seat of activeLayout.seats) {
        instances.push({
          objectId: seat.objectId,
          position: new THREE.Vector3(seat.x, seatY, seat.z),
          color: seat.color,
          status: seat.status,
        });
      }
    }

    const mesh = seatManager.build(instances, { size: layout.seatBoxSize });
    container.clear();
    container.add(mesh);
  }, [layout, activeLayout]);

  // Paint selection and hover on top of the freshly built mesh.
  useEffect(() => {
    if (!activeLayout) return;
    const selected = new Set(selectedIds);
    for (const seat of activeLayout.seats) {
      const appearance: SeatAppearance = selected.has(seat.objectId)
        ? "selected"
        : hoveredId === seat.objectId
          ? "hovered"
          : "normal";
      seatManager.setSeatAppearance(seat.objectId, appearance);
    }
  }, [activeLayout, selectedIds, hoveredId]);

  useEffect(() => () => seatManager.dispose(), []);

  const getPointerNdc = useCallback(
    (event: React.PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      return new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
    },
    [gl]
  );

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    pointerDownRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleClick = useCallback(
    (event: React.PointerEvent) => {
      // Orbiting ends with a pointerup on the same spot; ignore anything that moved.
      const down = pointerDownRef.current;
      pointerDownRef.current = null;
      if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > DRAG_TOLERANCE_PX) {
        return;
      }

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(getPointerNdc(event), camera);

      const mesh = seatManager.getMesh();
      if (mesh) {
        const seatHits = raycaster.intersectObject(mesh, false);
        const objectId =
          seatHits[0]?.instanceId !== undefined
            ? seatManager.getSeatById(seatHits[0].instanceId)
            : undefined;
        if (objectId) {
          toggleSeat(objectId);
          return;
        }
      }

      if (deckGroupRef.current) {
        const deckHits = raycaster.intersectObjects(deckGroupRef.current.children, false);
        const sectionId = deckHits[0]?.object.userData.sectionId as string | undefined;
        if (sectionId) openSection(sectionId);
      }
    },
    [camera, getPointerNdc, toggleSeat, openSection]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!seatManager.getMesh()) {
        setHovered(null);
        return;
      }
      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(getPointerNdc(event), camera);
      const hits = raycaster.intersectObject(seatManager.getMesh()!, false);
      const objectId =
        hits[0]?.instanceId !== undefined
          ? seatManager.getSeatById(hits[0].instanceId)
          : undefined;
      setHovered(objectId ?? null);
    },
    [camera, getPointerNdc, setHovered]
  );

  return (
    <group
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={() => setHovered(null)}
    >
      <group ref={venueGroupRef} />
      <group ref={deckGroupRef}>
        {decks.map((deck) => (
          <primitive key={deck.id} object={deck.mesh} />
        ))}
      </group>
      <group ref={outlineGroupRef}>
        {decks.map((deck) => (
          <primitive key={deck.id} object={deck.outline} />
        ))}
      </group>
      <group ref={seatContainerRef} />
      {layout.sections.map((section) => (
        <Text
          key={section.id}
          position={[
            section.center.x,
            section.elevation + layout.deckHeight + 0.35,
            section.center.z,
          ]}
          fontSize={sectionRenderer.getLabelFontSize(section)}
          color={section.id === activeSectionId ? "#ffffff" : "#e5e7eb"}
          anchorX="center"
          anchorY="middle"
          renderOrder={10}
          material-depthTest={false}
          outlineWidth={0.04}
          outlineColor="#111827"
        >
          {section.label}
        </Text>
      ))}
    </group>
  );
}
