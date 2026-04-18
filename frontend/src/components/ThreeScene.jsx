import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';

const Shape = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshDistortMaterial
          color="#7b2fff"
          emissive="#7b2fff"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.8}
          distort={0.4}
          speed={2}
        />
      </mesh>
      
      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
};

const ThreeScene = () => {
  return (
    <div style={{ width: '100%', height: '500px', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff2d78" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00f5ff" />
        <Shape />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      {/* Glow shadow under the 3D element */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(123, 47, 255, 0.4) 0%, rgba(123, 47, 255, 0) 70%)',
        filter: 'blur(40px)',
        zIndex: -1
      }} />
    </div>
  );
};

export default ThreeScene;
