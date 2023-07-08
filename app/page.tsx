'use client'

import { useState } from 'react'
import Image from 'next/image'
import arrowsIcon from '../public/arrows.svg'
import AutoResizeTextarea from './components/AutoResizeTextarea'

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [assistantResponse, setAssistantResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function askChat() {
    setIsLoading(true)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInput),
    }).then(async (res) => {
      setIsLoading(false)
      if (res.status === 200) {
        setAssistantResponse(await res.json())
      }
    })
  }

  function handleSubmit() {
    askChat()
  }

  return (
    <div className='py-24'>
      <div className='mx-auto max-w-7xl px-6'>
        <div className='mx-auto max-w-2xl'>
          <h1 className='mt-2 mb-4 text-3xl font-bold tracking-tight'>
            Nemesis Chat
          </h1>

          <div className='flex items-end my-8'>
            <div className='px-4 pt-3 pb-2 flex-1 rounded-md bg-transparent border-solid border-2 border-teal-400 outline-none'>
              <AutoResizeTextarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                handleSubmit={handleSubmit}
                className='w-full m-0 p-0 border-0 focus:outline-0 bg-transparent resize-none'
              />
            </div>

            <button type='submit'>
              <Image
                src={arrowsIcon}
                alt='submit'
                className='w-12 ml-4 pb-2 fill-teal-400'
              />
            </button>
          </div>

          {isLoading && (
            <div className='spinner absolute left-1/2 transform -translate-x-1/2' />
          )}

          <div
            className={`whitespace-pre-line prose prose-invert ${
              isLoading && 'opacity-30'
            }`}
          >
            {assistantResponse}
          </div>
        </div>
      </div>
    </div>
  )
}
