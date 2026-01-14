import { useState } from 'react';
import { Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { ClarificationOutput } from './components/ClarificationOutput';
import { clarifyProblem } from './utils/clarifyProblem';
import { generateClarificationWithPerplexity } from './services/perplexityService';
import { ThemeToggle } from './components/ThemeToggle';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Directly use the environment variable
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;

  const handleClarify = async (mode: 'standard' | 'variation' = 'standard') => {
    if (!input.trim()) return;

    setIsProcessing(true);

    try {
      if (apiKey) {
        // Use Perplexity API
        const result = await generateClarificationWithPerplexity(apiKey, input);
        setOutput(result);
      } else {
        console.warn("No Perplexity API Key found in VITE_PERPLEXITY_API_KEY");
        // Use Mock Logic
        // Simulate processing delay for realism
        await new Promise(resolve => setTimeout(resolve, 1200));
        const result = clarifyProblem(input, mode);
        setOutput(result);
      }
    } catch (error) {
      console.error("Failed to clarify:", error);
      alert("Failed to generate clarification. Please check your API configuration or try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <ThemeToggle />

      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center relative">

        <div className="flex items-center justify-center gap-2 mb-3">
          <Lightbulb className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-4xl text-slate-900 dark:text-white">
            Problem → Solution Clarifier
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Turn messy ideas into clear problems
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-12 max-w-4xl mx-auto w-full">


        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your idea or problem in any form… it doesn't have to be perfect."
            className="w-full h-48 text-lg resize-none focus:outline-none text-slate-800 placeholder:text-slate-400"
          />

          <div className="flex items-center justify-end gap-3 mt-6">
            {output && (
              <button
                onClick={() => handleClarify('variation')}
                disabled={!input.trim() || isProcessing}
                className="bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-indigo-700 dark:text-indigo-300 px-6 py-4 rounded-xl text-lg flex items-center gap-2 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-sm"
              >
                <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            )}
            <button
              onClick={() => handleClarify('standard')}
              disabled={!input.trim() || isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl text-lg flex items-center gap-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Clarify Problem
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        {output && (
          <ClarificationOutput
            data={output}
            onGeneratePRD={() => {
              alert('PRD Generation feature coming soon! This would generate a comprehensive Product Requirements Document based on your clarification.');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
        <p className="text-sm mb-2">
          Built for <span className="text-indigo-600 dark:text-indigo-400">Nexora Hacks 2026</span>
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}