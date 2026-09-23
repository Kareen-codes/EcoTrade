import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MoonIcon, SunIcon } from "@heroicons/react/outline";
import logo from "../assets/images/ecomate-logo.svg";

/**
 * EcoMate AI navbar for the homepage, Feed and Playground pages.
 *
 * - Bookmarks (#home, #why, #contact) work on the homepage AND from other
 *   pages (navigates home, then smooth-scrolls to the section).
 * - Playground and Feed are separate routes (/playground, /feed).
 * - Sign In stays as the auth entry point — no backend/auth flow touched.
 * - Moon icon toggles dark mode via Tailwind's `class` strategy.
 */
const HomeNavbar = () => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("ecomate-theme") === "dark"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("ecomate-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bookmark links: smooth-scroll on the homepage; from other pages, go
  // home first then scroll to the target section.
  const goToSection = (e, href) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const scroll = () => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scroll, 200);
    } else {
      scroll();
    }
  };

  // Home | Our Why (bookmarks) + Playground | Feed (routes) + Contact Us
  const links = [
    { label: "Home", href: "#home" },
    { label: "Our Why", href: "#why" },
    { label: "Playground", to: "/playground" },
    { label: "Feed", to: "/feed" },
    { label: "Contact Us", href: "#contact" },
  ];

  const isActive = (link) =>
    link.to ? location.pathname === link.to : location.pathname === "/" && location.hash === link.href;

  return (
    <header
      className={`sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b transition-shadow ${
        isScrolled ? "shadow-md border-gray-100 dark:border-gray-800" : "border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logo}
            alt="EcoMate AI"
            className="h-9 w-9 rounded-xl transform group-hover:scale-105 transition-transform"
          />
          <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            EcoMate<span className="text-green-500"> AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link)
                    ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-300"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => goToSection(e, link.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link)
                    ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-300"
                }`}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Theme toggle + auth buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-300 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Sign In (same route as before) */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-1">
          {links.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg ${
                  isActive(link)
                    ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-300"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => goToSection(e, link.href)}
                className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-300"
              >
                {link.label}
              </a>
            )
          )}
          <div className="pt-2">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeNavbar;
