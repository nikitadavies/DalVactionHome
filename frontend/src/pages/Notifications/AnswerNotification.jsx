import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import "./Notifications.css";

const AnswerNotification = () => {
  const [answer, setAnswer] = useState();
  const navigate = useNavigate();

  const location = useLocation();
  const params = useParams();

const onSubmit = () => {
    const url = 'https://us-east1-csci5410-pro.cloudfunctions.net/updateAnswerForQuestion';

// Define the request payload
const payload = {
  questionId: params.id,
  answer: answer
};

fetch(url, {
  method: 'POST', 
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload) 
})
.then(response => response.json())
.then(data => {
  navigate("/customer-concerns");
})
.catch((error) => {
  console.error('Error:', error); 
});
}
console.log(answer);
  return (
    <>
      <h2
        style={{ marginTop: "15px", marginLeft: "15px", marginBottom: "20px" }}
      >
        Reply to Customer
      </h2>

      <h4
        style={{ marginTop: "15px", marginLeft: "15px", marginBottom: "20px" }}
      >
        Query: {location?.state?.question}
      </h4>

      <div style={{ marginLeft: "15px" }}>
        <label>Reply: </label>
      </div>
      <div>
      <textarea name="reply" value={answer} style={{ marginLeft: "15px"}} onChange={(e) => { e.preventDefault(); setAnswer(e.target.value);}}/>
      </div>
      <div>
      <button
       className="btn btn-primary text-white"
       style={{ marginLeft: "15px" }}
       onClick={onSubmit}
              
            >
              Submit Reply
            </button>
      </div>
    </>
  );
};

export default AnswerNotification;
