
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Activity, 
  Search, 
  Bookmark, 
  LayoutDashboard,
  Clock,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import { SEED_DEALS, SEED_COMPANIES } from '../constants.tsx';

const Dashboard: React.FC = () => {
  const getTargetLogo = (targetId: string) => {
    return SEED_COMPANIES.find(c => c.id === targetId)?.logo_url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Portfolio Overview</h1>
          <p className="text-slate-500 mt-1">Intelligence tracking for your watchlist and sector focus.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>New Query</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Active Watches', value: '12', icon: Bookmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Weekly Announcements', value: '184', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Aggregate Value (24h)', value: '$42.1B', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12%
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Recent Watchlist Activity</h2>
              <Link to="/app/watchlists" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {SEED_DEALS.slice(0, 5).map((deal, i) => (
                <Link key={i} to={`/deals/${deal.slug}`} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition group">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-white border border-slate-100 rounded flex items-center justify-center p-1.5 shadow-xs">
                      <img src={getTargetLogo(deal.target_id)} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">{deal.title.split(' to ')[0]}</div>
                      <div className="text-xs text-slate-500">Updated status to <span className="text-indigo-600 font-medium">{deal.status}</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400">2h ago</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <PieChart className="h-24 w-24" />
            </div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Institutional Report</h3>
            <p className="text-slate-400 text-sm mb-6 relative z-10">Weekly M&A market sentiment and trend analysis for Q1 2026 is now available.</p>
            <button className="w-full bg-white text-slate-900 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition relative z-10 text-sm">
              Download PDF
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {[
                { label: 'Regulatory Filing: CrowdStrike', date: 'Feb 12' },
                { label: 'Shareholder Vote: Airwallex', date: 'Feb 28' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <div className="flex-grow text-slate-700 font-medium">{item.label}</div>
                  <div className="text-slate-400 font-mono text-xs">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
