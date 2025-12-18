import { Box } from "@mui/material";

type Props = {
  src: string;
  alt: string;
  size?: number;
};

const TeamLogo = ({ src, alt, size = 48 }: Props) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    </Box>
  );
};

export default TeamLogo;
