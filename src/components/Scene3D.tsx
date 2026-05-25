'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

interface MouseRef {
  current: { x: number; y: number }
}

function ParticleNebula({ mouseRef, scrollProgress }: { mouseRef: MouseRef; scrollProgress: { current: number } }) {
  const count = 2500
  const pointsRef = useRef<THREE.Points>(null!)
  const posArrayRef = useRef<Float32Array | null>(null)
  const basePosRef = useRef<Float32Array | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)

  const [geometry] = useState(() => {
    const pos = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.pow(Math.random(), 0.6) * 5

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.5
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      const t = r / 5
      colors[i * 3] = 0.35 + t * 0.15
      colors[i * 3 + 1] = 0.1 + t * 0.3
      colors[i * 3 + 2] = 0.55 + t * 0.3

      sizes[i] = 0.02 + Math.random() * 0.06 * (1 - t * 0.5)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  })

  useEffect(() => {
    geometryRef.current = geometry
    posArrayRef.current = geometry.attributes.position.array as Float32Array
    basePosRef.current = new Float32Array(posArrayRef.current)
  }, [geometry])

  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.1, 'rgba(255,255,255,0.6)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.15)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state) => {
    if (!posArrayRef.current || !basePosRef.current || !geometryRef.current) return
    const pos = posArrayRef.current
    const base = basePosRef.current
    const time = state.clock.elapsedTime
    const progress = scrollProgress.current
    const mx = mouseRef.current.x * 0.8
    const my = mouseRef.current.y * 0.8

    const orbitSpeed = 0.12 + progress * 0.15

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const bx = base[i3]; const by = base[i3 + 1]; const bz = base[i3 + 2]
      const r = Math.sqrt(bx * bx + bz * bz)
      const angle = Math.atan2(bz, bx)
      const speed = orbitSpeed + 0.02 * (i % 5)

      const newAngle = angle + time * speed + Math.sin(time * 0.1 + i * 0.002) * 0.05
      const radialPulse = 1 + Math.sin(time * 0.3 + i * 0.01) * 0.03
      const verticalBob = Math.sin(time * 0.2 + i * 0.015) * 0.08

      pos[i3] = Math.cos(newAngle) * r * radialPulse + mx * (r / 5) * 0.3
      pos[i3 + 1] = by + verticalBob + Math.sin(time * 0.15 + r) * 0.05 + my * 0.2
      pos[i3 + 2] = Math.sin(newAngle) * r * radialPulse + my * (r / 5) * 0.2
    }

    geometryRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.045}
        map={texture}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  )
}

function GeometricFrame() {
  const meshRef = useRef<THREE.LineSegments>(null!)

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(4.5, 1)
    const edges = new THREE.EdgesGeometry(geo)
    return edges
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.04
      meshRef.current.rotation.y += delta * 0.07
    }
  })

  return (
    <lineSegments ref={meshRef} geometry={geometry}>
      <lineBasicMaterial color="#7C3AED" transparent opacity={0.08} />
    </lineSegments>
  )
}

function SparkParticles() {
  const count = 80
  const pointsRef = useRef<THREE.Points>(null!)
  const posArrayRef = useRef<Float32Array | null>(null)
  const basePosRef = useRef<Float32Array | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)

  const [geometry] = useState(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 3
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.4
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  })

  useEffect(() => {
    geometryRef.current = geometry
    posArrayRef.current = geometry.attributes.position.array as Float32Array
    basePosRef.current = new Float32Array(posArrayRef.current)
  }, [geometry])

  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 32; c.height = 32
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.3, 'rgba(255,255,255,0.5)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state) => {
    if (!posArrayRef.current || !basePosRef.current || !geometryRef.current) return
    const pos = posArrayRef.current
    const base = basePosRef.current
    const time = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const speed = 0.3 + (i % 7) * 0.05
      pos[i3] = base[i3] + Math.sin(time * speed + i * 0.1) * 0.15
      pos[i3 + 1] = base[i3 + 1] + Math.cos(time * speed * 0.7 + i * 0.08) * 0.1
      pos[i3 + 2] = base[i3 + 2] + Math.sin(time * speed * 0.5 + i * 0.12) * 0.15
    }
    geometryRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        map={texture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color="#06F7FF"
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function InnerGlow() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.02
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 0.2) * 0.02
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial color="#7C3AED" transparent opacity={0.04} />
    </mesh>
  )
}

function SceneContent({ mouseRef, scrollProgress }: { mouseRef: MouseRef; scrollProgress: { current: number } }) {
  useFrame((state) => {
    const progress = scrollProgress.current
    const cam = state.camera
    const targetZ = 4.5 + progress * 2
    const targetY = progress * 0.6
    cam.position.x += ((progress * 0.4) - cam.position.x) * 0.02
    cam.position.y += (targetY - cam.position.y) * 0.02
    cam.position.z += (targetZ - cam.position.z) * 0.02
    cam.lookAt(0, 0, 0)
  })

  return (
    <>
      <fogExp2 attach="fog" args={['#020205', 0.025]} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} color="#7C3AED" />
      <directionalLight position={[-4, -2, -4]} intensity={0.6} color="#06F7FF" />
      <pointLight position={[0, 0, 2]} intensity={1.5} color="#A855F7" distance={8} />
      <pointLight position={[2, -1, -2]} intensity={0.4} color="#EC4899" distance={6} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[14, 14]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1.5}
          mixStrength={40}
          roughness={0.6}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#020205"
          metalness={0.6}
        />
      </mesh>

      <GeometricFrame />
      <InnerGlow />
      <ParticleNebula mouseRef={mouseRef} scrollProgress={scrollProgress} />
      <SparkParticles />
    </>
  )
}

export default function Scene3D({
  mouseRef,
  scrollProgress,
}: {
  mouseRef: MouseRef
  scrollProgress: { current: number }
}) {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <SceneContent mouseRef={mouseRef} scrollProgress={scrollProgress} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.05}
            luminanceSmoothing={0.5}
            intensity={2.5}
            blendFunction={BlendFunction.ADD}
          />
          <ChromaticAberration
            offset={new THREE.Vector2(0.003, 0.003)}
            blendFunction={BlendFunction.NORMAL}
          />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
