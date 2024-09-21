const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const roomId = event.roomId;

    const params = {
        TableName: 'Feedback',
        FilterExpression: 'roomId = :roomId',
        ExpressionAttributeValues: { ':roomId': roomId }
    };

    try {
        const result = await dynamoDb.scan(params).promise();
        const feedbacks = result.Items;

        if (feedbacks.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No feedbacks found for this room' }),
            };
        }
        console.log(feedbacks);
        const totalScore = feedbacks.reduce((sum, feedback) => sum + feedback.sentimentScore, 0);
        const averageScore = totalScore / feedbacks.length;

        return {
            statusCode: 200,
            body: JSON.stringify({ roomId: roomId, averageSentimentScore: averageScore }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to calculate average sentiment score', error: error.message }),
        };
    }
};
