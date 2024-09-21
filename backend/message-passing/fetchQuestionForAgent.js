const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.fetchQuestionForAgent = async (req, res) => {
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);

  const agentId = req.query.agentId || req.body.agentId;

  console.log('Agent ID is:', agentId);

  if (!agentId) {
    res.status(400).send('Missing agentId parameter');
    return;
  }

  try {
    const questionsRef = firestore.collection('questions');
    const snapshot = await questionsRef.where('agentId', '==', agentId).where('answer', '==', null).get();

    if (snapshot.empty) {
      res.status(404).send('No matching documents.');
      return;
    }

    let questions = [];
    snapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send('Internal Server Error');
  }
};
