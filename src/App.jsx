import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  Star, TrendingUp, Truck, Shield, Package, Building2, MapPin, Target,
} from 'lucide-react';
import CustomerHealthScanner from './pages/CustomerHealthScanner';
import MarketOverview from './pages/MarketOverview';
import FoodBeverage from './pages/FoodBeverage';
import RegionalAnalysis from './pages/RegionalAnalysis';
import FreightSupplyChain from './pages/FreightSupplyChain';
import TradeTariffs from './pages/TradeTariffs';
import IndustryDeepDive from './pages/IndustryDeepDive';
import ThreatIntel from './pages/ThreatIntel';

const navLinkClass = ({ isActive }) =>
  `nav-link flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-900/30'
  }`;

const sectionLabel = (label) => (
  <div className="px-4 pt-5 pb-1.5 text-[10px] font-bold tracking-widest text-indigo-400/70 uppercase">
    {label}
  </div>
);

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
            {/* ── MY BUSINESS ────────────────── */}
            {sectionLabel('My Business')}
            <NavLink to="/customer-scanner" className={navLinkClass}>
              <div className="relative">
                <Target className="w-5 h-5 flex-shrink-0" />
                <Star className="w-2.5 h-2.5 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <span>Customer Health Scanner</span>
            </NavLink>

            {/* ── MARKET INTEL ────────────────── */}
            {sectionLabel('Market Intel')}
            <NavLink to="/market" className={navLinkClass}>
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <span>Your Industry This Week</span>
            </NavLink>
            <NavLink to="/freight" className={navLinkClass}>
              <Truck className="w-5 h-5 flex-shrink-0" />
              <span>Freight & Logistics</span>
            </NavLink>
            <NavLink to="/trade" className={navLinkClass}>
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Trade & Tariffs</span>
            </NavLink>

            {/* ── INDUSTRY ────────────────────── */}
            {sectionLabel('Industry')}
            <NavLink to="/food-beverage" className={navLinkClass}>
              <Package className="w-5 h-5 flex-shrink-0" />
              <span>Food & Beverage</span>
            </NavLink>
            <NavLink to="/industry" className={navLinkClass}>
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span>Industry Deep Dive</span>
            </NavLink>
            <NavLink to="/regional" className={navLinkClass}>
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span>Regional Analysis</span>
            </NavLink>

            {/* ── RISK ────────────────────────── */}
            {sectionLabel('Risk')}
            <NavLink to="/threats" className={navLinkClass}>
              <Shield className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>Risk & Security Center</span>
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
              <Route path="/" element={<Navigate to="/customer-scanner" replace />} />
              <Route path="/customer-scanner" element={<CustomerHealthScanner />} />
              <Route path="/market" element={<MarketOverview />} />
              <Route path="/food-beverage" element={<FoodBeverage />} />
              <Route path="/regional" element={<RegionalAnalysis />} />
              <Route path="/freight" element={<FreightSupplyChain />} />
              <Route path="/trade" element={<TradeTariffs />} />
              <Route path="/industry" element={<IndustryDeepDive />} />
              <Route path="/threats" element={<ThreatIntel />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
