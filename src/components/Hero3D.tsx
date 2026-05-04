import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera, OrbitControls, Points, PointMaterial } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ParticleCloud = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <Points positions={positions} ref={pointsRef}>
      <PointMaterial
        transparent
        color="#007BFF"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const Trophy = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color="#0062FF"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#002255"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Decorative rings */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={2} />
        </mesh>
      </group>
      <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[1.8, 0.02, 16, 100]} />
          <meshStandardMaterial color="#007BFF" emissive="#007BFF" emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
};

export const Hero3D = ({ particlesOnly = false }: { particlesOnly?: boolean }) => {
  return (
    <div className={cn("absolute inset-0 z-0", particlesOnly ? "opacity-30" : "opacity-60")}>
      <Suspense fallback={null}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          {!particlesOnly && <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />}
          <ambientLight intensity={0.5} />
          {!particlesOnly && <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />}
          <pointLight position={[-10, -10, -10]} color="#0062FF" intensity={1} />
          {particlesOnly ? <ParticleCloud /> : <Trophy />}
        </Canvas>
      </Suspense>
    </div>
  );
};

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
};
