// ============================================
// COSMOS Space Dashboard - JavaScript Code
// ============================================

// ----- API URLs -----
const NASA_KEY = "LJPJW3LltCksOSFvtGNrUys7PqvbPPelJw96zwJi";
const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`;
const limit = 10;
const LAUNCH_URL = `https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=${limit}`;
const PLANET_URL = "https://solar-system-opendata-proxy.vercel.app/api/planets";

// ----- Helper -----
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ============================================
// SECTION 1: Navigation & Mobile Sidebar
// ============================================

// --- Switch between sections when clicking a nav link ---
const switchSection = function (e) {
  e.preventDefault();
  const link = this;
  const id = link.dataset.section;

  document.querySelectorAll(".app-section").forEach((s) => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.remove("bg-blue-500/10", "text-blue-400");
    l.classList.add("text-slate-300");
  });
  link.classList.remove("text-slate-300");
  link.classList.add("bg-blue-500/10", "text-blue-400");
};

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", switchSection.bind(link));
});

// --- Mobile sidebar: toggle with overlay background ---
const sidebar = document.getElementById("sidebar");
const overlay = document.createElement("div");
overlay.className = "sidebar-overlay";
overlay.style.display = "none";
document.body.appendChild(overlay);

overlay.addEventListener("click", () => {
  sidebar.classList.remove("sidebar-open");
  overlay.style.display = "none";
});

document.getElementById("sidebar-toggle").addEventListener("click", () => {
  const isOpen = sidebar.classList.contains("sidebar-open");
  sidebar.classList.toggle("sidebar-open");
  overlay.style.display = isOpen ? "none" : "block";
});

// ============================================
// SECTION 2: Today in Space (NASA APOD API)
// ============================================

const loadAPOD = (date) => {
  const loading = document.getElementById("apod-loading");
  const img = document.getElementById("apod-image");

  loading.classList.remove("hidden");
  img.classList.add("hidden");

  const url = date ? `${APOD_URL}&date=${date}` : APOD_URL;

  fetch(url)
    .then((res) => res.json())
    .then(
      ({
        title,
        explanation,
        copyright,
        media_type,
        hdurl,
        url: imgUrl,
        date: apodDate,
      }) => {
        if (!apodDate) throw new Error("API error");

        document.getElementById("apod-title").innerText = title;
        document.getElementById("apod-date").innerText =
          "Astronomy Picture of the Day";
        document.getElementById("apod-date-info").innerText = apodDate;
        document.getElementById("apod-explanation").innerText = explanation;
        document.getElementById("apod-copyright").innerHTML = copyright
          ? `&copy; ${copyright}`
          : "&copy; NASA";
        document.getElementById("apod-media-type").innerText =
          media_type === "video" ? "Video" : "Image";

        loading.classList.add("hidden");

        if (media_type === "image") {
          img.src = hdurl || imgUrl;
          img.alt = title;
          img.classList.remove("hidden");
          const old = document.querySelector("#apod-image-container iframe");
          if (old) old.remove();
        } else if (media_type === "video") {
          img.classList.add("hidden");
          let vid = document.querySelector("#apod-image-container iframe");
          if (!vid) {
            vid = document.createElement("iframe");
            vid.className = "w-full h-full";
            vid.style.minHeight = "300px";
            vid.allowFullscreen = true;
            document.getElementById("apod-image-container").appendChild(vid);
          }
          vid.src = imgUrl;
        }

        document.getElementById("apod-date-input").value = apodDate;
        const label = document.querySelector(".date-input-wrapper");
        if (label) label.setAttribute("data-date", formatDate(apodDate));
      },
    )
    .catch(() => {
      loading.classList.add("hidden");
      img.classList.remove("hidden");
      document.getElementById("apod-title").innerText = "Unable to load image";
      document.getElementById("apod-explanation").innerText =
        "NASA API is temporarily unavailable. This is a server-side issue (503). Please try again later or check back after some time.";
    });
};

// Set today's date as initial value, max, and label
const today = new Date().toISOString().split("T")[0];
document.getElementById("apod-date-input").value = today;
document.getElementById("apod-date-input").max = today;
const initLabel = document.querySelector(".date-input-wrapper");
if (initLabel) initLabel.setAttribute("data-date", formatDate(today));

loadAPOD();

document.getElementById("load-date-btn").addEventListener("click", () => {
  const d = document.getElementById("apod-date-input").value;
  if (d) loadAPOD(d);
});

document.getElementById("today-apod-btn").addEventListener("click", () => {
  const todayBtn = new Date().toISOString().split("T")[0];
  document.getElementById("apod-date-input").value = todayBtn;
  document.getElementById("apod-date-input").max = todayBtn;
  const label = document.querySelector(".date-input-wrapper");
  if (label) label.setAttribute("data-date", formatDate(todayBtn));
  loadAPOD(todayBtn);
});

document
  .getElementById("apod-date-input")
  .addEventListener("change", (e) => {
    const label = document.querySelector(".date-input-wrapper");
    if (label && e.currentTarget.value)
      label.setAttribute("data-date", formatDate(e.currentTarget.value));
  });

// ============================================
// SECTION 3: Upcoming Launches (SpaceDevs API)
// ============================================

const loadLaunches = () => {
  fetch(LAUNCH_URL)
    .then((res) => res.json())
    .then(({ results = [] }) => {
      document.getElementById("launches-count").innerText =
        `${results.length} Launches`;
      document.getElementById("launches-count-mobile").innerText =
        results.length;

      if (results.length > 0) showFeatured(results[0]);
      showGrid(results);
    });
};

// Show the big featured launch card (first launch)
const showFeatured = (l) => {
  const {
    status: statusObj,
    net,
    name: missionName,
    rocket: rocketObj,
    launch_service_provider: providerObj,
    mission,
    pad,
    image,
    url,
  } = l;

  const status = statusObj ? statusObj.abbrev : "TBC";
  const color = status === "Go" ? "green" : status === "TBD" ? "blue" : "yellow";
  const days = net
    ? Math.max(
        0,
        Math.ceil((new Date(net) - new Date()) / (1000 * 60 * 60 * 24)),
      )
    : "?";
  const date = net ? formatDate(net) : "TBD";
  const time = net
    ? new Date(net).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : "TBD";
  const rocket =
    rocketObj && rocketObj.configuration
      ? rocketObj.configuration.full_name || rocketObj.configuration.name
      : "Unknown";
  const provider = providerObj ? providerObj.name : "Unknown";
  const desc = mission ? mission.description : "No description.";
  const loc =
    pad && pad.location
      ? pad.location.name
      : pad
        ? pad.name
        : "Unknown";
  const country =
    pad && pad.location
      ? pad.location.country_code
      : pad
        ? pad.country_code
        : "";
  const imgUrl = image ? image.thumbnail_url || image.image_url : "";

  document.getElementById("featured-launch").innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
    <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
    <div>
    <div class="flex items-center gap-3 mb-4">
    <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold"><i class="fas fa-star"></i> Featured Launch</span>
    <span class="px-4 py-1.5 bg-${color}-500/20 text-${color}-400 rounded-full text-sm font-semibold">${status}</span>
    </div>
    <h3 class="text-3xl font-bold mb-3">${missionName || "Unknown"}</h3>
    <div class="flex gap-4 mb-6 text-slate-400">
    <span><i class="fas fa-building"></i> ${provider}</span>
    <span><i class="fas fa-rocket"></i> ${rocket}</span>
    </div>
    <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
    <i class="fas fa-clock text-2xl text-blue-400"></i>
    <div><p class="text-2xl font-bold text-blue-400">${days}</p><p class="text-xs text-slate-400">Days Until Launch</p></div>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-calendar"></i> Launch Date</p><p class="font-semibold">${date}</p></div>
    <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-clock"></i> Launch Time</p><p class="font-semibold">${time}</p></div>
    <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-map-marker-alt"></i> Location</p><p class="font-semibold text-sm">${loc}</p></div>
    <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-globe"></i> Country</p><p class="font-semibold">${country || "N/A"}</p></div>
    </div>
    <p class="text-slate-300 leading-relaxed">${desc}</p>
    <div class="mt-6">
    <div class="flex flex-col md:flex-row gap-3">
    <a href="${url || "#"}" target="_blank" class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"><i class="fas fa-circle-info"></i>View Full Details</a>
    <div class="flex gap-2 self-end md:self-center">
    <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="far fa-heart"></i></button>
    <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="fas fa-bell"></i></button>
    </div>
    </div>
    </div>
    </div>
    <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
    <img class="w-full h-full object-cover" src="./assets/images/launch-placeholder.png" alt="" />
    ${
      imgUrl
        ? `<img class="absolute inset-0 w-full h-full object-cover" src="${imgUrl}" alt="${missionName}" onerror="this.style.display='none'" />`
        : ""
    }
    <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
    </div>
    </div>
    </div>
    </div>`;
};

// Show the grid of smaller launch cards
const showGrid = (launches) => {
  const grid = document.getElementById("launches-grid");
  let html = "";

  for (const l of launches) {
    const { status: statusObj, net, name: missionName, rocket: rocketObj, launch_service_provider: providerObj, pad, image } = l;

    const status = statusObj ? statusObj.abbrev : "TBD";
    const color = status === "Go" ? "green" : status === "TBD" ? "blue" : "yellow";
    const date = net
      ? new Date(net).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "TBD";
    const time = net
      ? `${new Date(net).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })} UTC`
      : "TBD";
    const rocket =
      rocketObj && rocketObj.configuration
        ? rocketObj.configuration.name
        : "Unknown";
    const provider = providerObj ? providerObj.name : "Unknown";
    const loc =
      pad && pad.location
        ? pad.location.name
        : pad
          ? pad.name
          : "Unknown";
    const imgUrl = image ? image.thumbnail_url || image.image_url : "";

    html += `
      <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
      <div class="relative h-48 bg-slate-900/50 flex items-center justify-center">
      <img class="w-full h-full object-cover" src="./assets/images/launch-placeholder.png" alt="" />
      ${imgUrl ? `<img class="absolute inset-0 w-full h-full object-cover" src="${imgUrl}" alt="${missionName}" onerror="this.style.display='none'" />` : ""}
      <div class="absolute top-3 right-3"><span class="px-3 py-1 bg-${color}-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">${status}</span></div>
      </div>
      <div class="p-5">
      <h4 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">${missionName || "Unknown"}</h4>
      <p class="text-sm text-slate-400 mb-3"><i class="fas fa-building text-xs"></i> ${provider}</p>
      <div class="space-y-2 text-sm mb-4">
      <div><i class="fas fa-calendar text-slate-500 w-4"></i> <span class="text-slate-300">${date}</span></div>
      <div><i class="fas fa-clock text-slate-500 w-4"></i> <span class="text-slate-300">${time}</span></div>
      <div><i class="fas fa-rocket text-slate-500 w-4"></i> <span class="text-slate-300">${rocket}</span></div>
      <div><i class="fas fa-map-marker-alt text-slate-500 w-4"></i> <span class="text-slate-300">${loc}</span></div>
      </div>
      </div>
      </div>`;
  }

  grid.innerHTML = html;
};

loadLaunches();

// ============================================
// SECTION 4: Planets (Solar System OpenData API)
// ============================================

// Map planet IDs to their image file names and colors
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

let PLANET_DATA = null;

// Show planet details in the right panel
const capitalize = (s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

const showPlanet = (id) => {
  const { img } = PLANET_MAP[id];

  document.getElementById("planet-detail-image").src = `./assets/images/${img}`;
  document.getElementById("planet-detail-name").innerText = capitalize(id);
  document.getElementById("planet-detail-description").innerText = `${capitalize(id)} is a planet in our solar system.`;

  if (PLANET_DATA?.bodies) {
    for (const b of PLANET_DATA.bodies) {
      const key = (b.englishName || b.id || "").toLowerCase();
      if (key === id) {
        updatePlanetDetail(b);
        break;
      }
    }
  }
};

const getTypeInfo = (id) => {
  if (["jupiter", "saturn"].includes(id))
    return { type: "Gas Giant", style: "background-color:#a855f780;color:#c084fc" };
  if (["uranus", "neptune"].includes(id))
    return { type: "Ice Giant", style: "background-color:#3b82f680;color:#60a5fa" };
  return { type: "Terrestrial", style: "background-color:#f9731680;color:#fb923c" };
};

// Build the comparison table
const buildTable = (data) => {
  const tbody = document.getElementById("planet-comparison-tbody");
  tbody.innerHTML = "";

  if (!data?.bodies) return;

  const ids = ["uranus", "neptune", "jupiter", "mars", "mercury", "saturn", "earth", "venus"];

  for (const id of ids) {
    const info = PLANET_MAP[id];
    const name = capitalize(id);

    let body = null;
    for (const b of data.bodies) {
      const key = (b.englishName || b.id || "").toLowerCase();
      if (key === id) {
        body = b;
        break;
      }
    }

    if (!body) continue;

    const { semimajorAxis, meanRadius, mass, sideralOrbit, moons } = body;

    const distance = semimajorAxis
      ? (semimajorAxis / 149600000).toFixed(2)
      : "—";
    const diameter = meanRadius
      ? Math.round(meanRadius * 2).toLocaleString("en-US")
      : "—";
    const massEM = mass?.massValue
      ? ((mass.massValue * 10 ** mass.massExponent) / (5.97 * 10 ** 24)).toFixed(3)
      : "—";
    const orbital = sideralOrbit
      ? sideralOrbit < 365.25
        ? `${Math.round(sideralOrbit)} days`
        : `${(sideralOrbit / 365.25).toFixed(1)} years`
      : "—";
    const moonCount = moons ? moons.length : 0;
    const typeInfo = getTypeInfo(id);

    const row = document.createElement("tr");
    row.className = `hover:bg-slate-800/30 transition-colors${id === "earth" ? " bg-blue-500/5" : ""}`;
    row.innerHTML = `
      <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
      <div class="flex items-center space-x-2 md:space-x-3">
      <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color:${info.color}"></div>
      <span class="font-semibold text-sm md:text-base whitespace-nowrap">${name}</span>
      </div>
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${distance}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${diameter}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${massEM}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${orbital}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${moonCount}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap"><span class="px-2 py-1 rounded text-xs" style="${typeInfo.style}">${typeInfo.type}</span></td>`;

    tbody.appendChild(row);
  }
};

// Fetch planet data from API
const loadPlanets = () => {
  fetch(PLANET_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      return res.json();
    })
    .then((data) => {
      PLANET_DATA = data;
      buildTable(data);
      if (data.bodies?.length > 0) showPlanet("uranus");
    })
    .catch((err) => console.log("Solar System API error:", err));
};

loadPlanets();

// Update planet detail fields from API data
const updatePlanetDetail = (body) => {
  const { description, englishName, semimajorAxis, meanRadius, mass, density, sideralOrbit, sideralRotation, moons, gravity, discoveredBy, discoveryDate, bodyType, perihelion, aphelion, eccentricity, inclination, axialTilt, avgTemp, escape, vol } = body;

  document.getElementById("planet-detail-description").innerText =
    description || `${englishName} is a planet in our solar system.`;

  const info = [
    ["planet-distance", semimajorAxis && `${(semimajorAxis / 1e6).toFixed(1)}M km`],
    ["planet-radius", meanRadius && `${Math.round(meanRadius)} km`],
    ["planet-mass", mass?.massValue && `${mass.massValue} × 10^${mass.massExponent} kg`],
    ["planet-density", density && `${density.toFixed(2)} g/cm³`],
    ["planet-orbital-period", sideralOrbit && `${sideralOrbit.toFixed(2)} days`],
    ["planet-rotation", sideralRotation && `${sideralRotation.toFixed(2)} hours`],
    ["planet-moons", moons != null ? `${moons.length}` : "0"],
    ["planet-gravity", gravity && `${gravity} m/s²`],
    ["planet-discoverer", discoveredBy || "Known since antiquity"],
    ["planet-discovery-date", discoveryDate || "Ancient times"],
    ["planet-body-type", bodyType],
    ["planet-perihelion", perihelion && `${(perihelion / 1e6).toFixed(1)}M km`],
    ["planet-aphelion", aphelion && `${(aphelion / 1e6).toFixed(1)}M km`],
    ["planet-eccentricity", eccentricity != null && eccentricity.toFixed(5)],
    ["planet-inclination", inclination != null && `${inclination.toFixed(2)}°`],
    ["planet-axial-tilt", axialTilt != null && `${axialTilt}°`],
    ["planet-temp", avgTemp != null && `${avgTemp}°C`],
    ["planet-escape", escape && `${(escape / 1000).toFixed(2)} km/s`],
    ["planet-volume", vol?.volValue && `${vol.volValue} × 10^${vol.volExponent} km³`],
  ];

  for (const [elId, val] of info) {
    document.getElementById(elId).innerText = val || "—";
  }

  // ---- Build Quick Facts list ----
  const factChecks = [
    [mass?.massValue, `Mass: ${mass.massValue} × 10^${mass.massExponent} kg`],
    [gravity, `Surface gravity: ${gravity} m/s²`],
    [density, `Density: ${density.toFixed(2)} g/cm³`],
    [axialTilt != null, `Axial tilt: ${axialTilt}°`],
  ];

  const facts = document.getElementById("planet-facts");
  facts.innerHTML = "";

  for (const [condition, text] of factChecks) {
    if (!condition) continue;
    const li = document.createElement("li");
    li.className = "flex items-start";
    li.innerHTML = `<i class="fas fa-check text-green-400 mt-1 mr-2"></i><span class="text-slate-300">${text}</span>`;
    facts.appendChild(li);
  }
};

// When user clicks a planet card, show its details
document.querySelectorAll(".planet-card").forEach((card) => {
  card.addEventListener("click", showPlanet.bind(null, card.dataset.planetId));
});
