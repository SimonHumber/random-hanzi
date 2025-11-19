import { useState, useRef } from 'react'

function ToneGuide() {
  const [activeTab, setActiveTab] = useState('mandarin')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tone Guide</h1>
      <p className="text-gray-600 mb-6">
        Learn tones for Mandarin Chinese, Cantonese, and Vietnamese
      </p>

      <div className="mb-6">
        <div className="flex flex-nowrap gap-1 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mandarin')}
            className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base font-medium transition-colors whitespace-nowrap ${
              activeTab === 'mandarin'
                ? 'border-b-2 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'mandarin' ? { borderBottomColor: '#282c34' } : {}}
          >
            Mandarin
          </button>
          <button
            onClick={() => setActiveTab('cantonese')}
            className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base font-medium transition-colors whitespace-nowrap ${
              activeTab === 'cantonese'
                ? 'border-b-2 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'cantonese' ? { borderBottomColor: '#282c34' } : {}}
          >
            Cantonese
          </button>
          <button
            onClick={() => setActiveTab('vietnamese')}
            className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base font-medium transition-colors whitespace-nowrap ${
              activeTab === 'vietnamese'
                ? 'border-b-2 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'vietnamese' ? { borderBottomColor: '#282c34' } : {}}
          >
            Vietnamese
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'mandarin' && <MandarinTones />}
        {activeTab === 'cantonese' && <CantoneseTones />}
        {activeTab === 'vietnamese' && <VietnameseTones />}
      </div>
    </div>
  )
}

function MandarinTones() {
  const tones = [
    {
      number: 1,
      name: 'First Tone (High Level)',
      mark: 'ā',
      description: 'High and level, like singing a note',
      example: 'mā (mother)',
      toneMark: 'ˉ',
    },
    {
      number: 2,
      name: 'Second Tone (Rising)',
      mark: 'á',
      description: 'Rises from middle to high, like asking a question',
      example: 'má (hemp)',
      toneMark: 'ˊ',
    },
    {
      number: 3,
      name: 'Third Tone (Low/Dipping)',
      mark: 'ǎ',
      description: 'Falls then rises, like saying "huh?"',
      example: 'mǎ (horse)',
      toneMark: 'ˇ',
    },
    {
      number: 4,
      name: 'Fourth Tone (Falling)',
      mark: 'à',
      description: 'Falls sharply from high to low, like a command',
      example: 'mà (scold)',
      toneMark: 'ˋ',
    },
    {
      number: 0,
      name: 'Neutral Tone',
      mark: 'a',
      description: 'Light and short, no tone mark',
      example: 'ma (question particle)',
      toneMark: '',
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mandarin Chinese Tones</h2>
      <p className="text-gray-600">
        Mandarin Chinese has 4 main tones plus a neutral tone. Each tone changes the meaning of a word.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tones.map((tone) => (
          <ToneCard key={tone.number} tone={tone} />
        ))}
      </div>
    </div>
  )
}

function CantoneseTones() {
  const tones = [
    {
      number: 1,
      name: 'Tone 1 (High Level)',
      description: 'High and level',
      example: 'si1 (poem)',
      audioFile: '/audio/si1.mp3',
    },
    {
      number: 2,
      name: 'Tone 2 (High Rising)',
      description: 'High rising',
      example: 'si2 (history)',
      audioFile: '/audio/si2.mp3',
    },
    {
      number: 3,
      name: 'Tone 3 (Mid Level)',
      description: 'Mid level',
      example: 'si3 (try)',
      audioFile: '/audio/si3.mp3',
    },
    {
      number: 4,
      name: 'Tone 4 (Low Falling)',
      description: 'Low falling',
      example: 'si4 (matter)',
      audioFile: '/audio/si4.mp3',
    },
    {
      number: 5,
      name: 'Tone 5 (Low Rising)',
      description: 'Low rising',
      example: 'si5 (time)',
      audioFile: '/audio/si5.mp3',
    },
    {
      number: 6,
      name: 'Tone 6 (Low Level)',
      description: 'Low level',
      example: 'si6 (is)',
      audioFile: '/audio/si6.mp3',
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Cantonese Tones</h2>
      <p className="text-gray-600">
        Cantonese has 6 tones. Click the play button to hear each tone.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tones.map((tone) => (
          <CantoneseToneCard key={tone.number} tone={tone} />
        ))}
      </div>
    </div>
  )
}

function CantoneseToneCard({ tone }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{tone.name}</h3>
        <button
          onClick={handlePlay}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'text-white'
          }`}
          style={!isPlaying ? { backgroundColor: '#282c34' } : {}}
        >
          {isPlaying ? '⏸ Stop' : '▶ Play'}
        </button>
      </div>
      <audio
        ref={audioRef}
        src={tone.audioFile}
        onEnded={handleEnded}
        onError={(e) => {
          console.error('Audio error:', e)
          setIsPlaying(false)
        }}
      />
      <p className="text-gray-600 mb-2">{tone.description}</p>
      <p className="text-lg font-semibold text-gray-800">Example: <span className="italic">{tone.example}</span></p>
    </div>
  )
}

function VietnameseTones() {
  const tones = [
    {
      number: 1,
      name: 'Ngang (Level)',
      mark: 'a',
      description: 'Level tone, no mark',
      example: 'ba (three)',
    },
    {
      number: 2,
      name: 'Huyền (Falling)',
      mark: 'à',
      description: 'Falling tone',
      example: 'bà (grandmother)',
    },
    {
      number: 3,
      name: 'Sắc (Rising)',
      mark: 'á',
      description: 'Rising tone',
      example: 'bá (uncle)',
    },
    {
      number: 4,
      name: 'Hỏi (Dipping)',
      mark: 'ả',
      description: 'Dipping tone',
      example: 'bả (poison)',
    },
    {
      number: 5,
      name: 'Ngã (Broken Rising)',
      mark: 'ã',
      description: 'Broken rising tone',
      example: 'bã (residue)',
      note: 'Note: In Southern Vietnamese dialect, this tone is often pronounced the same as the Hỏi (dipping) tone.',
    },
    {
      number: 6,
      name: 'Nặng (Heavy)',
      mark: 'ạ',
      description: 'Heavy/falling tone',
      example: 'bạ (silver)',
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Vietnamese Tones</h2>
      <p className="text-gray-600">
        Vietnamese has 6 tones. Each tone is marked with a diacritic on the vowel.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tones.map((tone) => (
          <ToneCard key={tone.number} tone={tone} />
        ))}
      </div>
    </div>
  )
}

function ToneCard({ tone }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{tone.name}</h3>
      <div className="space-y-2">
        <p className="text-gray-600">{tone.description}</p>
        {tone.toneMark && (
          <p className="text-sm text-gray-500">
            Tone Mark: <span className="text-2xl">{tone.toneMark}</span>
          </p>
        )}
        <p className="text-lg font-semibold text-gray-800">
          Example: <span className="text-2xl italic">{tone.example}</span>
        </p>
        {tone.mark && (
          <p className="text-sm text-gray-500">
            Mark: <span className="text-xl">{tone.mark}</span>
          </p>
        )}
        {tone.note && (
          <p className="text-sm text-gray-600 italic mt-2 pt-2 border-t border-gray-200">
            {tone.note}
          </p>
        )}
      </div>
    </div>
  )
}

export default ToneGuide

