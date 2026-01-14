
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Database,
  PieChart,
  BarChart3
} from 'lucide-react';
import { SEED_DEALS } from '../constants.tsx';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>Live Deal Flow Updated Every 15 Minutes</span>
              </div>
              <h1 className="text-4xl tracking-tight font-serif font-bold text-slate-900 sm:text-6xl md:text-7xl">
                The Signal in the <br />
                <span className="text-indigo-600">M&A Landscape.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                The most sophisticated database of public and private M&A transactions. Powered by institutional-grade intelligence for the modern dealmaker.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                <Link to="/deals" className="flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Explore Deals
                </Link>
                <Link to="/signup" className="flex items-center justify-center px-8 py-4 border border-slate-200 text-base font-bold rounded-xl text-slate-900 bg-white hover:bg-slate-50 transition">
                  Get Premium Access
                </Link>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6 relative">
              <div className="bg-slate-900 rounded-3xl p-4 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-800 transform transition-all duration-500 ease-out hover:translate-y-[-8px]">
                <div className="bg-slate-800 rounded-2xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-slate-500 text-xs font-mono">intelligence_terminal_v2.0</div>
                  </div>
                  
                  <div className="space-y-4">
                    {SEED_DEALS.slice(0, 3).map((deal, idx) => (
                      <div key={idx} className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex justify-between items-center group cursor-default">
                        <div>
                          <div className="text-xs text-indigo-400 font-mono mb-1">{deal.sector}</div>
                          <div className="text-white font-medium text-sm">
                            {deal.title.includes(' to ') ? (
                              <>
                                {deal.title.split(' to ')[0]} <span className="text-slate-500 px-1">→</span> {deal.title.split(' to ')[1]?.split(' for ')[0]}
                              </>
                            ) : deal.title}
                          </div>
                        </div>
                        <div className="text-slate-300 text-sm font-bold">
                          {deal.value_usd ? `$${(deal.value_usd / 1000000000).toFixed(1)}B` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-indigo-600/20 rounded-xl p-4 border border-indigo-500/30">
                      <TrendingUp className="h-5 w-5 text-indigo-400 mb-2" />
                      <div className="text-white text-xl font-bold font-serif">$124.5B</div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider">Volume (LTM)</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                      <PieChart className="h-5 w-5 text-emerald-400 mb-2" />
                      <div className="text-white text-xl font-bold font-serif">842</div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider">Deals Logged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Precision Intelligence</h2>
            <p className="text-3xl font-serif font-bold text-slate-900 sm:text-4xl">Everything you need to track global deal flow.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Real-Time Ingestion',
                desc: 'Our proprietary engine monitors filings, press releases, and news wires 24/7 to capture announcements as they happen.',
                icon: Zap
              },
              {
                title: 'Curated Analysis',
                desc: 'We provide structured data including multiples, advisor lists, and detailed transaction rationale for every deal.',
                icon: BarChart3
              },
              {
                title: 'Institutional Guardrails',
                desc: 'Clean, verified data with source transparency. No rumors, no noise—only confirmed market movements.',
                icon: ShieldCheck
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
