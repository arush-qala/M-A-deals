
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Globe, 
  Tag, 
  Database,
  RefreshCcw,
  Zap,
  X,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { SEED_DEALS, SEED_COMPANIES } from '../constants.tsx';
import { DealStatus } from '../types.ts';

const DealsExplorer: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [geoFilter, setGeoFilter] = useState<string>('All');
  const [valueTier, setValueTier] = useState<string>('All');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSectorFilter('All');
    setGeoFilter('All');
    setValueTier('All');
  };

  const sectors = useMemo(() => ['All', ...new Set(SEED_DEALS.map(d => d.sector.split(' / ')[0]))], []);
  const geographies = useMemo(() => ['All', ...new Set(SEED_DEALS.map(d => d.geography))], []);

  const filteredDeals = useMemo(() => {
    return SEED_DEALS.filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           deal.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;
      const matchesSector = sectorFilter === 'All' || deal.sector.includes(sectorFilter);
      const matchesGeo = geoFilter === 'All' || deal.geography === geoFilter;
      
      let matchesValue = true;
      if (valueTier !== 'All') {
        const value = deal.value_usd || 0;
        if (valueTier === 'small') matchesValue = value < 1000000000;
        if (valueTier === 'mid') matchesValue = value >= 1000000000 && value <= 10000000000;
        if (valueTier === 'mega') matchesValue = value > 10000000000;
      }

      return matchesSearch && matchesStatus && matchesSector && matchesGeo && matchesValue;
    });
  }, [searchQuery, statusFilter, sectorFilter, geoFilter, valueTier]);

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Announced': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rumored': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isAnyFilterActive = searchQuery !== '' || statusFilter !== 'All' || sectorFilter !== 'All' || geoFilter !== 'All' || valueTier !== 'All';

  const getTargetLogo = (targetId: string) => {
    return SEED_COMPANIES.find(c => c.id === targetId)?.logo_url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-100">
            <Zap className="h-3 w-3" />
            <span>24/7 Market Ingestion Active</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Deals Explorer</h1>
          <p className="text-slate-500">Search and analyze global transaction flow with verified data.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold transition shadow-sm border ${
              isRefreshing 
              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
              : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50 active:scale-95'
            }`}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
            <span>{isRefreshing ? 'Polling Sources...' : 'Sync Latest Signal'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setView('list')} 
              className={`p-2 rounded-md transition ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setView('grid')} 
              className={`p-2 rounded-md transition ${view === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by company, sector, or keyword..." 
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-3">
              <div className="relative">
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-medium text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Announced">Announced</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Rumored">Rumored</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border transition font-bold ${showAdvanced ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {isAnyFilterActive && <span className="ml-1 h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>}
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Tag className="h-3 w-3 mr-1" /> Sector Focus
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none appearance-none"
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                  >
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Globe className="h-3 w-3 mr-1" /> Geography
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none appearance-none"
                    value={geoFilter}
                    onChange={(e) => setGeoFilter(e.target.value)}
                  >
                    {geographies.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" /> Value Tier
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none appearance-none"
                    value={valueTier}
                    onChange={(e) => setValueTier(e.target.value)}
                  >
                    <option value="All">Any Enterprise Value</option>
                    <option value="small">Small-Cap (&lt;$1B)</option>
                    <option value="mid">Mid-Market ($1B - $10B)</option>
                    <option value="mega">Mega-Deal (&gt;$10B)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {isAnyFilterActive && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs text-slate-400 whitespace-nowrap">Active filters:</span>
              {statusFilter !== 'All' && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 uppercase">{statusFilter}</span>}
              {sectorFilter !== 'All' && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 uppercase">{sectorFilter}</span>}
              {geoFilter !== 'All' && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 uppercase">{geoFilter}</span>}
              {valueTier !== 'All' && <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-indigo-600 uppercase">{valueTier} Value</span>}
            </div>
            <button 
              onClick={resetFilters}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center shrink-0 ml-4 transition"
            >
              <X className="h-3 w-3 mr-1" /> Clear All
            </button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Announced</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Value (USD)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/50 transition cursor-pointer group" onClick={() => window.location.hash = `#/deals/${deal.slug}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {new Date(deal.announced_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-slate-50 border border-slate-200 rounded p-1 flex-shrink-0">
                          <img src={getTargetLogo(deal.target_id)} alt="Logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="truncate max-w-xs">
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">{deal.title}</div>
                          <div className="text-[10px] text-slate-400">{deal.geography}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        {deal.sector.split(' / ')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                      {deal.value_usd ? `$${(deal.value_usd / 1000000).toLocaleString()}M` : 'Undisclosed'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDeals.length === 0 && (
            <div className="p-20 text-center">
              <Database className="h-8 w-8 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
              <button onClick={resetFilters} className="text-indigo-600 font-bold text-sm hover:underline">Reset all filters</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <Link key={deal.id} to={`/deals/${deal.slug}`} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 transition group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                  <img src={getTargetLogo(deal.target_id)} alt="Logo" className="h-full w-full object-contain" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(deal.status)}`}>
                  {deal.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-3 line-clamp-2">
                {deal.title}
              </h3>
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-6">
                <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  <Tag className="h-3 w-3" />
                  <span>{deal.sector.split(' / ')[0]}</span>
                </div>
                <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  <Globe className="h-3 w-3" />
                  <span>{deal.geography}</span>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-lg font-serif font-bold text-slate-900">
                  {deal.value_usd ? `$${(deal.value_usd / 1000000000).toFixed(1)}B` : 'Undisclosed'}
                </div>
                <div className="text-indigo-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  View <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsExplorer;
