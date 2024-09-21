const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

exports.fetchQuestionAndAnswer = async (req, res) => {
  try {

    console.log('Request body is ',req.body);
    console.log('Request query is ',req.query);
    
    const userId  = req.query.userId || req.body.userId;

    if (!userId) {
      return res.status(400).send('Missing userId parameter');
    }

     const questionsRef = firestore.collection('questions');
     console.log('before calling snapshot');
     const querySnapshot = await firestore.collection('questions')
     .where('userId', '==', userId)
     .where('answer', '!=', null)
    .get();

     console.log('after finding snapshot');

    if (querySnapshot.empty) {
      return res.status(404).send('No questions found for the specified userId');
    }

    let questions = [];
    querySnapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        data: doc.data()
      });
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send('Internal Server Error');
  }
};
