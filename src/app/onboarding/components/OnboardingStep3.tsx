"use client";
import React from "react";
import { Typography, TextField, Stack, InputAdornment, FormControlLabel, Switch } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import metadata from "@/utils/metadata";

interface OnboardingStep3Props {
  data: {
    booking_link: string;
  };
  onUpdate: (data: { booking_link: string }) => void;
}
// 
const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ data, onUpdate }) => {
  const defaultLink = metadata.defaultBookingLink;

//   const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     onUpdate({ booking_link: event.target.checked ? defaultBookingLink : '' });
//   };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ booking_link: event.target.value });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight="bold">Booking Link</Typography>
      <Typography color="grey.200" maxWidth="600px">
        Set up your booking link for candidate interviews.
      </Typography>
      
      {/* <FormControlLabel
        control={<Switch checked={useDefault} onChange={handleSwitchChange} />}
        label="Use default ElevateHR booking system"
      /> */}

      <TextField
        fullWidth
        label="Booking Link"
            placeholder="https://yourcompany.com/booking"
            value={data.booking_link}
        onChange={handleChange}
        disabled={defaultLink === data.booking_link}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarToday color="action" />
            </InputAdornment>
          ),
        }}
        variant="outlined"
        sx={{ mt: 2 }}
      />
    </Stack>
  );
};

export default OnboardingStep3;
