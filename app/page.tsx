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
    <>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 104.55 169.07'
        className='absolute p-1 w-32 md:w-52 fill-blue-dark'
      >
        <polygon points='104.55 4.22 88.36 4.22 80.51 12.11 70.29 12.11 68.84 9.6 46.54 9.6 45.09 12.11 34.87 12.11 27.02 4.22 10.83 4.22 15.03 0 31.28 0 36.92 5.67 52.28 5.67 53.51 7.81 61.87 7.81 63.1 5.67 78.46 5.67 84.1 0 100.35 0 104.55 4.22' />
        <polygon points='11.99 7.88 11.99 9.81 7.32 13.88 7.32 18.77 5.35 20.49 5.35 164.41 0 169.07 0 154.62 2.68 152.29 2.68 62.62 0 60.29 0 18.32 .97 17.48 11.99 7.88' />
        <polygon points='13.72 27.35 13.72 48.36 12.57 49.36 12.57 83.22 10.83 84.73 10.83 28.26 10.02 27.33 10.02 25.06 7.06 21.64 8.77 21.64 13.72 27.35' />
        <polygon points='10.12 33.25 10.12 35.09 7.24 31.75 6.22 30.56 6.22 23.57 7.24 24.75 7.24 29.9 10.12 33.25' />
      </svg>

      <div className='relative pt-24 px-6 mx-auto max-w-2xl h-screen' id='main'>
        <h1 className='mb-4 text-3xl font-bold tracking-tight [text-shadow:0_0_16px_#0d93cd]'>
          Nemesis AI
        </h1>

        <div className='flex items-end my-8'>
          <div className='px-4 pt-3 pb-2 flex-1 rounded-md bg-transparent border-solid border border-blue outline-none'>
            <AutoResizeTextarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              handleSubmit={handleSubmit}
              className='w-full m-0 p-0 border-0 focus:outline-0 bg-transparent resize-none'
            />
          </div>

          <button type='submit'>
            <Image src={arrowsIcon} alt='submit' className='w-12 ml-4 pb-2' />
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
    </>
  )
}
