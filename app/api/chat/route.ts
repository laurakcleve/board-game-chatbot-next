import { Configuration, OpenAIApi, CreateChatCompletionRequest } from 'openai'
import path from 'path'
import { promises as fs } from 'fs'

type IndexChunk = {
  content: string
  section_id: string
  embedding: number[]
}

type Section = {
  id: string
  content: string
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

const EMBEDDING_MODEL = 'text-embedding-ada-002'
const CHAT_MODEL = 'gpt-3.5-turbo'
 
export async function POST(req: Request) {
  const dataDirectory = path.join(process.cwd(), 'data')
  const indexFile = await fs.readFile(dataDirectory + '/index.json', 'utf8')
  const index: IndexChunk[] = JSON.parse(indexFile)

  const sectionsFile = await fs.readFile(dataDirectory + '/sections.json', 'utf8')
  const sections: Section[] = JSON.parse(sectionsFile)
  
  const userMessage = await req.json()

  const userMessageEmbeddingResponse = await openai.createEmbedding({
    input: userMessage,
    model: EMBEDDING_MODEL
  })
  const userMessageEmbedding = userMessageEmbeddingResponse.data.data[0].embedding

  const scores = index.map((chunk) => {
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
  }, <string[]>[]).slice(0, 3).join('\n\n---\n\n')

  const prompt = "Answer the following question given the provided context. First look at the heading of the relevant section from the context and assess whether it applies to the situation of the question, then reason through the logic of the rules before giving an answer. Your answer should be as accurate as possible, and should not include the details of the headings and sections, nor your steps of reasoning.\n\nContext:\n\n<<CONTEXT>>\n\n=== end of context ===\n\nQuestion: <<QUESTION>>".replace("<<CONTEXT>>", relevantSections).replace("<<QUESTION>>", userMessage)

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

  return new Response(JSON.stringify(chatResponse.data.choices[0].message?.content))
}

function similarity(v1: number[], v2: number[]) {
  return v1.map((_, i) => v1[i] * v2[i]).reduce((a, b) => a + b);
}