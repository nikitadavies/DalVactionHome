import { DynamoDBClient, ScanCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({
    region: "us-east-1",
});
const ROOMS_TABLE_NAME = 'Rooms';
const FEEDBACK_TABLE_NAME = 'Feedback';

export const handler = async (event) => {
    try {
        console.log("Input is: ", event);

        const roomId = event.roomId;

        if (!roomId) {
            throw new Error("roomId is required in the event");
        }

        // Fetch the room item from the Rooms table
        const roomParams = {
            TableName: ROOMS_TABLE_NAME,
            Key: {
                roomId: { S: roomId }
            }
        };

        const roomData = await dynamoDBClient.send(new GetItemCommand(roomParams));

        if (!roomData.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Room with roomId ${roomId} not found` }),
            };
        }

        // Extract room attributes
        const roomAttributes = {
            roomId: roomData.Item.roomId.S,
            additionalFeature: roomData.Item.additionalFeature?.S,
            capacity: roomData.Item.capacity?.S,
            discountCode: roomData.Item.discountCode?.S,
            furnishType: roomData.Item.furnishType?.S,
            polarityOfFeedback: roomData.Item.polarityOfFeedback?.S,
            price: roomData.Item.price?.S,
            propertyAgentId: roomData.Item.propertyAgentId?.S,
            roomType: roomData.Item.roomType?.S,
        };

        // Scan the Feedback table to find all feedback items associated with the specified roomId
        const feedbackParams = {
            TableName: FEEDBACK_TABLE_NAME,
            FilterExpression: "roomId = :roomId",
            ExpressionAttributeValues: {
                ":roomId": { S: roomId }
            }
        };

        const feedbackData = await dynamoDBClient.send(new ScanCommand(feedbackParams));

        if (!feedbackData.Items || feedbackData.Items.length === 0) {
            console.log("No feedback items found for roomId:", roomId);
            return {
                statusCode: 200,
                body: JSON.stringify({ ...roomAttributes, feedback: [] }),
            };
        }

        // Extract feedback items
        const feedbackItems = feedbackData.Items.map(item => ({
            feedbackId: item.feedbackId.S,
            comments: item.feedback.S,
            rating: item.rating.S
        }));

        console.log("Retrieved feedbackItems:", feedbackItems);

        // Combine room attributes with feedback items
        const roomWithFeedback = {
            ...roomAttributes,
            feedback: feedbackItems
        };

        return {
            statusCode: 200,
            body: JSON.stringify(roomWithFeedback),
        };
    } catch (error) {
        console.error("Error occurred which is: ", error);
        // Return error
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Could not retrieve data from DB', error: error.message }),
        };
    }
};
