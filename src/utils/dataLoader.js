// Data loader utilities

export const loadHSKData = async (level) => {
  try {
    const response = await fetch(`/data/hsk_level${level}.json`)
    if (!response.ok) throw new Error(`Failed to load HSK level ${level}`)
    return await response.json()
  } catch (error) {
    console.error(`Error loading HSK level ${level}:`, error)
    return []
  }
}

export const loadTOCFLData = async (level) => {
  try {
    const response = await fetch(`/data/tocfl_level${level}.json`)
    if (!response.ok) throw new Error(`Failed to load TOCFL level ${level}`)
    return await response.json()
  } catch (error) {
    console.error(`Error loading TOCFL level ${level}:`, error)
    return []
  }
}

export const loadKanjiData = async (grade) => {
  try {
    const response = await fetch(`/data/kanji_grade${grade}.json`)
    if (!response.ok) throw new Error(`Failed to load Kanji grade ${grade}`)
    return await response.json()
  } catch (error) {
    console.error(`Error loading Kanji grade ${grade}:`, error)
    return []
  }
}

export const loadSentenceData = async () => {
  try {
    const response = await fetch('/data/sentances.json')
    if (!response.ok) throw new Error('Failed to load sentences')
    return await response.json()
  } catch (error) {
    console.error('Error loading sentences:', error)
    return []
  }
}

export const getAllData = async () => {
  const [hsk1, hsk2, tocfl1, kanji1, kanji2, sentences] = await Promise.all([
    loadHSKData(1),
    loadHSKData(2),
    loadTOCFLData(1),
    loadKanjiData(1),
    loadKanjiData(2),
    loadSentenceData(),
  ])

  return {
    hsk: [...hsk1, ...hsk2],
    tocfl: tocfl1,
    kanji: [...kanji1, ...kanji2],
    sentences,
  }
}

