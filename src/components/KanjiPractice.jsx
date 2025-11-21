import { useState, useEffect } from 'react'
import { loadKanjiData } from '../utils/dataLoader'
import { getDisabledIds, toggleItem } from '../utils/storage'

const STORAGE_KEY = 'randomHanzi_kanjiPractice_filters'

function KanjiPractice() {
  const [selectedGrades, setSelectedGrades] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored).selectedGrades : [1]
    } catch {
      return [1]
    }
  })
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
  const [disabledIdsSet, setDisabledIdsSet] = useState(new Set())

  // Persist filters when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedGrades,
        statusFilter,
        searchTerm
      }))
    } catch (error) {
      console.error('Error saving Kanji filters:', error)
    }
  }, [selectedGrades, statusFilter, searchTerm])

  useEffect(() => {
    loadData()
  }, [selectedGrades])

  useEffect(() => {
    // Update disabled IDs cache when data changes
    const disabledIds = getDisabledIds('KANJI')
    setDisabledIdsSet(new Set(disabledIds))
  }, [data])

  useEffect(() => {
    filterData()
  }, [data, statusFilter, searchTerm, disabledIdsSet])

  const loadData = async () => {
    if (selectedGrades.length === 0) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    const loadedArrays = await Promise.all(
      selectedGrades.map((grd) => loadKanjiData(grd))
    )
    const loaded = loadedArrays.flat()
    setData(loaded)
    setLoading(false)
  }

  const toggleGrade = (grd) => {
    setSelectedGrades((prev) => {
      if (prev.includes(grd)) {
        const newGrades = prev.filter((g) => g !== grd)
        return newGrades.length > 0 ? newGrades : [grd] // Keep at least one selected
      } else {
        return [...prev, grd].sort()
      }
    })
  }

  const filterData = () => {
    let filtered = [...data]

    // Filter by status using cached Set
    if (statusFilter === 'enabled') {
      filtered = filtered.filter((item) => !disabledIdsSet.has(item.kanji))
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter((item) => disabledIdsSet.has(item.kanji))
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((item) => {
        return (
          item.kanji?.toLowerCase().includes(term) ||
          item.onyomi?.toLowerCase().includes(term) ||
          item.kunyomi?.toLowerCase().includes(term) ||
          item.english?.toLowerCase().includes(term) ||
          item.viet?.toLowerCase().includes(term) ||
          item.hanviet?.toLowerCase().includes(term)
        )
      })
    }

    setFilteredData(filtered)
  }

  const handleToggle = (kanji) => {
    toggleItem('KANJI', kanji)
    // Update the cached Set
    const disabledIds = getDisabledIds('KANJI')
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Kanji Practice</h2>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <div className="flex gap-2">
              {[1, 2].map((grd) => (
                <button
                  key={grd}
                  onClick={() => toggleGrade(grd)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedGrades.includes(grd)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {grd}
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    statusFilter === filter
                      ? 'bg-purple-500 text-white'
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
            placeholder="Search by kanji, on'yomi, kun'yomi, english, vietnamese..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item, index) => (
          <KanjiCard
            key={`${item.kanji}-${index}`}
            item={item}
            enabled={!disabledIdsSet.has(item.kanji)}
            onToggle={() => handleToggle(item.kanji)}
          />
        ))}
      </div>
    </div>
  )
}

function KanjiCard({ item, enabled, onToggle }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-2 ${
        enabled ? 'border-gray-200' : 'border-gray-400 opacity-60'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl font-bold text-gray-800">{item.kanji}</div>
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded text-sm font-medium ${
            enabled
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700">On'yomi:</span>{' '}
          <span className="text-gray-600">{item.onyomi || 'N/A'}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Kun'yomi:</span>{' '}
          <span className="text-gray-600">{item.kunyomi || 'N/A'}</span>
        </div>
        {item.hanviet && (
          <div>
            <span className="font-semibold text-gray-700">Han Viet:</span>{' '}
            <span className="text-gray-600">{item.hanviet}</span>
          </div>
        )}
        <div>
          <span className="font-semibold text-gray-700">Vietnamese:</span>{' '}
          <span className="text-gray-600">{item.viet}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">English:</span>{' '}
          <span className="text-gray-600">{item.english}</span>
        </div>
      </div>
    </div>
  )
}

export default KanjiPractice

