// Data loader utilities with in-memory caching

// Cache to store loaded data
const dataCache = {
  hsk: {},
  tocfl: {},
  kanji: {},
  sentences: null
}

export const loadHSKData = async (level) => {
  // Return cached data if available
  if (dataCache.hsk[level]) {
    return dataCache.hsk[level]
  }

  try {
    const response = await fetch(`/data/hsk_level${level}.json`)
    if (!response.ok) throw new Error(`Failed to load HSK level ${level}`)
    const data = await response.json()
    // Cache the data
    dataCache.hsk[level] = data
    return data
  } catch (error) {
    console.error(`Error loading HSK level ${level}:`, error)
    return []
  }
}

export const loadTOCFLData = async (level) => {
  // Return cached data if available
  if (dataCache.tocfl[level]) {
    return dataCache.tocfl[level]
  }

  try {
    const response = await fetch(`/data/tocfl_level${level}.json`)
    if (!response.ok) throw new Error(`Failed to load TOCFL level ${level}`)
    const data = await response.json()
    // Cache the data
    dataCache.tocfl[level] = data
    return data
  } catch (error) {
    console.error(`Error loading TOCFL level ${level}:`, error)
    return []
  }
}

export const loadKanjiData = async (grade) => {
  // Return cached data if available
  if (dataCache.kanji[grade]) {
    return dataCache.kanji[grade]
  }

  try {
    const response = await fetch(`/data/kanji_grade${grade}.json`)
    if (!response.ok) throw new Error(`Failed to load Kanji grade ${grade}`)
    const data = await response.json()
    // Cache the data
    dataCache.kanji[grade] = data
    return data
  } catch (error) {
    console.error(`Error loading Kanji grade ${grade}:`, error)
    return []
  }
}

export const loadSentenceData = async () => {
  // Return cached data if available
  if (dataCache.sentences !== null) {
    return dataCache.sentences
  }

  try {
    console.log('Starting to load sentences.json (16MB, 18k+ items)...')
    const response = await fetch('/data/sentences.json')
    console.log('Fetch complete, parsing JSON...')
    if (!response.ok) throw new Error('Failed to load sentences')
    const data = await response.json()
    console.log('Successfully loaded', data.length, 'sentences')
    // Cache the data
    dataCache.sentences = data
    return data
  } catch (error) {
    console.error('Error loading sentences:', error)
    return []
  }
}

export const getAllData = async () => {
  const [hsk1, hsk2, hsk3, hsk4, hsk5, hsk6, hsk7, tocfl1, kanji1, kanji2, sentences] = await Promise.all([
    loadHSKData(1),
    loadHSKData(2),
    loadHSKData(3),
    loadHSKData(4),
    loadHSKData(5),
    loadHSKData(6),
    loadHSKData(7),
    loadTOCFLData(1),
    loadKanjiData(1),
    loadKanjiData(2),
    loadSentenceData(),
  ])

  return {
    hsk: [...hsk1, ...hsk2, ...hsk3, ...hsk4, ...hsk5, ...hsk6, ...hsk7],
    tocfl: tocfl1,
    kanji: [...kanji1, ...kanji2],
    sentences,
  }
}

