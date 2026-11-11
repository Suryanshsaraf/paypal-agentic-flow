"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type AgentState = "idle" | "thinking" | "chasing" | "settled";

interface AgentOrb3DProps {
  state?: AgentState;
  size?: number;
  className?: string;
  interactive?: boolean;
}

export function AgentOrb3D({
  state = "idle",
  size = 180,
  className = "",
  interactive = true,
}: AgentOrb3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for mouse rotation
    const group = new THREE.Group();
    scene.add(group);

    // Color definitions based on state
    const stateColors: Record<AgentState, { core: number; ring1: number; ring2: number; light: number }> = {
      idle: {
        core: 0x6366f1,    // Indigo
        ring1: 0x38bdf8,   // Cyan
        ring2: 0x818cf8,   // Lavender
        light: 0x6366f1,
      },
      thinking: {
        core: 0x38bdf8,    // Electric cyan
        ring1: 0x818cf8,
        ring2: 0x06b6d4,
        light: 0x38bdf8,
      },
      chasing: {
        core: 0xf59e0b,    // Amber warning
        ring1: 0xf43f5e,   // Rose escalation
        ring2: 0xfbbf24,
        light: 0xf59e0b,
      },
      settled: {
        core: 0x10b981,    // Emerald success
        ring1: 0x34d399,
        ring2: 0x059669,
        light: 0x10b981,
      },
    };

    const colors = stateColors[state] || stateColors.idle;

    // 1. Core Sphere (Icosahedron wireframe)
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: colors.core,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
      emissive: colors.core,
      emissiveIntensity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 2. Inner points glow
    const pointGeo = new THREE.BufferGeometry();
    const pointCount = 60;
    const posArray = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 1.8;
    }
    pointGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const pointMat = new THREE.PointsMaterial({
      size: 0.05,
      color: colors.ring1,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const pointCloud = new THREE.Points(pointGeo, pointMat);
    group.add(pointCloud);

    // 3. Gyroscopic Ring 1
    const ring1Geo = new THREE.TorusGeometry(1.4, 0.015, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: colors.ring1,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 4;
    group.add(ring1);

    // 4. Gyroscopic Ring 2
    const ring2Geo = new THREE.TorusGeometry(1.65, 0.01, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: colors.ring2,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    group.add(ring2);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(colors.light, 2, 50);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = y * 0.4;
      targetY = x * 0.4;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Animation Loop
    let animId: number;
    const speedMult = state === "thinking" ? 2.5 : state === "chasing" ? 1.8 : 1.0;

    const animate = () => {
      coreMesh.rotation.x += 0.005 * speedMult;
      coreMesh.rotation.y += 0.008 * speedMult;

      pointCloud.rotation.y -= 0.003 * speedMult;

      ring1.rotation.x += 0.012 * speedMult;
      ring1.rotation.y += 0.006 * speedMult;

      ring2.rotation.y -= 0.009 * speedMult;
      ring2.rotation.z += 0.007 * speedMult;

      // Smooth damping toward mouse
      group.rotation.x += (targetX - group.rotation.x) * 0.05;
      group.rotation.y += (targetY - group.rotation.y) * 0.05;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [state, size, interactive]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
    />
  );
}
