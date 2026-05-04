"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  Send,
  CheckCircle,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { AnimatedBackground } from "@/components/common/animated-background";

const FAQ_ITEMS = [
  {
    q: "How do I book an appointment?",
    a: "After logging in, search for a barbershop or browse nearby shops. Select a shop, choose a barber and a time slot that works for you, then confirm your booking. You'll receive a confirmation immediately.",
  },
  {
    q: "How does the Live Queue work?",
    a: "When you join a queue at a barbershop, TrimLink gives you a virtual ticket number. You can track your position in real time from anywhere. The app notifies you when it's almost your turn, so you don't have to wait at the shop.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support Telebirr and Chapa for digital payments. You can also choose to pay in cash at the shop. All transactions are secured and you receive a receipt for every payment.",
  },
  {
    q: "Can I cancel or reschedule a booking?",
    a: "Yes, you can cancel or reschedule a booking from your profile page. Please note that cancellations less than 1 hour before the appointment may be subject to the shop's cancellation policy.",
  },
  {
    q: "How do I register my barbershop on TrimLink?",
    a: "Create an account and select 'Shop Owner' as your role. After verification, you'll be able to set up your shop profile, add barbers, define services, and start accepting bookings.",
  },
  {
    q: "Is TrimLink available outside Addis Ababa?",
    a: "TrimLink is currently expanding across Ethiopia. While most shops are currently in Addis Ababa, we are onboarding shops in other cities every week. Stay tuned!",
  },
  {
    q: "What if my barber is running late?",
    a: "The live queue updates in real time. If a barber is running behind, the estimated wait time in the app will reflect that automatically, keeping you informed without any calls needed.",
  },
  {
    q: "How do I contact a barbershop directly?",
    a: "On each shop's detail page, you can find the shop's phone number and address. You can call them directly or navigate to their location using Google Maps.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-white/10 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left bg-white/[0.03] hover:bg-white/[0.07] transition"
      >
        <span className="font-semibold text-white/90 text-sm leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed border-t border-white/5 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HelpPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setName("");
    setMessage("");
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-24 sm:pt-12 sm:pb-12">

        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Help & Contact</h1>
            <p className="text-sm text-white/40 mt-0.5">We're here to help you</p>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 p-3 rounded-xl bg-white/5 group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0 group-hover:border-orange-500/60 transition">
                <Phone className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Phone</div>
                <div className="text-sm font-semibold text-white/90">0962608563 / 0948560005</div>
              </div>
            </div>
          </div>

          <a
            href="mailto:phillipos1212@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0 group-hover:border-blue-500/60 transition">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Email</div>
              <div className="text-sm font-semibold text-white/90">phillipos1212@gmail.com</div>
            </div>
          </a>

          <a
            href="https://t.me/trimlink"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30 shrink-0 group-hover:border-sky-500/60 transition">
              <MessageCircle className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Telegram</div>
              <div className="text-sm font-semibold text-white/90">@trimlink</div>
            </div>
          </a>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
              <Clock className="h-5 w-5 text-white/50" />
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">Hours</div>
              <div className="text-sm font-semibold text-white/90">Mon–Sat, 8 AM – 8 PM</div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 mb-8">
          <a
            href="https://instagram.com/trimlink"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <Instagram size={16} /> Instagram
          </a>
          <a
            href="https://t.me/trimlink"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <MessageCircle size={16} /> Telegram Channel
          </a>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-black text-white">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-base font-black text-white mb-1">Still have a question?</h2>
          <p className="text-sm text-white/40 mb-5">Send us a message and we'll get back to you within 24 hours.</p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 gap-3"
            >
              <CheckCircle className="h-12 w-12 text-emerald-400" />
              <p className="text-white/70 font-semibold text-center">Message sent! We'll be in touch soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-orange-500/50 transition"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question…"
                required
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-orange-500/50 transition resize-none"
              />
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-400 text-black font-bold h-12 rounded-xl flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-8">© 2026 TrimLink. All rights reserved.</p>
      </div>
    </div>
  );
}
