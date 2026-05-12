import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl shadow-gray-200/50 max-w-md w-full text-center border border-gray-100">
        <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
        <p className="text-xl font-bold text-gray-800 mb-2">Samahani, Ukurasa Haupo</p>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Ukurasa unaotafuta huenda ulikosewa, ulifutwa, au hauonekani kwa sasa.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 w-full justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
          Rudi Nyumbani
        </Link>
      </div>
    </div>
  );
}
