"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Eye, Mic, Droplets, ArrowRight, BarChart3 } from "lucide-react"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-700">PlantWhisperer Pro++</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-green-600 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-green-600 transition">
              How It Works
            </Link>
            <Link href="#dashboard" className="text-gray-600 hover:text-green-600 transition">
              Dashboard
            </Link>
          </div>
          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700 text-white">Launch Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Multimodal AI for <span className="text-green-600">Predictive Crop Health</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Detect diseases 3–5 days before visible symptoms using vision, audio, and sensor fusion. Protect your
              crops with early detection and actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                  Launch Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <Leaf className="w-24 h-24 text-green-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600 font-medium">AI-Powered Crop Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="bg-green-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Success Metrics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Early Detection", desc: "Accurate detection before visible symptoms", icon: Eye },
              { title: "Reduced False Positives", desc: "Intelligent filtering for reliable alerts", icon: BarChart3 },
              { title: "Location-Specific", desc: "Pinpoint exact problem areas in fields", icon: Droplets },
              { title: "Actionable Insights", desc: "Specific intervention recommendations", icon: Leaf },
              { title: "Intuitive Interface", desc: "Farmer-friendly dashboard design", icon: Eye },
              { title: "Scalable Pipeline", desc: "Process data from unlimited fields", icon: BarChart3 },
            ].map((metric, idx) => {
              const Icon = metric.icon
              return (
                <Card key={idx} className="p-6 border-green-200 hover:shadow-lg transition">
                  <Icon className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.title}</h3>
                  <p className="text-gray-600">{metric.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
        <p className="text-center text-xl text-gray-600 mb-16">Multimodal AI combining multiple data sources</p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Eye,
              title: "Computer Vision",
              desc: "AI analyzes drone and camera images to detect early stress patterns and disease signatures",
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: Mic,
              title: "Acoustic Analysis",
              desc: "Detects plant stress through ultrasonic sounds before visible symptoms appear",
              color: "bg-cyan-100 text-cyan-600",
            },
            {
              icon: Droplets,
              title: "Sensor Fusion",
              desc: "Combines soil, weather, and environmental data for comprehensive analysis",
              color: "bg-green-100 text-green-600",
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Card key={idx} className="p-8 border-green-200 text-center hover:shadow-lg transition">
                <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mx-auto mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Protect Your Crops?</h2>
          <p className="text-xl text-green-100 mb-8">Start monitoring your fields with AI-powered insights today.</p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
              Launch Dashboard Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-green-500" />
                <span className="font-bold text-white">PlantWhisperer Pro++</span>
              </div>
              <p className="text-sm">AI-powered crop health monitoring for modern agriculture.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-green-400 transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 PlantWhisperer Pro++. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
