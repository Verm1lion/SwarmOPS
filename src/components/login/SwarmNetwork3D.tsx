'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function NetworkGraph({ count = 200 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 10
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            p[i * 3 + 2] = r * Math.cos(phi)
        }
        return p
    }, [count])

    const ref = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    useFrame((state) => {
        if (ref.current && linesRef.current) {
            // Constant rotation
            ref.current.rotation.y += 0.001
            linesRef.current.rotation.y += 0.001

            // Mouse interaction
            const { x, y } = state.pointer
            ref.current.rotation.x += y * 0.0005
            ref.current.rotation.y += x * 0.0005
            linesRef.current.rotation.x += y * 0.0005
            linesRef.current.rotation.y += x * 0.0005
        }
    })

    // Create connections (expensive, but okay for low count)
    const connections = useMemo(() => {
        const indices = []
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dist = Math.sqrt(
                    Math.pow(points[i * 3] - points[j * 3], 2) +
                    Math.pow(points[i * 3 + 1] - points[j * 3 + 1], 2) +
                    Math.pow(points[i * 3 + 2] - points[j * 3 + 2], 2)
                )
                if (dist < 3.5) { // Connection threshold
                    indices.push(i, j)
                }
            }
        }
        return indices
    }, [points, count])


    return (
        <group>
            {/* The Nodes */}
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length / 3}
                        array={points}
                        itemSize={3}
                        args={[points, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#6366f1" // Indigo-500
                    sizeAttenuation
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* The Connections */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length / 3}
                        array={points}
                        itemSize={3}
                        args={[points, 3]}
                    />
                    <bufferAttribute
                        attach="index"
                        count={connections.length}
                        array={new Uint16Array(connections)}
                        itemSize={1}
                        args={[new Uint16Array(connections), 1]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#4338ca" // Indigo-700
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    linewidth={1}
                />
            </lineSegments>
        </group>
    )
}

function FloatingParticles({ count = 300 }) {
    const mesh = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

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
            t = particle.t += speed / 2
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10
            const s = Math.cos(t)

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            )
            dummy.scale.set(s, s, s)
            dummy.updateMatrix()
            mesh.current!.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.02, 0]} />
            <meshBasicMaterial color="#a5b4fc" transparent opacity={0.6} blending={THREE.AdditiveBlending} /> {/* Indigo-200 */}
        </instancedMesh>
    )
}

function IntroCamera({ onIntroComplete, startAnimation }: { onIntroComplete?: () => void, startAnimation: boolean }) {
    useFrame((state) => {
        // Target Z position is 15 (where we want to end up)
        const targetZ = 15
        const currentZ = state.camera.position.z

        if (!startAnimation) {
            // Hold at start position if not started
            // slightly float the camera for "alive" feel even when waiting
            const time = state.clock.getElapsedTime()
            state.camera.position.z = 100 + Math.sin(time * 0.5) * 2
            return
        }

        // Smoothly interpolate camera position
        // The higher the lerp factor (0.02), the faster it settles
        if (Math.abs(currentZ - targetZ) > 0.1) {
            // Speed up the lerp for a "Hyperdrive" burst effect once started
            state.camera.position.z = THREE.MathUtils.lerp(currentZ, targetZ, 0.04)
        } else {
            // Snap to exact position and notify completion
            if (currentZ !== targetZ) {
                state.camera.position.z = targetZ
                if (onIntroComplete) onIntroComplete()
            }
        }
    })
    return null
}

export default function SwarmNetwork3D({ onIntroComplete, startAnimation = true }: { onIntroComplete?: () => void, startAnimation?: boolean }) {
    return (
        <div className="absolute inset-0 z-0 bg-slate-950">
            {/* Deep Space Gradient */}
            <div className="absolute inset-0 bg-radial-gradient from-indigo-900/20 via-slate-950/80 to-slate-950 z-10 pointer-events-none" />

            {/* Initial Camera Position at Z=100 for the "Zoom In" effect */}
            <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
                <color attach="background" args={['#020617']} /> {/* Slate-950 */}
                <fog attach="fog" args={['#020617', 10, 40]} /> {/* Adjustable fog for depth */}

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#818cf8" />

                <NetworkGraph />
                <FloatingParticles />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />

                <IntroCamera onIntroComplete={onIntroComplete} startAnimation={startAnimation} />
            </Canvas>
        </div>
    )
}
