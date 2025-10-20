"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Send, Loader2, MessageCircle, Lightbulb, HelpCircle } from "lucide-react"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Define the structured response interface from the Next.js API route
interface AssistantApiResponse {
  ok: boolean;
  data: { text: string };
  source?: string;
  error?: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your **PlantWhisperer AI Assistant**. I can help you with crop health monitoring, disease identification, farming best practices, and troubleshooting. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // 1. Prepare and add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const prompt = input
    setInput("")
    setIsLoading(true)
    
    let assistantResponseContent = "I apologize, the assistant service is completely unreachable right now.";

    try {
      // 2. Call server-side assistant API
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const json: AssistantApiResponse = await res.json()

      // 3. Process the structured response
      if (json.data?.text) {
        // Always use the text provided in data.text, whether it's the success message or the friendly fallback
        assistantResponseContent = json.data.text;
      } else {
        // Malformed or empty response
        throw new Error(`Server returned status ${res.status}. Data missing.`);
      }

    } catch (err: any) {
      // Handle network errors or total server failure
      console.error("Client fetch error:", err);
      const errorDetail = err?.message ? `: ${err.message}` : ".";
      assistantResponseContent = `Assistant is **unavailable** due to a network error${errorDetail}`;
    } finally {
      // 4. Add assistant message and clean up
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    "How do I identify crop diseases?",
    "What's the optimal soil moisture level?",
    "How do I train a model with my data?",
    "What do the sensor readings mean?",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Get help with crop health, farming tips, and troubleshooting</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 border-green-200 flex flex-col mb-8 min-h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-green-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-green-200 p-6">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Ask me anything about your crops..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Quick Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(question)
                    setTimeout(() => {
                      const form = document.querySelector("form") as HTMLFormElement
                      form?.dispatchEvent(new Event("submit", { bubbles: true }))
                    }, 0)
                  }}
                  className="p-4 text-left bg-white border border-green-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{question}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}