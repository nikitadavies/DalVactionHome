const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const handler = async (event) => {
    let { roomId, roomType, capacity, price, furnishedType, additionalFeature, feedbackId, PolarityOfFeedback, discountCode, propertyAgentId } = event;
    
    if (!roomId) {
        roomId = uuidv4();
    }

    const params = {
        TableName: 'room',
        Key: {
            "roomId": roomId
        },
        Item: {
            roomId: roomId || '',
            roomType: roomType || '',
            capacity: capacity || '',
            price: price || '',
            furnishedType: furnishedType || '',
            additionalFeature: additionalFeature || '',
            feedbackId: feedbackId || '',
            PolarityOfFeedback: PolarityOfFeedback || '',
            discountCode: discountCode || '',
            propertyAgentId: propertyAgentId || ''
        }
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Room added/updated successfully", roomId: roomId })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Could not update room", error: error.message })
        };
    }
};

module.exports.handler = handler;