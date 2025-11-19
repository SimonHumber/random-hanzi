// LocalStorage utilities for enable/disable functionality

const STORAGE_KEYS = {
  HSK: 'randomHanzi_disabled_hsk',
  TOCFL: 'randomHanzi_disabled_tocfl',
  KANJI: 'randomHanzi_disabled_kanji',
  SENTENCES: 'randomHanzi_disabled_sentences',
  CHARACTERS: 'randomHanzi_disabled_characters',
  RANDOM_DISABLED: {
    HSK: 'randomHanzi_randomly_disabled_hsk',
    TOCFL: 'randomHanzi_randomly_disabled_tocfl',
    KANJI: 'randomHanzi_randomly_disabled_kanji',
    SENTENCES: 'randomHanzi_randomly_disabled_sentences',
  }
}

export const getDisabledIds = (type) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[type] || STORAGE_KEYS.CHARACTERS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}

export const setDisabledIds = (type, ids) => {
  try {
    localStorage.setItem(STORAGE_KEYS[type] || STORAGE_KEYS.CHARACTERS, JSON.stringify(ids))
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

export const toggleItem = (type, id) => {
  const disabled = getDisabledIds(type)
  const index = disabled.indexOf(id)
  if (index > -1) {
    disabled.splice(index, 1)
  } else {
    disabled.push(id)
  }
  setDisabledIds(type, disabled)
  return disabled
}

export const isItemEnabled = (type, id) => {
  const disabled = getDisabledIds(type)
  return !disabled.includes(id)
}

// Get randomly disabled IDs for a category and level
export const getRandomlyDisabledIds = (type, level = null) => {
  try {
    const baseKey = STORAGE_KEYS.RANDOM_DISABLED[type] || STORAGE_KEYS.RANDOM_DISABLED.HSK
    const key = level !== null ? `${baseKey}_level${level}` : baseKey
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading randomly disabled IDs:', error)
    return []
  }
}

// Set randomly disabled IDs for a category and level
export const setRandomlyDisabledIds = (type, ids, level = null) => {
  try {
    const baseKey = STORAGE_KEYS.RANDOM_DISABLED[type] || STORAGE_KEYS.RANDOM_DISABLED.HSK
    const key = level !== null ? `${baseKey}_level${level}` : baseKey
    localStorage.setItem(key, JSON.stringify(ids))
  } catch (error) {
    console.error('Error writing randomly disabled IDs:', error)
  }
}

// Randomly disable a specified number of items
export const randomlyDisableItems = (type, allItems, count, level = null, characterFilter = 'all') => {
  // Get currently enabled items
  let enabledItems = allItems.filter((item, index) => {
    const id = type === 'SENTENCES' ? index : (item.id || item.kanji)
    return isItemEnabled(type, id)
  })

  // Filter by character count
  if (characterFilter === 'single') {
    if (type === 'SENTENCES') {
      enabledItems = enabledItems.filter((item) => {
        const charCount = item.simplified ? item.simplified.replace(/\s/g, '').length : 0
        return charCount === 1
      })
    } else if (type === 'KANJI') {
      // Kanji are always single character
      enabledItems = enabledItems
    } else {
      enabledItems = enabledItems.filter((item) => item.characterCount === 1)
    }
  } else if (characterFilter === 'multi') {
    if (type === 'SENTENCES') {
      enabledItems = enabledItems.filter((item) => {
        const charCount = item.simplified ? item.simplified.replace(/\s/g, '').length : 0
        return charCount > 1
      })
    } else if (type === 'KANJI') {
      // No multi-character kanji
      enabledItems = []
    } else {
      enabledItems = enabledItems.filter((item) => item.characterCount > 1)
    }
  }

  if (enabledItems.length === 0) {
    return { disabled: [], message: 'No enabled items matching the filter to disable' }
  }

  const numToDisable = Math.min(count, enabledItems.length)
  
  // Shuffle and select random items
  const shuffled = [...enabledItems].sort(() => Math.random() - 0.5)
  const toDisable = shuffled.slice(0, numToDisable)

  // Get IDs of items to disable
  const idsToDisable = toDisable.map((item) => {
    if (type === 'SENTENCES') {
      return allItems.indexOf(item)
    }
    return item.id || item.kanji
  })

  // Add to disabled list
  const currentDisabled = getDisabledIds(type)
  const newDisabled = [...new Set([...currentDisabled, ...idsToDisable])]
  setDisabledIds(type, newDisabled)

  // Store as randomly disabled for this level
  const currentRandomDisabled = getRandomlyDisabledIds(type, level)
  const newRandomDisabled = [...new Set([...currentRandomDisabled, ...idsToDisable])]
  setRandomlyDisabledIds(type, newRandomDisabled, level)

  return { disabled: idsToDisable, message: `Disabled ${idsToDisable.length} items` }
}

// Re-enable randomly disabled items
export const reenableRandomlyDisabled = (type, level = null) => {
  const randomlyDisabled = getRandomlyDisabledIds(type, level)
  if (randomlyDisabled.length === 0) {
    return { message: 'No randomly disabled items to re-enable' }
  }

  // Remove from disabled list
  const currentDisabled = getDisabledIds(type)
  const newDisabled = currentDisabled.filter(id => !randomlyDisabled.includes(id))
  setDisabledIds(type, newDisabled)

  // Clear randomly disabled list for this level
  setRandomlyDisabledIds(type, [], level)

  return { reenabled: randomlyDisabled.length, message: `Re-enabled ${randomlyDisabled.length} items` }
}

