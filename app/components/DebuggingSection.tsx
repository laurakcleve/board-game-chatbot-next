import { ResponseData } from '../types/chat'

interface DebuggingSectionProps {
  heading: string
  content: ResponseData['debugData'][keyof ResponseData['debugData']]
}

export default function DebuggingSection({
  heading,
  content,
}: DebuggingSectionProps) {
  return (
    <div className='mb-10'>
      <h1 className='text-xl mb-4 text-orange-300'>{heading}</h1>
      <pre className='whitespace-pre-wrap text-sm'>
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  )
}
