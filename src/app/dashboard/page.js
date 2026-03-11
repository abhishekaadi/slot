'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    // Set today's date on mount to avoid hydration mismatch
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (!date) return;
    fetch(`/api/slots?date=${date}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setSlots(data.data);
      })
      .catch(err => {
        console.error("Dashboard fetch error:", err);
      });
  }, [date]);

  const updateStatus = async (id, action) => {
    if(!confirm(`Are you sure you want to ${action} this slot?`)) return;
    
    try {
       const res = await fetch(`/api/slots/${id}`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ action })
       });
       if(res.ok) {
           // Reload slots
           const newRes = await fetch(`/api/slots?date=${date}`);
           const newData = await newRes.json();
           if(newData.success) setSlots(newData.data);
       }
    } catch(err) {
       alert("Failed: " + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="flex-between">
         <h2>Slot Dashboard</h2>
         <Link href="/dashboard/book" className="btn btn-primary">Book New Slot</Link>
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
            {slots.length === 0 ? (
                <tr>
                    <td colSpan="9" style={{textAlign: 'center', padding: '3rem', color: '#8b949e'}}>
                        <div style={{fontSize: '2rem', marginBottom: '1rem'}}>📅</div>
                        No slots booked for this date.<br/>
                        Click "Book New Slot" to add one.
                    </td>
                </tr>
            ) : slots.map(slot => (
              <tr key={slot._id} className={`status-${slot.status?.toLowerCase()}`}>
                <td><span className={`badge ${slot.status}`}>{slot.status}</span></td>
                <td>{slot.startTime} - {slot.endTime}</td>
                <td>{slot.location}</td>
                <td>{slot.category}</td>
                <td>{slot.category === 'YT' ? slot.channelName : slot.batchName}</td>
                <td>{slot.facultyName} <br/><small style={{color: '#8b949e'}}>{slot.facultyEmail}</small></td>
                <td>{slot.lectureType} <br/> {slot.rec && <span className="badge" style={{background: '#30363d'}}>REC</span>}</td>
                <td><small style={{color: '#8b949e'}}>{slot.bookedBy}</small></td>
                <td>
                    <button onClick={() => updateStatus(slot._id, 'RESCHEDULE')} className="action-btn">🔄</button>
                    <button onClick={() => updateStatus(slot._id, 'CANCEL')} className="action-btn" style={{color: '#fa4549'}}>✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
