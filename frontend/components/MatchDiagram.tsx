import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#ffd700", "#b39ddb", "#e57373", "#2196f3", "#4b2e83"];

type Profile = {
  name?: string;
  hdType?: string;
  location?: string;
  interests?: string[];
  channels?: string[];
};

function getCommonData(profileA: Profile, profileB: Profile) {
  const interestsA = profileA.interests || [];
  const interestsB = profileB.interests || [];
  const commonInterests = interestsA.filter(i => interestsB.includes(i));
  const channelsA = profileA.channels || [];
  const channelsB = profileB.channels || [];
  const commonChannels = channelsA.filter(c => channelsB.includes(c));
  const complementChannels = channelsA.filter(c => !channelsB.includes(c)).concat(channelsB.filter(c => !channelsA.includes(c)));
  return [
    { name: "Gemeinsame Interessen", value: commonInterests.length },
    { name: "Ergänzende Kanäle", value: complementChannels.length },
    { name: "Gemeinsame Kanäle", value: commonChannels.length },
    { name: "Gleicher Typ", value: profileA.hdType === profileB.hdType ? 1 : 0 },
    { name: "Gleicher Ort", value: profileA.location === profileB.location ? 1 : 0 },
  ];
}

interface MatchDiagramProps {
  profileA: Profile;
  profileB: Profile;
  type: 'dating' | 'friendship';
}

export default function MatchDiagram({ profileA, profileB, type }: MatchDiagramProps) {
  const data = getCommonData(profileA, profileB);
  const channelsA = profileA.channels || [];
  const channelsB = profileB.channels || [];
  const commonChannels = channelsA.filter(c => channelsB.includes(c));
  const complementChannels = channelsA.filter(c => !channelsB.includes(c)).concat(channelsB.filter(c => !channelsA.includes(c)));
  return (
    <Card sx={{ mt: 4, mb: 2, background: '#2e1a47', borderRadius: 4, boxShadow: '0 4px 24px #4b2e83', p: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 700, mb: 2 }}>
          Gemeinsamkeiten & Ergänzungen – {type === 'dating' ? 'Dating' : 'Freundschaft'}
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 600 }}>
            Ergänzende Kanäle:
          </Typography>
          {complementChannels.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {complementChannels.map((ch, idx) => (
                <Box key={ch + idx} sx={{ px: 1.5, py: 0.5, bgcolor: '#b39ddb', color: '#23233a', borderRadius: 2, fontSize: 13, fontWeight: 600 }}>{ch}</Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#d1c4e9', mt: 1 }}>Keine ergänzenden Kanäle.</Typography>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 600 }}>
            Gemeinsame Kanäle:
          </Typography>
          {commonChannels.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {commonChannels.map((ch, idx) => (
                <Box key={ch + idx} sx={{ px: 1.5, py: 0.5, bgcolor: '#ffd700', color: '#23233a', borderRadius: 2, fontSize: 13, fontWeight: 600 }}>{ch}</Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#d1c4e9', mt: 1 }}>Keine gemeinsamen Kanäle.</Typography>
          )}
        </Box>
        <Typography variant="body2" sx={{ color: '#d1c4e9', mt: 2 }}>
          {data[0].value > 0 ? `Ihr habt ${data[0].value} gemeinsame Interessen.` : 'Keine gemeinsamen Interessen.'}
        </Typography>
      </CardContent>
    </Card>
  );
}
