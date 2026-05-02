import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const SUPABASE_URL = 'https://jwdsrtdajlacwcmwydyq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TuAJZ5GDWz8AVb5vbUkCpQ_VSIQNas8';
const SUPABASE_SECRET = 'sb_secret_wv6_D3Fd110elp1tEfN5Kg_yaJYRM20';
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
