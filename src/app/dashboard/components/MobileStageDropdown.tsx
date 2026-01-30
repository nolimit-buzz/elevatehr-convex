import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTheme } from '@mui/material/styles';

interface MobileStageDropdownProps {
  subTabValue: number;
  stageTotals: {
    // All is computed client-side; not required here
    new: number;
    skill_assessment: number;
    interviews: number;
    acceptance: number;
    archived: number;
  };
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onFilterClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const MobileStageDropdown: React.FC<MobileStageDropdownProps> = ({
  subTabValue,
  stageTotals,
  onTabChange,
  onFilterClick,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: { xs: "block", lg: "none" }, py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl fullWidth>
          <Select
            value={subTabValue}
            onChange={(e) => {
              const value = e.target.value as number;
              onTabChange(e as unknown as React.SyntheticEvent, value);
            }}
            displayEmpty
            sx={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              "& .MuiSelect-select": {
                padding: "12px",
                fontSize: "16px",
                fontWeight: 500,
                color: "rgba(17, 17, 17, 0.84)",
              },
            }}
          >
            <MenuItem value={0}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>All</span>
                <Chip
                  label={stageTotals.new + stageTotals.skill_assessment + stageTotals.interviews + stageTotals.acceptance + stageTotals.archived}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    height: "20px",
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "12px",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </MenuItem>
            <MenuItem value={1}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>Application Review</span>
                <Chip
                  label={stageTotals.new}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    height: "20px",
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "12px",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </MenuItem>
            <MenuItem value={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>Skill assessment</span>
                <Chip
                  label={stageTotals.skill_assessment}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    height: "20px",
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "12px",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </MenuItem>
            <MenuItem value={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>Interviews</span>
                <Chip
                  label={stageTotals.interviews}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    height: "20px",
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "12px",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </MenuItem>
            <MenuItem value={4}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>Acceptance</span>
                <Chip
                  label={stageTotals.acceptance}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    height: "20px",
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "12px",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </MenuItem>
            <MenuItem value={5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>Archived</span>
                <Chip
                  label={stageTotals.archived}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    height: "20px",
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "12px",
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        <IconButton
          onClick={onFilterClick}
          sx={{
            color: "rgba(17, 17, 17, 0.48)",
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid rgba(17, 17, 17, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(68, 68, 226, 0.04)",
            },
          }}
        >
          <FilterListIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MobileStageDropdown; 