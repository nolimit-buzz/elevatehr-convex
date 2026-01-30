import React, { useState } from "react";
import { InputBase, IconButton, InputBaseProps, Typography, Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const StyledInputWrapper = styled('div')(({ theme }) => ({
  position: "relative",
  width: "100%",
  borderRadius: "8px",
  border: "0.5px solid rgba(17, 17, 17, 0.12)",
  background: "#F3F4F7",
  padding: "8px",
  [theme.breakpoints.up('sm')]: {
    padding: "12px"
  },
  display: "flex",
  flexDirection: "column",
}));

const StyledLabel = styled('label')(({ theme }) => ({
  color: "rgba(17, 17, 17, 0.68)",
  fontSize: "14px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "100%",
  marginBottom: 0,
  [theme.breakpoints.up('sm')]: {
    marginBottom: "4px"
  }
}));

const StyledInputContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  position: "relative",
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  width: "100%",
  fontSize: "16px",
  fontWeight: 400,
  background: "transparent",
  border: "none",
  outline: "none",
  paddingRight: "40px",
  "& input": {
    "&::placeholder": {
      color: "rgba(17, 17, 17, 0.38)",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "100%",
    },
  },
}));

const IconWrapper = styled('div')(({ theme }) => ({
  position: "absolute",
  right: "10px",
  cursor: "pointer",
}));

interface CustomInputProps extends Omit<InputBaseProps, 'type'> {
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  helperText?: string;
  error?: boolean;
}

const CustomTextField: React.FC<CustomInputProps> = ({ 
  label, 
  placeholder, 
  type = 'text',
  helperText,
  error,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleTogglePassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <StyledInputWrapper>
      <StyledLabel>{label}</StyledLabel>
      <StyledInputContainer>
        <StyledInput 
          placeholder={placeholder} 
          type={type === "password" && !showPassword ? "password" : "text"} 
          {...props} 
        />
        {type === "password" && (
          <IconWrapper onClick={handleTogglePassword}>
            <IconButton size="small">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </IconWrapper>
        )}
      </StyledInputContainer>
      {helperText && (
        <Typography 
          variant="caption" 
          color={error ? "error" : "textSecondary"}
          sx={{ mt: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </StyledInputWrapper>
  );
};

export default CustomTextField;
