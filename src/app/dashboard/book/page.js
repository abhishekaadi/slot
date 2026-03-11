'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookSlot() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesData, setCategoriesData] = useState({});
  const [formData, setFormData] = useState({
    location: '', category: '', batchName: '', channelName: '',
    lectureType: '', rec: false, studioCode: '', facultyEmail: '',
    facultyName: '', date: '', startTime: '', endTime: '',
    recurrenceWeeks: 1
  });

  const lectureTypes = ['Live', 'AWS', 'Zoom', 'YT Paid', 'YT Free', 'YT + Zoom', 'YT + Secure', 'YT Multi Channel Live', 'YT + FB', 'Fake Live', 'G-Meet', 'Telegram', 'Pathshala(TX)'];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({...prev, date: today}));
    
    // Fetch dynamic categories from Google Sheets
    fetch('/api/meta/categories')
       .then(res => res.json())
       .then(data => {
           if(data.success) {
               setCategoriesData(data.data);
           }
       })
       .catch(err => console.error("Failed to load categories", err));
  }, []);

  // Example auto-fill for studio code based on location
  useEffect(() => {
    if(formData.location) {
        setFormData(prev => ({...prev, studioCode: prev.location.substring(0, 3).toUpperCase() + '-ST' + Math.floor(Math.random() * 10) }));
    }
  }, [formData.location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryChange = (e) => {
      // Reset sub-selections when category changes
      setFormData(prev => ({ ...prev, category: e.target.value, batchName: '', channelName: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dayOfWeek = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
    const payload = { ...formData, day: dayOfWeek };

    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        router.push('/dashboard');
      } else {
        alert("Failed to create slot");
      }
    } catch(err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableSubItems = formData.category ? categoriesData[formData.category] || [] : [];
  const isYT = formData.category && formData.category.toLowerCase().includes('yt');

  return (
    <div className="dashboard-container" style={{maxWidth: '800px', margin: '0 auto'}}>
      <h2>Book a New Slot</h2>
      <form onSubmit={handleSubmit} className="booking-form">
        
        <div className="form-group row">
            <div className="col">
              <label>Date</label>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} className="input-field w-100" />
            </div>
            <div className="col">
              <label>Recurrence (Weeks)</label>
              <input type="number" min="1" max="52" name="recurrenceWeeks" value={formData.recurrenceWeeks} onChange={handleChange} className="input-field w-100" />
              <small style={{color: '#8b949e'}}>Set &gt; 1 for weekly repeat</small>
            </div>
        </div>

        <div className="form-group row">
            <div className="col">
                <label>Start Time</label>
                <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} className="input-field w-100" />
            </div>
            <div className="col">
                <label>End Time</label>
                <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} className="input-field w-100" />
            </div>
        </div>

        <div className="form-group row">
            <div className="col">
              <label>Location</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="input-field w-100" placeholder="e.g. Noida, Delhi..." />
            </div>
            <div className="col">
              <label>Studio Code</label>
              <input type="text" name="studioCode" required value={formData.studioCode} onChange={handleChange} className="input-field w-100" readOnly style={{backgroundColor: '#21262d'}} />
            </div>
        </div>

        <div className="form-group row">
             <div className="col">
                <label>Category</label>
                <select name="category" required value={formData.category} onChange={handleCategoryChange} className="input-field w-100">
                    <option value="">Select Category</option>
                    {Object.keys(categoriesData).sort().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="col">
                {isYT ? (
                    <>
                    <label>Channel Name</label>
                    <select name="channelName" required value={formData.channelName} onChange={handleChange} className="input-field w-100">
                        <option value="">Select Channel</option>
                        {availableSubItems.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    </>
                ) : (
                    <>
                    <label>Batch Name</label>
                    <select name="batchName" required={formData.category !== ''} value={formData.batchName} onChange={handleChange} className="input-field w-100">
                        <option value="">Select Batch</option>
                        {availableSubItems.map(b => <option key={b} value={b}>{b}</option>)}
                     </select>
                    </>
                )}
             </div>
        </div>

        <div className="form-group row">
            <div className="col">
                <label>Lecture Type</label>
                <select name="lectureType" required value={formData.lectureType} onChange={handleChange} className="input-field w-100">
                    <option value="">Select Type</option>
                    {lectureTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="col" style={{display: 'flex', alignItems: 'flex-end', paddingBottom: '10px', gap: '24px'}}>
                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', color: !formData.rec ? '#58a6ff' : '#c9d1d9'}}>
                    <input type="radio" required name="recMode" checked={formData.rec === false} onChange={() => setFormData(p => ({...p, rec: false}))} style={{marginRight: '8px', width: '18px', height: '18px', accentColor: '#58a6ff'}} />
                    Live
                </label>
                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', color: formData.rec ? '#58a6ff' : '#c9d1d9'}}>
                    <input type="radio" required name="recMode" checked={formData.rec === true} onChange={() => setFormData(p => ({...p, rec: true}))} style={{marginRight: '8px', width: '18px', height: '18px', accentColor: '#58a6ff'}} />
                    Rec
                </label>
            </div>
        </div>

        <div className="form-group row">
            <div className="col">
                <label>Faculty Email</label>
                <input type="email" name="facultyEmail" required value={formData.facultyEmail} onChange={handleChange} className="input-field w-100" placeholder="faculty@pw.live" />
            </div>
            <div className="col">
                <label>Faculty Name</label>
                <input type="text" name="facultyName" required value={formData.facultyName} onChange={handleChange} className="input-field w-100" placeholder="John Doe" />
            </div>
        </div>

        <div className="form-group" style={{marginTop: '2rem'}}>
            <button disabled={loading} type="submit" className="btn btn-primary w-100" style={{padding: '14px', fontSize: '16px'}}>
                {loading ? 'Booking...' : 'Book Slot'}
            </button>
        </div>
      </form>
    </div>
  );
}
