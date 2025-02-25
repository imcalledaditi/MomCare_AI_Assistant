"use client"

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM"
]

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  const handleBookAppointment = () => {
    if (!date || !selectedTime) {
      toast.error("Please select both date and time")
      return
    }
    
    // Here you would typically make an API call to book the appointment
    toast.success("Appointment booked successfully!")
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          Schedule Your Appointment
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Date</h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Time</h2>
            <Select onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Notes</h3>
              <Textarea
                placeholder="Add any notes or specific concerns for your appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="mt-8">
              <h3 className="font-medium mb-2">Selected Appointment:</h3>
              <p className="text-muted-foreground">
                {date ? date.toLocaleDateString() : "No date selected"} {selectedTime ? `at ${selectedTime}` : ""}
              </p>
            </div>

            <Button
              className="w-full mt-6"
              onClick={handleBookAppointment}
              disabled={!date || !selectedTime}
            >
              Book Appointment
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}