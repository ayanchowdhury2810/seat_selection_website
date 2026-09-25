"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SeatScene } from "./SeatScene";
import { largeStadiumSeatMapData } from "@/data/large-stadium-seat-map";
import { normalizeSeatMap } from "@/data/seat-map-normalizer";
import { computeSeatMapWorldBounds } from "@/utils/coordinates";

export function SceneCanvas() {
  const view = useMemo(() => {
    const seatMap = normalizeSeatMap(largeStadiumSeatMapData);
    const bounds = computeSeatMapWorldBounds(seatMap);
    const span = Math.max(bounds.width, bounds.depth, 10);
    return {
      target: [bounds.centerX, 0, bounds.centerZ] as [number, number, number],
      position: [bounds.centerX, span * 0.85, bounds.centerZ + span * 0.85] as [
        number,
        number,
        number,
      ],
      maxDistance: span * 3,
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
      <Canvas camera={{ fov: 60, position: view.position }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SeatScene />
        <OrbitControls
          target={view.target}
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={view.maxDistance}
        />
      </Canvas>
    </div>
  );
}
