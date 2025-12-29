import { Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import type { SessionFormValues } from "../../types/session.types";

const CreateGamePage = () => {
  const { control, handleSubmit } = useForm<SessionFormValues>({
    defaultValues: {
      sessionName: "",
      cleanLapsEnabled: false,
      speedTrapEnabled: false,
    },
  });

  const onSubmit = (data: SessionFormValues) => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <Typography fontWeight="bold" mt={4} textAlign="center" variant="h3">
          SESSION SETTINGS
        </Typography>
        <Box></Box>
      </Box>
    </form>
  );
};

export default CreateGamePage;
