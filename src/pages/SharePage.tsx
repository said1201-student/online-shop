import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, Smartphone, Info, ChevronLeft, Github, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePWA } from '../hooks/usePWA';

export default function SharePage() {
  const appUrl = window.location.origin + window.location.pathname;
  const { isInstallable, installApp } = usePWA();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Share SHOP ONL</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Install Button Section */}
        {isInstallable && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Pakua App Sasa!
            </h3>
            <p className="text-blue-100 text-sm mb-6">Pakua SHOP ONL kwenye simu yako ili uipate kwa urahisi zaidi.</p>
            <button 
              onClick={installApp}
              className="w-full bg-white text-blue-600 font-black py-4 rounded-2xl shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              <Download className="w-6 h-6" />
              INSTALL APP
            </button>
          </div>
        )}

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 text-center border border-gray-100">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Share2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Scan & Share</h2>
          <p className="text-gray-500 mb-8">Waonyeshe marafiki QR Code hii ili waweze kujiunga na SHOP ONL</p>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-100 inline-block mb-6 shadow-sm">
            <QRCodeSVG 
              value={appUrl} 
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "https://raw.githubusercontent.com/lucide-react/lucide/main/icons/shopping-bag.svg",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl break-all text-sm font-mono text-blue-600 select-all cursor-pointer">
            {appUrl}
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Iweke kwenye Simu (Install)</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                <span className="font-bold">Kumbuka:</span> Hii inafanya kazi kama APK lakini haina haja ya "kupakua" (download) - una "Add" tu kwenye simu yako!
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">1</div>
              <div>
                <p className="font-bold text-gray-800 italic underline decoration-blue-200">Android (Chrome):</p>
                <p className="text-sm text-gray-600">Bofya nukta tatu <span className="font-bold">⋮</span> juu kulia, kisha chagua <span className="text-blue-600 font-bold">"Install app"</span> au <span className="text-blue-600 font-bold">"Add to Home screen"</span>.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">2</div>
              <div>
                <p className="font-bold text-gray-800 italic underline decoration-blue-200">iPhone (Safari):</p>
                <p className="text-sm text-gray-600">Bofya alama ya <span className="font-bold">Share</span> (mshale wa juu), kisha shusha chini na uchague <span className="text-blue-600 font-bold">"Add to Home Screen"</span>.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">3</div>
              <div>
                <p className="font-bold text-gray-800">Uko tayari!</p>
                <p className="text-sm text-gray-500">Itaonekana kwenye simu yako kama App nyingine yoyote.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            SHOP ONL ni Web-App ya kisasa. Hii inamaanisha unaweza kuitumia bila kusubiri Play Store, na inachukua nafasi ndogo sana kwenye simu yako.
          </p>
        </div>
      </div>
    </div>
  );
}
