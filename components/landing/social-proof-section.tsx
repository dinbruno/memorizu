"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Wedding Planner",
    avatar: "/placeholder.svg?height=60&width=60&query=professional woman smiling",
    rating: 5,
    text: "Memorizu transformed how I create wedding pages for my clients. The drag-and-drop builder is incredibly intuitive, and the templates are absolutely gorgeous. My clients love the interactive features!",
    event: "Created 50+ wedding pages",
  },
  {
    name: "Michael Chen",
    role: "Event Organizer",
    avatar: "/placeholder.svg?height=60&width=60&query=asian man professional headshot",
    rating: 5,
    text: "I've used many page builders, but Memorizu is specifically designed for events and it shows. The effects like falling confetti and the countdown timers make every page feel special and engaging.",
    event: "Birthday party for 200 guests",
  },
  {
    name: "Emily Rodriguez",
    role: "New Mom",
    avatar: "/placeholder.svg?height=60&width=60&query=hispanic woman smiling warmly",
    rating: 5,
    text: "Creating our baby shower page was so easy! I'm not tech-savvy at all, but within 30 minutes I had a beautiful page with photo galleries and guest messages. Everyone was impressed!",
    event: "Baby shower celebration",
  },
  {
    name: "David Thompson",
    role: "Corporate Event Manager",
    avatar: "/placeholder.svg?height=60&width=60&query=business man professional photo",
    rating: 5,
    text: "For our company's 10th anniversary, we needed something special. Memorizu delivered beyond expectations. The professional templates and customization options made our event page stand out.",
    event: "Corporate anniversary event",
  },
  {
    name: "Lisa Park",
    role: "Party Enthusiast",
    avatar: "/placeholder.svg?height=60&width=60&query=young woman happy expression",
    rating: 5,
    text: "I've created pages for birthdays, graduations, and family reunions. Each time, guests are amazed by how professional and fun the pages look. Memorizu makes me look like a design pro!",
    event: "Family reunion for 80 people",
  },
  {
    name: "James Wilson",
    role: "Nonprofit Coordinator",
    avatar: "/placeholder.svg?height=60&width=60&query=middle aged man friendly smile",
    rating: 5,
    text: "Our fundraising gala page created with Memorizu helped us exceed our donation goals. The interactive elements and beautiful design really engaged our supporters and made sharing easy.",
    event: "Charity fundraising gala",
  },
];

const stats = [
  { value: "10,000+", label: "Pages Created", description: "Beautiful event pages built by our users" },
  { value: "500,000+", label: "Happy Guests", description: "People who visited pages made with Memorizu" },
  { value: "4.9/5", label: "User Rating", description: "Average rating from our satisfied customers" },
  { value: "2 min", label: "Average Setup", description: "Time it takes to create your first page" },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                className="text-3xl md:text-4xl font-bold text-primary mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                {stat.value}
              </motion.div>
              <div className="font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </motion.div>

        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">💬 What Our Users Say</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Event Creators
              <br />
              <span className="memorizu-gradient-text">Worldwide</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Don't just take our word for it. Here's what real users say about creating their special event pages with Memorizu.
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary/30 mb-4" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

              {/* Event Badge */}
              <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full inline-block mb-4">{testimonial.event}</div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Join Our Happy Community</h3>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Start creating beautiful event pages today and see why thousands of users choose Memorizu for their special moments.
            </p>
            <motion.button
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your First Page Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
