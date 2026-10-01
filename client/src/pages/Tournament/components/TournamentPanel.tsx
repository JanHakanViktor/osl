import type { ReactNode } from "react";
import { Box, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import { getOslAppShell } from "../../../theme";

type TournamentPanelProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
};

/** Card used by every tournament screen, matching the landing widgets. */
export default function TournamentPanel({
  title,
  action,
  children,
  sx,
}: TournamentPanelProps) {
  return (
    <Box
      component="section"
      sx={[
        {
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          bgcolor: "background.paper",
          border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {(title || action) && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          mb={2}
        >
          {title && (
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.15rem", md: "1.45rem" },
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {title}
            </Typography>
          )}
          {action}
        </Stack>
      )}
      {children}
    </Box>
  );
}
