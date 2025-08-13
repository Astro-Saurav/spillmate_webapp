import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShape({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.005
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} position={position} scale={scale}>
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </Sphere>
    </Float>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <FloatingShape position={[-3, 2, -5]} scale={0.8} color="#8b5cf6" />
      <FloatingShape position={[3, -1, -3]} scale={0.6} color="#06b6d4" />
      <FloatingShape position={[-2, -2, -8]} scale={1.2} color="#a855f7" />
      <FloatingShape position={[4, 3, -6]} scale={0.4} color="#0891b2" />
      <FloatingShape position={[0, 0, -10]} scale={2} color="#7c3aed" />
      
      <Environment preset="night" />
    </>
  )
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
