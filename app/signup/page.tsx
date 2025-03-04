"use client"

import { useState,useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createAccount, getCurrentUser} from '@/lib/appwrite'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
useEffect(() => {
    async function checkUser() {
      const user = await getCurrentUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router])
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setPhone(input)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullPhoneNumber = `+91${phone}`

    // Validate phone number: must start with '+' and have up to 15 digits
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(fullPhoneNumber)) {
      toast.error("Invalid phone number. It must start with '+' and have up to 15 digits, e.g., +14155552671.")
      return
    }
    if (!fullName.trim()) {
      toast.error("Full name is required.")
      return
    }

    setLoading(true)

    try {
      await createAccount(email, password, fullName, fullPhoneNumber)
      toast.success('Account created successfully!')
      router.push('/dashboard')
      router.refresh() // Ensures fresh data loading
      window.location.href = '/dashboard' // Forces a full page reload
    } catch (error) {
      toast.error('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Choose a strong password"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
      <span className="flex items-center justify-center px-3 text-sm text-gray-600 bg-gray-200 border-r border-gray-300 h-10">
        +91
      </span>
      <Input
        id="phone"
        type="text"
        required
        value={phone}
        onChange={handlePhoneChange}
        className="flex-1 h-10 px-3 text-base border-none focus:ring-0 focus:outline-none"
        placeholder="Enter phone number"
      />
    </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}