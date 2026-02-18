'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function FloatingMesh() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle rotation
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05

            // Mouse interaction (parallax)
            const { x, y } = state.pointer
            meshRef.current.rotation.x += y * 0.02
            meshRef.current.rotation.y += x * 0.02
        }
    })

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef} position={[2, 0, 0]} scale={1.8}>
                <icosahedronGeometry args={[1, 15]} /> {/* High detail for smooth distortion */}
                <MeshDistortMaterial
                    color="#4338ca" // Indigo-700 base
                    attach="material"
                    distort={0.4} // Strength of distortion
                    speed={2} // Speed of distortion
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    )
}

function ParticleSwarm({ count = 100 }) {
    const mesh = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Generate random positions
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const factor = 20 + Math.random() * 100
            const speed = 0.01 + Math.random() / 200
            const xFactor = -50 + Math.random() * 100
            const yFactor = -50 + Math.random() * 100
            const zFactor = -50 + Math.random() * 100
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
        }
        return temp
    }, [count])

    useFrame((state) => {
        if (!mesh.current) return

        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle

            // Update time
            t = particle.t += speed / 2
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10
            const s = Math.cos(t)

            // Update position
            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            )
            dummy.scale.set(s, s, s)
            dummy.rotation.set(s * 5, s * 5, s * 5)
            dummy.updateMatrix()

            mesh.current!.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.05, 0]} />
            <meshPhongMaterial color="#6366f1" emissive="#4f46e5" />
        </instancedMesh>
    )
}

export default function LoginScene3D() {
    return (
        <div className="absolute inset-0 z-0 bg-slate-950">
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent z-10 pointer-events-none" />

            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <group position={[2, 0, -2]}>
                    <FloatingMesh />
                </group>

                <ParticleSwarm count={150} />
            </Canvas>
        </div>
    )
}
