const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

exports.updateAnswerForQuestion = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    console.log('questionId is ',questionId);
    console.log('answer is ',answer);

    if (!questionId || !answer) {
      return res.status(400).send('Missing questionId or answer in the request body');
    }

    const questionRef = firestore.collection('questions').doc(questionId);
    
    await questionRef.update({
      answer: answer,
      answerTimeStamp: Firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send('Answer updated successfully');
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).send('Internal Server Error');
  }
};
