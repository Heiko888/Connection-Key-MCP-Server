"use client";

import React, { useState, useEffect } from 'react';
import { Box, Tooltip, Fade } from "@mui/material";
import { CENTERS, CHANNELS, GATES } from "@/lib/hd-bodygraph/data";
import { CenterId, GateId, BodygraphProps } from "@/lib/hd-bodygraph/types";

const getGate = (id: GateId) => GATES.find(g => g.id === id)!;

function AnimatedCenterShape({
  shape, x, y, w, h, rotation = 0, filled, delay = 0
}: { 
  shape: "triangle"|"square"|"diamond"; 
  x:number; y:number; w:number; h:number; 
  rotation?:number; 
  filled:boolean;
  delay?: number;
}) {
  const fill = filled ? "#1a1a2e" : "#f8f9fa";
  const stroke = filled ? "#FFD700" : "#6c757d";
  const common = { 
    fill, 
    stroke, 
    strokeWidth: filled ? 4 : 3,
    style: {
      animation: `fadeInScale 0.8s ease-out ${delay}ms both`,
      transformOrigin: `${x}px ${y}px`,
      filter: filled ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' : 'none',
      transition: 'all 0.3s ease'
    }
  };
  const transform = `rotate(${rotation} ${x} ${y})`;
  
  if (shape === "square") {
    return <rect x={x - w/2} y={y - h/2} width={w} height={h} rx={12} ry={12} {...common} transform={transform} />;
  }
  if (shape === "diamond") {
    const d = `${x},${y-h/2} ${x+w/2},${y} ${x},${y+h/2} ${x-w/2},${y}`;
    return <polygon points={d} {...common} transform={transform} />;
  }
  // triangle (nach oben)
  const tri = `${x},${y-h/2} ${x+w/2},${y+h/2} ${x-w/2},${y+h/2}`;
  return <polygon points={tri} {...common} transform={transform} />;
}

export default function AnimatedBodygraph({ 
  defined, 
  width = 600, 
  height = 800, 
  showLabels = true, 
  showGateNumbers = true,
  animationSpeed = 1
}: BodygraphProps & { animationSpeed?: number }) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'channels' | 'centers' | 'gates' | 'complete'>('channels');
  const vb = 1000;
  const scale = width / vb;
  const actualHeight = height || (vb * 1.8 * scale); // Maximale Höhe für erweiterte Abstände

  const gateMap = new Map(GATES.map(g => [g.id, g]));

  // Animation phases
  useEffect(() => {
    const phases = ['channels', 'centers', 'gates', 'complete'] as const;
    let currentPhase = 0;

    const interval = setInterval(() => {
      currentPhase++;
      if (currentPhase < phases.length) {
        setAnimationPhase(phases[currentPhase]);
      } else {
        clearInterval(interval);
      }
    }, 800 / animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed]);

  // Tooltip-Inhalte für verschiedene Elemente
  const getTooltipContent = (type: 'center' | 'gate' | 'channel', id: string) => {
    switch (type) {
      case 'center':
        const center = CENTERS.find(c => c.id === id);
        const isDefined = defined?.centers?.[id as CenterId];
        return (
          <Box>
            <strong>{center?.label}</strong>
            <br />
            Status: {isDefined ? 'Definiert' : 'Undefiniert'}
            <br />
            Gates: {center?.gates.join(', ')}
          </Box>
        );
      case 'gate':
        const gate = GATES.find(g => g.id.toString() === id);
        const gateDefined = defined?.gates?.[parseInt(id)];
        return (
          <Box>
            <strong>Gate {gate?.id}</strong>
            <br />
            Status: {gateDefined ? 'Aktiv' : 'Inaktiv'}
            <br />
            Zentrum: {gate?.center}
          </Box>
        );
      case 'channel':
        const channel = CHANNELS.find(c => c.id === id);
        const channelDefined = defined?.channels?.[id];
        return (
          <Box>
            <strong>Kanal {channel?.id}</strong>
            <br />
            Status: {channelDefined ? 'Definiert' : 'Undefiniert'}
            <br />
            Verbindet: Gate {channel?.a} ↔ Gate {channel?.b}
          </Box>
        );
      default:
        return '';
    }
  };

  const gatePos = (id: GateId) => {
    const g = gateMap.get(id);
    if (!g) return { x: 0, y: 0 };
    return { x: g.x, y: g.y };
  };

  const channelPath = (a: GateId, b: GateId) => {
    const A = gatePos(a), B = gatePos(b);
    const mx = (A.x + B.x) / 2;
    return `M ${A.x},${A.y} C ${mx},${A.y} ${mx},${B.y} ${B.x},${B.y}`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes drawPath {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9));
          }
        }
        
        .animated-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawPath 2s ease-in-out forwards;
        }
        
        .pulse-element {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .glow-element {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Tooltips */}
      {hoveredElement && (
        <Tooltip
          title={getTooltipContent(
            hoveredElement.startsWith('center-') ? 'center' : 
            hoveredElement.startsWith('gate-') ? 'gate' : 'channel',
            hoveredElement.split('-').slice(1).join('-')
          )}
          open={true}
          placement="top"
          TransitionComponent={Fade}
          arrow
          sx={{
            '& .MuiTooltip-tooltip': {
              bgcolor: 'rgba(26, 26, 46, 0.95)',
              color: '#f8f9fa',
              fontSize: '14px',
              fontWeight: 500,
              border: '1px solid rgba(83, 52, 131, 0.3)',
              backdropFilter: 'blur(10px)'
            },
            '& .MuiTooltip-arrow': {
              color: 'rgba(26, 26, 46, 0.95)'
            }
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </Tooltip>
      )}

      <svg 
        id="animated-bodygraph-svg"
        viewBox={`0 0 ${vb} ${vb*1.8}`} 
        width={width} 
        height={actualHeight}
        style={{ 
          background: "transparent", 
          display: "block",
          maxWidth: '100%',
          height: 'auto'
        }}
      >
        {/* Kanäle */}
        {CHANNELS.map((ch, index) => {
          const active = defined?.channels?.[ch.id];
          const d = ch.path ?? channelPath(ch.a, ch.b);
          const isHovered = hoveredElement === `channel-${ch.id}`;
          const shouldAnimate = animationPhase === 'channels' || animationPhase === 'complete';
          
          return (
            <g key={ch.id}>
              {/* Hintergrund-Schatten für aktive Kanäle */}
              {active && (
                <path 
                  d={d}
                  stroke="#FFD700"
                  strokeWidth={isHovered ? 16 : 12}
                  fill="none" 
                  strokeLinecap="round"
                  opacity={0.3}
                  style={{
                    filter: 'blur(3px)',
                  }}
                />
              )}
              {/* Hauptkanal */}
              <path 
                d={d}
                stroke={active ? "#FFD700" : "#6c757d"}
                strokeWidth={active ? (isHovered ? 10 : 8) : (isHovered ? 4 : 2)}
                fill="none" 
                strokeLinecap="round" 
                opacity={active ? 1 : 0.4}
                className={shouldAnimate ? 'animated-path' : ''}
                style={{
                  filter: active ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  animationDelay: `${index * 100}ms`
                }}
                onMouseEnter={() => setHoveredElement(`channel-${ch.id}`)}
                onMouseLeave={() => setHoveredElement(null)}
              />
              {/* Glow-Effekt für aktive Kanäle */}
              {active && (
                <path 
                  d={d}
                  stroke="#FFD700"
                  strokeWidth={isHovered ? 14 : 10}
                  fill="none" 
                  strokeLinecap="round"
                  opacity={0.2}
                  style={{
                    filter: 'blur(6px)',
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Zentren */}
        {CENTERS.map((c, index) => {
          const filled = !!defined?.centers?.[c.id];
          const isHovered = hoveredElement === `center-${c.id}`;
          const shouldAnimate = animationPhase === 'centers' || animationPhase === 'complete';
          
          return (
            <g key={c.id}>
              <AnimatedCenterShape 
                shape={c.shape} 
                x={c.x} 
                y={c.y} 
                w={c.w} 
                h={c.h} 
                rotation={c.rotation} 
                filled={filled}
                delay={shouldAnimate ? index * 150 : 0}
              />
              
              {/* Invisible hover area */}
              <rect
                x={c.x - c.w/2 - 10}
                y={c.y - c.h/2 - 10}
                width={c.w + 20}
                height={c.h + 20}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredElement(`center-${c.id}`)}
                onMouseLeave={() => setHoveredElement(null)}
              />
              
              {/* Label */}
              {showLabels && (
                <text 
                  x={c.x} 
                  y={c.y} 
                  fontSize={24} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill={filled ? "#f8f9fa" : "#6c757d"}
                  fontWeight="600"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))' : 'none',
                    transition: 'all 0.2s ease',
                    animation: shouldAnimate ? `fadeInScale 0.8s ease-out ${index * 150 + 400}ms both` : 'none'
                  }}
                >
                  {c.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Gates */}
        {GATES.map((g, index) => {
          const active = !!defined?.gates?.[g.id];
          const isHovered = hoveredElement === `gate-${g.id}`;
          const shouldAnimate = animationPhase === 'gates' || animationPhase === 'complete';
          
          return (
            <g key={g.id}>
              {/* Hintergrund-Glow für aktive Gates */}
              {active && (
                <circle 
                  cx={g.x} 
                  cy={g.y} 
                  r={isHovered ? 26 : 22} 
                  fill="#FFD700"
                  opacity={0.2}
                  style={{
                    filter: 'blur(4px)',
                    animation: shouldAnimate ? `fadeInScale 0.6s ease-out ${index * 50 + 800}ms both` : 'none'
                  }}
                />
              )}
              {/* Haupt-Gate */}
              <circle 
                cx={g.x} 
                cy={g.y} 
                r={active ? (isHovered ? 22 : 18) : (isHovered ? 16 : 12)} 
                fill={active ? "#1a1a2e" : "#f8f9fa"} 
                stroke={active ? "#FFD700" : "#6c757d"} 
                strokeWidth={active ? 4 : 2}
                className={active && shouldAnimate ? 'glow-element' : ''}
                style={{
                  filter: active ? 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  animation: shouldAnimate ? `fadeInScale 0.6s ease-out ${index * 50 + 800}ms both` : 'none'
                }}
                onMouseEnter={() => setHoveredElement(`gate-${g.id}`)}
                onMouseLeave={() => setHoveredElement(null)}
              />
              
              {showGateNumbers && (
                <text 
                  x={g.x} 
                  y={g.y} 
                  fontSize={active ? 18 : 14} 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fill={active ? "#FFD700" : "#6c757d"}
                  fontWeight={active ? "700" : "600"}
                  style={{
                    filter: active ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))' : 'none',
                    transition: 'all 0.3s ease',
                    animation: shouldAnimate ? `fadeInScale 0.6s ease-out ${index * 50 + 1000}ms both` : 'none'
                  }}
                >
                  {g.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
