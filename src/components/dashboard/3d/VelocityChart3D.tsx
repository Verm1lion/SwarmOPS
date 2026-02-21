'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls, Environment, Float } from '@react-three/drei'
import { useRef, useState, useMemo, Suspense } from 'react'
import * as THREE from 'three'

function Bar({ position, height, day, count, color }: { position: [number, number, number], height: number, day: string, count: number, color: string }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Subtle breathing animation
            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, hovered ? 1.2 : 1, delta * 10)
            meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, hovered ? 1.2 : 1, delta * 10)
            // Color shift on hover
            const targetColor = new THREE.Color(hovered ? '#4f46e5' : color)
            // @ts-ignore
            meshRef.current.material.color.lerp(targetColor, delta * 10)
        }
    })

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    position={[0, height / 2, 0]}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <boxGeometry args={[0.6, height, 0.6]} />
                    <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
                </mesh>
            </Float>
            {/* Label below bar */}
            <Text
                position={[0, -0.5, 0.5]}
                fontSize={0.3}
                color="#64748b"
                anchorX="center"
                anchorY="middle"
            >
                {day}
            </Text>
            {/* Count above bar (only if height > 0 or hovered) */}
            {(height > 0 || hovered) && (
                <Text
                    position={[0, height + 0.5, 0]}
                    fontSize={0.3}
                    color="#1e293b"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#ffffff"
                >
                    {count}
                </Text>
            )}
        </group>
    )
}

export default function VelocityChart3D({ data }: { data: { day: string, count: number }[] }) {
    const maxCount = Math.max(...data.map(d => d.count), 1)

    // Memoize bar positions to center them
    const bars = useMemo(() => {
        const spacing = 1.2
        const totalWidth = (data.length - 1) * spacing
        const startX = -totalWidth / 2

        return data.map((d, i) => ({
            ...d,
            x: startX + i * spacing,
            // Scale height: max height 4 units
            height: (d.count / maxCount) * 4 || 0.1, // Minimum height for 0
            color: '#a5b4fc' // Default indigo-300
        }))
    }, [data, maxCount])

    return (
        <div className="w-full h-full min-h-[200px]">
            <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, -10]} angle={0.3} penumbra={1} intensity={1} color="#6366f1" />

                <Suspense fallback={null}>
                    <group position={[0, -1, 0]}>
                        {bars.map((bar, i) => (
                            <Bar
                                key={i}
                                position={[bar.x, 0, 0]}
                                height={bar.height}
                                day={bar.day}
                                count={bar.count}
                                color={bar.color}
                            />
                        ))}
                        {/* Floor reflection/base */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                            <planeGeometry args={[15, 10]} />
                            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.1} transparent opacity={0.5} />
                        </mesh>
                    </group>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 2.5}
                    />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    )
}
