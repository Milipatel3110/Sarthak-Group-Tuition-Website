'use client'

import { useState } from 'react'
import { Building, Users, Calendar, Plane, PartyPopper, Image, Facebook, Instagram, Youtube, ExternalLink, Folder, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Category = 'all' | 'building' | 'classroom' | 'results' | 'events' | 'trips' | 'parties' | 'social'

const categories = [
  { id: 'all', label: 'All', icon: Image },
  { id: 'building', label: 'Building', icon: Building },
  { id: 'classroom', label: 'Classrooms', icon: Users },
  { id: 'results', label: 'Results', icon: Image },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'trips', label: 'Trips', icon: Plane },
  { id: 'parties', label: 'Parties', icon: PartyPopper },
  { id: 'social', label: 'Social Media', icon: Image },
]

// Results folders: 2005-2025
const resultsYears = Array.from({ length: 21 }, (_, i) => 2005 + i).reverse()

// Events folders: 2007-2025
const eventYears = Array.from({ length: 19 }, (_, i) => 2007 + i).reverse()

// Trips folders: 2007-2025
const tripYears = Array.from({ length: 19 }, (_, i) => 2007 + i).reverse()

// Static images for building and classroom (permanent images)
const staticImages = [
  { id: 1, title: "Sarthak Group Tuition Building", category: "building", image: "/gallery/building/building-1.jpg", description: "Our modern infrastructure" },
  { id: 2, title: "Reception Area", category: "building", image: "/gallery/building/reception.jpg", description: "Welcome to our center" },
  { id: 3, title: "Study Hall", category: "classroom", image: "/gallery/classroom/study-hall.jpg", description: "Conducive learning environment" },
  { id: 4, title: "Classroom", category: "classroom", image: "/gallery/classroom/classroom-1.jpg", description: "Modern classroom setup" },
]

// Party images (static)
const partyImages = [
  { id: 1, title: "Birthday Celebration", category: "parties", image: "/gallery/parties/birthday.jpg", description: "Student birthday treat" },
  { id: 2, title: "Farewell Party", category: "parties", image: "/gallery/parties/farewell.jpg", description: "Farewell Class 10" },
  { id: 3, title: "Annual Celebration", category: "parties", image: "/gallery/parties/annual.jpg", description: "Annual celebration" },
]

// Helper to get folder images - returns array of images in a folder
const getFolderImages = (category: string, year: number): string[] => {
  // This function would dynamically import images from the folder
  // For now, return placeholder paths that user can populate
  // The actual images will be stored in /public/gallery/{category}/{year}/
  return []
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const getYears = (category: string) => {
    switch (category) {
      case 'results': return resultsYears
      case 'events': return eventYears
      case 'trips': return tripYears
      default: return []
    }
  }

  const showYears = ['results', 'events', 'trips'].includes(activeCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Glimpses of our infrastructure, events, trips, and celebrations at Sarthak Group Tuition.
          </p>
        </div>
      </section>

      {/* Social Media Links Section */}
      <section className="py-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="https://www.facebook.com/arpanpatel.mulchandbhai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors font-semibold"
            >
              <Facebook className="h-5 w-5" />
              <span>Facebook</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a 
              href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-full hover:bg-gray-100 transition-colors font-semibold"
            >
              <Instagram className="h-5 w-5" />
              <span>Instagram</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a 
              href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-colors font-semibold"
            >
              <Youtube className="h-5 w-5" />
              <span>YouTube</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-center text-white/80 mt-4">
            Follow us on social media for daily updates, event photos, and educational content!
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white shadow-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as Category)
                  setSelectedYear(null)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          {selectedYear && (
            <button
              onClick={() => setSelectedYear(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Years
            </button>
          )}

          {/* Year Selection */}
          {showYears && !selectedYear && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {activeCategory === 'results' && 'Student Results'}
                {activeCategory === 'events' && 'Annual Functions & Events'}
                {activeCategory === 'trips' && 'Educational Trips'}
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Browse through our {activeCategory} by year. Click on a year to view photos.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {getYears(activeCategory).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
                  >
                    <Folder className="h-12 w-12 text-blue-600 mb-2" />
                    <span className="text-lg font-semibold text-gray-800">{year}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {activeCategory === 'results' && 'View Results'}
                      {activeCategory === 'events' && 'View Photos'}
                      {activeCategory === 'trips' && 'View Photos'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Year Detail View */}
          {selectedYear && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {activeCategory === 'results' && `Results - ${selectedYear}`}
                {activeCategory === 'events' && `Annual Function - ${selectedYear}`}
                {activeCategory === 'trips' && `Trip - ${selectedYear}`}
              </h2>
              <div className="bg-white rounded-lg p-8 text-center">
                <Folder className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Photos from {selectedYear}</h3>
                <p className="text-gray-600 mb-4">
                  Add your photos to <code className="bg-gray-100 px-2 py-1 rounded">/public/gallery/{activeCategory}/{selectedYear}/</code> folder
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, WebP
                </p>
                {/* Preview existing images if any */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Images will be loaded from the folder dynamically */}
                </div>
              </div>
            </div>
          )}

          {/* Static Images (Building, Classroom, Parties) */}
          {!showYears && activeCategory !== 'social' && !selectedYear && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(activeCategory === 'all' ? staticImages : staticImages.filter(img => img.category === activeCategory)).map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer bg-gray-200"
                  onClick={() => setSelectedImage(image.image)}
                >
                  <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold">{image.title}</h3>
                      <p className="text-white/80 text-sm">{image.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Media */}
          {activeCategory === 'social' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Visit Our Social Media Pages</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                We regularly post photos, videos, and updates on our social media platforms. 
                Click the links above to visit our pages and see more photos from our events, trips, and celebrations!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a 
                  href="https://www.facebook.com/arpanpatel.mulchandbhai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Facebook className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-lg">Facebook</h3>
                  <p className="text-gray-600 text-sm">Event photos & updates</p>
                </a>
                <a 
                  href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Instagram className="h-12 w-12 mx-auto mb-4 text-pink-600" />
                  <h3 className="font-semibold text-lg">Instagram</h3>
                  <p className="text-gray-600 text-sm">Reels, stories & highlights</p>
                </a>
                <a 
                  href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Youtube className="h-12 w-12 mx-auto mb-4 text-red-600" />
                  <h3 className="font-semibold text-lg">YouTube</h3>
                  <p className="text-gray-600 text-sm">Video lectures & recordings</p>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Gallery"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}

