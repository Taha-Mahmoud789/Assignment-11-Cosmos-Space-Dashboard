// ============================================
// Planets (Solar System OpenData API)
// ============================================

const initPlanets = () => {
  let PLANET_DATA = null;

  const getTypeInfo = (id) => {
    if (["jupiter", "saturn"].includes(id))
      return { type: "Gas Giant", style: "background-color:#a855f780;color:#c084fc" };
    if (["uranus", "neptune"].includes(id))
      return { type: "Ice Giant", style: "background-color:#3b82f680;color:#60a5fa" };
    return { type: "Terrestrial", style: "background-color:#f9731680;color:#fb923c" };
  };

  const updatePlanetDetail = (body) => {
    const {
      description,
      englishName,
      semimajorAxis,
      meanRadius,
      mass,
      density,
      sideralOrbit,
      sideralRotation,
      moons,
      gravity,
      discoveredBy,
      discoveryDate,
      bodyType,
      perihelion,
      aphelion,
      eccentricity,
      inclination,
      axialTilt,
      avgTemp,
      escape,
      vol,
    } = body;

    getCachedEl("planet-detail-description").innerText =
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
      getCachedEl(elId).innerText = val || "—";
    }

    // Build Quick Facts list
    const factChecks = [
      [mass?.massValue, `Mass: ${mass.massValue} × 10^${mass.massExponent} kg`],
      [gravity, `Surface gravity: ${gravity} m/s²`],
      [density, `Density: ${density.toFixed(2)} g/cm³`],
      [axialTilt != null, `Axial tilt: ${axialTilt}°`],
    ];

    const facts = getCachedEl("planet-facts");
    facts.innerHTML = "";

    for (const [condition, text] of factChecks) {
      if (!condition) continue;
      const li = document.createElement("li");
      li.className = "flex items-start";
      li.innerHTML = `<i class="fas fa-check text-green-400 mt-1 mr-2"></i><span class="text-slate-300">${sanitize(text)}</span>`;
      facts.appendChild(li);
    }
  };

  const showPlanet = (id) => {
    const { img } = PLANET_MAP[id];

    getCachedEl("planet-detail-image").src = `./assets/images/${img}`;
    getCachedEl("planet-detail-name").innerText = capitalize(id);
    getCachedEl("planet-detail-description").innerText = `${capitalize(id)} is a planet in our solar system.`;

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

  const buildTable = (data) => {
    const tbody = getCachedEl("planet-comparison-tbody");
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
        <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color:${sanitize(info.color)}"></div>
        <span class="font-semibold text-sm md:text-base whitespace-nowrap">${sanitize(name)}</span>
        </div>
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${sanitize(distance)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${sanitize(diameter)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${sanitize(massEM)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${sanitize(orbital)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${sanitize(moonCount)}</td>
        <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap"><span class="px-2 py-1 rounded text-xs" style="${sanitize(typeInfo.style)}">${sanitize(typeInfo.type)}</span></td>`;

      tbody.appendChild(row);
    }
  };

  const loadPlanets = async () => {
    showLoading("planet-detail-description", "Loading planet data...");
    showLoading("planet-comparison-tbody", "Loading comparison data...");

    try {
      const data = await safeFetch(CONFIG.PLANET_URL);
      PLANET_DATA = data;
      buildTable(data);

      // Reset description after data loads
      getCachedEl("planet-detail-description").innerText = "";
      if (data.bodies?.length > 0) showPlanet("uranus");
    } catch (err) {
      console.error("Solar System API error:", err);
      showError("planet-detail-description", "Failed to load planet data.");
      showError("planet-comparison-tbody", "Failed to load comparison data.");
    }
  };

  document.querySelectorAll(".planet-card").forEach((card) => {
    card.addEventListener("click", () => showPlanet(card.dataset.planetId));
  });

  loadPlanets();
};
