'use client'

import { useState } from 'react'
import { Building, Users, Calendar, Plane, PartyPopper, Image, Facebook, Instagram, Youtube, ExternalLink } from 'lucide-react'
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

const galleryImages = [
  { id: 1, title: "Sarthak Group Tuition Building", category: "building", image: "https://lh3.googleusercontent.com/p/AF1QipPvkUcHyFwRrNaNSfQk7EunbFLinxYSRIYNZ0qA=s680-w680-h510-rw", description: "Our modern infrastructure" },
  { id: 2, title: "Reception Area", category: "building", image: "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqviHdwy4h-dewLV0-YrfK9Z5Y3GOByKL7xicJjMiK1MZkz5n9u_kdgcfD6rC0dgXZKrudGE8NW4SohaDMYtViP9eeEqAVpdGf_phFjUWXaMQtzDAbr7PK-stB8AbQIVpgOfxM1=s680-w680-h510-rw", description: "Welcome to our center" },
  { id: 3, title: "Results", category: "results", image: "https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-6/494523731_9869446669778713_1871065335037838136_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_ohc=KPWJh39EdN0Q7kNvwHaAu2-&_nc_oc=Adly5nU6AV3yrgOdfxo_aVirpk0P0bhq3utWg4rQJGkM3ZcelEMIi54ejWYjz_-fV9nkFpiPhU9akqlgwd0WAAJ9&_nc_zt=23&_nc_ht=scontent-dfw5-2.xx&_nc_gid=k7QseKf830n2Nb-X7B31zg&oh=00_AfvYsUFXd-umhuq9VpC0d4WN_qS2_agKQNvNrEL1qVVxiQ&oe=699EC7CC", description: "Class-12th Science Board Result" },
  { id: 4, title: "Results", category: "results", image: "https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/494537784_9869446559778724_5393004739131564713_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=13d280&_nc_ohc=C9aj9WAfmSMQ7kNvwG0JS_D&_nc_oc=Adl_iNC-KxHPF5CCWqK0obhxFUhMQ-oYjx7pcDR0OcjE-jyaK6ZceHjurSzaEb4lcoS1dUMpjRjabDFkQ8M3dk9b&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=SDm2mSRjSPxZwc1RN-wwKQ&oh=00_AfvJ1gUT9FLwCGfakMg3cSUdodsmaTOQ1hQh_py1B2u-AA&oe=699ECD0E", description: "Class-12th Science Board Result" },
  { id: 5, title: "Study Hall", category: "classroom", image: "https://scontent-dfw6-1.xx.fbcdn.net/v/t39.30808-6/421831753_7225673174156089_1164532896959541347_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=13d280&_nc_ohc=CICdKED7SkAQ7kNvwH2NWFp&_nc_oc=AdlW75P43R_EDBrrCHvezQzQpVYTJUdBtvrb8dfunhh5bCwbcefbgQXO9iCAbD4unmwiePzh3_qY-cCIxyu0eaYg&_nc_zt=23&_nc_ht=scontent-dfw6-1.xx&_nc_gid=l7uya2pPMQej3RfruA0gxg&oh=00_AftMdUe6z1UX9Nlkl0qv1MBgXiV-PG1fXtgYVnBPGuAm6w&oe=699EE9BE", description: "Conducive learning environment" },
  { id: 6, title: "Annual Function 2025", category: "events", image: "https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/475458698_9267678149955571_4201150603901734121_n.jpg?stp=c0.225.1365.1365a_dst-jpg_s552x414_tt6&_nc_cat=110&ccb=1-7&_nc_sid=5df8b4&_nc_ohc=F3ZtkAped6IQ7kNvwGIZFg7&_nc_oc=AdmXUDGaKb_MLAWjPGGwsXWXFkAHRpoQQBz7eOV-kS8URKtOqAtRZXt_lFIlQbZNyRJhZx4f7zn0cRQFXP0mZ3xV&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=bSDXzarMgxiN6jMYZm_VDw&oh=00_AftlWwLjjMbSmjuI6UTI-ggE7QOqMslymoGlfK1eRLPldQ&oe=699EDC21", description: "Annual day celebration" },
  { id: 7, title: "Annual Function 2025", category: "events", image: "https://scontent-dfw6-1.xx.fbcdn.net/v/t39.30808-6/475440977_9267711836618869_5525223711184510423_n.jpg?stp=c342.0.1365.1365a_dst-jpg_s552x414_tt6&_nc_cat=103&ccb=1-7&_nc_sid=5df8b4&_nc_ohc=AD_2nnl-gzoQ7kNvwGFQt5j&_nc_oc=AdlGVPRPLDDvnC9iLkDq-aSk79IuUbYVt15QhlUL2tLCfFVPruE0quhXyx9rJweDrNEgwEHaHXJZWvtbQTExYHET&_nc_zt=23&_nc_ht=scontent-dfw6-1.xx&_nc_gid=tUp9T1e-rdBLsnhBi2JvqQ&oh=00_Aft1c7FuuafmrueZ5nah6CJOLYdJ4gk9HHSf96NYnhoDzA&oe=699EF4D5", description: "Annual day celebration" },
  { id: 8, title: "Annual Function 2025", category: "events", image: "https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-6/475407540_9267524729970913_8740383464659076825_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=7b2446&_nc_ohc=6jp7I27PqtwQ7kNvwF-pYEj&_nc_oc=AdkzMtVR9rUM1iSxwOPe430kjumzOhyuE89ALiWLAI0sSHmIMG0g-PAd96vln7IkZu-2_n1e_4HAgM5qzBLQB5uH&_nc_zt=23&_nc_ht=scontent-dfw5-2.xx&_nc_gid=GNNY9zz_g1OKyW9tA4MFuQ&oh=00_Aful-wyANM13sn3qrrcQaYnATLtK5dD41y8IQGTTq34Qxw&oe=699EEB6A", description: "Annual day celebration" },
  { id: 9, title: "Desert trip", category: "trips", image: "https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/471496033_9070993892957332_4867443697619118230_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=ZvWEVAAn5ToQ7kNvwEoDWKp&_nc_oc=AdmEt6sHMGTRLh_mgxhhJLRunE09dysZNrkFagLINkNCkOZtS-RqganjfZOaoje01r9o7dyycmTEr-8aHajttmv0&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=b5DpGd4OSZ8dqLvCNn0mZw&oh=00_AftztbOcABMiwZcSSX0ecg5NBMkIXi5UksOAtEzx-RbjWA&oe=699EDC53", description: "Jaisalmer Trip" },
  { id: 10, title: "Desert trip", category: "trips", image: "https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/471569965_9070993712957350_1932697757290544695_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=fQL-sCOM3l4Q7kNvwGetrfD&_nc_oc=Adk9aQBUBdsFJfgYZuVUuSIjxPVfehY9d1tRawHDinF7v6dgB26JzVoe0BlE9xml2tr6LAA2J7WzPasNSfoZLGt4&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=fQWhk9K7FiWQKITfkFt8WA&oh=00_Afv_RRGD_Kncrhb1FJHQ7BCMOI1JsRRFOHDC70qkLQ4p2g&oe=699EE528", description: "Jaisalmer Trip" },
  { id: 11, title: "Picnic", category: "trips", image: "https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/413015402_7155503067839767_6347418177857495005_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=Twltp81i09MQ7kNvwEgPOZR&_nc_oc=Adn8duv2KLy4WFuVdsw6dP2UZbnZ2nu_iTdwx3cjDtB0ZEZ5jUkcCoE0z0yQjCSyZx8T3hmjxr6-JNi6osbK49ro&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=auEV_CNcM7KP9eZpcCIzPw&oh=00_AftGxhz-nom96FobcyYdn2IOOnm9oEYqov1vTlOxVq9eFg&oe=699EC43F", description: "Fun outing with friends" },
  { id: 12, title: "Birthday Celebration", category: "parties", image: "https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/490296220_9703558843034164_3721854879763363664_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=EG--9VjxCBUQ7kNvwHXIMOH&_nc_oc=AdnGzlvDKugKG-vbHofoh1E5TBXv_KkihBOKkkQYOrJSUCe_14i8yBayA-PEhmh8h-2Pw0qhVx4H1eAuj9NCOPku&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=BRCj_6f3hCW06OCwSO4mOA&oh=00_AftmxftaCVDNUkrDDbut0UzbSfNGvX5cIikl8IW87MjPaA&oe=699EDE26", description: "Student birthday treat" },
  { id: 13, title: "Farewell Party", category: "parties", image: "https://scontent-dfw6-1.xx.fbcdn.net/v/t39.30808-6/433684858_7458006754256062_7068816564951938277_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=QneQGeFhY74Q7kNvwHBhe0I&_nc_oc=AdmMqMMKK4pxWCD59dRb5WJlQfRzggl9r7XnQdBnhWt9anT2FgYevPtZ1bCAwlSLnYocIne9cNhOuzlDNy0ChC91&_nc_zt=23&_nc_ht=scontent-dfw6-1.xx&_nc_gid=DjQ2-lVnzjnt0BEIZU5kYw&oh=00_AfusoUn3Mmxlow4hX4ELuI0fheGY4nCW-SYs9pufSZAPhw&oe=699ECB37", description: "Farewell Class10" },
  // Social Media Images (placeholder - replace with actual screenshots from social media)
  { id: 14, title: "Facebook Photos", category: "social", image: "https://images.unsplash.com/photo-1633675254053-d96c7668c3b8?w=800", description: "Visit our Facebook page for more photos" },
  { id: 15, title: "Instagram Reels", category: "social", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800", description: "Follow us on Instagram for daily updates" },
  { id: 16, title: "YouTube Channel", category: "social", image: "https://images.unsplash.com/photo-1614670958788-b0c66e7d6376?w=800", description: "Subscribe to our YouTube channel" },
]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)

  const filteredImages = activeCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory)

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
                onClick={() => setActiveCategory(cat.id as Category)}
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

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {activeCategory === 'social' ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image}
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
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
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-white">{selectedImage.title}</h3>
              <p className="text-gray-300">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

