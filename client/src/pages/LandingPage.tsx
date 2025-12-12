import { Box } from "@mui/material";
import AppBar from "../components/AppBar";
import HeroBanner from "../components/HeroBanner";
import RecentSessions from "../components/RecentSessions";
import Footer from "../components/Footer";
import MostPlayedCircuit from "../components/MostPlayedCircuit";

function LandingPage() {
  return (
    <>
      <AppBar />
      <HeroBanner />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 1,
          p: 2,

          // Important: give the grid a sensible height so "1fr" rows have meaning
          // Adjust minHeight to taste (keeps layout consistent across viewports)
          minHeight: "68vh",

          // Ensure grid cells stretch to the full row height
          alignItems: "stretch",

          // Optional: ensure every direct grid child occupies full height of its cell
          "& > div": {
            height: "100%",
          },
        }}
      >
        {/* Top-left (fills cell) */}
        <Box>
          <RecentSessions />
        </Box>

        {/* Top-right (fills cell) */}
        <Box>
          <MostPlayedCircuit />
        </Box>

        <Box></Box>
        <Box></Box>
      </Box>

      <Footer />
    </>
  );
}

export default LandingPage;
