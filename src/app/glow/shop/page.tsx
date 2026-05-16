"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Search, Star, Plus, Minus, X, ChevronRight, Sparkles, Heart, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string; name: string; brand: string; price: number; rating: number; reviews: number;
  category: string; image: string; badge?: string;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Vitamin C Glow Serum", brand: "GlowEssentials", price: 1200, rating: 4.9, reviews: 234, category: "Skincare", image: "🧴", badge: "Bestseller" },
  { id: "p2", name: "Silk Hair Oil", brand: "Ethiopian Natural", price: 850, rating: 4.8, reviews: 189, category: "Hair", image: "💆‍♀️" },
  { id: "p3", name: "Matte Lip Kit", brand: "Habesha Beauty", price: 650, rating: 4.7, reviews: 156, category: "Makeup", image: "💄", badge: "New" },
  { id: "p4", name: "Shea Butter Body Cream", brand: "GlowEssentials", price: 450, rating: 4.9, reviews: 312, category: "Body", image: "🧈", badge: "Top Rated" },
  { id: "p5", name: "Curl Defining Cream", brand: "Ethiopian Natural", price: 780, rating: 4.6, reviews: 98, category: "Hair", image: "💇‍♀️" },
  { id: "p6", name: "Rose Facial Toner", brand: "GlowEssentials", price: 550, rating: 4.8, reviews: 167, category: "Skincare", image: "🌹" },
  { id: "p7", name: "Eyebrow Pencil Set", brand: "Habesha Beauty", price: 350, rating: 4.5, reviews: 89, category: "Makeup", image: "✏️" },
  { id: "p8", name: "Nail Art Kit — Gel", brand: "GlowNails", price: 1500, rating: 4.9, reviews: 76, category: "Nails", image: "💅", badge: "Premium" },
];

const CATEGORIES = ["All", "Skincare", "Hair", "Makeup", "Body", "Nails"] as const;

interface CartItem { product: Product; qty: number }

export default function ShopPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered = PRODUCTS.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === p.id);
      if (existing) return prev.map(c => c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(c => c.product.id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0));
  };

  const cartTotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const toggleLike = (id: string) => {
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[rgba(200,149,108,0.1)]"
        style={{ background: "rgba(26,15,30,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/glow/discover" className="p-2 glass rounded-full text-white/60 hover:text-white border border-[rgba(200,149,108,0.15)] transition-all">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-lg font-black text-white font-editorial flex items-center gap-2">
                  GlowShop <Sparkles className="h-4 w-4" style={{ color: "#C8956C" }} />
                </h1>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(200,149,108,0.5)" }}>Premium Beauty Products</p>
              </div>
            </div>
            <button onClick={() => setShowCart(true)} className="relative p-2.5 glass rounded-full text-white/60 hover:text-white border border-[rgba(200,149,108,0.15)] transition-all">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", color: "#1A0F1E" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 glass rounded-full p-1 border border-[rgba(200,149,108,0.15)]">
            <div className="pl-3"><Search className="h-4 w-4" style={{ color: "rgba(200,149,108,0.5)" }} /></div>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-8 bg-transparent px-2 text-white/90 text-sm focus:outline-none placeholder:text-white/20" />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                style={{ background: category === c ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.05)", color: category === c ? "#1A0F1E" : "rgba(253,246,238,0.45)", border: `1px solid ${category === c ? "transparent" : "rgba(200,149,108,0.15)"}` }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* PRODUCTS GRID */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden" style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.12)" }}>
              <div className="relative h-36 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-rose-900/30">
                <span className="text-5xl">{p.image}</span>
                {p.badge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                    style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", color: "#1A0F1E" }}>
                    {p.badge}
                  </span>
                )}
                <button onClick={() => toggleLike(p.id)} className="absolute top-2 right-2 p-1.5 rounded-full glass">
                  <Heart className={`h-3.5 w-3.5 ${liked.has(p.id) ? "fill-rose-400 text-rose-400" : "text-white/40"}`} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-white line-clamp-1">{p.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(200,149,108,0.7)" }}>{p.brand}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-white">{p.rating}</span>
                  <span className="text-[10px] text-white/30">({p.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-sm" style={{ color: "#C8956C" }}>{p.price.toLocaleString()} ETB</span>
                  <button onClick={() => addToCart(p)}
                    className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>
                    <Plus className="h-3.5 w-3.5 text-[#1A0F1E]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/40">No products found</p>
          </div>
        )}
      </div>

      {/* CART DRAWER */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(12px)" }}
            onClick={e => e.target === e.currentTarget && setShowCart(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[80vh] flex flex-col"
              style={{ background: "#1A0F1E", border: "1px solid rgba(200,149,108,0.2)" }}>
              <div className="flex items-center justify-between p-6 border-b border-[rgba(200,149,108,0.1)]">
                <div>
                  <h3 className="font-bold text-white font-editorial text-lg">Your Cart</h3>
                  <p className="text-xs" style={{ color: "rgba(200,149,108,0.6)" }}>{cartCount} items</p>
                </div>
                <button onClick={() => setShowCart(false)} className="p-2 glass rounded-full text-white/60 hover:text-white border border-[rgba(200,149,108,0.15)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-white/10 mb-3" />
                    <p className="text-sm text-white/40">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-2xl"
                        style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.12)" }}>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-900/30 to-rose-900/30 flex items-center justify-center text-2xl shrink-0">
                          {item.product.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-xs" style={{ color: "#C8956C" }}>{item.product.price.toLocaleString()} ETB</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(item.product.id)} className="h-7 w-7 rounded-lg flex items-center justify-center glass border border-[rgba(200,149,108,0.2)] text-white/60">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-white w-5 text-center">{item.qty}</span>
                          <button onClick={() => addToCart(item.product)} className="h-7 w-7 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>
                            <Plus className="h-3 w-3 text-[#1A0F1E]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-[rgba(200,149,108,0.1)]">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm" style={{ color: "rgba(253,246,238,0.5)" }}>Total</span>
                    <span className="font-black text-lg" style={{ color: "#C8956C" }}>{cartTotal.toLocaleString()} ETB</span>
                  </div>
                  <button onClick={() => { alert(`Order placed! Total: ${cartTotal.toLocaleString()} ETB\nPayment integration coming soon.`); setCart([]); setShowCart(false); }}
                    className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E]"
                    style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.3)" }}>
                    Checkout · {cartTotal.toLocaleString()} ETB
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating cart button */}
      {cartCount > 0 && !showCart && (
        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm text-[#1A0F1E]"
          style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.4)" }}>
          <ShoppingBag className="h-4 w-4" />
          {cartCount} · {cartTotal.toLocaleString()} ETB
        </motion.button>
      )}
    </div>
  );
}
