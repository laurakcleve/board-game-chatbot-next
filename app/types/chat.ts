export type IndexChunk = {
  content: string
  section_id: string
  embedding: number[]
}

export type Section = {
  id: string
  content: string
}

export type Score = {
  content: string
  sectionId: string
  score: number
}

export type ResponseData = {
  assistantResponse: string
  debugData: {
    userMessage: string
    scores: Score[]
    relevantSections: string[]
    prompt: string
    model: string
  }
}
