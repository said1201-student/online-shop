import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, auth as firebaseAuth } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getMyOrders, Order } from '../services/orderService';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { User, Mail, Shield, ShieldCheck, ArrowLeft, Loader2, LogOut, Package, ExternalLink, Clock, CheckCircle, Truck, XCircle, Share2, Smartphone, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePWA } from '../hooks/usePWA';

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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const { isInstallable, installApp } = usePWA();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-8 text-center">Tafadhali ingia kwenye akaunti...</div>;

  const toggleAdmin = async () => {
    setLoading(true);
    try {
      const newRole = profile?.role === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
      // Refresh page to apply context changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Imefeli kubadilisha daraja. Hakikisha umeruhusu kwenye Firestore Rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-100 mb-8 sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Rudi Nyumbani</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{profile?.username || user.displayName}</h1>
            <p className="text-blue-100 text-sm mt-1">{user.email}</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${profile?.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  {profile?.role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Account Status</p>
                  <p className="font-bold text-gray-900 capitalize">{profile?.role || 'User'}</p>
                </div>
              </div>
              
              <button
                onClick={toggleAdmin}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                  profile?.role === 'admin' 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  profile?.role === 'admin' ? 'Shusha Cheo' : 'Kuwa Admin'
                )}
              </button>
            </div>

            <div>
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Maagizo Yangu ({orders.length})
                <Link to="/orders" className="ml-auto text-xs text-blue-600 hover:underline font-bold">Angalia Zote</Link>
              </h2>
              
              {ordersLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">Hujafanya oda yoyote bado.</p>
                  <Link to="/" className="text-blue-600 text-xs font-bold mt-2 inline-block">Anza Ununuzi</Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[9px] font-mono text-gray-400 uppercase">Order #{order.id?.slice(-6)}</p>
                          <p className="text-xs font-bold text-gray-900 mt-0.5">${order.totalPrice.toFixed(2)}</p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] text-gray-500">
                          {order.createdAt?.toDate().toLocaleDateString('sw-TZ')}
                        </p>
                        <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {profile?.role === 'admin' && (
              <Link 
                to="/admin"
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
              >
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Ingia Panel ya Admin
              </Link>
            )}

            {isInstallable && (
              <button 
                onClick={installApp}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                <Download className="w-5 h-5" />
                INSTALL SHOP ONL
              </button>
            )}

            <Link 
              to="/share"
              className="w-full bg-blue-50 text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-100 shadow-sm"
            >
              <Smartphone className="w-5 h-5" />
              Pakua / Share App
            </Link>

            <button 
              onClick={handleLogout}
              className="w-full border border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Ondoka Kwenye Akaunti
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
