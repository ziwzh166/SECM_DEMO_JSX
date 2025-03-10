import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import p5 from 'p5';

const Images = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const canvasRef = useRef(null);

  // Vanta background effect
  useEffect(() => {
    let effect = null;

    const initVanta = () => {
      if (!vantaRef.current || !THREE) return;

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
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        if (effect) {
          effect.resize();
          effect.needsUpdate = true;
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(initVanta, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      if (effect) effect.destroy();
    };
  }, []);

  const createCircleMatrix = () => {
    const size = 8;
    const centerX = size / 2 - 0.5;
    const centerY = size / 2 - 0.5;
    const radius = 2;

    return Array(size).fill().map((_, y) =>
      Array(size).fill().map((_, x) => {
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) +
          Math.pow(y - centerY, 2)
        );
        return distance <= radius ? 255 : 0;
      })
    );
  };

  // Initialize matrix with circle pattern
  const [matrix, setMatrix] = useState(createCircleMatrix());

  // Update canvas when matrix changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(8, 8);

    // Convert matrix values to image data
    matrix.forEach((row, i) => {
      row.forEach((value, j) => {
        const idx = (i * 8 + j) * 4;
        imageData.data[idx] = value;     // R
        imageData.data[idx + 1] = value; // G
        imageData.data[idx + 2] = value; // B
        imageData.data[idx + 3] = 255;   // A
      });
    });

    ctx.putImageData(imageData, 0, 0);
  }, [matrix]);

  // Handle matrix value changes
  const handleValueChange = (row, col, value) => {
    const newMatrix = matrix.map((r, i) =>
      r.map((v, j) => (i === row && j === col) ?
        Math.max(0, Math.min(255, parseInt(value) || 0)) : v
      )
    );
    setMatrix(newMatrix);
  };

  return (
    <section className="w-full min-h-screen relative">
      {/* Background */}
      <div
        ref={vantaRef}
        className="fixed inset-0 z-0"
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#091149",
          background: "linear-gradient(#091149, #091149)",
          transform: "translate3d(0,0,0)"
        }}
      />
      
      {/* Foreground content */}
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 space-y-6 mb-20">
            {/* Title */}
            <h1 className="text-4xl font-bold text-white text-center mb-8">
              What is an Image?
            </h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
            <p className="text-white text-lg leading-relaxed">
                An image is fundamentally a visual representation that <span className="font-bold">captures and conveys information</span>.
                In the scientific context, images serve as data rather than mere illustrations.
              </p>
              {/* Matrix & Canvas */}
              <div className="flex gap-8 justify-center items-start mt-8 mb-8">
                <div className="grid grid-cols-8 gap-1">
                  {matrix.map((row, i) => 
                    row.map((value, j) => (
                      <input
                        key={`${i}-${j}`}
                        type="number"
                        min="0"
                        max="255"
                        value={value}
                        onChange={(e) => handleValueChange(i, j, e.target.value)}
                        className="w-[50px] h-[34px] text-center bg-gray-800 text-white rounded"
                      />
                    ))
                  )}
                </div>

                {/* Image Display */}
                <div className="border border-white p-2">
                  <canvas
                    ref={canvasRef}
                    width="8"
                    height="8"
                    className="w-64 h-64 image-rendering-pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              <p className="text-white text-lg leading-relaxed">
                While conventional photography might focus on aesthetics, scientific imaging is all about
                gathering precise, quantifiable information about the subject under study.
              </p>

              <p className="text-white text-lg leading-relaxed">
                Let's take <span className="font-bold">Scanning Electron Microscopy (SEM)</span> as an example.
                Below is a SEM image of a bee's head, this image cannot be taken by a regular camera. If you link the matrix image example to the SEM image, you can imagine the SEM image is a matrix of numbers, and each number represents the intensity of the electron signal at that point.
              </p>

              {/* Add SEM illustration */}
              <div className="flex flex-col items-center mt-8">
                <img
                  src="/SEM_Bee.gif"
                  alt="SEM Working Principle"
                  className="max-w-md rounded-lg shadow-lg border-2 border-white border-opacity-20"
                />
                <p className="mt-2 text-sm text-white">
                  Image source: <a href="https://murry-gans.blogspot.com/2012/08/a-lone-drone-bee.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Murry Gans Blog</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Images;