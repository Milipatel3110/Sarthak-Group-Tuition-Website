'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Message = {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

const quickQuestions = [
  "What courses do you offer?",
  "How do I enroll?",
  "What are the fees?",
  "Tell me about faculty",
  "What are your class timings?",
  "Do you provide study materials?"
]

export default function SarthakAIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I\'m Sarthak AI, your virtual assistant at Sarthak Group Tuition. I\'m here to help you with any questions about our courses, enrollment, faculty, or anything else you\'d like to know. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot response - in production, this would call an API with RAG
    setTimeout(() => {
      const botResponse = getBotResponse(input)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    // Auto send the question
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setIsTyping(true)
      setTimeout(() => {
        const botResponse = getBotResponse(question)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: botResponse,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1500)
    }, 100)
  }

  const getBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('course') || lowerQuery.includes('offer') || lowerQuery.includes('class')) {
      return "We offer a variety of courses:\n\n📚 Class 9-10 Foundation\n📚 Class 11-12 Science (PCM/PCB)\n📚 Class 11-12 Commerce\n📚 JEE Crash Course\n📚 NEET Crash Course\n\nEach course is designed to help students excel in their boards and competitive exams. Would you like more details about any specific course?"
    }
    
    if (lowerQuery.includes('enroll') || lowerQuery.includes('admission') || lowerQuery.includes('register')) {
      return "To enroll at Sarthak Group Tuition:\n\n1. Visit our 'Enroll Now' page\n2. Select your desired course\n3. Fill in student and parent details\n4. Choose payment method\n5. Complete the enrollment\n\nYou can also visit our center directly or call us at +91 9328705157 for assistance."
    }
    
    if (lowerQuery.includes('fee') || lowerQuery.includes('price') || lowerQuery.includes('cost')) {
      return "Our course fees are:\n\n• Class 9-10: ₹25,000/year\n• Class 11-12 Science: ₹45,000/year\n• Class 11-12 Commerce: ₹35,000/year\n• JEE/NEET Crash Course: ₹30,000\n\nWe also offer flexible payment options. Would you like to know about any specific course?"
    }
    
    if (lowerQuery.includes('faculty') || lowerQuery.includes('teacher') || lowerQuery.includes('tutor')) {
      return "Our faculty consists of experienced teachers:\n\n👨‍🏫 Sarthak Sharma - Mathematics (Owner)\n👨‍🏫 Dr. Rajesh Kumar - Physics\n👩‍🏫 Mrs. Priya Singh - Chemistry\n👨‍🏫 Mr. Amit Verma - Biology\n👨‍🏫 CA Rohit Sharma - Accounts & Business\n\nAll teachers have 7+ years of experience and a proven track record. Would you like more details?"
    }
    
    if (lowerQuery.includes('timing') || lowerQuery.includes('schedule') || lowerQuery.includes('hours')) {
      return "Our center is open:\n\n🕐 Monday - Saturday: 8:00 AM - 8:00 PM\n🕐 Sunday: 8:00 AM - 12:00 PM\n\nClass timings vary by course. Typically, morning batches are 8 AM - 12 PM and evening batches are 2 PM - 6 PM."
    }
    
    if (lowerQuery.includes('material') || lowerQuery.includes('notes') || lowerQuery.includes('study')) {
      return "Yes! We provide comprehensive study materials including:\n\n📖 Chapter-wise notes\n📖 Practice papers\n📖 Previous year question papers\n📖 Online resources\n📖 Video lectures (for enrolled students)\n\nAll materials are regularly updated according to the latest syllabus."
    }
    
    if (lowerQuery.includes('location') || lowerQuery.includes('address') || lowerQuery.includes('where')) {
      return "We're located at:\n\n📍 12, Janakpuri Society,\nNigam Smruti Mandir Road,\nGhodasar, Ahmedabad, Gujarat 380050\n\nYou can also find us on Google Maps. Feel free to visit us during office hours!"
    }
    
    if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('call')) {
      return "You can contact us at:\n\n📞 +91 9328705157\n📞 +91 7984433287\n✉️ arpanmpatel31@gmail.com\n✉️ sarthak.computer@gmail.com\n\nWe're happy to answer any questions you may have!"
    }
    
    return "Thank you for your question! I can help you with:\n\n• Course information\n• Enrollment process\n• Fee details\n• Faculty information\n• Class timings\n• Study materials\n• Location & contact\n\nWhat would you like to know more about?"
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all ${
          isOpen ? 'hidden' : 'flex items-center justify-center'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          AI
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Sarthak AI</h3>
                <p className="text-xs text-blue-200">Online • Always ready to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-4 py-2 border-t bg-white">
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white rounded-b-2xl">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

