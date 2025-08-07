import Link from 'next/link'
import { Play, Video, Users, Crown, Zap, Shield, Brain, Gamepad2, Trophy, Star, ChevronRight, Bot, Sparkles } from 'lucide-react'

// Gaming SVG Components
const ChessKnightSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M20 80 L25 75 L30 70 L35 65 L40 60 L45 55 L50 50 L55 45 L60 40 L65 35 L70 30 L75 25 L80 20 L75 15 L70 20 L65 25 L60 30 L55 35 L50 40 L45 45 L40 50 L35 55 L30 60 L25 65 L20 70 Z" 
          fill="currentColor" opacity="0.8"/>
    <circle cx="65" cy="25" r="8" fill="currentColor"/>
    <path d="M15 85 L85 85 L80 80 L20 80 Z" fill="currentColor"/>
  </svg>
)

const GameControllerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="20" y="35" width="60" height="30" rx="15" fill="currentColor" opacity="0.8"/>
    <circle cx="35" cy="45" r="4" fill="currentColor"/>
    <circle cx="45" cy="45" r="4" fill="currentColor"/>
    <circle cx="65" cy="45" r="4" fill="currentColor"/>
    <circle cx="75" cy="45" r="4" fill="currentColor"/>
    <rect x="10" y="40" width="15" height="20" rx="7" fill="currentColor"/>
    <rect x="75" y="40" width="15" height="20" rx="7" fill="currentColor"/>
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 text-purple-400">
                <ChessKnightSVG />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  ChessMaster Arena
                </h1>
                <p className="text-xs text-gray-400">Elite Chess Platform</p>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/25">
                Join Arena
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Next-Gen Chess Experience
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                ChessMaster
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Arena
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              The world's most advanced chess platform with <span className="text-purple-400 font-semibold">HD video chat</span>, 
              <span className="text-cyan-400 font-semibold"> AI mastery coaching</span>, and 
              <span className="text-purple-400 font-semibold"> lightning-fast gameplay</span>. 
              Join elite players in ChessMaster Arena - where legends are born.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/auth/register" 
                className="group bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 flex items-center"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Start Playing Now
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features" 
                className="text-gray-300 hover:text-white px-8 py-4 rounded-full border border-gray-600 hover:border-purple-500 transition-all duration-300 flex items-center font-semibold"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Explore Features
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-gray-400">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">50K+</div>
                <div className="text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
                <div className="text-gray-400">AI Coach</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Game-Changing Features
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built for serious players who demand the best chess experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-gradient-to-br from-purple-900/50 to-slate-900/50 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">HD Video Chat</h3>
                <p className="text-gray-300 leading-relaxed">
                  Crystal-clear peer-to-peer video communication with zero latency. See your opponent's reactions in real-time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-gradient-to-br from-cyan-900/50 to-slate-900/50 p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Chess Coach</h3>
                <p className="text-gray-300 leading-relaxed">
                  Advanced AI powered by Google Gemini provides real-time analysis, move suggestions, and personalized coaching.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-gradient-to-br from-indigo-900/50 to-slate-900/50 p-8 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
                <p className="text-gray-300 leading-relaxed">
                  Sub-100ms move synchronization ensures the smoothest real-time chess experience possible.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-gradient-to-br from-emerald-900/50 to-slate-900/50 p-8 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Secure & Private</h3>
                <p className="text-gray-300 leading-relaxed">
                  End-to-end encrypted communications with JWT authentication. Your games and data stay completely private.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group bg-gradient-to-br from-orange-900/50 to-slate-900/50 p-8 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Analysis</h3>
                <p className="text-gray-300 leading-relaxed">
                  Deep position analysis with opening theory, tactical suggestions, and post-game review capabilities.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group bg-gradient-to-br from-pink-900/50 to-slate-900/50 p-8 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Global Community</h3>
                <p className="text-gray-300 leading-relaxed">
                  Connect with chess players worldwide. Create rooms, share links, and build lasting gaming relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-gray-300">Get started in three simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Create Account</h3>
                <p className="text-gray-300">Sign up in seconds and get instant access to your gaming dashboard</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Start or Join Game</h3>
                <p className="text-gray-300">Create a new game room or join an existing one with a simple room code</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Play & Learn</h3>
                <p className="text-gray-300">Enjoy HD video chat while playing and get real-time AI coaching</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Ready to Dominate?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the most advanced chess platform and take your game to the next level. 
              Start with 1 free game, upgrade anytime for unlimited access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="group bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center"
              >
                <Gamepad2 className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Enter the Arena
                <Star className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              No credit card required • 1 free game included • Upgrade anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/40 backdrop-blur-md border-t border-purple-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 text-purple-400">
                <ChessKnightSVG />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ChessMaster Arena
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 ChessMaster Arena. Where legends are forged.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}