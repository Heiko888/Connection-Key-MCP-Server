'use client';

import React, { useState } from 'react';
import { Box, Tooltip, Fade } from '@mui/material';
import { CENTERS, CHANNELS, GATES } from '../lib/hd-bodygraph/data';
import { CenterId, GateId } from '../lib/hd-bodygraph/types';

interface CSSBodygraphProps {
  defined?: {
    centers?: Partial<Record<CenterId, boolean>>;
    channels?: Partial<Record<string, boolean>>;
    gates?: Partial<Record<GateId, boolean>>;
  };
  width?: number;
  height?: number;
  showLabels?: boolean;
  showGateNumbers?: boolean;
}

export default function CSSBodygraph({
  defined = {},
  width = 800,
  height = 1000,
  showLabels = true,
  showGateNumbers = true
}: CSSBodygraphProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const gateMap = new Map(GATES.map(g => [g.id, g]));

  // Tooltip-Inhalte für verschiedene Elemente
  const getTooltipContent = (type: 'center' | 'gate' | 'channel', id: string) => {
    switch (type) {
      case 'center':
        const center = CENTERS.find(c => c.id === id);
        return center ? `${center.label} Center` : '';
      case 'gate':
        const gate = GATES.find(g => g.id.toString() === id);
        return gate ? `${gate.label}` : '';
      case 'channel':
        const channel = CHANNELS.find(c => c.id === id);
        return channel ? `Channel ${channel.id}` : '';
      default:
        return '';
    }
  };

  // CSS für die Zentren
  const getCenterStyle = (centerId: CenterId) => {
    const center = CENTERS.find(c => c.id === centerId);
    if (!center) return {};

    const isDefined = defined.centers?.[centerId];
    const isHovered = hoveredElement === `center-${centerId}`;

    const baseStyle = {
      position: 'absolute' as const,
      left: `${center.x}px`,
      top: `${center.y}px`,
      width: `${center.w}px`,
      height: `${center.h}px`,
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      zIndex: 2,
    };

    if (center.shape === 'triangle') {
      return {
        ...baseStyle,
        width: 0,
        height: 0,
        borderLeft: `${center.w / 2}px solid transparent`,
        borderRight: `${center.w / 2}px solid transparent`,
        borderBottom: isDefined ? `${center.h}px solid #FFD700` : `${center.h}px solid #6c757d`,
        filter: isDefined ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' : 'none',
        transform: `translate(-50%, -50%) rotate(${center.rotation || 0}deg)`,
        transformOrigin: 'center',
        scale: isHovered ? '1.1' : '1',
      };
    }

    if (center.shape === 'square') {
      return {
        ...baseStyle,
        backgroundColor: isDefined ? '#FFD700' : 'transparent',
        border: `3px solid ${isDefined ? '#FFD700' : '#6c757d'}`,
        borderRadius: '8px',
        filter: isDefined ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' : 'none',
        scale: isHovered ? '1.05' : '1',
      };
    }

    if (center.shape === 'diamond') {
      return {
        ...baseStyle,
        width: `${center.w}px`,
        height: `${center.h}px`,
        backgroundColor: isDefined ? '#FFD700' : 'transparent',
        border: `3px solid ${isDefined ? '#FFD700' : '#6c757d'}`,
        transform: 'translate(-50%, -50%) rotate(45deg)',
        filter: isDefined ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' : 'none',
        scale: isHovered ? '1.05' : '1',
      };
    }

    return baseStyle;
  };

  // CSS für die Gates
  const getGateStyle = (gateId: GateId) => {
    const gate = gateMap.get(gateId);
    if (!gate) return {};

    const isActive = defined.gates?.[gateId];
    const isHovered = hoveredElement === `gate-${gateId}`;

    return {
      position: 'absolute' as const,
      left: `${gate.x}px`,
      top: `${gate.y}px`,
      width: '24px',
      height: '24px',
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      backgroundColor: isActive ? '#FFD700' : 'transparent',
      border: `2px solid ${isActive ? '#FFD700' : '#6c757d'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isActive ? '14px' : '12px',
      fontWeight: isActive ? '700' : '400',
      color: isActive ? '#000' : '#6c757d',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 3,
      filter: isActive ? 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))' : 'none',
      scale: isHovered ? '1.2' : '1',
      '&::before': isActive ? {
        content: '""',
        position: 'absolute',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#FFD700',
        opacity: 0.2,
        filter: 'blur(4px)',
        zIndex: -1,
      } : {},
    };
  };

  // CSS für die Kanäle
  const getChannelStyle = (channelId: string) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return {};

    const gateA = gateMap.get(channel.a);
    const gateB = gateMap.get(channel.b);
    if (!gateA || !gateB) return {};

    const isActive = defined.channels?.[channelId];
    const isHovered = hoveredElement === `channel-${channelId}`;

    // Berechne die Linie zwischen den Gates
    const x1 = gateA.x;
    const y1 = gateA.y;
    const x2 = gateB.x;
    const y2 = gateB.y;

    // Berechne Winkel und Länge
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    return {
      position: 'absolute' as const,
      left: `${x1}px`,
      top: `${y1}px`,
      width: `${length}px`,
      height: isActive ? '8px' : '2px',
      backgroundColor: isActive ? '#FFD700' : '#6c757d',
      transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      transformOrigin: 'left center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 1,
      opacity: isActive ? 1 : 0.4,
      filter: isActive ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))' : 'none',
      scale: isHovered ? '1.1' : '1',
      '&::before': isActive ? {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#FFD700',
        filter: 'blur(8px)',
        opacity: 0.3,
        zIndex: -1,
      } : {},
    };
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'transparent',
        overflow: 'visible',
        margin: '0 auto',
      }}
    >
      {/* Kanäle */}
      {CHANNELS.map((channel) => (
        <Box
          key={`channel-${channel.id}`}
          sx={getChannelStyle(channel.id)}
          onMouseEnter={() => setHoveredElement(`channel-${channel.id}`)}
          onMouseLeave={() => setHoveredElement(null)}
        />
      ))}

      {/* Zentren */}
      {CENTERS.map((center) => (
        <Box
          key={`center-${center.id}`}
          sx={getCenterStyle(center.id)}
          onMouseEnter={() => setHoveredElement(`center-${center.id}`)}
          onMouseLeave={() => setHoveredElement(null)}
        >
          {showLabels && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: defined.centers?.[center.id] ? '#000' : '#6c757d',
                fontSize: '12px',
                fontWeight: '600',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 4,
                textShadow: defined.centers?.[center.id] ? '0 0 4px rgba(255, 215, 0, 0.8)' : 'none',
              }}
            >
              {center.label}
            </Box>
          )}
        </Box>
      ))}

      {/* Gates */}
      {GATES.map((gate) => (
        <Box
          key={`gate-${gate.id}`}
          sx={getGateStyle(gate.id)}
          onMouseEnter={() => setHoveredElement(`gate-${gate.id}`)}
          onMouseLeave={() => setHoveredElement(null)}
        >
          {showGateNumbers && (
            <Box
              sx={{
                fontSize: defined.gates?.[gate.id] ? '14px' : '12px',
                fontWeight: defined.gates?.[gate.id] ? '700' : '400',
                color: defined.gates?.[gate.id] ? '#000' : '#6c757d',
                textShadow: defined.gates?.[gate.id] ? '0 0 4px rgba(255, 215, 0, 0.8)' : 'none',
              }}
            >
              {gate.id}
            </Box>
          )}
        </Box>
      ))}

      {/* Tooltip */}
      {hoveredElement && (
        <Tooltip
          title={getTooltipContent(
            hoveredElement.startsWith('center-') ? 'center' :
            hoveredElement.startsWith('gate-') ? 'gate' : 'channel',
            hoveredElement.split('-')[1]
          )}
          open={!!hoveredElement}
          TransitionComponent={Fade}
          placement="top"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
