'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, Eye, EyeOff, Gamepad2, Sparkles, ArrowLeft } from 'lucide-react'

// Gaming SVG Components
const ChessKnightSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M20 80 L25 75 L30 70 L35 65 L40 60 L45 55 L50 50 L55 45 L60 40 L65 35 L70 30 L75 25 L80 20 L75 15 L70 20 L65 25 L60 30 L55 35 L50 40 L45 45 L40 50 L35 55 L30 60 L25 65 L20 70 Z"
            fill="currentColor" opacity="0.8" />
        <circle cx="65" cy="25" r="8" fill="currentColor" />
        <path d="M15 85 L85 85 L80 80 L20 80 Z" fill="currentColor" />
    </svg>
)

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                router.push('/dashboard')
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
            </div>

            {/* Back to Home */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="flex items-center text-gray-300 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                                <div className="w-10 h-10 text-white">
                                    <ChessKnightSVG />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Welcome Back, Master
                            </span>
                        </h1>

                        <p className="text-gray-300 mb-6">
                            Enter ChessMaster Arena and continue your path to greatness
                        </p>

                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                            <Sparkles className="w-4 h-4" />
                            <span>Ready to claim victory?</span>
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                                        Enter the Arena
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <p className="text-center text-sm text-gray-400">
                                New to ChessMaster Arena?{' '}
                                <Link
                                    href="/auth/register"
                                    className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Join the elite
                                </Link>
                            </p>
                        </div>

                        {/* Gaming Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                            <div className="bg-purple-500/10 rounded-xl p-3">
                                <div className="text-lg font-bold text-purple-400">10K+</div>
                                <div className="text-xs text-gray-400">Players Online</div>
                            </div>
                            <div className="bg-cyan-500/10 rounded-xl p-3">
                                <div className="text-lg font-bold text-cyan-400">24/7</div>
                                <div className="text-xs text-gray-400">Master Coaching</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}