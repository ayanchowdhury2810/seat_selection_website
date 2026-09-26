"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SeatScene } from "./SeatScene";
import { getVenueLayout } from "@/scene/venue-layout";
import { largeStadiumSeatMapData } from "@/data/large-stadium-seat-map";

export function SceneCanvas() {
  const view = useMemo(() => {
    const { bounds } = getVenueLayout(largeStadiumSeatMapData);
    const fov = 60;
    const span = Math.max(bounds.width, bounds.depth, 20);
    // Pull the camera back far enough to frame the whole bowl at the given field of view.
    const distance = span / (2 * Math.tan((fov * Math.PI) / 360));
    return {
      target: [bounds.centerX, 0, bounds.centerZ] as [number, number, number],
      position: [
        bounds.centerX + span * 0.15,
        distance * 0.55,
        bounds.centerZ + distance * 0.8,
      ] as [number, number, number],
      maxDistance: distance * 2.4,
      minDistance: 2,
      fov,
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
      <Canvas camera={{ fov: view.fov, position: view.position, near: 0.1, far: 4000 }}>
        <ambientLight intensity={1.1} />
        <hemisphereLight args={["#cbd5e1", "#0f172a", 0.8]} />
        <directionalLight position={[40, 80, 40]} intensity={1.4} />
        <SeatScene />
        <OrbitControls
          target={view.target}
          enableDamping
          dampingFactor={0.08}
          minDistance={view.minDistance}
          maxDistance={view.maxDistance}
        />
      </Canvas>
    </div>
  );
}
