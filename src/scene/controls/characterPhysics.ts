import { Box3, BufferGeometry, DoubleSide, Line3, Mesh, Ray, Vector3, type Object3D } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshBVH } from 'three-mesh-bvh';

/**
 * Game-style first-person movement: a capsule pushed out of the model's
 * triangles (via a bounding-volume hierarchy, so it stays fast), with
 * gravity, acceleration and an invisible fence where the site ends.
 * Kept free of React so it can be tested headlessly.
 */

export const EYE_HEIGHT = 1.6;
const RADIUS = 0.3;
const WALK_SPEED = 2.6; // m/s
const RUN_SPEED = 5.2;
const ACCELERATION = 12; // how quickly velocity reaches the target speed (1/s)
const GRAVITY = -20; // m/s², a little strong so stairs feel planted
const MAX_FALL_CHECK = 8; // metres; no floor within this below = edge of the site
const SUBSTEPS = 5;

/** Merges every mesh under `root` (in world space) into one collision BVH. */
export function buildCollider(root: Object3D, include: (mesh: Mesh) => boolean): MeshBVH {
  root.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  root.traverse((o) => {
    if (!(o instanceof Mesh) || !include(o)) return;
    const g = new BufferGeometry();
    g.setAttribute('position', o.geometry.getAttribute('position').clone());
    if (o.geometry.index) g.setIndex(o.geometry.index.clone());
    g.applyMatrix4(o.matrixWorld);
    parts.push(g.index ? g.toNonIndexed() : g);
  });
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error('No collision geometry');
  return new MeshBVH(merged);
}

const tempBox = new Box3();
const tempSegment = new Line3();
const triPoint = new Vector3();
const capsulePoint = new Vector3();
const unresolved = new Vector3();
const correction = new Vector3();
const before = new Vector3();
const down = new Ray();

export interface MoveInput {
  /** Desired horizontal direction in world space; length 0..1. */
  wish: Vector3;
  running: boolean;
}

export class CharacterPhysics {
  /** Eye position. */
  readonly position = new Vector3();
  readonly velocity = new Vector3();
  grounded = false;
  private readonly segment = new Line3(new Vector3(), new Vector3());

  constructor(private readonly collider: MeshBVH) {}

  reset(eye: Vector3) {
    this.position.copy(eye);
    this.velocity.set(0, 0, 0);
    this.grounded = false;
  }

  /** Feet height (eye minus eye height). */
  get feetY() {
    return this.position.y - EYE_HEIGHT;
  }

  update(delta: number, input: MoveInput) {
    const dt = Math.min(delta, 0.1) / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) this.substep(dt, input);
  }

  private substep(dt: number, { wish, running }: MoveInput) {
    // Ease horizontal velocity towards the target for smooth starts and stops.
    const speed = running ? RUN_SPEED : WALK_SPEED;
    const blend = 1 - Math.exp(-ACCELERATION * dt);
    this.velocity.x += (wish.x * speed - this.velocity.x) * blend;
    this.velocity.z += (wish.z * speed - this.velocity.z) * blend;
    // When grounded, a small constant pull keeps the capsule on ramps and stairs.
    this.velocity.y = this.grounded ? GRAVITY * dt : this.velocity.y + GRAVITY * dt;

    before.copy(this.position);
    this.position.addScaledVector(this.velocity, dt);

    // Push out of the geometry; the correction tells us what we hit.
    unresolved.copy(this.position);
    this.collide();
    correction.subVectors(this.position, unresolved);
    this.grounded = correction.y > Math.abs(dt * this.velocity.y * 0.25);
    if (this.grounded) {
      this.velocity.y = 0;
    } else if (correction.lengthSq() > 0) {
      // Slide along whatever we hit instead of sticking to it.
      correction.normalize();
      this.velocity.addScaledVector(correction, -correction.dot(this.velocity));
    }

    // Fence: never walk out over a drop with no floor below (edge of the site).
    if (!this.floorBelow()) {
      this.position.x = before.x;
      this.position.z = before.z;
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
  }

  /** Capsule from just below the eye down to the feet. */
  private updateSegment() {
    this.segment.start.set(this.position.x, this.position.y - 0.1, this.position.z);
    this.segment.end.set(this.position.x, this.feetY + RADIUS, this.position.z);
  }

  private collide() {
    for (let iteration = 0; iteration < 3; iteration++) {
      this.updateSegment();
      tempBox.makeEmpty();
      tempBox.expandByPoint(this.segment.start);
      tempBox.expandByPoint(this.segment.end);
      tempBox.min.addScalar(-RADIUS);
      tempBox.max.addScalar(RADIUS);
      tempSegment.copy(this.segment);

      let pushed = false;
      this.collider.shapecast({
        intersectsBounds: (box) => box.intersectsBox(tempBox),
        intersectsTriangle: (tri) => {
          const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
          if (distance < RADIUS) {
            const depth = RADIUS - distance;
            const direction = capsulePoint.sub(triPoint).normalize();
            tempSegment.start.addScaledVector(direction, depth);
            tempSegment.end.addScaledVector(direction, depth);
            pushed = true;
          }
        },
      });
      if (!pushed) break;
      this.position.x += tempSegment.start.x - this.segment.start.x;
      this.position.y += tempSegment.start.y - this.segment.start.y;
      this.position.z += tempSegment.start.z - this.segment.start.z;
    }
  }

  private floorBelow() {
    down.origin.set(this.position.x, this.position.y, this.position.z);
    down.direction.set(0, -1, 0);
    const hit = this.collider.raycastFirst(down, DoubleSide);
    return hit !== null && hit.distance < EYE_HEIGHT + MAX_FALL_CHECK;
  }
}
