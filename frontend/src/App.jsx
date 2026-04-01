import { useEffect, useState } from "react";
import { createBooking, createEvent, getEvents, getUserBookings, markAttendance } from "./api";

function App() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [userBookings, setUserBookings] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    total_capacity: ""
  });
  const [bookingForm, setBookingForm] = useState({
    user_id: "",
    event_id: ""
  });
  const [attendanceForm, setAttendanceForm] = useState({
    event_id: "",
    booking_code: ""
  });

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const response = await getEvents();
      setEvents(response.data || []);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function onInput(setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function submitCreateEvent(e) {
    e.preventDefault();
    try {
      await createEvent({
        ...eventForm,
        total_capacity: Number(eventForm.total_capacity),
        date: new Date(eventForm.date).toISOString()
      });
      setFeedback({ type: "success", message: "Event created successfully." });
      setEventForm({ title: "", description: "", date: "", total_capacity: "" });
      await loadEvents();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    try {
      const response = await createBooking({
        user_id: Number(bookingForm.user_id),
        event_id: Number(bookingForm.event_id)
      });
      setFeedback({
        type: "success",
        message: `Booking created. Code: ${response.data.booking_code}`
      });
      setBookingForm({ user_id: "", event_id: "" });
      await loadEvents();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  async function submitUserBookings(e) {
    e.preventDefault();
    try {
      const response = await getUserBookings(Number(selectedUser));
      setUserBookings(response.data.bookings || []);
      setFeedback({ type: "success", message: "User bookings fetched." });
    } catch (error) {
      setUserBookings([]);
      setFeedback({ type: "error", message: error.message });
    }
  }

  async function submitAttendance(e) {
    e.preventDefault();
    try {
      const response = await markAttendance(Number(attendanceForm.event_id), {
        booking_code: attendanceForm.booking_code
      });
      setFeedback({
        type: "success",
        message: `Attendance marked. Booking ID: ${response.data.booking_id}`
      });
      setAttendanceForm({ event_id: "", booking_code: "" });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  }

  return (
    <main className="container">
      <h1>Mini Event Booking Frontend</h1>
      <p className="subtitle">Separate client for your Event Booking backend APIs.</p>

      {feedback.message ? (
        <div className={`alert ${feedback.type === "error" ? "alert-error" : "alert-success"}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="card">
        <div className="card-header">
          <h2>Upcoming Events</h2>
          <button onClick={loadEvents} disabled={loadingEvents}>
            {loadingEvents ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Date</th>
                <th>Total</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="5">No events available.</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.title}</td>
                    <td>{new Date(event.date).toLocaleString()}</td>
                    <td>{event.total_capacity}</td>
                    <td>{event.remaining_tickets}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid">
        <form className="card" onSubmit={submitCreateEvent}>
          <h2>Create Event</h2>
          <input
            placeholder="Title"
            value={eventForm.title}
            onChange={(e) => onInput(setEventForm, "title", e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={eventForm.description}
            onChange={(e) => onInput(setEventForm, "description", e.target.value)}
          />
          <input
            type="datetime-local"
            value={eventForm.date}
            onChange={(e) => onInput(setEventForm, "date", e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Total capacity"
            value={eventForm.total_capacity}
            onChange={(e) => onInput(setEventForm, "total_capacity", e.target.value)}
            required
          />
          <button type="submit">Create Event</button>
        </form>

        <form className="card" onSubmit={submitBooking}>
          <h2>Create Booking</h2>
          <input
            type="number"
            min="1"
            placeholder="User ID"
            value={bookingForm.user_id}
            onChange={(e) => onInput(setBookingForm, "user_id", e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Event ID"
            value={bookingForm.event_id}
            onChange={(e) => onInput(setBookingForm, "event_id", e.target.value)}
            required
          />
          <button type="submit">Book Ticket</button>
        </form>

        <form className="card" onSubmit={submitAttendance}>
          <h2>Mark Attendance</h2>
          <input
            type="number"
            min="1"
            placeholder="Event ID"
            value={attendanceForm.event_id}
            onChange={(e) => onInput(setAttendanceForm, "event_id", e.target.value)}
            required
          />
          <input
            placeholder="Booking code"
            value={attendanceForm.booking_code}
            onChange={(e) => onInput(setAttendanceForm, "booking_code", e.target.value)}
            required
          />
          <button type="submit">Mark Entry</button>
        </form>
      </section>

      <section className="card">
        <form className="inline-form" onSubmit={submitUserBookings}>
          <h2>User Bookings</h2>
          <input
            type="number"
            min="1"
            placeholder="User ID"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          />
          <button type="submit">Load</button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Code</th>
                <th>Event</th>
                <th>Event Date</th>
                <th>Booked At</th>
              </tr>
            </thead>
            <tbody>
              {userBookings.length === 0 ? (
                <tr>
                  <td colSpan="5">No bookings loaded.</td>
                </tr>
              ) : (
                userBookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>{booking.booking_id}</td>
                    <td>{booking.booking_code}</td>
                    <td>{booking.event_title}</td>
                    <td>{new Date(booking.event_date).toLocaleString()}</td>
                    <td>{new Date(booking.booking_date).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
