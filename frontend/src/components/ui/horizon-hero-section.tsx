// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { motion } from 'framer-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const styles = `
.cosmos-style {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.hero-canvas {
  position: absolute; /* Fixed overlapping issue - was fixed */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

.side-menu {
  position: absolute; /* Keep absolute within sticky container */
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.menu-icon span {
  display: block;
  width: 24px;
  height: 2px;
  background: rgba(255, 255, 255, 0.7);
  transition: background 0.3s;
}

.menu-icon:hover span {
  background: #fff;
}

.vertical-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 0.5em;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.hero-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 15%;
  pointer-events: none;
}

/* Background overlay to make text pop against bright stars */
.text-backdrop {
  position: absolute;
  top: 50%;
  left: 10%;
  width: 80%;
  height: 60%;
  transform: translateY(-50%);
  background: radial-gradient(ellipse at left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%);
  z-index: -1;
  pointer-events: none;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  line-height: 1.1;
  margin: 0 0 2rem 0;
  overflow: hidden;
  display: flex;
  opacity: 1; /* For GSAP */
  text-shadow: 0 4px 24px rgba(0,0,0,0.9);
}

.title-char {
  display: inline-block;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.05em;
  line-height: 1.6;
  text-shadow: 0 2px 12px rgba(0,0,0,0.9);
}

.subtitle-line {
  margin: 0;
  overflow: hidden;
}

.scroll-progress {
  position: absolute;
  right: 40px;
  bottom: 40px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.scroll-text {
  writing-mode: vertical-rl;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.5);
}

.progress-track {
  width: 2px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
}

.section-counter {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 10px;
}

.scroll-sections {
  position: relative;
  z-index: 10;
}

.content-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 15%;
  pointer-events: none;
}
`;

export const HorizonHeroSection = ({ onCompleteAction }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const scrollProgressRef = useRef(null);
  const menuRef = useRef(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const inView = useRef(false); // Used to pause animation when out of view
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0); 
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;
  
  const threeRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null,
    targetCameraX: 0,
    targetCameraY: 30,
    targetCameraZ: 300,
    locations: []
  });

  // Setup Intersection Observer to fix lag
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize Three.js
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;
      
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      refs.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;

      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      refs.composer = new EffectComposer(refs.renderer);
      const renderPass = new RenderPass(refs.scene, refs.camera);
      refs.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8, // bloom strength
        0.4, // radius
        0.85 // threshold
      );
      refs.composer.addPass(bloomPass);

      createStarField();
      createNebula();
      createMountains();
      createMoon();
      createAtmosphere();
      getLocation();

      animate();
      
      setIsReady(true);
    };

    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;
      
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Matching Black Hole: Warm gold, orange, and white stars
          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) {
            color.setHSL(0.1, 0.2, 0.8 + Math.random() * 0.2);
          } else if (colorChoice < 0.9) {
            color.setHSL(0.08, 0.5, 0.8);
          } else {
            color.setHSL(0.12, 0.5, 0.8);
          }
          
          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;
            
            void main() {
              vColor = color;
              vec3 pos = position;
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const { current: refs } = threeRefs;
      
      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0xd9772b) }, // Warm gold/orange
          color2: { value: new THREE.Color(0x8c3d10) }, // Deep rust orange
          opacity: { value: 0.25 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      nebula.rotation.x = 0;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const { current: refs } = threeRefs;
      
      // Matching Black Hole: Deep warm blacks and grays instead of blue
      const layers = [
        { distance: -50, height: 60, color: 0x110e0c, opacity: 1 },
        { distance: -100, height: 80, color: 0x17110d, opacity: 0.9 },
        { distance: -150, height: 100, color: 0x241812, opacity: 0.7 },
        { distance: -200, height: 120, color: 0x332014, opacity: 0.5 }
      ];

      layers.forEach((layer, index) => {
        const points = [];
        const segments = 50;
        
        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y = Math.sin(i * 0.1) * layer.height + 
                   Math.sin(i * 0.05) * layer.height * 0.5 +
                   Math.random() * layer.height * 0.2 - 100;
          points.push(new THREE.Vector2(x, y));
        }
        
        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    const createMoon = () => {
      const { current: refs } = threeRefs;
      
      const geometry = new THREE.CircleGeometry(120, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      });
      
      const moon = new THREE.Mesh(geometry, material);
      // Place it far back, right at the horizon line
      moon.position.set(0, -50, -300);
      refs.scene.add(moon);
      refs.moon = moon;
      
      // Add a glow/halo behind it
      const glowGeo = new THREE.CircleGeometry(160, 64);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffeedd,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, -50, -301);
      refs.scene.add(glow);
      refs.moonGlow = glow;
    };

    const createAtmosphere = () => {
      const { current: refs } = threeRefs;
      
      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;
          
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            // Matching Black Hole: Orange/warm atmosphere glow
            vec3 atmosphere = vec3(1.0, 0.5, 0.2) * intensity;
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;
            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
    };

    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);
      
      // Pause expensive rendering when out of view
      if (!inView.current) return;

      const time = Date.now() * 0.001;

      refs.stars.forEach((starField) => {
        if (starField.material.uniforms) {
          starField.material.uniforms.time.value = time;
        }
      });

      if (refs.nebula && refs.nebula.material.uniforms) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      if (refs.camera && refs.targetCameraX !== undefined) {
        const smoothingFactor = 0.05; 
        
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * smoothingFactor;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * smoothingFactor;
        
        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;
        
        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);

        // Scroll-linked animations using refs.scrollProgress if available
        const scrollY = refs.scrollProgress || 0;
        
        refs.mountains.forEach((mountain, i) => {
            const targetZ = (refs.locations?.[i] || mountain.userData.baseZ) + (scrollY * 150 * (i + 1));
            mountain.position.z += (targetZ - mountain.position.z) * 0.05;
        });

        // Moon rises gracefully
        if (refs.moon && refs.moonGlow) {
            const targetY = -50 + (scrollY * 120);
            refs.moon.position.y += (targetY - refs.moon.position.y) * 0.05;
            refs.moonGlow.position.y += (targetY - refs.moonGlow.position.y) * 0.05;
        }
      }

      if (refs.composer) {
        refs.composer.render();
      }
    };

    initThree();

    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      const { current: refs } = threeRefs;
      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }
      window.removeEventListener('resize', handleResize);

      refs.stars.forEach(starField => {
        starField.geometry.dispose();
        starField.material.dispose();
      });

      refs.mountains.forEach(mountain => {
        mountain.geometry.dispose();
        mountain.material.dispose();
      });

      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        refs.nebula.material.dispose();
      }

      if (refs.moon) {
        refs.moon.geometry.dispose();
        refs.moon.material.dispose();
        refs.moonGlow.geometry.dispose();
        refs.moonGlow.material.dispose();
      }

      if (refs.renderer) {
        refs.renderer.dispose();
      }
    };
  }, []);

  const getLocation = () => {
    const { current: refs } = threeRefs;
    const locations = [];
    refs.mountains.forEach( (mountain, i) => {
      locations[i] = mountain.position.z
    })
    refs.locations = locations
  }

  // GSAP Animations
  useEffect(() => {
    if (!isReady) return;
    
    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], {
      visibility: 'visible'
    });

    const tl = gsap.timeline();

    if (menuRef.current) {
      tl.from(menuRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }

    if (titleRef.current) {
      const titleChars = titleRef.current.querySelectorAll('.title-char');
      tl.from(titleChars, {
        y: 200,
        opacity: 0,
        duration: 1.5,
        stagger: 0.05,
        ease: "power4.out"
      }, "-=0.5");
    }

    if (subtitleRef.current) {
      const subtitleLines = subtitleRef.current.querySelectorAll('.subtitle-line');
      tl.from(subtitleLines, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      }, "-=0.8");
    }

    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");
    }

    return () => {
      tl.kill();
    };
  }, [isReady]);

  // Scroll handling scoped to container
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = rect.top;
      
      const windowHeight = window.innerHeight;
      
      let progress = 0;
      if (containerTop <= 0) {
        const scrollAmount = -containerTop;
        const maxScroll = windowHeight * totalSections; 
        progress = Math.min(Math.max(scrollAmount / maxScroll, 0), 1);
      }
      
      setScrollProgress(progress);
      
      const newSection = Math.floor(progress * totalSections);
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;
      
      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;
      
      const cameraPositions = [
        { x: 0, y: 30, z: 300 },    // Section 0
        { x: 0, y: 40, z: -50 },    // Section 1
        { x: 0, y: 50, z: -700 }    // Section 2
      ];
      
      const currentPos = cameraPositions[newSection] || cameraPositions[0];
      const nextPos = cameraPositions[newSection + 1] || currentPos;
      
      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;
      
      // Smooth parallax for mountains
      refs.mountains.forEach((mountain, i) => {
        const speed = 1 + i * 0.9;
        const scrollAmount = Math.max(0, -containerTop);
        const targetZ = mountain.userData.baseZ + scrollAmount * speed * 0.5;
        refs.nebula.position.z = (targetZ + progress * speed * 0.01) - 100
        
        mountain.userData.targetZ = targetZ;
        if (progress > 0.7) {
          mountain.position.z = 600000;
        }
        if (progress < 0.7 && refs.locations.length > 0) {
          mountain.position.z = refs.locations[i]
        }
      });
      if(refs.mountains[3]) {
        refs.nebula.position.z = refs.mountains[3].position.z;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  const splitTitle = (text) => {
    return text.split('').map((char, i) => (
      <span key={i} className="title-char">
        {char}
      </span>
    ));
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ height: `${(totalSections + 1) * 100}vh` }} ref={containerRef}>
        <div className="hero-container cosmos-style" style={{ position: 'sticky', top: 0, height: '100vh' }}>
          <canvas ref={canvasRef} className="hero-canvas" />
          
          <div ref={menuRef} className="side-menu" style={{ visibility: 'hidden' }}>
            <div className="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="vertical-text">NASA OSDR</div>
          </div>

          <div className="hero-content cosmos-content" style={{ opacity: currentSection === 0 ? 1 : 0, transition: 'opacity 0.5s' }}>
            <div className="text-backdrop" />
            <h1 ref={titleRef} className="hero-title">
              {splitTitle("DATASETS")}
            </h1>
            
            <div ref={subtitleRef} className="hero-subtitle cosmos-subtitle">
              <p className="subtitle-line">
                Open Science Data Repository
              </p>
              <p className="subtitle-line">
                Analyze the biology of spaceflight
              </p>
            </div>
          </div>

          <div ref={scrollProgressRef} className="scroll-progress" style={{ visibility: 'hidden' }}>
            <div className="scroll-text">SCROLL</div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ height: `${scrollProgress * 100}%`, width: '100%' }}
              />
            </div>
            <div className="section-counter">
              {String(currentSection + 1).padStart(2, '0')} / {String(totalSections + 1).padStart(2, '0')}
            </div>
          </div>

          <div className="scroll-sections" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {[...Array(2)].map((_, i) => {
              const sectionIndex = i + 1; // 1 and 2
              const titles = {
                1: 'MICROGRAVITY',
                2: 'INTELLIGENCE'
              };
              
              const subtitles = {
                1: {
                  line1: 'Discover how zero-G environments',
                  line2: 'alter cellular gene expression.'
                },
                2: {
                  line1: 'Initialize the AI assistant to decode',
                  line2: 'complex biological data instantly.'
                }
              };
              
              const isActive = currentSection === sectionIndex;
              
              return (
                <section 
                  key={i} 
                  className="content-section" 
                  style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  <div className="text-backdrop" />
                  <h1 className="hero-title">
                    {titles[sectionIndex]}
                  </h1>
              
                  <div className="hero-subtitle cosmos-subtitle">
                    <p className="subtitle-line">
                      {subtitles[sectionIndex].line1}
                    </p>
                    <p className="subtitle-line">
                      {subtitles[sectionIndex].line2}
                    </p>
                  </div>
                  
                  {/* Show Animated Button ONLY on the last section (Moon) */}
                  {sectionIndex === 2 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8, y: isActive ? 0 : 20 }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className={`mt-12 pointer-events-${isActive ? 'auto' : 'none'}`}
                    >
                      <button
                        onClick={onCompleteAction}
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full overflow-hidden transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] border border-white/20 backdrop-blur-md"
                      >
                        {/* Animated gradient glow behind text */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        
                        <span className="relative font-semibold tracking-[0.2em] uppercase text-sm drop-shadow-md">
                          Launch Workspace
                        </span>
                        <svg 
                          className="w-5 h-5 relative transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </motion.div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
