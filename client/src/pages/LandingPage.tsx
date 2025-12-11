import { Box } from "@mui/material";
import AppBar from "../components/AppBar";
import HeroBanner from "../components/HeroBanner";
import RecentSessions from "../components/RecentSessions";
import Footer from "../components/Footer";

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
        }}
      >
        <Box>
          <RecentSessions />
        </Box>
        <Box>
          <RecentSessions />
        </Box>
        <Box>
          <RecentSessions />
        </Box>
        <Box>
          <RecentSessions />
        </Box>
      </Box>
      <Footer />
    </>
  );
}

export default LandingPage;
