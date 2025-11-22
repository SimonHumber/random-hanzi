import { useState, useEffect, useRef } from 'react'
import { List } from 'react-window'
import { loadSentenceData } from '../utils/dataLoader'
import { getDisabledIds, toggleItem } from '../utils/storage'

const STORAGE_KEY = 'randomHanzi_sentencePractice_filters'
const ROW_HEIGHT = 390
const LIST_HEIGHT = 600

function SentencePractice() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
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
  const [selectedHSKLevels, setSelectedHSKLevels] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.selectedHSKLevels || [1, 2, 3, 4, 5, 6, 7]
      }
      return [1, 2, 3, 4, 5, 6, 7]
    } catch {
      return [1, 2, 3, 4, 5, 6, 7]
    }
  })
  const [selectedTOCFLLevels, setSelectedTOCFLLevels] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.selectedTOCFLLevels || [1, 2, 3, 4, 5]
      }
      return [1, 2, 3, 4, 5]
    } catch {
      return [1, 2, 3, 4, 5]
    }
  })
  const [disabledIdsSet, setDisabledIdsSet] = useState(new Set())

  // Persist filters when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        statusFilter,
        searchTerm,
        selectedHSKLevels,
        selectedTOCFLLevels
      }))
    } catch (error) {
      console.error('Error saving Sentence filters:', error)
    }
  }, [statusFilter, searchTerm, selectedHSKLevels, selectedTOCFLLevels])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Update disabled IDs cache when data changes
    const disabledIds = getDisabledIds('SENTENCES')
    setDisabledIdsSet(new Set(disabledIds))
  }, [data])

  useEffect(() => {
    filterData()
  }, [data, statusFilter, searchTerm, disabledIdsSet, selectedHSKLevels, selectedTOCFLLevels])

  const loadData = async () => {
    setLoading(true)
    const loaded = await loadSentenceData()
    setData(loaded)
    setLoading(false)
  }

  const filterData = () => {
    let filtered = [...data]

    // Filter by HSK and TOCFL levels
    const hskLevels = selectedHSKLevels || []
    const tocflLevels = selectedTOCFLLevels || []
    if (hskLevels.length > 0 || tocflLevels.length > 0) {
      filtered = filtered.filter((item) => {
        const hskLevel = item.hsk_level ? parseInt(item.hsk_level) : null
        const tocflLevel = item.tocfl_level ? parseInt(item.tocfl_level) : null

        const matchesHSK = hskLevels.length > 0 && hskLevel !== null && hskLevels.includes(hskLevel)
        const matchesTOCFL = tocflLevels.length > 0 && tocflLevel !== null && tocflLevels.includes(tocflLevel)

        // Show if matches HSK levels OR TOCFL levels (or both)
        if (hskLevels.length > 0 && tocflLevels.length > 0) {
          return matchesHSK || matchesTOCFL
        } else if (hskLevels.length > 0) {
          return matchesHSK
        } else {
          return matchesTOCFL
        }
      })
    } else {
      // If both filters are empty, show nothing
      filtered = []
    }

    // Filter by status using cached Set
    if (statusFilter === 'enabled') {
      filtered = filtered.filter((item, index) =>
        !disabledIdsSet.has(index)
      )
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter((item, index) =>
        disabledIdsSet.has(index)
      )
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
          item.viet?.toLowerCase().includes(term) ||
          item.hanviet?.toLowerCase().includes(term)
        )
      })
    }

    setFilteredData(filtered)
  }

  const toggleHSKLevel = (lvl) => {
    setSelectedHSKLevels((prev) => {
      const prevLevels = prev || []
      if (prevLevels.includes(lvl)) {
        const newLevels = prevLevels.filter((l) => l !== lvl)
        // Allow empty only if TOCFL has at least one selected
        if (newLevels.length === 0) {
          const tocflLevels = selectedTOCFLLevels || []
          if (tocflLevels.length > 0) {
            return [] // Can be empty if TOCFL has selections
          } else {
            return [lvl] // Must keep at least one if TOCFL is also empty
          }
        }
        return newLevels
      }
      return [...prevLevels, lvl].sort()
    })
  }

  const toggleTOCFLLevel = (lvl) => {
    setSelectedTOCFLLevels((prev) => {
      const prevLevels = prev || []
      if (prevLevels.includes(lvl)) {
        const newLevels = prevLevels.filter((l) => l !== lvl)
        // Allow empty only if HSK has at least one selected
        if (newLevels.length === 0) {
          const hskLevels = selectedHSKLevels || []
          if (hskLevels.length > 0) {
            return [] // Can be empty if HSK has selections
          } else {
            return [lvl] // Must keep at least one if HSK is also empty
          }
        }
        return newLevels
      }
      return [...prevLevels, lvl].sort()
    })
  }

  const handleToggle = (index) => {
    toggleItem('SENTENCES', index)
    // Update the cached Set
    const disabledIds = getDisabledIds('SENTENCES')
    setDisabledIdsSet(new Set(disabledIds))
  }

  const containerRef = useRef(null)

  if (loading) {
    return (
      <div>
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sentence Practice</h2>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HSK Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => toggleHSKLevel(lvl)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedHSKLevels.includes(lvl)
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  style={selectedHSKLevels.includes(lvl) ? { backgroundColor: '#282c34' } : {}}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TOCFL Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => toggleTOCFLLevel(lvl)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTOCFLLevels.includes(lvl)
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  style={selectedTOCFLLevels.includes(lvl) ? { backgroundColor: '#10b981' } : {}}
                >
                  {lvl}
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
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} sentences
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {filteredData.length > 0 && (
        <div ref={containerRef} style={{ width: '100%', height: `${LIST_HEIGHT}px` }}>
          <List
            rowComponent={Row}
            rowCount={filteredData.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ items: filteredData, allData: data, disabledIdsSet, handleToggle }}
          />
        </div>
      )}
    </div>
  )
}

function Row({ index, style, items, allData, disabledIdsSet, handleToggle }) {
  const item = items[index]
  const originalIndex = allData.indexOf(item)

  return (
    <div style={{ ...style, paddingLeft: '8px', paddingRight: '8px', paddingBottom: '12px', display: 'flex' }}>
      <SentenceCard
        item={item}
        index={originalIndex}
        enabled={!disabledIdsSet.has(originalIndex)}
        onToggle={() => handleToggle(originalIndex)}
      />
    </div>
  )
}

function SentenceCard({ item, index, enabled, onToggle }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 ${enabled ? 'border-gray-200' : 'border-gray-400 opacity-60'
        }`}
      style={{ boxSizing: 'border-box', overflow: 'auto', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '370px' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 break-words">
            {item.traditionalChinese}
          </div>
          {item.simplifiedChinese && item.simplifiedChinese !== item.traditionalChinese && (
            <div className="text-lg sm:text-xl text-gray-600 mb-2 break-words">
              {item.simplifiedChinese}
            </div>
          )}
          <div className="flex gap-2 flex-wrap mb-2">
            {item.hsk_level && item.hsk_level !== '0' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full text-white" style={{ backgroundColor: '#282c34' }}>
                HSK {item.hsk_level}
              </span>
            )}
            {item.tocfl_level && item.tocfl_level !== '0' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full text-white" style={{ backgroundColor: '#10b981' }}>
                TOCFL {item.tocfl_level}
              </span>
            )}
          </div>
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

      <div className="space-y-2 text-xs sm:text-sm flex-1">
        <div className="break-words">
          <span className="font-semibold text-gray-700">Pinyin:</span>{' '}
          <span className="text-gray-600">{item.pinyin}</span>
        </div>
        <div className="break-words">
          <span className="font-semibold text-gray-700">Jyutping:</span>{' '}
          <span className="text-gray-600">{item.jyutping}</span>
        </div>
        {item.hanviet && (
          <div className="break-words">
            <span className="font-semibold text-gray-700">Han Viet:</span>{' '}
            <span className="text-gray-600">{item.hanviet}</span>
          </div>
        )}
        <div className="break-words">
          <span className="font-semibold text-gray-700">Vietnamese:</span>{' '}
          <span className="text-gray-600">{item.viet}</span>
        </div>
        <div className="break-words">
          <span className="font-semibold text-gray-700">English:</span>{' '}
          <span className="text-gray-600">{item.english}</span>
        </div>
      </div>
    </div>
  )
}

export default SentencePractice

