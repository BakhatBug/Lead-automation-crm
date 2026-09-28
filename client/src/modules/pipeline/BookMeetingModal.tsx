import React, { useState } from 'react';
import { api } from '../../api/index.js';
import { X, Calendar, Video, Clock } from 'lucide-react';

interface BookMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLead?: {
    leadId: string;
    contactName: string;
    contactEmail: string;
    company: string;
  } | null;
}

export const BookMeetingModal: React.FC<BookMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLead,
}) => {
  const [title, setTitle] = useState(
    initialLead ? `Outbound Discovery - ${initialLead.company}` : 'Outbound CRM Demo'
  );
  const [contactName, setContactName] = useState(initialLead?.contactName || '');
  const [contactEmail, setContactEmail] = useState(initialLead?.contactEmail || '');
  const [company, setCompany] = useState(initialLead?.company || '');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
  const [calendarLink, setCalendarLink] = useState('https://zoom.us/j/9871234567');
  const [notes, setNotes] = useState('Prospect requested intent classification & HubSpot sync review.');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactEmail.trim()) return;

    try {
      setLoading(true);
      await api.bookMeeting({
        title: title.trim(),
        leadId: initialLead?.leadId,
        contactName: contactName.trim() || 'Prospect',
        contactEmail: contactEmail.trim(),
        company: company.trim() || 'Account',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(new Date(startTime).getTime() + 1000 * 60 * 30).toISOString(),
        calendarLink: calendarLink.trim(),
        notes: notes.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to book meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Schedule Discovery Meeting</h2>
              <p className="text-xs text-slate-400">Google Calendar & Microsoft Outlook Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Meeting Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Attendee Email Address *</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Date & Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Video Link</label>
              <input
                type="text"
                value={calendarLink}
                onChange={(e) => setCalendarLink(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Agenda / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
