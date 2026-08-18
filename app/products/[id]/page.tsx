'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency, sanitizeInput, formatDate } from '@/lib/utils';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Star, CheckCircle, ArrowLeft, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, reviews, addReview, currentUser } = useStore();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const productId = params?.id as string;
  const product = products.find((p) => p.id === productId || p.slug === productId);

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(currentUser?.full_name || '');
  const [reviewerEmail, setReviewerEmail] = useState(currentUser?.email || '');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold font-serif text-slate-900">Product Not Found</h1>
          <Link href="/shop" className="text-gold-600 font-bold underline text-sm block">
            Return to shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800'];
  const inWish = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.product_id === product.id && r.status === 'APPROVED');
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : '5.0';

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewerName.trim()) return;

    addReview({
      product_id: product.id,
      product_name: sanitizeInput(product.name),
      customer_id: currentUser?.id,
      customer_name: sanitizeInput(reviewerName),
      customer_email: sanitizeInput(reviewerEmail) || 'customer@example.com',
      rating: Math.min(5, Math.max(1, reviewRating)),
      title: sanitizeInput(reviewTitle) || 'Verified Product Review',
      comment: sanitizeInput(reviewComment),
    });

    setReviewSubmitted(true);
    setReviewTitle('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-10 w-full space-y-12">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-gold-600">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gold-600">Shop</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-cream-300 shadow-lg bg-white card-3d">
              <img
                src={images[selectedImgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 shadow-md text-slate-700 hover:text-rose-600 transition"
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>

              {product.discount_percentage > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-gold-gradient text-slate-950 text-xs font-bold rounded-full shadow">
                  {product.discount_percentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      selectedImgIndex === idx ? 'border-gold-500 scale-105 shadow-md' : 'border-cream-300 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Buying Actions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-gold-600 block">{product.category_name || 'Royal Jewellery'}</span>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mt-1">{product.name}</h1>
              
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center text-amber-500 gap-0.5 text-xs font-bold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-slate-900 font-extrabold">{avgRating}</span>
                </div>
                <span className="text-xs text-slate-400">({productReviews.length} Verified Customer Reviews)</span>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price & Stock Display */}
            <div className="flex items-center gap-4 border-y border-cream-300 py-4">
              <div>
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(product.selling_price)}</span>
                {product.discount_percentage > 0 && (
                  <span className="text-sm text-slate-400 line-through block">{formatCurrency(product.original_price)}</span>
                )}
              </div>

              <div className="ml-auto">
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock_quantity} available)
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

            {/* Quantity Selector & Action Buttons */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700 uppercase">Quantity:</span>
                  <div className="flex items-center border border-cream-300 bg-white rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-xs text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-1.5 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="py-4 bg-slate-900 text-gold-400 font-bold rounded-2xl shadow-lg btn-3d-dark text-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="py-4 bg-gold-gradient text-slate-950 font-bold rounded-2xl shadow-lg btn-3d-gold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Buy Now Immediately</span>
                  </button>
                </div>
              </div>
            )}

            {/* Specifications Card */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-3 text-xs shadow-sm">
              <h4 className="font-serif font-bold text-slate-900 uppercase">Product Specifications</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Material: <span className="font-semibold text-slate-800">{product.material}</span></div>
                <div>Stone: <span className="font-semibold text-slate-800">{product.stone_type}</span></div>
                <div>Colour: <span className="font-semibold text-slate-800">{product.colour}</span></div>
                <div>Weight: <span className="font-semibold text-slate-800">{product.weight}</span></div>
              </div>
              <div className="pt-2 border-t border-cream-200 text-slate-500 text-[11px]">
                <strong>Care Instructions:</strong> {product.care_instructions}
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS & RATINGS SECTION */}
        <section className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-200 pb-6">
            <div>
              <h3 className="font-serif font-bold text-2xl text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-gold-500 fill-gold-500" /> Customer Ratings & Reviews
              </h3>
              <p className="text-xs text-slate-500 mt-1">Authentic feedback from verified SR Jewellery customers.</p>
            </div>

            <div className="flex items-center gap-4 bg-cream-50 p-4 rounded-2xl border border-cream-300">
              <div className="text-center">
                <span className="text-3xl font-bold font-serif text-slate-900">{avgRating}</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Out of 5.0</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-600 font-semibold">{productReviews.length} Verified Reviews</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Write Review Form */}
            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-300 space-y-4 h-fit">
              <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold-600" /> Write a Product Review
              </h4>

              {reviewSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold space-y-1">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Review Submitted Successfully!</span>
                  </div>
                  <p className="text-[11px] font-normal text-emerald-600">Your feedback has been saved and is viewable on the product page and Admin Review desk.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Rating *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Review Headline / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Stunning Kundan Finish & Royal Look!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                      <input
                        type="email"
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Review Comment *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the jewellery craftsmanship, gold shine, fitting, and delivery experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition text-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Product Review</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Approved Product Reviews Feed */}
            <div className="lg:col-span-2 space-y-4">
              {productReviews.length === 0 ? (
                <div className="p-8 text-center bg-cream-50 rounded-2xl border border-cream-300 text-slate-500 text-xs">
                  Be the first customer to write a review for <strong className="text-slate-900">{product.name}</strong>!
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {productReviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rev.customer_name}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Verified Buyer</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(rev.created_at)}</span>
                      </div>

                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>

                      {rev.title && <h5 className="font-serif font-bold text-slate-900 text-sm">{rev.title}</h5>}
                      <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
