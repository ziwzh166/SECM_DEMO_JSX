import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import p5 from 'p5';

const SignalVisualizer = () => {
  const canvasRef = useRef(null);
  const [concentration, setConcentration] = useState(50);
  const particlesRef = useRef([]);
  const signalDecayRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Spawn particles at the bottom, moving upward
  const createParticle = (canvas) => ({
    x: Math.random() * canvas.width, 
    y: canvas.height + 10, // start slightly below canvas
    vx: (Math.random() - 0.5) * 2, // small horizontal drift
    vy: -3, // move upward
    radius: 3,
    hasCollided: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear if concentration changes
    particlesRef.current = [];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw electrode near top
      const electrodeY = 20;
      const electrodeHeight = 10;
      const electrodeX = canvas.width / 2 - 30;
      const electrodeWidth = 60;

      ctx.beginPath();
      ctx.rect(electrodeX, electrodeY, electrodeWidth, electrodeHeight);
      ctx.fillStyle = '#FFD700';
      ctx.fill();

      // Generate particles (bottom to top)
      if (concentration > 0 && Math.random() < (concentration / 1000) * 3) {
        particlesRef.current.push(createParticle(canvas));
      }

      let collisionCount = 0;
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Collision check: if particle goes into electrode zone near top
        if (
          !p.hasCollided &&
          p.y <= electrodeY + electrodeHeight && // top collision
          p.x >= electrodeX &&
          p.x <= electrodeX + electrodeWidth
        ) {
          collisionCount += 2;
          return false; // remove particle
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4169E1';
        ctx.fill();

        // Filter out if it goes above the canvas
        return p.y + p.radius > 0;
      });

      // Signal logic
      if (collisionCount > 0) {
        signalDecayRef.current = 200;
      }
      if (signalDecayRef.current > 0) {
        signalDecayRef.current -= 2; 
      }

      // Draw signal
      const signalHeight = (signalDecayRef.current / 200) * 150;
      ctx.fillStyle = '#32CD32';
      ctx.fillRect(canvas.width - 40, canvas.height - signalHeight, 20, signalHeight);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particlesRef.current = [];
      signalDecayRef.current = 0;
    };
  }, [concentration]);

  return (
    <div className="mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6">
      <div className="flex items-start gap-8">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="bg-gray-900 rounded-lg"
        />
        {/* Legend */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-white font-bold mb-4">Legend</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFD700]"></div>
              <span className="text-white">Electrode (top)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#4169E1]"></div>
              <span className="text-white">Particles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#32CD32]"></div>
              <span className="text-white">Signal</span>
            </div>
          </div>
        </div>
      </div>
      {/* Concentration input */}
      <div className="flex items-center gap-4 mt-4">
        <span className="text-white">Concentration:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={concentration}
          onChange={(e) => setConcentration(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-white">{concentration}%</span>
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
        })

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
            <h2 className="text-2xl font-semibold mb-4">Electrochemical Detection </h2>
            <p className="text-lg">
              Most modern sensors rely on electrochemical principles. When chemicals react at an electrode surface,
              they produce measurable electrical signals that are proportional to their concentration.
            </p>
          </div>

          {/* Signal Response Section with Animation */}
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Signal Response</h2>
            <SignalVisualizer />
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