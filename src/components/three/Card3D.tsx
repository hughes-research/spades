"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  Suit,
  Rank,
  getCardFaceTexture,
  getCardBackTexture,
  getNormalMapTexture,
} from "./TextureGenerator";

// Card dimensions (Three.js units)
const CARD_WIDTH = 2.5;
const CARD_HEIGHT = 3.5;
const CARD_DEPTH = 0.03;
const CORNER_RADIUS = 0.12;

interface Card3DProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export function Card3D({
  suit,
  rank,
  faceDown = false,
  isHovered = false,
  onClick,
}: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [localHover, setLocalHover] = useState(false);
  
  // Create materials using useMemo to avoid state updates in effects
  const { materials, texturesLoaded } = useMemo(() => {
    const faceTexture = getCardFaceTexture(suit, rank);
    const backTexture = getCardBackTexture();
    const normalMap = getNormalMapTexture();
    
    if (!faceTexture || !backTexture) {
      return { materials: [], texturesLoaded: false };
    }

    // Material for card edges (white paper)
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: "#f5f5f5",
      roughness: 0.8,
      metalness: 0,
    });

    // Front face material
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: faceDown ? backTexture : faceTexture,
      normalMap: normalMap || undefined,
      normalScale: normalMap ? new THREE.Vector2(0.1, 0.1) : undefined,
      roughness: 0.35,
      metalness: 0,
    });

    // Back face material
    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      normalMap: normalMap || undefined,
      normalScale: normalMap ? new THREE.Vector2(0.1, 0.1) : undefined,
      roughness: 0.35,
      metalness: 0,
    });

    // RoundedBox face order: right, left, top, bottom, front, back
    return {
      materials: [
        edgeMaterial, // right edge
        edgeMaterial, // left edge  
        edgeMaterial, // top edge
        edgeMaterial, // bottom edge
        frontMaterial, // front face (+Z)
        backMaterial,  // back face (-Z)
      ],
      texturesLoaded: true,
    };
  }, [suit, rank, faceDown]);
  
  // Cleanup materials on unmount
  useEffect(() => {
    return () => {
      materials.forEach(material => material.dispose());
    };
  }, [materials]);
  
  // Animate hover lift
  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetY = (isHovered || localHover) ? 0.15 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        delta * 12
      );
    }
  });

  if (!texturesLoaded || materials.length === 0) {
    // Placeholder while loading
    return (
      <RoundedBox
        args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]}
        radius={CORNER_RADIUS}
        smoothness={4}
      >
        <meshBasicMaterial color="#cccccc" />
      </RoundedBox>
    );
  }

  return (
    <RoundedBox
      ref={meshRef}
      args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]}
      radius={CORNER_RADIUS}
      smoothness={4}
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setLocalHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      material={materials}
      castShadow
      receiveShadow
    />
  );
}

export default Card3D;
