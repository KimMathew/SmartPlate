import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">NutriPlan</h3>
          <p className="text-gray-600">
            Smart meal planning for a healthier life.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Product</h4>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-gray-600 hover:text-emerald-500">
                Features
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-600 hover:text-emerald-500">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-600 hover:text-emerald-500">
                Recipes
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-gray-600 hover:text-emerald-500">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-600 hover:text-emerald-500">
                Blog
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-600 hover:text-emerald-500">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Connect</h4>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-600 hover:text-emerald-500">
              <Facebook className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-600 hover:text-emerald-500">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-600 hover:text-emerald-500">
              <Instagram className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} NutriPlan. All rights reserved.</p>
      </div>
    </footer>
  );
}
