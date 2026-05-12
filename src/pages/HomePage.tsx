import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { logoutUser } from '../services/authService';
import { getProducts, Product, seedProducts } from '../services/productService';
import { motion } from 'motion/react';
import { ShoppingBag, LogOut, User as UserIcon, ShoppingCart, Plus, Search, Database, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { user, profile, isAdmin } = useAuth();
  const { addToCart, cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Zote', icon: <Database className="w-4 h-4" /> },
    { id: 'electronics', name: 'Vifaa vya Umeme' },
    { id: 'fashion', name: 'Mavazi' },
    { id: 'home', name: 'Nyumbani' }
  ];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedProducts();
      await loadProducts();
    } catch (error) {
      console.error("Seeding failed:", error);
    } finally {
      setSeeding(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">SHOP ONL</span>
            </Link>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/share" className="p-2 text-gray-500 hover:text-blue-600 transition-colors hidden sm:flex items-center gap-1">
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-bold">App</span>
              </Link>
              {user && (
                <Link to="/orders" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                  My Orders
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Admin
                </Link>
              )}
              
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Link to="/profile" className="hidden sm:block text-right hover:opacity-80 transition-opacity">
                    <p className="text-xs text-gray-500">Welcome,</p>
                    <p className="text-sm font-bold text-gray-900">{profile?.username || user.displayName}</p>
                  </Link>
                  <Link to="/profile" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => logoutUser()}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 sm:gap-4">
                  <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium py-2">Login</Link>
                  <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Inapakia bidhaa...</div>
        ) : (
          <>
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                      activeCategory === cat.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bidhaa Zetu</h2>
              <p className="text-gray-500">Gundua mkusanyiko wetu bora wa bidhaa za kisasa.</p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">{searchTerm ? 'No products match your search.' : 'Your store is currently empty.'}</p>
                {!searchTerm && (
                  <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {seeding ? (
                      <span className="flex items-center gap-2">
                        <Plus className="w-5 h-5 animate-spin" /> Inapakiwa...
                      </span>
                    ) : (
                      <>
                        <Database className="w-5 h-5" />
                        Pakia Bidhaa za Mfano
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <Link to={`/product/${product.id}`} className="aspect-square bg-gray-100 relative overflow-hidden block">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-red-600">Imeisha</span>
                        </div>
                      )}
                    </Link>
                    <div className="p-5">
                      <Link to={`/product/${product.id}`} className="block">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{product.name}</h3>
                      </Link>
                      <p className="text-gray-500 text-xs line-clamp-2 mb-4 h-8">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-100"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
