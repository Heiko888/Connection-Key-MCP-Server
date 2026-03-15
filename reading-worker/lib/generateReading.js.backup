import { openai } from "./openai.js";
import { loadKnowledge, loadTemplate } from "./context-builder.js";

export async function generateReading({
  agentId,
  template,
  userData
}) {
  const knowledge = loadKnowledge("/app/knowledge");
  const templateText = loadTemplate("/app/templates", template);

  const prompt = `
SYSTEM:
Du bist ein professioneller Human-Design-Reading-Experte.

WISSEN:
${knowledge}

TEMPLATE:
${templateText}

USERDATEN:
${JSON.stringify(userData, null, 2)}

AUFGABE:
Erstelle ein vollständiges, klares, tiefgehendes Reading.
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  return result.choices[0].message.content;
}
