import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import p5 from 'p5';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const ElectrodeViewer = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Main scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(600, 300);
    renderer.setClearColor(0x1a1a1a);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Circular catalyst
    const catalystRadius = 5;
    const circleGeometry = new THREE.CircleGeometry(catalystRadius, 64);
    const catalystMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const catalyst = new THREE.Mesh(circleGeometry, catalystMaterial);
    catalyst.rotation.x = -Math.PI / 2;
    scene.add(catalyst);

    // Particles setup
    const particles = new THREE.Group();
    scene.add(particles);

    const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4287f5,
      emissive: 0x4287f5,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8
    });

    // Create particles with upward velocity
    for (let i = 0; i < 30; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());

      // Random XZ position
      particle.position.set(
        (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 8
      );

      // Give each particle an upward velocity
      particle.userData = {
        velocity: new THREE.Vector3(
          0,
          Math.random() * 0.02 + 0.01,
          0
        )
      };

      particles.add(particle);
    }
    function createParticle(geometry, material) {
      const particle = new THREE.Mesh(geometry, material.clone());
      particle.position.set(
        (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 8
      );
      particle.userData = {
        velocity: new THREE.Vector3(0, Math.random() * 0.02 + 0.01, 0),
      };
      return particle;
    }

    // Gold electrode
    const coneGeometry = new THREE.ConeGeometry(0.3, 1.5, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      roughness: 0.1,
      metalness: 1.0,
      emissive: 0xFFD700,
      emissiveIntensity: 0.2
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 2;
    cone.rotation.x = Math.PI;
    scene.add(cone);

    camera.position.set(6, 4, 6);
    camera.lookAt(0, 0, 0);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Corner axes
    // Create a helper to generate sprite labels
    function makeAxisLabel(text, color = '#ffffff') {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, size / 2, size / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: false });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.5, 0.5); // Adjust label size
      return sprite;
    }
    const axesScene = new THREE.Scene();
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.scale.set(0.5, 0.5, 0.5);
    // Add the labels after creating axesHelper in the axesScene
    const xLabel = makeAxisLabel('X', '#ff0000');


    const yLabel = makeAxisLabel('Y', '#00ff00');


    const zLabel = makeAxisLabel('Z', '#0000ff');
    xLabel.position.set(0, 0, 1.2);
    yLabel.position.set(1.2, 0, 0);
    zLabel.position.set(0, 1.2, 0);
    axesScene.add(axesHelper);
    axesScene.add(xLabel, yLabel, zLabel);

    const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    axesCamera.position.set(4, 4, 4);

    const axesRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    axesRenderer.setSize(150, 150);
    axesRenderer.setClearColor(0x000000, 0);
    axesRenderer.domElement.style.position = 'absolute';
    axesRenderer.domElement.style.top = '20px';
    axesRenderer.domElement.style.right = '20px';
    mountRef.current.appendChild(axesRenderer.domElement);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      // Randomly create new particles
      if (Math.random() < 0.1) {
        particles.add(createParticle(particleGeometry, particleMaterial));
      }
      // Update existing particles, remove the ones that go too high
      particles.children.forEach((particle) => {
        particle.position.add(particle.userData.velocity);
      });
      particles.children = particles.children.filter(
        (p) => p.position.y < 10 // remove if it moves above y=10
      );

      // Let OrbitControls update the main camera
      controls.update();

      // Render main scene
      renderer.render(scene, camera);

      // Sync axes camera with main camera
      axesCamera.position.copy(camera.position).normalize().multiplyScalar(4);
      axesCamera.quaternion.copy(camera.quaternion);
      axesCamera.updateProjectionMatrix();

      // Render axes scene
      axesRenderer.render(axesScene, axesCamera);
    };

    animate();

    // Clean up
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      mountRef.current.removeChild(axesRenderer.domElement);
    };
  }, []);

  return (
    <div className="relative flex items-start">
      <div className="bg-gray-800 p-4 rounded-lg mr-4 w-48">
        <h3 className="text-white text-sm font-semibold mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#FFD700' }}></div>
            <span className="text-white text-s ml-2">Detection Electrode</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#808080' }}></div>
            <span className="text-white text-s ml-2">Catalytic Layer</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#4287f5' }}></div>
            <span className="text-white text-s ml-2">Catalytic Products</span>
          </div>
        </div>
      </div>
      <div
        ref={mountRef}
        className="bg-gray-900 rounded-lg"
        style={{ width: 600, height: 300 }}
      />
    </div>
  );
};
const CombinedVisualizer = () => {
  const electrodeXRef = useRef(0);
  const electrodeYRef = useRef(0);
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const canvasRef3 = useRef(null);
  const canvasRef4 = useRef(null);
  const particlesRef1 = useRef([]);
  const particlesRef2 = useRef([]);
  const signalDecayRef = useRef(0);
  const animationFrameRef = useRef(null);
  const signalDataRef = useRef([]);
  const imageDataRef = useRef([]);
  const lastParticleTimeRef = useRef(0);

  const createParticle = (x, y, vx, vy) => ({
    x,
    y,
    vx,
    vy,
    radius: Math.random() * 2 + 1,
    alpha: 1,
    distanceDecay: 0.995
  });

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const calculateCatalystWidth = (electrodeY, centerY, circleRadius) => {
    const distance = Math.abs(electrodeY - centerY);
    const maxWidth = circleRadius * 2;
    const sigma = circleRadius / 2;
    return maxWidth * Math.exp(-(distance * distance) / (2 * sigma * sigma));
  };

  useEffect(() => {
    const canvas1 = canvasRef1.current;
    const ctx1 = canvas1.getContext('2d');
    const canvas2 = canvasRef2.current;
    const ctx2 = canvas2.getContext('2d');
    const canvas3 = canvasRef3.current;
    const ctx3 = canvas3.getContext('2d');
    const canvas4 = canvasRef4.current;
    const ctx4 = canvas4.getContext('2d');

    const animate = () => {
      // Clear canvases
      ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
      // Don't clear ctx4 to maintain persistence

      const centerX = canvas1.width / 2;
      const centerY = canvas1.height / 2;
      const circleRadius = 50;

      // Draw catalyst circle in figure 1
      ctx1.beginPath();
      ctx1.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx1.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx1.fill();

      // Generate particles for figure 1
      if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5;
        particlesRef1.current.push(createParticle(
          centerX + Math.cos(angle) * circleRadius,
          centerY + Math.sin(angle) * circleRadius,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        ));
      }

      // Update and draw particles in figure 1
      particlesRef1.current = particlesRef1.current.filter(particle => {
        // Add random diffusion
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Calculate distance from center
        const distanceFromCenter = calculateDistance(particle.x, particle.y, centerX, centerY);
        const maxDistance = circleRadius * 3;

        // Fade out based on distance
        particle.alpha *= distanceFromCenter > maxDistance ? 0.97 : particle.distanceDecay;

        // Limit maximum velocity
        const maxVelocity = 2;
        const currentVelocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentVelocity > maxVelocity) {
          particle.vx = (particle.vx / currentVelocity) * maxVelocity;
          particle.vy = (particle.vy / currentVelocity) * maxVelocity;
        }

        // Weak attraction to center only when far away
        if (distanceFromCenter > circleRadius * 2) {
          const dx = centerX - particle.x;
          const dy = centerY - particle.y;
          const attraction = 0.001; // Reduced attraction strength
          particle.vx += dx * attraction;
          particle.vy += dy * attraction;
        }

        // Add drag force
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Draw particle
        ctx1.beginPath();
        ctx1.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx1.fillStyle = `rgba(100, 200, 255, ${particle.alpha})`;
        ctx1.fill();

        return particle.alpha > 0.01;
      });

      // Update electrode position
      electrodeXRef.current += 2;
      if (electrodeXRef.current >= canvas1.width) {
        electrodeXRef.current = 0;
        electrodeYRef.current += 10;
        if (electrodeYRef.current >= canvas1.height) {
          electrodeYRef.current = 0;
          imageDataRef.current = [];
        }
        signalDataRef.current = [];
      }

      // Draw electrodes
      const electrodeWidth = 60;
      const electrodeHeight = 10;
      const electrodeY = canvas2.height - 40;

      // Draw electrode in figure 1
      ctx1.beginPath();
      ctx1.rect(electrodeXRef.current - electrodeWidth / 2, electrodeYRef.current, electrodeWidth, electrodeHeight);
      ctx1.fillStyle = '#FFD700';
      ctx1.fill();

      // Draw electrode in figure 2
      ctx2.beginPath();
      ctx2.rect(electrodeXRef.current - electrodeWidth / 2, electrodeY, electrodeWidth, electrodeHeight);
      ctx2.fillStyle = '#FFD700';
      ctx2.fill();

      // Calculate and draw catalyst in figure 2
      const catalystWidth = calculateCatalystWidth(electrodeYRef.current, centerY, circleRadius);
      const catalystLayerHeight = 5;

      ctx2.beginPath();
      ctx2.rect(centerX - catalystWidth / 2, canvas2.height - catalystLayerHeight, catalystWidth, catalystLayerHeight);
      ctx2.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx2.fill();

      // Generate evenly distributed particles in figure 2
      const now = Date.now();
      const particleInterval = 50;

      if (now - lastParticleTimeRef.current > particleInterval && catalystWidth > 1) {
        lastParticleTimeRef.current = now;

        // Scale number of particles with catalyst width
        const numParticles = Math.max(1, Math.floor(catalystWidth / 10)); // More particles for wider catalyst

        // Catalyst dimensions
        const catalystLeft = centerX - catalystWidth / 2;
        const catalystRight = centerX + catalystWidth / 2;
        const catalystTop = canvas2.height - catalystLayerHeight;
        const catalystBottom = canvas2.height;

        for (let i = 0; i < numParticles; i++) {
          // Random position within catalyst area
          const x = catalystLeft + Math.random() * catalystWidth;
          const y = catalystTop + Math.random() * catalystLayerHeight;

          // Velocity pointing upward with some spread
          const vx = (Math.random() - 0.5) * 2;
          const vy = -Math.random() * 4 - 2;

          particlesRef2.current.push(createParticle(x, y, vx, vy));
        }
      }

      // Update particles and check collisions in figure 2
      let collisionCount = 0;
      particlesRef2.current = particlesRef2.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (!p.hasCollided &&
          p.y <= electrodeY + electrodeHeight &&
          p.x >= electrodeXRef.current - electrodeWidth / 2 &&
          p.x <= electrodeXRef.current + electrodeWidth / 2) {
          collisionCount += 15;
          return false;
        }

        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx2.fillStyle = '#4169E1';
        ctx2.fill();

        return p.y + p.radius > 0;
      });

      // Process signal with faster decay
      if (collisionCount > 0) {
        signalDecayRef.current = Math.min(200, signalDecayRef.current + collisionCount);
      } else {
        signalDecayRef.current = Math.max(0, signalDecayRef.current - 10);
      }

      // Draw real-time signal indicator
      const signalHeight = (signalDecayRef.current / 200) * 150;
      ctx2.fillStyle = '#32CD32';
      ctx2.fillRect(canvas2.width - 40, canvas2.height - signalHeight, 20, signalHeight);

      // Store signal data
      if (signalDecayRef.current > 0) {
        const dataPoint = {
          x: electrodeXRef.current,
          y: electrodeYRef.current,
          signal: signalDecayRef.current
        };
        signalDataRef.current.push(dataPoint);
        imageDataRef.current.push(dataPoint);
      }

      // Draw signal plot axes
      ctx3.strokeStyle = 'white';
      ctx3.beginPath();
      ctx3.moveTo(50, canvas3.height - 30);
      ctx3.lineTo(canvas3.width - 30, canvas3.height - 30);
      ctx3.moveTo(50, canvas3.height - 30);
      ctx3.lineTo(50, 30);
      ctx3.stroke();

      // Plot current line data
      if (signalDataRef.current.length > 0) {
        ctx3.beginPath();
        ctx3.strokeStyle = '#32CD32';
        signalDataRef.current.forEach((point, i) => {
          const x = 50 + (point.x / 400) * (canvas3.width - 80);
          const y = (canvas3.height - 30) - (point.signal / 200) * (canvas3.height - 60);
          if (i === 0) ctx3.moveTo(x, y);
          else ctx3.lineTo(x, y);
        });
        ctx3.stroke();
      }

      // Update 2D image with enhanced contrast
      const imageData = ctx4.createImageData(canvas4.width, canvas4.height);
      imageDataRef.current.forEach(point => {
        const x = Math.floor((point.x / 400) * canvas4.width);
        const y = Math.floor((point.y / 200) * canvas4.height);
        const index = (y * canvas4.width + x) * 4;
        const intensity = Math.log(point.signal + 1) * 30;
        imageData.data[index] = intensity * 0.25;
        imageData.data[index + 1] = intensity;
        imageData.data[index + 2] = intensity * 0.25;
        imageData.data[index + 3] = 255;
      });
      ctx4.putImageData(imageData, 0, 0);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6">
      <div className="grid grid-cols-2 gap-8">
        <div className="w-full">
          <h3 className="text-white mb-2">Catalyst Layer (XY view)</h3>
          <canvas
            ref={canvasRef1}
            width={400}
            height={200}
            className="bg-gray-900 rounded-lg w-full"
          />
        </div>
        <div className="w-full">
          <h3 className="text-white mb-2">Electrode Movement (XZ view)</h3>
          <canvas
            ref={canvasRef2}
            width={400}
            height={200}
            className="bg-gray-900 rounded-lg w-full"
          />
        </div>
        <div className="w-full">
          <h3 className="text-white mb-2">Signal vs Position</h3>
          <canvas
            ref={canvasRef3}
            width={400}
            height={200}
            className="bg-gray-900 rounded-lg w-full"
          />
        </div>
        <div className="w-full">
          <h3 className="text-white mb-2">2D Signal Image</h3>
          <canvas
            ref={canvasRef4}
            width={400}
            height={200}
            className="bg-gray-900 rounded-lg w-full"
          />
        </div>
      </div>
    </div>
  );
};

const Echem = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const vantaRef = useRef(null);

  useEffect(() => {
    let effect = null;

    const initVanta = async () => {
      if (!vantaRef.current || !THREE) return;

      try {
        effect = TOPOLOGY({
          el: vantaRef.current,
          p5: p5,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: window.innerHeight,
          minWidth: window.innerWidth,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x526681,
          backgroundColor: 0x091149
        });

        setVantaEffect(effect);
      } catch (error) {
        console.error('Failed to initialize Vanta effect:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initVanta();

    return () => {
      if (effect) {
        effect.destroy();
      }
    };
  }, []);

  return (
    <div ref={vantaRef} className="min-h-screen w-full overflow-x-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 min-h-screen">
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 space-y-12 mb-20">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Combined them all: SECM
          </h1>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-white" >3D View Orientation</h3>
            <ElectrodeViewer />
          </div>
          {/* Introduction Section */}
          {/* <div className="text-white space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Electrochemical Sensors</h2>
            <p className="text-lg">
              Most modern sensors rely on electrochemical principles. When chemicals react at an electrode surface,
              they produce measurable electrical signals that are proportional to their concentration.
            </p>
          </div> */}

          {/* Combined Visualizer Section */}
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Combined Visualizer</h2>
            <CombinedVisualizer />
            <div className="text-lg mt-4 space-y-4">
              <h3 className="font-bold">SECM Signal Generation Logic:</h3>

              <div className="space-y-2">
                <h4 className="font-semibold">1. Electrode Movement:</h4>
                <ul className="list-disc pl-6">
                  <li>Electrode scans across surface in raster pattern</li>
                  <li>Movement: left to right, top to bottom</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">2. Catalytic Interaction:</h4>
                <ul className="list-disc pl-6">
                  <li>Higher product concentration above catalytic surface</li>
                  <li>Products detected when electrode passes over active areas</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">3. Signal Generation:</h4>
                <ul className="list-disc pl-6">
                  <li>Signal amplitude proportional to local product concentration</li>
                  <li>Longer exposure to catalytic area = extended high-signal region</li>
                  <li>Creates characteristic 2D signal map showing catalytic activity</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">4. Resolution Factors:</h4>
                <ul className="list-disc pl-6">
                  <li>Electrode scan rate affects signal resolution</li>
                  <li>Distance from surface influences signal strength</li>
                  <li>Product diffusion impacts spatial resolution</li>
                </ul>
              </div>
              {/* Add new Learn More section */}
              <div className="space-y-2 mt-6">
                <h4 className="font-semibold">Learn More:</h4>
                <ul className="list-disc pl-6">
                  <li>
                    <a
                      href="https://www.chinstruments.com/chi900.shtml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Commercial SECM Instrument Details
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://pubs.acs.org/doi/10.1021/acs.chemrev.6b00067"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Comprehensive SECM Review Article
                    </a>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Echem;