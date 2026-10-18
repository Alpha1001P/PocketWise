export function isMobileDevice() {
  return window.matchMedia("(max-width: 767px)").matches;
}