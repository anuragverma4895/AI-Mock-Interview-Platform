import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Stars, PerspectiveCamera } from '@react-three/drei'

function RotatingGeometry() {
  return (
    <>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhongMaterial 
          color="#6366f1"
          wireframe={false}
          emissive="#4f46e5"
          shininess={80}
        />
      </mesh>

      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <Stars radius={200} depth={50} count={8000} factor={4} saturation={0.5} fade speed={0.5} />
    </>
  )
}

interface AnimatedCanvasProps {
  className?: string
  height?: string
}

export function AnimatedCanvas({ className = '', height = 'h-64' }: AnimatedCanvasProps) {
  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden ${className}`}>
      <Canvas>
        <PerspectiveCamera position={[0, 0, 4]} fov={75} />
        <Suspense fallback={null}>
          <RotatingGeometry />
        </Suspense>
      </Canvas>
    </div>
  )
}
