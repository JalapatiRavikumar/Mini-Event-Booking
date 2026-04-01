const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function getEvents() {
  return request("/events");
}

export function createEvent(body) {
  return request("/events", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function createBooking(body) {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function getUserBookings(userId) {
  return request(`/users/${userId}/bookings`);
}

export function markAttendance(eventId, body) {
  return request(`/events/${eventId}/attendance`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
