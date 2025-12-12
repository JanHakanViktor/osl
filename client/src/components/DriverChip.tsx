import { Avatar, Box, Chip, Typography } from "@mui/material";

export interface DriverProps {
  id: string;
  name: string;
  team?: string | null;
  avatarUrl?: string | null;
}

const DriverChip = ({
  id,
  name,
  team = null,
  avatarUrl = null,
}: DriverProps) => {
  const initialPlaceholder = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <Chip
      key={id}
      avatar={
        <Avatar
          src={avatarUrl ?? undefined}
          sx={{
            bgcolor: "grey.200",
            color: "text.primary",
            fontWeight: 700,
          }}
        >
          {!avatarUrl ? initialPlaceholder : null}
        </Avatar>
      }
      label={
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {name}
          </Typography>

          {team && (
            <Typography
              variant="caption"
              sx={{
                lineHeight: 1,
                color: "#FF8000",
                mb: 1,
              }}
            >
              {team}
            </Typography>
          )}
          <Typography fontSize={"12px"} fontWeight={"bold"}>
            1:04:333
          </Typography>
        </Box>
      }
      sx={{
        py: 2,
        px: 2,
        borderRadius: 1.5,
        color: "white",
        height: "auto",
        bgcolor: "#ffffff24",
        flexGrow: 1,
        justifyContent: "flex-start",
      }}
    />
  );
};

export default DriverChip;
