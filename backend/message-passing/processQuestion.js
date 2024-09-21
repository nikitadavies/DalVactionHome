const { Firestore } = require('@google-cloud/firestore');
const axios = require('axios');

const firestore = new Firestore();

const QUESTIONS_COLLECTION = 'questions';
const API_GATEWAY_URL = 'https://myvg37qslejrbq52fretrygoz40psbbj.lambda-url.us-east-1.on.aws/';

exports.processQuestion = async (message, context) => {
  try {
    // Decode and parse the message data
    const dataBuffer = Buffer.from(message.data, 'base64');
    const dataString = dataBuffer.toString('utf8');
    console.log('Decoded message data:', dataString);

    const data = JSON.parse(dataString);
    const { userId, bookingReferenceCode, question, questionId } = data;

    // Validate the presence of bookingReferenceCode
    if (!bookingReferenceCode) {
      console.error('bookingReferenceCode is required in the request body');
      return;
    }

    let roomId, agentId;

    try {
      // Call the API Gateway endpoint with the bookingCode query parameter using axios
      const apiURL = `${API_GATEWAY_URL}`;
      console.log('Making request to API Gateway:', apiURL);
      const apiResponse = await axios.post(apiURL, { bookingCode: bookingReferenceCode });

      console.log('API Response:', apiResponse.data);

      // Extract roomId and agentId from the API Gateway response
      if (apiResponse.data) {
        const responseBody = apiResponse.data;
        roomId = responseBody.roomId;
        agentId = responseBody.agentId;

        if (!roomId || !agentId) {
          throw new Error('roomId or agentId not found in the API Gateway response');
        }

        console.log('Room ID:', roomId);
        console.log('Agent ID:', agentId);
      } else {
        throw new Error('Invalid API Gateway response format');
      }
    } catch (error) {
      console.error(`Error querying API Gateway: ${error.message}`, error.response ? error.response.data : '');
      return;
    }

    try {
      // Store data in Firestore
      await firestore.collection(QUESTIONS_COLLECTION).doc(questionId.toString()).set({
        referenceCode: bookingReferenceCode,
        userId,
        agentId,
        question,
        questionTimeStamp: new Date().toISOString(), // Current timestamp
        answer: null,
        answerTimeStamp: null, // Initial value for the answer timestamp
        questionId
      });

      console.log('Question data saved to Firestore successfully');
    } catch (error) {
      console.error(`Error writing to Firestore: ${error}`);
    }
  } catch (error) {
    console.error(`Error processing message: ${error}`);
  }
};
