import React from 'react';

export default function AddOfferModal({ isOpen, onClose, roomTypes }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content" style={{ maxWidth: '600px', padding: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                    <i className="fa-solid fa-gift" style={{ color: '#f59e0b' }} /> Add Special Offer
                </h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Create a date-bound promotional discount.</p>

                {/* New Room Type Selection */}
                <div className="form-field" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600' }}>Apply to Room Type</label>
                    <select className="form-control">
                        <option value="all">All Room Types</option>
                        {roomTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: '600' }}>Offer Name</label>
                    <input type="text" className="form-control" placeholder="e.g., Summer Promo" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div className="form-field">
                        <label style={{ fontWeight: '600' }}>Start Date</label>
                        <input type="date" className="form-control" />
                    </div>
                    <div className="form-field">
                        <label style={{ fontWeight: '600' }}>End Date</label>
                        <input type="date" className="form-control" />
                    </div>
                </div>

                <div className="form-field" style={{ marginBottom: '25px' }}>
                    <label style={{ fontWeight: '600' }}>Discount Percentage (%)</label>
                    <input type="number" className="form-control" placeholder="15" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-warning" style={{ background: '#f59e0b', color: '#fff', border: 'none' }}>
                        Save Offer
                    </button>
                </div>
            </div>
        </div>
    );
}