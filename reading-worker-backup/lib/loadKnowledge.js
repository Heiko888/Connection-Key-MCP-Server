import fs from "fs";
import path from "path";

export function loadKnowledge(knowledgePath = "/app/knowledge") {
  const knowledge = {};

  if (!fs.existsSync(knowledgePath)) {
    console.warn("⚠️ Knowledge-Pfad nicht gefunden:", knowledgePath);
    return knowledge;
  }

  const files = fs.readdirSync(knowledgePath);

  for (const file of files) {
    const fullPath = path.join(knowledgePath, file);

    if (fs.statSync(fullPath).isFile() && file.endsWith(".txt")) {
      const key = file.replace(".txt", "");
      knowledge[key] = fs.readFileSync(fullPath, "utf-8");
      console.log("📚 Knowledge geladen:", key);
    }

    if (fs.statSync(fullPath).isDirectory()) {
      const subFiles = fs.readdirSync(fullPath);
      for (const subFile of subFiles) {
        if (subFile.endsWith(".txt")) {
          const key = `${file}-${subFile.replace(".txt", "")}`;
          knowledge[key] = fs.readFileSync(
            path.join(fullPath, subFile),
            "utf-8"
          );
          console.log("📚 Knowledge geladen (Unterordner):", key);
        }
      }
    }
  }

  return knowledge;
}
