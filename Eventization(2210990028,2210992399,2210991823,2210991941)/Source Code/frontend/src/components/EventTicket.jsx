import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EventTicket({ registration, user, onDownload, onReady }) {
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', padding: 20 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = 297, pageHeight = 210, margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = margin;
      const y = margin + (contentHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${registration.event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`);
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  useEffect(() => {
    if (typeof onReady === 'function') onReady(downloadTicket);
  }, [onReady]);

  const event = registration.event;
  const eventDate = new Date(event?.date);

  return (
    <div className="relative">
      <div
        ref={ticketRef}
        className="rounded-2xl overflow-hidden mx-auto"
        style={{ width: '980px', padding: '20px' }}
      >
        <div className="relative flex" style={{ minHeight: '360px' }}>
          <div className="flex-1 p-8 text-white bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm tracking-widest text-emerald-300">EVENTIZATION</div>
                <div className="text-xs text-teal-200">Official Event Ticket</div>
              </div>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-extrabold tracking-wide">{event?.title}</div>
              <div className="text-emerald-300 font-semibold mt-1">{event?.category} EVENT</div>
            </div>
            <div className="flex items-end gap-8 mb-6">
              <div className="text-3xl font-extrabold tracking-wide">{eventDate.toLocaleDateString('en-GB')}</div>
              <div className="text-3xl font-extrabold tracking-wide">{eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            <div className="uppercase tracking-widest text-emerald-300 mb-6">{event?.location}</div>
            <div className="flex items-center">
              <div className="h-16 w-56 bg-[repeating-linear-gradient(90deg,_#fff_0,_#fff_2px,_transparent_2px,_transparent_4px)] rounded"></div>
            </div>
          </div>
          <div className="w-0.5 bg-white/40 relative">
            <div className="absolute inset-y-6 left-0 right-0 border-l-2 border-dashed border-white/70"></div>
          </div>
          <div className="w-64 p-6 text-white bg-gradient-to-b from-teal-900 to-emerald-800 flex flex-col">
            <div className="text-emerald-300 text-base font-bold mb-5 tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {eventDate.getDate().toString().padStart(2, '0')} {(eventDate.getMonth() + 1).toString().padStart(2, '0')} {eventDate.getFullYear()} • {eventDate.getHours().toString().padStart(2, '0')} {eventDate.getMinutes().toString().padStart(2, '0')}
            </div>
            <div className="bg-white/10 rounded-xl p-3 mb-4 text-center">
              <div className="text-teal-100 text-sm mb-2">ENTRY QR</div>
              {registration.qrCodeDataUrl && (
                <img src={registration.qrCodeDataUrl} alt="QR" className="mx-auto w-36 h-36 rounded-md bg-white p-1" />
              )}
            </div>
            <div className="mt-auto text-center text-[10px] text-teal-100/80">
              <div className="font-semibold">Eventization</div>
              <div>&copy; 2026 All rights reserved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
