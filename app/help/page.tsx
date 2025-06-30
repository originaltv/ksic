"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Video, 
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"

const faqData = [
  {
    question: "How do I track a specific saree?",
    answer: "Navigate to the Saree Tracker page and use the search functionality to find sarees by ID, article number, or weaver name. Click on any saree row to view detailed progress."
  },
  {
    question: "What do the different station statuses mean?",
    answer: "Inspection: Initial quality check, Dyeing: Color processing, FWH: Final washing and handling, FMG: Final manufacturing, Showroom Inward: Ready for display."
  },
  {
    question: "How often is the data updated?",
    answer: "Data is updated in real-time. When changes are made in the database, they are immediately reflected in the dashboard and tracking pages."
  },
  {
    question: "Can I export transaction data?",
    answer: "Yes, you can export transaction data from the Transactions page using the Export button. Data is available in CSV format."
  },
  {
    question: "How do I report an issue?",
    answer: "Use the contact form below or email our support team directly. Include screenshots and detailed descriptions for faster resolution."
  }
]

const quickLinks = [
  {
    title: "User Guide",
    description: "Complete guide to using the KSIC Portal",
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950"
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    icon: Video,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950"
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950"
  },
  {
    title: "System Status",
    description: "Check system health and uptime",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950"
  }
]

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFaq = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Header 
        title="Help & Support" 
        breadcrumbs={[{ label: "System" }, { label: "Help & Support" }]} 
      />

      <div className="flex-1 space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                How can we help you?
              </h1>
              <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
                Find answers to common questions, access documentation, and get support for the KSIC Saree Tracking Portal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${link.bgColor}`}>
                      <Icon className={`h-6 w-6 ${link.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ Section */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredFaq.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <Separator className="mb-4" />
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@ksic.gov.in</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+91 080 2221 1234</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri: 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Please describe your issue in detail..."
                    rows={4}
                  />
                </div>
                
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">All Systems Operational</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">Last updated: 2 minutes ago</p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Database</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Supabase: Online</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">Realtime</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">Live updates: Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 