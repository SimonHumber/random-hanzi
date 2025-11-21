import { useState, useEffect, useCallback, useRef } from 'react'
import { loadHSKData, loadTOCFLData, loadKanjiData, loadSentenceData } from '../utils/dataLoader'
import { isItemEnabled, toggleItem, getDisabledIds } from '../utils/storage'

// Available levels for each category
const AVAILABLE_LEVELS = {
  hsk: [1, 2, 3, 4, 5, 6, 7],
  tocfl: [1, 2, 3, 4, 5],
  kanji: [1, 2],
  sentence: []
}

const STORAGE_KEY = 'randomHanzi_generator_state'
const STORAGE_KEY_ITEMS = 'randomHanzi_generator_items' // Store items per category+level

// Load state from localStorage
const loadPersistedState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading persisted state:', error)
  }
  return null
}

// Save state to localStorage
const savePersistedState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving persisted state:', error)
  }
}

// Get storage key for a specific category+level combination
const getItemStorageKey = (category, selectedLevels) => {
  const levelsStr = selectedLevels.sort().join(',')
  return `${STORAGE_KEY_ITEMS}_${category}_${levelsStr}`
}

// Load persisted item for a specific category+level
const loadPersistedItem = (category, selectedLevels) => {
  try {
    const key = getItemStorageKey(category, selectedLevels)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading persisted item:', error)
  }
  return null
}

// Save item for a specific category+level
const savePersistedItem = (category, selectedLevels, item) => {
  try {
    const key = getItemStorageKey(category, selectedLevels)
    if (item) {
      localStorage.setItem(key, JSON.stringify(item))
    } else {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error('Error saving persisted item:', error)
  }
}

function RandomGenerator() {
  const persistedState = loadPersistedState()
  const [category, setCategory] = useState(persistedState?.category || 'hsk')
  const [selectedLevels, setSelectedLevels] = useState(persistedState?.selectedLevels || [1]) // Array of selected levels
  const [characterFilter, setCharacterFilter] = useState(persistedState?.characterFilter || 'all') // 'all', 'single', 'multi'
  // Initialize with saved item if it exists
  const initialItem = loadPersistedItem(
    persistedState?.category || 'hsk',
    persistedState?.selectedLevels || [1]
  )
  const [currentItem, setCurrentItem] = useState(initialItem)
  const [loading, setLoading] = useState(false)
  const [toggleKey, setToggleKey] = useState(0) // Force re-render when item is toggled
  const [enabledCount, setEnabledCount] = useState(0)
  const [disabledCount, setDisabledCount] = useState(0)
  const isInitialMount = useRef(true)
  const previousCategory = useRef(category)
  const previousLevels = useRef(JSON.stringify(selectedLevels))
  const isGenerating = useRef(false) // Track if generation is in progress
  const lastClickTime = useRef(0) // Track last click time for debouncing

  const generateRandom = useCallback(async () => {
    // Note: For button clicks, flag and loading are set in onClick handler
    // For direct calls (e.g., from useEffect), set them here
    if (!isGenerating.current) {
      isGenerating.current = true
      setLoading(true)
    }
    // If already generating, proceed anyway (flag was set in onClick)
    try {
      let data = []
      let filteredData = []

      switch (category) {
        case 'hsk':
          // Load data from all selected levels and combine
          const hskDataPromises = selectedLevels.map((lvl) => loadHSKData(lvl))
          const hskDataArrays = await Promise.all(hskDataPromises)
          data = hskDataArrays.flat()
          filteredData = data.filter((item) => isItemEnabled('HSK', item.id))
          // Filter by character count
          if (characterFilter === 'single') {
            filteredData = filteredData.filter((item) => item.characterCount === 1)
          } else if (characterFilter === 'multi') {
            filteredData = filteredData.filter((item) => item.characterCount > 1)
          }
          break
        case 'tocfl':
          // Load data from all selected levels and combine
          const tocflDataPromises = selectedLevels.map((lvl) => loadTOCFLData(lvl))
          const tocflDataArrays = await Promise.all(tocflDataPromises)
          data = tocflDataArrays.flat()
          filteredData = data.filter((item) => isItemEnabled('TOCFL', item.id))
          // Filter by character count
          if (characterFilter === 'single') {
            filteredData = filteredData.filter((item) => item.characterCount === 1)
          } else if (characterFilter === 'multi') {
            filteredData = filteredData.filter((item) => item.characterCount > 1)
          }
          break
        case 'kanji':
          // Load data from all selected levels and combine
          const kanjiDataPromises = selectedLevels.map((lvl) => loadKanjiData(lvl))
          const kanjiDataArrays = await Promise.all(kanjiDataPromises)
          data = kanjiDataArrays.flat()
          filteredData = data.filter((item) => isItemEnabled('KANJI', item.kanji))
          // Kanji are always single character, but we can still apply filter for consistency
          if (characterFilter === 'multi') {
            filteredData = [] // No multi-character kanji
          }
          break
        case 'sentence':
          data = await loadSentenceData()
          filteredData = data
            .map((item, index) => ({ ...item, originalIndex: index }))
            .filter((item) => isItemEnabled('SENTENCES', item.originalIndex))
          // Filter by character count in sentence
          if (characterFilter === 'single') {
            filteredData = filteredData.filter((item) => {
              const charCount = item.simplifiedChinese ? item.simplifiedChinese.replace(/\s/g, '').length : 0
              return charCount === 1
            })
          } else if (characterFilter === 'multi') {
            filteredData = filteredData.filter((item) => {
              const charCount = item.simplifiedChinese ? item.simplifiedChinese.replace(/\s/g, '').length : 0
              return charCount > 1
            })
          }
          break
        default:
          break
      }

      if (filteredData.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredData.length)
        const selectedItem = filteredData[randomIndex]
        // For sentences, ensure we have the originalIndex
        if (category === 'sentence' && !selectedItem.originalIndex) {
          selectedItem.originalIndex = data.indexOf(selectedItem)
        }
        const newItem = { ...selectedItem, category }
        setCurrentItem(newItem)
        savePersistedItem(category, selectedLevels, newItem)
      } else {
        // If no enabled items, use all data
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length)
          const selectedItem = data[randomIndex]
          // For sentences, add originalIndex
          if (category === 'sentence') {
            selectedItem.originalIndex = randomIndex
          }
          const newItem = { ...selectedItem, category }
          setCurrentItem(newItem)
          savePersistedItem(category, selectedLevels, newItem)
        }
      }
    } catch (error) {
      console.error('Error generating random item:', error)
    } finally {
      setLoading(false)
      isGenerating.current = false
    }
  }, [category, selectedLevels, characterFilter])

  // Persist state changes to localStorage (filters only, not items)
  useEffect(() => {
    savePersistedState({
      category,
      selectedLevels,
      characterFilter
    })
  }, [category, selectedLevels, characterFilter])

  // Save item when it changes
  useEffect(() => {
    if (currentItem) {
      savePersistedItem(category, selectedLevels, currentItem)
    }
  }, [currentItem, category, selectedLevels])

  // Load item on mount - always load saved item if it exists, don't randomize
  useEffect(() => {
    // On mount, try to load saved item (already done in useState initialization)
    // Only generate if no saved item exists
    if (!currentItem) {
      generateRandom()
    }
    isInitialMount.current = false
    previousCategory.current = category
    previousLevels.current = JSON.stringify(selectedLevels)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update counts when category, levels, character filter, or toggle changes
  useEffect(() => {
    const updateCounts = async () => {
      try {
        let data = []
        let disabledIdsSet = new Set()

        switch (category) {
          case 'hsk':
            const hskDataPromises = selectedLevels.map((lvl) => loadHSKData(lvl))
            const hskDataArrays = await Promise.all(hskDataPromises)
            data = hskDataArrays.flat()
            disabledIdsSet = new Set(getDisabledIds('HSK'))
            // Filter by character count
            if (characterFilter === 'single') {
              data = data.filter((item) => item.characterCount === 1)
            } else if (characterFilter === 'multi') {
              data = data.filter((item) => item.characterCount > 1)
            }
            break
          case 'tocfl':
            const tocflDataPromises = selectedLevels.map((lvl) => loadTOCFLData(lvl))
            const tocflDataArrays = await Promise.all(tocflDataPromises)
            data = tocflDataArrays.flat()
            disabledIdsSet = new Set(getDisabledIds('TOCFL'))
            // Filter by character count
            if (characterFilter === 'single') {
              data = data.filter((item) => item.characterCount === 1)
            } else if (characterFilter === 'multi') {
              data = data.filter((item) => item.characterCount > 1)
            }
            break
          case 'kanji':
            const kanjiDataPromises = selectedLevels.map((lvl) => loadKanjiData(lvl))
            const kanjiDataArrays = await Promise.all(kanjiDataPromises)
            data = kanjiDataArrays.flat()
            disabledIdsSet = new Set(getDisabledIds('KANJI'))
            // Kanji are always single character, but we can still apply filter for consistency
            if (characterFilter === 'multi') {
              data = [] // No multi-character kanji
            }
            break
          case 'sentence':
            data = await loadSentenceData()
            disabledIdsSet = new Set(getDisabledIds('SENTENCES'))
            // Filter by character count in sentence
            if (characterFilter === 'single') {
              data = data.filter((item) => {
                const charCount = item.simplifiedChinese ? item.simplifiedChinese.replace(/\s/g, '').length : 0
                return charCount === 1
              })
            } else if (characterFilter === 'multi') {
              data = data.filter((item) => {
                const charCount = item.simplifiedChinese ? item.simplifiedChinese.replace(/\s/g, '').length : 0
                return charCount > 1
              })
            }
            break
          default:
            break
        }

        let enabled = 0
        let disabled = 0

        if (category === 'sentence') {
          data.forEach((item, index) => {
            if (disabledIdsSet.has(index)) {
              disabled++
            } else {
              enabled++
            }
          })
        } else if (category === 'kanji') {
          data.forEach((item) => {
            if (disabledIdsSet.has(item.kanji)) {
              disabled++
            } else {
              enabled++
            }
          })
        } else {
          data.forEach((item) => {
            if (disabledIdsSet.has(item.id)) {
              disabled++
            } else {
              enabled++
            }
          })
        }

        setEnabledCount(enabled)
        setDisabledCount(disabled)
      } catch (error) {
        console.error('Error updating counts:', error)
      }
    }

    updateCounts()
  }, [category, selectedLevels, characterFilter, toggleKey])

  // Generate new random when category or levels change (but not on initial mount or page navigation)
  useEffect(() => {
    if (isInitialMount.current) {
      return // Skip on initial mount
    }

    // Check if category or levels actually changed
    const categoryChanged = previousCategory.current !== category
    const levelsChanged = previousLevels.current !== JSON.stringify(selectedLevels)

    if (categoryChanged || levelsChanged) {
      // Always generate new random when switching tests
      generateRandom()
      previousCategory.current = category
      previousLevels.current = JSON.stringify(selectedLevels)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, selectedLevels])


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        Random Character Generator
      </h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-nowrap gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setCategory('hsk')
                  const available = AVAILABLE_LEVELS['hsk']
                  setSelectedLevels(available.length > 0 ? [available[0]] : [])
                  setCharacterFilter('all')
                }}
                className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ${category === 'hsk'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                style={category === 'hsk' ? { backgroundColor: '#282c34' } : {}}
              >
                HSK
              </button>
              <button
                onClick={() => {
                  setCategory('tocfl')
                  const available = AVAILABLE_LEVELS['tocfl']
                  setSelectedLevels(available.length > 0 ? [available[0]] : [])
                  setCharacterFilter('all')
                }}
                className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ${category === 'tocfl'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                style={category === 'tocfl' ? { backgroundColor: '#10b981' } : {}}
              >
                TOCFL
              </button>
              <button
                onClick={() => {
                  setCategory('kanji')
                  const available = AVAILABLE_LEVELS['kanji']
                  setSelectedLevels(available.length > 0 ? [available[0]] : [])
                  setCharacterFilter('all')
                }}
                className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ${category === 'kanji'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                style={category === 'kanji' ? { backgroundColor: '#a855f7' } : {}}
              >
                Kanji
              </button>
              <button
                onClick={() => {
                  setCategory('sentence')
                  const available = AVAILABLE_LEVELS['sentence']
                  setSelectedLevels(available.length > 0 ? [available[0]] : [])
                  setCharacterFilter('all')
                }}
                className={`px-3 py-2 text-sm md:px-4 md:py-2 md:text-base rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0 ${category === 'sentence'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                style={category === 'sentence' ? { backgroundColor: '#f97316' } : {}}
              >
                Sentence
              </button>
            </div>
          </div>

          {(category === 'hsk' || category === 'tocfl' || category === 'kanji') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === 'kanji' ? 'Grade' : 'Level'}
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LEVELS[category].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedLevels((prev) => {
                        if (prev.includes(lvl)) {
                          // If clicking a selected level, only remove it if there's another selected
                          const newLevels = prev.filter((l) => l !== lvl)
                          return newLevels.length > 0 ? newLevels : prev
                        } else {
                          // Add the level
                          return [...prev, lvl].sort()
                        }
                      })
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${selectedLevels.includes(lvl)
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    style={selectedLevels.includes(lvl) ? (
                      category === 'hsk' ? { backgroundColor: '#282c34' } :
                        category === 'tocfl' ? { backgroundColor: '#10b981' } :
                          category === 'kanji' ? { backgroundColor: '#a855f7' } :
                            {}
                    ) : {}}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(category === 'hsk' || category === 'tocfl') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCharacterFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${characterFilter === 'all'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  style={characterFilter === 'all' ? (
                    category === 'hsk' ? { backgroundColor: '#282c34' } :
                      category === 'tocfl' ? { backgroundColor: '#10b981' } :
                        {}
                  ) : {}}
                >
                  All
                </button>
                <button
                  onClick={() => setCharacterFilter('single')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${characterFilter === 'single'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  style={characterFilter === 'single' ? (
                    category === 'hsk' ? { backgroundColor: '#282c34' } :
                      category === 'tocfl' ? { backgroundColor: '#10b981' } :
                        {}
                  ) : {}}
                >
                  Single
                </button>
                <button
                  onClick={() => setCharacterFilter('multi')}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${characterFilter === 'multi'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  style={characterFilter === 'multi' ? (
                    category === 'hsk' ? { backgroundColor: '#282c34' } :
                      category === 'tocfl' ? { backgroundColor: '#10b981' } :
                        {}
                  ) : {}}
                >
                  Multiple
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 text-xs text-gray-500 text-center">
            <span className="text-green-600">{enabledCount} enabled</span>
            {' • '}
            <span className="text-red-600">{disabledCount} disabled</span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              const now = Date.now()
              // Debounce: ignore clicks within 200ms of the last click
              if (now - lastClickTime.current < 200) {
                return
              }
              lastClickTime.current = now

              // Check and set the flag synchronously BEFORE calling the function
              // This prevents race conditions from rapid clicks
              if (isGenerating.current) {
                return
              }
              // Set flag immediately to block subsequent clicks
              isGenerating.current = true
              setLoading(true)
              // Now call the function - it will see the flag is already set and proceed
              generateRandom()
            }}
            disabled={loading || isGenerating.current}
            className="w-full text-white py-3 px-6 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: '#282c34',
              pointerEvents: isGenerating.current || loading ? 'none' : 'auto'
            }}
            onMouseEnter={(e) => {
              if (!loading && !isGenerating.current) {
                e.target.style.backgroundColor = '#3a3f47'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isGenerating.current) {
                e.target.style.backgroundColor = '#282c34'
              }
            }}
          >
            Generate Random
          </button>
        </div>

        {currentItem && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <RandomItemCard
              key={`${currentItem.category}-${currentItem.id || currentItem.kanji || currentItem.simplifiedChinese}`}
              item={currentItem}
              toggleKey={toggleKey}
              onToggle={() => {
                // Get the item ID based on category
                let itemId
                if (currentItem.category === 'hsk' || currentItem.category === 'tocfl') {
                  itemId = currentItem.id
                } else if (currentItem.category === 'kanji') {
                  itemId = currentItem.kanji
                } else if (currentItem.category === 'sentence') {
                  // For sentences, use the originalIndex
                  itemId = currentItem.originalIndex
                }

                if (itemId !== undefined) {
                  toggleItem(currentItem.category.toUpperCase(), itemId)
                  // Force re-render to update enabled state
                  setToggleKey(prev => prev + 1)
                }
              }}
              enabled={(() => {
                // Get the item ID based on category
                let itemId
                if (currentItem.category === 'hsk' || currentItem.category === 'tocfl') {
                  itemId = currentItem.id
                } else if (currentItem.category === 'kanji') {
                  itemId = currentItem.kanji
                } else if (currentItem.category === 'sentence') {
                  itemId = currentItem.originalIndex
                }
                return itemId !== undefined ? isItemEnabled(currentItem.category.toUpperCase(), itemId) : true
              })()}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function HideableField({ label, value, show, onToggle, colorScheme = 'blue' }) {
  const colorClasses = {
    blue: {
      header: '',
      border: '',
      text: 'text-gray-700',
      icon: '',
      content: 'bg-gray-50',
      headerStyle: { backgroundColor: '#f0f0f0' },
      borderStyle: { borderColor: '#e0e0e0' },
      iconStyle: { color: '#282c34' }
    },
    green: {
      header: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
      content: 'bg-green-50'
    },
    purple: {
      header: 'bg-purple-50 hover:bg-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
      content: 'bg-purple-50'
    },
    orange: {
      header: 'bg-orange-50 hover:bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-600',
      content: 'bg-orange-50'
    }
  }

  const colors = colorClasses[colorScheme] || colorClasses.blue

  return (
    <div className={`border-b ${colors.border}`} style={colors.borderStyle || {}}>
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center py-3 px-3 text-left transition-colors ${colors.header} select-none`}
        style={{
          ...colors.headerStyle,
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        onMouseEnter={(e) => {
          if (colorScheme === 'blue' && colors.headerStyle) {
            e.target.style.backgroundColor = '#e0e0e0'
          }
        }}
        onMouseLeave={(e) => {
          if (colorScheme === 'blue' && colors.headerStyle) {
            e.target.style.backgroundColor = colors.headerStyle.backgroundColor
          }
        }}
      >
        <span className={`font-semibold ${colors.text} select-none pointer-events-none`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{label}</span>
        <svg
          className={`w-5 h-5 ${colors.icon} transition-transform duration-200 ${show ? 'transform rotate-180' : ''
            } pointer-events-none`}
          style={{ ...colors.iconStyle, userSelect: 'none', WebkitUserSelect: 'none' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${show ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className={`py-2 px-3 text-gray-800 text-center bg-white font-bold`}>
          {value}
        </div>
      </div>
    </div>
  )
}

function RandomItemCard({ item, onToggle, enabled, toggleKey }) {
  const [showPinyin, setShowPinyin] = useState(false)
  const [showJyutping, setShowJyutping] = useState(false)
  const [showVietnamese, setShowVietnamese] = useState(false)
  const [showHanViet, setShowHanViet] = useState(false)
  const [showEnglish, setShowEnglish] = useState(false)
  const [showOnyomi, setShowOnyomi] = useState(false)
  const [showKunyomi, setShowKunyomi] = useState(false)

  // Update enabled state when toggleKey changes (without remounting)
  // The enabled prop is recalculated in parent, this just ensures we use the latest value

  if (item.category === 'hsk' || item.category === 'tocfl') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold mb-4 text-gray-800">
            {item.traditionalChinese || item.simplifiedChinese}
          </div>
          {item.simplifiedChinese && item.simplifiedChinese !== item.traditionalChinese && (
            <div className="text-3xl text-gray-600 mb-4">
              {item.simplifiedChinese}
            </div>
          )}
        </div>

        <div className="text-lg rounded-md overflow-hidden">
          <HideableField
            label="Pinyin"
            value={item.pinyin}
            show={showPinyin}
            onToggle={() => setShowPinyin(!showPinyin)}
            colorScheme={item.category === 'hsk' ? 'blue' : 'green'}
          />
          <HideableField
            label="Jyutping"
            value={item.jyutping}
            show={showJyutping}
            onToggle={() => setShowJyutping(!showJyutping)}
            colorScheme={item.category === 'hsk' ? 'blue' : 'green'}
          />
          {item.hanviet && (
            <HideableField
              label="Han Viet"
              value={item.hanviet}
              show={showHanViet}
              onToggle={() => setShowHanViet(!showHanViet)}
              colorScheme={item.category === 'hsk' ? 'blue' : 'green'}
            />
          )}
          <HideableField
            label="Vietnamese"
            value={item.vietnamese}
            show={showVietnamese}
            onToggle={() => setShowVietnamese(!showVietnamese)}
            colorScheme={item.category === 'hsk' ? 'blue' : 'green'}
          />
          <HideableField
            label="English"
            value={item.english}
            show={showEnglish}
            onToggle={() => setShowEnglish(!showEnglish)}
            colorScheme={item.category === 'hsk' ? 'blue' : 'green'}
          />
        </div>
        <div className="pt-2 text-sm text-gray-500">
          {item.characterCount} character{item.characterCount > 1 ? 's' : ''}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onToggle}
            className={`w-full px-4 py-3 rounded-md text-base font-medium transition-colors ${enabled
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    )
  }

  if (item.category === 'kanji') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl font-bold mb-4 text-gray-800">{item.kanji}</div>
        </div>

        <div className="text-lg rounded-md overflow-hidden">
          <HideableField
            label="On'yomi"
            value={item.onyomi || 'N/A'}
            show={showOnyomi}
            onToggle={() => setShowOnyomi(!showOnyomi)}
            colorScheme="purple"
          />
          <HideableField
            label="Kun'yomi"
            value={item.kunyomi || 'N/A'}
            show={showKunyomi}
            onToggle={() => setShowKunyomi(!showKunyomi)}
            colorScheme="purple"
          />
          {item.hanviet && (
            <HideableField
              label="Han Viet"
              value={item.hanviet}
              show={showHanViet}
              onToggle={() => setShowHanViet(!showHanViet)}
              colorScheme="purple"
            />
          )}
          <HideableField
            label="Vietnamese"
            value={item.viet}
            show={showVietnamese}
            onToggle={() => setShowVietnamese(!showVietnamese)}
            colorScheme="purple"
          />
          <HideableField
            label="English"
            value={item.english}
            show={showEnglish}
            onToggle={() => setShowEnglish(!showEnglish)}
            colorScheme="purple"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onToggle}
            className={`w-full px-4 py-3 rounded-md text-base font-medium transition-colors ${enabled
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    )
  }

  if (item.category === 'sentence') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4 text-gray-800">
            {item.traditionalChinese || item.simplifiedChinese}
          </div>
          {item.simplifiedChinese && item.simplifiedChinese !== item.traditionalChinese && (
            <div className="text-2xl text-gray-600 mb-4">
              {item.simplifiedChinese}
            </div>
          )}
        </div>

        <div className="text-lg rounded-md overflow-hidden">
          <HideableField
            label="Pinyin"
            value={item.pinyin}
            show={showPinyin}
            onToggle={() => setShowPinyin(!showPinyin)}
            colorScheme="orange"
          />
          <HideableField
            label="Jyutping"
            value={item.jyutping}
            show={showJyutping}
            onToggle={() => setShowJyutping(!showJyutping)}
            colorScheme="orange"
          />
          {item.hanviet && (
            <HideableField
              label="Han Viet"
              value={item.hanviet}
              show={showHanViet}
              onToggle={() => setShowHanViet(!showHanViet)}
              colorScheme="orange"
            />
          )}
          <HideableField
            label="Vietnamese"
            value={item.viet}
            show={showVietnamese}
            onToggle={() => setShowVietnamese(!showVietnamese)}
            colorScheme="orange"
          />
          <HideableField
            label="English"
            value={item.english}
            show={showEnglish}
            onToggle={() => setShowEnglish(!showEnglish)}
            colorScheme="orange"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onToggle}
            className={`w-full px-4 py-3 rounded-md text-base font-medium transition-colors ${enabled
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default RandomGenerator

