import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, Product } from '../services/productService';
import { getProductReviews, addReview, Review } from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, ShoppingCart, Plus, Minus, Star, ShieldCheck, Truck, RotateCcw, MessageSquare, Send, User } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [productData, reviewsData] = await Promise.all([
          getProductById(id),
          getProductReviews(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    setSubmitting(true);
    try {
      await addReview(id, profile?.username || user.displayName || 'Mteja', rating, comment);
      setComment('');
      setRating(5);
      const updatedReviews = await getProductReviews(id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error(error);
      alert("Imeshindikana kutuma maoni.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Inapakia...</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <p>Bidhaa haijapatikana.</p>
    <Link to="/" className="text-blue-600 font-bold underline">Rudi Nyumbani</Link>
  </div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <nav className="h-16 border-b border-gray-100 flex items-center px-4 md:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Rudi</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 sticky top-24"
          >
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full aspect-square object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {product.categoryId}
              </span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : ''}`} />
                ))}
                <span className="ml-2 text-xs text-gray-400 font-bold">({reviews.length})</span>
              </div>
            </div>

            <h1 className="text-4xl font-black text-gray-900 mb-2">{product.name}</h1>
            <p className="text-3xl font-black text-blue-600 mb-6">${product.price.toFixed(2)}</p>
            
            <div className="space-y-6 mb-8 text-gray-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    for(let i=0; i<quantity; i++) addToCart(product);
                    navigate('/cart');
                  }}
                  disabled={product.stock === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Weka Kwenye Kikapu
                </button>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-xs text-red-500 font-bold animate-pulse">Haraka! Zimebaki {product.stock} pekee stoo!</p>
              )}
              {product.stock === 0 && (
                <p className="text-xs text-red-500 font-bold text-center">Samahani, bidhaa hii imeisha stoo.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-12 mb-12">
              <div className="flex items-center gap-3 p-4 border border-gray-50 rounded-xl bg-gray-50/30">
                <Truck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">Usafirishaji Bure</p>
                  <p className="text-xs text-gray-500">Ndani ya siku 3-5</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border border-gray-50 rounded-xl bg-gray-50/30">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">Dhamana ya Mwaka</p>
                  <p className="text-xs text-gray-500">Imehakikiwa 100%</p>
                </div>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Maoni ya Wateja
                </h2>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '0.0'} / 5.0
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-black">{reviews.length} matokeo</p>
                </div>
              </div>

              {user && (
                <form onSubmit={handleReviewSubmit} className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100/50">
                  <h3 className="font-bold text-gray-900 mb-4">Toa Maoni Yako</h3>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} type="button" 
                        onClick={() => setRating(s)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Andika maoni yako hapa..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm mb-4"
                  />
                  <button 
                    disabled={submitting}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer text-sm shadow-lg shadow-blue-100"
                  >
                    {submitting ? 'Inatuma...' : <><Send className="w-4 h-4" /> Tuma Maoni</>}
                  </button>
                </form>
              )}

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-center py-10 italic">Bado hakuna maoni kwa bidhaa hii.</p>
                ) : (
                  reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 pb-6 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-bold text-sm text-gray-900">{review.username}</span>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {review.createdAt?.toDate().toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
