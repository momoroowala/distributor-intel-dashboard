import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, MapPin, Truck, Shield, Building2 } from 'lucide-react';
import MarketOverview from './pages/MarketOverview';
import FoodBeverage from './pages/FoodBeverage';
import RegionalAnalysis from './pages/RegionalAnalysis';
import FreightSupplyChain from './pages/FreightSupplyChain';
import TradeTariffs from './pages/TradeTariffs';
import IndustryDeepDive from './pages/IndustryDeepDive';

function App() {
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-full md:w-64 md:min-w-[256px] flex-shrink-0 bg-indigo-950 text-white">
          <div className="p-6 border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">
                DL
              </div>
              <div>
                <div className="font-bold text-sm tracking-wide">Deepline Operations</div>
                <div className="text-indigo-300 text-xs">Distribution Market Intelligence</div>
              </div>
            </div>
          </div>

          <nav className="p-3 flex md:block overflow-x-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-indigo-600' : 'text-indigo-200 hover:bg-indigo-900/30'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span>Market Overview</span>
            </NavLink>

            <NavLink
              to="/food-beverage"
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-indigo-600' : 'text-indigo-200 hover:bg-indigo-900/30'
                }`
              }
            >
              <Package className="w-5 h-5 flex-shrink-0" />
              <span>Food & Commodity Prices</span>
            </NavLink>

            <NavLink
              to="/regional"
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-indigo-600' : 'text-indigo-200 hover:bg-indigo-900/30'
                }`
              }
            >
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span>Regional Analysis</span>
            </NavLink>

            <NavLink
              to="/freight"
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-indigo-600' : 'text-indigo-200 hover:bg-indigo-900/30'
                }`
              }
            >
              <Truck className="w-5 h-5 flex-shrink-0" />
              <span>Freight & Supply Chain</span>
            </NavLink>

            <NavLink
              to="/trade"
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-indigo-600' : 'text-indigo-200 hover:bg-indigo-900/30'
                }`
              }
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Trade & Tariffs</span>
            </NavLink>

            <NavLink
              to="/industry"
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-indigo-600' : 'text-indigo-200 hover:bg-indigo-900/30'
                }`
              }
            >
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span>Industry Deep Dive</span>
            </NavLink>
          </nav>

          <div className="hidden md:block mt-auto p-4 border-t border-indigo-900/50">
            <div className="text-xs text-indigo-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<MarketOverview />} />
              <Route path="/food-beverage" element={<FoodBeverage />} />
              <Route path="/regional" element={<RegionalAnalysis />} />
              <Route path="/freight" element={<FreightSupplyChain />} />
              <Route path="/trade" element={<TradeTariffs />} />
              <Route path="/industry" element={<IndustryDeepDive />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
