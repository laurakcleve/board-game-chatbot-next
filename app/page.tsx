'use client'

import { useState } from 'react'
import Modal from 'react-modal'
import BorderLeftSVG from '../public/borderLeft.svg'
import BorderRightSVG from '../public/borderRight.svg'
import SubmitSVG from '../public/submit.svg'
import ArrowsLeftSVG from '../public/arrowsLeft.svg'
import ArrowsRightSVG from '../public/arrowsRight.svg'
import WarningSVG from '../public/warning.svg'
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
  const [error, setError] = useState('')
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
        setError('')
      }
      if (res.status === 500) {
        const resJSON = await res.json()
        setError(resJSON.error)
      }
    })
  }

  function handleSubmit() {
    if (!userInput) return
    askChat(userInput)
  }

  return (
    <div className='relative h-full'>
      <BorderLeftSVG className='absolute p-1 w-32 md:w-52 fill-blue-dark' />
      <div
        className='pt-24 px-6 mx-auto max-w-2xl min-h-screen flex flex-col justify-between'
        id='main'
      >
        <div>
          <h1 className='mb-4 text-3xl font-bold tracking-tight [text-shadow:0_0_16px_#0d93cd]'>
            Nemesis AI
          </h1>

          <div className='flex items-end my-8'>
            <div className='px-4 pt-3 pb-2 flex-1 rounded-md bg-transparent border border-blue outline-none'>
              <AutoResizeTextarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                handleSubmit={handleSubmit}
                className='w-full m-0 p-0 border-0 focus:outline-0 bg-transparent resize-none'
              />
            </div>

            <button
              type='submit'
              onClick={() => askChat(userInput)}
              disabled={!userInput.length}
              className='disabled:fill-gray-600 fill-blue focus:outline-none'
            >
              <SubmitSVG className='w-12 ml-4 pb-2' />
            </button>
          </div>

          {error && (
            <div className={`flex items-start ${isLoading && 'opacity-30'}`}>
              <WarningSVG className='shrink-0 w-6 mr-2 pt-[2px] fill-red-500' />
              <div>
                <span className='mr-2 uppercase text-red-500'>Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

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
        </div>

        {debugData && (
          <div className='w-full flex justify-center pb-6 mt-16'>
            <button
              onClick={openModal}
              className='flex items-center gap-2 uppercase text-xs'
            >
              <ArrowsLeftSVG className='w-4 pb-[1px]' />
              Debugging data
              <ArrowsRightSVG className='w-4 pb-[1px]' />
            </button>
          </div>
        )}

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
      <BorderRightSVG className='absolute bottom-1 right-1 w-8 fill-blue-dark' />
    </div>
  )
}
