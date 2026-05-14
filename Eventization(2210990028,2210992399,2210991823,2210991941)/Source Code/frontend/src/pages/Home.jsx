import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useSocket from '../hooks/useSocket.js';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Home() {
  const { user } = useAuth();
  return user ? <LoggedInHome /> : <LandingPage />;
}

function LandingPage() {
  const [stats, setStats] = useState({ categories: [], total: 0 });

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get('/api/stats/dashboard');
        setStats({ categories: r.data?.categories || [], total: r.data?.categories?.reduce((a, c) => a + c.count, 0) || 0 });
      } catch {}
    })();
  }, []);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl anim-float" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl anim-float anim-delay-3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="max-w-2xl anim-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Platform trusted by 2,500+ students
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
              Every great memory<br />starts with an <span className="text-emerald-300">event</span>
            </h1>
            <p className="mt-5 text-lg text-teal-100 leading-relaxed max-w-xl">
              Eventization is your all-in-one campus event platform. Discover workshops, hackathons, cultural fests, and sports meets — register in one click and get your QR pass instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="bg-white text-teal-700 font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-teal-50 transition-all hover:scale-105">
                Get Started Free
              </Link>
              <a href="#features" className="border border-white/30 text-white font-medium text-sm px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors">
                See Features
              </a>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl anim-fade-up anim-delay-3">
            {[
              { n: `${stats.total || '50'}+`, l: 'Events Hosted' },
              { n: `${stats.categories.length || 4}`, l: 'Categories' },
              { n: '2.5K+', l: 'Active Students' },
              { n: '98%', l: 'Satisfaction' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold">{s.n}</div>
                <div className="text-xs text-teal-200 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4 anim-fade-up anim-delay-2">
          {[
            { icon: '⚡', title: 'Instant Registration', sub: 'One tap. No forms.' },
            { icon: '🎫', title: 'QR Code Passes', sub: 'Works offline too.' },
            { icon: '📊', title: 'Real-time Analytics', sub: 'Track everything live.' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:border-teal-200 transition-all hover:-translate-y-0.5">
              <div className="text-3xl">{c.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
                <p className="text-xs text-gray-500">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12 anim-fade-up">
          <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need, built in</h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">From discovering events to downloading your QR pass — Eventization handles the entire flow.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '📅', title: 'One-Click Registration', desc: 'Browse events and register instantly. No forms, no friction — just tap and you\'re in.' },
            { icon: '🎫', title: 'QR Code Passes', desc: 'Get a unique QR pass for every event. Works offline — just show it at the venue.' },
            { icon: '📊', title: 'Organizer Dashboard', desc: 'Create events, track registrations, export participants, and view real-time analytics.' },
            { icon: '⭐', title: 'Ratings & Reviews', desc: 'Rate events and help others find the best ones. Build a trusted community.' },
            { icon: '🔔', title: 'Live Announcements', desc: 'Real-time updates from organizers via socket-powered live announcements.' },
            { icon: '🛡️', title: 'Admin Moderation', desc: 'Every event is reviewed and approved before going live. Safe and curated.' },
          ].map((f, i) => (
            <div key={i} className={`bg-white border border-gray-100 rounded-2xl p-6 hover:border-teal-200 transition-all hover:-translate-y-1 anim-fade-up anim-delay-${i + 1}`}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-teal-50 border-y border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12 anim-fade-up">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">Three simple steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-10 max-w-3xl mx-auto text-center">
            {[
              { step: '1', title: 'Find an Event', desc: 'Browse by category or search for events happening on campus.', icon: '🔍' },
              { step: '2', title: 'Register Instantly', desc: 'One click to register. You\'ll get a QR pass immediately.', icon: '✅' },
              { step: '3', title: 'Show Up & Enjoy', desc: 'Show your QR at the venue. Rate the event afterwards.', icon: '🎉' },
            ].map((s, i) => (
              <div key={i} className={`anim-fade-up anim-delay-${i + 1}`}>
                <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white text-2xl flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <div className="text-xs text-teal-600 font-bold uppercase tracking-wider mb-1">Step {s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="anim-fade-up">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">For Students</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Never miss what matters</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Whether it's a hackathon, a debate competition, or a music night — Eventization keeps you in the loop. Get personalized recommendations, instant passes, and rate your experience.
            </p>
            <ul className="space-y-3">
              {['Browse events by category & search', 'One-tap registration with QR pass', 'Offline-ready passes for venue entry', 'Rate and review past events'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="anim-fade-up anim-delay-2">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">For Organizers</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Run events like a pro</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Create your event in minutes. Track who's coming, export participant lists, and let attendees rate you. All from one dashboard.
            </p>
            <ul className="space-y-3">
              {['Create events with poster upload', 'Track registrations in real-time', 'Export participant data as CSV', 'View ratings and feedback'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="help" className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12 anim-fade-up">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">Support</p>
            <h2 className="text-3xl font-bold text-gray-900">Help Centre</h2>
            <p className="mt-2 text-gray-500">Got questions? We've got answers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '📖', title: 'Getting Started', desc: 'Create an account and register for your first event in under a minute.' },
              { icon: '🎟️', title: 'Passes & QR Codes', desc: 'How to view, download, and use your event passes for venue check-in.' },
              { icon: '🛠️', title: 'For Organizers', desc: 'Creating events, managing participants, exporting data — all covered.' },
              { icon: '✉️', title: 'Contact Support', desc: 'Reach us at support@eventization.com for anything else.' },
            ].map((h, i) => (
              <div key={i} className={`bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center hover:border-teal-200 transition-all hover:-translate-y-1 anim-fade-up anim-delay-${i + 1}`}>
                <div className="text-3xl mb-3">{h.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{h.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10 anim-fade-up">
          <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider mb-2">FAQ</p>
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3 anim-fade-up anim-delay-2">
          {[
            { q: 'Is Eventization free to use?', a: 'Yes! Browsing events and registering is completely free for all students. Organizers can create events at no cost.' },
            { q: 'How do I get my event pass?', a: 'After registering, go to "My Passes" in your dashboard. Each pass includes a unique QR code for venue entry.' },
            { q: 'Can I organize my own event?', a: 'Absolutely. Sign up as an Organizer, create your event from the dashboard, and it will go live after admin approval.' },
            { q: 'What if I can\'t attend after registering?', a: 'No worries — there\'s no penalty. We just encourage you to only register for events you plan to attend.' },
            { q: 'How are events moderated?', a: 'Every event goes through admin review before being published, ensuring quality and safety.' },
            { q: 'Can I use my pass offline?', a: 'Yes. Open "My Passes" once while online and your QR codes will be cached for offline use.' },
          ].map((f, i) => (
            <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-gray-800 hover:text-teal-700 transition-colors">
                {f.q}
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center anim-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-teal-100 mb-8 max-w-md mx-auto">Join thousands of students already using Eventization. Free forever.</p>
          <div className="flex justify-center gap-3">
            <Link to="/signup" className="bg-white text-teal-700 font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-teal-50 transition-all hover:scale-105">
              Create Free Account
            </Link>
            <Link to="/login" className="border border-white/40 text-white font-medium text-sm px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoggedInHome() {
  const { user } = useAuth();
  const { announcements } = useSocket(window.location.origin);

  const roleTabs = {
    customer: [
      { id: 'explore', label: 'Explore Events', icon: '🔍' },
      { id: 'regs', label: 'My Registrations', icon: '📋' },
      { id: 'passes', label: 'My Passes', icon: '🎫' },
    ],
    organizer: [
      { id: 'explore', label: 'Explore Events', icon: '🔍' },
      { id: 'myevents', label: 'My Events', icon: '📊' },
      { id: 'create', label: 'Create Event', icon: '✨' },
    ],
    admin: [
      { id: 'explore', label: 'Explore Events', icon: '🔍' },
      { id: 'pending', label: 'Pending Approval', icon: '🛡️' },
    ],
  };
  const tabs = roleTabs[user?.role] || roleTabs.customer;
  const [tab, setTab] = useState('explore');

  const [events, setEvents] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const cats = ['All', 'Tech', 'Sports', 'Cultural', 'Workshop'];

  const [myData, setMyData] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [downloadAction, setDownloadAction] = useState(null);
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [loc, setLoc] = useState('');
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState(null);

  function showToast(type, message) { setToast({ type, message }); setTimeout(() => setToast(null), 3500); }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => {
    if (!user) return;
    if (user.role === 'customer') loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    if (user.role === 'admin') loadPending();
    fetchRecs();
  }, [user]);

  async function fetchEvents(overrides = {}) {
    setLoading(true); setError('');
    try {
      const params = {};
      const effQ = overrides.q !== undefined ? overrides.q : q;
      const effCat = overrides.category !== undefined ? overrides.category : catFilter;
      if (effQ) params.q = effQ;
      if (effCat) params.category = effCat;
      const res = await axios.get('/api/events', { params });
      setEvents(res.data.events || []);
    } catch { setError('Could not load events.'); }
    finally { setLoading(false); }
  }
  async function fetchRecs() { 
  try { 
    if (!user) return;
    const r = await axios.get('/api/stats/recommendations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }); 
    setRecs(r.data.events || []); 
  } catch (err) { 
    console.error('Failed to fetch recommendations:', err);
    setRecs([]); 
  } 
}
  async function loadMyRegs() { try { const r = await axios.get('/api/registrations/me'); setMyData(r.data.registrations || []); } catch {} }
  async function loadMyEvents() { try { const r = await axios.get('/api/events', { params: { organizer: user.id } }); setMyData(r.data.events || []); } catch {} }
  async function loadPending() { try { const r = await axios.get('/api/events', { params: { status: 'pending' } }); setPendingEvents(r.data.events || []); } catch {} }
  async function loadParticipants(eid) { try { const r = await axios.get(`/api/registrations/${eid}/participants`); setParticipants(r.data.participants || []); } catch {} }

  async function exportCsv(eid) {
    try {
      const check = await axios.get(`/api/registrations/${eid}/participants`);
      if (!check.data.participants?.length) { showToast('error', 'No participants.'); return; }
      const res = await axios.get(`/api/registrations/${eid}/participants.csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `participants-${eid}.csv`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { showToast('error', 'Export failed.'); }
  }

  async function createEvent(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('date', date); fd.append('location', loc);
      fd.append('category', category); fd.append('description', description);
      if (poster) fd.append('poster', poster);
      await axios.post('/api/events', fd);
      setTitle(''); setDate(''); setLoc(''); setDescription(''); setPoster(null);
      showToast('success', 'Event created! It will appear after admin approval.');
      await loadMyEvents();
      setTab('myevents');
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to create event.'); }
  }

  async function approve(id) { try { await axios.post(`/api/admin/events/${id}/approve`); showToast('success', 'Approved!'); await loadPending(); } catch { showToast('error', 'Failed.'); } }
  async function reject(id) { try { await axios.post(`/api/admin/events/${id}/reject`); showToast('success', 'Rejected.'); await loadPending(); } catch { showToast('error', 'Failed.'); } }

  const downloadTicketPDF = async (registration) => {
    try {
      const ev = registration.event;
      const evDate = new Date(ev?.date);
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:980px;padding:20px;';
      document.body.appendChild(tempDiv);
      tempDiv.innerHTML = `<div style="width:980px;padding:20px;"><div style="display:flex;min-height:320px;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;"><div style="flex:1;padding:32px;color:white;background:linear-gradient(135deg,#0d9488,#059669);"><div style="font-size:12px;letter-spacing:0.1em;opacity:0.7;margin-bottom:24px;">EVENTIZATION TICKET</div><div style="font-size:28px;font-weight:700;margin-bottom:8px;">${ev?.title}</div><div style="font-size:14px;opacity:0.8;margin-bottom:24px;">${ev?.category}</div><div style="font-size:22px;font-weight:700;margin-bottom:4px;">${evDate.toLocaleDateString('en-GB')}</div><div style="font-size:18px;opacity:0.8;margin-bottom:16px;">${evDate.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div><div style="font-size:14px;opacity:0.8;">${ev?.location}</div></div><div style="width:220px;padding:24px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;">${registration.qrCodeDataUrl ? `<img src="${registration.qrCodeDataUrl}" style="width:140px;height:140px;border-radius:8px;" />` : ''}<div style="margin-top:12px;font-size:11px;color:#64748b;text-align:center;">Scan for entry</div></div></div></div>`;
      await new Promise(r => setTimeout(r, 800));
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const w = 267, h = (canvas.height * 267) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 15 + (180 - h) / 2, w, h);
      pdf.save(`${ev?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`);
      document.body.removeChild(tempDiv);
    } catch { showToast('error', 'Could not generate PDF.'); }
  };

  function handleSearch(e) { e.preventDefault(); fetchEvents(); }
  function pickCat(c) { const next = c === 'All' ? '' : c; setCatFilter(next); fetchEvents({ category: next }); }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 md:pt-12 md:pb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 anim-fade-up">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-teal-100 text-sm mt-1">Your campus event hub — explore, register, and manage everything here.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
              <div className="w-10 h-10 rounded-full bg-white/20 text-white text-lg flex items-center justify-center font-bold">{user?.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-teal-200 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white border border-gray-100 rounded-2xl inline-flex p-1 gap-1 anim-fade-up anim-delay-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 anim-slide-down">
            <span className="text-amber-500 mt-0.5 text-lg">📢</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Live Announcements</p>
              <ul className="text-sm text-amber-700 space-y-0.5">
                {announcements.slice(0, 3).map((a, i) => <li key={i}>{a.message}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {tab === 'explore' && (
          <div className="space-y-6 anim-fade-in">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {cats.map(c => {
                  const active = (c === 'All' && !catFilter) || c === catFilter;
                  return (
                    <button key={c} onClick={() => pickCat(c)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                      }`}>{c}</button>
                  );
                })}
              </div>
              <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Search events..."
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                </div>
                <button type="submit" className="bg-teal-600 text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-teal-700 transition-colors">Search</button>
              </form>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{error}</div>}

            {recs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><span className="text-teal-600">✦</span> Recommended for you</h2>
                {recs.length <= 2 ? (
                  <div className="space-y-4">
                    {recs.map((ev, i) => (
                      <Link to={`/events/${ev._id}`} key={ev._id} className={`group flex flex-col sm:flex-row bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-teal-300 transition-all hover:-translate-y-0.5 anim-fade-up anim-delay-${i + 1}`}>
                        <div className="sm:w-72 flex-shrink-0 overflow-hidden">
                          <img src={ev.posterUrl || '/placeholder.svg'} alt={ev.title} className="w-full h-48 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} loading="lazy" />
                        </div>
                        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ev.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{ev.status}</span>
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{ev.category}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">{ev.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ev.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                              {fmtDate(ev.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                              {ev.location}
                            </span>
                            <span className="text-amber-500 font-semibold">{ev.averageRating?.toFixed(1) || '0.0'} ★</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recs.map((ev, i) => <EventCard key={ev._id} ev={ev} fmtDate={fmtDate} delay={i} />)}
                  </div>
                )}
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">All Events</h2>
                <span className="text-xs text-gray-400">{events.length} events</span>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-20 text-gray-400 anim-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 text-3xl flex items-center justify-center mx-auto mb-4">🔍</div>
                  <p className="text-sm font-medium text-gray-500">No events found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search or category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {events.map((ev, i) => <EventCard key={ev._id} ev={ev} fmtDate={fmtDate} delay={i % 6} />)}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'regs' && user?.role === 'customer' && (
          <div className="space-y-4 anim-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { n: myData.length, label: 'Total Events', icon: '📅', color: 'from-teal-500 to-teal-600' },
                { n: myData.filter(r => r.status === 'registered').length, label: 'Confirmed', icon: '✅', color: 'from-emerald-500 to-emerald-600' },
                { n: myData.filter(r => r.status !== 'registered').length, label: 'Pending', icon: '⏳', color: 'from-amber-500 to-amber-600' },
                { n: myData.filter(r => r.qrCodeDataUrl).length, label: 'Passes Ready', icon: '🎫', color: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all cursor-default anim-fade-up anim-delay-${i + 1}`}>
                  <div className="flex items-center justify-between mb-3"><span className="text-2xl">{s.icon}</span><span className="text-3xl font-extrabold">{s.n}</span></div>
                  <p className="text-sm text-white/80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">My Registrations</h2>
                <span className="text-xs text-gray-400">{myData.length} total</span>
              </div>
              {myData.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-3xl flex items-center justify-center mx-auto mb-4">🎫</div>
                  <p className="text-sm text-gray-500 mb-2">No registrations yet.</p>
                  <button onClick={() => setTab('explore')} className="inline-flex items-center gap-1 text-sm text-teal-600 font-semibold hover:underline">
                    Browse events <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myData.map((r, i) => (
                    <div key={r._id} className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{r.event?.title?.charAt(0)?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{r.event?.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{fmtDate(r.event?.date)} · {r.event?.location}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${r.status === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.qrCodeDataUrl && <img src={r.qrCodeDataUrl} className="h-11 w-11 rounded-lg border border-gray-200" alt="QR" />}
                        <button onClick={() => setSelectedTicket(r)} className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 hover:bg-teal-100 transition-all hover:-translate-y-0.5">View</button>
                        <button onClick={() => downloadTicketPDF(r)} className="text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl px-3 py-2 hover:from-teal-700 hover:to-emerald-700 transition-all hover:-translate-y-0.5">PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'passes' && user?.role === 'customer' && (
          <div className="anim-fade-in">
            <p className="text-sm text-gray-500 mb-4">Show the QR code at the venue for check-in. Open this page once online and passes stay cached.</p>
            {myData.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">🎟️</div>
                <p className="text-gray-500 text-sm">No passes yet.</p>
                <button onClick={() => setTab('explore')} className="text-sm text-teal-600 font-semibold hover:underline mt-2">Browse events</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myData.map((r, i) => (
                  <div key={r._id} className={`bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-teal-200 transition-all hover:-translate-y-1 anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                    <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white px-5 py-4">
                      <h3 className="font-semibold leading-snug">{r.event?.title}</h3>
                      <p className="text-teal-200 text-sm mt-1">{fmtDate(r.event?.date)} · {r.event?.location}</p>
                    </div>
                    <div className="p-5 flex flex-col items-center">
                      {r.qrCodeDataUrl ? (
                        <img src={r.qrCodeDataUrl} alt="QR Code" className="h-40 w-40 rounded-xl border border-gray-200" />
                      ) : (
                        <div className="h-40 w-40 bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">No QR</div>
                      )}
                      <span className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full ${r.status === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'myevents' && user?.role === 'organizer' && (
          <div className="space-y-4 anim-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { n: myData.length, label: 'Total Events', icon: '📊', color: 'from-teal-500 to-teal-600' },
                { n: myData.filter(e => e.status === 'approved').length, label: 'Live', icon: '🟢', color: 'from-emerald-500 to-emerald-600' },
                { n: myData.filter(e => e.status === 'pending').length, label: 'In Review', icon: '⏳', color: 'from-amber-500 to-amber-600' },
                { n: [...new Set(myData.map(e => e.category))].length, label: 'Categories', icon: '🏷️', color: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all cursor-default anim-fade-up anim-delay-${i + 1}`}>
                  <div className="flex items-center justify-between mb-3"><span className="text-2xl">{s.icon}</span><span className="text-3xl font-extrabold">{s.n}</span></div>
                  <p className="text-sm text-white/80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">My Events</h2>
                <button onClick={() => setTab('create')} className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-100 transition-all">+ New Event</button>
              </div>
              {myData.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 text-3xl flex items-center justify-center mx-auto mb-3">📅</div>
                  <p className="text-sm text-gray-400">No events yet. Create your first one!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myData.map((ev, i) => {
                    const sCls = ev.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ev.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                    return (
                      <div key={ev._id} className={`px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">{ev.title?.charAt(0)?.toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{ev.title}</p>
                          <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sCls}`}>{ev.status}</span>
                        </div>
                        <button onClick={() => { setSelectedEventId(ev._id); loadParticipants(ev._id); }} className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1.5 hover:bg-teal-100 transition-all whitespace-nowrap">Attendees</button>
                        <button onClick={() => exportCsv(ev._id)} className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-all whitespace-nowrap">CSV</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedEventId && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden anim-scale-in">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Participants</h2>
                  <button onClick={() => setSelectedEventId('')} className="text-xs font-medium text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg px-2.5 py-1">Close</button>
                </div>
                {participants.length === 0 ? (
                  <div className="text-center py-10"><p className="text-sm text-gray-400">No participants yet.</p></div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {participants.map(p => (
                      <div key={p._id} className="px-6 py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">{p.user?.name?.charAt(0)?.toUpperCase()}</div>
                          <div><p className="font-medium text-gray-800">{p.user?.name}</p><p className="text-xs text-gray-400">{p.user?.email}</p></div>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'create' && user?.role === 'organizer' && (
          <div className="max-w-lg mx-auto anim-fade-in">
            <form onSubmit={createEvent} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><span className="text-lg">✨</span> Create New Event</h2>
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
                  <input className={inputCls} placeholder="Venue or online link" required value={loc} onChange={e => setLoc(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea className={`${inputCls} min-h-[80px]`} rows="3" placeholder="What's this event about?" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Poster Image</label>
                  <input className={inputCls} type="file" accept="image/*" onChange={e => setPoster(e.target.files[0])} />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold rounded-xl px-4 py-3 hover:from-teal-700 hover:to-emerald-700 transition-all hover:-translate-y-0.5">
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === 'pending' && user?.role === 'admin' && (
          <div className="space-y-4 anim-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { n: pendingEvents.length, label: 'Pending Review', icon: '⏳', color: 'from-amber-500 to-amber-600' },
                { n: '∞', label: 'Platform Reach', icon: '🌍', color: 'from-teal-500 to-teal-600' },
                { n: 'Admin', label: 'Access Level', icon: '🛡️', color: 'from-violet-500 to-violet-600' },
              ].map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white hover:-translate-y-1 transition-all cursor-default anim-fade-up anim-delay-${i + 1}`}>
                  <div className="flex items-center justify-between mb-3"><span className="text-2xl">{s.icon}</span><span className="text-3xl font-extrabold">{s.n}</span></div>
                  <p className="text-sm text-white/80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Events Awaiting Approval</h2>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{pendingEvents.length} pending</span>
              </div>
              {pendingEvents.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center mx-auto mb-4">✅</div>
                  <p className="text-gray-500 text-sm font-medium">All caught up!</p>
                  <p className="text-gray-400 text-xs mt-1">No events waiting for review.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {pendingEvents.map((ev, i) => (
                    <div key={ev._id} className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors anim-fade-up anim-delay-${Math.min(i + 1, 6)}`}>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{ev.title?.charAt(0)?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{ev.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">by <span className="font-medium text-gray-700">{ev.organizer?.name}</span> · <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-600">{ev.category}</span></p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => approve(ev._id)} className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl px-5 py-2 hover:from-emerald-600 hover:to-emerald-700 transition-all hover:-translate-y-0.5">Approve</button>
                        <button onClick={() => reject(ev._id)} className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-5 py-2 hover:bg-red-100 transition-all hover:-translate-y-0.5">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
              <EventTicket registration={selectedTicket} user={user} onReady={fn => setDownloadAction(() => fn)} onDownload={() => {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, fmtDate, delay = 0 }) {
  const sc = { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };
  return (
    <Link to={`/events/${ev._id}`} className={`group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-200 transition-all duration-300 hover:-translate-y-1.5 anim-fade-up anim-delay-${delay + 1}`}>
      <div className="relative overflow-hidden">
        <img src={ev.posterUrl || '/placeholder.svg'} alt={ev.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${sc[ev.status] || 'bg-gray-100 text-gray-600'}`}>{ev.status}</span>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700">{ev.category}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="text-amber-400">★</span> {ev.averageRating?.toFixed(1) || '0.0'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 leading-snug group-hover:text-teal-700 transition-colors">{ev.title}</h3>
        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{ev.description}</p>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {fmtDate(ev.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            {ev.location}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2"><div className="h-5 w-16 bg-gray-200 rounded-full" /><div className="h-5 w-14 bg-gray-200 rounded-full" /></div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}
