import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { SessionFormValues } from "../../types/session.types";
import CircuitLibrary from "../../data/circuit";
import { createSession, startSession } from "../../service/session";
import { useNavigate } from "react-router";
import BackButton from "../../components/auth/BackButton";

const CreateSessionPage = () => {
  const navigate = useNavigate();
  const { register, control, handleSubmit } = useForm<SessionFormValues>({
    defaultValues: {
      sessionName: "",
      circuitId: Number(CircuitLibrary[0].trackId),
      limitType: "TIME",
    },
  });

  const limitType = useWatch({
    control,
    name: "limitType",
    defaultValue: "TIME",
  });

  const onSubmit = async (data: SessionFormValues) => {
    try {
      const created = await createSession(data);

      if (!created?._id) {
        throw new Error("Session ID missing");
      }

      await startSession(created._id);

      navigate(`/sessions/${created._id}/live`);
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box maxWidth={600} mx="auto" p={2}>
        <BackButton path="/" sx={{}} />
        <Typography
          fontWeight="bold"
          mt={4}
          mb={3}
          textAlign="center"
          variant="h3"
        >
          SESSION SETTINGS
        </Typography>

        <TextField
          fullWidth
          label="Session name"
          {...register("sessionName", { required: true })}
          margin="normal"
        />

        <Controller
          name="circuitId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              label="Circuit"
              margin="normal"
              {...field}
            >
              {CircuitLibrary.map((circuit) => (
                <MenuItem key={circuit.trackId} value={Number(circuit.trackId)}>
                  {circuit.circuit}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="limitType"
          control={control}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              label="Limit type"
              margin="normal"
              {...field}
            >
              <MenuItem value="TIME">Time</MenuItem>
              <MenuItem value="LAPS">Laps</MenuItem>
            </TextField>
          )}
        />

        {limitType === "TIME" && (
          <TextField
            fullWidth
            label="Time limit (seconds)"
            type="number"
            {...register("timeLimitSeconds", { valueAsNumber: true })}
            margin="normal"
          />
        )}

        {limitType === "LAPS" && (
          <TextField
            fullWidth
            label="Lap limit"
            type="number"
            {...register("lapLimit", { valueAsNumber: true })}
            margin="normal"
          />
        )}

        <Button
          fullWidth
          color="error"
          size="large"
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
        >
          Start Session
        </Button>
      </Box>
    </form>
  );
};

export default CreateSessionPage;
