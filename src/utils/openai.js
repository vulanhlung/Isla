import OpenAI from 'openai'

const AI_BACKEND = process.env.AI_BACKEND?.toLowerCase() || 'openai'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const LLAMA_API_URL = process.env.LLAMA_API_URL || 'http://127.0.0.1:5000/v1/chat/completions'
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama-2-13b-chat'

export const createOpenAIClient = () => {
  if (!OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: OPENAI_API_KEY })
}

const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '30000', 10)

const withTimeout = (promise, ms, label) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

const callOpenAIChat = async ({ messages, max_tokens = 300, temperature = 0.7 }) => {
  const client = createOpenAIClient()
  if (!client) {
    throw new Error('OpenAI API key is not configured')
  }

  const response = await withTimeout(
    client.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens,
      temperature
    }),
    AI_TIMEOUT_MS,
    'OpenAI'
  )

  return response.choices?.[0]?.message?.content?.trim() || null
}

const callLocalLlamaChat = async ({ messages, max_tokens = 300, temperature = 0.7 }) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch(LLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        messages,
        max_tokens,
        temperature
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`LLaMA API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`LLaMA API timed out after ${AI_TIMEOUT_MS}ms`)
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export const aiChatCompletion = async ({ messages, max_tokens = 300, temperature = 0.7 }) => {
  if (AI_BACKEND === 'llama2') {
    return callLocalLlamaChat({ messages, max_tokens, temperature })
  }
  return callOpenAIChat({ messages, max_tokens, temperature })
}

export const generateNaturalInsight = async (patterns) => {
  const prompt = `Bạn là một trợ lý sức khỏe tinh thần. Dựa trên các pattern sau từ dữ liệu mood của user, hãy viết một mô tả insight tự nhiên bằng tiếng Việt, ngắn gọn và hữu ích. Không cần liệt kê chi tiết kỹ thuật, chỉ nên đưa ra thông tin chính và gợi ý hành động.

Patterns:
${patterns.map((p) => `- ${p.pattern}: ${p.description}`).join('\n')}

Viết một câu insight duy nhất hoặc tối đa hai câu.`

  try {
    return await aiChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.8
    })
  } catch (err) {
    console.error('AI generation failed:', err.message)
    return null
  }
}
