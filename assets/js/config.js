const CONFIG = {
  NASA_KEY: "LJPJW3LltCksOSFvtGNrUys7PqvbPPelJw96zwJi",
  get APOD_URL() {
    return `https://api.nasa.gov/planetary/apod?api_key=${this.NASA_KEY}`;
  },
  LAUNCH_LIMIT: 10,
  get LAUNCH_URL() {
    return `https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=${this.LAUNCH_LIMIT}`;
  },
  PLANET_URL: "https://solar-system-opendata-proxy.vercel.app/api/planets",
};

const PLANET_MAP = {
  mercury: { color: "#eab308", img: "mercury.png" },
  venus: { color: "#f97316", img: "venus.png" },
  earth: { color: "#3b82f6", img: "earth.png" },
  mars: { color: "#ef4444", img: "mars.png" },
  jupiter: { color: "#fb923c", img: "jupiter.png" },
  saturn: { color: "#facc15", img: "saturn.png" },
  uranus: { color: "#06b6d4", img: "uranus.png" },
  neptune: { color: "#2563eb", img: "neptune.png" },
};
