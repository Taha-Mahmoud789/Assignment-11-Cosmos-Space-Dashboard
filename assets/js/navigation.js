// ============================================
// Navigation & Mobile Sidebar
// ============================================

const initNavigation = () => {
  const sidebar = getCachedEl("sidebar");
  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  overlay.style.display = "none";
  document.body.appendChild(overlay);

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("sidebar-open");
    overlay.style.display = "none";
  });

  getCachedEl("sidebar-toggle").addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("sidebar-open");
    sidebar.classList.toggle("sidebar-open");
    overlay.style.display = isOpen ? "none" : "block";
  });

  const switchSection = function (e) {
    e.preventDefault();
    const link = this;
    const id = link.dataset.section;

    document.querySelectorAll(".app-section").forEach((s) => s.classList.add("hidden"));
    getCachedEl(id).classList.remove("hidden");

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
};
