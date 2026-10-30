import { Box } from "@mui/material";
import type { TyreCompound } from "../../../types/liveTiming.types";
import { TYRE_STYLES } from "../liveTimingView";

type TyreBadgeProps = {
  compound: TyreCompound | null;
  size?: number;
};

export default function TyreBadge({ compound, size = 22 }: TyreBadgeProps) {
  if (!compound) return null;

  const style = TYRE_STYLES[compound];
  return (
    <Box
      component="span"
      title={compound.toLowerCase()}
      sx={{
        width: size,
        height: size,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "50%",
        border: `3px solid ${style.color}`,
        color: style.color,
        fontSize: size * 0.48,
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {style.label}
    </Box>
  );
}
