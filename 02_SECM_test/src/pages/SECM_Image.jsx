import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import p5 from 'p5';

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
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        const distanceFromCenter = calculateDistance(particle.x, particle.y, centerX, centerY);
        const maxDistance = circleRadius * 3;
        
        particle.alpha *= distanceFromCenter > maxDistance ? 0.97 : particle.distanceDecay;
    
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const attraction = 0.005;
        particle.vx += dx * attraction;
        particle.vy += dy * attraction;
    
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
        const numParticles = Math.max(1, Math.floor(catalystWidth / 20));
        
        for (let i = 0; i < numParticles; i++) {
          const position = i / (numParticles - 1 || 1);
          const x = centerX - (catalystWidth / 2) + (catalystWidth * position);
          const randomOffset = (Math.random() - 0.5) * 4;
          
          particlesRef2.current.push(createParticle(
            x + randomOffset,
            canvas2.height - catalystLayerHeight,
            (Math.random() - 0.5) * 2,
            -Math.random() * 4 - 2
          ));
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
            Electrochemistry
          </h1>

          {/* Introduction Section */}
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Electrochemical Sensors</h2>
            <p className="text-lg">
              Most modern sensors rely on electrochemical principles. When chemicals react at an electrode surface,
              they produce measurable electrical signals that are proportional to their concentration.
            </p>
          </div>

          {/* Combined Visualizer Section */}
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Combined Visualizer</h2>
            <CombinedVisualizer />
            <p className="text-lg mt-4">
              The relationship between chemical concentration and signal is often linear:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Higher concentration → Stronger signal</li>
              <li>Lower concentration → Weaker signal</li>
              <li>Zero concentration → Background signal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Echem;