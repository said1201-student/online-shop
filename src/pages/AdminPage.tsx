import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addProduct, getProducts, deleteProduct, Product } from '../services/productService';
import { getAllOrders, updateOrderStatus, Order } from '../services/orderService';
import { getPendingVendors, approveVendor, rejectVendor, UserProfile } from '../services/adminService';
import { motion } from 'motion/react';
import { Plus, Package, DollarSign, Image as ImageIcon, LayoutGrid, Loader2, ArrowLeft, Trash2, List, ShoppingCart, Clock, CheckCircle, Truck, XCircle, Users, Check, X, ShieldAlert } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    processing: { color: 'bg-blue-100 text-blue-700', icon: <Package className="w-3 h-3" /> },
    shipped: { color: 'bg-indigo-100 text-indigo-700', icon: <Truck className="w-3 h-3" /> },
    delivered: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
  };
  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

export default function AdminPage() {
  const { isAdmin, isSuperAdmin, isApproved, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'orders' | 'approvals'>('add');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<UserProfile[]>([]);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: 'electronics'
  });

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'list') loadProducts();
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'approvals' && isSuperAdmin) loadVendors();
    }
  }, [isAdmin, activeTab, isSuperAdmin]);

  const loadProducts = async () => {
    try {
      // If super admin, see all. If vendor, see only theirs.
      const data = await getProducts(isSuperAdmin ? undefined : user?.uid);
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      // Filter orders to only show items belonging to this vendor
      if (!isSuperAdmin) {
        // Fetch current vendor products to ensure we have the list for filtering
        const vendorProducts = await getProducts(user?.uid);
        const vendorOrders = data.filter(order => 
          order.items.some(item => vendorProducts.some(p => p.id === item.productId))
        );
        setOrders(vendorOrders);
      } else {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await getPendingVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) return <Navigate to="/" />;
  
  if (isAdmin && !isApproved && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-yellow-100">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Ombi Lako Linashughulikiwa</h1>
          <p className="text-gray-500 mb-8">Akaunti yako ya Muuzaji inasubiri kuidhinishwa na Admin mkuu. Tafadhali subiri kidogo.</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline">Rudi Shop</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProduct({
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
      });
      setSuccess(true);
      setProduct({ name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: 'electronics' });
      setTimeout(() => setSuccess(false), 3000);
      if (activeTab === 'list') loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Je, una uhakika unataka kufuta bidhaa hii?")) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (uid: string) => {
    try {
      await approveVendor(uid);
      loadVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (uid: string) => {
    if (confirm("Reject this vendor request?")) {
      try {
        await rejectVendor(uid);
        loadVendors();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-100 mb-8 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Rudi Shop</span>
          </Link>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={() => setActiveTab('add')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-[10px] sm:text-sm transition-all cursor-pointer ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Add
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-[10px] sm:text-sm transition-all cursor-pointer ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Items
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-[10px] sm:text-sm transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Orders
            </button>
            {isSuperAdmin && (
              <button 
                onClick={() => setActiveTab('approvals')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-[10px] sm:text-sm transition-all cursor-pointer ${activeTab === 'approvals' ? 'bg-orange-600 text-white shadow-md' : 'text-orange-500 hover:bg-orange-50'}`}
              >
                Approvals
                {vendors.length > 0 && <span className="ml-1 bg-red-100 text-red-600 px-1.5 rounded-full text-[10px]">{vendors.length}</span>}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        {activeTab === 'add' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="bg-blue-600 p-8 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Plus className="w-8 h-8" />
                Sajili Bidhaa Mpya
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-center font-bold">
                  Safi! Bidhaa imesajiliwa.
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jina la Bidhaa</label>
                  <input
                    type="text" required
                    value={product.name}
                    onChange={(e) => setProduct({...product, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="iPhone 15..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jamii (Category)</label>
                  <select
                    value={product.categoryId}
                    onChange={(e) => setProduct({...product, categoryId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="home">Home & Living</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bei ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={product.price}
                    onChange={(e) => setProduct({...product, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stoo (Stock)</label>
                  <input
                    type="number" required
                    value={product.stock}
                    onChange={(e) => setProduct({...product, stock: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Picha ya Bidhaa (URL)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url" required
                          value={product.imageUrl}
                          onChange={(e) => setProduct({...product, imageUrl: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase w-full">Mifano ya haraka:</p>
                        {[
                          { name: 'Simu', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800' },
                          { name: 'Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800' },
                          { name: 'Saa', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800' },
                          { name: 'Viatu', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800' }
                        ].map((sample) => (
                          <button
                            key={sample.url}
                            type="button"
                            onClick={() => setProduct({...product, imageUrl: sample.url})}
                            className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 group">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/400?text=Invalid+URL')}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-[10px] text-gray-400 font-medium">Preview itaonekana hapa</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maelezo</label>
                  <textarea
                    required
                    value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                </div>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all flex justify-center gap-2 shadow-lg shadow-blue-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sajili Sasa'}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Orodha ya Bidhaa ({products.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} className="w-16 h-16 object-cover rounded-lg" alt="" />
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.categoryId} • ${p.price.toFixed(2)}</p>
                      <p className="text-xs font-semibold text-blue-600">{p.stock} in stock</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => p.id && handleDelete(p.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Orodha ya Oda ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-500">Bado hakuna oda zozote.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Order ID</p>
                      <p className="text-xs font-mono text-gray-600">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <select 
                          value={order.status}
                          onChange={(e) => order.id && handleStatusUpdate(order.id, e.target.value as Order['status'])}
                          className="text-xs border-none bg-transparent font-bold text-blue-600 outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                      <p className="text-lg font-black text-blue-600">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between text-xs ${!isSuperAdmin && !products.some(p => p.id === item.productId) ? 'opacity-30' : 'text-gray-600'}`}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'approvals' && isSuperAdmin && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-orange-500" />
              Pending Vendor Approvals
            </h2>
            {vendors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">Hakuna maombi mapya kwa sasa.</p>
              </div>
            ) : (
              vendors.map((vendor) => (
                <motion.div 
                  key={vendor.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-2xl flex items-center justify-between border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                      {vendor.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{vendor.username}</p>
                      <p className="text-xs text-gray-400">{vendor.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReject(vendor.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleApprove(vendor.id)}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all shadow-md cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

