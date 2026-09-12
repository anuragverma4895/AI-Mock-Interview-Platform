import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  RotateCcw,
  Code,
  Terminal,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  ArrowLeft,
  Loader2,
  Wand2,
} from "lucide-react"
import Editor from "@monaco-editor/react"
import { codingAPI, CodingChallenge, CodingTestResult } from "../services/api"

export default function LiveCodingEditor() {
  const navigate = useNavigate()
  const location = useLocation()
  const challengeId = location.state?.challengeId || null
  const languagePref = location.state?.language || null

  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [language, setLanguage] = useState(languagePref || 'javascript')
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; input: string; expected: string; actual: string }>>([])
  const [timeLeft, setTimeLeft] = useState(30 * 60)

  const [session, setSession] = useState<{ id: string; challenge: CodingChallenge; timeLimit: number; language: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const res = await codingAPI.start(challengeId || undefined, languagePref || undefined)
        if (cancelled) return
        const data = res.data.codingSession
        setSession(data)
        setCode(data.challenge.starterCode[languagePref || 'javascript'] || '// Start coding here')
        setTimeLeft(data.timeLimit)
      } catch (err: any) {
        if (cancelled) return
        setError(err?.response?.data?.message || 'Failed to start coding session')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [challengeId, languagePref])

  // Countdown timer for the coding session
  useEffect(() => {
    if (!session) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const challenge = session?.challenge

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    setLanguage(newLang)
    if (challenge && challenge.starterCode && challenge.starterCode[newLang]) {
      setCode(challenge.starterCode[newLang])
    } else {
      setCode('// Language not supported by this challenge')
    }
  }

  const generateAIChallenge = async () => {
    setIsGenerating(true)
    try {
      const diff = challenge?.difficulty || 'medium'
      const res = await codingAPI.generateChallenge(diff, language)
      const customChallenge = res.data
      const startRes = await codingAPI.start(undefined, language, customChallenge)
      const data = startRes.data.codingSession
      setSession(data)
      setCode(data.challenge.starterCode[language] || '// Start coding here')
      setTimeLeft(data.timeLimit)
      setOutput('✨ AI Challenge Generated!\n')
      setTestResults([])
    } catch (err: any) {
      setOutput(`Error: ${err?.response?.data?.message || 'Failed to generate challenge'}\n`)
    } finally {
      setIsGenerating(false)
    }
  }

  const runCode = async () => {
    if (!session) return
    setIsRunning(true)
    setOutput('Running tests...\n')
    setError(null)

    try {
      const res = await codingAPI.submit(session.id, code, language)
      const results: CodingTestResult[] = res.data.results
      const passedCount = res.data.passedCount
      const totalCount = res.data.totalCount

      let out = ''
      results.forEach((r, index) => {
        out += `Test ${index + 1}: ${r.passed ? 'PASS' : 'FAIL'}\n`
      })
      out += `\n${passedCount}/${totalCount} tests passed. Final score: ${res.data.finalScore.toFixed(1)}/5\n`
      setOutput(out)
      setTestResults(results)
    } catch (err: any) {
      setOutput(`Error: ${err?.response?.data?.message || 'Unable to run code'}\n`)
      setTestResults([])
    } finally {
      setIsRunning(false)
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    await runCode()
  }

  const resetCode = () => {
    if (challenge && challenge.starterCode) {
      setCode(challenge.starterCode[language] || '// Start coding here')
    }
    setOutput('')
    setTestResults([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 p-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Live Coding Challenge
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {challenge?.title || 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              size="sm"
              variant="outline"
              onClick={generateAIChallenge}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-none"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Generate AI Challenge</span>
            </Button>
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 shadow-sm">
              {challenge?.difficulty || '...'}
            </Badge>
          </div>
        </div>
      </motion.header>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Starting coding session...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Challenge Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {challenge?.description || 'No description available.'}
                </p>

                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">Example:</h4>
                  <div className="font-mono text-sm space-y-1">
                    <div><span className="text-blue-600">Input:</span> nums = [2,7,11,15], target = 9</div>
                    <div><span className="text-green-600">Output:</span> [0,1]</div>
                    <div><span className="text-slate-500">Explanation:</span> Because nums[0] + nums[1] == 9</div>
                  </div>
                </div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 capitalize">{challenge?.difficulty}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Difficulty</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.ceil((challenge?.timeLimit || 0) / 60)}min</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Time Limit</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{challenge?.testCases?.length || 0}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Test Cases</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.passed
                            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Test Case {index + 1}</span>
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">Input:</span> {result.input}</div>
                          <div><span className="font-medium">Expected:</span> {result.expected}</div>
                          {!result.passed && (
                            <div><span className="font-medium">Actual:</span> {result.actual}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Panel - Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Editor
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetCode}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={runCode}
                      disabled={isRunning}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isRunning ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {isRunning ? 'Running...' : 'Run Tests'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-[500px] border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    onMount={(editor) => {
                      editorRef.current = editor
                    }}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Output Console */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Console Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={output}
                  readOnly
                  className="h-32 font-mono text-sm bg-slate-900 text-green-400 border-slate-700"
                  placeholder="Run your code to see output here..."
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )}
  </div>
  )
}
