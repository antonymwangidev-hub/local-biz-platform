import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { eachDayOfInterval, format, startOfMonth, endOfMonth, isSameMonth, isSameDay, parseISO } from "date-fns";

export interface Event {
  id: string;
  business_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  rsvp_count: number;
  price: number | null;
  image_url: string | null;
  created_at: string;
  business_name?: string;
  business_logo?: string;
  is_attending?: boolean;
}

interface EventCalendarProps {
  businessId?: string;
  className?: string;
}

export function EnhancedEventCalendar({ businessId, className = "" }: EventCalendarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpedEvents, setRsvpedEvents] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"month" | "week">("month");

  useEffect(() => {
    fetchEvents();
  }, [currentDate, businessId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      let query = supabase
        .from("events")
        .select("*")
        .gte("start_date", monthStart.toISOString())
        .lte("end_date", monthEnd.toISOString());

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query.order("start_date", { ascending: true });

      if (error) throw error;

      // Fetch business info for each event
      const eventsWithInfo = await Promise.all(
        (data || []).map(async (event: any) => {
          const { data: businessData } = await supabase
            .from("businesses")
            .select("name, logo_url")
            .eq("id", event.business_id)
            .single();

          return {
            ...event,
            business_name: businessData?.name,
            business_logo: businessData?.logo_url,
          };
        })
      );

      setEvents(eventsWithInfo);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      toast({
        title: "Error loading events",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (event: Event) => {
    if (!user) {
      toast({ title: "Please sign in to RSVP", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("event_rsvps").insert({
        event_id: event.id,
        user_id: user.id,
        status: "attending",
      });

      if (error) throw error;

      setRsvpedEvents((prev) => new Set([...prev, event.id]));
      toast({ title: "RSVP confirmed! 🎉", description: "See you at the event!" });
      fetchEvents();
    } catch (err: any) {
      toast({
        title: "Error confirming RSVP",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getDaysInMonth = () => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.start_date);
      return isSameDay(eventStart, date);
    });
  };

  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const goToPrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const daysInMonth = getDaysInMonth();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <Calendar className="h-5 w-5" />
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events Calendar</h2>
          <p className="text-gray-600 mt-1">Discover and RSVP to local events</p>
        </div>
        <div className="flex gap-2">
          {(["month", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                view === v ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <h3 className="text-xl font-bold text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-bold text-gray-600 text-sm p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((date) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`min-h-24 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  !isCurrentMonth
                    ? "bg-gray-50 border-gray-100 text-gray-400"
                    : isToday
                    ? "border-primary bg-primary/5"
                    : selectedDate && isSameDay(selectedDate, date)
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-primary hover:bg-gray-50"
                }`}
              >
                <p className={`text-sm font-bold mb-1 ${isToday ? "text-primary" : ""}`}>
                  {format(date, "d")}
                </p>
                {dayEvents.length > 0 && (
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-semibold truncate hover:bg-blue-200 transition-colors"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List for Selected Date */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Events on {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <div className="space-y-4">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No events scheduled for this date</p>
              </div>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={() => handleRSVP(event)}
                  isRsvped={rsvpedEvents.has(event.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-4">
          {events.slice(0, 5).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No upcoming events</p>
            </div>
          ) : (
            events
              .slice(0, 5)
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRSVP={() => handleRSVP(event)}
                  isRsvped={rsvpedEvents.has(event.id)}
                />
              ))
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedEvent.image_url && (
              <img
                src={selectedEvent.image_url}
                alt={selectedEvent.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                  {selectedEvent.business_name && (
                    <p className="text-gray-600 font-semibold">{selectedEvent.business_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-700 mb-4">{selectedEvent.description}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-blue-500" />
                  {format(parseISO(selectedEvent.start_date), "MMM d, yyyy • h:mm a")}
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-red-500" />
                  {selectedEvent.location}
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-green-500" />
                  {selectedEvent.rsvp_count} / {selectedEvent.capacity} attending
                </div>
                {selectedEvent.price && (
                  <div className="flex items-center gap-3 text-gray-700 font-bold text-lg">
                    💰 ${selectedEvent.price}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleRSVP(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  disabled={rsvpedEvents.has(selectedEvent.id) || selectedEvent.rsvp_count >= selectedEvent.capacity}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    rsvpedEvents.has(selectedEvent.id)
                      ? "bg-green-100 text-green-700"
                      : selectedEvent.rsvp_count >= selectedEvent.capacity
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {rsvpedEvents.has(selectedEvent.id) ? "✓ You're Attending" : "RSVP Now"}
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-3 rounded-lg border border-gray-300 font-bold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onRSVP: () => void;
  isRsvped: boolean;
}

function EventCard({ event, onRSVP, isRsvped }: EventCardProps) {
  const isFull = event.rsvp_count >= event.capacity;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {format(parseISO(event.start_date), "MMM d, h:mm a")}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {event.rsvp_count} / {event.capacity} attending
            </div>
          </div>
        </div>
        <button
          onClick={onRSVP}
          disabled={isRsvped || isFull}
          className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
            isRsvped
              ? "bg-green-100 text-green-700"
              : isFull
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {isRsvped ? "✓ Attending" : isFull ? "Full" : "RSVP"}
        </button>
      </div>
    </div>
  );
}

export default EnhancedEventCalendar;
