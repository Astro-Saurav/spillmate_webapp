import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Float } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingShapeProps {
  position: [number, number, number]
  scale: number
  color: string
  speed?: number
}

export default function FloatingShape({ 
  position, 
  scale, 
  color, 
  speed = 1 
}: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed
      meshRef.current.rotation.y += 0.005 * speed
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2
    }
  })

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} position={position} scale={scale}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}
