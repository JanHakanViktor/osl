import { Box } from "@mui/material";
import "flag-icons/css/flag-icons.min.css";
import { findCountry } from "../driverProfile";

type DriverFlagProps = {
  country: string | null;
  /** Flag height in px; the flag is 4:3. */
  size?: number;
};

/** The driver's flag, or nothing when the driver has not chosen a country. */
export default function DriverFlag({ country, size = 16 }: DriverFlagProps) {
  const found = findCountry(country);
  if (!found) return null;

  return (
    <Box
      component="span"
      role="img"
      aria-label={found.name}
      title={found.name}
      className={`fi fi-${found.code.toLowerCase()}`}
      // flag-icons sizes a flag from its font size.
      sx={{
        fontSize: size,
        flexShrink: 0,
        borderRadius: "2px",
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.2)",
      }}
    />
  );
}
