// src/pages/Termofuse.js
// Terms of Service page with enhanced UI/UX - hero, navigation, cards, and smooth UX
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, MailIcon } from '@heroicons/react/solid';

// Section data for table of contents and content
const SECTIONS = [
  { id: 'intro', title: 'Introduction', icon: '📋' },
  { id: 'usage', title: 'Use of Services', icon: '✅' },
  { id: 'account', title: 'Registration & Account', icon: '👤' },
  { id: 'changes', title: 'Changes to the Service', icon: '🔄' },
  { id: 'liability', title: 'Indemnification & Liability', icon: '⚖️' },
  { id: 'updates', title: 'Updates to the Terms', icon: '📝' },
  { id: 'contact', title: 'Contact', icon: '✉️' },
];

const Termofuse = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for active section and sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = SECTIONS.map((s) => document.getElementById(s.id));
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i] && sections[i].offsetTop <= scrollPos) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center animate-fadeIn">
              <DocumentTextIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                Terms of Service
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                By using the EcoTrade website, you agree to comply with the following terms and conditions. Please read these terms carefully before using the site.
              </p>
              <p className="text-blue-200 text-sm mt-4 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                Last updated: 16 Feb 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Table of Contents - Desktop */}
          <aside
            className={`hidden lg:block lg:w-64 flex-shrink-0 transition-all duration-300 ${
              isScrolled ? 'lg:sticky lg:top-24' : ''
            }`}
          >
            <nav className="rounded-xl bg-white/80 backdrop-blur p-4 shadow-lg border border-slate-200/60">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>On this page</span>
              </h3>
              <ul className="space-y-2">
                {SECTIONS.map(({ id, title, icon }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToSection(id)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-indigo-100 text-indigo-800 border-l-3 border-indigo-600'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            {/* Intro */}
            <section id="intro" className="scroll-mt-24">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60 card-hover">
                <p className="text-slate-600 leading-relaxed text-lg">
                  By using the EcoTrade website, you agree to comply with the following terms and conditions. Please read these terms carefully before using the site.
                </p>
              </div>
            </section>

            {/* Usage */}
            <section id="usage" className="scroll-mt-24">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✅</span>
                  <h2 className="text-2xl font-bold text-slate-800">Use of Services</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  You agree to use the website and the services provided for lawful purposes and in accordance with applicable laws and regulations. Misuse of the services or attempting unauthorized access is prohibited.
                </p>
              </div>
            </section>

            {/* Account */}
            <section id="account" className="scroll-mt-24">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">👤</span>
                  <h2 className="text-2xl font-bold text-slate-800">Registration & Account</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The information provided at registration must be accurate and up to date. EcoTrade reserves the right to terminate your account if false information is provided or these terms are violated.
                </p>
              </div>
            </section>

            {/* Changes */}
            <section id="changes" className="scroll-mt-24">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🔄</span>
                  <h2 className="text-2xl font-bold text-slate-800">Changes to the Service</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  EcoTrade may update, modify, or discontinue part of the services at any time without prior notice. We will not be liable for any impact that may result from these changes.
                </p>
              </div>
            </section>

            {/* Liability */}
            <section id="liability" className="scroll-mt-24">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚖️</span>
                  <h2 className="text-2xl font-bold text-slate-800">Indemnification & Liability</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  By using our services, you agree to indemnify EcoTrade against any claims or losses that may arise from misuse or violation of the terms.
                </p>
              </div>
            </section>

            {/* Updates */}
            <section id="updates" className="scroll-mt-24">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📝</span>
                  <h2 className="text-2xl font-bold text-slate-800">Updates to the Terms</h2>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The terms of service may be updated periodically. Your continued use of the website after modifications means you accept the amended terms.
                </p>
              </div>
            </section>

            {/* Contact CTA */}
            <section id="contact" className="scroll-mt-24">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6 sm:p-8 border-2 border-indigo-200/60">
                <div className="flex items-center gap-3 mb-4">
                  <MailIcon className="w-8 h-8 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-slate-800">Contact Us</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                  If you have any questions about the terms of service, please contact us via email:
                </p>
                <a
                  href="mailto:support@ecotrade.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MailIcon className="w-5 h-5" />
                  support@ecotrade.com
                </a>
                <div className="mt-6 pt-6 border-t border-indigo-200/60">
                  <Link
                    to="/support"
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    → Visit the Support Page
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Termofuse;
