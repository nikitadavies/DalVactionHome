const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
 
exports.checkTicketResolution = async (req, res) => {
   // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
 
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);
 
  const ticketId = req.body?.sessionInfo?.parameters?.ticketid;
 
  console.log('Ticket ID is:', ticketId);
 
  if (!ticketId) {
    console.log('Missing ticketId parameter');
    res.status(400).send('Missing ticketId parameter');
    return;
  }
 
  try {
    const questionsRef = firestore.collection('questions');
    console.log('After questionRef');
    const snapshot = await questionsRef.where('questionId', '==', +ticketId).get();
    console.log('After snapshot');
 
    let responseString;
    if (snapshot.empty) {
      console.log('No such ticket exists');
      responseString = 'No such ticket exists.';
    } else {
          let questions = [];
      console.log('Found ticket ');

    snapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });
        const question = questions[0].question;
        console.log('Question of ticket ',question);

        const answer =  questions[0].answer;
        console.log('Answer of ticket ',answer);
    
        if (answer) {
            responseString = `Question: ${question}\nAnswer:${answer}`;
        } else {
            responseString = `Question: ${question}\nThis query has not yet been resolved.`;
        }
    }
        console.log('ResponseString is ',responseString);
    const response = {
        "fulfillment_response": {
            "messages": [
                {
                    "text": {
                        "text": [responseString]
                    }
                }
            ]
        }
    };
 
    res.status(200).send(JSON.stringify(response));
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send('Internal Server Error');
  }
};