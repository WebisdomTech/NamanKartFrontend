import {
  Phone,
  MessageCircle,
  Mail,
  ChevronDown,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";

export function TopUtilityBar() {
  return (
    <div className="bg-saffron text-white text-xs sm:text-sm font-medium border-b border-white/10 shadow-xs">
      <div className="container-page flex flex-wrap items-center justify-between py-1.5 sm:py-2 gap-y-1">
        {/* Left Section: Phone, WhatsApp, Support Email, Sales Email */}
        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-white/95">
          <a
            href="tel:+919311973199"
            className="flex items-center gap-1.5 hover:text-white hover:opacity-90 transition-all duration-200"
            title="Call Us"
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span>+91 93119 73199</span>
          </a>

          <span className="h-4 w-px bg-white/30 hidden sm:inline-block" aria-hidden="true" />

          <a
            href="https://wa.me/918796973199"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white hover:opacity-90 transition-all duration-200"
            title="WhatsApp Support"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>+91 87969 73199</span>
          </a>

          <span className="h-4 w-px bg-white/30 hidden md:inline-block" aria-hidden="true" />

          <a
            href="mailto:support@namandarshan.com"
            className="hidden md:flex items-center gap-1.5 hover:text-white hover:opacity-90 transition-all duration-200"
            title="Support & Grievance Email"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span>For Grievance: support@namandarshan.com</span>
          </a>

          <span className="h-4 w-px bg-white/30 hidden lg:inline-block" aria-hidden="true" />

          <a
            href="mailto:sales@namandarshan.com"
            className="hidden lg:flex items-center gap-1.5 hover:text-white hover:opacity-90 transition-all duration-200"
            title="Sales Email"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span>sales@namandarshan.com</span>
          </a>
        </div>

        {/* Right Section: Language Selector & Social Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Rounded Language Selector */}
          <div className="relative flex items-center">
            <select
              className="appearance-none bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold py-1 pl-3 pr-7 rounded-full cursor-pointer outline-none transition-colors border border-white/20"
              defaultValue="en"
              aria-label="Language Selector"
            >
              <option value="en" className="text-gray-900 bg-white">
                English
              </option>
              <option value="hi" className="text-gray-900 bg-white">
                हिंदी (Hindi)
              </option>
              <option value="sa" className="text-gray-900 bg-white">
                संस्कृतम् (Sanskrit)
              </option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-white absolute right-2.5 pointer-events-none" />
          </div>

          <span className="h-4 w-px bg-white/30" aria-hidden="true" />

          {/* Social Media Icons */}
          <div className="flex items-center gap-2.5 text-white/90">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="p-1 hover:text-white hover:scale-115 transition-all duration-200"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="p-1 hover:text-white hover:scale-115 transition-all duration-200"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="p-1 hover:text-white hover:scale-115 transition-all duration-200"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="p-1 hover:text-white hover:scale-115 transition-all duration-200"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
