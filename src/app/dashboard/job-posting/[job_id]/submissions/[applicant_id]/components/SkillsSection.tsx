"use client";
import React from "react";
import { Stack, Chip } from "@mui/material";

interface SkillsSectionProps {
  skills?: string;
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ my: 3, flexWrap: "wrap", gap: 1 }}>
      {skills.split(",").map((skill: string, index: number) => {
        const colorIndex = index % 4;
        const colors = [
          { bg: "rgba(114, 74, 59, 0.15)", color: "rgba(114, 74, 59, 1)" },
          { bg: "rgba(43, 101, 110, 0.15)", color: "#2B656E" },
          { bg: "rgba(118, 50, 95, 0.15)", color: "#76325F" },
          { bg: "rgba(59, 95, 158, 0.15)", color: "#3B5F9E" },
        ];
        return (
          <Chip
            key={index}
            label={skill.trim()}
            title={skill.trim()}
            sx={{
              bgcolor: colors[colorIndex].bg,
              color: colors[colorIndex].color,
              borderRadius: "16px",
              maxWidth: 240,
              "& .MuiChip-label": {
                px: 2,
                py: 0.5,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              },
            }}
          />
        );
      })}
    </Stack>
  );
}
