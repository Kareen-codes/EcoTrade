// src/pages/SupportPage.js
// Support page with FAQ accordion, quick links, and contact info - enhanced UI/UX
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  SupportIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/solid';

// FAQ data
const FAQ_ITEMS = [
  {
    id: 1,
    question: 'How can I create a scrap selling request?',
    answer:
      'Log in to your account, then go to the requests page. You will find a "Create New Request" button where you can enter the details of the scrap you want to sell.',
  },
  {
    id: 2,
    question: 'How do I participate in auctions?',
    answer:
      'Go to the auctions page, choose the auction you are interested in, then enter the auction room. You can bid during the auction\'s scheduled time.',
  },
  {
    id: 3,
    question: 'How do I track the status of my request?',
    answer:
      'You can follow the status of your requests from the requests page. All your requests will be displayed with their current status (under review, accepted, rejected, etc.).',
  },
  {
    id: 4,
    question: 'Can I edit or cancel my request?',
    answer:
      'It depends on the request status. If the request is under review, contact us via the support page or email to request an edit or cancellation.',
  },
  {
    id: 5,
    question: 'What payment methods are available?',
    answer:
      'We accept payment in Euros or Syrian Pounds depending on the agreement with the site management. You will be informed of the details when the request is confirmed.',
  },
  {
    id: 6,
    question: 'How do I contact the support team?',
    answer:
      'You can use the contact form below, or reach us via email at support@ecotrade.com or the phone number listed in the contact information section.',
  },
];

// Quick help links
const QUICK_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheckIcon, color: 'emerald' },
  { to: '/terms-of-service', label: 'Terms of Service', icon: DocumentTextIcon, color: 'indigo' },
  { to: '/developers', label: 'Developer Info', icon: AcademicCapIcon, color: 'violet' },
  { to: '/contact', label: 'Contact the Managers', icon: UserGroupIcon, color: 'blue' },
];

const SupportPage = () => {
  const [openFaqId, setOpenFaqId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/messages/send-message`, {
        customerName: name,
        email,
        message,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while sending the message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    violet: 'bg-violet-500/10 text-violet-600 border-violet-200',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center animate-fadeIn">
              <SupportIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                Support Center
              </h1>
              <p className="text-amber-50 text-lg max-w-2xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                We are here to help you! Browse the frequently asked questions or contact us directly for support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Quick Links */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <DocumentTextIcon className="w-7 h-7 text-amber-500" />
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-hover ${colorClasses[color]}`}
              >
                <Icon className="w-8 h-8 flex-shrink-0" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <SupportIcon className="w-7 h-7 text-amber-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white shadow-lg border border-slate-200/60 overflow-hidden transition-all duration-200 hover:shadow-xl"
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-semibold text-slate-800">{item.question}</span>
                  {openFaqId === item.id ? (
                    <ChevronUpIcon className="w-5 h-5 flex-shrink-0 text-amber-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 flex-shrink-0 text-slate-400" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqId === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <MailIcon className="w-7 h-7 text-amber-500" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <a
                href="mailto:support@ecotrade.com"
                className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-lg border border-slate-200/60 hover:shadow-xl transition-all card-hover"
              >
                <MailIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-800">support@ecotrade.com</p>
                </div>
              </a>
              <a
                href="tel:00963932735606"
                className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-lg border border-slate-200/60 hover:shadow-xl transition-all card-hover"
              >
                <PhoneIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-800">00963932735606</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-lg border border-slate-200/60">
                <LocationMarkerIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-800">Damascus, Syria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200/60">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none resize-none"
                    placeholder="Write your message here..."
                  />
                </div>
                {success && (
                  <p className="text-emerald-600 font-medium flex items-center gap-2">
                    ✓ Your message was sent successfully! We will contact you soon.
                  </p>
                )}
                {error && <p className="text-red-600 font-medium">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
