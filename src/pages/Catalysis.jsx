import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import p5 from 'p5';
import { GiChemicalDrop, GiMolecule, GiSparkles } from 'react-icons/gi';

const Catalysis = () => {
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
    const [progressNoCatalyst, setProgressNoCatalyst] = useState(0);
    const [progressWithCatalyst, setProgressWithCatalyst] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);
    // When both progress bars reach 100%, mark as finished
    useEffect(() => {
        if (progressNoCatalyst >= 100 && progressWithCatalyst >= 100) {
            setIsAnimating(false);
            setHasFinished(true);
        }
    }, [progressNoCatalyst, progressWithCatalyst]);

    // Start reaction
    const handleStart = () => {
        setProgressNoCatalyst(0);
        setProgressWithCatalyst(0);
        setHasFinished(false);
        setIsAnimating(true);
    };

    useEffect(() => {
        if (!isAnimating) return;
        const intervalNoCat = setInterval(() => {
          setProgressNoCatalyst(prev => Math.min(prev + 1, 100));
        }, 200); // slower increment
      
        const intervalWithCat = setInterval(() => {
          setProgressWithCatalyst(prev => Math.min(prev + 2, 100));
        }, 200);
      
        return () => {
          clearInterval(intervalNoCat);
          clearInterval(intervalWithCat);
        };
      }, [isAnimating]);

    const canvasRef = useRef(null);
    const particles = useRef([]);

    const createParticle = (x, y) => ({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 1,
        alpha: 1
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const circleRadius = 30;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw central circle (catalyst surface)
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();

            // Add new particles
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                particles.current.push(createParticle(
                    centerX + Math.cos(angle) * circleRadius,
                    centerY + Math.sin(angle) * circleRadius
                ));
            }

            // Update and draw particles
            particles.current = particles.current.filter(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha *= 0.99;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 200, 255, ${particle.alpha})`;
                ctx.fill();

                return particle.alpha > 0.01;
            });

            requestAnimationFrame(animate);
        };

        animate();
    }, []);
    return (
        <div ref={vantaRef} className="min-h-screen w-full overflow-x-hidden">
            <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 min-h-screen">
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 space-y-12 mb-20">
                    <h1 className="text-4xl font-bold text-white text-center mb-8">
                        Catalysis
                    </h1>

                    {/* Button to start animation */}
                    <button
                        onClick={handleStart}
                        disabled={isAnimating || hasFinished}
                        className={
                            isAnimating || hasFinished
                                ? 'mx-auto block px-4 py-2 bg-gray-400 text-white rounded'
                                : 'mx-auto block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                        }
                    >
                        Start Reaction
                    </button>

                    {/* Progress Bar Without Catalyst */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-white">
                            <span className="flex items-center gap-2">
                                <GiChemicalDrop className="text-2xl" />
                                Raw Materials
                            </span>
                            <span>⚡ Energy</span>
                            <span className="flex items-center gap-2">
                                Products
                                <GiMolecule className="text-2xl" />
                            </span>
                        </div>
                        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-blue-500 transition-[width] duration-500"
                                style={{ width: `${progressNoCatalyst}%` }}
                            >
                                <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    {Math.round(progressNoCatalyst)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar With Catalyst */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-white">
                            <span className="flex items-center gap-2">
                                <GiChemicalDrop className="text-2xl" />
                                Raw Materials
                            </span>
                            <div className="flex items-center gap-2">
                                <span>⚡ Energy</span>
                                <span className="bg-yellow-500 px-2 py-1 rounded flex items-center gap-1">
                                    <GiSparkles className="text-xl" />
                                    Catalyst
                                </span>
                            </div>
                            <span className="flex items-center gap-2">
                                Products
                                <GiMolecule className="text-2xl" />
                            </span>
                        </div>
                        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500 transition-[width] duration-500"
                                style={{ width: `${progressWithCatalyst}%` }}
                            >
                                <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                    {Math.round(progressWithCatalyst)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Add description text */}
                    <div className="space-y-4 text-white">
                        <p className="text-lg leading-relaxed">
                            A <span className="font-bold">catalyst</span> is a substance that speeds up chemical reactions by providing an alternative pathway with lower energy requirements, while remaining unchanged in the process.
                        </p>
                        <p className="text-lg leading-relaxed">
                            With identical raw materials and energy input, catalyzed reactions proceed more efficiently and rapidly to yield the desired products. This approach is both sustainable and economically advantageous in industrial processes.
                        </p>
                    </div>

                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 space-y-12 mb-20">
                    <h3 className="text-white text-xl mb-4">Challenging observation :</h3>
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className="bg-cyan-800 rounded-lg mx-auto"
                    />
                    {/* Legend */}
                    <div className="bg-gray-900 p-4 rounded-lg text-white">
                        <h4 className="text-sm font-bold mb-2">Legend:</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-white opacity-50"></div>
                                <span className="text-sm">Catalyst Covered Surface</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4  bg-cyan-800"></div>
                                <span className="text-sm">Uncovered surface</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 "></div>
                                <span className="text-sm pl-[8px]"> Diffusing Products</span>
                            </div>

                        </div>
                    </div>
                    <div className="space-y-4 text-white">
                        <p className="text-lg leading-relaxed">
                            In the illustration above, a catalyst is applied to a surface to accelerate a chemical reaction. The catalyst interacts with the raw materials to facilitate the formation of products, which then diffuse away from the surface. It's hard to collect the all the products to evaluate the catalysts performance.
                        </p>

                    </div>
                </div>
            </div>
        </div>


    );
};

export default Catalysis;