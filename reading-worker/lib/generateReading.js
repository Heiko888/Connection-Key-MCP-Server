import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledge, loadTemplate } from "./context-builder.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateReading({
  agentId,
  template,
  userData
}) {
  const knowledge = loadKnowledge("/app/knowledge");
  const templateText = loadTemplate("/app/templates", template);
  const prompt = `Du bist ein professioneller Human-Design-Reading-Experte.

WISSEN:
${knowledge}

TEMPLATE:
${templateText}

USERDATEN:
${JSON.stringify(userData, null, 2)}

AUFGABE:
Erstelle ein vollständiges, klares, tiefgehendes Reading.`;

  const result = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }]
  });

  return result.content[0].text;
}
