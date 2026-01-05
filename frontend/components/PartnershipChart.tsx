import React from "react";
import HDChart from "./HDChart";
import { Box, Typography } from "@mui/material";

interface ChartData {
  definedChannels: string[];
  activeGates: number[];
  definedCenters: string[];
  name?: string;
}

export default function PartnershipChart({ chartA, chartB }: { chartA: ChartData; chartB: ChartData }) {
  // Kombiniere Kanäle, Zentren, Gates
  const combinedChannels = Array.from(new Set([...(chartA.definedChannels || []), ...(chartB.definedChannels || [])]));
  const combinedGates = Array.from(new Set([...(chartA.activeGates || []), ...(chartB.activeGates || [])]));
  const combinedCenters = Array.from(new Set([...(chartA.definedCenters || []), ...(chartB.definedCenters || [])]));

  // Exklusive Kanäle/Zentren/Gates
  const exclusiveA = {
    channels: chartA.definedChannels.filter((c) => !chartB.definedChannels.includes(c)),
    centers: chartA.definedCenters.filter((c) => !chartB.definedCenters.includes(c)),
    gates: chartA.activeGates.filter((g) => !chartB.activeGates.includes(g)),
  };
  const exclusiveB = {
    channels: chartB.definedChannels.filter((c) => !chartA.definedChannels.includes(c)),
    centers: chartB.definedCenters.filter((c) => !chartA.definedCenters.includes(c)),
    gates: chartB.activeGates.filter((g) => !chartA.activeGates.includes(g)),
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#7c4dff', fontWeight: 700 }}>
        Partnerschafts-/Team-Chart
      </Typography>
      <HDChart
        data={{
          gates: combinedGates.map(gate => ({ id: gate, active: true })),
          centers: {
            head: { defined: combinedCenters.includes('head') },
            ajna: { defined: combinedCenters.includes('ajna') },
            throat: { defined: combinedCenters.includes('throat') },
            g: { defined: combinedCenters.includes('g') },
            heart: { defined: combinedCenters.includes('heart') },
            sacral: { defined: combinedCenters.includes('sacral') },
            solar: { defined: combinedCenters.includes('solar') },
            spleen: { defined: combinedCenters.includes('spleen') },
            root: { defined: combinedCenters.includes('root') }
          },
          channels: combinedChannels.map(channel => {
            const [from, to] = channel.split('-').map(Number);
            return { from, to, active: true };
          }),
          metadata: {
            type: 'partnership',
            profile: 'combined',
            authority: 'combined',
            strategy: 'combined'
          }
        }}
        initialTheme="light"
      />
      <Box sx={{ mt: 2, color: '#23233a', fontSize: 15 }}>
        <strong>Gemeinsame Kanäle:</strong> {combinedChannels.join(', ') || 'Keine'}<br />
        <strong>Gemeinsame Zentren:</strong> {combinedCenters.join(', ') || 'Keine'}<br />
        <strong>Gemeinsame Tore:</strong> {combinedGates.join(', ') || 'Keine'}<br />
        <br />
        <strong>{chartA.name || 'Chart A'} exklusiv:</strong><br />
        Kanäle: {exclusiveA.channels.join(', ') || 'Keine'}<br />
        Zentren: {exclusiveA.centers.join(', ') || 'Keine'}<br />
        Tore: {exclusiveA.gates.join(', ') || 'Keine'}<br />
        <br />
        <strong>{chartB.name || 'Chart B'} exklusiv:</strong><br />
        Kanäle: {exclusiveB.channels.join(', ') || 'Keine'}<br />
        Zentren: {exclusiveB.centers.join(', ') || 'Keine'}<br />
        Tore: {exclusiveB.gates.join(', ') || 'Keine'}<br />
      </Box>
    </Box>
  );
}
