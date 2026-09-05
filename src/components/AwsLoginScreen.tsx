import React, { useState } from 'react';
import { Shield, Key, Mail, User, AlertCircle, ArrowRight, Database } from 'lucide-react';
import { AWSUserSession } from '../services/awsApi';

interface AwsLoginScreenProps {
  onLoginSuccess: (user: AWSUserSession) => void;
  onContinueAsGuest?: () => void;
}

export const AwsLoginScreen: React.FC<AwsLoginScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [clientNumber, setClientNumber] = useState('RC-4421');
  const [email, setEmail] = useState('sipho@testmail.co.za');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('https://jgct3kds91.execute-api.af-south-1.amazonaws.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN',
          clientNumber: clientNumber.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.authenticated) {
        onLoginSuccess(data.user);
      } else {
        setAuthError(data.message || 'Invalid credentials. Please verify your client number and email.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error connecting to AWS database.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setClientNumber('RC-4421');
    setEmail('sipho@testmail.co.za');
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-serif font-bold text-white text-lg shadow-xs">
            RS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-tight text-slate-900">
                ROYAL SQUARE
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                FSP 29370
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block tracking-wider uppercase font-medium">
              Client Portal • AWS DynamoDB
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your policy details to authenticate and manage your short-term claims directly with the insurer database.
          </p>
        </div>

        {authError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Number</label>
            <div className="relative">
              <input
                type="text"
                value={clientNumber}
                onChange={(e) => setClientNumber(e.target.value)}
                placeholder="RC-4421"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sipho@testmail.co.za"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Quick Demo Credentials helper */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Demo: Sipho Ndlovu</span>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-slate-700 font-semibold hover:underline"
            >
              Fill RC-4421 Credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{authLoading ? 'Authenticating with AWS...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" />
            AWS af-south-1
          </span>
          <span>Santam & Sanlam Integrated</span>
        </div>
      </div>
    </div>
  );
};
