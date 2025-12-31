import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";

function fmtMs(ms: number) {
  if (!ms) return "—";
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const mmm = ms % 1000;
  return `${mm}:${String(ss).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

interface Props {
  sessionName: string;
  circuitName: string;
  fastestLapMs: number;
  onClick?: () => void;
}

export default function SessionCard({
  sessionName,
  circuitName,
  fastestLapMs,
  onClick,
}: Props) {
  return (
    <Card sx={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6">{sessionName}</Typography>

          <Typography color="text.secondary">{circuitName}</Typography>

          <Chip
            label={`Fastest Lap: ${fmtMs(fastestLapMs)}`}
            color="success"
            size="small"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
