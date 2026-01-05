import React from "react";
import { Box, Typography } from "@mui/material";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => (
  <Box sx={{ textAlign: "center", mt: 6, mb: 4 }}>
    <Typography variant="h3" sx={{ mb: 2, color: "#fff", fontWeight: 900, letterSpacing: 1, textShadow: "0 2px 12px #2e1a47" }}>
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body1"
        sx={{
          color: title.toLowerCase().includes('coaching') ? '#b39ddb' : '#d1c4e9',
        }}
      >
        {description}
      </Typography>
    )}
  </Box>
);

export default SectionHeader;
