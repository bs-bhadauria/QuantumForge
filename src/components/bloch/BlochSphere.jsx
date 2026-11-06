import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useQuantum } from '../../context/QuantumContext';
import { RotateCcw, Play, Pause, Compass } from 'lucide-react';

// Helper to create sharp 2D text billboard sprites in Three.js
function createTextSprite(text, color = '#38bdf8', fontSize = 38) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px "JetBrains Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.48, 0.24, 1);
  return sprite;
}

export default function BlochSphere() {
  const containerRef = useRef(null);
  const { simulationResult, theme } = useQuantum();

  const [autoRotate, setAutoRotate] = useState(true);

  const blochData = simulationResult?.bloch || {
    theta: 0.785,
    phi: 0.523,
    thetaDeg: 45.0,
    phiDeg: 30.0,
    x: 0.612,
    y: 0.354,
    z: 0.707,
    stateString: '|ψ⟩ = 0.924|0⟩ + 0.383|1⟩',
  };

  const sceneRef = useRef(null);
  const blochGroupRef = useRef(null);
  const stateVectorGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const autoRotateRef = useRef(true);

  // Keep autoRotateRef in sync
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Reset orientation
  const handleResetOrientation = useCallback(() => {
    if (blochGroupRef.current) {
      blochGroupRef.current.rotation.set(0.2, 0.4, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(2.2, 1.4, 2.2);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  // Main 3D Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous child canvas elements
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (container.clientWidth || 320);
    const height = rect.height > 0 ? rect.height : (container.clientHeight || 260);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.2, 1.4, 2.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Root rotating group holding all sphere contents
    const blochGroup = new THREE.Group();
    blochGroup.rotation.set(0.2, 0.4, 0);
    blochGroupRef.current = blochGroup;
    scene.add(blochGroup);

    // Dynamic State Vector group
    const stateVectorGroup = new THREE.Group();
    stateVectorGroupRef.current = stateVectorGroup;
    blochGroup.add(stateVectorGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight1.position.set(6, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.8);
    dirLight2.position.set(-5, -6, -4);
    scene.add(dirLight2);

    // 1. Translucent sphere hull
    const sphereGeo = new THREE.SphereGeometry(1.0, 36, 28);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.12,
      shininess: 80,
      depthWrite: false,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    blochGroup.add(sphereMesh);

    // 2. Subtle wireframe latitude/longitude sphere
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const wireMesh = new THREE.Mesh(new THREE.SphereGeometry(1.001, 18, 12), wireMat);
    blochGroup.add(wireMesh);

    // 3. Great Rings (Equator & Meridians)
    const createRing = (radius, color, rotX, rotY, rotZ, opacity = 0.5) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(72);
      const geo = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, p.y, 0))
      );
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        linewidth: 1.5,
      });
      const ring = new THREE.Line(geo, mat);
      ring.rotation.set(rotX, rotY, rotZ);
      return ring;
    };

    // XY Equator plane (y = 0 in standard Three.js where Y is up)
    blochGroup.add(createRing(1.0, 0x06b6d4, Math.PI / 2, 0, 0, 0.7)); // Equator
    blochGroup.add(createRing(1.0, 0x64748b, 0, 0, 0, 0.35)); // X-Y meridian
    blochGroup.add(createRing(1.0, 0x64748b, 0, Math.PI / 2, 0, 0.35)); // Y-Z meridian

    // 4. Coordinate Axes Lines
    const addDashedAxis = (from, to, color) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      const mat = new THREE.LineDashedMaterial({
        color,
        dashSize: 0.08,
        gapSize: 0.05,
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      blochGroup.add(line);
    };

    // Y Axis is the Z-axis of Bloch (|0⟩ North at +Y, |1⟩ South at -Y)
    addDashedAxis(new THREE.Vector3(0, -1.35, 0), new THREE.Vector3(0, 1.35, 0), 0x00f0ff);
    // X Axis (|+⟩ at +X, |-⟩ at -X)
    addDashedAxis(new THREE.Vector3(-1.35, 0, 0), new THREE.Vector3(1.35, 0, 0), 0x10b981);
    // Z Axis of Three.js is the Y-axis of Bloch (|+i⟩ at +Z, |-i⟩ at -Z)
    addDashedAxis(new THREE.Vector3(0, 0, -1.35), new THREE.Vector3(0, 0, 1.35), 0xf59e0b);

    // 5. Pole Spheres
    const poleGeo = new THREE.SphereGeometry(0.045, 16, 16);

    // North |0⟩
    const pole0 = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    pole0.position.set(0, 1.0, 0);
    blochGroup.add(pole0);

    // South |1⟩
    const pole1 = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
    pole1.position.set(0, -1.0, 0);
    blochGroup.add(pole1);

    // +X |+⟩
    const polePlus = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    polePlus.position.set(1.0, 0, 0);
    blochGroup.add(polePlus);

    // -X |-⟩
    const poleMinus = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0x64748b }));
    poleMinus.position.set(-1.0, 0, 0);
    blochGroup.add(poleMinus);

    // 6. 3D Text Sprites for Basis States
    const sprite0 = createTextSprite('|0⟩', '#00f0ff', 44);
    sprite0.position.set(0, 1.22, 0);
    blochGroup.add(sprite0);

    const sprite1 = createTextSprite('|1⟩', '#c084fc', 44);
    sprite1.position.set(0, -1.22, 0);
    blochGroup.add(sprite1);

    const spritePlus = createTextSprite('|+⟩', '#34d399', 38);
    spritePlus.position.set(1.22, 0, 0);
    blochGroup.add(spritePlus);

    const spriteMinus = createTextSprite('|-⟩', '#94a3b8', 36);
    spriteMinus.position.set(-1.22, 0, 0);
    blochGroup.add(spriteMinus);

    const spritePlusI = createTextSprite('|+i⟩', '#fbbf24', 38);
    spritePlusI.position.set(0, 0, 1.22);
    blochGroup.add(spritePlusI);

    const spriteMinusI = createTextSprite('|-i⟩', '#94a3b8', 36);
    spriteMinusI.position.set(0, 0, -1.22);
    blochGroup.add(spriteMinusI);

    // Pointer-based interactive orbit / dragging
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDragging || !blochGroupRef.current) return;
      const deltaX = e.clientX - prevPointer.x;
      const deltaY = e.clientY - prevPointer.y;

      blochGroupRef.current.rotation.y += deltaX * 0.008;
      blochGroupRef.current.rotation.x += deltaY * 0.008;

      // Restrict pitch so it doesn't flip uncomfortably
      blochGroupRef.current.rotation.x = Math.max(
        -Math.PI * 0.45,
        Math.min(Math.PI * 0.45, blochGroupRef.current.rotation.x)
      );

      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      isDragging = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    };

    // Zoom via wheel
    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomSpeed = 0.002;
      const dist = camera.position.length();
      const newDist = Math.max(1.8, Math.min(4.5, dist + e.deltaY * zoomSpeed));
      camera.position.setLength(newDist);
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Robust ResizeObserver to detect tab switches and panel flex
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          renderer.render(scene, camera);
        }
      }
    });
    resizeObserver.observe(container);

    // Continuous Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging && autoRotateRef.current && blochGroupRef.current) {
        blochGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Update State Vector Arrow whenever angles change
  useEffect(() => {
    const group = stateVectorGroupRef.current;
    if (!group) return;

    // Remove old arrow / projection objects
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    const theta = blochData.theta ?? 0.785;
    const phi = blochData.phi ?? 0.523;

    // In our 3D space with Y as vertical axis:
    // Y = cos(theta) -> North (+Y) is |0⟩, South (-Y) is |1⟩
    // X = sin(theta) * cos(phi) -> +X is |+⟩
    // Z = sin(theta) * sin(phi) -> +Z is |+i⟩
    const targetX = Math.sin(theta) * Math.cos(phi);
    const targetY = Math.cos(theta);
    const targetZ = Math.sin(theta) * Math.sin(phi);
    const stateVec = new THREE.Vector3(targetX, targetY, targetZ).normalize();

    // 1. Golden Glowing State Vector Arrow
    const arrow = new THREE.ArrowHelper(
      stateVec,
      new THREE.Vector3(0, 0, 0),
      1.0,
      0xf59e0b,
      0.18,
      0.09
    );
    // Make the arrow line slightly bolder
    if (arrow.line && arrow.line.material) {
      arrow.line.material.linewidth = 2.5;
    }
    group.add(arrow);

    // 2. Pulsing golden tip sphere
    const tipGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.copy(stateVec);
    group.add(tipMesh);

    // 3. Dashed projection line down to equator plane (y = 0)
    const equatorProjection = new THREE.Vector3(targetX, 0, targetZ);
    const dropGeo = new THREE.BufferGeometry().setFromPoints([stateVec, equatorProjection]);
    const dropMat = new THREE.LineDashedMaterial({
      color: 0xfbbf24,
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.65,
    });
    const dropLine = new THREE.Line(dropGeo, dropMat);
    dropLine.computeLineDistances();
    group.add(dropLine);

    // 4. Line from origin to projection point on equator
    const radialGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      equatorProjection,
    ]);
    const radialMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.5,
    });
    const radialLine = new THREE.Line(radialGeo, radialMat);
    radialLine.computeLineDistances();
    group.add(radialLine);

    // 5. Small marker at projection point
    const projDotGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const projDotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const projDot = new THREE.Mesh(projDotGeo, projDotMat);
    projDot.position.copy(equatorProjection);
    group.add(projDot);

    // 6. Statevector label sprite
    const stateSprite = createTextSprite('|ψ⟩', '#f59e0b', 46);
    stateSprite.position.copy(stateVec.clone().multiplyScalar(1.2));
    group.add(stateSprite);
  }, [blochData.theta, blochData.phi]);

  return (
    <div className="flex flex-col gap-3">
      {/* 3D Scene Viewport */}
      <div className="relative w-full h-[270px] min-h-[270px] bg-slate-950 dark:bg-[#070A0F] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center">
        {/* Three.js Container */}
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
          title="Drag to rotate Bloch sphere · Scroll to zoom"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 border border-slate-700/60 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Interactive Orbit / Drag</span>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-2 right-2.5 flex items-center gap-1">
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`p-1.5 rounded text-[10px] backdrop-blur border transition-all ${
              autoRotate
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
            title={autoRotate ? 'Pause Auto-Spin' : 'Resume Auto-Spin'}
          >
            {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={handleResetOrientation}
            className="p-1.5 rounded text-[10px] bg-slate-900/80 text-slate-400 hover:text-white backdrop-blur border border-slate-700/60 transition-all hover:bg-slate-800"
            title="Reset Orientation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-2 left-2.5 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-slate-700/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Target Qubit: q[0]</span>
          </div>
        </div>

        <div className="absolute bottom-2 right-2.5 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-slate-700/60 pointer-events-none">
          <span>|0⟩ North · |1⟩ South</span>
        </div>
      </div>

      {/* Coordinate Readouts Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-500" /> Bloch Angles & Coordinates
          </span>
          <span className="font-mono text-slate-400 text-[11px]">Radius r = 1.000</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-200 dark:border-slate-700/60 flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold">Polar Angle (θ)</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-bold">
              {blochData.theta} rad ({blochData.thetaDeg}°)
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-200 dark:border-slate-700/60 flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold">Azimuth (φ)</span>
            <span className="text-purple-700 dark:text-purple-300 font-bold">
              {blochData.phi} rad ({blochData.phiDeg}°)
            </span>
          </div>
        </div>

        {/* Cartesian coordinates */}
        <div className="bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700/50 flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold">Bloch Vector:</span>
          <span className="text-slate-700 dark:text-slate-300">
            x: <strong className="text-emerald-500">{blochData.x?.toFixed(2) ?? '0.00'}</strong>, y: <strong className="text-amber-500">{blochData.y?.toFixed(2) ?? '0.00'}</strong>, z: <strong className="text-cyan-400">{blochData.z?.toFixed(2) ?? '1.00'}</strong>
          </span>
        </div>

        <div className="p-2 rounded bg-sky-50/70 dark:bg-cyan-950/30 border border-sky-200 dark:border-cyan-800/40 text-xs font-mono text-sky-950 dark:text-cyan-200 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400">Single Qubit State</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Pure State</span>
          </div>
          <span className="font-semibold text-[11px]">{blochData.stateString}</span>
        </div>
      </div>
    </div>
  );
}
