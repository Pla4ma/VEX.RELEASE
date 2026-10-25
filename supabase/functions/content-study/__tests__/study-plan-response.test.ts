import { parseStudyPlanResponse } from "../handlers.ts";
import { generateStudyPlan } from "../study-plan-generator.ts";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

Deno.test("parses a model-generated study plan and preserves its actual content", () => {
  const parsed = parseStudyPlanResponse(`\`\`\`json
    {"summary":"Cell structure","keyConcepts":["organelles"],"tasks":[{"content":"Compare cell membranes"}],"quizItems":[{"question":"What controls transport?","answer":"The cell membrane"}]}
    \`\`\``);
  assert(parsed.summary === "Cell structure", "Model summary was not preserved");
  assert(parsed.tasks[0]?.content === "Compare cell membranes", "Model task was not preserved");
  assert(parsed.quizItems[0]?.answer === "The cell membrane", "Model answer was not preserved");
});

Deno.test("rejects malformed or content-free plans instead of fabricating a successful plan", () => {
  const invalidResponses = [
    "not JSON",
    "{}",
    JSON.stringify({ summary: "", keyConcepts: [], tasks: [], quizItems: [] }),
    JSON.stringify({
      summary: "Study material ready",
      keyConcepts: ["Main topic"],
      tasks: [{ content: "Read through the content carefully" }],
      quizItems: [{ question: "What is the main topic?", answer: "See content for details" }],
    }),
  ];
  for (const response of invalidResponses) {
    let rejected = false;
    try {
      parseStudyPlanResponse(response);
    } catch {
      rejected = true;
    }
    assert(rejected, `Invalid model response was accepted: ${response}`);
  }
});

Deno.test("tries the next configured study model after the preferred model fails", async () => {
  const envNames = ["LLM_API_KEY", "LLM_BASE_URL", "LLM_MODEL_PRO", "LLM_MODEL_JSON_FALLBACK", "GEMINI_API_KEY"];
  const previousEnv = new Map(envNames.map((name) => [name, Deno.env.get(name)]));
  const originalFetch = globalThis.fetch;
  const requestedModels: string[] = [];
  for (const name of envNames) Deno.env.delete(name);
  Deno.env.set("LLM_API_KEY", "test-provider-key");
  Deno.env.set("LLM_BASE_URL", "https://llm.example/v1");
  Deno.env.set("LLM_MODEL_PRO", "preferred-study-model");
  Deno.env.set("LLM_MODEL_JSON_FALLBACK", "backup-study-model");
  globalThis.fetch = async (_input, init) => {
    if (typeof init?.body !== "string") throw new Error("Missing model request body");
    const body: unknown = JSON.parse(init.body);
    if (typeof body !== "object" || body === null || !("model" in body) || typeof body.model !== "string") {
      throw new Error("Missing requested model");
    }
    requestedModels.push(body.model);
    if (requestedModels.length === 1) return new Response("model unavailable", { status: 503 });
    return new Response(JSON.stringify({
      model: "backup-study-model",
      choices: [{ message: { content: JSON.stringify({
        summary: "Cell structure",
        keyConcepts: ["organelles"],
        tasks: [{ content: "Compare cell membranes" }],
        quizItems: [{ question: "What controls transport?", answer: "The cell membrane" }],
      }) } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const result = await generateStudyPlan("Study cell structure.");
    assert(JSON.stringify(requestedModels) === JSON.stringify(["preferred-study-model", "backup-study-model"]), "The next model was not tried in order");
    assert(result.model === "backup-study-model", "The successful fallback model was not recorded");
    assert(parseStudyPlanResponse(result.content).summary === "Cell structure", "Fallback output was not preserved");
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of previousEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});
Deno.test("Gemini study generation falls back to an available flash model", async () => {
  const envNames = ["LLM_API_KEY", "LLM_BASE_URL", "LLM_MODEL_PRO", "LLM_MODEL_JSON_FALLBACK", "GEMINI_API_KEY", "GEMINI_MODEL_PRO"];
  const previousEnv = new Map(envNames.map((name) => [name, Deno.env.get(name)]));
  const originalFetch = globalThis.fetch;
  const requestedModels: string[] = [];
  for (const name of envNames) Deno.env.delete(name);
  Deno.env.set("GEMINI_API_KEY", "test-gemini-key");
  Deno.env.set("GEMINI_MODEL_PRO", "retired-gemini-model");
  globalThis.fetch = async (input) => {
    const url = String(input);
    const model = url.split("/models/")[1]?.split(":")[0] ?? "";
    requestedModels.push(model);
    if (model === "retired-gemini-model") return new Response("model unavailable", { status: 404 });
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({
        summary: "Cell structure",
        keyConcepts: ["organelles"],
        tasks: [{ content: "Compare cell membranes" }],
        quizItems: [{ question: "What controls transport?", answer: "The cell membrane" }],
      }) }] } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const result = await generateStudyPlan("Study cell structure.");
    assert(JSON.stringify(requestedModels) === JSON.stringify([
      "retired-gemini-model",
      "gemini-2.5-flash",
    ]), "Gemini did not fall back to the next available model");
    assert(result.model === "gemini-2.5-flash", "Successful Gemini model was not recorded");
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of previousEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});
