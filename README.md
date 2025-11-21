# Random Hanzi

## Deployment

This repository is automatically synced and deployed to [Vercel](https://vercel.com). Any push to the main branch will trigger an automatic deployment.

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Description

Random Hanzi is a React-based web application designed to help users practice and learn Chinese characters, Japanese kanji, and Chinese sentences. The app provides a comprehensive learning experience with multiple test categories and interactive features.

### Features

- **Random Character Generator**: Generate random vocabulary items from different categories (HSK, TOCFL, Kanji, Sentences) with customizable filters
- **Character List**: Browse and search through vocabulary lists with filtering options
- **Multiple Test Categories**:
  - **HSK**: Chinese Proficiency Test vocabulary (levels 1-7)
  - **TOCFL**: Test of Chinese as a Foreign Language vocabulary (levels 1-5)
  - **Kanji**: Japanese kanji characters (grades 1-2)
  - **Sentences**: Complete Chinese sentences with multiple writing systems (12,316 sentences with HSK and TOCFL level filtering)
- **Tone Guide**: Interactive guide for learning tones in Mandarin Chinese, Cantonese, and Vietnamese
- **Bulk Management**: Randomly disable/enable vocabulary items for focused practice
- **Persistent Storage**: Your preferences and disabled items are saved in browser localStorage
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

### Key Functionality

- **Multi-level Selection**: Select multiple levels/grades simultaneously for combined practice
- **Sentence Level Filtering**: Filter sentences by HSK levels (1-7) and/or TOCFL levels (1-5). You can deselect all levels of one type as long as the other type has at least one level selected
- **Character Type Filtering**: Filter by single or multi-character words (HSK and TOCFL only)
- **Status Filtering**: View all, enabled, or disabled items
- **Search Functionality**: Search across all fields (characters, pinyin, jyutping, English, Vietnamese, etc.)
- **Toggleable Translations**: Hide/show translation fields (Pinyin, Jyutping, Vietnamese, Han Viet, English, On'yomi, Kun'yomi) with accordion-style UI
- **Enable/Disable Items**: Mark items as enabled or disabled for personalized practice sessions
- **Responsive Virtualized Lists**: Efficient rendering of large lists using react-window for optimal performance

### Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive styling
- **react-window**: Efficient virtualization for rendering large lists
- **LocalStorage**: Browser storage for persisting user preferences and filters

### Data

- **HSK Vocabulary**: Levels 1-7 with character count information
- **TOCFL Vocabulary**: Levels 1-5 with character count information
- **Kanji**: Grades 1-2 with On'yomi, Kun'yomi, and translations
- **Sentences**: 12,316 Chinese sentences with:
  - Traditional and Simplified Chinese
  - Pinyin and Jyutping romanization
  - English and Vietnamese translations
  - Han Viet readings
  - HSK level assignments (1-7)
  - TOCFL level assignments (1-5)

### Data Sources

- **Sentences**: [Chinese Sentence Miner](https://github.com/Destaq/chinese-sentence-miner)
- **Cantonese Tones**: [Open Cantonese - Jyutping Tones Overview](https://opencantonese.org/cantonese-pronunciation-jyutping/tones/overview-cantonese-tones)
- **Han Viet**: [Han Viet Pinyin Wordlist](https://github.com/ph0ngp/hanviet-pinyin-wordlist)
- **HSK**: [Mandarin Bean - New HSK Vocabulary](https://mandarinbean.com/new-hsk-vocabulary/)
- **TOCFL**: [Taiwan Representative Office in Germany](https://www.roc-taiwan.org/at_de/post/634.html)
- **Kanji**: [Wikipedia - Kyōiku Kanji](https://en.wikipedia.org/wiki/Ky%C5%8Diku_kanji)

