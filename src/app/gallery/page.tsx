'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Building2, Users, Calendar, Plane, PartyPopper, Trophy, ImageIcon, Facebook, Instagram, Youtube, ExternalLink, ChevronLeft, X } from 'lucide-react'

type CategoryId = 'all' | 'BUILDING' | 'CLASSROOM' | 'EVENTS' | 'TRIPS' | 'PARTIES' | 'RESULTS' | 'social'

interface GalleryImage {
  id: string
  title: string
  category: string
  imageUrl: string
  description: string | null
  date: string
}

const categories = [
  { id: 'all',       label: 'All',       icon: ImageIcon   },
  { id: 'BUILDING',  label: 'Building',  icon: Building2   },
  { id: 'CLASSROOM', label: 'Classrooms',icon: Users       },
  { id: 'EVENTS',    label: 'Events',    icon: Calendar    },
  { id: 'TRIPS',     label: 'Trips',     icon: Plane       },
  { id: 'PARTIES',   label: 'Parties',   icon: PartyPopper },
  { id: 'RESULTS',   label: 'Results',   icon: Trophy      },
  { id: 'social',    label: 'Social',    icon: ExternalLink},
]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  // For EVENTS/TRIPS: group by year
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  // Lightbox
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)

  const showYearFolders = (activeCategory === 'EVENTS' || activeCategory === 'TRIPS' || activeCategory === 'RESULTS') && !selectedYear

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const url = activeCategory === 'all' || activeCategory === 'social'
          ? '/api/gallery'
          : `/api/gallery?category=${activeCategory}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.success) setImages(data.gallery)
      } catch {
        setImages([])
      } finally {
        setLoading(false)
      }
    }
    if (activeCategory !== 'social') load()
    else { setImages([]); setLoading(false) }
    setSelectedYear(null)
  }, [activeCategory])

  // Get unique years from images for year-folder view
  const availableYears = [...new Set(
    images.map(img => new Date(img.date).getFullYear())
  )].sort((a, b) => b - a)

  // Filter images shown in grid
  const visibleImages = (() => {
    if (activeCategory === 'all') return images
    if (selectedYear) {
      return images.filter(img => new Date(img.date).getFullYear() === selectedYear)
    }
    return images
  })()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Glimpses of our infrastructure, events, trips, and celebrations at Sarthak Group Tuition.
          </p>
        </div>
      </section>

      {/* Social media bar */}
      <section className="py-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.facebook.com/arpanpatel.mulchandbhai" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors font-semibold text-sm">
              <Facebook className="h-4 w-4" /> Facebook <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-pink-600 rounded-full hover:bg-gray-100 transition-colors font-semibold text-sm">
              <Instagram className="h-4 w-4" /> Instagram <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-full hover:bg-gray-100 transition-colors font-semibold text-sm">
              <Youtube className="h-4 w-4" /> YouTube <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-6 bg-white shadow-sm sticky top-16 z-40 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id as CategoryId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery content */}
      <section className="py-12 bg-gray-50 min-h-[50vh]">
        <div className="container mx-auto px-4">

          {/* Social media tab */}
          {activeCategory === 'social' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Visit Our Social Media Pages</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                We regularly post photos, videos, and updates on our social media platforms.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <a href="https://www.facebook.com/arpanpatel.mulchandbhai" target="_blank" rel="noopener noreferrer"
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <Facebook className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold text-lg">Facebook</h3>
                  <p className="text-gray-500 text-sm mt-1">Event photos & updates</p>
                </a>
                <a href="https://www.instagram.com/explore/locations/167399386675496/sarthak-group-tuition/recent/?hl=af" target="_blank" rel="noopener noreferrer"
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <Instagram className="h-12 w-12 mx-auto mb-4 text-pink-600" />
                  <h3 className="font-semibold text-lg">Instagram</h3>
                  <p className="text-gray-500 text-sm mt-1">Reels, stories & highlights</p>
                </a>
                <a href="https://www.youtube.com/@sarthakgrouptuitionarpansi9369" target="_blank" rel="noopener noreferrer"
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <Youtube className="h-12 w-12 mx-auto mb-4 text-red-600" />
                  <h3 className="font-semibold text-lg">YouTube</h3>
                  <p className="text-gray-500 text-sm mt-1">Video lectures & recordings</p>
                </a>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && activeCategory !== 'social' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          )}

          {/* Year folder view for Events / Trips */}
          {!loading && showYearFolders && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-center">
                {activeCategory === 'EVENTS' ? 'Annual Functions & Events' : activeCategory === 'TRIPS' ? 'Educational Trips' : 'Results'}
              </h2>
              <p className="text-center text-gray-500 mb-8">Click on a year to view photos</p>
              {availableYears.length === 0 ? (
                <EmptyState category={activeCategory} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {availableYears.map((year) => {
                    const count = images.filter(img => new Date(img.date).getFullYear() === year).length
                    const thumb = images.find(img => new Date(img.date).getFullYear() === year)
                    return (
                      <button key={year} onClick={() => setSelectedYear(year)}
                        className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 aspect-square bg-gray-200">
                        {thumb && (
                          <Image src={thumb.imageUrl} alt={`${year}`} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-200" />
                        )}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                          <span className="text-white text-2xl font-bold">{year}</span>
                          <span className="text-white/80 text-xs mt-1">{count} photo{count !== 1 ? 's' : ''}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Back button when viewing year */}
          {selectedYear && (
            <div className="mb-6">
              <button onClick={() => setSelectedYear(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                <ChevronLeft className="h-5 w-5" />
                Back to {activeCategory === 'EVENTS' ? 'Events' : activeCategory === 'TRIPS' ? 'Trips' : 'Results'}
              </button>
              <h2 className="text-xl font-bold mt-3">
                {activeCategory === 'EVENTS' ? `Annual Function — ${selectedYear}` : activeCategory === 'TRIPS' ? `Trip — ${selectedYear}` : `Results — ${selectedYear}`}
                <span className="text-sm font-normal text-gray-500 ml-2">({visibleImages.length} photos)</span>
              </h2>
            </div>
          )}

          {/* Regular image grid */}
          {!loading && !showYearFolders && activeCategory !== 'social' && (
            <>
              {visibleImages.length === 0 ? (
                <EmptyState category={activeCategory} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {visibleImages.map((img) => (
                    <div key={img.id}
                      className="group relative aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer bg-gray-200"
                      onClick={() => setLightbox(img)}>
                      <Image
                        src={img.imageUrl}
                        alt={img.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs font-semibold line-clamp-2">{img.title}</p>
                          {img.description && (
                            <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{img.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full" style={{ maxHeight: '80vh' }}>
              <img src={lightbox.imageUrl} alt={lightbox.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            </div>
            <div className="mt-3 text-center">
              <p className="text-white font-semibold">{lightbox.title}</p>
              {lightbox.description && (
                <p className="text-white/60 text-sm mt-1">{lightbox.description}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                {new Date(lightbox.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ category }: { category: string }) {
  return (
    <div className="text-center py-16">
      <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">No photos yet</p>
      <p className="text-sm text-gray-400 mt-1">Photos will appear here once uploaded by the admin</p>
    </div>
  )
}
