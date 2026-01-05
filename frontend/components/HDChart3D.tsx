'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Switch, FormControlLabel, Slider } from '@mui/material';
import { RotateCcw, Settings, Star } from 'lucide-react';
// Dynamischer Import für Three.js um SSR-Probleme zu vermeiden
let THREE: any = null;

interface HDChart3DProps {
  hdType: string;
  profile: string;
  authority: string;
  strategy: string;
  centerData: any;
  channelData: any;
  gateData: any;
  planetData: any;
}

export default function HDChart3D({
  // hdType,
  // profile,
  // authority,
  // strategy,
  // centerData,
  // channelData,
  // gateData,
  // planetData
}: HDChart3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  
  const [is3D, setIs3D] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showPlanets, setShowPlanets] = useState(true);
  const [showChannels, setShowChannels] = useState(true);
  const [showGates, setShowGates] = useState(true);

  // 3D Scene Setup
  useEffect(() => {
    if (!mountRef.current || !is3D) return;

    // Dynamisch Three.js laden
    const loadThreeJS = async () => {
      if (!THREE) {
        THREE = await import('three');
      }
      return THREE;
    };

    const create3DChart = (scene: any, ThreeJS: any) => {
      // Clear existing objects
      scene.clear();

      // Add lighting back
      const ambientLight = new ThreeJS.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new ThreeJS.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new ThreeJS.PointLight(0xfef3c7, 0.5, 100);
      pointLight.position.set(0, 0, 10);
      scene.add(pointLight);

      // Create centers (3D spheres)
      const centerPositions = [
        { name: 'Head', position: [0, 2, 0], color: 0x8b5cf6 },
        { name: 'Ajna', position: [0, 1, 0], color: 0x7c3aed },
        { name: 'Throat', position: [0, 0, 0], color: 0x6d28d9 },
        { name: 'G', position: [0, -1, 0], color: 0x5b21b6 },
        { name: 'Heart', position: [0, -2, 0], color: 0x4c1d95 },
        { name: 'Solar', position: [-1, -1, 0], color: 0x3b0764 },
        { name: 'Sacral', position: [1, -1, 0], color: 0x2e1065 },
        { name: 'Spleen', position: [-1, 0, 0], color: 0x1e1b4b },
        { name: 'Root', position: [1, 0, 0], color: 0x0f172a }
      ];

      centerPositions.forEach((center, index) => {
        const geometry = new ThreeJS.SphereGeometry(0.3, 32, 32);
        const material = new ThreeJS.MeshPhongMaterial({ 
          color: center.color,
          transparent: true,
          opacity: 0.8,
          emissive: center.color,
          emissiveIntensity: 0.2
        });
        
        const sphere = new ThreeJS.Mesh(geometry, material);
        sphere.position.set(center.position[0], center.position[1], center.position[2]);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        
        // Add pulsing animation
        sphere.userData = { originalScale: 1, pulseSpeed: 0.02 + index * 0.005 };
        
        scene.add(sphere);
      });

      // Create channels (3D tubes)
      if (showChannels) {
        const channelGeometry = new ThreeJS.CylinderGeometry(0.05, 0.05, 2, 8);
        const channelMaterial = new ThreeJS.MeshPhongMaterial({ 
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.6,
          emissive: 0xfbbf24,
          emissiveIntensity: 0.1
        });

        // Create some example channels
        const channels = [
          { start: [0, 2, 0], end: [0, 1, 0] },
          { start: [0, 1, 0], end: [0, 0, 0] },
          { start: [0, 0, 0], end: [0, -1, 0] },
          { start: [-1, 0, 0], end: [0, 0, 0] },
          { start: [0, 0, 0], end: [1, 0, 0] }
        ];

        channels.forEach((channel) => {
          const tube = new ThreeJS.Mesh(channelGeometry, channelMaterial);
          
          // Position and rotate the tube
          const start = new ThreeJS.Vector3(...channel.start);
          const end = new ThreeJS.Vector3(...channel.end);
          const direction = new ThreeJS.Vector3().subVectors(end, start);
          const length = direction.length();
          
          tube.scale.set(1, length / 2, 1);
          tube.position.copy(start).add(direction.multiplyScalar(0.5));
          tube.lookAt(end);
          tube.rotateX(Math.PI / 2);
          
          tube.castShadow = true;
          scene.add(tube);
        });
      }

      // Create gates (3D small spheres around centers)
      if (showGates) {
        const gateGeometry = new ThreeJS.SphereGeometry(0.1, 16, 16);
        const gateMaterial = new ThreeJS.MeshPhongMaterial({ 
          color: 0x10b981,
          transparent: true,
          opacity: 0.7,
          emissive: 0x10b981,
          emissiveIntensity: 0.3
        });

        // Create gates around each center
        centerPositions.forEach((center) => {
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 0.6;
            
            const gate = new ThreeJS.Mesh(gateGeometry, gateMaterial);
            gate.position.set(
              center.position[0] + Math.cos(angle) * radius,
              center.position[1] + Math.sin(angle) * radius,
              center.position[2]
            );
            
            gate.castShadow = true;
            scene.add(gate);
          }
        });
      }

      // Create planets (3D spheres in orbit)
      if (showPlanets) {
        const planetGeometry = new ThreeJS.SphereGeometry(0.15, 16, 16);
        
        const planets = [
          { name: 'Sun', color: 0xfbbf24, radius: 3, speed: 0.01 },
          { name: 'Moon', color: 0xe5e7eb, radius: 3.5, speed: 0.02 },
          { name: 'Mercury', color: 0x06b6d4, radius: 4, speed: 0.015 },
          { name: 'Venus', color: 0xf97316, radius: 4.5, speed: 0.008 },
          { name: 'Mars', color: 0xef4444, radius: 5, speed: 0.005 }
        ];

        planets.forEach((planet, index) => {
          const material = new ThreeJS.MeshPhongMaterial({ 
            color: planet.color,
            transparent: true,
            opacity: 0.8,
            emissive: planet.color,
            emissiveIntensity: 0.4
          });
          
          const planetMesh = new ThreeJS.Mesh(planetGeometry, material);
          planetMesh.userData = { 
            radius: planet.radius, 
            speed: planet.speed, 
            angle: index * Math.PI / 2.5 
          };
          
          planetMesh.castShadow = true;
          scene.add(planetMesh);
        });
      }

      // Add labels if enabled
      if (showLabels) {
        // This would require a text rendering library like THREE.TextGeometry
        // For now, we'll skip labels in 3D mode
      }
    };

    const init3DScene = async () => {
      const ThreeJS = await loadThreeJS();
      
      // Scene
      const scene = new ThreeJS.Scene();
      scene.background = new ThreeJS.Color(0x0f0f23);
      sceneRef.current = scene;

      // Camera
      const camera = new ThreeJS.PerspectiveCamera(
        75,
        (mountRef.current?.clientWidth || 800) / (mountRef.current?.clientHeight || 600),
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Renderer
      const renderer = new ThreeJS.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current?.clientWidth || 800, mountRef.current?.clientHeight || 600);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = ThreeJS.PCFSoftShadowMap;
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }
      rendererRef.current = renderer;

      // Create 3D Human Design Chart
      create3DChart(scene, ThreeJS);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        if (sceneRef.current && cameraRef.current) {
          // Rotate the entire chart
          sceneRef.current.rotation.y += rotationSpeed;
          
          // Update camera zoom
          cameraRef.current.position.z = 5 / zoom;
          
          renderer.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (mountRef.current && cameraRef.current && rendererRef.current) {
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && rendererRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      };
    };

    init3DScene();
  }, [is3D, rotationSpeed, zoom, showLabels, showPlanets, showChannels, showGates]);


  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      cameraRef.current.lookAt(0, 0, 0);
    }
    if (sceneRef.current) {
      sceneRef.current.rotation.set(0, 0, 0);
    }
    setZoom(1);
    setRotationSpeed(0.01);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Toggle */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 10,
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 2,
        p: 2,
        backdropFilter: 'blur(10px)'
      }}>
        <FormControlLabel
          control={
            <Switch
              checked={is3D}
              onChange={(e) => setIs3D(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#8b5cf6',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#8b5cf6',
                },
              }}
            />
          }
          label="3D-Modus"
          sx={{ color: '#fef3c7' }}
        />
      </Box>

      {/* 3D Controls */}
      {is3D && (
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 10,
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(10px)',
          minWidth: '200px'
        }}>
          <Typography variant="subtitle2" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings size={16} />
            3D-Kontrollen
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(254,243,199,0.7)' }}>
              Rotationsgeschwindigkeit: {rotationSpeed.toFixed(3)}
            </Typography>
            <Slider
              value={rotationSpeed}
              onChange={(_, value) => setRotationSpeed(value as number)}
              min={0}
              max={0.05}
              step={0.001}
              sx={{
                color: '#8b5cf6',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#8b5cf6',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#8b5cf6',
                },
              }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(254,243,199,0.7)' }}>
              Zoom: {zoom.toFixed(1)}x
            </Typography>
            <Slider
              value={zoom}
              onChange={(_, value) => setZoom(value as number)}
              min={0.5}
              max={3}
              step={0.1}
              sx={{
                color: '#8b5cf6',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#8b5cf6',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#8b5cf6',
                },
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8b5cf6',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              }
              label="Labels"
              sx={{ color: '#fef3c7', fontSize: '0.8rem' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPlanets}
                  onChange={(e) => setShowPlanets(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8b5cf6',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              }
              label="Planeten"
              sx={{ color: '#fef3c7', fontSize: '0.8rem' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showChannels}
                  onChange={(e) => setShowChannels(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8b5cf6',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              }
              label="Kanäle"
              sx={{ color: '#fef3c7', fontSize: '0.8rem' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showGates}
                  onChange={(e) => setShowGates(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8b5cf6',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              }
              label="Tore"
              sx={{ color: '#fef3c7', fontSize: '0.8rem' }}
            />
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            onClick={resetView}
            startIcon={<RotateCcw size={16} />}
            sx={{
              color: '#fef3c7',
              borderColor: 'rgba(254,243,199,0.3)',
              '&:hover': {
                borderColor: '#fef3c7',
                backgroundColor: 'rgba(254,243,199,0.1)'
              }
            }}
          >
            Reset
          </Button>
        </Box>
      )}

      {/* 3D Canvas */}
      {is3D ? (
        <Box
          ref={mountRef}
          sx={{
            width: '100%',
            height: '600px',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid rgba(254,243,199,0.2)'
          }}
        />
      ) : (
        <Box sx={{
          width: '100%',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 2,
          border: '1px solid rgba(254,243,199,0.2)'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Star size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
            <Typography variant="h6" sx={{ color: '#fef3c7', mb: 1 }}>
              3D-Modus deaktiviert
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
              Aktiviere den 3D-Modus um das Human Design Chart in 3D zu betrachten
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
