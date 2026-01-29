
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Network,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SyncLog, Deal } from '../types';

interface SyncResult {
  success: boolean;
  syncType: string;
  duration: string;
  summary: {
    sourcesChecked: { sec_edgar: number; perplexity: number };
    totalFound: number;
    afterDedup: number;
    afterFilter: number;
    verification: { verified: number; pending: number; unverified: number; avgScore: number };
    dealsAdded: number;
    dealsUpdated: number;
    errors: number;
  };
}

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState<string[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Fetch deals from Supabase
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        // Fallback to API if Supabase not configured client-side
        const response = await fetch('/api/deals?limit=100');
        if (!response.ok) throw new Error('Failed to fetch deals');
        const data = await response.json();
        return data.deals as Deal[];
      }
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('announced_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Deal[];
    },
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // Fetch sync logs
  const { data: syncLogs = [] } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return data as SyncLog[];
    },
    staleTime: 1000 * 30 // 30 seconds
  });

  // Update last sync time from logs
  useEffect(() => {
    if (syncLogs.length > 0) {
      const lastSync = syncLogs[0];
      setLastSyncTime(new Date(lastSync.started_at).toLocaleTimeString());
    }
  }, [syncLogs]);

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      setLogs(prev => ["MANUAL TRIGGER: Starting sync pipeline...", ...prev]);

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sync failed');
      }

      return response.json() as Promise<SyncResult>;
    },
    onSuccess: (result) => {
      const { summary } = result;
      setLogs(prev => [
        `SUCCESS: Sync completed in ${result.duration}`,
        `  - Sources checked: SEC (${summary.sourcesChecked.sec_edgar}), Perplexity (${summary.sourcesChecked.perplexity})`,
        `  - Deals found: ${summary.totalFound}, after dedup: ${summary.afterDedup}`,
        `  - Added: ${summary.dealsAdded}, Updated: ${summary.dealsUpdated}`,
        `  - Verification: ${summary.verification.verified} verified, ${summary.verification.pending} pending`,
        ...prev
      ]);
      setLastSyncTime(new Date().toLocaleTimeString());
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['sync-logs'] });
    },
    onError: (error) => {
      setLogs(prev => [
        `ERROR: Sync failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
        ...prev
      ]);
    }
  });

  const handleRefresh = () => {
    syncMutation.mutate();
  };

  // Source health status
  const sourceHealth = [
    {
      name: 'SEC EDGAR',
      status: 'Online',
      delay: '~5s',
      configured: true
    },
    {
      name: 'Perplexity API',
      status: 'Online',
      delay: '~3s',
      configured: true, // Server-side only, assume configured if deployed
      note: 'Server-side API key'
    },
    {
      name: 'Supabase',
      status: isSupabaseConfigured ? 'Online' : 'Not Configured',
      delay: '~1s',
      configured: isSupabaseConfigured
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Intelligence Console</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className={`flex items-center text-xs font-bold uppercase tracking-widest ${
              isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Pipeline: {isSupabaseConfigured ? 'Operational' : 'Setup Required'}
            </div>
            <div className="text-slate-400 text-xs font-medium">
              Last Sync: {lastSyncTime || 'Never'}
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={syncMutation.isPending}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-bold transition ${
              syncMutation.isPending
              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 shadow-sm'
            }`}
          >
            <RefreshCcw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{syncMutation.isPending ? 'Syncing...' : 'Sync Latest Signal'}</span>
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
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Key className="h-5 w-5" />
                </div>
                <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Free</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">SEC EDGAR API</h4>
              <p className="text-xs text-slate-500 mb-4">Official US regulatory filings (8-K, S-4).</p>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full"></div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition ${!isSupabaseConfigured ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${!isSupabaseConfigured ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Network className="h-5 w-5" />
                </div>
                <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isSupabaseConfigured ? 'text-emerald-600 bg-emerald-100' : 'text-amber-600 bg-amber-100'
                }`}>
                  {isSupabaseConfigured ? 'Connected' : 'Setup Required'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Perplexity AI</h4>
              <p className="text-xs text-slate-500 mb-4">Global deal discovery & verification.</p>
              <div className="flex items-center space-x-1 mt-4">
                <div className={`h-1 w-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-300'}`}></div>
                <div className={`h-1 w-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse delay-75' : 'bg-amber-300'}`}></div>
                <div className={`h-1 w-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse delay-150' : 'bg-amber-300'}`}></div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition ${!isSupabaseConfigured ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${!isSupabaseConfigured ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Database className="h-5 w-5" />
                </div>
                <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isSupabaseConfigured ? 'text-emerald-600 bg-emerald-100' : 'text-amber-600 bg-amber-100'
                }`}>
                  {isSupabaseConfigured ? 'Connected' : 'Setup Required'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Supabase Database</h4>
              <p className="text-xs text-slate-500 mb-4">PostgreSQL for deal storage.</p>
              {!isSupabaseConfigured && (
                <p className="text-[10px] text-amber-600 font-medium">
                  Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel
                </p>
              )}
              {isSupabaseConfigured && (
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full"></div>
                </div>
              )}
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
                  {dealsLoading ? '...' : `${deals.length} Records`}
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
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dealsLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        Loading deals...
                      </td>
                    </tr>
                  ) : deals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        No deals in database. Click "Sync Latest Signal" to fetch deals.
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal, i) => (
                      <tr key={deal.id || i} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {deal.announced_date}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900 truncate max-w-sm">{deal.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{deal.sector}</span>
                            {deal.verification_status && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                deal.verification_status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : deal.verification_status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {deal.verification_status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            deal.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            deal.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                            deal.status === 'Announced' ? 'bg-indigo-100 text-indigo-700' :
                            deal.status === 'Withdrawn' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {deal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit3 className="h-4 w-4" /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
              {sourceHealth.map((s, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-indigo-200">{s.name}</span>
                  <div className="flex items-center space-x-2">
                    {s.configured ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-300" />
                    )}
                    <span className={`font-bold ${s.configured ? 'text-white' : 'text-red-200'}`}>
                      {s.status}
                    </span>
                    {s.configured && (
                      <span className="text-[10px] text-indigo-300 font-mono">({s.delay})</span>
                    )}
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
