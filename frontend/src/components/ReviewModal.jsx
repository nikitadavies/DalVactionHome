import React, { useState } from 'react';
import axios from 'axios';
import "./styles.css"; 

const ReviewModal = ({ isOpen, onClose, roomId, fetchReviews, fetchPolarity }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const userId = JSON.parse(localStorage.getItem("userDetails"))?.userId;

  const handleSubmit = () => {
    addFeedback();
    console.log(`Rating: ${rating}, Review: ${review}`);
    onClose();
  };

  const addFeedback = async () => {
    try {
      const response = await axios.post('https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/feedback', {
        roomId: roomId,
  roomType: "room",
  feedback: review,
  rating: rating,
  userId: userId
      });
     if(response){
      fetchReviews();
      fetchPolarity();
     }
    } catch (error) {
      console.error('Error adding fetching:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>How was your stay?</h2>
        <div className="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={rating >= star ? 'star filled' : 'star'}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Leave a review of this room"
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ReviewModal;
