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
  - **HSK**: Chinese Proficiency Test vocabulary (levels 1-2)
  - **TOCFL**: Test of Chinese as a Foreign Language vocabulary (level 1)
  - **Kanji**: Japanese kanji characters (grades 1-2)
  - **Sentences**: Complete Chinese sentences with multiple writing systems
- **Tone Guide**: Interactive guide for learning tones in Mandarin Chinese, Cantonese, and Vietnamese
- **Bulk Management**: Randomly disable/enable vocabulary items for focused practice
- **Persistent Storage**: Your preferences and disabled items are saved in browser localStorage
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

### Key Functionality

- **Multi-level Selection**: Select multiple levels/grades simultaneously for combined practice
- **Character Type Filtering**: Filter by single or multi-character words
- **Status Filtering**: View all, enabled, or disabled items
- **Search Functionality**: Search across all fields (characters, pinyin, jyutping, English, Vietnamese, etc.)
- **Toggleable Translations**: Hide/show translation fields (Pinyin, Jyutping, Vietnamese, Han Viet, English, On'yomi, Kun'yomi) with accordion-style UI
- **Enable/Disable Items**: Mark items as enabled or disabled for personalized practice sessions

### Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive styling
- **LocalStorage**: Browser storage for persisting user preferences

