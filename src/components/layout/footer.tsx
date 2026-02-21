'use client'

import Link from 'next/link'
import { GraduationCap, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Sarthak Group Tuition</span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering students with quality education and personalized learning. 
              Join us to achieve academic excellence.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/p/Sarthak-group-tuition-100050547206750/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/courses" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Courses</Link>
              </li>
              <li>
                <Link href="/faculty" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Faculty</Link>
              </li>
              <li>
                <Link href="/gallery" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Gallery</Link>
              </li>
              <li>
                <Link href="/enroll" onClick={scrollToTop} className="hover:text-blue-400 transition-colors">Enroll Now</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                <span>12, Janakpuri Society, Nigam Smruti Mandir Road, Ghodasar, Ahmedabad, Gujarat 380050</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-400" />
                <span>+91 9328705157</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-400" />
                <span>+91 7984433287</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>arpanmpatel31@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>sarthak.computer@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Office Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Monday - Saturday</span>
                <span className="text-blue-400">8:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-blue-400">8:00 AM - 12:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Sarthak Group Tuition. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

