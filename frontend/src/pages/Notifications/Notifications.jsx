import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import "./Notifications.css"

const Notifications = () => {
  const propertyAgentId = JSON.parse(
    localStorage.getItem("userDetails")
  )?.userId;


  const userRole = JSON.parse(
    localStorage.getItem("userDetails")
  )?.userType;

  const [questions, setQuestions] = useState();
  const [answers, setAnswers] = useState();
  const navigate = useNavigate();


useEffect(() => {
const url = `https://us-central1-csci5410-pro.cloudfunctions.net/fetchQuestionForAgent?agentId=${propertyAgentId}`;

const payload = {
  agentId: propertyAgentId
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
  console.log('Success:', data); 
  setQuestions(data);
})
.catch((error) => {
  console.error('Error:', error); 
});
  }, [])


  useEffect(() => {

const url = 'https://us-east1-csci5410-pro.cloudfunctions.net/fetchQuestionAndAnswer';

const payload = {
  userId: propertyAgentId
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
  console.log('answers:', data); 
  setAnswers(data);
})
.catch((error) => {
  console.error('Error:', error); 
});
  }, [])

  return (
   <>
    <h2 style={{ marginTop: "15px", marginLeft: "15px", marginBottom: "20px"}}>Customer Concerns</h2>
{userRole == "PropertyAgent" ? (
     <div class="table-responsive">
     <table class="table">
       <thead>
         <tr>
           <th scope="col">Question Id</th>
           <th scope="col">Question</th>
           <th scope="col">Reference Code</th>
         </tr>
       </thead>
       <tbody>
         {questions?.length > 0 &&
           questions.map((item, index) => {
             return (
               <>
                 <tr>
                   <td>
                     <p class="mb-0 mt-4 d-flex align-items-center">
                       { item.questionId}
                     </p>
                   </td>
                   <td>
                     <p class="mb-0 mt-4 d-flex align-items-center">
                       {item.question}
                     </p>
                   </td>
                  <td>
                     <p class="mb-0 mt-4 d-flex align-items-center">
                      {item.referenceCode}
                     </p>
                   </td>
                   <td>
                     <a
                       className="mb-0 mt-4 d-flex align-items-center"
                       style={{ cursor: "pointer", textDecoration: "none" }}
                       onClick={() => {
                         navigate(`/customer-concerns/${item.questionId}`, { state: { question: item.question } })
                       }}
                     >
                       Answer
                     </a>
                   </td>
                 </tr>
               </>
             );
           })}
       </tbody>
     </table>
   </div>

) : (
    <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Question Id</th>
          <th scope="col">Question</th>
          <th scope="col">Answer</th>
          <th scope="col">Reference Code</th>
        </tr>
      </thead>
      <tbody>
        {answers?.length > 0 &&
          answers.map((item, index) => {
            return (
              <>
                <tr>
                  <td>
                    <p class="mb-0 mt-4 d-flex align-items-center">
                      {item.data.questionId}
                    </p>
                  </td>
                  <td>
                    <p class="mb-0 mt-4 d-flex align-items-center">
                      {item.data.question}
                    </p>
                  </td>
                  <td>
                    <p class="mb-0 mt-4 d-flex align-items-center">
                      {item.data.answer}
                    </p>
                  </td>
                  <td>
                    <p class="mb-0 mt-4 d-flex align-items-center">
                     {item.data.referenceCode}
                    </p>
                  </td>
                 
                </tr>
              </>
            );
          })}
      </tbody>
    </table>
  </div>
)}
   
   </>
  );
};

export default Notifications;