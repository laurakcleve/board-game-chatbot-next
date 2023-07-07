"use client"

import { useState } from "react"

export default function Home() {
  const [userInput, setUserInput] = useState("")
  const [assistantResponse, setAssistantResponse] = useState("")

  async function askChat() {
    fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(userInput)
    }).then(async (res) => {
      console.log(res)
      if (res.status === 200) {
        setAssistantResponse(await res.json())
      }
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    askChat()
  }

  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mt-2 mb-4 text-3xl font-bold tracking-tight">
            Nemesis Chat
          </h1>

          <form onSubmit={handleSubmit} className="flex my-8">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} className="px-4 py-3 flex-1 rounded-md bg-transparent border-solid border-2 border-teal-400 outline-none" />

            <button type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>

          <div className="whitespace-pre-line prose prose-invert">{assistantResponse}</div>

        </div>
      </div>
    </div>
  )
}
