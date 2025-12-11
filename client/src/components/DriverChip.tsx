import { Avatar, Box, Chip, Typography } from "@mui/material";

export interface DriverChipProps {
  id: string;
  name: string;
  team: string;
  avatarUrl?: string;
}

const DriverChip = ({ driverDetails }: { driverDetails: DriverChipProps }) => {
  return (
    <Chip
      avatar={
        <Avatar
          src={driverDetails.avatarUrl ?? undefined} // TODO: Add standard avatar if no avatar is found
          sx={{
            width: 36,
            height: 36,
            bgcolor: "grey.200",
            color: "text.primary",
          }}
        >
          {!driverDetails.avatarUrl && driverDetails.name
            ? driverDetails.name.charAt(0)
            : null}
        </Avatar>
      }
      label={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {driverDetails.name}
          </Typography>
          {driverDetails.team && (
            <Typography variant="caption" color="text.secondary">
              {driverDetails.team}
            </Typography>
          )}
        </Box>
      }
      sx={{ py: 4, px: 2, backgroundColor: "#ff0000ff" }}
    />
  );
};

export default DriverChip;
