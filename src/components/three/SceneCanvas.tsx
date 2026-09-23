"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SeatScene } from "./SeatScene";

export function SceneCanvas() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
      <Canvas camera={{ fov: 65, position: [0, 12, 22] }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SeatScene />
        <OrbitControls
          target={[0, 0, 8]}
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={100}
        />
      </Canvas>
    </div>
  );
}
