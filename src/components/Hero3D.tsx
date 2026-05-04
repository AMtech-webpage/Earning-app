import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, PerspectiveCamera, OrbitControls, Points, PointMaterial } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
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
    <div className={cn("absolute inset-0 z-0 overflow-hidden pointer-events-none")}>
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      
      {!particlesOnly && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Central Glowing Orb */}
            <div className="w-64 h-64 bg-gradient-to-br from-primary to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            {/* Spinning Rings (CSS) */}
            <div className="absolute inset-0 border border-primary/20 rounded-full scale-150 animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute inset-0 border border-cyan-500/10 rounded-full scale-[1.8] animate-[spin_30s_linear_infinite_reverse]"></div>
          </div>
        </div>
      )}

      {/* Floating Particles (CSS) */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full animate-float"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
              animationDuration: (Math.random() * 10 + 10) + 's',
              animationDelay: (Math.random() * 5) + 's'
            }}
          />
        ))}
      </div>
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
