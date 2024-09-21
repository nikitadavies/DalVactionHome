const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));

    const params = {
        TableName: 'Feedback'
    };

    try {
        console.log('Fetching all feedback...');
        const data = await dynamoDb.scan(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ feedbacks: data.Items }),
        };
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch feedback', error: error.message }),
        };
    }
};
