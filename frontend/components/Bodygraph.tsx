"use client";

import React, { useState } from "react";
import { Box, Tooltip, Fade } from "@mui/material";
import { CENTERS, CHANNELS, GATES } from "@/lib/hd-bodygraph/data";
import { CenterId, GateId, BodygraphProps } from "@/lib/hd-bodygraph/types";
import { ChartTheme, getDefaultTheme } from "@/lib/hd-bodygraph/themes";

// const _getGate = (id: GateId) => GATES.find(g => g.id === id)!;

function CenterShape({
  shape, x, y, w, h, rotation = 0, filled, theme
}: { 
  shape: "triangle"|"square"|"diamond"; 
  x:number; y:number; w:number; h:number; 
  rotation?:number; 
  filled:boolean;
  theme: ChartTheme;
}) {
  const fill = filled ? theme.colors.definedCenter : theme.colors.undefinedCenter;
  const stroke = filled ? theme.colors.definedCenterBorder : theme.colors.undefinedCenterBorder;
  const common = { 
    fill, 
    stroke, 
    strokeWidth: filled ? 4 : 3,
    style: {
      filter: filled ? `drop-shadow(0 0 12px ${theme.colors.definedCenter}60)` : 'none',
      transition: 'all 0.3s ease',
    }
  };
  const transform = `rotate(${rotation} ${x} ${y})`;
  
  // Animation für definierte Zentren - mit g-Element für korrekte Transform-Origin
  if (shape === "square") {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {filled && (
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.015;1"
            dur="3s"
            repeatCount="indefinite"
            additive="sum"
          />
        )}
        <rect x={-w/2} y={-h/2} width={w} height={h} rx={12} ry={12} {...common} transform={rotation ? `rotate(${rotation})` : ''} />
      </g>
    );
  }
  if (shape === "diamond") {
    const d = `0,${-h/2} ${w/2},0 0,${h/2} ${-w/2},0`;
    return (
      <g transform={`translate(${x}, ${y})`}>
        {filled && (
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.015;1"
            dur="3s"
            repeatCount="indefinite"
            additive="sum"
          />
        )}
        <polygon points={d} {...common} transform={rotation ? `rotate(${rotation})` : ''} />
      </g>
    );
  }
  // triangle (nach oben)
  const tri = `0,${-h/2} ${w/2},${h/2} ${-w/2},${h/2}`;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {filled && (
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.015;1"
          dur="3s"
          repeatCount="indefinite"
          additive="sum"
        />
      )}
      <polygon points={tri} {...common} transform={rotation ? `rotate(${rotation})` : ''} />
    </g>
  );
}

export default function Bodygraph({ 
  defined, 
  width = 600, 
  height = 800, 
  showLabels = true, 
  showGateNumbers = true,
  theme = getDefaultTheme(),
  onElementHover,
  onElementLeave,
  showDefinedOnly = false,
  showChannels = true
}: BodygraphProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const vb = 1000;
  const scale = width / vb;
  const actualHeight = height || (vb * 1.8 * scale); // Maximale Höhe für erweiterte Abstände

  const gateMap = new Map(GATES.map(g => [g.id, g]));

  // Tooltip-Inhalte für verschiedene Elemente
  const getTooltipInfo = (type: 'center' | 'gate' | 'channel', id: string): string => {
    switch (type) {
      case 'center':
        const center = CENTERS.find(c => c.id === id);
        const isDefined = defined?.centers?.[id as CenterId];
        const gates = center?.gates.map(g => defined?.gates?.[g] ? `${g}✓` : g).join(', ') || '';
        return `${center?.label || id} – ${isDefined ? 'Definiert' : 'Undefiniert'}. Tore: ${gates}`;
      case 'gate':
        const gate = GATES.find(g => g.id.toString() === id);
        const gateDefined = defined?.gates?.[parseInt(id)];
        return `Tor ${gate?.id || id} – ${gateDefined ? 'Aktiv' : 'Inaktiv'}. Zentrum: ${gate?.center || 'N/A'}`;
      case 'channel':
        const channel = CHANNELS.find(c => c.id === id);
        const channelDefined = defined?.channels?.[id];
        return `Kanal ${channel?.id || id} – ${channelDefined ? 'Definiert' : 'Undefiniert'}. Verbindet Tor ${channel?.a || '?'} ↔ Tor ${channel?.b || '?'}`;
      default:
        return '';
    }
  };

  const handleElementHover = (type: 'center' | 'gate' | 'channel', id: string) => {
    setHoveredElement(`${type}-${id}`);
    if (onElementHover) {
      onElementHover(type, id, getTooltipInfo(type, id));
    }
  };

  const handleElementLeave = () => {
    setHoveredElement(null);
    if (onElementLeave) {
      onElementLeave();
    }
  };

  const gatePos = (id: GateId) => {
    const g = gateMap.get(id);
    if (!g) return { x: 0, y: 0 }; // Fallback für fehlende Gates
    return { x: g.x, y: g.y };
  };

  const channelPath = (a: GateId, b: GateId) => {
    const A = gatePos(a), B = gatePos(b);
    // einfache kubische kurve; für feintuning später path in CHANNELS.path setzen
    const mx = (A.x + B.x) / 2;
    return `M ${A.x},${A.y} C ${mx},${A.y} ${mx},${B.y} ${B.x},${B.y}`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {/* Tooltips - nur wenn kein externer Callback vorhanden */}
      {hoveredElement && !onElementHover && (
        <Tooltip
          title={getTooltipInfo(
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
        id="bodygraph-svg"
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
        {/* SVG-Filter für Glow-Effekte */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Kanäle - Minimalistische Darstellung */}
        {showChannels && CHANNELS.map(ch => {
          const active = defined?.channels?.[ch.id];
          if (showDefinedOnly && !active) return null;
          
          const d = ch.path ?? channelPath(ch.a, ch.b);
          const isHovered = hoveredElement === `channel-${ch.id}`;
          
          // Nur definierte Linien deutlich zeigen, undefinierte sehr subtil
          if (!active) {
            // Undefinierte Linien: sehr dünn und fast unsichtbar
            return (
              <path 
                key={ch.id}
                d={d}
                stroke={theme.colors.undefinedChannel}
                strokeWidth={isHovered ? 1.5 : 1}
                fill="none" 
                strokeLinecap="round" 
                opacity={showDefinedOnly ? 0 : 0.08}
                strokeDasharray={active ? "none" : "3,3"}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => handleElementHover('channel', ch.id)}
                onMouseLeave={handleElementLeave}
              />
            );
          }
          
          // Definierte Linien: dünner und eleganter
          return (
            <g key={ch.id}>
              {/* Subtiler Glow für definierte Kanäle */}
              {isHovered && (
                <path 
                  d={d}
                  stroke={theme.colors.definedChannel}
                  strokeWidth={6}
                  fill="none" 
                  strokeLinecap="round"
                  opacity={0.2}
                  style={{
                    filter: 'blur(4px)',
                  }}
                />
              )}
              {/* Hauptkanal - dünner und eleganter */}
              <path 
                d={d}
                stroke={theme.colors.definedChannel}
                strokeWidth={isHovered ? 4 : 3}
                fill="none" 
                strokeLinecap="round" 
                opacity={1}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${theme.colors.definedChannel}50)` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => handleElementHover('channel', ch.id)}
                onMouseLeave={handleElementLeave}
              />
            </g>
          );
        })}

        {/* Zentren */}
        {CENTERS.map(c => {
          const filled = !!defined?.centers?.[c.id];
          if (showDefinedOnly && !filled) return null;
          
          const isHovered = hoveredElement === `center-${c.id}`;
          return (
            <g key={c.id}>
              <CenterShape 
                shape={c.shape} 
                x={c.x} 
                y={c.y} 
                w={c.w} 
                h={c.h} 
                rotation={c.rotation} 
                filled={filled}
                theme={theme}
              />
              {/* Invisible hover area */}
              <rect
                x={c.x - c.w/2 - 10}
                y={c.y - c.h/2 - 10}
                width={c.w + 20}
                height={c.h + 20}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => handleElementHover('center', c.id)}
                onMouseLeave={handleElementLeave}
              />
              {/* Label */}
              {showLabels && (
                <text 
                  x={c.x} 
                  y={c.y} 
                  fontSize={24} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill={filled ? theme.colors.textPrimary : theme.colors.textMuted}
                  fontWeight="600"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 4px ${theme.colors.definedCenter}50)` : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {c.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Gates */}
        {GATES.map(g => {
          const active = !!defined?.gates?.[g.id];
          if (showDefinedOnly && !active) return null;
          
          const isHovered = hoveredElement === `gate-${g.id}`;
          return (
            <g key={g.id}>
              {/* Hintergrund-Glow für aktive Gates */}
              {active && (
                <circle 
                  cx={g.x} 
                  cy={g.y} 
                  r={isHovered ? 26 : 22} 
                  fill={theme.colors.definedGate}
                  opacity={0.2}
                  style={{
                    filter: 'blur(4px)',
                  }}
                />
              )}
              {/* Haupt-Gate */}
              <circle 
                cx={g.x} 
                cy={g.y} 
                r={active ? (isHovered ? 22 : 18) : (isHovered ? 16 : 12)} 
                fill={active ? theme.colors.definedGate : theme.colors.undefinedGate} 
                stroke={active ? theme.colors.definedGateBorder : theme.colors.undefinedGateBorder} 
                strokeWidth={active ? 4 : 2}
                style={{
                  filter: active ? `drop-shadow(0 0 10px ${theme.colors.definedGate}60)` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => handleElementHover('gate', g.id.toString())}
                onMouseLeave={handleElementLeave}
              />
              {showGateNumbers && (
                <text 
                  x={g.x} 
                  y={g.y} 
                  fontSize={active ? 18 : 14} 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fill={active ? theme.colors.definedGateBorder : theme.colors.textMuted}
                  fontWeight={active ? "700" : "600"}
                  style={{
                    filter: active ? `drop-shadow(0 0 6px ${theme.colors.definedGateBorder}80)` : 'none',
                    transition: 'all 0.3s ease'
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
