'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from 'react-modal'
import arrowsIcon from '../public/arrows.svg'
import AutoResizeTextarea from './components/AutoResizeTextarea'
import { ResponseData } from './types/chat'
import DebuggingSection from './components/DebuggingSection'
import SampleQuestion from './components/SampleQuestion'

Modal.setAppElement('#main')

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [assistantResponse, setAssistantResponse] = useState('')
  const [debugData, setDebugData] = useState<
    ResponseData['debugData'] | undefined
  >()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sampleQuestions = [
    'What is this game like?',
    'How do you search a white room?',
    'What happens when you roll danger on a noise roll?',
    'How do you stop the self destruct sequence?',
  ]

  function openModal() {
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  async function askChat(question: string) {
    setIsLoading(true)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    }).then(async (res) => {
      setIsLoading(false)
      if (res.status === 200) {
        const resJSON: ResponseData = await res.json()
        setAssistantResponse(resJSON.assistantResponse)
        setDebugData(resJSON.debugData)
      }
    })
  }

  function handleSubmit() {
    askChat(userInput)
  }

  return (
    <div className='py-24'>
      <div className='mx-auto max-w-7xl px-6'>
        <div className='mx-auto max-w-2xl'>
          <h1 className='mt-2 mb-4 text-3xl font-bold tracking-tight'>
            Nemesis AI
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

        <div className='mt-20'>
          <h2 className='mb-4'>Sample questions:</h2>
          <div className='flex flex-wrap justify-start gap-4'>
            {sampleQuestions.map((q) => (
              <SampleQuestion
                key={q}
                question={q}
                onClick={() => {
                  setUserInput(q)
                  askChat(q)
                }}
              />
            ))}
          </div>
        </div>

        <div className='absolute bottom-6 w-full flex justify-center'>
          <button
            onClick={openModal}
            className='flex items-center gap-2 uppercase text-xs'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 22.27 10.19'
              fill='none'
              stroke='#ccc'
              stroke-width='2'
              className='w-4 pb-[1px]'
            >
              <path d='m21.56,9.49l-4.39-4.39L21.56.71' />
              <path d='m13.48,9.49l-4.39-4.39L13.48.71' />
              <path d='m5.39,9.49L1,5.1,5.39.71' />
            </svg>
            Debugging data
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 22.27 10.19'
              fill='none'
              stroke='#ccc'
              stroke-width='2'
              className='w-4 pb-[1px]'
            >
              <path d='m.71.71l4.39,4.39L.71,9.49' />
              <path d='m8.79.71l4.39,4.39-4.39,4.39' />
              <path d='m16.88.71l4.39,4.39-4.39,4.39' />
            </svg>
          </button>
        </div>

          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
          className='fixed top-20 left-3 right-3 bottom-20 max-w-3xl mx-auto p-10 bg-gray-700 rounded-lg overflow-y-scroll'
            overlayClassName='fixed top-0 left-0 right-0 bottom-0 bg-grey-700/50'
          >
          {debugData && (
            <>
              <DebuggingSection
                heading='Question'
                content={debugData.userMessage}
              />
              <DebuggingSection heading='Scores' content={debugData.scores} />
              <DebuggingSection
                heading='Sections'
                content={debugData.relevantSections}
              />
              <DebuggingSection
                heading='Final prompt'
                content={debugData.prompt}
              />
            </>
          )}
          </Modal>
        </div>
      </div>
    </div>
  )
}
