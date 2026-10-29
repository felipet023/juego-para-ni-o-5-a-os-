import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { LessonState, ZoneId } from '../types';
import { inputState, resetInput } from './input';
import {
  INTERACT_RADIUS,
  ISLAND_RADIUS,
  ZONE_BLOCK_RADIUS,
  ZONE_VISUALS,
  type ZoneVisual,
} from './zoneLayout';

interface WorldProps {
  lessons: LessonState[];
  nearZone: ZoneId | null;
  onNearChange: (zone: ZoneId | null) => void;
  onEnterZone: (zone: ZoneId) => void;
  paused: boolean;
  reduceMotion: boolean;
}

interface ZoneStatus {
  locked: boolean;
  mastered: boolean;
}

function statusFor(lessons: LessonState[], zone: ZoneVisual): ZoneStatus {
  const zoneLessons = lessons.filter((lesson) => lesson.zone === zone.id);
  if (zoneLessons.length === 0) return { locked: true, mastered: false };
  return {
    locked: zoneLessons.every((lesson) => lesson.status === 'locked'),
    mastered: zoneLessons.length > 0 && zoneLessons.every((lesson) => lesson.status === 'mastered'),
  };
}

/* ─── Isla ──────────────────────────────────────────────────── */

const TREES: [number, number][] = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2 + 0.2;
  const radius = 20.2 - (index % 3) * 1.1;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
});

function Tree({ position, scale = 1 }: { position: [number, number]; scale?: number }) {
  return (
    <group position={[position[0], 1.1, position[1]]} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.2, 6]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.85, 1.8, 7]} />
        <meshStandardMaterial color="#2f9e5b" />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[0.6, 1.3, 7]} />
        <meshStandardMaterial color="#3fbb6d" />
      </mesh>
    </group>
  );
}

function Island() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <circleGeometry args={[140, 48]} />
        <meshStandardMaterial color="#2aa5d6" />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[24, 21.5, 2.4, 48]} />
        <meshStandardMaterial color="#e6d3a3" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[23, 23, 0.5, 48]} />
        <meshStandardMaterial color="#6cc978" />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20.4, 23, 48]} />
        <meshStandardMaterial color="#f2dfae" />
      </mesh>

      {TREES.map((position, index) => (
        <Tree key={`tree-${index}`} position={position} scale={index % 4 === 0 ? 0.85 : 1.05} />
      ))}

      {/* Rocas decorativas */}
      {[
        [6, 19],
        [-8, -19],
        [19, 8],
        [-19, -6],
      ].map(([x, z], index) => (
        <mesh key={`rock-${index}`} position={[x!, 0.9, z!]} rotation={[0.4, index, 0.2]}>
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#9aa7b1" />
        </mesh>
      ))}

      {/* Nubes */}
      {[
        [-14, 16, -12],
        [10, 18, 8],
        [0, 20, -18],
      ].map(([x, y, z], index) => (
        <group key={`cloud-${index}`} position={[x!, y!, z!]}>
          <mesh>
            <sphereGeometry args={[1.6, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1.5, -0.2, 0.3]}>
            <sphereGeometry args={[1.1, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-1.4, -0.3, -0.2]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Edificios de cada zona ────────────────────────────────── */

function Landmark({ zone }: { zone: ZoneVisual }) {
  switch (zone.id) {
    case 'playa':
      return (
        <group>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2.4, 1.2, 2.4]} />
            <meshStandardMaterial color="#f4d58d" />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[1.9, 1.2, 4]} />
            <meshStandardMaterial color="#e0b463" />
          </mesh>
        </group>
      );
    case 'pueblo':
      return (
        <group>
          <mesh position={[-0.8, 0.9, 0]}>
            <boxGeometry args={[1.2, 1.6, 1.2]} />
            <meshStandardMaterial color="#f6c177" />
          </mesh>
          <mesh position={[-0.8, 1.9, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1, 0.9, 4]} />
            <meshStandardMaterial color="#c2410c" />
          </mesh>
          <mesh position={[0.9, 0.7, 0.4]}>
            <boxGeometry args={[1, 1.2, 1]} />
            <meshStandardMaterial color="#fde68a" />
          </mesh>
          <mesh position={[0.9, 1.5, 0.4]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.85, 0.8, 4]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
        </group>
      );
    case 'taller':
      return (
        <group>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2.6, 1.8, 2]} />
            <meshStandardMaterial color="#c4b5fd" />
          </mesh>
          <mesh position={[0, 1.6, 1.1]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.5, 0.16, 8, 20]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>
          <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 2.4, 8]} />
            <meshStandardMaterial color="#6d28d9" />
          </mesh>
        </group>
      );
    case 'cueva':
      return (
        <group>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[1.8, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, 0.55, 1.3]}>
            <boxGeometry args={[1.3, 1.1, 0.3]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      );
    case 'bosque':
      return (
        <group>
          <Tree position={[-0.9, 0.2]} scale={1.15} />
          <Tree position={[0.9, -0.1]} scale={1} />
          <Tree position={[0.1, 0.9]} scale={0.85} />
        </group>
      );
    case 'puente':
      return (
        <group>
          <mesh position={[0, 1, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[1.6, 0.22, 10, 24, Math.PI]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[3.4, 0.24, 1.2]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        </group>
      );
    case 'laboratorio':
      return (
        <group>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[1.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#fdba74" />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 6]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.28, 12, 12]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} />
          </mesh>
        </group>
      );
    case 'castillo':
      return (
        <group>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[2.2, 1.8, 2.2]} />
            <meshStandardMaterial color="#f0abfc" />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([x, z], index) => (
            <group key={`tower-${index}`} position={[x! * 0.95, 0, z! * 0.95]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 2.8, 10]} />
                <meshStandardMaterial color="#e879f9" />
              </mesh>
              <mesh position={[0, 3.1, 0]}>
                <coneGeometry args={[0.6, 0.9, 10]} />
                <meshStandardMaterial color="#a21caf" />
              </mesh>
            </group>
          ))}
        </group>
      );
    case 'templo':
      return (
        <group>
          {[-1.1, 1.1].map((x) => (
            <mesh key={`pillar-${x}`} position={[x, 1.5, 0]}>
              <cylinderGeometry args={[0.22, 0.26, 3, 10]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
          ))}
          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[3.1, 0.35, 0.6]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          <mesh position={[0, 2.35, 0]}>
            <boxGeometry args={[2.5, 0.22, 0.5]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function ZoneBuilding({
  zone,
  status,
  active,
  onEnter,
}: {
  zone: ZoneVisual;
  status: ZoneStatus;
  active: boolean;
  onEnter: () => void;
}) {
  const [x, z] = zone.position;
  const color = status.locked ? '#94a3b8' : zone.color;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[3.4, 3.6, 0.7, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.9, 3.3, 24]} />
        <meshStandardMaterial color={active ? '#fde047' : '#ffffff'} />
      </mesh>

      <group position={[0, 0.7, 0]}>{status.locked ? null : <Landmark zone={zone} />}</group>

      <Html center position={[0, 4.4, 0]} zIndexRange={[8, 0]}>
        <div className={`zone-label ${status.locked ? 'zone-label--locked' : ''}`}>
          <button
            type="button"
            className="zone-label__pill"
            onClick={onEnter}
            aria-label={`${zone.name}${status.locked ? ' (bloqueada)' : ''}`}
          >
            <span aria-hidden="true">{status.locked ? '🔒' : zone.emoji}</span> {zone.name}
            {status.mastered ? ' ⭐' : ''}
          </button>
          {active && <span className="zone-label__hint">Pulsa E</span>}
        </div>
      </Html>
    </group>
  );
}

/* ─── Personaje ─────────────────────────────────────────────── */

function Ajolote({
  movingRef,
  reduceMotion,
}: {
  movingRef: React.MutableRefObject<boolean>;
  reduceMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    time.current += delta;
    const moving = movingRef.current;
    group.current.position.y =
      moving && !reduceMotion ? Math.abs(Math.sin(time.current * 9)) * 0.12 : 0;
    group.current.rotation.z = moving && !reduceMotion ? Math.sin(time.current * 9) * 0.05 : 0;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#0f2233" transparent opacity={0.22} />
      </mesh>

      <mesh position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.42, 0.55, 8, 16]} />
        <meshStandardMaterial color="#ffb3d1" />
      </mesh>
      <mesh position={[0, 1.35, 0.05]}>
        <sphereGeometry args={[0.42, 20, 16]} />
        <meshStandardMaterial color="#ffc7de" />
      </mesh>

      {/* branquias */}
      {[-1, 1].map((side) =>
        [0, 1, 2].map((index) => (
          <mesh
            key={`gill-${side}-${index}`}
            position={[side * 0.42, 1.5 - index * 0.12, -0.05]}
            rotation={[0, 0, side * (0.5 + index * 0.2)]}
          >
            <coneGeometry args={[0.09, 0.42, 6]} />
            <meshStandardMaterial color="#ff8fbf" />
          </mesh>
        )),
      )}

      {/* ojos */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={`eye-${x}`} position={[x, 1.42, 0.4]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshBasicMaterial color="#10243b" />
        </mesh>
      ))}
      <mesh position={[0, 1.28, 0.43]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ff6b9d" />
      </mesh>

      {/* cola */}
      <mesh position={[0, 0.6, -0.55]} rotation={[0.7, 0, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="#ffb3d1" />
      </mesh>
    </group>
  );
}

function Player({
  paused,
  reduceMotion,
  onNearChange,
}: {
  paused: boolean;
  reduceMotion: boolean;
  onNearChange: (zone: ZoneId | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(0, 0, 7));
  const facing = useRef(0);
  const moving = useRef(false);
  const lastNear = useRef<ZoneId | null>(null);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    const dt = Math.min(delta, 0.05);

    if (!paused) {
      const horizontal =
        (inputState.keys.right ? 1 : 0) -
        (inputState.keys.left ? 1 : 0) +
        inputState.joystick.x;
      const vertical =
        (inputState.keys.down ? 1 : 0) -
        (inputState.keys.up ? 1 : 0) +
        inputState.joystick.z;

      const direction = new THREE.Vector3(horizontal, 0, vertical);
      const hasInput = direction.lengthSq() > 0.0001;
      moving.current = hasInput;

      if (hasInput) {
        direction.normalize();
        const speed = 9;
        node.position.addScaledVector(direction, speed * dt);
        facing.current = Math.atan2(direction.x, direction.z);
      }

      const radius = Math.hypot(node.position.x, node.position.z);
      if (radius > ISLAND_RADIUS) {
        node.position.x = (node.position.x / radius) * ISLAND_RADIUS;
        node.position.z = (node.position.z / radius) * ISLAND_RADIUS;
      }

      for (const zone of ZONE_VISUALS) {
        const dx = node.position.x - zone.position[0];
        const dz = node.position.z - zone.position[1];
        const distance = Math.hypot(dx, dz);
        if (distance < ZONE_BLOCK_RADIUS) {
          const safe = distance < 0.001 ? 1 : distance;
          node.position.x = zone.position[0] + (dx / safe) * ZONE_BLOCK_RADIUS;
          node.position.z = zone.position[1] + (dz / safe) * ZONE_BLOCK_RADIUS;
        }
      }

      node.rotation.y = reduceMotion
        ? facing.current
        : THREE.MathUtils.lerp(node.rotation.y, facing.current, 1 - Math.exp(-dt * 12));
    } else {
      moving.current = false;
    }

    positionRef.current.copy(node.position);

    let nearest: ZoneId | null = null;
    let nearestDistance = INTERACT_RADIUS;
    for (const zone of ZONE_VISUALS) {
      const distance = Math.hypot(
        node.position.x - zone.position[0],
        node.position.z - zone.position[1],
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = zone.id;
      }
    }
    if (nearest !== lastNear.current) {
      lastNear.current = nearest;
      onNearChange(nearest);
    }

    // La cámara se calcula aquí para no duplicar el cálculo por frame.
    const camera = state.camera;
    const desiredX = node.position.x * 0.85;
    const desiredZ = node.position.z * 0.85 + 17;
    if (reduceMotion) {
      camera.position.set(desiredX, 21, desiredZ);
    } else {
      camera.position.x += (desiredX - camera.position.x) * Math.min(1, dt * 3);
      camera.position.y += (21 - camera.position.y) * Math.min(1, dt * 3);
      camera.position.z += (desiredZ - camera.position.z) * Math.min(1, dt * 3);
    }
    camera.lookAt(node.position.x, 1.2, node.position.z);
  });

  return (
    <group ref={group} position={[0, 0, 7]}>
      <Ajolote movingRef={moving} reduceMotion={reduceMotion} />
    </group>
  );
}

/* ─── Entrada del mundo ─────────────────────────────────────── */

export function World({ lessons, nearZone, onNearChange, onEnterZone, paused, reduceMotion }: WorldProps) {
  const nearRef = useRef<ZoneId | null>(nearZone);
  nearRef.current = nearZone;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputState.keys.up = true;
          event.preventDefault();
          break;
        case 's':
        case 'arrowdown':
          inputState.keys.down = true;
          event.preventDefault();
          break;
        case 'a':
        case 'arrowleft':
          inputState.keys.left = true;
          event.preventDefault();
          break;
        case 'd':
        case 'arrowright':
          inputState.keys.right = true;
          event.preventDefault();
          break;
        case 'e':
          if (nearRef.current) onEnterZone(nearRef.current);
          break;
        default:
          break;
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputState.keys.up = false;
          break;
        case 's':
        case 'arrowdown':
          inputState.keys.down = false;
          break;
        case 'a':
        case 'arrowleft':
          inputState.keys.left = false;
          break;
        case 'd':
        case 'arrowright':
          inputState.keys.right = false;
          break;
        default:
          break;
      }
    }

    function onBlur() {
      resetInput();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [onEnterZone]);

  useEffect(() => {
    if (paused) resetInput();
  }, [paused]);

  return (
    <div className="canvas-wrap">
      <Canvas
        camera={{ position: [0, 21, 24], fov: 45, near: 0.1, far: 220 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-label="Isla 3D de SQLQuest"
        role="img"
      >
        <color attach="background" args={['#bfe9ff']} />
        <fog attach="fog" args={['#bfe9ff', 55, 110]} />
        <hemisphereLight args={['#ffffff', '#8fbf8f', 0.9]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[14, 26, 10]} intensity={1.35} />

        <Island />

        {ZONE_VISUALS.map((zone) => (
          <ZoneBuilding
            key={zone.id}
            zone={zone}
            status={statusFor(lessons, zone)}
            active={nearZone === zone.id}
            onEnter={() => onEnterZone(zone.id)}
          />
        ))}

        <Player paused={paused} reduceMotion={reduceMotion} onNearChange={onNearChange} />
      </Canvas>
    </div>
  );
}
