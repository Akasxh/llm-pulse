/**
 * Uses GitHub Models (GPT-4o-mini) to generate a weekly intelligence
 * brief analyzing LLM benchmark trends and notable model releases.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"

const GITHUB_MODELS_URL = "https://models.github.ai/inference/chat/completions"
const MODEL = "openai/gpt-4o-mini"

async function callGitHubModels(systemPrompt, userPrompt) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn("GITHUB_TOKEN not set, skipping AI analysis")
    return null
  }

  const resp = await fetch(GITHUB_MODELS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    console.warn(`GitHub Models API error (${resp.status}): ${text}`)
    return null
  }

  const data = await resp.json()
  return data.choices?.[0]?.message?.content || null
}

async function generateAnalysis(modelsData) {
  const systemPrompt = `You are an AI industry analyst who produces concise weekly intelligence briefs about Large Language Model performance and trends. You write for a technical audience of ML engineers and AI product managers. Be data-driven, specific, and actionable. Avoid hype.`

  const modelSummary = modelsData.models
    .map((m) => {
      const meta = []
      if (m.downloads) meta.push(`${(m.downloads / 1000).toFixed(0)}K downloads`)
      if (m.likes) meta.push(`${m.likes} likes`)
      return `- ${m.name} (${m.org}) [${meta.join(", ")}]`
    })
    .join("\n")

  const userPrompt = `Analyze the following LLM landscape data and produce a weekly intelligence brief.

Models tracked:
${modelSummary}

Benchmarks: MMLU (knowledge), GPQA (graduate-level reasoning), MATH (mathematics), IFEval (instruction following), BBH (reasoning), MUSR (multi-step reasoning).

Generate a JSON response with this structure:
{
  "title": "Weekly brief title (catchy, specific)",
  "date": "${new Date().toISOString().split("T")[0]}",
  "summary": "2-3 sentence executive summary",
  "highlights": [
    {"title": "...", "body": "...", "impact": "high|medium|low"}
  ],
  "modelRankings": [
    {"tier": "Frontier", "models": ["model1", "model2"]},
    {"tier": "Strong", "models": [...]},
    {"tier": "Efficient", "models": [...]}
  ],
  "trendAnalysis": "2-3 paragraphs analyzing key trends",
  "watchlist": ["model or development to watch"],
  "socialThread": [
    "Tweet 1 (max 280 chars)",
    "Tweet 2 (max 280 chars)",
    "Tweet 3 (max 280 chars)"
  ]
}`

  const rawResponse = await callGitHubModels(systemPrompt, userPrompt)
  if (!rawResponse) return null

  try {
    return JSON.parse(rawResponse)
  } catch (e) {
    console.warn("Failed to parse AI response as JSON:", e.message)
    return { raw: rawResponse }
  }
}

async function main() {
  const dataDir = "data"
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

  const modelsPath = `${dataDir}/models.json`
  if (!existsSync(modelsPath)) {
    console.error("models.json not found. Run fetch-leaderboard.js first.")
    process.exit(1)
  }

  const modelsData = JSON.parse(readFileSync(modelsPath, "utf-8"))
  console.log(`Analyzing ${modelsData.trackedCount} models...`)

  const analysis = await generateAnalysis(modelsData)
  if (!analysis) {
    console.log("AI analysis skipped (no GITHUB_TOKEN or API error)")
    // Write a placeholder so the site still works
    writeFileSync(
      `${dataDir}/analysis.json`,
      JSON.stringify({
        title: "LLM Pulse — Weekly Brief",
        date: new Date().toISOString().split("T")[0],
        summary: "Analysis will be generated on the next scheduled run.",
        highlights: [],
        modelRankings: [],
        trendAnalysis: "",
        watchlist: [],
        socialThread: [],
      }, null, 2)
    )
    return
  }

  writeFileSync(`${dataDir}/analysis.json`, JSON.stringify(analysis, null, 2))
  console.log("Analysis written to data/analysis.json")

  // Also write social media thread for easy sharing
  if (analysis.socialThread?.length > 0) {
    console.log("\n--- Generated Social Thread ---")
    analysis.socialThread.forEach((tweet, i) => {
      console.log(`[${i + 1}] ${tweet}`)
    })
  }
}

main().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
