import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import AttendancePredictor from '../components/AttendancePredictor.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [poster, setPoster] = useState(null);
  const [pending, setPending] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [prediction, setPrediction] = useState(null);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    if (!user) return;
    if (user.role === 'customer') loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    if (user.role === 'admin') loadPending();
  }, [user]);

  
  async function loadMyRegs() {
    try {
      const res = await axios.get('/api/registrations/me');
      setMine(res.data.registrations || []);
    } catch { showToast('error', 'Could not load registrations.'); }
  }

  async function loadMyEvents() {
    try {
      const res = await axios.get('/api/events', { params: { organizer: user.id } });
      setMine(res.data.events || []);
    } catch { showToast('error', 'Could not load events.'); }
  }

  async function loadPending() {
    try {
      const res = await axios.get('/api/events', { params: { status: 'pending' } });
      setPending(res.data.events || []);
    } catch { showToast('error', 'Could not load pending events.'); }
  }

  async function loadParticipants(eventId) {
    try {
      const res = await axios.get(`/api/registrations/${eventId}/participants`);
      setParticipants(res.data.participants || []);
    } catch { showToast('error', 'Could not load participants.'); }
  }

  async function exportCsv(eventId) {
    try {
      const check = await axios.get(`/api/registrations/${eventId}/participants`);
      if (!check.data.participants?.length) { showToast('error', 'No participants to export.'); return; }
      const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `participants-${eventId}.csv`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { showToast('error', 'Export failed.'); }
  }

  async function createEvent(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('date', date); fd.append('location', location);
      fd.append('category', category); fd.append('description', description);
      fd.append('capacity', capacity || 100);
      if (poster) fd.append('poster', poster);
      await axios.post('/api/events', fd);
      setTitle(''); setDate(''); setLocation(''); setDescription(''); setCapacity(''); setPoster(null);
      setPrediction(null);
      showToast('success', 'Event created! It will appear after admin approval.');
      await loadMyEvents();
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to create event.'); }
  }

  async function approve(id) {
    try { await axios.post(`/api/admin/events/${id}/approve`); showToast('success', 'Event approved.'); await loadPending(); }
    catch { showToast('error', 'Approval failed.'); }
  }

  async function reject(id) {
    try { await axios.post(`/api/admin/events/${id}/reject`); showToast('success', 'Event rejected.'); await loadPending(); }
    catch { showToast('error', 'Rejection failed.'); }
  }

  const downloadTicketDirect = async (registration) => {
    try {
      const ev = registration.event;
      const evDate = new Date(ev?.date);
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:980px;padding:20px;';
      document.body.appendChild(tempDiv);
      tempDiv.innerHTML = `
        <div style="width:980px;padding:20px;">
          <div style="display:flex;min-height:320px;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="flex:1;padding:32px;color:white;background:linear-gradient(135deg,#0d9488,#059669);">
              <div style="font-size:12px;letter-spacing:0.1em;opacity:0.7;margin-bottom:24px;">EVENTIZATION TICKET</div>
              <div style="font-size:28px;font-weight:700;margin-bottom:8px;">${ev?.title}</div>
              <div style="font-size:14px;opacity:0.8;margin-bottom:24px;">${ev?.category}</div>
              <div style="font-size:22px;font-weight:700;margin-bottom:4px;">${evDate.toLocaleDateString('en-GB')}</div>
              <div style="font-size:18px;opacity:0.8;margin-bottom:16px;">${evDate.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
              <div style="font-size:14px;opacity:0.8;">${ev?.location}</div>
            </div>
            <div style="width:220px;padding:24px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              ${registration.qrCodeDataUrl ? `<img src="${registration.qrCodeDataUrl}" style="width:140px;height:140px;border-radius:8px;" />` : ''}
              <div style="margin-top:12px;font-size:11px;color:#64748b;text-align:center;">Scan for entry</div>
            </div>
          </div>
        </div>`;
      await new Promise(r => setTimeout(r, 800));
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const w = 267, h = (canvas.height * 267) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 15 + (180 - h) / 2, w, h);
      pdf.save(`${ev?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`);
      document.body.removeChild(tempDiv);
    } catch { showToast('error', 'Could not generate PDF.'); }
  };

  const analytics = useMemo(() => {
    const byStatus = {}, byCategory = {};
    mine.forEach(e => {
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    });
    return { byStatus, byCategory };
  }, [mine]);

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all';

  const roleGreeting = {
    customer: { emoji: '🎟️', sub: 'Your events, passes, and registrations — all in one place.' },
    organizer: { emoji: '📋', sub: 'Create events, track attendees, and grow your community.' },
    admin: { emoji: '🛡️', sub: 'Review submissions and keep the platform running smoothly.' },
  };
  const greet = roleGreeting[user?.role] || roleGreeting.customer;

  return (
    <div className="min-h-screen">
      {toast && (
        <div className={`fixed top-16 right-4 z-50 max-w-sm rounded-xl border p-3 text-sm flex items-start gap-2 anim-slide-down ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 anim-fade-up">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{greet.emoji}</span>
                <h1 className="text-2xl md:text-3xl font-bold">Hey, {user?.name?.split(' ')[0]}!</h1>
              </div>
              <p className="text-teal-100 text-sm max-w-md">{greet.sub}</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
              <div className="w-10 h-10 rounded-full bg-white/20 text-white text-lg flex items-center justify-center font-bold">{user?.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-teal-200 text-xs capitalize">{user?.role} Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12 space-y-6">

        {user?.role === 'customer' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-fade-up anim-delay-1">
              {[
                { n: mine.length, label: 'Total Events', icon: '📅', color: 'from-teal-500 to-teal-600' },
                { n: mine.filter(r => r.status === 'registered').length, label: 'Confirmed', icon: '✅', color: 'from-emerald-500 to-emerald-600' },
                { n: mine.filter(r => r.status !== 'registered').length, label: 'Pending', icon: '⏳', color: 'from-amber-500 to-amber-600' },
                { n: mine.filter(r => r.qrCodeDataUrl).length, label: 'Passes Ready', icon: '🎫', color: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all cursor-default`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-3xl font-extrabold">{s.n}</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden anim-fade-up anim-delay-2">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">My Registrations</h2>
                <span className="text-xs text-gray-400">{mine.length} total</span>
              </div>
              {mine.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-3xl flex items-center justify-center mx-auto mb-4">🎫</div>
                  <p className="text-sm text-gray-500 mb-2">You haven't registered for any events yet.</p>
                  <a href="/" className="inline-flex items-center gap-1 text-sm text-teal-600 font-semibold hover:underline">
                    Browse events
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {mine.map((r, i) => (
                    <div key={r._id} className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {r.event?.title?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{r.event?.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          {new Date(r.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="text-gray-300">·</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                          {r.event?.location}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        r.status === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{r.status}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.qrCodeDataUrl && <img src={r.qrCodeDataUrl} className="h-11 w-11 rounded-lg border border-gray-200" alt="QR" />}
                        <button onClick={() => setSelectedTicket(r)} className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 hover:bg-teal-100 transition-all hover:-translate-y-0.5">View</button>
                        <button onClick={() => downloadTicketDirect(r)} className="text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl px-3 py-2 hover:from-teal-700 hover:to-emerald-700 transition-all hover:-translate-y-0.5">PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {user?.role === 'organizer' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-fade-up anim-delay-1">
              {[
                { n: mine.length, label: 'Total Events', icon: '📊', color: 'from-teal-500 to-teal-600' },
                { n: mine.filter(e => e.status === 'approved').length, label: 'Live', icon: '🟢', color: 'from-emerald-500 to-emerald-600' },
                { n: mine.filter(e => e.status === 'pending').length, label: 'In Review', icon: '⏳', color: 'from-amber-500 to-amber-600' },
                { n: Object.keys(analytics.byCategory).length, label: 'Categories', icon: '🏷️', color: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all cursor-default`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-3xl font-extrabold">{s.n}</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              <form onSubmit={createEvent} className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden self-start anim-fade-up anim-delay-2">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-lg">✨</span> Create New Event
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                    <input className={inputCls} placeholder="Event title" required value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                      <input className={inputCls} type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                      <select className={`${inputCls} bg-gray-50`} value={category} onChange={e => setCategory(e.target.value)}>
                        <option>Tech</option><option>Sports</option><option>Cultural</option><option>Workshop</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                    <input className={inputCls} placeholder="Venue or online link" required value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Capacity</label>
                    <input className={inputCls} type="number" placeholder="Expected capacity" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea className={`${inputCls} min-h-[80px]`} rows="3" placeholder="What's this event about?" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Poster Image</label>
                    <input className={inputCls} type="file" accept="image/*" onChange={e => setPoster(e.target.files[0])} />
                  </div>
                  
                  <AttendancePredictor 
                    eventData={{
                      title,
                      description,
                      category,
                      date,
                      location,
                      capacity: capacity ? parseInt(capacity) : 100
                    }}
                    onPrediction={setPrediction}
                    organizerData={user}
                  />
                  
                  <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold rounded-xl px-4 py-3 hover:from-teal-700 hover:to-emerald-700 transition-all hover:-translate-y-0.5">
                    Publish Event
                  </button>
                </div>
              </form>

              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden anim-fade-up anim-delay-3">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">My Events</h2>
                    <span className="text-xs text-gray-400">{mine.length} events</span>
                  </div>
                  {mine.length === 0 ? (
                    <div className="text-center py-12 px-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 text-3xl flex items-center justify-center mx-auto mb-3">📅</div>
                      <p className="text-sm text-gray-400">No events created yet. Use the form to publish your first event.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {mine.map((ev, i) => {
                        const statusCls = ev.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ev.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                        return (
                          <div key={ev._id} className={`px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {ev.title?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{ev.title}</p>
                              <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls}`}>{ev.status}</span>
                            </div>
                            <button onClick={() => { setSelectedEvent(ev._id); loadParticipants(ev._id); }} className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1.5 hover:bg-teal-100 transition-all whitespace-nowrap">Attendees</button>
                            <button onClick={() => exportCsv(ev._id)} className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-all whitespace-nowrap">CSV</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedEvent && (
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden anim-scale-in">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900">Participants</h2>
                      <button onClick={() => setSelectedEvent('')} className="text-xs font-medium text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg px-2.5 py-1">Close</button>
                    </div>
                    {participants.length === 0 ? (
                      <div className="text-center py-10 px-6">
                        <p className="text-sm text-gray-400">No participants registered yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {participants.map(p => (
                          <div key={p._id} className="px-6 py-3 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">{p.user?.name?.charAt(0)?.toUpperCase()}</div>
                              <div>
                                <p className="font-medium text-gray-800">{p.user?.name}</p>
                                <p className="text-xs text-gray-400">{p.user?.email}</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{p.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 anim-fade-up anim-delay-1">
              {[
                { n: pending.length, label: 'Pending Review', icon: '⏳', color: 'from-amber-500 to-amber-600' },
                { n: '∞', label: 'Platform Reach', icon: '🌍', color: 'from-teal-500 to-teal-600' },
                { n: 'Admin', label: 'Access Level', icon: '🛡️', color: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all cursor-default`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-3xl font-extrabold">{s.n}</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden anim-fade-up anim-delay-2">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Events Awaiting Approval</h2>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{pending.length} pending</span>
              </div>
              {pending.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center mx-auto mb-4">✅</div>
                  <p className="text-gray-500 text-sm font-medium">All caught up!</p>
                  <p className="text-gray-400 text-xs mt-1">No events are waiting for your review.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pending.map((ev, i) => (
                    <div key={ev._id} className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {ev.title?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{ev.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          by <span className="font-medium text-gray-700">{ev.organizer?.name}</span>
                          <span className="text-gray-300">·</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-600">{ev.category}</span>
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => approve(ev._id)} className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl px-5 py-2 hover:from-emerald-600 hover:to-emerald-700 transition-all hover:-translate-y-0.5">Approve</button>
                        <button onClick={() => reject(ev._id)} className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-5 py-2 hover:bg-red-100 transition-all hover:-translate-y-0.5">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 anim-fade-in" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto anim-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Event Ticket</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadAction && downloadAction()} className="text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl px-4 py-2 hover:from-teal-700 hover:to-emerald-700 transition-all">Download PDF</button>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
            </div>
            <div className="p-6">
              <EventTicket
                registration={selectedTicket}
                user={user}
                onReady={fn => setDownloadAction(() => fn)}
                onDownload={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
