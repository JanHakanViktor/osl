import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { getOslAppShell } from "../../../theme";

type TournamentPageHeaderProps = {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
};

export default function TournamentPageHeader({
  eyebrow,
  title,
  children,
}: TournamentPageHeaderProps) {
  return (
    <Box component="header" sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{
            color: (theme) => getOslAppShell(theme).accent,
            fontWeight: 800,
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: "2rem", sm: "2.6rem", md: "3.2rem" },
          fontWeight: 900,
          lineHeight: 1.05,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      {children && (
        <Stack
          direction="row"
          justifyContent="center"
          flexWrap="wrap"
          gap={1}
          mt={2}
        >
          {children}
        </Stack>
      )}
    </Box>
  );
}
