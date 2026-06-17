/**
 * Video-Composer (.138) — ffmpeg-Slideshow + Audiospur → MP4. v8 Phase 2 (MVP).
 * Setzt ffmpeg/ffprobe im Container voraus (Dockerfile: apk add ffmpeg).
 * MVP: harte Schnitte (concat-Demuxer mit Per-Slide-Dauer). Ken-Burns/Crossfade = Phase 2b.
 */

import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

function run(cmd, args, { timeoutMs = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    let timer = null;
    if (timeoutMs > 0) timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error(`${cmd} timeout nach ${timeoutMs}ms`)); }, timeoutMs);
    p.stdout.on("data", (d) => { stdout += d.toString(); });
    p.stderr.on("data", (d) => { stderr += d.toString(); });
    p.on("error", (e) => { if (timer) clearTimeout(timer); reject(e); });
    p.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} exit ${code}: ${stderr.slice(-400)}`));
    });
  });
}

/** Audiodauer (Sekunden) via ffprobe. */
export async function probeDurationSec(audioPath) {
  const { stdout } = await run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1", audioPath,
  ]);
  const d = parseFloat(String(stdout).trim());
  if (!isFinite(d) || d <= 0) throw new Error("Audiodauer nicht ermittelbar");
  return d;
}

/**
 * Baut das MP4 aus Slides (mit Dauer) + Audiospur.
 * @param slides Array<{ pngPath: string, durationSec: number }>
 */
export async function composeSlideshow({ slides, audioPath, outPath, width = 1280, height = 720, timeoutMs = 600000 }) {
  if (!Array.isArray(slides) || slides.length === 0) throw new Error("Keine Slides");
  const dir = path.dirname(outPath);
  const listPath = path.join(dir, "concat.txt");

  // concat-Demuxer-Liste: jede Datei mit Dauer; letzte Datei wird wiederholt,
  // damit ihre Dauer honoriert wird (bekannte ffmpeg-Eigenheit).
  const lines = ["ffconcat version 1.0"];
  for (const s of slides) {
    lines.push(`file '${s.pngPath.replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${Math.max(0.5, s.durationSec).toFixed(3)}`);
  }
  lines.push(`file '${slides[slides.length - 1].pngPath.replace(/'/g, "'\\''")}'`);
  await fs.writeFile(listPath, lines.join("\n"), "utf8");

  const vf = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x0B0F19,fps=25,format=yuv420p`;
  await run("ffmpeg", [
    "-y",
    "-f", "concat", "-safe", "0", "-i", listPath,
    "-i", audioPath,
    "-vf", vf,
    "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage",
    "-c:a", "aac", "-b:a", "160k",
    "-shortest", "-movflags", "+faststart",
    "-threads", String(process.env.FFMPEG_THREADS || 2),
    outPath,
  ], { timeoutMs });

  return outPath;
}
