import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft } from 'lucide-react';

export default function DocumentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4 px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <Heart className="h-6 w-6 text-purple-400" />
            <span>Spillmate</span>
          </Link>
          <Link
            to={-1 as any} // Navigates back to the previous page
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </nav>
      </header>
      <main className="flex-grow">
        {/* All document content will be rendered inside this centered container */}
        <div className="mx-auto max-w-4xl p-4 py-8 sm:p-6 lg:p-12">
            {children}
        </div>
      </main>
      <footer className="border-t border-slate-800 py-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
                <p>&copy; 2024 Spillmate.</p>
            </div>
      </footer>
    </div>
  );
}