"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  styled,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ADMIN_CARD_SX } from "../../../styles";
import { MOCK_AUDIT_LOG, MOCK_RECRUITERS } from "../../../mock-data";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: "20px 24px",
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

export default function RecruiterActivityLogsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;

  const recruiter = MOCK_RECRUITERS.find((r) => r.id === companyId);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/admin/recruiters/${companyId}`)}
            sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}
          >
            <ArrowLeftIcon style={{ width: 18, height: 18 }} />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Activity log
            </Typography>
            {recruiter && (
              <Typography variant="body2" color="text.secondary">
                for {recruiter.companyName}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          ...ADMIN_CARD_SX,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "transparent",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
              }}
            >
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Time</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Action</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>Details</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 600, color: "text.primary" }}>User</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_AUDIT_LOG.map((entry) => (
              <TableRow key={entry.id} hover>
                <StyledTableCell>{new Date(entry.timestamp).toLocaleString()}</StyledTableCell>
                <StyledTableCell>{entry.action}</StyledTableCell>
                <StyledTableCell>{entry.details}</StyledTableCell>
                <StyledTableCell>{entry.user}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

