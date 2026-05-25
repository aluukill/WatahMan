'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

interface MouseRef {
  current: { x: number; y: number }
}

const HELIX_RADIUS = 2
const HELIX_HEIGHT = 5
const HELIX_TURNS = 2.5
const STRAND_COUNT = 180
const TOTAL_PARTICLES = STRAND_COUNT * 2
const CROSS_LINKS = 60

interface ClickState {
  time: number
  x: number
  y: number
}

function generateHomePositions(): { pos: Float32Array; pairs: number[] } {
  const pos = new Float32Array(TOTAL_PARTICLES * 3)
  const pairs: number[] = []

  for (let i = 0; i < STRAND_COUNT; i++) {
    const t = i / (STRAND_COUNT - 1)
    const y = (t - 0.5) * HELIX_HEIGHT
    const a = t * HELIX_TURNS * Math.PI * 2

    const i1 = i
    const i2 = i + STRAND_COUNT

    pos[i1 * 3] = HELIX_RADIUS * Math.cos(a)
    pos[i1 * 3 + 1] = y + (Math.random() - 0.5) * 0.08
    pos[i1 * 3 + 2] = HELIX_RADIUS * Math.sin(a)

    pos[i2 * 3] = HELIX_RADIUS * Math.cos(a + Math.PI)
    pos[i2 * 3 + 1] = y + (Math.random() - 0.5) * 0.08
    pos[i2 * 3 + 2] = HELIX_RADIUS * Math.sin(a + Math.PI)

    if (i > 0) {
      pairs.push(i - 1, i)
      pairs.push(STRAND_COUNT + i - 1, STRAND_COUNT + i)
    }
  }

  const crossStep = Math.max(1, Math.floor(STRAND_COUNT / CROSS_LINKS))
  for (let i = 0; i < STRAND_COUNT; i += crossStep) {
    pairs.push(i, STRAND_COUNT + i)
  }

  return { pos, pairs }
}

function HelixParticles({
  mouseRef,
  clickRef,
  scrollProgress,
}: {
  mouseRef: MouseRef
  clickRef: React.RefObject<ClickState | null>
  scrollProgress: { current: number }
}) {
  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  const posArrayRef = useRef<Float32Array | null>(null)
  const homePosRef = useRef<Float32Array | null>(null)
  const velRef = useRef<Float32Array | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const linesGeoRef = useRef<THREE.BufferGeometry | null>(null)
  const linesPosRef = useRef<Float32Array | null>(null)

  const [particleGeo] = useState(() => {
    const { pos, pairs } = generateHomePositions()
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo, pos, pairs }
  })

  const linesGeo = useMemo(() => {
    const pairCount = particleGeo.pairs.length / 2
    const lpos = new Float32Array(pairCount * 6)
    const p = particleGeo.pos
    for (let i = 0; i < pairCount; i++) {
      const a = particleGeo.pairs[i * 2] * 3
      const b = particleGeo.pairs[i * 2 + 1] * 3
      lpos[i * 6] = p[a]; lpos[i * 6 + 1] = p[a + 1]; lpos[i * 6 + 2] = p[a + 2]
      lpos[i * 6 + 3] = p[b]; lpos[i * 6 + 4] = p[b + 1]; lpos[i * 6 + 5] = p[b + 2]
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(lpos, 3))
    return geo
  }, [particleGeo])

  useEffect(() => {
    geometryRef.current = particleGeo.geo
    posArrayRef.current = particleGeo.geo.attributes.position.array as Float32Array
    homePosRef.current = new Float32Array(particleGeo.pos)
    velRef.current = new Float32Array(TOTAL_PARTICLES * 3)
    linesGeoRef.current = linesGeo
    linesPosRef.current = linesGeo.attributes.position.array as Float32Array
  }, [particleGeo, linesGeo])

  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 48; c.height = 48
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(24, 24, 0, 24, 24, 24)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.15, 'rgba(255,255,255,0.6)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.1)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 48, 48)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state) => {
    if (!posArrayRef.current || !homePosRef.current || !velRef.current || !geometryRef.current || !linesGeoRef.current || !linesPosRef.current) return

    const pos = posArrayRef.current
    const home = homePosRef.current
    const vel = velRef.current
    const lpos = linesPosRef.current
    const time = state.clock.elapsedTime
    const progress = scrollProgress.current
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    const mouse3D = new THREE.Vector3(mx * 5, my * 5, 0)
    const click = clickRef.current
    const clickActive = click && click.time > 0

    const rotationAngle = time * (0.12 + progress * 0.1)

    const spring = 0.06
    const damping = 0.92
    const mouseRadius = 2.5
    const mouseForce = 0.8

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      const i3 = i * 3

      const hx = home[i3] * Math.cos(rotationAngle) - home[i3 + 2] * Math.sin(rotationAngle)
      const hz = home[i3] * Math.sin(rotationAngle) + home[i3 + 2] * Math.cos(rotationAngle)
      const hy = home[i3 + 1]

      const dx = mouse3D.x - pos[i3]
      const dy = mouse3D.y - pos[i3 + 1]
      const dz = mouse3D.z - pos[i3 + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      let fx = 0, fy = 0, fz = 0

      if (dist < mouseRadius && dist > 0.01) {
        const strength = (1 - dist / mouseRadius) * mouseForce
        fx -= (dx / dist) * strength
        fy -= (dy / dist) * strength
        fz -= (dz / dist) * strength
      }

      if (clickActive && click) {
        const cdx = pos[i3] - click.x * 5
        const cdy = pos[i3 + 1] - click.y * 5
        const cdz = pos[i3 + 2]
        const cd = Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz)
        if (cd < 4 && cd > 0.01) {
          const expStr = (1 - cd / 4) * click.time * 3
          fx += (cdx / cd) * expStr
          fy += (cdy / cd) * expStr
          fz += (cdz / cd) * expStr
        }
      }

      const sx = (hx - pos[i3]) * spring
      const sy = (hy - pos[i3 + 1]) * spring
      const sz = (hz - pos[i3 + 2]) * spring

      vel[i3] = (vel[i3] + fx + sx) * damping
      vel[i3 + 1] = (vel[i3 + 1] + fy + sy) * damping
      vel[i3 + 2] = (vel[i3 + 2] + fz + sz) * damping

      pos[i3] += vel[i3]
      pos[i3 + 1] += vel[i3 + 1]
      pos[i3 + 2] += vel[i3 + 2]
    }

    geometryRef.current.attributes.position.needsUpdate = true

    const pairs = particleGeo.pairs
    for (let i = 0; i < pairs.length / 2; i++) {
      const a = pairs[i * 2] * 3
      const b = pairs[i * 2 + 1] * 3
      lpos[i * 6] = pos[a]; lpos[i * 6 + 1] = pos[a + 1]; lpos[i * 6 + 2] = pos[a + 2]
      lpos[i * 6 + 3] = pos[b]; lpos[i * 6 + 4] = pos[b + 1]; lpos[i * 6 + 5] = pos[b + 2]
    }
    linesGeoRef.current.attributes.position.needsUpdate = true
  })

  return (
    <group>
      <points ref={pointsRef} geometry={particleGeo.geo}>
        <pointsMaterial
          size={0.12}
          map={texture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color="#FCD34D"
          opacity={0.9}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef} geometry={linesGeo}>
        <lineBasicMaterial color="#10B981" transparent opacity={0.12} />
      </lineSegments>
    </group>
  )
}

/* eslint-disable react-hooks/purity */
function FloatingEmbers({ mouseRef }: { mouseRef: MouseRef }) {
  const count = 120
  const pointsRef = useRef<THREE.Points>(null!)
  const posArrayRef = useRef<Float32Array | null>(null)
  const basePosRef = useRef<Float32Array | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.8
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geo
  }, [count])

  useEffect(() => {
    geometryRef.current = geometry
    posArrayRef.current = geometry.attributes.position.array as Float32Array
    basePosRef.current = new Float32Array(posArrayRef.current)
  }, [geometry])

  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.2)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state) => {
    if (!posArrayRef.current || !basePosRef.current || !geometryRef.current) return
    const pos = posArrayRef.current; const base = basePosRef.current
    const t = state.clock.elapsedTime; const mx = mouseRef.current.x * 0.3; const my = mouseRef.current.y * 0.3
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = base[i3] + Math.sin(t * 0.1 + i * 0.05) * 0.2 + mx * 0.3
      pos[i3 + 1] = base[i3 + 1] + Math.cos(t * 0.08 + i * 0.04) * 0.2 + my * 0.3
      pos[i3 + 2] = base[i3 + 2] + Math.sin(t * 0.06 + i * 0.03) * 0.2
    }
    geometryRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.04} map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} color="#F97316" opacity={0.25} sizeAttenuation />
    </points>
  )
}
/* eslint-enable react-hooks/purity */

function SceneContent({
  mouseRef,
  clickRef,
  scrollProgress,
}: {
  mouseRef: MouseRef
  clickRef: React.RefObject<ClickState | null>
  scrollProgress: { current: number }
}) {
  useFrame((state) => {
    const p = scrollProgress.current
    const cam = state.camera
    const tz = 4.5 + p * 1.5
    const ty = p * 0.4
    cam.position.x += ((p * 0.3) - cam.position.x) * 0.02
    cam.position.y += (ty - cam.position.y) * 0.02
    cam.position.z += (tz - cam.position.z) * 0.02
    cam.lookAt(0, 0, 0)
  })

  return (
    <>
      <fogExp2 attach="fog" args={['#0A0A0A', 0.04]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#F59E0B" />
      <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#10B981" />
      <pointLight position={[0, 3, 2]} intensity={1.2} color="#FCD34D" distance={8} />

      <HelixParticles mouseRef={mouseRef} clickRef={clickRef} scrollProgress={scrollProgress} />
      <FloatingEmbers mouseRef={mouseRef} />
    </>
  )
}

export default function Scene3D({
  mouseRef,
  clickRef,
  scrollProgress,
}: {
  mouseRef: MouseRef
  clickRef: React.RefObject<ClickState | null>
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
          toneMappingExposure: 0.9,
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <SceneContent mouseRef={mouseRef} clickRef={clickRef} scrollProgress={scrollProgress} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.4} intensity={2} blendFunction={BlendFunction.ADD} />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} blendFunction={BlendFunction.NORMAL} />
          <Noise opacity={0.015} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
