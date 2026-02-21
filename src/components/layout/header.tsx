'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Facebook, Instagram, Youtube } from 'lucide-react'

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" onClick={scrollToTop} className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Sarthak Group Tuition</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/about" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/courses" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Courses
          </Link>
          <Link href="/faculty" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Faculty
          </Link>
          <Link href="/testimonials" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Testimonials
          </Link>
          <Link href="/gallery" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Gallery
          </Link>
          <Link href="/contact" onClick={scrollToTop} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {/* Social Media Icons */}
          <div className="hidden lg:flex items-center space-x-2">
            <a 
              href="https://www.facebook.com/p/Sarthak-group-tuition-100050547206750/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a 
              href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a 
              href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="YouTube"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>

          {/* <Link href="/portal/login" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Portal Login
            </Button>
          </Link> */}
          <Link href="/enroll">
            <Button size="sm">
              Enroll Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

