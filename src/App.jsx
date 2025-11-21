import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import RandomGenerator from './components/RandomGenerator'
import CharacterListPage from './components/CharacterListPage'
import ToneGuide from './components/ToneGuide'
import BulkManagement from './components/BulkManagement'

function Navigation() {
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Random Generator', mobileLabel: 'Random', exact: true },
    { path: '/characters', label: 'Character List', mobileLabel: 'List' },
    { path: '/bulk', label: 'Bulk Management', mobileLabel: 'Bulk' },
    { path: '/tones', label: 'Tone Guide', mobileLabel: 'Tones' },
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="text-white shadow-lg" style={{ backgroundColor: '#282c34' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold">
            Random Hanzi
          </Link>
          <div className="flex items-center gap-1 md:gap-4 mt-2 md:mt-0">
            <div className="flex flex-nowrap gap-1 md:gap-4 overflow-x-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm md:px-4 md:py-2 md:text-base font-medium transition-colors whitespace-nowrap ${isActive(link.path, link.exact)
                    ? ''
                    : 'hover:opacity-80'
                    }`}
                  style={isActive(link.path, link.exact) ? { backgroundColor: 'rgba(255, 255, 255, 0.15)' } : {}}
                >
                  <span className="md:hidden">{link.mobileLabel || link.label}</span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              ))}
            </div>
            <a
              href="https://github.com/SimonHumber/random-hanzi"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 hover:opacity-80 transition-opacity"
              aria-label="GitHub Repository"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<RandomGenerator />} />
            <Route path="/characters" element={<CharacterListPage />} />
            <Route path="/bulk" element={<BulkManagement />} />
            <Route path="/tones" element={<ToneGuide />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

