export default function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Mission Control</h1>
        <p className="text-sm text-gray-400">Forge OS Command Center</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-sm text-green-400">System Online</span>
      </div>
    </header>
  );
}
