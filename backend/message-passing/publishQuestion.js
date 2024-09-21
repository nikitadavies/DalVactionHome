// /**
//  * Responds to any HTTP request.
//  *
//  * @param {!express:Request} req HTTP request context.
//  * @param {!express:Response} res HTTP response context.
//  */
// exports.helloWorld = (req, res) => {
//   let message = req.query.message || req.body.message || 'Hello World!';
//   res.status(200).send(message);
// };
const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();

exports.publishQuestion = async (req, res) => {
  // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    const userId= req.body.sessionInfo.parameters.userid;
    const bookingReferenceCode= req.body.sessionInfo.parameters.bookingreferencecode;
    const question= req.body.sessionInfo.parameters.question;


  //const { userId, bookingReferenceCode, question } = req.body.sessionInfo.parameters;
  console.log("Input is ",req.body.sessionInfo.parameters);
  console.log("userId is ",userId," and bookingReferenceCode is ",bookingReferenceCode," and question is ",question);
const ticketId=new Date().getTime();
  const message = {
    userId,
    bookingReferenceCode,
    question,
    questionId:ticketId ,  // Generate a unique question ID
    answer: null
  };

  const dataBuffer = Buffer.from(JSON.stringify(message));

  try {
    await pubSubClient.topic('questions-topic').publish(dataBuffer);
    const response = {
        "fulfillment_response": {
            "messages": [
                {
                    "text": {
                        "text": [`Your concern has been reported to respective property agent.Please use the ticketId ${ticketId} for follow up.`]
                    }
                }
            ]
        }
    };
    res.status(200).send(JSON.stringify(response));
  } catch (error) {
    console.error(`Error publishing message: ${error}`);
    res.status(500).send('Error publishing message.');
  }
};
