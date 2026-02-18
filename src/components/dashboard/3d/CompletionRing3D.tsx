'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, Environment } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Ring({ progress }: { progress: number }) {
    const torusRef = useRef<THREE.Mesh>(null)
    const activeTorusRef = useRef<THREE.Mesh>(null)

    useFrame((state, delta) => {
        if (torusRef.current) {
            torusRef.current.rotation.x += delta * 0.2
            torusRef.current.rotation.y += delta * 0.1
        }
        if (activeTorusRef.current) {
            activeTorusRef.current.rotation.x += delta * 0.2
            activeTorusRef.current.rotation.y += delta * 0.1
        }
    })

    // Calculate arc length for progress (full circle is Math.PI * 2)
    // Determine user progress arc. Note: TorusGeometry doesn't support arc length strictly like a 2D stroke.
    // So we use a trick: standard torus for background, and a dynamic one or just a text for now.
    // Better 3D approach for progress bar in 3D is a TubeGeometry path or just styling.
    // For simplicity and "WOW" effect, let's use a glowing ring with particles or just a nice material.
    // Let's stick to a rotating glossy torus.

    return (
        <group>
            <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
                {/* Background Ring */}
                <mesh ref={torusRef}>
                    <torusGeometry args={[1.5, 0.2, 16, 100]} />
                    <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} roughness={0.1} metalness={0.9} />
                </mesh>

                {/* Active Progress Segment - Simulated by a secondary colored ring slightly larger but incomplete?
                    Three.js Torus geometry 'arc' parameter allows partial ring!
                */}
                <mesh ref={activeTorusRef} rotation={[0, 0, Math.PI]}> {/* Rotate to start from top/bottom if needed */}
                    <torusGeometry args={[1.5, 0.25, 16, 100, (Math.PI * 2) * (progress / 100)]} />
                    <meshStandardMaterial
                        color="#10b981"
                        emissive="#10b981"
                        emissiveIntensity={2}
                        roughness={0.1}
                        metalness={1}
                        toneMapped={false}
                    />
                </mesh>
            </Float>

            <Text
                position={[0, 0, 0]}
                fontSize={0.8}
                color="#1e293b"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {progress}%
            </Text>
        </group>
    )
}

export default function CompletionRing3D({ progress }: { progress: number }) {
    return (
        <div className="w-full h-full min-h-[200px]">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <group position={[0, 0, 0]}>
                    <Ring progress={progress} />
                </group>
                <Environment preset="city" />
            </Canvas>
        </div>
    )
}
