
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-serif font-bold text-slate-900 mb-8">Intelligence for the Deal Economy.</h1>
      <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-16">
        Founded by former investment bankers and software engineers, M&A Intelligence Pro was built to solve one problem: the fragmentation of mid-market deal data.
      </p>
      
      <div className="grid md:grid-cols-2 gap-12 text-left">
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h3>
          <p className="text-slate-600">To democratize access to institutional-grade M&A intelligence, allowing analysts and advisors to spend less time digging for data and more time on strategy.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Our Values</h3>
          <p className="text-slate-600">Accuracy over speed. Transparency over speculation. We believe every piece of data should be verifiable to its original source.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
