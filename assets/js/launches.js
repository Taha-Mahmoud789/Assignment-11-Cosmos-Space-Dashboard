// ============================================
// Upcoming Launches (SpaceDevs API)
// ============================================

const initLaunches = () => {
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

    getCachedEl("featured-launch").innerHTML = `
      <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
      <div>
      <div class="flex items-center gap-3 mb-4">
      <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold"><i class="fas fa-star"></i> Featured Launch</span>
      <span class="px-4 py-1.5 bg-${sanitize(color)}-500/20 text-${sanitize(color)}-400 rounded-full text-sm font-semibold">${sanitize(status)}</span>
      </div>
      <h3 class="text-3xl font-bold mb-3">${sanitize(missionName) || "Unknown"}</h3>
      <div class="flex gap-4 mb-6 text-slate-400">
      <span><i class="fas fa-building"></i> ${sanitize(provider)}</span>
      <span><i class="fas fa-rocket"></i> ${sanitize(rocket)}</span>
      </div>
      <div class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
      <i class="fas fa-clock text-2xl text-blue-400"></i>
      <div><p class="text-2xl font-bold text-blue-400">${sanitize(days)}</p><p class="text-xs text-slate-400">Days Until Launch</p></div>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-calendar"></i> Launch Date</p><p class="font-semibold">${sanitize(date)}</p></div>
      <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-clock"></i> Launch Time</p><p class="font-semibold">${sanitize(time)}</p></div>
      <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-map-marker-alt"></i> Location</p><p class="font-semibold text-sm">${sanitize(loc)}</p></div>
      <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1"><i class="fas fa-globe"></i> Country</p><p class="font-semibold">${sanitize(country) || "N/A"}</p></div>
      </div>
      <p class="text-slate-300 leading-relaxed">${sanitize(desc)}</p>
      <div class="mt-6">
      <div class="flex flex-col md:flex-row gap-3">
      <a href="${sanitizeUrl(url)}" target="_blank" class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"><i class="fas fa-circle-info"></i>View Full Details</a>
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
          ? `<img class="absolute inset-0 w-full h-full object-cover" src="${sanitizeUrl(imgUrl)}" alt="${sanitize(missionName)}" onerror="this.style.display='none'" />`
          : ""
      }
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>
      </div>
      </div>`;
  };

  const showGrid = (launches) => {
    const grid = getCachedEl("launches-grid");
    let html = "";

    for (const l of launches) {
      const {
        status: statusObj,
        net,
        name: missionName,
        rocket: rocketObj,
        launch_service_provider: providerObj,
        pad,
        image,
      } = l;

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
        ${imgUrl ? `<img class="absolute inset-0 w-full h-full object-cover" src="${sanitizeUrl(imgUrl)}" alt="${sanitize(missionName)}" onerror="this.style.display='none'" />` : ""}
        <div class="absolute top-3 right-3"><span class="px-3 py-1 bg-${sanitize(color)}-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">${sanitize(status)}</span></div>
        </div>
        <div class="p-5">
        <h4 class="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">${sanitize(missionName) || "Unknown"}</h4>
        <p class="text-sm text-slate-400 mb-3"><i class="fas fa-building text-xs"></i> ${sanitize(provider)}</p>
        <div class="space-y-2 text-sm mb-4">
        <div><i class="fas fa-calendar text-slate-500 w-4"></i> <span class="text-slate-300">${sanitize(date)}</span></div>
        <div><i class="fas fa-clock text-slate-500 w-4"></i> <span class="text-slate-300">${sanitize(time)}</span></div>
        <div><i class="fas fa-rocket text-slate-500 w-4"></i> <span class="text-slate-300">${sanitize(rocket)}</span></div>
        <div><i class="fas fa-map-marker-alt text-slate-500 w-4"></i> <span class="text-slate-300">${sanitize(loc)}</span></div>
        </div>
        </div>
        </div>`;
    }

    grid.innerHTML = html;
  };

  const loadLaunches = async () => {
    try {
      const { results = [] } = await safeFetch(CONFIG.LAUNCH_URL);
      getCachedEl("launches-count").innerText = `${results.length} Launches`;
      getCachedEl("launches-count-mobile").innerText = results.length;

      if (results.length > 0) showFeatured(results[0]);
      showGrid(results);
    } catch (err) {
      console.error("Failed to load launches:", err);
      getCachedEl("launches-count").innerText = "0 Launches";
      getCachedEl("launches-count-mobile").innerText = "0";
      getCachedEl("featured-launch").innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 bg-slate-800/30 border border-slate-700 rounded-3xl">
          <i class="fas fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
          <p class="text-slate-400">Unable to load launch data. Please try again later.</p>
        </div>`;
      showError("launches-grid", "Failed to load upcoming launches.");
    }
  };

  loadLaunches();
};
