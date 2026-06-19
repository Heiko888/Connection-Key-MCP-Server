/**
 * Slide-Renderer (.138) — Markdown-bewusste Slides als PNG (resvg). v8 Phase 2.
 *
 * Wandelt den Markdown-Reading-Text in gestylte Slides (Überschriften-Hierarchie,
 * Aufzählungen, Absätze) UND liefert pro Slide den bereinigten Sprechtext — dieser
 * ist exakt der Text, der auf der Slide steht, damit Bild und Voiceover synchron sind.
 */

import { Resvg } from "@resvg/resvg-js";
import { buildBodygraphInner, bodygraphFitTransform } from "./bodygraph-svg.js";

const BG = "#0B0F19";
const GOLD = "#F5A623";
const TEXT = "#E6E9EF";
const MUTED = "#9AA3B2";
const FONT = "DejaVu Sans, Inter, sans-serif";

const STYLE = {
  head:   { size: 42, lh: 60, color: GOLD,      weight: "800", wrap: 36 },
  sub:    { size: 30, lh: 46, color: "#FFD479", weight: "700", wrap: 48 },
  body:   { size: 30, lh: 46, color: TEXT,      weight: "400", wrap: 60 },
  bullet: { size: 30, lh: 46, color: TEXT,      weight: "400", wrap: 56 },
};

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Inline-Markdown entfernen (fett/kursiv/Code/Links) → reiner Text. */
function stripInline(s) {
  return String(s || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(text, maxChars) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if (!line) { line = w; continue; }
    if ((line + " " + w).length <= maxChars) line += " " + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

/** Markdown → Blöcke {type,text}. */
function parseBlocks(md) {
  const out = [];
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  let para = [];
  const flush = () => { if (para.length) { out.push({ type: "p", text: stripInline(para.join(" ")) }); para = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      flush();
      const level = m[1].length;
      out.push({ type: level <= 1 ? "h1" : level === 2 ? "h2" : "h3", text: stripInline(m[2]) });
    } else if (/^([-*_])\1{2,}$/.test(line) || /^---+$/.test(line)) {
      flush(); out.push({ type: "hr" });
    } else if (/^[-*•]\s+/.test(line)) {
      flush(); out.push({ type: "li", text: stripInline(line.replace(/^[-*•]\s+/, "")) });
    } else if (/^>\s+/.test(line)) {
      flush(); out.push({ type: "p", text: stripInline(line.replace(/^>\s+/, "")) });
    } else {
      para.push(line);
    }
  }
  flush();
  return out;
}

/**
 * Baut Content-Slides. Jede Slide: { renderLines:[{text,style}], speakText }.
 * Neue Slide bei H1/H2 sowie bei Höhen-Überlauf. speakText == gezeigter Text → synchron.
 */
export function buildContentSlides(text, { height = 720 } = {}) {
  const blocks = parseBlocks(text);
  const usable = height - 170;

  // Zeilen-Items mit Stil + Sprechtext aufbauen
  const items = [];
  for (const b of blocks) {
    if (b.type === "hr") { if (items.length) items[items.length - 1].breakAfter = true; continue; }
    let st, breakBefore = false;
    if (b.type === "h1" || b.type === "h2") { st = STYLE.head; breakBefore = true; }
    else if (b.type === "h3") st = STYLE.sub;
    else if (b.type === "li") st = STYLE.bullet;
    else st = STYLE.body;
    const wrapped = wrapText(b.text, st.wrap);
    wrapped.forEach((ln, i) => {
      const display = st === STYLE.bullet ? (i === 0 ? "•  " + ln : "     " + ln) : ln;
      items.push({ text: display, speak: ln, style: st, breakBefore: breakBefore && i === 0, spaceAfter: i === wrapped.length - 1 });
    });
  }

  // In Slides chunken (Höhen-Budget; Section-Breaks erzwingen)
  const slides = [];
  let cur = null;
  for (const it of items) {
    const need = it.style.lh + (it.spaceAfter ? 12 : 0);
    if (!cur || it.breakBefore || (cur.used + need > usable && cur.lines.length)) { cur = { lines: [], used: 0 }; slides.push(cur); }
    cur.lines.push(it);
    cur.used += need;
  }

  return slides
    .filter((s) => s.lines.length)
    .map((s) => ({
      renderLines: s.lines.map((l) => ({ text: l.text, style: l.style, spaceAfter: l.spaceAfter })),
      speakText: s.lines.map((l) => l.speak).join(" ").replace(/\s+/g, " ").trim() || " ",
    }));
}

function renderPng(svg, width) {
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
  return renderPng(frame(width, height, inner), width);
}

export function bodygraphSlidePng(chart, { width = 1280, height = 720, caption } = {}) {
  const { scale, tx, ty } = bodygraphFitTransform(width, height, 0.9);
  const inner =
    `<g transform="translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${scale.toFixed(4)})">${buildBodygraphInner(chart)}</g>` +
    (caption ? `<text x="40" y="${height - 40}" font-family="${FONT}" font-size="26" fill="${GOLD}">${esc(caption)}</text>` : "");
  return renderPng(frame(width, height, inner), width);
}

/** Rendert eine Content-Slide (gestylte Zeilen). */
export function contentSlidePng(slide, { width = 1280, height = 720 } = {}) {
  const padX = 90;
  let y = 118;
  const parts = [];
  for (const l of slide.renderLines) {
    parts.push(`<text x="${padX}" y="${y}" font-family="${FONT}" font-size="${l.style.size}" font-weight="${l.style.weight}" fill="${l.style.color}" xml:space="preserve">${esc(l.text)}</text>`);
    y += l.style.lh + (l.spaceAfter ? 12 : 0);
  }
  return renderPng(frame(width, height, parts.join("")), width);
}
