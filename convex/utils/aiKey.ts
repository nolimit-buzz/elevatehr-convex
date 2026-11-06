// For the demo we use a single central Groq key from the environment instead
// of requiring each company to configure its own.
// TODO(multi-tenant): re-enable per-company keys once SaaS onboarding exists:
// return company.ai_api_key || process.env.GROQ_API_KEY;
export function resolveAiApiKey(): string | undefined {
  return process.env.GROQ_API_KEY;
}
