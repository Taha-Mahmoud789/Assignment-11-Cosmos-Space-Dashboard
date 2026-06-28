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

// Cache DOM elements to avoid repeated getElementById calls
const domCache = {};
const getCachedEl = (id) => {
  if (!domCache[id]) domCache[id] = document.getElementById(id);
  return domCache[id];
};

// Prevent XSS attacks by converting user input to plain text
const sanitize = (str) => {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
};

// Validate URL - only allow http and https protocols
const sanitizeUrl = (url) => {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {}
  return "#";
};

// Convert date to readable string: "2024-03-14" → "March 14, 2024"
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Capitalize first letter: "earth" → "Earth"
const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

// Show loading spinner in a container
const showLoading = (containerId, message = "Loading...") => {
  const el = getCachedEl(containerId);
  if (el) {
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
        <p class="text-slate-400">${sanitize(message)}</p>
      </div>`;
  }
};

// Show error message in a container
const showError = (containerId, message = "Something went wrong") => {
  const el = getCachedEl(containerId);
  if (el) {
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
        <p class="text-slate-400">${sanitize(message)}</p>
      </div>`;
  }
};
