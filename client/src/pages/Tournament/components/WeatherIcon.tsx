import AirIcon from "@mui/icons-material/Air";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import type { SvgIconProps } from "@mui/material";
import type { TournamentWeather } from "../../../types/tournament.types";

const ICONS: Record<TournamentWeather, typeof WbSunnyIcon> = {
  DRY: WbSunnyIcon,
  WET: ThunderstormIcon,
  NIGHT: NightsStayIcon,
  CHANGEABLE: AirIcon,
};

export default function WeatherIcon({
  weather,
  ...props
}: SvgIconProps & { weather: TournamentWeather }) {
  const Icon = ICONS[weather];
  return <Icon {...props} />;
}
