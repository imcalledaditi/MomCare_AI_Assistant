import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, MessageCircle, Phone, BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px]">
        <Image
          src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80"
          alt="Pregnant woman"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your AI Companion for a Healthy Pregnancy Journey
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Get personalized antenatal care advice, appointment reminders, and 24/7 support
            </p>
            <Button size="lg" asChild className="text-lg">
              <Link href="/signup">Start Chatting Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Care at Your Fingertips
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6">
              <MessageCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Chatbot</h3>
              <p className="text-muted-foreground">
                24/7 access to personalized pregnancy advice and support
              </p>
            </Card>
            <Card className="p-6">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Appointment Scheduling</h3>
              <p className="text-muted-foreground">
                Easy booking and reminders for your antenatal appointments
              </p>
            </Card>
            <Card className="p-6">
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Educational Resources</h3>
              <p className="text-muted-foreground">
                Access to comprehensive pregnancy and childbirth information
              </p>
            </Card>
            <Card className="p-6">
              <Phone className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Emergency Support</h3>
              <p className="text-muted-foreground">
                Immediate access to emergency contacts and urgent care guidance
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Your Supported Pregnancy Journey Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of expecting mothers who trust MomCare AI for their antenatal care needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}