import { useMemo } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { format } from "date-fns";
import TournamentPanel from "../Tournament/components/TournamentPanel";
import TimingBoardDetails from "./components/TimingBoardDetails";
import TimingSessionHeader from "./components/TimingSessionHeader";
import TimingTower from "./components/TimingTower";
import { useTimingSession } from "./hooks/useLiveTiming";
import { buildTowerRows } from "./liveTimingView";

/** A saved game session: its classification and every driver's stats. */
export default function TimingSessionPage() {
  const { sessionUid } = useParams<{ sessionUid: string }>();
  const { data: board, isLoading, error } = useTimingSession(sessionUid);
  const rows = useMemo(
    () => (board ? buildTowerRows(board, null) : []),
    [board],
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Button
        component={RouterLink}
        to="/live-timing/sessions"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Timing sessions
      </Button>

      {isLoading && (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">{error.message}</Typography>}

      {board && (
        <>
          <TimingSessionHeader
            eyebrow={format(
              new Date(board.session.startedAt),
              "d MMM yyyy, HH:mm",
            )}
            session={board.session}
          />
          <TournamentPanel
            title={
              board.session.isFinished ? "Classification" : "Last standings"
            }
            sx={{ mb: { xs: 2, md: 2.5 } }}
          >
            <TimingTower rows={rows} live={false} />
          </TournamentPanel>
          <TimingBoardDetails board={board} />
        </>
      )}
    </Container>
  );
}
