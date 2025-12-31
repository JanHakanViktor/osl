import { useEffect, useState } from "react";
import { Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { getSessionHistory } from "../../service/session";
import SessionCard from "../../components/SessionHistory";
import BackButton from "../../components/auth/BackButton";

interface SessionItem {
  id: string;
  sessionName: string;
  circuitName: string;
  fastestLapMs: number;
}

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getSessionHistory();
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <BackButton path="/" />
      <Stack spacing={3}>
        <Typography fontWeight="bold" textAlign="center" variant="h3">
          SESSION SETTINGS
        </Typography>

        {loading && <Typography>Loading sessions…</Typography>}

        {!loading && sessions.length === 0 && (
          <Typography color="text.secondary">
            No completed sessions yet
          </Typography>
        )}

        <Stack spacing={2}>
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              sessionName={s.sessionName}
              circuitName={s.circuitName}
              fastestLapMs={s.fastestLapMs}
              onClick={() => navigate(`/sessions/${s.id}/overview`)}
            />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
