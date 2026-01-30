import { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LaunchIcon from "@mui/icons-material/Launch";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { 
  Box, 
  Button, 
  Checkbox, 
  Chip, 
  Link, 
  Stack, 
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArchiveIcon from '@mui/icons-material/Archive';

const ActionSection = () => {
  // Data for skill chips
  const skills = [
    "Communication",
    "Data analysis",
    "Strategic Thinking",
    "Empathy",
    "Prioritization",
  ];

  // Data for candidate info
  const candidateInfo = [
    { icon: <WorkOutlineIcon fontSize="small" />, text: "6 years" },
    { icon: <AttachMoneyIcon fontSize="small" />, text: "400k-600k" },
    { icon: <AccessTimeIcon fontSize="small" />, text: "Available immediately" },
    { icon: <PersonSearchIcon fontSize="small" />, text: "Open to trial" },
  ];

  // Add these new states and handlers
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateApplicationStage = async (stage: string) => {
    try {
      const response = await fetch('https://app.elevatehr.ai/wp-json/elevatehr/v1/applications/move-stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          stage,
          entries: [/* Add your submission ID here */]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stage');
      }
      handleClose();
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "white",
        borderBottom: "0.8px solid rgba(17, 17, 17, 0.08)",
        py: 3,
        px: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Checkbox size="small" sx={{ mr: 1, p: 0 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "1.125rem",
            color: "rgba(17, 17, 17, 0.92)",
            lineHeight: "18px",
          }}
        >
          Israel Nwachukwu
        </Typography>
      </Box>

      <Stack direction="row" spacing={3.5} alignItems="center" sx={{ mt: 1 }}>
        {candidateInfo.map((info, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            {info.icon}
            <Typography
              sx={{
                color: "rgba(17, 17, 17, 0.68)",
                fontSize: "1rem",
                lineHeight: "16px",
              }}
            >
              {info.text}
            </Typography>
          </Stack>
        ))}

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Link
            underline="always"
            sx={{
              color: "rgba(17, 17, 17, 0.92)",
              fontSize: "1rem",
              lineHeight: "16px",
              cursor: "pointer",
            }}
          >
            Resume
          </Link>
          <LaunchIcon sx={{ fontSize: 20 }} />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            sx={{
              bgcolor: "#efefef",
              color: "rgba(17, 17, 17, 0.68)",
              borderRadius: "28px",
              fontSize: "0.875rem",
              fontWeight: 400,
              height: "32px",
            }}
          />
        ))}
      </Stack>

      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: "38px",
          right: "24px",
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "text.secondary",
          borderColor: "rgba(0, 0, 0, 0.12)",
          py: 1.5,
          px: 2,
        }}
      >
        Quick actions
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'quick-actions-button',
        }}
      >
        <MenuItem onClick={() => {
          // Handle view application
          handleClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View application</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => updateApplicationStage('rejection')}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => updateApplicationStage('skill_assessment')}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to Assessment</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => updateApplicationStage('archive')}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ActionSection;
