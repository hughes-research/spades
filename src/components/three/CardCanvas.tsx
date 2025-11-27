"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Card3D } from "./Card3D";
import { Suit, Rank } from "./TextureGenerator";

interface CardCanvasProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  width: number;
  height: number;
}

// Scene lighting setup
function Lighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.6} />
      
      {/* Main directional light from top-right */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      
      {/* Fill light from left */}
      <directionalLight
        position={[-2, 3, 2]}
        intensity={0.3}
        color="#e8f0ff"
      />
      
      {/* Rim light from behind */}
      <directionalLight
        position={[0, 2, -3]}
        intensity={0.2}
        color="#fffaf0"
      />
    </>
  );
}

// Loading fallback
function CardPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[2.5, 3.5, 0.03]} />
      <meshBasicMaterial color="#cccccc" />
    </mesh>
  );
}

export function CardCanvas({
  suit,
  rank,
  faceDown = false,
  isHovered = false,
  onClick,
  width,
  height,
}: CardCanvasProps) {
  // Calculate camera position based on card size
  // Using orthographic-like perspective for minimal distortion
  const cameraConfig = useMemo(() => {
    const aspect = width / height;
    const fov = 35;
    // Position camera to frame the card nicely
    const distance = 6;
    return {
      fov,
      position: [0, 0, distance] as [number, number, number],
      near: 0.1,
      far: 20,
    };
  }, [width, height]);

  return (
    <div style={{ width, height, position: "relative" }}>
      <Canvas
        camera={cameraConfig}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ 
          background: "transparent",
          borderRadius: "8px",
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
        frameloop="demand" // Only render when needed
      >
        <Suspense fallback={<CardPlaceholder />}>
          <Lighting />
          <Card3D
            suit={suit}
            rank={rank}
            faceDown={faceDown}
            isHovered={isHovered}
            onClick={onClick}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CardCanvas;


