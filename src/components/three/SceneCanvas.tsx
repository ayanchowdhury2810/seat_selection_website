"use client";

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SeatScene } from "./SeatScene";
import { getVenueLayout, type VenueLayout } from "@/scene/venue-layout";
import type { RawSeatMap } from "@/data/seat-map-schema";
import { useSeatSelection } from "@/state/seat-selection-store";
import { isSelectable } from "@/domain/seat/seat-status";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Shows a readable message in the viewport when the 3D tree crashes. */
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown 3D error" };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-950 p-6 text-center">
          <p className="text-sm text-red-300">3D scene failed: {this.state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Surfaces GPU context loss in-page instead of a silent blank canvas. */
function GlContextWatcher({
  onLost,
  onRestored,
}: {
  onLost: () => void;
  onRestored: () => void;
}) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [gl, onLost, onRestored]);

  return null;
}

/** OrbitControls instance driven by the camera rig. */
export type CameraControlsHandle = ComponentRef<typeof OrbitControls>;

function CameraFocusRig({
  controlsRef,
  layout,
}: {
  controlsRef: React.RefObject<CameraControlsHandle | null>;
  layout: VenueLayout;
}) {
  const { camera } = useThree();
  const { activeSectionId, povSeat } = useSeatSelection();
  const prevPovId = useRef<string | null>(null);
  const anim = useRef<{
    t: number;
    dur: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTgt: THREE.Vector3;
    toTgt: THREE.Vector3;
  } | null>(null);

  const flyTo = (toPos: THREE.Vector3, toTgt: THREE.Vector3, dur: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    anim.current = {
      t: 0,
      dur,
      fromPos: camera.position.clone(),
      toPos,
      fromTgt: controls.target.clone(),
      toTgt,
    };
  };

  const sectionTopView = (sectionId: string) => {
    const section = layout.sectionsById.get(sectionId);
    if (!section) return;
    flyTo(
      new THREE.Vector3(
        section.center.x,
        section.elevation + Math.max(section.radius * 2.4, 8),
        section.center.z + 0.01
      ),
      new THREE.Vector3(section.center.x, section.elevation, section.center.z),
      0.9
    );
  };

  // Cancel fly-to as soon as user grabs camera.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cancel = () => {
      anim.current = null;
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controlsRef]);

  // POV takes priority: sit at seat eye height, look at ring center.
  useEffect(() => {
    if (!povSeat) return;
    prevPovId.current = povSeat.objectId;
    flyTo(
      new THREE.Vector3(povSeat.worldX, povSeat.worldY + 1.0, povSeat.worldZ),
      new THREE.Vector3(0, 1.0, 0),
      1.0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [povSeat, camera, controlsRef]);

  // Fly to top-down view over selected section. Skipped during POV.
  // On POV exit, fly back to open section top view.
  useEffect(() => {
    if (povSeat) return;
    if (!activeSectionId) {
      prevPovId.current = null;
      return;
    }
    if (prevPovId.current) {
      prevPovId.current = null;
      sectionTopView(activeSectionId);
      return;
    }
    sectionTopView(activeSectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId, povSeat, layout, camera, controlsRef]);

  useFrame((_, delta) => {
    const a = anim.current;
    const controls = controlsRef.current;
    if (!a || !controls) return;
    a.t += delta / a.dur;
    const k = easeInOutCubic(Math.min(a.t, 1));
    camera.position.lerpVectors(a.fromPos, a.toPos, k);
    controls.target.lerpVectors(a.fromTgt, a.toTgt, k);
    controls.update();
    if (a.t >= 1) anim.current = null;
  });

  return null;
}

function SeatModalOverlay() {
  const {
    pendingSeat,
    selectSeat,
    deselectSeat,
    isSelected,
    closeSeatModal,
    viewSeatPov,
  } = useSeatSelection();

  useEffect(() => {
    if (!pendingSeat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSeatModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingSeat, closeSeatModal]);

  if (!pendingSeat) return null;
  const selected = isSelected(pendingSeat.objectId);
  const selectable = selected || isSelectable(pendingSeat.status as never);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        className="pointer-events-auto absolute w-52 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 shadow-xl"
        style={{
          left: Math.min(Math.max(pendingSeat.screenX, 112), 2000),
          top: Math.max(pendingSeat.screenY - 14, 150),
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="truncate text-xs font-semibold text-zinc-100">
            {pendingSeat.objectId}
          </p>
          <button
            onClick={closeSeatModal}
            aria-label="Close"
            className="rounded px-1 text-sm leading-none text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button
            disabled={!selectable}
            onClick={() => {
              if (selected) deselectSeat(pendingSeat.objectId);
              else selectSeat(pendingSeat.objectId);
              closeSeatModal();
            }}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selected ? "Deselect seat" : "Select seat"}
          </button>
          <button
            onClick={viewSeatPov}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
          >
            View from seat
          </button>
        </div>
        {!selectable && (
          <p className="mt-2 text-[11px] text-zinc-400">Seat not available.</p>
        )}
      </div>
    </div>
  );
}

function PovBanner() {
  const { povSeat, exitPov } = useSeatSelection();
  if (!povSeat) return null;
  return (
    <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900/95 py-1.5 pl-4 pr-1.5 shadow-xl">
        <p className="text-xs text-zinc-200">
          Viewing from <span className="font-semibold">{povSeat.objectId}</span>
        </p>
        <button
          onClick={exitPov}
          className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-600"
        >
          Exit view
        </button>
      </div>
    </div>
  );
}

export function SceneCanvas({ raw }: { raw: RawSeatMap }) {
  const controlsRef = useRef<CameraControlsHandle | null>(null);
  const layout = useMemo(() => getVenueLayout(raw), [raw]);
  const [glLost, setGlLost] = useState(false);
  const handleGlLost = useCallback(() => setGlLost(true), []);
  const handleGlRestored = useCallback(() => setGlLost(false), []);
  const view = useMemo(() => {
    const { bounds } = layout;
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
      minDistance: 1.5,
      fov,
    };
  }, [layout]);

  return (
    <div className="relative" style={{ width: "100%", height: "100%", background: "#0a0a0a" }}>
      <CanvasErrorBoundary>
        <Canvas camera={{ fov: view.fov, position: view.position, near: 0.1, far: 4000 }}>
          <ambientLight intensity={1.1} />
          <hemisphereLight args={["#cbd5e1", "#0f172a", 0.8]} />
          <directionalLight position={[40, 80, 40]} intensity={1.4} />
          <Suspense fallback={null}>
            <SeatScene raw={raw} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={view.target}
            enableDamping
            dampingFactor={0.08}
            enablePan
            enableZoom
            enableRotate
            screenSpacePanning
            zoomToCursor
            minDistance={view.minDistance}
            maxDistance={view.maxDistance}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2 - 0.02}
          />
          <CameraFocusRig controlsRef={controlsRef} layout={layout} />
          <GlContextWatcher onLost={handleGlLost} onRestored={handleGlRestored} />
        </Canvas>
      </CanvasErrorBoundary>
      {glLost && (
        <div className="absolute inset-x-0 top-3 z-10 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-amber-700 bg-zinc-900/95 py-1.5 pl-4 pr-1.5 shadow-xl">
            <p className="text-xs text-amber-200">3D context lost — canvas paused.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-500"
            >
              Reload
            </button>
          </div>
        </div>
      )}
      <SeatModalOverlay />
      <PovBanner />
    </div>
  );
}
