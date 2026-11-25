import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import UnoCard from '../components/UnoCard';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-6">
      <div className="relative">
        <UnoCard
          card={{ id: '404', color: 'red', type: 'skip', value: 'skip' }}
          size="xl"
          className="shadow-glow-red rotate-6"
        />
        <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-slate-950 px-3 py-1 rounded-full font-black text-xs uppercase shadow">
          Skipped!
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white font-display">404 - Turn Skipped!</h1>
        <p className="text-sm text-slate-400 max-w-sm">
          The page or game room you were looking for doesn't exist or has expired.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
