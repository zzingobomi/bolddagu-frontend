import { BufferGeometry, Mesh, BatchedMesh } from 'three'
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
  computeBatchedBoundsTree,
  disposeBatchedBoundsTree,
} from 'three-mesh-bvh'

const initBVH = () => {
  BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
  BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree

  Mesh.prototype.raycast = acceleratedRaycast

  BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree
  BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree
  BatchedMesh.prototype.raycast = acceleratedRaycast
}

export default initBVH
