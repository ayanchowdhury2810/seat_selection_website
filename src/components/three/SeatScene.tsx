"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useSeatSelection } from "@/state/seat-selection-store";
import { SeatInstanceManager, type SeatInstance } from "@/scene/seats/SeatInstanceManager";
import { TheatreGenerator } from "@/scene/procedural/TheatreGenerator";
import { normalizeSeatMap } from "@/data/seat-map-normalizer";
import { mapJsonToWorld, MAP_SCALE, MAP_Z_OFFSET } from "@/utils/coordinates";
import { SectionRenderer } from "@/scene/sections/SectionRenderer";
import { largeStadiumSeatMapData } from "@/data/large-stadium-seat-map";

const seatManager = new SeatInstanceManager();
const SEAT_ELEVATION = 0.35;

function buildVenueConfig(seatMap: ReturnType<typeof normalizeSeatMap>) {
  const web3d = (seatMap.web_3d ?? {}) as Record<string, unknown>;
  const venue = (web3d.venue ?? { type: "arena", model_type: "procedural" }) as {
    type: "theatre" | "arena";
    model_type: "procedural";
  };
  const coordinate_system = (web3d.coordinate_system ?? {
    type: "right_handed",
    units: "meters",
  }) as { type: string; units: string };
  const event_focus = (web3d.event_focus ?? {
    type: venue.type === "arena" ? "ring" : "stage",
    position: { x: 0, y: 1, z: 0 },
  }) as { type: string; position: { x: number; y: number; z: number } };
  const camera = (web3d.camera ?? { eye_height: 1.6, fov: 60 }) as {
    eye_height: number;
    fov: number;
  };
  const procedural = (web3d.procedural ?? {}) as Record<string, unknown>;
  if (!procedural.theatre && !procedural.arena) {
    procedural.theatre = {
      stage_width: 16,
      stage_depth: 6,
      row_spacing: 0.9,
      seat_spacing: 0.55,
      tier_height: 0.35,
    };
  }
  return {
    enabled: true,
    venue,
    coordinate_system,
    event_focus,
    camera,
    procedural: procedural as {
      theatre?: {
        stage_width: number;
        stage_depth: number;
        row_spacing: number;
        seat_spacing: number;
        tier_height: number;
      };
      arena?: {
        ring_width: number;
        ring_depth: number;
        bowl_tiers: number;
        row_spacing: number;
        seat_spacing: number;
        tier_height: number;
      };
    },
  };
}

export function SeatScene() {
  const groupRef = useRef<THREE.Group>(null);
  const sceneGroupRef = useRef<THREE.Group>(null);
  const seatContainerRef = useRef<THREE.Group>(null);
  const sectionGroupRef = useRef<THREE.Group>(null);
  const { toggleSeat, setHovered, materializedSectionIds, openSection } = useSeatSelection();
  const { camera, gl } = useThree();
  const canvas = gl.domElement;

  const seatMap = useMemo(() => normalizeSeatMap(largeStadiumSeatMapData), []);

  const ticketColors = useMemo(() => {
    const colors = new Map<number, string>();
    for (const ticket of seatMap.ticket_types) colors.set(ticket.id, ticket.ticket_color);
    return colors;
  }, [seatMap]);

  const sectionRenderer = useMemo(() => new SectionRenderer(), []);

  const sectionWorldGeometries = useMemo(
    () =>
      seatMap.sections.map((section) =>
        sectionRenderer.computeWorldGeometry(
          section,
          seatMap.canvas_width,
          seatMap.canvas_height,
          MAP_SCALE,
          MAP_Z_OFFSET
        )
      ),
    [seatMap, sectionRenderer]
  );

  // Venue geometry, built once from the seat map's own web_3d config.
  useEffect(() => {
    const venueGroup = new TheatreGenerator().generate(buildVenueConfig(seatMap), seatMap);
    if (sceneGroupRef.current) sceneGroupRef.current.add(venueGroup);
  }, [seatMap]);

  // Tables load immediately. Section seats only load once the section is tapped.
  useEffect(() => {
    if (!seatContainerRef.current) return;
    const instances: SeatInstance[] = [];

    for (const table of seatMap.tables) {
      const tablePos = mapJsonToWorld(
        table.x,
        table.y,
        seatMap.canvas_width,
        seatMap.canvas_height,
        MAP_SCALE,
        MAP_Z_OFFSET
      );
      const tableRadius = (table.radius ?? 20) * MAP_SCALE;
      const seatRadius = tableRadius + 0.45;
      const seatCount = table.seats.length;
      table.seats.forEach((seat, index) => {
        const angle = (index / seatCount) * Math.PI * 2;
        const position = new THREE.Vector3(
          tablePos.x + Math.cos(angle) * seatRadius,
          SEAT_ELEVATION,
          tablePos.z + Math.sin(angle) * seatRadius
        );
        instances.push({
          objectId: seat.object_id,
          position,
          color: ticketColors.get(table.ticket_type_id ?? -1) ?? "#19A024",
        });
      });
    }

    for (const section of seatMap.sections) {
      if (!materializedSectionIds.includes(section.id)) continue;
      for (const row of section.rows) {
        for (const seat of row.seats) {
          const world = mapJsonToWorld(
            seat.x,
            seat.y,
            seatMap.canvas_width,
            seatMap.canvas_height,
            MAP_SCALE,
            MAP_Z_OFFSET
          );
          instances.push({
            objectId: seat.object_id,
            position: new THREE.Vector3(world.x, SEAT_ELEVATION, world.z),
            color: ticketColors.get(seat.ticket_type_id ?? -1) ?? "#19A024",
            status: seat.status,
          });
        }
      }
    }

    const mesh = seatManager.build(instances);
    seatContainerRef.current.clear();
    seatContainerRef.current.add(mesh);
  }, [seatMap, ticketColors, materializedSectionIds]);

  useEffect(() => () => seatManager.dispose(), []);

  const getMouse = useCallback(
    (event: React.PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
    },
    [canvas]
  );

  const handleClick = useCallback(
    (event: React.PointerEvent) => {
      const mouse = getMouse(event);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const mesh = seatManager.getMesh();
      if (mesh) {
        const intersects = raycaster.intersectObject(mesh);
        if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
          const objectId = seatManager.getSeatById(intersects[0].instanceId);
          if (objectId !== undefined) {
            toggleSeat(objectId);
            return;
          }
        }
      }

      if (sectionGroupRef.current) {
        const sectionHits = raycaster.intersectObjects(sectionGroupRef.current.children, false);
        if (sectionHits.length > 0) {
          const sectionId = sectionHits[0].object.userData.sectionId as string;
          if (sectionId && !materializedSectionIds.includes(sectionId)) openSection(sectionId);
        }
      }
    },
    [getMouse, camera, toggleSeat, materializedSectionIds, openSection]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const mouse = getMouse(event);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const mesh = seatManager.getMesh();
      if (!mesh) {
        setHovered(null);
        return;
      }
      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const objectId = seatManager.getSeatById(intersects[0].instanceId);
        setHovered(objectId ?? null);
      } else {
        setHovered(null);
      }
    },
    [getMouse, setHovered, camera]
  );

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={() => setHovered(null)}
    >
      <group ref={sceneGroupRef} />
      <group ref={seatContainerRef} />
      <group ref={sectionGroupRef}>
        {seatMap.sections.map((section, index) => {
          const geometry = sectionWorldGeometries[index];
          const ticketTypeId = section.rows[0]?.seats[0]?.ticket_type_id ?? -1;
          const color = ticketColors.get(ticketTypeId) ?? "#19A024";
          const opened = materializedSectionIds.includes(section.id);
          return (
            <mesh
              key={section.id}
              position={[geometry.center.x, geometry.center.y, geometry.center.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              userData={{ sectionId: section.id }}
            >
              <planeGeometry args={[geometry.width, geometry.height]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opened ? 0.08 : 0.25}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
      {seatMap.tables.map((table) => {
        const tablePos = mapJsonToWorld(
          table.x,
          table.y,
          seatMap.canvas_width,
          seatMap.canvas_height,
          MAP_SCALE,
          MAP_Z_OFFSET
        );
        return (
          <mesh key={table.object_id} position={[tablePos.x, 0.25, tablePos.z]}>
            <cylinderGeometry
              args={[
                (table.radius ?? 20) * MAP_SCALE,
                (table.radius ?? 20) * MAP_SCALE,
                0.5,
                24,
              ]}
            />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })}
      {seatMap.sections.map((section, index) => {
        const geometry = sectionWorldGeometries[index];
        return (
          <Text
            key={section.id}
            position={[geometry.center.x, 0.15, geometry.center.z]}
            fontSize={1.1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {section.label}
          </Text>
        );
      })}
    </group>
  );
}