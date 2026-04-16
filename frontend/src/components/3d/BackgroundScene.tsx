import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import { animated } from '@react-spring/three'
import * as THREE from 'three'

function AnimatedGeometries() {
  const meshRef1 = (el: THREE.Mesh) => {
    if (el) {
      el.rotation.x = 0.1
      el.rotation.y = 0.1
    }
  }

  return (
    <>
      <mesh ref={meshRef1} position={[-3, 1, -5]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhongMaterial 
          color="#3b82f6" 
          wireframe={false}
          emissive="#1e40af"
          shininess={100}
        />
      </mesh>

      <mesh position={[3, -1, -5]} rotation={[0.4, 0.4, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhongMaterial 
          color="#8b5cf6"
          emissive="#5b21b6"
          wireframe={false}
          shininess={100}
        />
      </mesh>

      <mesh position={[0, 0, -8]} rotation={[0, 0.5, 0]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshPhongMaterial 
          color="#ec4899"
          emissive="#be185d"
          wireframe={false}
          shininess={100}
        />
      </mesh>

      <mesh position={[-2, -2, -5]} rotation={[0.3, 0.3, 0]}>
        <icosahedronGeometry args={[0.8, 4]} />
        <meshPhongMaterial 
          color="#10b981"
          emissive="#065f46"
          wireframe={false}
          shininess={100}
        />
      </mesh>

      <mesh position={[2, 2, -6]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshPhongMaterial 
          color="#f59e0b"
          emissive="#b45309"
          wireframe={false}
          shininess={100}
        />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#3b82f6" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  )
}

export function BackgroundScene() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <Canvas>
        <PerspectiveCamera position={[0, 0, 5]} fov={75} />
        <Suspense fallback={null}>
          <AnimatedGeometries />
        </Suspense>
      </Canvas>
    </div>
  )
}
