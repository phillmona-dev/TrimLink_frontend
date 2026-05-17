"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, Search, Star, Plus, Minus, X, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] bg-transparent">
      <div className="w-full max-w-[1400px] bg-[#fcf7f4] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 flex flex-col min-h-[800px] border border-white/20">
        
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-40 bg-[#FDF6F0] rounded-t-xl border-b border-[#e8cdb9]">
          <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2.5 rounded-lg bg-white border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2] transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#3c2a23] font-editorial flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  GlowShop <Sparkles className="h-5 w-5 text-[#9e5d41]" />
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b08d7e]">Premium Beauty Products</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-md px-3 py-2 bg-white border border-[#e8cdb9] flex-1 md:w-64">
                <Search className="h-4 w-4 text-[#9e5d41]" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-full bg-transparent text-[#3c2a23] text-sm font-semibold focus:outline-none placeholder:text-[#b08d7e]" />
              </div>

              <button onClick={() => setShowCart(true)} className="relative p-2.5 rounded-lg bg-white border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2] transition-colors shrink-0">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm"
                    style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div className="px-6 py-3 bg-white border-t border-[#e8cdb9] flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="shrink-0 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{ 
                  background: category === c ? "#9e5d41" : "#FDF6F0", 
                  color: category === c ? "white" : "#8e5238", 
                  border: `1px solid ${category === c ? "transparent" : "#e8cdb9"}` 
                }}>
                {c}
              </button>
            ))}
          </div>
        </header>

        {/* ── PRODUCTS GRID ── */}
        <div className="p-6 md:p-8 flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl overflow-hidden bg-white border border-[#f0e4db] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="relative h-48 flex items-center justify-center bg-[#FDF6F0] border-b border-[#f0e4db]">
                  <span className="text-6xl drop-shadow-md">{p.image}</span>
                  {p.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                      style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                      {p.badge}
                    </span>
                  )}
                  <button onClick={() => toggleLike(p.id)} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors">
                    <Heart className={`h-4 w-4 ${liked.has(p.id) ? "fill-rose-500 text-rose-500" : "text-[#b08d7e]"}`} />
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm font-bold text-[#3c2a23] line-clamp-1">{p.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mt-1 text-[#9e5d41]">{p.brand}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2 mb-4">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-[#3c2a23]">{p.rating}</span>
                    <span className="text-[10px] font-medium text-[#b08d7e]">({p.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f0e4db]">
                    <span className="font-bold text-lg text-[#3c2a23]">${p.price.toLocaleString()}</span>
                    <button onClick={() => addToCart(p)}
                      className="h-10 w-10 rounded-md flex items-center justify-center transition-all shadow-sm text-white hover:scale-105 active:scale-95"
                      style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-[#f0e4db]">
              <ShoppingBag className="h-16 w-16 mx-auto text-[#e8cdb9] mb-4" />
              <p className="text-sm font-bold text-[#8e5238]">No products found</p>
            </div>
          )}
        </div>

        {/* ── CART DRAWER ── */}
        <AnimatePresence>
          {showCart && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex justify-end"
              style={{ background: "rgba(92, 68, 59, 0.4)", backdropFilter: "blur(4px)" }}
              onClick={e => e.target === e.currentTarget && setShowCart(false)}>
              
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md h-full bg-[#fcf7f4] shadow-2xl flex flex-col border-l border-[#e8cdb9]">
                
                <div className="flex items-center justify-between p-6 bg-[#FDF6F0] border-b border-[#e8cdb9]">
                  <div>
                    <h3 className="text-2xl font-bold text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your Cart</h3>
                    <p className="text-xs font-bold uppercase tracking-wider mt-1 text-[#9e5d41]">{cartCount} items</p>
                  </div>
                  <button onClick={() => setShowCart(false)} className="p-2.5 rounded-lg bg-white border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {cart.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="h-16 w-16 mx-auto text-[#e8cdb9] mb-4" />
                      <p className="text-sm font-bold text-[#8e5238]">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#f0e4db] shadow-sm">
                          <div className="h-16 w-16 rounded-lg bg-[#FDF6F0] border border-[#e8cdb9] flex items-center justify-center text-3xl shrink-0">
                            {item.product.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#3c2a23] line-clamp-1">{item.product.name}</p>
                            <p className="text-[13px] font-bold mt-1 text-[#9e5d41]">${item.product.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => removeFromCart(item.product.id)} 
                              className="h-8 w-8 rounded-md flex items-center justify-center border border-[#e8cdb9] text-[#8e5238] bg-[#FDF6F0] hover:bg-[#f9ebe2]">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-bold text-[#3c2a23] w-4 text-center">{item.qty}</span>
                            <button onClick={() => addToCart(item.product)} 
                              className="h-8 w-8 rounded-md flex items-center justify-center text-white shadow-sm"
                              style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {cart.length > 0 && (
                  <div className="p-6 bg-[#FDF6F0] border-t border-[#e8cdb9]">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-bold uppercase tracking-wider text-[#8e5238]">Subtotal</span>
                      <span className="font-bold text-2xl text-[#3c2a23]">${cartTotal.toLocaleString()}</span>
                    </div>
                    <button onClick={() => { alert(`Order placed! Total: $${cartTotal.toLocaleString()}\nPayment integration coming soon.`); setCart([]); setShowCart(false); }}
                      className="w-full py-4 rounded-md font-bold text-sm uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                      Checkout Securely
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
