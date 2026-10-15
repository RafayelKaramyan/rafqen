import { useLayoutEffect, useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import {
  CanvasTexture,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { capSets, finishes, keyboardLayout, type Configuration, type Key } from '../lib/catalog';
import { useMedia } from '../lib/hooks';

function KeyGroup({ keys, color }: { keys: Key[]; color: string }) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(0.91, 0.34, 0.91, 2, 0.065), []);
  const material = useMemo(
    () => new MeshStandardMaterial({ color, roughness: 0.63, metalness: 0.02 }),
    [color],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useLayoutEffect(() => {
    const dummy = new Object3D();
    keys.forEach((key, i) => {
      dummy.position.set(key.x + key.w / 2, 0.53, key.y + 0.5);
      dummy.scale.set(key.w - 0.07, 1, 1);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [keys]);
  return <instancedMesh ref={ref} args={[geometry, material, keys.length]} frustumCulled={false} />;
}
function Model({ config, angle }: { config: Configuration; angle: number }) {
  const layout = useMemo(() => keyboardLayout(config.model), [config.model]),
    colors = capSets[config.caps];
  const { size } = useThree();
  const zoom = Math.min(size.width / (layout.width * 1.15), size.height / (layout.height * 2));
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = Math.round((2048 * layout.height) / layout.width);
    const ctx = canvas.getContext('2d')!;
    const u = canvas.width / layout.width;
    layout.keys.forEach((key) => {
      const dark =
        key.kind === 'accent' ||
        (key.kind === 'main' && config.caps === 'contrast') ||
        (key.kind === 'mod' && config.caps === 'signal');
      ctx.fillStyle = dark ? '#fff8ed' : '#343731';
      ctx.font = `500 ${u * (key.label.length > 3 ? 0.17 : 0.22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key.label, (key.x + key.w / 2) * u, (key.y + 0.5) * u);
    });
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [layout, config.caps]);
  useEffect(() => () => texture.dispose(), [texture]);
  const grouped = useMemo(
    () => ({
      main: layout.keys.filter((k) => k.kind === 'main'),
      mod: layout.keys.filter((k) => k.kind === 'mod'),
      accent: layout.keys.filter((k) => k.kind === 'accent'),
    }),
    [layout],
  );
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[9, 16, 17]}
        zoom={zoom}
        near={0.1}
        far={100}
        onUpdate={(camera) => camera.lookAt(0, 0, 0)}
      />
      <group rotation={[0, angle, 0]}>
        <group position={[-layout.width / 2, 0, -layout.height / 2]}>
          <mesh position={[layout.width / 2, 0.05, layout.height / 2]}>
            <boxGeometry args={[layout.width + 0.65, 0.4, layout.height + 0.55]} />
            <meshStandardMaterial
              color={finishes[config.finish].hex}
              metalness={0.65}
              roughness={0.33}
            />
          </mesh>
          <mesh position={[layout.width / 2, 0.27, layout.height / 2]}>
            <boxGeometry args={[layout.width - 0.2, 0.1, layout.height - 0.2]} />
            <meshStandardMaterial color="#282a26" roughness={0.9} />
          </mesh>
          <KeyGroup keys={grouped.main} color={colors.main} />
          <KeyGroup keys={grouped.mod} color={colors.mods} />
          <KeyGroup keys={grouped.accent} color={colors.accent} />
          <mesh
            position={[layout.width / 2, 0.706, layout.height / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[layout.width, layout.height]} />
            <meshBasicMaterial
              map={texture}
              transparent
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        </group>
      </group>
    </>
  );
}
export default function KeyboardThree({ config, angle }: { config: Configuration; angle: number }) {
  const fine = useMedia('(hover: hover) and (pointer: fine)');
  return (
    <Canvas
      orthographic
      camera={{ position: [9, 16, 17], zoom: 35, near: 0.1, far: 100 }}
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[-6, 10, -3]} intensity={3.5} />
      <directionalLight position={[10, 5, 12]} intensity={1.2} color="#e8ddcc" />
      <Model config={config} angle={angle} />
      {fine ? (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={0.3}
          maxPolarAngle={1.25}
          minAzimuthAngle={-0.7}
          maxAzimuthAngle={0.7}
          makeDefault
        />
      ) : null}
    </Canvas>
  );
}
