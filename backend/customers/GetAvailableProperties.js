import { DynamoDBClient, ScanCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({
    region: "us-east-1",
});
const ROOMS_TABLE_NAME = 'Rooms';
const FEEDBACK_TABLE_NAME = 'Feedback';

export const handler = async (event) => {
    try {
        console.log("Input is: ", event);

        // Retrieve all items from DynamoDB Rooms table
        const roomParams = {
            TableName: ROOMS_TABLE_NAME,
        };

        const roomData = await dynamoDBClient.send(new ScanCommand(roomParams));
        
        // Simplify the response for rooms
        const roomsItems = roomData.Items.map(item => {
            return {
                roomId: item.roomId.S,
                additionalFeature: item.additionalFeature?.S,
                capacity: item.capacity?.S,
                discountCode: item.discountCode?.S,
                feedbackId: item.feedbackId?.S,
                furnishType: item.furnishType?.S,
                polarityOfFeedback: item.polarityOfFeedback?.S,
                price: item.price?.S,
                propertyAgentId: item.propertyAgentId?.S,
                roomType: item.roomType?.S,
            };
        });
         console.log("Before fetching feedback details");        
        // Fetch feedback details for each room
            const roomsWithFeedback = await Promise.all(roomsItems.map(async (room) => {
            // Fetch feedback details for the room
            let feedbackItems = [];

            // Scan the Feedback table to find all feedback items associated with the specified roomId
            const feedbackParams = {
                TableName: FEEDBACK_TABLE_NAME,
                FilterExpression: "roomId = :roomId",
                ExpressionAttributeValues: {
                    ":roomId": { S: room.roomId }
                }
            };

            const feedbackData = await dynamoDBClient.send(new ScanCommand(feedbackParams));
            console.log(feedbackData);
            // Extract feedback items
            if (feedbackData.Items && feedbackData.Items.length > 0) {
                feedbackItems = feedbackData.Items.map(item => ({
                    feedbackId: item.feedbackId.S,
                    comments: item.feedback.S,
                    rating: item.rating.S
                }));
            }

            console.log("Retrieved feedbackItems for roomId:", room.roomId, feedbackItems);

            return {
                ...room,
                feedback: feedbackItems
            };
        }));


        // Return success response 
        return {
            statusCode: 200,
            body: JSON.stringify(roomsWithFeedback),
        };
    } catch (error) {
        console.error("Error occurred which is: ", error);
        // Return error
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Could not retrieve items from DB', error: error.message }),
        };
    }
};
