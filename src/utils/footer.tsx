"use client";

import Link from "next/link";
import {
  Briefcase,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
  Globe,
  MessageCircle,
  Users,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  JobBoard
                </span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Connecting exceptional talent with outstanding opportunities.
                Your career journey starts here with personalized job matching
                and professional growth opportunities.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { icon: Globe, href: "#", label: "Website" },
                  { icon: MessageCircle, href: "#", label: "Twitter" },
                  { icon: Users, href: "#", label: "LinkedIn" },
                  { icon: Camera, href: "#", label: "Instagram" },
                ].map(({ icon: Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="w-10 h-10 bg-slate-700 hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Find Jobs", href: "/dashboard" },
                  { label: "Post a Job", href: "/jobs/job-form" },
                  { label: "Browse Companies", href: "/companies" },
                  { label: "Career Advice", href: "/career-advice" },
                  { label: "Salary Guide", href: "/salary-guide" },
                  { label: "Resume Builder", href: "/resume-builder" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-3">
                {[
                  { label: "Help Center", href: "/help" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookies" },
                  { label: "FAQ", href: "/faq" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">
                Stay Connected
              </h3>

              {/* Newsletter Signup */}
              <div className="mb-8">
                <p className="text-slate-300 mb-4">
                  Get the latest job opportunities and career tips delivered to
                  your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 whitespace-nowrap">
                    Subscribe
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span>support@jobboard.com</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span>
                    123 Business Ave, Suite 100
                    <br />
                    New York, NY 10001
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-slate-300">
                <span>&copy; 2025 JobBoard. All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center space-x-1">
                  <span>Built with</span>
                  <Heart className="h-4 w-4 text-red-400 fill-current" />
                  <span>for connecting talent and opportunity</span>
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <Link
                  href="/sitemap"
                  className="hover:text-blue-400 transition-colors"
                >
                  Sitemap
                </Link>
                <Link
                  href="/accessibility"
                  className="hover:text-blue-400 transition-colors"
                >
                  Accessibility
                </Link>
                <Link
                  href="/security"
                  className="hover:text-blue-400 transition-colors"
                >
                  Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Compact Footer for internal pages
export function CompactFooter() {
  return (
    <footer className="bg-slate-800 text-white py-8 border-t border-slate-700">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Company Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              JobBoard
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/help"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Help
            </Link>
            <Link
              href="/privacy"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-slate-300 hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <span>&copy; 2025 JobBoard</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-400 fill-current" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
