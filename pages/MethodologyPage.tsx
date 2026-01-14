
import React from 'react';
import { ShieldCheck, Database, Zap, Search } from 'lucide-react';

const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-5xl font-serif font-bold text-slate-900 mb-8">Our Methodology</h1>
      <p className="text-xl text-slate-600 leading-relaxed mb-12">
        M&A Intelligence Pro uses a multi-layered verification process to ensure the data delivered to our terminal is institutional-grade.
      </p>
      
      <div className="space-y-16">
        <section>
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">1. Automated Ingestion</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Our engine monitors over 1,500 global sources including official government filings (SEC, Companies House), major financial news wires (Bloomberg, Reuters), and hundreds of niche industry publications. Announcements are captured in sub-60 seconds.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <Database className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">2. Algorithmic Structuring</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Unstructured data from press releases is processed using custom LLM pipelines to extract entities (acquirers, targets, sellers), transaction values, strategic rationales, and advisor lists.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">3. Human Verification</h2>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Every transaction over $50M undergoes manual review by our analyst team to ensure deduplication and accuracy of complex financial terms, such as earn-outs and deferred consideration components.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MethodologyPage;
