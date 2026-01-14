
import React from 'react';
import { User, Shield, CreditCard, Bell } from 'lucide-react';

const AccountPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-serif font-bold text-slate-900 mb-10">Account Settings</h1>
      
      <div className="space-y-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
              <p className="text-slate-500 text-sm">Update your profile details and preferences.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" defaultValue="Alex Rivera" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" defaultValue="arivera@firm.com" disabled />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <CreditCard className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Subscription Plan</h2>
              <p className="text-slate-500 text-sm">Manage your billing and institutional access.</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</div>
              <div className="text-lg font-bold">Institutional Terminal Pro</div>
            </div>
            <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold">Manage Plan</button>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Bell className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
              <p className="text-slate-500 text-sm">Configure real-time alerts for your watchlist.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'New Announcements', checked: true },
              { label: 'Deal Status Changes', checked: true },
              { label: 'Market Sentiment Reports', checked: false }
            ].map((opt, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                <div className={`h-6 w-11 rounded-full relative transition ${opt.checked ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all ${opt.checked ? 'left-6' : 'left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
