import fs from "fs";
import path from "path";

export function loadKnowledge(dir) {
  const files = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".txt") || entry.name.endsWith(".md")) {
        files.push(fs.readFileSync(full, "utf8"));
      }
    }
  }

  walk(dir);
  return files.join("\n\n");
}

export function loadTemplate(dir, templateName) {
  const file = path.join(dir, `${templateName}.txt`);
  return fs.readFileSync(file, "utf8");
}
