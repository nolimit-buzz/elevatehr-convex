import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArchiveIcon from "@mui/icons-material/Archive";

interface QuickActionsProps {
  submissionId: number;
  onViewApplication?: () => void;
  onStageUpdate?: () => void;
}

const QuickActionsDropdown = ({ submissionId, onViewApplication, onStageUpdate }: QuickActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loadingStage, setLoadingStage] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const updateApplicationStage = async (stage: string) => {
    setLoadingStage(true);
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw new Error("Authentication token not found");

      const response = await fetch("https://app.elevatehr.ai/wp-json/elevatehr/v1/applications/move-stage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        cache: "no-store",
        body: JSON.stringify({
          stage,
          entries: [submissionId],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stage");
      }

      setNotification({
        open: true,
        message: `Successfully moved candidate to ${stage.replace("_", " ")}`,
        severity: "success",
      });

      // Call the callback to refresh the parent component
      onStageUpdate?.();
    } catch (error) {
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : "Failed to update stage",
        severity: "error",
      });
    } finally {
      setLoadingStage(false);
      handleClose();
    }
  };

  return (
    <>
      <IconButton
        aria-label="quick actions"
        aria-controls={open ? "quick-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        disabled={loadingStage !== null}
      >
        {loadingStage ? <CircularProgress size={24} /> : <MoreVertIcon />}
      </IconButton>
      <Menu
        id="quick-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "quick-actions-button",
        }}
      >
        <MenuItem
          onClick={() => {
            onViewApplication?.();
            handleClose();
          }}
          disabled={loadingStage !== null}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View application</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => updateApplicationStage("rejection")} disabled={loadingStage !== null}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => updateApplicationStage("skill_assessment")} disabled={loadingStage !== null}>
          <ListItemIcon>
            <AssessmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to Assessment</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => updateApplicationStage("archive")} disabled={loadingStage !== null}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuickActionsDropdown;
