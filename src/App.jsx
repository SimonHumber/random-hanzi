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
          <div className="flex flex-nowrap gap-1 md:gap-4 mt-2 md:mt-0 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm md:px-4 md:py-2 md:text-base font-medium transition-colors whitespace-nowrap ${
                  isActive(link.path, link.exact)
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

