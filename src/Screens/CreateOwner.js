import React from 'react';

export default function CreateOwner({ setScreen, ownerForm, setOwnerForm, handleCreateOwner, message }) {
  return (
    <div className="container">
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
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}