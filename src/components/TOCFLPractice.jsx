import { useState, useEffect } from 'react'
import { loadTOCFLData } from '../utils/dataLoader'
import { getDisabledIds, toggleItem } from '../utils/storage'

const STORAGE_KEY = 'randomHanzi_tocflPractice_filters'

function TOCFLPractice() {
  const [selectedLevels, setSelectedLevels] = useState(() => {
    // Force only level 1, ignore any stored values with multiple levels
    return [1]
  })
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [characterFilter, setCharacterFilter] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored).characterFilter : 'single'
    } catch {
      return 'single'
    }
  })
  const [statusFilter, setStatusFilter] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored).statusFilter : 'all'
    } catch {
      return 'all'
    }
  })
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored).searchTerm : ''
    } catch {
      return ''
    }
  })
  const [disabledIdsSet, setDisabledIdsSet] = useState(new Set())

  // Persist filters when they change (force only level 1)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedLevels: [1],
        characterFilter,
        statusFilter,
        searchTerm
      }))
    } catch (error) {
      console.error('Error saving TOCFL filters:', error)
    }
  }, [characterFilter, statusFilter, searchTerm])

  useEffect(() => {
    loadData()
  }, [selectedLevels])

  useEffect(() => {
    // Update disabled IDs cache when data changes
    const disabledIds = getDisabledIds('TOCFL')
    setDisabledIdsSet(new Set(disabledIds))
  }, [data])

  useEffect(() => {
    filterData()
  }, [data, characterFilter, statusFilter, searchTerm, disabledIdsSet])

  const loadData = async () => {
    if (selectedLevels.length === 0) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    const loadedArrays = await Promise.all(
      selectedLevels.map((lvl) => loadTOCFLData(lvl))
    )
    const loaded = loadedArrays.flat()
    setData(loaded)
    setLoading(false)
  }

  const toggleLevel = (lvl) => {
    // Only allow level 1
    if (lvl !== 1) return
    setSelectedLevels([1])
  }

  const filterData = () => {
    let filtered = [...data]

    if (characterFilter === 'single') {
      filtered = filtered.filter((item) => item.characterCount === 1)
    } else if (characterFilter === 'multi') {
      filtered = filtered.filter((item) => item.characterCount > 1)
    }

    // Filter by status using cached Set
    if (statusFilter === 'enabled') {
      filtered = filtered.filter((item) => !disabledIdsSet.has(item.id))
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter((item) => disabledIdsSet.has(item.id))
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((item) => {
        return (
          item.traditionalChinese?.toLowerCase().includes(term) ||
          item.simplifiedChinese?.toLowerCase().includes(term) ||
          item.pinyin?.toLowerCase().includes(term) ||
          item.jyutping?.toLowerCase().includes(term) ||
          item.english?.toLowerCase().includes(term) ||
          item.vietnamese?.toLowerCase().includes(term) ||
          item.hanviet?.toLowerCase().includes(term)
        )
      })
    }

    setFilteredData(filtered)
  }

  const handleToggle = (id) => {
    toggleItem('TOCFL', id)
    // Update the cached Set
    const disabledIds = getDisabledIds('TOCFL')
    setDisabledIdsSet(new Set(disabledIds))
  }

  if (loading) {
    return (
      <div>
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">TOCFL Vocabulary Practice</h2>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <div className="flex gap-2">
              {[1].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => toggleLevel(lvl)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedLevels.includes(lvl)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Type
            </label>
            <div className="flex gap-2">
              {['all', 'single', 'multi'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCharacterFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${characterFilter === filter
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {filter === 'all' ? 'All' : filter === 'single' ? 'Single' : 'Multiple'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {['all', 'enabled', 'disabled'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${statusFilter === filter
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} items
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by character, pinyin, jyutping, english, vietnamese..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item) => (
          <VocabularyCard
            key={item.id}
            item={item}
            enabled={!disabledIdsSet.has(item.id)}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

function VocabularyCard({ item, enabled, onToggle }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-2 ${enabled ? 'border-gray-200' : 'border-gray-400 opacity-60'
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="text-3xl font-bold mb-2 text-gray-800">
            {item.traditionalChinese}
          </div>
          {item.simplifiedChinese !== item.traditionalChinese && (
            <div className="text-2xl text-gray-600 mb-2">
              {item.simplifiedChinese}
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded text-sm font-medium ${enabled
            ? 'bg-red-100 text-red-800 hover:bg-red-200'
            : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
        >
          {enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700">Pinyin:</span>{' '}
          <span className="text-gray-600">{item.pinyin}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Jyutping:</span>{' '}
          <span className="text-gray-600">{item.jyutping}</span>
        </div>
        {item.hanviet && (
          <div>
            <span className="font-semibold text-gray-700">Han Viet:</span>{' '}
            <span className="text-gray-600">{item.hanviet}</span>
          </div>
        )}
        <div>
          <span className="font-semibold text-gray-700">Vietnamese:</span>{' '}
          <span className="text-gray-600">{item.vietnamese}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">English:</span>{' '}
          <span className="text-gray-600">{item.english}</span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {item.characterCount} character{item.characterCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TOCFLPractice

