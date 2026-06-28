// ============================================
// Utility Functions
// ============================================

// DOM element cache to avoid repeated getElementById calls
const domCache = {};
const getCachedEl = (id) => {
  if (!domCache[id]) {
    domCache[id] = document.getElementById(id);
  }
  return domCache[id];
};

// Sanitize text to prevent XSS when inserting into innerHTML
const sanitize = (str) => {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
};

// Sanitize a URL - only allow http/https
const sanitizeUrl = (url) => {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {}
  return "#";
};

// Debounce function
const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Throttle function
const throttle = (fn, limit = 300) => {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Format date to readable string
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Capitalize first letter
const capitalize = (s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

// Safe fetch with timeout
const safeFetch = async (url, options = {}) => {
  const { timeout = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// Show loading state in a container
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

// Show error state in a container
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
