import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
  Star, TrendingUp, Truck, Shield, Package, Building2, MapPin, Target,
  Home as HomeIcon, Phone, X, ArrowRight,
} from 'lucide-react';
import Home from './pages/Home';
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
  const [showBanner, setShowBanner] = useState(true);

  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-full md:w-64 md:min-w-[256px] flex-shrink-0 bg-indigo-950 text-white md:flex md:flex-col">
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

          <nav className="p-3 flex md:block overflow-x-auto flex-1">
            {/* ── HOME ─────────────────────────── */}
            <NavLink to="/" end className={navLinkClass}>
              <HomeIcon className="w-5 h-5 flex-shrink-0" />
              <span>Dashboard</span>
            </NavLink>

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

          {/* Sidebar Footer CTA */}
          <div className="hidden md:block p-4 border-t border-indigo-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-indigo-300" />
              <span className="text-xs text-indigo-200 font-medium">Free Diagnostic</span>
            </div>
            <p className="text-xs text-indigo-400/70 mb-2">
              Book a 20-min call. We&apos;ll show you the revenue you&apos;re leaving on the table.
            </p>
            <a
              href="https://deeplineoperations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              deeplineoperations.com
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Global CTA Banner */}
          {showBanner && (
            <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm relative">
              <Target className="w-4 h-4 flex-shrink-0" />
              <span>
                Want this analysis on YOUR data?{' '}
                <a
                  href="https://deeplineoperations.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2 hover:text-indigo-200 transition-colors"
                >
                  Book a free 20-minute diagnostic &rarr;
                </a>
              </span>
              <button
                onClick={() => setShowBanner(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-indigo-500 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
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
