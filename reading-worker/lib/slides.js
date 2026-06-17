/**
 * Slide-Renderer (.138) — Titel-, Bodygraph- und Text-Slides als PNG (resvg).
 * Alle Slides werden auf dieselbe Leinwand (Default 1280x720) gerendert, damit
 * ffmpeg sie zu einer Slideshow concaten kann. v8 Phase 2 (Reading→Video).
 */

import { Resvg } from "@resvg/resvg-js";
import { buildBodygraphInner, bodygraphFitTransform } from "./bodygraph-svg.js";

const BG = "#0B0F19";
const GOLD = "#F5A623";
const TEXT = "#E6E9EF";
const MUTED = "#9AA3B2";
const FONT = "DejaVu Sans, Inter, sans-serif";

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Wort-Umbruch in Zeilen mit maximaler Zeichenzahl. */
function wrapText(text, maxChars) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if (!line) { line = w; continue; }
    if ((line + " " + w).length <= maxChars) line += " " + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function renderPng(svg, width, height) {
  return new Resvg(svg, { background: BG, fitTo: { mode: "width", value: width } }).render().asPng();
}

function frame(width, height, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `<rect width="${width}" height="${height}" fill="${BG}"/>`
    + `<rect x="0" y="0" width="${width}" height="6" fill="${GOLD}"/>`
    + inner + `</svg>`;
}

export function titleSlidePng(title, subtitle, { width = 1280, height = 720 } = {}) {
  const cx = width / 2;
  const inner =
    `<text x="${cx}" y="${height / 2 - 30}" font-family="${FONT}" font-size="64" font-weight="800" fill="${TEXT}" text-anchor="middle">${esc(title)}</text>` +
    (subtitle ? `<text x="${cx}" y="${height / 2 + 40}" font-family="${FONT}" font-size="32" fill="${GOLD}" text-anchor="middle">${esc(subtitle)}</text>` : "") +
    `<text x="${cx}" y="${height - 60}" font-family="${FONT}" font-size="22" fill="${MUTED}" text-anchor="middle">The Connection Key</text>`;
  return renderPng(frame(width, height, inner), width, height);
}

export function bodygraphSlidePng(chart, { width = 1280, height = 720, caption } = {}) {
  const { scale, tx, ty } = bodygraphFitTransform(width, height, 0.9);
  const inner =
    `<g transform="translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${scale.toFixed(4)})">${buildBodygraphInner(chart)}</g>` +
    (caption ? `<text x="40" y="${height - 40}" font-family="${FONT}" font-size="26" fill="${GOLD}">${esc(caption)}</text>` : "");
  return renderPng(frame(width, height, inner), width, height);
}

export function textSlidePng(lines, { width = 1280, height = 720, heading } = {}) {
  const padX = 90;
  let y = heading ? 140 : 110;
  const parts = [];
  if (heading) parts.push(`<text x="${padX}" y="80" font-family="${FONT}" font-size="40" font-weight="800" fill="${GOLD}">${esc(heading)}</text>`);
  for (const ln of lines) {
    parts.push(`<text x="${padX}" y="${y}" font-family="${FONT}" font-size="34" fill="${TEXT}">${esc(ln)}</text>`);
    y += 50;
  }
  return renderPng(frame(width, height, parts.join("")), width, height);
}

/**
 * Paginiert den Reading-Text in Text-Slides.
 * @returns Array<{ lines: string[], chars: number }>
 */
export function paginateReadingText(text, { maxCharsPerLine = 52, maxLinesPerSlide = 11 } = {}) {
  const paragraphs = String(text || "").replace(/\r\n/g, "\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const slides = [];
  let cur = [];
  const flush = () => { if (cur.length) { slides.push({ lines: cur, chars: cur.join(" ").length }); cur = []; } };
  for (const para of paragraphs) {
    const wrapped = wrapText(para, maxCharsPerLine);
    for (const ln of wrapped) {
      if (cur.length >= maxLinesPerSlide) flush();
      cur.push(ln);
    }
    // Leerzeile zwischen Absätzen, wenn Platz
    if (cur.length && cur.length < maxLinesPerSlide) cur.push("");
  }
  flush();
  return slides.length ? slides : [{ lines: [""], chars: 1 }];
}
