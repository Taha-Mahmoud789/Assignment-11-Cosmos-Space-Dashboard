// ============================================
// Today in Space (NASA APOD API)
// ============================================

const initAPOD = () => {
  const loading = getCachedEl("apod-loading");
  const img = getCachedEl("apod-image");
  const dateInput = getCachedEl("apod-date-input");
  const dateLabel = document.querySelector(".date-input-wrapper");

  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
  dateInput.max = today;
  if (dateLabel) dateLabel.setAttribute("data-date", formatDate(today));

  const loadAPOD = async (date) => {
    loading.classList.remove("hidden");
    img.classList.add("hidden");

    const url = date ? `${CONFIG.APOD_URL}&date=${date}` : CONFIG.APOD_URL;

    try {
      const data = await safeFetch(url);
      const {
        title,
        explanation,
        copyright,
        media_type,
        hdurl,
        url: imgUrl,
        date: apodDate,
      } = data;

      if (!apodDate) throw new Error("API error");

      getCachedEl("apod-title").innerText = title;
      getCachedEl("apod-date").innerText = "Astronomy Picture of the Day";
      getCachedEl("apod-date-info").innerText = apodDate;
      getCachedEl("apod-explanation").innerText = explanation;
      getCachedEl("apod-copyright").innerHTML = copyright
        ? `&copy; ${sanitize(copyright)}`
        : "&copy; NASA";
      getCachedEl("apod-media-type").innerText =
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
          getCachedEl("apod-image-container").appendChild(vid);
        }
        vid.src = imgUrl;
      }

      dateInput.value = apodDate;
      if (dateLabel) dateLabel.setAttribute("data-date", formatDate(apodDate));
    } catch {
      loading.classList.add("hidden");
      img.classList.remove("hidden");
      getCachedEl("apod-title").innerText = "Unable to load image";
      getCachedEl("apod-explanation").innerText =
        "NASA API is temporarily unavailable. Please try again later.";
    }
  };

  loadAPOD();

  getCachedEl("load-date-btn").addEventListener(
    "click",
    debounce(() => {
      const d = dateInput.value;
      if (d) loadAPOD(d);
    }, 500),
  );

  getCachedEl("today-apod-btn").addEventListener("click", () => {
    const todayBtn = new Date().toISOString().split("T")[0];
    dateInput.value = todayBtn;
    dateInput.max = todayBtn;
    if (dateLabel) dateLabel.setAttribute("data-date", formatDate(todayBtn));
    loadAPOD(todayBtn);
  });

  dateInput.addEventListener("change", (e) => {
    if (dateLabel && e.currentTarget.value)
      dateLabel.setAttribute("data-date", formatDate(e.currentTarget.value));
  });
};
