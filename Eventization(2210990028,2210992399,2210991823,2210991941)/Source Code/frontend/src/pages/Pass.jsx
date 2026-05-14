import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Pass() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get('/api/registrations/me');
        setRegs(r.data.registrations || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Passes</h1>
        <p className="text-sm text-gray-500 mt-1">Show the QR code at the venue entrance for check-in. Open this page once online and passes stay cached.</p>
      </div>

      {regs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🎟️</div>
          <p className="text-gray-500 text-sm">No passes yet. Register for an event to get your pass.</p>
          <a href="/" className="text-sm text-teal-600 font-semibold hover:underline mt-2 inline-block">Browse events</a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {regs.map(r => (
            <div key={r._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-teal-200 transition-colors">
              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white px-5 py-4">
                <h3 className="font-semibold leading-snug">{r.event?.title}</h3>
                <p className="text-teal-200 text-sm mt-1">{fmtDate(r.event?.date)} &middot; {r.event?.location}</p>
              </div>
              <div className="p-5 flex flex-col items-center">
                {r.qrCodeDataUrl ? (
                  <img src={r.qrCodeDataUrl} alt="QR Code" className="h-40 w-40 rounded-xl border border-gray-200" />
                ) : (
                  <div className="h-40 w-40 bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">No QR</div>
                )}
                <span className={`mt-3 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  r.status === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


