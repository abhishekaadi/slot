'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetch(`/api/slots?date=${date}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setSlots(data.data);
      });
  }, [date]);

  return (
    <div className="dashboard-container">
      <header className="flex-between">
         <h2>Slot Dashboard</h2>
         <a href="/dashboard/book" className="btn btn-primary">Book New Slot</a>
      </header>

      <div className="filters my-4">
        <label>Filter by Date: </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
      </div>

      <div className="table-wrapper">
        <table className="slot-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Time</th>
              <th>Location</th>
              <th>Category</th>
              <th>Batch / Channel</th>
              <th>Faculty</th>
              <th>Lecture Type</th>
              <th>Booked By</th>
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 ? <tr><td colSpan="8">No slots found for this date.</td></tr> : slots.map(slot => (
              <tr key={slot._id} className={`status-${slot.status?.toLowerCase()}`}>
                <td><span className={`badge ${slot.status}`}>{slot.status}</span></td>
                <td>{slot.startTime} - {slot.endTime}</td>
                <td>{slot.location}</td>
                <td>{slot.category}</td>
                <td>{slot.category === 'YT' ? slot.channelName : slot.batchName}</td>
                <td>{slot.facultyName} <br/><small>{slot.facultyEmail}</small></td>
                <td>{slot.lectureType}</td>
                <td><small>{slot.bookedBy}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
