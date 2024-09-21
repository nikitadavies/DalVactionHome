import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReviewModal from '../../components/ReviewModal';

const ReviewList = () => {
  const { roomId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polarity, setPolarity] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/feedback');
      const data = JSON.parse(response.data.body);
      setReviews(data.feedbacks.filter(review => review.roomId === roomId));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchPolarity = async () => {
    try {
      const response = await axios.post('https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/feedback/polarity', {
        roomId: roomId
      });
      const data = JSON.parse(response.data.body);
      setPolarity(data);
      console.log(polarity);
    } catch (error) {
      console.error('Error fetching polarity:', error);
    }
  };



  useEffect(() => {

    fetchPolarity();
    fetchReviews();
  }, [roomId]);

  const roundMagnitude = (magnitude) => {
    return Math.round(magnitude * 10);
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  const accessToken = localStorage.getItem("accessToken");

  return (
    <div className="container mt-4">
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px"}}>
    <h2>Guest Reviews for Room: {roomId}</h2>
   {accessToken &&  <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Review</button>}
    </div>
      {reviews.length === 0 ? (
        <div>No reviews found for this room.</div>
      ) : (
        reviews.map(review => (
          <div key={review.feedbackId} className="card mb-4">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <span>User ID: {review.userId}</span>
              </h5>
              <h6 className="card-subtitle mb-2 text-muted">
                Room: {review.roomId}
                <br />
                Rating: {review.rating}
                <br />
                Room Type: {review.roomType}
              </h6>
              <p className="card-text">
                <strong>Feedback:</strong>
                <br />
                {review.feedback}
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <span className="badge bg-info">{roundMagnitude(review.sentimentScore)}</span>
              </div>
            </div>
          </div>
        ))
      )}
      <div className='text-end'>
      <h4>Overall feedback polarity: {roundMagnitude(polarity?.averageSentimentScore)}</h4>
      </div>
      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} roomId={roomId} fetchReviews={fetchReviews} fetchPolarity={fetchPolarity}/>
    </div>
    
  );
};

export default ReviewList;
