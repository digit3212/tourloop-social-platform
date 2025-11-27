import React, { useState } from 'react';
import { Calendar, MapPin, Star, MoreHorizontal, Share2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: { day: string, month: string };
  location: string;
  interestedCount: string;
  coverUrl: string;
  status: 'going' | 'interested' | 'none';
}

const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'مؤتمر المطورين السنوي', date: { day: '15', month: 'NOV' }, location: 'مركز المؤتمرات، القاهرة', interestedCount: '2.5K', coverUrl: 'https://picsum.photos/300/150?random=401', status: 'going' },
  { id: '2', title: 'حفل موسيقي خيري', date: { day: '20', month: 'DEC' }, location: 'دار الأوبرا', interestedCount: '500', coverUrl: 'https://picsum.photos/300/150?random=402', status: 'interested' },
  { id: '3', title: 'معرض الكتاب الدولي', date: { day: '05', month: 'JAN' }, location: 'أرض المعارض', interestedCount: '10K', coverUrl: 'https://picsum.photos/300/150?random=403', status: 'none' },
];

const ProfileEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[500px] animate-fadeIn p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">المناسبات</h2>
        <div className="flex gap-2">
            <button className="text-sm font-semibold text-fb-blue bg-blue-50 px-3 py-1.5 rounded-full">المقبلة</button>
            <button className="text-sm font-semibold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-full">السابقة</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {events.length > 0 ? events.map(event => (
              <div key={event.id} className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition">
                  <div className="w-full md:w-48 h-32 md:h-auto relative">
                      <img src={event.coverUrl} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-white rounded-md px-2 py-1 text-center shadow-sm">
                          <div className="text-xs font-bold text-red-500 uppercase">{event.date.month}</div>
                          <div className="text-lg font-bold text-gray-900">{event.date.day}</div>
                      </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{event.title}</h3>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" /> {event.location}
                          </div>
                          <div className="text-xs text-gray-500 mb-3">{event.interestedCount} مهتم</div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold transition flex items-center justify-center gap-2">
                              <Star className={`w-4 h-4 ${event.status !== 'none' ? 'fill-fb-blue text-fb-blue' : ''}`} />
                              {event.status === 'going' ? 'ذاهب' : event.status === 'interested' ? 'مهتم' : 'مهتم'}
                          </button>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md transition">
                              <Share2 className="w-4 h-4" />
                          </button>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md transition">
                              <MoreHorizontal className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
          )) : (
              <div className="text-center py-10 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد مناسبات قادمة.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default ProfileEvents;
