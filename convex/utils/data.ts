export const requiredData = [
  {
    type: "text",
    label: "First Name",
    key: "firstname",
    required: true,
  },
  {
    type: "text",
    label: "Last Name",
    key: "lastname",
    required: true,
  },
  {
    type: "email",
    label: "Email",
    key: "email",
    required: true,
  },
  {
    type: "text",
    label: "Location",
    key: "location",
    required: true,
  },
  {
    type: "number",
    label: "Years of Experience",
    key: "experience",
    required: true,
  },
  {
    type: "text",
    label: "Relevant Skills",
    key: "skills",
    required: true,
  },
  {
    type: "number",
    label: "Expected Salary",
    key: "salary",
    required: true,
  },
  {
    type: "select",
    label: "Availability",
    key: "availability",
    required: true,
    options: {
      immediately: "Immediately",
      week: "Week",
      month: "Month",
      "2_months": "2 months",
    },
  },
  {
    type: "file",
    label: "CV",
    key: "cv",
    required: true,
    allowed_types: ["pdf", "doc", "docx"],
  },
];
