import {useState, Suspense, useRef, useEffect} from 'react';
import { Canvas } from '@react-three/fiber';
import  Loader  from '../components/Loader';
import * as THREE from 'three';
import WAVES from 'vanta/dist/vanta.waves.min';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import p5 from 'p5';

const Home = () => {
  const [isRotating, setIsRotating] = useState(false);
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        TOPOLOGY({
          el: vantaRef.current,
          p5: p5,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x526681,
          backgroundColor: 0x091149
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  
  const adjustIslandForScreenSize = () => {
    let screenScale=null, screenPosition;
    let rotation = [0.1,4.7,0];
    if (window.innerWidth < 768) {
      screenScale = [0.9,0.9,0.9];
      screenPosition = [0,-6.5,-43];
  }
  else{
    screenScale = [1,1,1];
    screenPosition = [0,-6.5,-43];
  }
  return {screenScale, screenPosition, rotation};
  }
  
  const adjustPlaneForScreenSize = () => {
    let screenScale=null, screenPosition=null;
    if (window.innerWidth < 768) {
      screenScale = [1.5,1.5,1.5];
      screenPosition = [0,-1.5,0];
  }
  else{
    screenScale = [3,3,3];
    screenPosition = [0,-4,-4];
  }
  return [screenScale, screenPosition, rotation];
  }

  const {screenScale, screenPosition,rotation} = adjustIslandForScreenSize();
  const [planeScreenScale, planeScreenPosition] = adjustPlaneForScreenSize();

  return (
    <section className='w-full h-screen relative'>
      <div ref={vantaRef} className="absolute inset-0 z-0 pointer-events-none"/>
      
      {/* Add title */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-4xl font-bold text-white text-center justify-center flex   p-2">
          Catalytical Image through Electrochemical Microscopy
        </h1>
      </div>
      
      <div className="relative z-10">
        <Canvas 
          className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`}
          camera={{ near: 0.1, far: 1000 }}
        >
          <Suspense fallback={<Loader />}>
            {/* ...existing 3D elements... */}
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
};

export default Home