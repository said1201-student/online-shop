import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyOrders, Order } from '../services/orderService';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
    processing: { color: 'bg-blue-100 text-blue-700', icon: <Package className="w-4 h-4" /> },
    shipped: { color: 'bg-indigo-100 text-indigo-700', icon: <Truck className="w-4 h-4" /> },
    delivered: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  };
  const config = configs[status] || configs.pending;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadOrders();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Tafadhali ingia kuona oda zako.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white shadow-sm border-b border-gray-100 mb-8 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Rudi Nyumbani</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Oda Zangu</h1>
          <p className="text-gray-500 mt-1">Fuatilia oda zako zote hapa.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Inapakia oda...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">Huna oda yoyote bado.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Anza Kununua Punde
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Order ID</p>
                    <p className="text-sm font-mono text-gray-600">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Total Price</p>
                    <p className="text-xl font-black text-blue-600">${order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50">
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-xs font-bold text-gray-500">
                            {item.quantity}x
                          </span>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
