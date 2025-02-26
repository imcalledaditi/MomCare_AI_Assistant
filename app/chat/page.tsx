"use client"

import { useState, useEffect, useRef } from "react"
import { ToastContainer, toast } from "react-toastify"
import Tesseract from "tesseract.js"
import pdfToText from 'react-pdftotext'
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import "react-toastify/dist/ReactToastify.css"

import { account, listMedicalDocuments } from "@/lib/appwrite"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Chat() {
  const [medicalDocs, setMedicalDocs] = useState("")
  const [userFeeling, setUserFeeling] = useState("")
  const [age, setAge] = useState("")
  const [weeksPregnant, setWeeksPregnant] = useState("")
  const [preExistingConditions, setPreExistingConditions] = useState("")
  const [specificConcerns, setSpecificConcerns] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI pregnancy care assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [shouldForceScroll, setShouldForceScroll] = useState(false)
  const [userLocation, setUserLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)

  const router = useRouter()

  // Ref and state for scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  // Modified useEffect for scrolling - always scroll when a bot message is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20
      
      // Always scroll when shouldForceScroll is true or user was already at bottom
      if (shouldForceScroll || isAtBottom) {
        // Use setTimeout to ensure scrolling happens after render
        setTimeout(scrollToBottom, 100)
      }
      
      // Reset the force scroll flag
      if (shouldForceScroll) {
        setShouldForceScroll(false)
      }
    }
  }, [messages, shouldForceScroll])

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      setShowScrollButton(scrollTop + clientHeight < scrollHeight - 20)
    }
  }

  // Get user's location and convert coordinates to address using Google Maps Geocoding API
  const getUserLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use Google Maps Geocoding API to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          )
          const data = await response.json()
          
          if (data.results && data.results.length > 0) {
            // Get formatted address from the first result
            const address = data.results[0].formatted_address
            setUserLocation(address)
            toast.success("Location detected for personalized advice", { autoClose: 3000 })
          } else {
            console.error("No results found from geocoding")
            // Don't show warning to user - just log it
          }
        } catch (error) {
          console.error("Error getting location:", error)
          // Don't show error to user - just log it
        } finally {
          setIsLocating(false)
        }
      }, (error) => {
        console.error("Geolocation error:", error)
        // Don't show error to user - just log it
        setIsLocating(false)
      })
    } else {
      console.error("Geolocation is not supported by this browser")
      setIsLocating(false)
    }
  }

  // Extract text from PDF using react-pdftotext
  const extractTextFromPDF = async (url: string) => {
    try {
      console.log("Attempting to extract text from PDF:", url);
      
      // Fetch the PDF file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      
      // Convert response to blob
      const pdfBlob = await response.blob();
      
      // Create a File object that pdfToText can work with
      const pdfFile = new File([pdfBlob], "document.pdf", { type: "application/pdf" });
      
      // Use pdfToText to extract the text
      const extractedText = await pdfToText(pdfFile);
      console.log("PDF text extraction successful");
      
      return extractedText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      toast.error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      return "";
    }
  }

  // Check authentication and get user's name
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      setIsAuthChecking(true)
      try {
        const user = await account.get()
        setUserName(user.name)
      } catch (error) {
        console.error("Authentication failed:", error)
        toast.error("Please login to access this page")
        router.push('/login')
        return
      } finally {
        setIsAuthChecking(false)
      }
    }
    checkAuthAndFetchUser()
  }, [router])

  // Automatically fetch and extract text from all medical documents
  useEffect(() => {
    if (isAuthChecking) return // Don't fetch docs if still checking auth

    const fetchAndExtractDocs = async () => {
      setLoading(true)
      try {
        const { documents } = await listMedicalDocuments()
        
        if (documents.length === 0) {
          toast.info("No medical documents found. You can still chat without them.")
          setLoading(false)
          return
        }
        
        let processedCount = 0;
        let failedCount = 0;
        
        // Process both images and PDFs
        const extractionPromises = documents.map(async (doc: any) => {
          try {
            // Handle images
            if (doc.mimeType.startsWith("image/")) {
              const { data } = await Tesseract.recognize(doc.url, "eng", {
                logger: (m) => {
                  if (m.status === "recognizing text" && m.progress === 1) {
                    // Document processing complete
                  }
                },
              });
              processedCount++;
              return data.text;
            } 
            // Handle PDFs
            else if (doc.mimeType === "application/pdf") {
              const text = await extractTextFromPDF(doc.url);
              if (text) processedCount++;
              else failedCount++;
              return text;
            }
            return ""; // Skip other file types
          } catch (error) {
            failedCount++;
            console.error(`Error extracting text from ${doc.$id}:`, error);
            return "";
          }
        });
        
        const texts = await Promise.all(extractionPromises);
        // Combine extracted texts
        const combinedText = texts.filter(text => text.trim() !== "").join("\n\n");
        setMedicalDocs(combinedText);
        
        if (combinedText) {
          toast.success(`${processedCount} medical document(s) processed successfully!`);
          if (failedCount > 0) {
            toast.warning(`${failedCount} document(s) could not be processed.`);
          }
        } else {
          toast.info("No text could be extracted from your documents.");
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to fetch or extract medical document text.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndExtractDocs();
  }, [isAuthChecking]);

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    )
  }

  // Start chat only if required fields are filled (medicalDocs is optional)
  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (userFeeling.trim() && age.trim() && weeksPregnant.trim()) {
      setShowChat(true)
      // Automatically try to get location when chat starts
      getUserLocation()
    } else {
      toast.error("Please fill in all required fields.")
    }
  }

  const handleEndChat = () => {
    setShowChat(false)
    setMedicalDocs("")
    setUserFeeling("")
    setAge("")
    setWeeksPregnant("")
    setPreExistingConditions("")
    setSpecificConcerns("")
    setUserLocation("")
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI pregnancy care assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const prePrompt = `User Name: ${userName}.
Age: ${age}.
Weeks Pregnant: ${weeksPregnant}.
Pre-existing Conditions: ${preExistingConditions}.
Specific Concerns: ${specificConcerns}.
Medical Document Text: ${medicalDocs}.
User Feeling: ${userFeeling}.
User Location: ${userLocation || "Unknown"}.

You are a pregnancy care assistant. Keep this context in mind and always remember to customise your responses for India. If the user's location is provided, tailor your advice to that specific location when relevant.

User says: ${userMessage.text}

AI:`

    const payload = {
      contents: [{ parts: [{ text: prePrompt }] }],
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!response.ok)
        throw new Error(`API request failed: ${response.statusText}`)

      const data = await response.json()
      console.log("Full API response:", data)

      let candidateText = ""
      if (data.candidates?.length > 0) {
        candidateText = data.candidates[0].content?.parts?.[0]?.text || ""
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: candidateText.trim() || "I'm sorry, I couldn't generate a response.",
        sender: "bot",
        timestamp: new Date(),
      }
      
      // Set the force scroll flag before adding the bot message
      setShouldForceScroll(true)
      
      setMessages((prev) => [...prev, botMessage])
    } catch (error: any) {
      console.error("Error calling Gemini API:", error)
      
      // Set the force scroll flag before adding the error message
      setShouldForceScroll(true)
      
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          text: "Error: " + error.message,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }

  if (!showChat) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center dark:bg-slate-800 dark:bg-opacity-75 bg-gray-100 bg-opacity-75 z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg font-medium">Loading medical documents...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="max-w-4xl mx-auto">
          <motion.form
            onSubmit={handleStartChat}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-xl font-semibold">Before we begin...</h1>
            <div>
              <label className="block mb-1">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Happy",
                  "Sad",
                  "Anxious",
                  "Excited",
                  "Tired",
                  "Calm",
                  "Stressed",
                  "Energetic",
                ].map((feeling) => (
                  <Button
                    key={feeling}
                    type="button"
                    variant={userFeeling === feeling ? "default" : "outline"}
                    onClick={() => setUserFeeling(feeling)}
                  >
                    {feeling}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1">Your Age:</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block mb-1">Weeks Pregnant:</label>
              <Input
                type="number"
                value={weeksPregnant}
                onChange={(e) => setWeeksPregnant(e.target.value)}
                placeholder="Enter number of weeks"
              />
            </div>
            <div>
              <label className="block mb-1">
                Pre-existing Conditions (if any):
              </label>
              <Input
                value={preExistingConditions}
                onChange={(e) => setPreExistingConditions(e.target.value)}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </div>
            <div>
              <label className="block mb-1">Specific Concerns (if any):</label>
              <Input
                value={specificConcerns}
                onChange={(e) => setSpecificConcerns(e.target.value)}
                placeholder="e.g., Morning sickness, back pain"
              />
            </div>
            <Button type="submit">Start Chat</Button>
            <p className="text-sm text-muted-foreground">
              *Location detection will be used to provide personalized advice.
            </p>
          </motion.form>
          <ToastContainer />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col relative">
          <div className="p-4 border-b">
            <motion.h1
              className="text-xl font-semibold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Chat with MomCare AI
            </motion.h1>
            {userLocation && (
              <p className="text-sm text-muted-foreground">Location: {userLocation}</p>
            )}
          </div>
          <ScrollArea
            className="flex-1 p-4"
            onScroll={handleScroll}
            ref={scrollAreaRef}
          >
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
          <motion.form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </motion.form>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-20 right-4"
            >
              <Button variant="outline" onClick={scrollToBottom}>
                ↓
              </Button>
            </motion.div>
          )}
        </Card>
        <div className="mt-4 flex justify-center">
          <Button variant="destructive" onClick={handleEndChat}>
            End Chat
          </Button>
        </div>
        <ToastContainer />
      </div>
    </div>
  )
}