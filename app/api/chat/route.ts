import { Configuration, OpenAIApi } from 'openai'
import indexData from '../../../data/index.json'
import sectionsData from '../../../data/sections.json'
import { IndexChunk, Score, Section } from '@/app/types/chat'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

const EMBEDDING_MODEL = 'text-embedding-ada-002'
const CHAT_MODEL = process.env.OPENAI_MODEL

export async function POST(req: Request) {
  const index: IndexChunk[] = indexData as IndexChunk[]
  const sections: Section[] = sectionsData as Section[]

  const userMessage = await req.json()

  let userMessageEmbedding: number[]
  try {
    const userMessageEmbeddingResponse = await openai.createEmbedding({
      input: userMessage,
      model: EMBEDDING_MODEL
    })
    userMessageEmbedding = userMessageEmbeddingResponse.data.data[0].embedding
  } catch (error) {
    console.error('Error fetching embedding for user question', error);
    return new Response(JSON.stringify({ error: 'Error fetching embedding for user question' }), { status: 500 })
  }

  const scores: Score[] = index.map((chunk) => {
    const score = similarity(userMessageEmbedding, chunk.embedding)
    return {
      content: chunk.content,
      sectionId: chunk.section_id,
      score
    }
  })
  scores.sort((a, b) => b.score - a.score)

  const relevantSections = scores.slice(0, 10).reduce((acc, curr) => {
    const section = sections.find((s) => s.id === curr.sectionId)
    if (section && !acc.includes(section.content)) {
      acc.push(section.content)
    }
    return acc
  }, <string[]>[]).slice(0, 3)

  const prompt = "Answer the following question given the provided context. First look at the heading of the relevant section from the context and assess whether it applies to the situation of the question, then reason through the logic of the rules before giving an answer. Your answer should be as accurate as possible, and should not include the details of the headings and sections, nor your steps of reasoning. If the answer cannot be found in the context, respond that you could not find the answer, without mentioning the context.\n\nContext:\n\n<<CONTEXT>>\n\n=== end of context ===\n\nQuestion: <<QUESTION>>".replace("<<CONTEXT>>", relevantSections.join('\n\n---\n\n')).replace("<<QUESTION>>", userMessage)

  let assistantResponse

  if (!CHAT_MODEL) {
    return new Response(JSON.stringify({ error: 'Chat model not specified' }), {
      status: 500,
    })
  }

  try {
    const chatResponse = await openai.createChatCompletion({
      model: CHAT_MODEL,
      messages: [
        {
          "role": "system",
          "content": "You are an expert on the board game 'Nemesis', and your job is to provide answers and information on the rules of the game using excerpts from the rulebook which will be provided for you, but which you should treat as your own implicit knowledge and not speak to the user about."
        },
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
    assistantResponse = chatResponse.data.choices[0].message?.content
  } catch (error) {
    console.error('Error fetching response from OpenAI', error);
    return new Response(JSON.stringify({ error: 'Error fetching response from OpenAI' }), { status: 500 })
  }

  const debugData = {
    userMessage,
    scores: scores.slice(0, 10), 
    relevantSections,
    prompt,
    model: CHAT_MODEL
  }

  return new Response(JSON.stringify({assistantResponse, debugData}))
}

function similarity(v1: number[], v2: number[]) {
  return v1.map((_, i) => v1[i] * v2[i]).reduce((a, b) => a + b);
}