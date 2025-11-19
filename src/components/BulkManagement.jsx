import { useState, useEffect } from 'react'
import { loadHSKData, loadTOCFLData, loadKanjiData, loadSentenceData } from '../utils/dataLoader'
import { getRandomlyDisabledIds, randomlyDisableItems, reenableRandomlyDisabled, getDisabledIds } from '../utils/storage'

const AVAILABLE_LEVELS = {
  hsk: [1, 2],
  tocfl: [1],
  kanji: [1, 2],
  sentence: []
}

function BulkManagement() {
  const [category, setCategory] = useState('hsk')
  const [selectedLevels, setSelectedLevels] = useState([1])
  const [count, setCount] = useState(10)
  const [countInput, setCountInput] = useState('10')
  const [characterFilter, setCharacterFilter] = useState('all') // 'all', 'single', 'multi'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [randomlyDisabledCount, setRandomlyDisabledCount] = useState(0)

  useEffect(() => {
    updateRandomlyDisabledCount()
  }, [category, selectedLevels])

  const updateRandomlyDisabledCount = () => {
    const type = getCategoryType(category)
    if (category === 'sentence') {
      const disabled = getRandomlyDisabledIds(type, null)
      setRandomlyDisabledCount(disabled.length)
    } else {
      // Sum up disabled counts from all selected levels
      const totalDisabled = selectedLevels.reduce((sum, lvl) => {
        const disabled = getRandomlyDisabledIds(type, lvl)
        return sum + disabled.length
      }, 0)
      setRandomlyDisabledCount(totalDisabled)
    }
  }

  const getCategoryType = (cat) => {
    switch (cat) {
      case 'hsk': return 'HSK'
      case 'tocfl': return 'TOCFL'
      case 'kanji': return 'KANJI'
      case 'sentence': return 'SENTENCES'
      default: return 'HSK'
    }
  }

  const handleRandomDisable = async () => {
    setLoading(true)
    setMessage('')
    try {
      const type = getCategoryType(category)
      let totalDisabled = 0
      let messages = []

      if (category === 'sentence') {
        const allItems = await loadSentenceData()
        const result = randomlyDisableItems(type, allItems, count, null, characterFilter)
        totalDisabled = result.disabled?.length || 0
        messages.push(result.message)
      } else {
        // Load items from all selected levels, keeping track of which level each item came from
        const itemsByLevel = []
        for (const lvl of selectedLevels) {
          let levelItems = []
          switch (category) {
            case 'hsk':
              levelItems = await loadHSKData(lvl)
              break
            case 'tocfl':
              levelItems = await loadTOCFLData(lvl)
              break
            case 'kanji':
              levelItems = await loadKanjiData(lvl)
              break
            default:
              break
          }
          itemsByLevel.push({ level: lvl, items: levelItems })
        }

        // Combine all items and filter by character type
        let allItems = []
        itemsByLevel.forEach(({ level, items }) => {
          items.forEach((item) => {
            allItems.push({ ...item, _sourceLevel: level })
          })
        })

        // Filter by character type
        if (characterFilter === 'single') {
          if (category === 'kanji') {
            // Kanji are always single character
          } else {
            allItems = allItems.filter((item) => item.characterCount === 1)
          }
        } else if (characterFilter === 'multi') {
          if (category === 'kanji') {
            allItems = []
          } else {
            allItems = allItems.filter((item) => item.characterCount > 1)
          }
        }

        // Get currently enabled items
        const disabledIds = getDisabledIds(type)
        const disabledSet = new Set(disabledIds)
        let enabledItems = allItems.filter((item) => {
          const id = category === 'kanji' ? item.kanji : item.id
          return !disabledSet.has(id)
        })

        if (enabledItems.length === 0) {
          setMessage('No enabled items matching the filter to disable')
          setLoading(false)
          return
        }

        // Randomly select items
        const numToDisable = Math.min(count, enabledItems.length)
        const shuffled = [...enabledItems].sort(() => Math.random() - 0.5)
        const toDisable = shuffled.slice(0, numToDisable)

        // Group by source level and disable
        const itemsBySourceLevel = {}
        toDisable.forEach((item) => {
          const sourceLevel = item._sourceLevel
          if (!itemsBySourceLevel[sourceLevel]) {
            itemsBySourceLevel[sourceLevel] = []
          }
          itemsBySourceLevel[sourceLevel].push(item)
        })

        // Disable items for each level
        for (const [sourceLevel, levelItems] of Object.entries(itemsBySourceLevel)) {
          const levelNum = Number(sourceLevel)
          // Get original items for this level (without _sourceLevel)
          const originalItems = itemsByLevel.find(({ level }) => level === levelNum)?.items || []
          const levelItemIds = levelItems.map((item) => {
            return category === 'kanji' ? item.kanji : item.id
          })
          const levelItemsToDisable = originalItems.filter((item) => {
            const id = category === 'kanji' ? item.kanji : item.id
            return levelItemIds.includes(id)
          })
          
          const result = randomlyDisableItems(type, levelItemsToDisable, levelItemsToDisable.length, levelNum, characterFilter)
          totalDisabled += result.disabled?.length || 0
          messages.push(`Level ${levelNum}: ${result.message}`)
        }
      }

      setMessage(messages.length === 1 ? messages[0] : `Disabled ${totalDisabled} items across ${selectedLevels.length} level(s)`)
      updateRandomlyDisabledCount()
    } catch (error) {
      console.error('Error disabling items:', error)
      setMessage('Error disabling items')
    } finally {
      setLoading(false)
    }
  }

  const handleReenable = () => {
    setLoading(true)
    setMessage('')
    try {
      const type = getCategoryType(category)
      let totalReenabled = 0
      let messages = []

      if (category === 'sentence') {
        const result = reenableRandomlyDisabled(type, null)
        totalReenabled = result.reenabled || 0
        messages.push(result.message)
      } else {
        // Re-enable for all selected levels
        for (const lvl of selectedLevels) {
          const result = reenableRandomlyDisabled(type, lvl)
          totalReenabled += result.reenabled || 0
          if (result.reenabled > 0) {
            messages.push(`Level ${lvl}: ${result.message}`)
          }
        }
      }

      if (totalReenabled === 0) {
        setMessage('No randomly disabled items to re-enable')
      } else {
        setMessage(messages.length === 1 ? messages[0] : `Re-enabled ${totalReenabled} items across ${selectedLevels.length} level(s)`)
      }
      updateRandomlyDisabledCount()
    } catch (error) {
      console.error('Error re-enabling items:', error)
      setMessage('Error re-enabling items')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory)
    const available = AVAILABLE_LEVELS[newCategory]
    if (available.length > 0) {
      setSelectedLevels([available[0]])
    } else {
      setSelectedLevels([])
    }
    setMessage('')
  }

  const toggleLevel = (lvl) => {
    setSelectedLevels((prev) => {
      if (prev.includes(lvl)) {
        const newLevels = prev.filter((l) => l !== lvl)
        return newLevels.length > 0 ? newLevels : [lvl] // Keep at least one selected
      } else {
        return [...prev, lvl].sort()
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bulk Management</h1>
      <p className="text-gray-600 mb-6">
        Randomly disable a specified number of characters or re-enable previously randomly disabled items for each test.
      </p>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'hsk', label: 'HSK', color: '#282c34' },
                { value: 'tocfl', label: 'TOCFL', color: '#10b981' },
                { value: 'kanji', label: 'Kanji', color: '#a855f7' },
                { value: 'sentence', label: 'Sentence', color: '#f97316' }
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat.value
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={category === cat.value ? { backgroundColor: cat.color } : {}}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {(category === 'hsk' || category === 'tocfl' || category === 'kanji') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === 'kanji' ? 'Grade' : 'Level'}
              </label>
              <div className="flex gap-2">
                {AVAILABLE_LEVELS[category].map((lvl) => {
                  const colorMap = {
                    hsk: '#282c34',
                    tocfl: '#10b981',
                    kanji: '#a855f7'
                  }
                  const color = colorMap[category] || '#282c34'
                  return (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedLevels.includes(lvl)
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={selectedLevels.includes(lvl) ? { backgroundColor: color } : {}}
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {(category === 'hsk' || category === 'tocfl' || category === 'sentence') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Type
              </label>
              <div className="flex gap-2">
                {['all', 'single', 'multi'].map((filter) => {
                  const colorMap = {
                    hsk: '#282c34',
                    tocfl: '#10b981',
                    sentence: '#f97316'
                  }
                  const color = colorMap[category] || '#282c34'
                  return (
                    <button
                      key={filter}
                      onClick={() => setCharacterFilter(filter)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        characterFilter === filter
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={characterFilter === filter ? { backgroundColor: color } : {}}
                    >
                      {filter === 'all' ? 'All' : filter === 'single' ? 'Single' : 'Multiple'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Items to Randomly Disable
            </label>
            <input
              type="number"
              min="1"
              value={countInput}
              onChange={(e) => {
                const value = e.target.value
                setCountInput(value)
                const numValue = Number(value)
                if (value !== '' && !isNaN(numValue) && numValue >= 1) {
                  setCount(numValue)
                }
              }}
              onBlur={(e) => {
                const numValue = Number(e.target.value)
                if (e.target.value === '' || isNaN(numValue) || numValue < 1) {
                  setCountInput('1')
                  setCount(1)
                } else {
                  setCountInput(String(numValue))
                  setCount(numValue)
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will randomly select and disable the specified number of enabled items.
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRandomDisable}
              disabled={loading}
              className="px-6 py-2 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: '#282c34' }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#3a3f47'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#282c34'
                }
              }}
            >
              {loading ? 'Processing...' : 'Randomly Disable'}
            </button>

            {randomlyDisabledCount > 0 && (
              <button
                onClick={handleReenable}
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : `Re-enable ${randomlyDisabledCount} Items`}
              </button>
            )}
          </div>

          {randomlyDisabledCount > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>{randomlyDisabledCount}</strong> items are currently randomly disabled for this category{selectedLevels.length > 0 && ` and selected level(s)`}.
                Click "Re-enable" to restore them.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">How it works</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <span>Select a category and level/grade</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <span>Specify how many items you want to randomly disable</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <span>The system will randomly select and disable that many enabled items</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <span>You can re-enable all randomly disabled items at any time</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <span>Each category and level combination is tracked separately</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BulkManagement

