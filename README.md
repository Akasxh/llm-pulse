# LLM Pulse

Weekly intelligence brief on AI model performance and trends.

Tracks 16 production-relevant open-weight LLMs across 6 benchmark categories (MMLU, GPQA, MATH, IFEval, BBH, MUSR), generates AI-powered analysis via [GitHub Models](https://docs.github.com/en/github-models), and publishes a shareable weekly brief.

## How It Works

1. **Data Collection** — `scripts/fetch-leaderboard.js` queries the HuggingFace API for model metadata (downloads, likes, tags) for tracked models from the [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)

2. **AI Analysis** — `scripts/analyze.js` sends the collected data to GitHub Models (GPT-4o-mini) to generate a structured weekly brief with highlights, rankings, trend analysis, watchlist, and a social media thread

3. **Dashboard** — `index.html` renders the brief as a responsive single-page dashboard, deployed via GitHub Pages

4. **Automation** — GitHub Actions workflow runs weekly (Sunday 12:00 UTC), commits updated data, and deploys to Pages

## Stack

- **Data:** HuggingFace API (free, no key required)
- **AI:** GitHub Models API (GPT-4o-mini via `GITHUB_TOKEN`)
- **Frontend:** Vanilla HTML/CSS/JS (no build step, no dependencies)
- **Deployment:** GitHub Pages via Actions
- **Template:** [product-kit-template](https://github.com/1712n/product-kit-template)

## Local Development

```bash
node scripts/fetch-leaderboard.js     # fetch model data
GITHUB_TOKEN=ghp_xxx node scripts/analyze.js  # generate AI analysis
# open index.html in browser
```

## Models Tracked

Meta Llama 3.x, Qwen 2.5, DeepSeek V3/R1, Microsoft Phi-4, Google Gemma 2, Mistral Large/Small, NVIDIA Nemotron, Cohere Command R+, Yi 1.5
