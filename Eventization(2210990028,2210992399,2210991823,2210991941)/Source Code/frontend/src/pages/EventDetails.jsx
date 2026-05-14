import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [toast, setToast] = useState(null);
  const [regBusy, setRegBusy] = useState(false);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => { load(); }, [id, user]);

  async function load() {
    try {
      const [e, r] = await Promise.all([
        axios.get(`/api/events/${id}`),
        axios.get(`/api/reviews/${id}`),
      ]);
      setEvent(e.data.event);
      setReviews(r.data.reviews || []);
      if (user) {
        const mine = r.data.reviews?.find(rv => rv.user?._id === user.id);
        setHasReviewed(!!mine);
      }
    } catch {
      showToast('error', 'Failed to load event details.');
    }
  }

  async function register() {
    setRegBusy(true);
    try {
      await axios.post(`/api/registrations/${id}/register`);
      showToast('success', 'You are registered! Check your dashboard for the QR pass.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegBusy(false);
    }
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('success', 'Link copied to clipboard!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eventization//EN', 'BEGIN:VEVENT',
      `UID:${event._id}@eventization`, `DTSTAMP:${fmt(start)}`, `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`, `SUMMARY:${event.title}`, `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`, 'END:VEVENT', 'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${event.title}.ics`; a.click();
    URL.revokeObjectURL(url);
  }

  async function submitReview() {
    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      showToast('success', 'Review posted!');
      setComment('');
      await load();
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('error', 'Please log in to post a review.');
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes('reviewed')) {
        showToast('error', 'You have already reviewed this event.');
      } else {
        showToast('error', err.response?.data?.message || 'Could not post review.');
      }
    }
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function fmtTime(d) {
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusColor = { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {toast && (
        <div className={`fixed top-16 right-4 z-50 max-w-sm rounded-xl border p-3 text-sm flex items-start gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-current opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Back to events
      </Link>

      <div className="grid md:grid-cols-5 gap-6 anim-fade-up">
        <div className="md:col-span-3">
          <img
            src={event.posterUrl || '/placeholder.svg'}
            alt={event.title}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }}
          />
        </div>
        <div className="md:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor[event.status] || 'bg-gray-100 text-gray-600'}`}>{event.status}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{event.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{event.title}</h1>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{event.description}</p>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>{fmtDate(event.date)} at {fmtTime(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500">&#9733;</span>
              <span>{event.averageRating?.toFixed(1) || '0.0'} rating &middot; {reviews.length} review{reviews.length !== 1 && 's'}</span>
            </div>
          </div>

          <div className="mt-auto pt-5 flex flex-wrap gap-2">
            {user ? (
              <button
                onClick={register}
                disabled={regBusy}
                className="bg-teal-600 text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {regBusy ? 'Registering...' : 'Register Now'}
              </button>
            ) : (
              <Link to="/login" className="bg-teal-600 text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-teal-700 transition-colors">
                Log in to Register
              </Link>
            )}
            <button onClick={shareEvent} className="border border-gray-300 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 hover:border-teal-400 transition-colors">
              Share
            </button>
            <button onClick={downloadIcs} className="border border-gray-300 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 hover:border-teal-400 transition-colors">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white border border-gray-100 rounded-2xl p-6 anim-fade-up anim-delay-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>

        {user && !hasReviewed && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5 pb-5 border-b border-gray-100">
            <select
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-20"
            >
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your review..."
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={submitReview}
              disabled={!comment.trim()}
              className="bg-teal-600 text-white text-sm font-medium rounded-xl px-4 py-2 hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              Post Review
            </button>
          </div>
        )}

        {user && hasReviewed && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">You have already reviewed this event.</p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map(r => (
              <li key={r._id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{r.user?.name || 'Anonymous'}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-amber-500 text-sm mb-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
