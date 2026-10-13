import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BadgeCheckIcon,
  TrendingUpIcon,
  HeartIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  CollectionIcon,
  CubeIcon,
  FireIcon,
  ShoppingBagIcon,
  ChatAltIcon,
  SunIcon,
  CameraIcon,
  GlobeAltIcon,
} from "@heroicons/react/outline";
import { StarIcon } from "@heroicons/react/solid";
import { getApiUrl } from "../config/api";
import HomeNavbar from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";
import useScrollReveal from "../hooks/useScrollReveal";

const HomePage = () => {
  useScrollReveal();

  const [counter, setCounter] = useState({ users: 0, artworks: 0, recycled: 0 });

  // Animated counter effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => ({
        users: prev.users < 5000 ? prev.users + 50 : 5000,
        artworks: prev.artworks < 3200 ? prev.artworks + 32 : 3200,
        recycled: prev.recycled < 2500 ? prev.recycled + 25 : 2500,
      }));
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // ----- Contact form state (posts to the existing messages endpoint) -----
  const [contact, setContact] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [contactStatus, setContactStatus] = useState({ type: "idle", text: "" });

  const handleContactChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ type: "loading", text: "" });
    try {
      await axios.post(getApiUrl("messages/send-message"), {
        customerName: contact.name,
        email: contact.email,
        message: `[${contact.subject}] ${contact.message}`,
      });
      setContactStatus({ type: "success", text: "Your message has been sent successfully! We'll get back to you soon." });
      setContact({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch {
      setContactStatus({ type: "error", text: "Something went wrong while sending. Please try again later." });
    }
  };

  const stats = [
    { value: "5,000+", label: "Active Users", Icon: UserGroupIcon, tint: "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300" },
    { value: "10,000+", label: "Items Traded", Icon: TrendingUpIcon, tint: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" },
    { value: "2,500+", label: "Tonnes Recycled", Icon: CubeIcon, tint: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300" },
    { value: "3,200+", label: "Artworks Sold", Icon: FireIcon, tint: "bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300" },
  ];

  const features = [
    {
      title: "Marketplace",
      Icon: ShoppingBagIcon,
      tint: "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300",
      description: "Buy and sell recycled items and recycled art in a trusted marketplace that gives waste a second life.",
    },
    {
      title: "Auctions & Bids",
      Icon: ChartBarIcon,
      tint: "bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300",
      description: "Bid on unique recycled artworks in live, transparent auctions where fair competition sets the price.",
    },
    {
      title: "Community Challenges",
      Icon: FireIcon,
      tint: "bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
      description: "Join recycling challenges, track weekly eco goals, and earn rewards while making a real difference.",
    },
    {
      title: "AI Playground",
      Icon: CameraIcon,
      tint: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
      description: "Snap a photo and let AI identify recyclable materials instantly — know exactly what you're holding.",
    },
    {
      title: "Community Feed",
      Icon: ChatAltIcon,
      tint: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
      description: "Share your recycling wins, follow changemakers, and connect with a community building a greener Nigeria.",
    },
    {
      title: "Eco News",
      Icon: GlobeAltIcon,
      tint: "bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
      description: "Stay informed with curated eco headlines and sustainability news from across the continent and beyond.",
    },
  ];

  const steps = [
    { number: "01", title: "Create your account", description: "Join free and set up your eco profile in minutes", Icon: UserGroupIcon },
    { number: "02", title: "Scan or list materials", description: "Use the AI scanner or list items for the marketplace", Icon: SparklesIcon },
    { number: "03", title: "Sell, bid or buy", description: "Trade recyclables, bid on art auctions, or shop recycled goods", Icon: ChartBarIcon },
    { number: "04", title: "Earn and grow impact", description: "Complete challenges, hit weekly goals, build a greener future", Icon: CheckCircleIcon },
  ];

  const whyItems = [
    {
      title: "Full Transparency",
      Icon: ShieldCheckIcon,
      tint: "bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-300",
      description: "Every bidder sees the same information, and prices are set through clear competition — not opaque middlemen.",
    },
    {
      title: "Fairness for Everyone",
      Icon: BadgeCheckIcon,
      tint: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
      description: "No difference between a large company and a small collector — anyone with recyclables can take part.",
    },
    {
      title: "Documented Trust",
      Icon: CheckCircleIcon,
      tint: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
      description: "Traceable records for listings, materials, and bids, with support channels to resolve disputes quickly.",
    },
    {
      title: "Real Environmental Impact",
      Icon: HeartIcon,
      tint: "bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
      description: "Every trade returns materials to the production cycle and cuts waste, emissions, and pollution.",
    },
  ];

  const testimonials = [
    {
      name: "Adeola Ogunlesi",
      role: "Eco Artist",
      text: "EcoMate AI transformed my passion for recycled art into a thriving business. I've sold over 50 artworks and connected with amazing buyers who care about sustainability.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
      name: "Chinedu Okonkwo",
      role: "Recycling Collector",
      text: "The AI scanner is incredible! I can now identify materials instantly and get better prices from companies. My income has doubled since joining the platform.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Fatima Abdullahi",
      role: "NGO Coordinator",
      text: "We launched a community recycling challenge through EcoMate and had 2,000+ participants in the first month. The impact tracking features are exactly what we needed.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      name: "Oluwaseun Adeyemi",
      role: "Plastic Manufacturer",
      text: "As a plastic manufacturer, EcoMate connects us directly with quality recyclable materials. We've reduced raw material costs by 30% while supporting local communities.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
      name: "Ngozi Eze",
      role: "University Student",
      text: "I participate in environmental challenges and earn rewards while making a real difference. The gamification makes sustainability actually fun!",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    },
    {
      name: "Ibrahim Mohammed",
      role: "E-Waste Dealer",
      text: "The e-waste classification AI is spot-on. I used to guess material types; now I scan and get instant, accurate results. Game changer for my business.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/51.jpg",
    },
  ];

  const subjectOptions = ["General Inquiry", "Partnership", "Technical Support", "Media"];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HomeNavbar />

      <main>
        {/* ===== Hero ===== */}
        <section id="home" className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-7 reveal">
                <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <SparklesIcon className="w-4 h-4" />
                  AI-powered recycling, made in Nigeria
                </span>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                  Transform waste into
                  <span className="text-green-600 dark:text-green-400"> value</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Join thousands of changemakers buying and selling recyclables,
                  bidding on recycled art, completing eco challenges, and building
                  a sustainable future with EcoMate AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30"
                  >
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a
                    href="#why"
                    className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 dark:hover:bg-gray-700 hover:border-green-300 transition-all"
                  >
                    Learn More
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <BadgeCheckIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Verified & Certified</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">by official authorities</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Full Protection</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">for all transactions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat card */}
              <div className="relative hidden md:block reveal">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-green-200 dark:bg-green-900 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-60"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Community Members</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{counter.users.toLocaleString()}+</p>
                    </div>
                    <UserGroupIcon className="w-11 h-11 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Items Traded</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{(counter.artworks * 3).toLocaleString()}</p>
                    </div>
                    <ShoppingBagIcon className="w-11 h-11 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tonnes Recycled</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{counter.recycled.toLocaleString()}</p>
                    </div>
                    <CollectionIcon className="w-11 h-11 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Stats ===== */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label, Icon, tint }, i) => (
              <div
                key={i}
                className="reveal bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${tint}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== What EcoMate offers ===== */}
        <section id="partners" className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-14 reveal">
            <p className="text-sm font-bold tracking-wider text-green-600 dark:text-green-400 uppercase mb-3">
              One Platform, Endless Possibilities
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              More than <span className="text-green-600 dark:text-green-400">recycling</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              EcoMate AI brings the entire circular economy into one community — marketplace, auctions, challenges, and connections
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ title, Icon, tint, description }, i) => (
              <div
                key={i}
                className="reveal bg-gray-50 dark:bg-gray-800 rounded-3xl p-10 hover:shadow-xl transition-shadow border border-transparent hover:border-green-100 dark:hover:border-green-900"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${tint}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== How It Works ===== */}
        <section id="how-it-works" className="bg-gray-50 dark:bg-gray-800/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <p className="text-sm font-bold tracking-wider text-green-600 dark:text-green-400 uppercase mb-3">
                How It Works
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Start in <span className="text-green-600 dark:text-green-400">4 simple steps</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                An easy, fast journey from sign-up to real environmental impact
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <div className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 dark:opacity-40"></div>
              {steps.map(({ number, title, description, Icon }, i) => (
                <div key={i} className="relative z-10 reveal">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-5">
                      <span className="text-2xl font-bold text-white">{number}</span>
                    </div>
                    <div className="flex justify-center mb-3">
                      <div className="bg-green-50 dark:bg-green-900/40 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-green-600 dark:text-green-300" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Our Why ===== */}
        <section id="why" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14 reveal">
            <p className="text-sm font-bold tracking-wider text-green-600 dark:text-green-400 uppercase mb-3">
              Our Core Values
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why <span className="text-green-600 dark:text-green-400">EcoMate AI</span>?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Because we see recycling as an economic, environmental, and social opportunity all at once
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {whyItems.map(({ title, Icon, tint, description }, i) => (
              <div
                key={i}
                className="reveal flex gap-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7 hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center ${tint}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Testimonials ===== */}
        <section className="bg-gray-50 dark:bg-gray-800/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <p className="text-sm font-bold tracking-wider text-green-600 dark:text-green-400 uppercase mb-3">
                Testimonials
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Loved by the <span className="text-green-600 dark:text-green-400">community</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Hear from Nigerians who are earning more while protecting the environment
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="reveal bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <span className="text-6xl leading-none text-green-100 dark:text-green-900 font-serif select-none">"</span>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed -mt-6 mb-6">{t.text}</p>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <StarIcon
                        key={s}
                        className={`w-5 h-5 ${s < t.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Contact ===== */}
        <section id="contact" className="bg-gray-50 dark:bg-gray-800/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <p className="text-sm font-bold tracking-wider text-green-600 dark:text-green-400 uppercase mb-3">
                Get in Touch
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Contact <span className="text-green-600 dark:text-green-400">Us</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Questions about EcoMate AI? We'd love to hear from you — reach out and let's build a sustainable future together.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Contact info */}
              <div className="space-y-6 reveal">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Email Us</h3>
                    <a href="mailto:hello@ecomate.ai" className="block text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors">
                      hello@ecomate.ai
                    </a>
                    <a href="mailto:support@ecomate.ai" className="block text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors">
                      support@ecomate.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Call Us</h3>
                    <a href="tel:+2348003266283" className="block text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors">
                      +234 800 ECOMATE
                    </a>
                    <a href="tel:+23412345678" className="block text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors">
                      +234 1 234 5678
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <LocationMarkerIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Visit Us</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Innovation Hub, Sangotedo,
                      <br />
                      Lekki, Lagos, Nigeria
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
                  <LocationMarkerIcon className="w-10 h-10 text-green-500" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>

              {/* Contact form */}
              <div className="reveal bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={contact.name}
                      onChange={handleContactChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={contact.email}
                      onChange={handleContactChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={contact.subject}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    >
                      {subjectOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      value={contact.message}
                      onChange={handleContactChange}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
                    />
                  </div>

                  {contactStatus.type === "success" && (
                    <p className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-xl px-4 py-3 text-sm font-medium">
                      ✓ {contactStatus.text}
                    </p>
                  )}
                  {contactStatus.type === "error" && (
                    <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-xl px-4 py-3 text-sm font-medium">
                      {contactStatus.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={contactStatus.type === "loading"}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {contactStatus.type === "loading" ? "Sending..." : "Send Message"}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-green-600 dark:bg-green-700 py-20">
          <div className="max-w-5xl mx-auto px-6 text-center reveal">
            {/* Leaf mark */}
            <svg className="w-14 h-14 mx-auto text-white/80 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8c-6 0-10 2-12 6-1.5 3-1 6-1 6s3 .5 6-1c4-2 6-6 7-11zM8 20c2-6 6-10 13-12" />
            </svg>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">Ready to Make an Impact?</h2>
            <p className="text-lg md:text-xl text-green-50 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users and companies already transforming waste into value.
              Start your sustainability journey with EcoMate AI today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 bg-white text-green-700 px-9 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-xl"
              >
                Get Started Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#why"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/70 text-white px-9 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Login shortcut for existing users */}
            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-green-100 hover:text-white text-sm font-medium transition-colors"
              >
                <SunIcon className="w-4 h-4 hidden" />
                Already have an account? Sign in here
              </Link>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
};

export default HomePage;
