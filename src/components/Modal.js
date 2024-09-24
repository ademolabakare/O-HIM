import React from 'react';
import './Modal.css'; // Import the custom styles for the modal

const Modal = ({ facility, onClose }) => {
  if (!facility) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h3>Facility Information</h3>
        <ul>
          <li><strong>Name:</strong> {facility.facility_n}</li>
          <li><strong>Ownership:</strong> {facility.ownership}</li>
          <li><strong>Facility Level:</strong> {facility.facility_l}</li>
          <li><strong>LGA:</strong> {facility.lga}</li>
          <li><strong>Activity:</strong> {facility.operation_}</li>
        </ul>
      </div>
    </div>
  );
};

export default Modal;
