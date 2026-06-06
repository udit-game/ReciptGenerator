const now = new Date();

export const datePart = now.toLocaleDateString("en-GB").replace(/\//g, "-");
// 06-06-2026

export const timePart = now
  .toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  .replace(":", "-")
  .replace(" ", "_");