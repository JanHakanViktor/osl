import { Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { tournamentPath } from "../tournamentRouting";

type TournamentStatusMessageProps =
  | { kind: "loading" }
  | { kind: "error"; message: string };

/** Loading and error states shared by the tournament screens. */
export default function TournamentStatusMessage(
  props: TournamentStatusMessageProps,
) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Stack alignItems="center" spacing={2} textAlign="center">
        {props.kind === "loading" ? (
          <>
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Loading tournament…</Typography>
          </>
        ) : (
          <>
            <Typography variant="h5">{props.message}</Typography>
            <Button
              variant="outlined"
              onClick={() => navigate(tournamentPath.list())}
            >
              Back to tournaments
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
}
