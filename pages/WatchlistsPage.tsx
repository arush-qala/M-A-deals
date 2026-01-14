
import React from 'react';
import { Bookmark, LayoutGrid, Plus, ChevronRight } from 'lucide-react';
import { SEED_DEALS, SEED_COMPANIES } from '../constants.tsx';
import { Link } from 'react-router-dom';
import CompanyLogo from '../components/CompanyLogo.tsx';

const WatchlistsPage: React.FC = () => {
  const getTargetCompany = (targetId: string) => {
    return SEED_COMPANIES.find(c => c.id === targetId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">My Watchlists</h1>
          <p className="text-slate-500 mt-1">Manage saved deals and real-time alerts.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New List</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-indigo-700 font-bold">
            <div className="flex items-center space-x-3">
              <Bookmark className="h-5 w-5" />
              <span>Core Coverage</span>
            </div>
            <span className="text-xs">12</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium">
            <div className="flex items-center space-x-3">
              <Bookmark className="h-5 w-5" />
              <span>Competitor Targets</span>
            </div>
            <span className="text-xs">4</span>
          </button>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900">Core Coverage Deals</h2>
              <div className="flex space-x-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600"><LayoutGrid className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {SEED_DEALS.slice(0, 4).map((deal, i) => {
                const target = getTargetCompany(deal.target_id);
                return (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition group">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm">
                        <CompanyLogo 
                          logoUrl={target?.logo_url} 
                          name={target?.name || 'Target'} 
                          className="h-full w-full" 
                        />
                      </div>
                      <div>
                        <Link to={`/deals/${deal.slug}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition block leading-snug">
                          {deal.title.split(' for ')[0]}
                        </Link>
                        <div className="flex items-center space-x-4 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                          <span className="text-indigo-600">{deal.status}</span>
                          <span>{deal.sector.split(' / ')[0]}</span>
                          <span className="text-slate-400">Added Oct 12</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-lg font-serif font-bold text-slate-900">
                          {deal.value_usd ? `$${(deal.value_usd / 1000000000).toFixed(1)}B` : 'Undisclosed'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">EV at Entry</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistsPage;
