"use client";

export function FooterSection() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-gray-400">
            About Us
          </a>
          <a href="#" className="hover:text-gray-400">
            Contact Us
          </a>
          <a href="#" className="hover:text-gray-400">
            Privacy
          </a>
        </div>
        <p className="text-sm">&copy; 2025 JobBoard. All rights reserved.</p>
      </div>
    </footer>
  );
}
