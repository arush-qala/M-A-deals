
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Fix: Added missing import for Database to fix error on line 147
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Calendar,
  Globe,
  Tag,
  ArrowUpDown,
  Database
} from 'lucide-react';
import { SEED_DEALS } from '../constants';
import { DealStatus } from '../types';

const DealsExplorer: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  const filteredDeals = SEED_DEALS.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         deal.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Announced': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rumored': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Deals Explorer</h1>
          <p className="text-slate-500">Search and analyze global transaction flow with verified data.</p>
        </div>
        
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

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company, sector, or keyword..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Announced">Announced</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Results */}
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
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition truncate max-w-xs">{deal.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{deal.geography}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        {deal.sector}
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
            <div className="p-12 text-center">
              <Database className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No deals found matching your criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <Link key={deal.id} to={`/deals/${deal.slug}`} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 transition group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(deal.status)}`}>
                  {deal.status}
                </span>
                <span className="text-xs font-mono text-slate-400">{new Date(deal.announced_date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-3 line-clamp-2">
                {deal.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
                <Tag className="h-3 w-3" />
                <span>{deal.sector}</span>
                <span className="mx-1">•</span>
                <Globe className="h-3 w-3" />
                <span>{deal.geography}</span>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-lg font-serif font-bold text-slate-900">
                  {deal.value_usd ? `$${(deal.value_usd / 1000000000).toFixed(1)}B` : 'Undisclosed'}
                </div>
                <div className="text-indigo-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  View Case <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Pagination Placeholder */}
      <div className="mt-12 flex justify-center items-center space-x-4">
        <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">Previous</button>
        <div className="flex space-x-2">
          <button className="h-10 w-10 bg-indigo-600 text-white rounded-lg font-bold">1</button>
          <button className="h-10 w-10 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50">2</button>
          <button className="h-10 w-10 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50">3</button>
        </div>
        <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Next</button>
      </div>
    </div>
  );
};

export default DealsExplorer;
