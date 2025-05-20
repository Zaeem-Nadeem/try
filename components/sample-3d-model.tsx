"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export function Sample3DModel({ className = "h-[300px]" }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 1, 1)
    scene.add(directionalLight)

    // Create a simple glasses model
    const frameGroup = new THREE.Group()

    // Frame
    const frameGeometry = new THREE.TorusGeometry(1, 0.1, 16, 100)
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 })

    // Left lens
    const leftLens = new THREE.Mesh(frameGeometry, frameMaterial)
    leftLens.position.set(-1.1, 0, 0)
    frameGroup.add(leftLens)

    // Right lens
    const rightLens = new THREE.Mesh(frameGeometry, frameMaterial)
    rightLens.position.set(1.1, 0, 0)
    frameGroup.add(rightLens)

    // Bridge
    const bridgeGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.1)
    const bridgeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 })
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial)
    frameGroup.add(bridge)

    // Temples (arms)
    const templeGeometry = new THREE.BoxGeometry(2, 0.05, 0.05)

    const leftTemple = new THREE.Mesh(templeGeometry, bridgeMaterial)
    leftTemple.position.set(-2.1, 0, 0)
    leftTemple.rotation.z = Math.PI / 8
    frameGroup.add(leftTemple)

    const rightTemple = new THREE.Mesh(templeGeometry, bridgeMaterial)
    rightTemple.position.set(2.1, 0, 0)
    rightTemple.rotation.z = -Math.PI / 8
    frameGroup.add(rightTemple)

    // Add to scene
    scene.add(frameGroup)

    // Scale and position
    frameGroup.scale.set(0.5, 0.5, 0.5)
    frameGroup.rotation.x = 0.2

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Slowly rotate the glasses
      frameGroup.rotation.y += 0.005

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }

      renderer.dispose()
      controls.dispose()
    }
  }, [])

  return <div ref={containerRef} className={`w-full ${className}`} />
}
