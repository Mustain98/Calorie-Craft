import React, { useState } from 'react';
import './MealRequest.css';

const dummyRequests = [
  { 
    id: 101, 
    user: 'Alice', 
    mealName: 'Veggie Bowl',
    imageUrl: 'https://source.unsplash.com/300x200/?veggie,bowl',
    calories: 420,
    protein: 15,
    carbs: 60,
    fat: 12,
    ingredients: ['Quinoa', 'Avocado', 'Chickpeas', 'Kale', 'Tahini Dressing']
  },
  { 
    id: 102, 
    user: 'Bob', 
    mealName: 'Protein Shake',
    imageUrl: 'https://source.unsplash.com/300x200/?protein,shake',
    calories: 320,
    protein: 30,
    carbs: 25,
    fat: 8,
    ingredients: ['Whey Protein', 'Almond Milk', 'Banana', 'Peanut Butter', 'Ice']
  },
];

export default function MealShareRequests() {
  const [requests, setRequests] = useState(dummyRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleApprove = (id) => {
    alert(`Approved request ID: ${id}`);
    setRequests(reqs => reqs.filter(r => r.id !== id));
    setSelectedRequest(null);
  };

  const handleReject = (id) => {
    alert(`Rejected request ID: ${id}`);
    setRequests(reqs => reqs.filter(r => r.id !== id));
    setSelectedRequest(null);
  };

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="share-request-container">
      <h2>Meal Share Requests</h2>
      
      <div className="request-list">
        {requests.length === 0 ? (
          <div className="empty-requests">No pending requests</div>
        ) : (
          requests.map(request => (
            <div 
              key={request.id} 
              className="request-card"
              onClick={() => openRequestDetails(request)}
            >
              <img src={request.imageUrl} alt={request.mealName} />
              <div className="request-info">
                <h3>{request.mealName}</h3>
                <p>Requested by: {request.user}</p>
                <div className="macros">
                  <span>{request.calories} cal</span>
                  <span>P: {request.protein}g</span>
                  <span>C: {request.carbs}g</span>
                  <span>F: {request.fat}g</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="request-modal-overlay" onClick={closeRequestDetails}>
          <div className="request-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeRequestDetails}>
              &times;
            </button>
            
            <div className="modal-header">
              <img src={selectedRequest.imageUrl} alt={selectedRequest.mealName} />
              <h2>{selectedRequest.mealName}</h2>
              <p className="requester">Requested by: {selectedRequest.user}</p>
            </div>
            
            <div className="modal-content">
              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <ul>
                  {selectedRequest.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div className="nutrition-section">
                <h3>Nutrition</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span>Calories</span>
                    <strong>{selectedRequest.calories}</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Protein</span>
                    <strong>{selectedRequest.protein}g</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Carbs</span>
                    <strong>{selectedRequest.carbs}g</strong>
                  </div>
                  <div className="nutrition-item">
                    <span>Fat</span>
                    <strong>{selectedRequest.fat}g</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="approve-btn"
                onClick={() => handleApprove(selectedRequest.id)}
              >
                Approve
              </button>
              <button 
                className="reject-btn"
                onClick={() => handleReject(selectedRequest.id)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}