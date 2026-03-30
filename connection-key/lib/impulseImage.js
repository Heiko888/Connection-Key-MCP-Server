/**
 * impulseImage.js — HTML-zu-PNG Generierung für Tagesimpuls-Grafiken
 * Nutzt Puppeteer-Core + System-Chromium (Alpine: /usr/bin/chromium-browser)
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser";

/**
 * Erzeugt den HTML-String für die Impuls-Grafik.
 * TCK-Branding: Dark Cosmic BG, Gold Flame Akzente.
 */
export function buildImpulseHtml({
  impulseText = "",
  sunGate = "?", sunLine = "", sunGateName = "",
  moonGate = "?", moonLine = "", moonGateName = "",
  date = "",
  format = "story", // "story" 1080×1920 | "feed" 1080×1350
}) {
  const width = 1080;
  const height = format === "feed" ? 1350 : 1920;

  // Sicherheits-Escape für HTML
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${width}px;
    height: ${height}px;
    background: #050509;
    color: #F4F4F4;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 64px;
    position: relative;
    overflow: hidden;
  }

  body::before {
    content: '';
    position: absolute;
    top: 38%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 680px;
    height: 680px;
    background: radial-gradient(circle, rgba(245,166,35,0.09) 0%, transparent 70%);
    pointer-events: none;
  }

  body::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 30%;
    background: linear-gradient(transparent, rgba(5,5,9,0.8));
    pointer-events: none;
  }

  .border-frame {
    position: absolute;
    inset: 28px;
    border: 1.5px solid rgba(245,166,35,0.25);
    border-radius: 28px;
    pointer-events: none;
  }

  .corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: #F5A623;
    border-style: solid;
    opacity: 0.7;
  }
  .corner.tl { top: 40px; left: 40px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
  .corner.tr { top: 40px; right: 40px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
  .corner.bl { bottom: 40px; left: 40px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
  .corner.br { bottom: 40px; right: 40px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

  .date-label {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 24px;
    font-weight: 500;
    color: #F5A623;
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-bottom: 56px;
    opacity: 0.85;
  }

  .transit-row {
    display: flex;
    gap: 56px;
    margin-bottom: 40px;
    align-items: flex-start;
  }

  .transit-item { text-align: center; }
  .transit-icon { font-size: 36px; margin-bottom: 10px; line-height: 1; }
  .transit-gate {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 40px;
    font-weight: 700;
    color: #F5A623;
    line-height: 1;
  }
  .transit-name {
    font-size: 18px;
    color: rgba(244,244,244,0.5);
    margin-top: 6px;
    letter-spacing: 0.5px;
  }

  .divider {
    width: 100px;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, rgba(245,166,35,0.7), transparent);
    margin: 36px 0 52px;
  }

  .impulse-text {
    font-size: ${format === "feed" ? "30px" : "34px"};
    line-height: 1.65;
    text-align: center;
    font-weight: 300;
    max-width: 920px;
    color: rgba(244,244,244,0.92);
    letter-spacing: 0.2px;
  }

  .logo-area {
    position: absolute;
    bottom: 60px;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 17px;
    color: rgba(245,166,35,0.4);
    letter-spacing: 4px;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="border-frame"></div>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>

  <div class="date-label">Tagesimpuls · ${esc(date)}</div>

  <div class="transit-row">
    <div class="transit-item">
      <div class="transit-icon">☀️</div>
      <div class="transit-gate">Tor ${esc(sunGate)}${sunLine ? "." + esc(sunLine) : ""}</div>
      ${sunGateName ? `<div class="transit-name">${esc(sunGateName)}</div>` : ""}
    </div>
    <div class="transit-item">
      <div class="transit-icon">🌙</div>
      <div class="transit-gate">Tor ${esc(moonGate)}${moonLine ? "." + esc(moonLine) : ""}</div>
      ${moonGateName ? `<div class="transit-name">${esc(moonGateName)}</div>` : ""}
    </div>
  </div>

  <div class="divider"></div>
  <div class="impulse-text">${esc(impulseText)}</div>

  <div class="logo-area">The Connection Key</div>
</body>
</html>`;
}

/**
 * Rendert den HTML-String als PNG via Puppeteer.
 * Gibt den PNG-Buffer zurück.
 */
export async function renderHtmlToPng(html, width, height) {
  const { default: puppeteer } = await import("puppeteer-core");

  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
    const buffer = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } });
    return buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Erzeugt eine Impuls-Grafik und speichert sie in Supabase Storage.
 * Gibt die öffentliche URL zurück.
 * @param {Object} params - Alle Parameter für buildImpulseHtml
 * @returns {{ buffer: Buffer, url: string|null, fileName: string }}
 */
export async function generateAndStoreImpulseImage(params) {
  const { format = "story", date = new Date().toISOString().split("T")[0] } = params;
  const width = 1080;
  const height = format === "feed" ? 1350 : 1920;

  const html = buildImpulseHtml({ ...params, date, format });
  const buffer = await renderHtmlToPng(html, width, height);

  const fileName = `impulse-${date}-${format}-${Date.now()}.png`;
  let publicUrl = null;

  if (supabase) {
    const { error } = await supabase.storage
      .from("impulse-images")
      .upload(fileName, buffer, { contentType: "image/png", upsert: false });

    if (!error) {
      const { data } = supabase.storage.from("impulse-images").getPublicUrl(fileName);
      publicUrl = data?.publicUrl || null;
    } else {
      console.warn("[ImpulseImage] Storage-Upload fehlgeschlagen:", error.message);
    }
  }

  return { buffer, url: publicUrl, fileName };
}
