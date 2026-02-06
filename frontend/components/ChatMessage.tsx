interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bloom-400 to-bloom-600 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
          🌸
        </div>
      )}
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-bloom-500 text-white rounded-br-md'
            : 'bg-white shadow-md rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm md:text-base">{content}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-bloom-200' : 'text-gray-400'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
