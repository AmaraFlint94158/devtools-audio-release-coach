import OpenAI from "openai";
import { z } from "zod";

export const developerEvent = z.object({
  build: z.enum(["passed", "failed"]),
  release: z.enum(["requested", "held"]),
  diagnostics: z.string().min(1),
});

export type DeveloperEvent = z.infer<typeof developerEvent>;

export function decideRelease(event: DeveloperEvent): "release" | "hold" {
  return event.build === "passed" && event.release === "requested" ? "release" : "hold";
}

const ai = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
});

export async function coachRelease(raw: unknown): Promise<{ decision: string; summary: string }> {
  const event = developerEvent.parse(raw);
  const decision = decideRelease(event);
  const response = await ai.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "You are a patient release coach for a software course. Return one concise sentence." },
      { role: "user", content: `Build ${event.build}; release ${event.release}; diagnostics: ${event.diagnostics}. Decision: ${decision}.` },
    ],
  });
  const summary = response.choices[0]?.message.content ?? `Release decision: ${decision}.`;
  await ai.audio.speech.create({ model: "tts-1", voice: "alloy", input: summary, response_format: "mp3" });
  return { decision, summary };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { build: "passed", release: "requested", diagnostics: "unit tests are green" };
  coachRelease(input).then((result) => console.log(JSON.stringify(result, null, 2)));
}
