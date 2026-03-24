import { useState } from 'react';
import api from '../api/axios';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      await api.post('/contact', formData);
      setStatus('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="fade-in pt-8 pb-12 grid grid-cols-2 gap-12" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr' }}>
      
      <div className="card bg-slate-50 flex flex-col justify-center">
        <h2 className="mb-6">Get in Touch</h2>
        <p className="text-muted mb-8">Have a question or need support? We're here to help.</p>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-3 rounded-full"><Mail size={20} /></div>
            <div>
              <p className="font-bold m-0">Email</p>
              <p className="text-muted m-0">support@renthub.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-3 rounded-full"><Phone size={20} /></div>
            <div>
              <p className="font-bold m-0">Phone</p>
              <p className="text-muted m-0">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-3 rounded-full"><MapPin size={20} /></div>
            <div>
              <p className="font-bold m-0">Location</p>
              <p className="text-muted m-0">Pune, Maharashtra, India</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-6 border-b pb-4">Send us a message</h2>
        
        {status && (
          <div className={`p-4 mb-6 rounded ${status.includes('success') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.name} 
              onChange={e=>setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={formData.email} 
              onChange={e=>setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea 
              className="form-control" 
              rows="5"
              value={formData.message} 
              onChange={e=>setFormData({...formData, message: e.target.value})} 
              required 
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={status === 'Sending...'}>
            {status === 'Sending...' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Contact;
