import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({
    region: 'us-east-1',
});
const BOOKING_TABLE = 'Booking';
const ROOMS_TABLE = 'Rooms';

export const handler = async (event) => {
    console.log("Input event:", JSON.stringify(event));

    // Extract bookingCode from query parameters
    let bookingCode = JSON.parse(event.body).bookingCode;
    console.log("Booking code is "+JSON.parse(event.body).bookingCode);
    // Ensure that we are in the correct event context
    if (!bookingCode) 
    {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing bookingCode in the query parameters" }),
        };
    }

    console.log("Extracted bookingCode:", bookingCode);

    let roomId, agentId;

    try {
        // Fetch the roomId from the Booking table
        const bookingParams = {
            TableName: BOOKING_TABLE,
            Key: {
                bookingCode: { S: bookingCode }
            }
        };

        console.log("Booking Params:", JSON.stringify(bookingParams));
        const bookingCommand = new GetItemCommand(bookingParams);
        const bookingResult = await dynamoDBClient.send(bookingCommand);
        console.log("Booking Result:", JSON.stringify(bookingResult));

        if (!bookingResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Booking details not found for bookingCode: ${bookingCode}` }),
            };
        }

        roomId = bookingResult.Item.roomId.S; // Access the roomId from the result
        console.log("Room ID:", roomId);

        // Retrieve agentId from the Rooms table
        const roomsParams = {
            TableName: ROOMS_TABLE,
            Key: {
                roomId: { S: roomId }
            }
        };

        console.log("Rooms Params:", JSON.stringify(roomsParams));
        const roomsCommand = new GetItemCommand(roomsParams);
        const roomsResult = await dynamoDBClient.send(roomsCommand);
        console.log("Rooms Result:", JSON.stringify(roomsResult));

        if (!roomsResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `No rooms found for roomId: ${roomId}` }),
            };
        }

        agentId = roomsResult.Item.propertyAgentId.S; // Access the propertyAgentId from the result
        console.log("Property Agent ID:", agentId);

        return {
            statusCode: 200,
            body: JSON.stringify({ roomId, agentId }),
        };

    } catch (error) {
        console.error(`Error querying DynamoDB: ${error}`);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Error querying DynamoDB: ${error.message}` }),
        };
    }
};
