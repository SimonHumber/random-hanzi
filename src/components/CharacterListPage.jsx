import { useState } from 'react'
import HSKPractice from './HSKPractice'
import TOCFLPractice from './TOCFLPractice'
import KanjiPractice from './KanjiPractice'
import SentencePractice from './SentencePractice'

function CharacterListPage() {
  const [activeTab, setActiveTab] = useState('hsk')

  const tabs = [
    { id: 'hsk', label: 'HSK' },
    { id: 'tocfl', label: 'TOCFL' },
    { id: 'kanji', label: 'Kanji' },
    { id: 'sentence', label: 'Sentence' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Character List</h1>

      <div className="mb-6">
        <div className="flex flex-nowrap gap-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm md:px-4 md:py-3 md:text-base font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 text-gray-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={activeTab === tab.id ? { borderBottomColor: '#282c34' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'hsk' && <HSKPractice />}
        {activeTab === 'tocfl' && <TOCFLPractice />}
        {activeTab === 'kanji' && <KanjiPractice />}
        {activeTab === 'sentence' && <SentencePractice />}
      </div>
    </div>
  )
}

export default CharacterListPage

