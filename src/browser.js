import { chromium } from "playwright";
import { PROFILE_DIR, SCALE, VIEWPORT, headless } from "./config.js";
import { cursorAssets, cursorScript } from "./cursor.js";

export async function launch({ viewport = VIEWPORT, scale = SCALE, cursors } = {}) {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    // Headless, the full browser (the "chromium" channel) rather than the headless shell, so
    // pages render as they do headed
    ...(headless() ? { headless: true, channel: "chromium" } : { headless: false }),
    viewport,
    deviceScaleFactor: scale,
    // Apps that follow the system theme start light; scenarios can switch it (see cli.js)
    colorScheme: "light",
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-blink-features=AutomationControlled",
      // Render at the take's pixel ratio whatever the display's: on a 1× display (an external
      // monitor, CI) the screencast otherwise comes at half the size
      `--force-device-scale-factor=${scale}`,
      // Keep rendering at full rate when the window is covered or unfocused
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-background-timer-throttling",
    ],
  });
  await context.addInitScript(cursorScript, cursorAssets(cursors));
  const page = context.pages()[0] ?? (await context.newPage());
  return { context, page };
}
