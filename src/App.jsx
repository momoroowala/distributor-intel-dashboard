import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { BarChart3, TrendingUp, Utensils, Phone } from 'lucide-react'
import MarketOverview from './pages/MarketOverview'
import FoodBeverage from './pages/FoodBeverage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f1117]">
        {/* Header */}
        <header className="border-b border-[#2a2d3e] bg-[#0f1117]/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#7c4dff] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Distribution Market Intel</h1>
                  <p className="text-xs text-[#9ca3af]">by Deepline Operations</p>
                </div>
              </div>
              <nav className="flex items-center gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7c4dff]/20 text-[#b388ff]'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#1a1d2e]'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </span>
                </NavLink>
                <NavLink
                  to="/food-beverage"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7c4dff]/20 text-[#b388ff]'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#1a1d2e]'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    <span className="hidden sm:inline">Food & Beverage</span>
                  </span>
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<MarketOverview />} />
            <Route path="/food-beverage" element={<FoodBeverage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#2a2d3e] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-[#9ca3af] text-sm">
                  Built by <span className="text-[#b388ff] font-medium">Deepline Operations</span>
                </p>
                <p className="text-[#9ca3af]/60 text-xs mt-1">
                  Data from US Census Bureau, BLS, FRED, Google Trends
                </p>
              </div>
              <a
                href="https://deeplineoperations.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c4dff] hover:text-[#b388ff] text-sm font-medium transition-colors"
              >
                deeplineoperations.com
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
