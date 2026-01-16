
import React, { useState } from 'react';
import { 
  Database, 
  Settings, 
  RefreshCcw, 
  AlertCircle, 
  Plus, 
  Trash2,
  Edit3,
  Clock,
  Zap,
  ShieldCheck,
  Github,
  Key,
  Network
} from 'lucide-react';
import { SEED_DEALS } from '../constants.tsx';

const AdminDashboard: React.FC = () => {
  const [githubStatus, setGithubStatus] = useState<'connected' | 'error' | 'syncing'>('error');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const lastUpdate = new Date().toLocaleTimeString();

  const handleReconnectGithub = () => {
    setGithubStatus('syncing');
    setLogs(prev => ["Attempting GitHub OAuth Handshake...", ...prev]);
    
    setTimeout(() => {
      setGithubStatus('connected');
      setLogs(prev => ["SUCCESS: GitHub repository connection re-established.", ...prev]);
    }, 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLogs(prev => ["MANUAL TRIGGER: Polling external data sources...", ...prev]);
    setTimeout(() => {
      setIsRefreshing(false);
      setLogs(prev => ["SUCCESS: 0 new records found. Database up to date.", ...prev]);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Intelligence Console</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Pipeline: Operational
            </div>
            <div className="text-slate-400 text-xs font-medium">
              Last Sync: {lastUpdate}
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-bold transition ${
              isRefreshing 
              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
              : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 shadow-sm'
            }`}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Latest Signal'}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* External Services Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border transition ${githubStatus === 'error' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${githubStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-900'}`}>
                  <Github className="h-5 w-5" />
                </div>
                {githubStatus === 'error' && (
                  <span className="flex items-center text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase">Auth Error</span>
                )}
                {githubStatus === 'connected' && (
                  <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Live</span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">GitHub Integration</h4>
              <p className="text-xs text-slate-500 mb-4">Repository connection for source tracking.</p>
              <button 
                onClick={handleReconnectGithub}
                className={`w-full py-2 rounded-lg text-xs font-bold transition ${githubStatus === 'error' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {githubStatus === 'error' ? 'Fix Authentication' : 'Refresh Connection'}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Key className="h-5 w-5" />
                </div>
                <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Secure</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">SEC EDGAR API</h4>
              <p className="text-xs text-slate-500 mb-4">Official regulatory filing ingestion.</p>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full"></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Network className="h-5 w-5" />
                </div>
                <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Reuters Feed</h4>
              <p className="text-xs text-slate-500 mb-4">Real-time market news wire stream.</p>
              <div className="flex items-center space-x-1 mt-4">
                <div className="h-1 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="h-1 w-3 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
                <div className="h-1 w-3 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>

          {/* System Ingestion Log View */}
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center">
                <Zap className="h-3 w-3 mr-2" />
                System Activity Log
              </h3>
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                <div className="h-2 w-2 rounded-full bg-slate-700"></div>
              </div>
            </div>
            <div className="space-y-2 h-40 overflow-y-auto custom-scrollbar text-xs">
              {logs.length === 0 && <div className="text-slate-600 italic">No recent system events logged. Listening for engine signals...</div>}
              {logs.map((log, i) => (
                <div key={i} className={`flex space-x-3 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>
                  <span className="text-indigo-500 shrink-0">[{new Date().toLocaleTimeString()}]</span> 
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <h2 className="font-bold text-slate-900">Verified Deal Database</h2>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {SEED_DEALS.length} Records
                </span>
              </div>
              <button className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 hover:bg-slate-50 transition">
                <Plus className="h-4 w-4" />
                <span>Add Record</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SEED_DEALS.map((deal, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {deal.announced_date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 truncate max-w-sm">{deal.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{deal.sector}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit3 className="h-4 w-4" /></button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Source Health
            </h3>
            <div className="space-y-4">
              {[
                { name: 'SEC EDGAR', status: 'Online', delay: '12s' },
                { name: 'Reuters Wire', status: 'Online', delay: '4s' },
                { name: 'Bloomberg', status: 'Online', delay: '8s' }
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-indigo-200">{s.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">{s.status}</span>
                    <span className="text-[10px] text-indigo-300 font-mono">({s.delay})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              Analyst Verification Queue
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Deduplication Needed</div>
                <div className="text-xs font-bold text-slate-900">Apple vs Luminar Filing</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> 14m remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
