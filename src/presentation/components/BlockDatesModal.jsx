import React from 'react';
import { useTranslation } from '/src/presentation/context/LanguageContext.jsx';

export default function BlockDatesModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content">
                <h3 style={{ marginBottom: '20px' }}>Block Room Dates</h3>

                <div className="form-field">
                    <label>Room Type</label>
                    <select>
                        <option>Studio Suite (Total: 5)</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Day of June 2026</label>
                    <input type="number" defaultValue="1" />
                </div>

                <div className="form-field">
                    <label>Number of Rooms to Block</label>
                    <input type="number" defaultValue="1" />
                </div>

                <div className="modal-buttons">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-danger" onClick={() => { /* Handle logic */ }}>Confirm Block</button>
                </div>
            </div>
        </div>
    );
}