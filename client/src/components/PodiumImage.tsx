import podiumImg from "/podium.png";

const PodiumImage = ({ size = 28 }: { size?: number }) => {
  return (
    <img
      src={podiumImg}
      alt="podium"
      style={{
        width: size,
        height: size,
        display: "block",
        objectFit: "contain",
      }}
    />
  );
};

export default PodiumImage;
