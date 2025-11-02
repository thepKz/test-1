// examples
// https://threejs.org/examples/?q=particle#webgl_points_billboards

let camera
let scene
let renderer
let material
let mouseX = 0
let mouseY = 0
let windowHalfX = window.innerWidth / 2
let windowHalfY = window.innerHeight / 2
let animationId = null

const onWindowResize = function () {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2

  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
window.iframe3ResizeHandler = onWindowResize

const onPointerMove = function (event) {
  mouseX = event.clientX - windowHalfX 
  mouseY = event.clientY - windowHalfY
}
window.iframe3PointerMoveHandler = onPointerMove

// Cleanup function
window.iframe3Cleanup = function() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  // Remove event listeners
  if (window.iframe3ResizeHandler) {
    window.removeEventListener('resize', window.iframe3ResizeHandler)
  }
  if (window.iframe3PointerMoveHandler) {
    document.body.removeEventListener('pointermove', window.iframe3PointerMoveHandler)
  }
  
  // Dispose Three.js resources
  if (renderer && scene) {
    scene.traverse((object) => {
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (mat.map) mat.map.dispose()
            mat.dispose()
          })
        } else {
          if (object.material.map) object.material.map.dispose()
          object.material.dispose()
        }
      }
      if (object.geometry) object.geometry.dispose()
    })
    
    while (scene.children.length > 0) {
      scene.remove(scene.children[0])
    }
    
    renderer.dispose()
    renderer = null
  }
  
  scene = null
  camera = null
  material = null
}

function init () {
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 5, 2000)
  camera.position.z = 500

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0000ff, 0.001)

  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const size = 2000

  for ( let i = 0; i < 20000; i ++ ) {
    const x = (Math.random() * size + Math.random() * size) / 2 - size / 2
    const y = (Math.random() * size + Math.random() * size) / 2 - size / 2
    const z = (Math.random() * size + Math.random() * size) / 2 - size / 2

    vertices.push(x, y, z)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  material = new THREE.PointsMaterial({
    size: 2,
    color: 0xffffff,
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  document.body.style.touchAction = 'none'
  document.body.addEventListener('pointermove', onPointerMove)
  window.addEventListener('resize', onWindowResize)
}

function animate () {
  animationId = requestAnimationFrame(animate)
  render()
}

function render () {
  if (!camera || !scene || !renderer) return
  
  camera.position.x += (mouseX * 2 - camera.position.x) * 0.02
  camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02
  camera.lookAt(scene.position)
  renderer.render(scene, camera)
  scene.rotation.x += 0.001
  scene.rotation.y += 0.002
}

init()
animate()
