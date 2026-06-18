import React, { useState } from 'react';

export default function CustomPriceModal({ isOpen, onClose, roomTypes }) {
    if (!isOpen) return null;

    const [savedRanges, setSavedRanges] = useState([]);
    const [newRange, setNewRange] = useState({ from: '', to: '', price: '' });

    const handleAdd = () => {
        if (!newRange.from || !newRange.to || !newRange.price) return;

        const diffDays = Math.ceil((new Date(newRange.to) - new Date(newRange.from)) / (1000 * 60 * 60 * 24)) + 1;
        setSavedRanges([...savedRanges, { id: Date.now(), ...newRange, days: diffDays }]);
        setNewRange({ from: '', to: '', price: '' });
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content" style={{ maxWidth: '600px', padding: '24px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                    <i className="fa-solid fa-tag" /> Custom Price Ranges
                </h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Override the daily price for a date range. Multiple ranges can be set per room type.</p>

                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Room Type</label>
                <select className="form-control" style={{ marginBottom: '20px' }}>
                    {roomTypes.map(rt => <option key={rt.id}>{rt.name}</option>)}
                </select>

                <div className="card-panel" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px' }}>
                    <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', marginBottom: '15px' }}>
                        <i className="fa-solid fa-plus-circle" /> Add New Price Range
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-field">
                            <label>From Date</label>
                            <input type="date" className="form-control" value={newRange.from} onChange={(e) => setNewRange({...newRange, from: e.target.value})} />
                        </div>
                        <div className="form-field">
                            <label>To Date</label>
                            <input type="date" className="form-control" value={newRange.to} onChange={(e) => setNewRange({...newRange, to: e.target.value})} />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <div style={{ flexGrow: 1 }}>
                            <label>Price per Night (OMR)</label>
                            <input type="number" className="form-control" placeholder="e.g., 55" value={newRange.price} onChange={(e) => setNewRange({...newRange, price: e.target.value})} />
                        </div>
                        <button className="btn btn-success" onClick={handleAdd} style={{ height: '44px' }}>
                            <i className="fa-solid fa-plus" /> Add Range
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <div className="panel-title" style={{ marginBottom: '10px' }}>
                        <i className="fa-solid fa-list-ul" /> Saved Price Ranges
                    </div>

                    {savedRanges.length === 0 ? (
                        <div className="card-panel" style={{ border: '2px dashed #e2e8f0', textAlign: 'center', color: '#64748b', padding: '30px' }}>
                            No custom price ranges set yet.
                        </div>
                    ) : (
                        savedRanges.map(range => (
                            <div key={range.id} className="card-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                                <span className="badge badge-info">{range.from} → {range.to}</span>
                                <span style={{ fontWeight: 'bold' }}>
                                    <i className="fa-solid fa-coins" style={{ color: '#d97706', marginRight: '5px' }} /> 
                                    OMR {range.price} / night <span style={{ color: '#64748b', fontWeight: 'normal' }}>({range.days} days)</span>
                                </span>
                                <button className="btn btn-danger" onClick={() => setSavedRanges(savedRanges.filter(s => s.id !== range.id))}>
                                    <i className="fa-solid fa-trash" /> Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}