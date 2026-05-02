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
  
  // FEATURE #1: Find dog by pet name search state
  const [dogNameSearch, setDogNameSearch] = useState('');
  
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch owners on load
  useEffect(() => {
    fetchOwners();
  }, []);

  // Fetch all dogs when Find Dog screen is opened
  useEffect(() => {
    if (screen === 'findDog') {
      fetchAllDogs();
    }
  }, [screen]);

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

  const fetchAllDogs = async () => {
    const { data, error } = await supabase.from('dogs').select('*');
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

  // FEATURE #1: Filter dogs by pet name (case-insensitive)
  const filteredDogs = dogs.filter(dog =>
    dog.pet_name.toLowerCase().includes(dogNameSearch.toLowerCase())
  );

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
          <button className="btn btn-secondary" onClick={() => setScreen('home')}>Back</button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  // Find/Add Dog screen - FEATURE #1 implemented here
  if (screen === 'findDog') {
    return (
      <div className="container">
        <h1>Find / Add Dog</h1>
        
        <h2>Search Dogs by Name</h2>
        <input 
          type="text" 
          placeholder="Search dog name..." 
          value={dogNameSearch}
          onChange={(e) => setDogNameSearch(e.target.value)}
          className="search-input"
        />
        
        {/* Display search results */}
        <div className="search-results">
          {dogNameSearch && filteredDogs.length > 0 ? (
            <div>
              <h3>Found {filteredDogs.length} dog(s)</h3>
              {filteredDogs.map(dog => (
                <div key={dog.id} className="dog-card">
                  <div className="dog-info">
                    <p><strong>Pet Name:</strong> {dog.pet_name}</p>
                    <p><strong>Breed:</strong> {dog.breed || 'Not specified'}</p>
                    <p><strong>Age:</strong> {dog.pet_age || 'Not specified'}</p>
                    <p><strong>Colour:</strong> {dog.colour || 'Not specified'}</p>
                  </div>
                  <div className="dog-actions">
                    <button 
                      className="btn btn-small" 
                      onClick={() => {
                        setSelectedDog(dog);
                        fetchVisits(dog.id);
                        setScreen('viewDog');
                      }}
                    >
                      View History
                    </button>
                    <button 
                      className="btn btn-small" 
                      onClick={() => {
                        setSelectedDog(dog);
                        setVisitForm({ visit_date: '', treatment_notes: '', payment_amount: '', payment_method: '', signature_of_consent: false });
                        setScreen('recordVisit');
                      }}
                    >
                      Add Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : dogNameSearch ? (
            <p className="no-results">No dogs found with that name</p>
          ) : (
            <p className="hint">Type a dog name to search</p>
          )}
        </div>

        <h2>Register New Dog</h2>
        <p>Select owner:</p>
        <select onChange={(e) => {
          const owner = owners.find(o => o.id === parseInt(e.target.value));
          setSelectedOwner(owner);
          if (owner) fetchDogs(owner.id);
        }} className="full-width">
          <option value="">-- Choose an owner --</option>
          {owners.map(owner => (
            <option key={owner.id} value={owner.id}>
              {owner.name} ({owner.phone || 'no phone'})
            </option>
          ))}
        </select>

        {selectedOwner && dogs.length > 0 && (
          <div>
            <p>Or select existing dog:</p>
            <select onChange={(e) => {
              const dog = dogs.find(d => d.id === parseInt(e.target.value));
              setSelectedDog(dog);
              fetchVisits(dog.id);
              setScreen('viewDog');
            }} className="full-width">
              <option value="">-- Choose a dog --</option>
              {dogs.map(dog => (
                <option key={dog.id} value={dog.id}>
                  {dog.pet_name} ({dog.breed || 'breed unknown'})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedOwner && (
          <div>
            <p>Register new dog under {selectedOwner.name}:</p>
            <input type="text" placeholder="Pet Name *" value={dogForm.pet_name} onChange={(e) => setDogForm({...dogForm, pet_name: e.target.value})} />
            <input type="number" placeholder="Pet Age" value={dogForm.pet_age} onChange={(e) => setDogForm({...dogForm, pet_age: e.target.value})} />
            <input type="text" placeholder="Breed" value={dogForm.breed} onChange={(e) => setDogForm({...dogForm, breed: e.target.value})} />
            <input type="text" placeholder="Colour" value={dogForm.colour} onChange={(e) => setDogForm({...dogForm, colour: e.target.value})} />
            <input type="text" placeholder="Vet" value={dogForm.vet} onChange={(e) => setDogForm({...dogForm, vet: e.target.value})} />
            <input type="tel" placeholder="Vet Phone" value={dogForm.vet_phone} onChange={(e) => setDogForm({...dogForm, vet_phone: e.target.value})} />
            <label>
              <input type="checkbox" checked={dogForm.chipped} onChange={(e) => setDogForm({...dogForm, chipped: e.target.checked})} />
              Chipped
            </label>
            <label>
              <input type="checkbox" checked={dogForm.neutered_spayed} onChange={(e) => setDogForm({...dogForm, neutered_spayed: e.target.checked})} />
              Neutered/Spayed
            </label>
            <div className="button-group">
              <button className="btn btn-primary" onClick={handleCreateDog}>Create Dog</button>
              <button className="btn btn-secondary" onClick={() => setScreen('home')}>Back</button>
            </div>
          </div>
        )}

        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  // View dog screen
  if (screen === 'viewDog' && selectedDog) {
    return (
      <div className="container">
        <h1>{selectedDog.pet_name}</h1>
        <h2>Dog Details</h2>
        <p><strong>Breed:</strong> {selectedDog.breed}</p>
        <p><strong>Colour:</strong> {selectedDog.colour}</p>
        <p><strong>Age:</strong> {selectedDog.pet_age}</p>
        <p><strong>Chipped:</strong> {selectedDog.chipped ? 'Yes' : 'No'}</p>
        <p><strong>Neutered/Spayed:</strong> {selectedDog.neutered_spayed ? 'Yes' : 'No'}</p>
        <p><strong>Vet:</strong> {selectedDog.vet}</p>
        <p><strong>Vet Phone:</strong> {selectedDog.vet_phone}</p>

        <h2>Visit History</h2>
        {visits.length > 0 ? (
          <div className="visits-list">
            {visits.map(visit => (
              <div key={visit.id} className="visit-card">
                <p><strong>Visit #{visit.visit_number}</strong> - {visit.visit_date}</p>
                <p><strong>Notes:</strong> {visit.treatment_notes || 'None'}</p>
                <p><strong>Payment:</strong> £{visit.payment_amount || '0.00'} ({visit.payment_method || 'N/A'})</p>
                <p><strong>Signature:</strong> {visit.signature_of_consent ? 'Provided' : 'Not provided'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No visits recorded yet</p>
        )}

        <div className="button-group">
          <button className="btn btn-primary" onClick={() => {
            setVisitForm({ visit_date: '', treatment_notes: '', payment_amount: '', payment_method: '', signature_of_consent: false });
            setScreen('recordVisit');
          }}>Add Visit</button>
          <button className="btn btn-secondary" onClick={() => setScreen('findDog')}>Back</button>
        </div>
      </div>
    );
  }

  // Record visit screen
  if (screen === 'recordVisit' && selectedDog) {
    return (
      <div className="container">
        <h1>Record Visit - {selectedDog.pet_name}</h1>
        <input type="date" value={visitForm.visit_date} onChange={(e) => setVisitForm({...visitForm, visit_date: e.target.value})} />
        <textarea placeholder="Treatment Notes (max 500 characters)" value={visitForm.treatment_notes} onChange={(e) => setVisitForm({...visitForm, treatment_notes: e.target.value.slice(0, 500)})} />
        <input type="number" placeholder="Payment Amount (£)" value={visitForm.payment_amount} onChange={(e) => setVisitForm({...visitForm, payment_amount: e.target.value})} />
        <select value={visitForm.payment_method} onChange={(e) => setVisitForm({...visitForm, payment_method: e.target.value})}>
          <option value="">Select payment method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
        </select>
        <label>
          <input type="checkbox" checked={visitForm.signature_of_consent} onChange={(e) => setVisitForm({...visitForm, signature_of_consent: e.target.checked})} />
          Signature of Consent
        </label>
        <div className="button-group">
          <button className="btn btn-primary" onClick={handleCreateVisit}>Record Visit</button>
          <button className="btn btn-secondary" onClick={() => setScreen('viewDog')}>Back</button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  }

  return <div className="container"><p>Loading...</p></div>;
}