import type { DesktopApi } from "./desktop-api";

export {};

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
