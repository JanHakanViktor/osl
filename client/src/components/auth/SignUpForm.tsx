import { Box } from "@mui/material";
import { DriverProfileChip } from "../DriverProfileChip";

const SignUpForm = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "700px" }}>
      <Box sx={{ flex: 1 }}>forms</Box>
      <Box sx={{ flex: 1, ml: 4, mt: 20 }}>
        <DriverProfileChip />
      </Box>
    </Box>
  );
};
export default SignUpForm;
