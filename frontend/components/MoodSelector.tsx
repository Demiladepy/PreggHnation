interface MoodSelectorProps {
  selectedScore: number | null
  onSelect: (score: number) => void
}

const MOOD_EMOJIS = [
  { score: 1, emoji: '😢', label: 'Very Low' },
  { score: 2, emoji: '😔', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
]

export default function MoodSelector({ selectedScore, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex justify-between gap-2">
      {MOOD_EMOJIS.map(({ score, emoji, label }) => (
        <button
          key={score}
          onClick={() => onSelect(score)}
          className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-smooth border-2 ${
            selectedScore === score
              ? 'border-bloom-400 bg-bloom-50'
              : 'border-transparent hover:bg-gray-50'
          }`}
        >
          <span className={`text-3xl md:text-4xl transition-transform ${
            selectedScore === score ? 'scale-110' : ''
          }`}>
            {emoji}
          </span>
          <span className="text-xs text-gray-600 hidden sm:block">{label}</span>
        </button>
      ))}
    </div>
  )
}
