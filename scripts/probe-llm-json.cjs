const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env.server', 'utf8').split(/\r?\n/)) {
  const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (!match) continue;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  env[match[1]] = value.trim();
}

const key = env.LLM_API_KEY;
const base = env.LLM_BASE_URL || 'http://167.71.255.199:3001/v1';
const model = env.LLM_MODEL_FAST || 'auto';

(async () => {
  const response = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are VEX AI Coach. Return ONLY valid JSON with keys message, tone, urgency, optional actionLabel, optional action.',
        },
        {
          role: 'user',
          content: 'Category=STREAK_RISK. Level=3. Streak=5. Hours=22. Inactive=0. Recent3=none.',
        },
      ],
      temperature: 0.2,
      max_tokens: 120,
    }),
  });
  const text = await response.text();
  const payload = JSON.parse(text);
  const content = payload.choices?.[0]?.message?.content || '';
  console.log(`status=${response.status}`);
  console.log(`model=${payload.model || model}`);
  console.log(`content=${content}`);
  try {
    JSON.parse(content.replace(/```json|```/g, '').match(/\{[\s\S]*\}/)?.[0] || '');
    console.log('jsonParse=ok');
  } catch {
    console.log('jsonParse=failed');
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
