import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)
 
export async function POST(req: Request) {
  const userMessage = await req.json()
  return new Response(JSON.stringify(userMessage))
}