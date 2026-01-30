import React from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Stack,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  TextField,
  Radio,
} from "@mui/material";
import CreatableSelect from "react-select/creatable";
import CloseIcon from "@mui/icons-material/Close";
import { Skill } from "@/app/lib/skills";
import { useTheme } from "@mui/material/styles";

// Styled Components
const StyledSelect = styled(Select)({
  "& .MuiSelect-select": {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid rgba(17, 17, 17, 0.08)",
    padding: "16px",
    color: "rgba(17, 17, 17, 0.84)",
    "&:focus": {
      backgroundColor: "#fff",
    },
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid rgba(17, 17, 17, 0.08)",
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "& .MuiInputBase-input": {
    padding: "16px",
    color: "rgba(17, 17, 17, 0.84)",
    "&::placeholder": {
      color: "rgba(17, 17, 17, 0.48)",
    },
  },
});

const StyledRadio = styled(Radio)({
  color: "rgba(17, 17, 17, 0.6)",
  opacity: 0.68,
  "&.Mui-checked": {
    color: "#4444E2",
  },
});

interface FilterState {
  yearsOfExperience: string;
  salaryMin: string;
  salaryMax: string;
  requiredSkills: string[];
  availability: string;
  trial: string;
}

interface FilterSectionProps {
  filters: FilterState;
  availableSkills: Skill[];
  onFilterChange: (filterName: keyof FilterState, value: string | string[]) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  hasActiveFilters: () => boolean;
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
  sx?: any;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  availableSkills,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hasActiveFilters,
  isMobile = false,
  open,
  onClose,
  sx,
}) => {
  const theme = useTheme();

  const filterContent = (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            mb: 1.5,
            fontSize: "16px",
            fontWeight: 500,
            color: "rgba(17, 17, 17, 0.92)",
          }}
        >
          Years of experience
        </Typography>
        <FormControl fullWidth>
          <Select
            value={filters.yearsOfExperience}
            displayEmpty
            renderValue={(selected) => selected || "Select years"}
            sx={{
              boxShadow: "none",
              backgroundColor: "#fff",
              borderRadius: "12px",
              "& .MuiSelect-select": {
                padding: "16px",
                border: "none",
                boxShadow: "none",
                color: filters.yearsOfExperience ? "rgba(17, 17, 17, 0.84)" : "rgba(17, 17, 17, 0.48)",
              },
            }}
            onChange={(e) => onFilterChange("yearsOfExperience", e.target.value)}
          >
            <MenuItem value="">All years</MenuItem>
            <MenuItem value="1-3">1-3 years</MenuItem>
            <MenuItem value="4-6">4-6 years</MenuItem>
            <MenuItem value="7+">7+ years</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            mb: 1.5,
            fontSize: "16px",
            fontWeight: 500,
            color: "rgba(17, 17, 17, 0.92)",
          }}
        >
          Salary expectation:
        </Typography>
        <Stack spacing={1.5}>
          <StyledTextField
            placeholder="Min: 000000"
            fullWidth
            value={filters.salaryMin}
            onChange={(e) => onFilterChange("salaryMin", e.target.value)}
            type="number"
          />
          <StyledTextField
            placeholder="Max: 000000"
            fullWidth
            value={filters.salaryMax}
            onChange={(e) => onFilterChange("salaryMax", e.target.value)}
            type="number"
          />
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            mb: 1.5,
            fontSize: "16px",
            fontWeight: 500,
            color: "rgba(17, 17, 17, 0.92)",
          }}
        >
          Required skills
        </Typography>
        <CreatableSelect
          instanceId="filter-skills-select"
          isMulti
          options={availableSkills}
          value={filters.requiredSkills.map((skill) => ({ value: skill, label: skill }))}
          onChange={(selectedOptions: any) => {
            const selectedSkills = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
            onFilterChange("requiredSkills", selectedSkills);
          }}
          onCreateOption={(inputValue: string) => {
            onFilterChange("requiredSkills", [...filters.requiredSkills, inputValue]);
          }}
          placeholder="Select or create skills"
          formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
          styles={{
            control: (base: any) => ({
              ...base,
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid rgba(17, 17, 17, 0.08)",
              minHeight: "52px",
              boxShadow: "none",
              "&:hover": {
                borderColor: "rgba(17, 17, 17, 0.08)",
              },
            }),
            menu: (base: any) => ({
              ...base,
              zIndex: 2,
            }),
            option: (base: any, state: any) => ({
              ...base,
              backgroundColor: state.isFocused ? "#F8F9FB" : "white",
              color: "rgba(17, 17, 17, 0.84)",
              cursor: "pointer",
              padding: "12px 16px",
            }),
            multiValue: (base: any) => ({
              ...base,
              backgroundColor: "#E8EAFD",
              borderRadius: "4px",
              padding: "2px 6px",
              margin: "2px",
            }),
            multiValueLabel: (base: any) => ({
              ...base,
              color: "#4444E2",
              fontSize: "14px",
            }),
            multiValueRemove: (base: any) => ({
              ...base,
              color: "#4444E2",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#D8DAFD",
                color: "#4444E2",
              },
            }),
            placeholder: (base: any) => ({
              ...base,
              color: "rgba(17, 17, 17, 0.48)",
            }),
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            mb: 1.5,
            fontSize: "16px",
            fontWeight: 500,
            color: "rgba(17, 17, 17, 0.92)",
          }}
        >
          Availability:
        </Typography>
        <RadioGroup value={filters.availability} onChange={(e) => onFilterChange("availability", e.target.value)}>
          <FormControlLabel
            value="immediately"
            control={<StyledRadio />}
            label="Immediately"
            sx={{
              "& .MuiTypography-root": {
                fontSize: "16px",
                color: "rgba(17, 17, 17, 0.84)",
              },
            }}
          />
          <FormControlLabel
            value="in-a-week"
            control={<StyledRadio />}
            label="In a week"
            sx={{
              "& .MuiTypography-root": {
                fontSize: "16px",
                color: "rgba(17, 17, 17, 0.84)",
              },
            }}
          />
          <FormControlLabel
            value="in-a-month"
            control={<StyledRadio />}
            label="In a month"
            sx={{
              "& .MuiTypography-root": {
                fontSize: "16px",
                color: "rgba(17, 17, 17, 0.84)",
              },
            }}
          />
          <FormControlLabel
            value="in-two-months"
            control={<StyledRadio />}
            label="In two months"
            sx={{
              "& .MuiTypography-root": {
                fontSize: "16px",
                color: "rgba(17, 17, 17, 0.84)",
              },
            }}
          />
        </RadioGroup>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Dialog
        open={open || false}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            borderRadius: 0,
            p: 3,
            maxHeight: "100vh",
            overflow: "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 0,
            mb: 3,
            position: "sticky",
            top: 0,
            bgcolor: "#fff",
            zIndex: 1,
            pt: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "20px",
              fontWeight: 600,
              color: "rgba(17, 17, 17, 0.92)",
            }}
          >
            Filters
          </Typography>
          <Button
            startIcon={<CloseIcon />}
            onClick={onClose}
            sx={{
              color: "rgba(17, 17, 17, 0.72)",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 400,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: "rgba(68, 68, 226, 0.04)",
              },
            }}
          >
            Close
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>{filterContent}</DialogContent>

        <DialogActions sx={{ p: 0, mt: 3 }}>
          <Button
            onClick={onClearFilters}
            sx={{
              color: "rgba(17, 17, 17, 0.72)",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 400,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: "rgba(68, 68, 226, 0.04)",
              },
            }}
          >
            Clear filter
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={!hasActiveFilters()}
            onClick={() => {
              onApplyFilters();
              onClose?.();
            }}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.secondary.light,
              textTransform: "none",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "16px",
              fontWeight: 500,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ p: 3, mb: 2, borderRadius: 2, backgroundColor: "white", width: "20%", minWidth: "300px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            color: "rgba(17, 17, 17, 0.92)",
          }}
        >
          Filters:
        </Typography>
        <Button
          startIcon={<CloseIcon />}
          sx={{
            color: "rgba(17, 17, 17, 0.72)",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 400,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: "rgba(68, 68, 226, 0.04)",
            },
          }}
          onClick={onClearFilters}
        >
          Clear filter
        </Button>
      </Box>

      {filterContent}

      <Button
        variant="contained"
        fullWidth
        disabled={!hasActiveFilters()}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.secondary.light,
          textTransform: "none",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: theme.palette.primary.main,
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
          "&.Mui-disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.12)",
            color: "rgba(0, 0, 0, 0.26)",
          },
        }}
        onClick={onApplyFilters}
      >
        Apply Filter
      </Button>
    </Box>
  );
};

export default FilterSection;
