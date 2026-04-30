import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const SUPABASE_URL = 'https://jwdsrtdajlacwcmwydyq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TuAJZ5GDWz8AVb5vbUkCpQ_VSIQNas8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [screen, setScreen] = useState('home');
  const [owners, setOwners] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [visits, setVisits] = useState([]);
  
  // Form states
  const [ownerForm, setOwnerForm] = useState({ name: '', phone: '', email: '', postcode: '', house_street: '', town: '' });
  const [dogForm, setDogForm] = useState({ pet_name: '', pet_age: '', breed: '', colour: '', chipped: false, neutered_spayed: false, vet: '', vet_phone: '' });
  const [visitForm, setVisitForm] = useState({ visit_date: '', treatment_notes: '', payment_amount: '', payment_method: '', signature_of_consent: false });
  
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch owners on load
  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    const { data, error } = await supabase.from('owners').select('*');
    if (error) console.error('Error fetching owners:', error);
    else setOwners(data || []);
  };

  const fetchDogs = async (ownerId) => {
    const { data, error } = await supabase.from('dogs').select('*').eq('owner_id', ownerId);
    if (error) console.error('Error fetching dogs:', error);
    else setDogs(data || []);
  };

  const fetchVisits = async (dogId) => {
    const { data, error } = await supabase.from('visits').select('*').eq('dog_id', dogId).order('visit_number', { ascending: false });
    if (error) console.error('Error fetching visits:', error);
    else setVisits(data || []);
  };

  // Create owner
  const handleCreateOwner = async () => {
    if (!ownerForm.name) {
      setMessage('Owner name is required');
      return;
    }
    const { error } = await supabase.from('owners').insert([ownerForm]);
    if (error) {
      setMessage('Error creating owner: ' + error.message);
    } else {
      setMessage('Owner created successfully');
      setOwnerForm({ name: '', phone: '', email: '', postcode: '', house_street: '', town: '' });
      fetchOwners();
      setTimeout(() => setScreen('home'), 1500);
    }
  };

  // Create dog
  const handleCreateDog = async () => {
    if (!dogForm.pet_name || !selectedOwner) {
      setMessage('Pet name and owner are required');
      return;
    }
    const { data, error } = await supabase.from('dogs').insert([{ ...dogForm, owner_id: selectedOwner.id }]).select();
    if (error) {
      setMessage('Error creating dog: ' + error.message);
    } else {
      setMessage('Dog created successfully');
      setDogForm({ pet_name: '', pet_age: '', breed: '', colour: '', chipped: false, neutered_spayed: false, vet: '', vet_phone: '' });
      if (data && data.length > 0) {
        setSelectedDog(data[0]);
        setScreen('recordVisit');
      }
    }
  };

  // Create visit
  const handleCreateVisit = async () => {
    if (!visitForm.visit_date) {
      setMessage('Visit date is required');
      return;
    }
    const visitNumber = visits.length > 0 ? Math.max(...visits.map(v => v.visit_number || 0)) + 1 : 1;
    const { error } = await supabase.from('visits').insert([{
      dog_id: selectedDog.id,
      visit_number: visitNumber,
      visit_date: visitForm.visit_date,
      treatment_notes: visitForm.treatment_notes,
      payment_amount: visitForm.payment_amount ? parseFloat(visitForm.payment_amount) : null,
      payment_method: visitForm.payment_method,
      signature_of_consent: visitForm.signature_of_consent,
      date_of_signature: new Date().toISOString().split('T')[0]
    }]);
    if (error) {
      setMessage('Error recording visit: ' + error.message);
    } else {
      setMessage('Visit recorded successfully');
      setVisitForm({ visit_date: '', treatment_notes: '', payment_amount: '', payment_method: '', signature_of_consent: false });
      fetchVisits(selectedDog.id);
      setTimeout(() => setScreen('home'), 1500);
    }
  };

  // Home screen
  if (screen === 'home') {
    return (
      <div className="container">
        <h1>Dog Grooming Client Management</h1>
        <div className="button-group">
          <button className="btn btn-primary" onClick={() => setScreen('createOwner')}>New Owner</button>
          <button className="btn btn-secondary" onClick={() => setScreen('findDog')}>Find/Add Dog</button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  // Create owner screen
  if (screen === 'createOwner') {
    return (
      <div className="container">
        <h1>Register New Owner</h1>
        <input type="text" placeholder="Owner Name *" value={ownerForm.name} onChange={(e) => setOwnerForm({...ownerForm, name: e.target.value})} />
        <input type="tel" placeholder="Phone" value={ownerForm.phone} onChange={(e) => setOwnerForm({...ownerForm, phone: e.target.value})} />
        <input type="email" placeholder="Email" value={ownerForm.email} onChange={(e) => setOwnerForm({...ownerForm, email: e.target.value})} />
        <input type="text" placeholder="House & Street" value={ownerForm.house_street} onChange={(e) => setOwnerForm({...ownerForm, house_street: e.target.value})} />
        <input type="text" placeholder="Town" value={ownerForm.town} onChange={(e) => setOwnerForm({...ownerForm, town: e.target.value})} />
        <input type="text" placeholder="Postcode" value={ownerForm.postcode} onChange={(e) => setOwnerForm({...ownerForm, postcode: e.target.value})} />
        <div className="button-group">
          <button className="btn btn-primary" onClick={handleCreateOwner}>Create Owner</button>
          <button className="btn btn-secondary" onClick={() => { setScreen('home'); setMessage(''); }}>Cancel</button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  // Find/add dog screen
  if (screen === 'findDog') {
    return (
      <div className="container">
        <h1>Find or Add Dog</h1>
        <h2>Select Owner</h2>
        <select onChange={(e) => {
          const owner = owners.find(o => o.id === parseInt(e.target.value));
          if (owner) {
            setSelectedOwner(owner);
            fetchDogs(owner.id);
          }
        }}>
          <option value="">-- Choose Owner --</option>
          {owners.map(owner => <option key={owner.id} value={owner.id}>{owner.name} ({owner.phone})</option>)}
        </select>
        
        {selectedOwner && dogs.length > 0 && (
          <>
            <h2>Dogs for {selectedOwner.name}</h2>
            <div className="dog-list">
              {dogs.map(dog => (
                <div key={dog.id} className="dog-card" onClick={() => {
                  setSelectedDog(dog);
                  fetchVisits(dog.id);
                  setScreen('recordVisit');
                }}>
                  <strong>{dog.pet_name}</strong> ({dog.breed})
                </div>
              ))}
            </div>
          </>
        )}

        {selectedOwner && (
          <button className="btn btn-primary" onClick={() => setScreen('createDog')}>Add New Dog for {selectedOwner.name}</button>
        )}

        <button className="btn btn-secondary" onClick={() => { setScreen('home'); setMessage(''); }}>Back</button>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  // Create dog screen
  if (screen === 'createDog') {
    return (
      <div className="container">
        <h1>Register New Dog for {selectedOwner?.name}</h1>
        <input type="text" placeholder="Pet Name *" value={dogForm.pet_name} onChange={(e) => setDogForm({...dogForm, pet_name: e.target.value})} />
        <input type="number" placeholder="Pet Age" value={dogForm.pet_age} onChange={(e) => setDogForm({...dogForm, pet_age: e.target.value})} />
        <input type="text" placeholder="Breed" value={dogForm.breed} onChange={(e) => setDogForm({...dogForm, breed: e.target.value})} />
        <input type="text" placeholder="Colour" value={dogForm.colour} onChange={(e) => setDogForm({...dogForm, colour: e.target.value})} />
        <label>
          <input type="checkbox" checked={dogForm.chipped} onChange={(e) => setDogForm({...dogForm, chipped: e.target.checked})} /> Chipped
        </label>
        <label>
          <input type="checkbox" checked={dogForm.neutered_spayed} onChange={(e) => setDogForm({...dogForm, neutered_spayed: e.target.checked})} /> Neutered/Spayed
        </label>
        <input type="text" placeholder="Vet" value={dogForm.vet} onChange={(e) => setDogForm({...dogForm, vet: e.target.value})} />
        <input type="tel" placeholder="Vet Phone" value={dogForm.vet_phone} onChange={(e) => setDogForm({...dogForm, vet_phone: e.target.value})} />
        <div className="button-group">
          <button className="btn btn-primary" onClick={handleCreateDog}>Create Dog</button>
          <button className="btn btn-secondary" onClick={() => setScreen('findDog')}>Back</button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  // Record visit screen
  if (screen === 'recordVisit') {
    return (
      <div className="container">
        <h1>Record Visit for {selectedDog?.pet_name}</h1>
        <p><strong>Owner:</strong> {selectedOwner?.name}</p>
        <p><strong>Dog:</strong> {selectedDog?.pet_name} ({selectedDog?.breed})</p>

        {visits.length > 0 && (
          <>
            <h2>Visit History</h2>
            <table className="visits-table">
              <thead>
                <tr>
                  <th>Visit #</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {visits.map(visit => (
                  <tr key={visit.id}>
                    <td>{visit.visit_number}</td>
                    <td>{visit.visit_date}</td>
                    <td>{visit.treatment_notes}</td>
                    <td>£{visit.payment_amount}</td>
                    <td>{visit.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2>New Visit</h2>
        <input type="date" value={visitForm.visit_date} onChange={(e) => setVisitForm({...visitForm, visit_date: e.target.value})} />
        <textarea placeholder="Treatment Notes" value={visitForm.treatment_notes} onChange={(e) => setVisitForm({...visitForm, treatment_notes: e.target.value})} rows="4"></textarea>
        <input type="number" step="0.01" placeholder="Payment Amount (£)" value={visitForm.payment_amount} onChange={(e) => setVisitForm({...visitForm, payment_amount: e.target.value})} />
        <select value={visitForm.payment_method} onChange={(e) => setVisitForm({...visitForm, payment_method: e.target.value})}>
          <option value="">-- Payment Method --</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
        </select>
        <label>
          <input type="checkbox" checked={visitForm.signature_of_consent} onChange={(e) => setVisitForm({...visitForm, signature_of_consent: e.target.checked})} /> Signature of Consent
        </label>
        <div className="button-group">
          <button className="btn btn-primary" onClick={handleCreateVisit}>Record Visit</button>
          <button className="btn btn-secondary" onClick={() => { setScreen('home'); setMessage(''); }}>Home</button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }
}