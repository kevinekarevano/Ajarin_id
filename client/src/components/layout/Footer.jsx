import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            
              <div className="w-35 mb-4 flex items-center justify-center">
                <img src="/public/icons/ajarin-icon.svg" alt="" />
              </div>
           
            <p className="text-slate-400 text-sm leading-relaxed">Platform pembelajaran peer-to-peer yang menghubungkan mentor dan learner untuk berbagi ilmu dan berkembang bersama.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Semua Kursus
                </Link>
              </li>
              <li>
                <Link to="/become-mentor" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Jadi Mentor
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategori</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses?category=programming" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Programming
                </Link>
              </li>
              <li>
                <Link to="/courses?category=design" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Design
                </Link>
              </li>
              <li>
                <Link to="/courses?category=business" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/courses?category=marketing" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Marketing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@ajarin.id</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">© 2025 Ajarin.id. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
