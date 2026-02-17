export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          WebChat
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          The ultimate gaming-focused, privacy-first communication platform.
        </p>
      </div>
      
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-indigo-400">Self-Hostable</h2>
          <p className="text-sm text-gray-400">Full control over your data and infrastructure.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-emerald-400">Low Latency</h2>
          <p className="text-sm text-gray-400">Optimized for competitive gaming and esports.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2 text-amber-400">Privacy First</h2>
          <p className="text-sm text-gray-400">Optional end-to-end encryption for security.</p>
        </div>
      </div>
    </main>
  );
}
