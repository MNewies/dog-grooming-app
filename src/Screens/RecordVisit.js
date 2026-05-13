import React from 'react';

export default function RecordVisit({ setScreen, selectedDog, visitForm, setVisitForm, handleCreateVisit, message, owners, selectedOwner, setEditingOwner, setEditOwnerForm, setScreen: setScreenFromParent }) {
  // Find the owner of the selected dog
  const dogOwner = owners && owners.length > 0 ? owners.find(o => o.id === selectedDog.owner_id) : null;
  
  const handleEditOwner = (owner) => {
    setEditOwnerForm({
      name: owner.name,
      phone: owner.phone,
      email: owner.email,
      postcode: owner.postcode,
      house_street: owner.house_street,
      town: owner.town
    });
    setEditingOwner(owner);
    setScreen('editOwner');
  };
  
  return (
    <div className="container">
      <div className="container">
        <h1>Record Visit - {selectedDog.pet_name}</h1>
        
        {/* Owner Section */}
        {dogOwner && (
          <div className="owner-link">
            <p>
              <strong>Owner: </strong>
              <button
                className="link-button"
                onClick={() => handleEditOwner(dogOwner)}
              >
                {dogOwner.name}
              </button>
            </p>
          </div>
        )}
        
        <input type="date" value={visitForm.visit_date} onChange={(e) => setVisitForm({...visitForm, visit_date: e.target.value})} />
        <textarea placeholder="Treatment Notes (max 500 characters)" value={visitForm.treatment_notes} onChange={(e) => setVisitForm({...visitForm, treatment_notes: e.target.value})} />
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
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}