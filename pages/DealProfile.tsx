
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Globe, 
  Calendar, 
  Building2, 
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SEED_DEALS, SEED_COMPANIES } from '../constants.tsx';
import { Deal, Company, DealStatus } from '../types.ts';

const DealProfile: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundDeal = SEED_DEALS.find(d => d.slug === slug);
    if (foundDeal) {
      setDeal(foundDeal);
      document.title = `${foundDeal.title} — M&A Intelligence`;
    }
    setIsLoading(false);
  }, [slug]);

  // Resolve companies
  const acquirer = useMemo(() => deal ? SEED_COMPANIES.find(c => c.id === deal.acquirer_id) : null, [deal]);
  const target = useMemo(() => deal ? SEED_COMPANIES.find(c => c.id === deal.target_id) : null, [deal]);

  const handleSaveDeal = () => {
    alert("Deal saved to your watchlist!");
    navigate('/app/watchlists');
  };

  if (isLoading) return <div className="p-20 text-center font-serif text-xl animate-pulse text-indigo-900">Accessing Secure Terminal...</div>;
  if (!deal) return <div className="p-20 text-center">Deal not found. <Link to="/deals" className="text-indigo-600 underline">Back to Explorer</Link></div>;

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Announced': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rumored': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const hasRationale = !!deal.rationale;
  const hasValue = !!deal.value_usd;
  const hasTimeline = deal.status !== 'Rumored';

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Dynamic Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/deals" className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Database
          </Link>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest mr-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Verified Intelligence
            </div>
            <button className="text-slate-500 hover:text-slate-900"><Share2 className="h-5 w-5" /></button>
            <button onClick={handleSaveDeal} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
              <Bookmark className="h-4 w-4" />
              <span>Watch</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className={`grid gap-12 ${hasValue ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(deal.status)}`}>
                  {deal.status}
                </span>
                {deal.geography && (
                  <span className="flex items-center text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    <Globe className="h-3 w-3 mr-1.5" />
                    {deal.geography}
                  </span>
                )}
                <span className="flex items-center text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <TrendingUp className="h-3 w-3 mr-1.5" />
                  {deal.sector}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 leading-tight mb-8">
                {deal.title}
              </h1>
              
              <div className="flex items-center space-x-8 border-y border-slate-200 py-6">
                {hasValue && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Implied Enterprise Value</div>
                    <div className="text-2xl font-serif font-bold text-slate-900">
                      ${(deal.value_usd! / 1000000000).toFixed(2)} Billion
                    </div>
                  </div>
                )}
                {!hasValue && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Financial Terms</div>
                    <div className="text-lg font-bold text-slate-400 italic">Undisclosed / Private</div>
                  </div>
                )}
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Announcement Date</div>
                  <div className="text-2xl font-serif font-bold text-slate-900">
                    {new Date(deal.announced_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Module (Dynamic) */}
            <section className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-3 text-indigo-400" />
                  Intelligence Analysis
                </h2>
                <p className="text-indigo-100 leading-relaxed text-lg mb-6">{deal.synopsis}</p>
                {hasRationale && (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Strategic Rationale</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{deal.rationale}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Parties Section */}
            <div className="grid md:grid-cols-2 gap-8">
              {acquirer && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">Lead Acquirer</div>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                      <img src={acquirer.logo_url} alt={acquirer.name} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{acquirer.name}</h3>
                      <p className="text-sm text-slate-500">{acquirer.sector}</p>
                    </div>
                  </div>
                </div>
              )}
              {target && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-4">Target Entity</div>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                      <img src={target.logo_url} alt={target.name} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{target.name}</h3>
                      <p className="text-sm text-slate-500">{target.sector}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Module */}
            {hasTimeline && (
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-indigo-600" />
                  Transaction Timeline
                </h2>
                <div className="space-y-8 relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-indigo-600 shadow-sm"></div>
                    <div>
                      <div className="text-xs font-mono text-slate-400 mb-1">{deal.announced_date}</div>
                      <div className="font-bold text-slate-900">Announcement Date</div>
                      <p className="text-sm text-slate-500 mt-1">Transaction revealed via joint regulatory statement.</p>
                    </div>
                  </div>
                  <div className="relative pl-8 opacity-40">
                    <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-slate-300 shadow-sm"></div>
                    <div>
                      <div className="text-xs font-mono text-slate-400 mb-1">Expected TBD</div>
                      <div className="font-bold text-slate-900">Estimated Closing</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Dynamic Sidebar (Only if value exists) */}
          {hasValue && (
            <div className="space-y-8">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/10">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-indigo-400" />
                  Deal Parameters
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Payment Structure', value: 'Mixed Cash/Stock' },
                    { label: 'Control acquired', value: deal.percent_acquired ? `${deal.percent_acquired}%` : '100%' },
                    { label: 'Breakup Fee', value: '3.5% of EV' },
                    { label: 'Advisory Panel', value: 'Active' }
                  ].map((term, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0 last:pb-0">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{term.label}</span>
                      <span className="text-sm font-bold text-white">{term.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Market Response</h3>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Stock Performance ({acquirer?.name.split(' ')[0]})</div>
                  <div className="text-2xl font-bold text-emerald-700">+2.45%</div>
                  <p className="text-[10px] text-emerald-600 mt-1">Institutional sentiment remains bullish on synergy projections.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealProfile;
