const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    console.log(JSON.stringify(body));
    const bookingReference = body.sessionInfo?.parameters?.bookingreference;

    console.log('Booking Reference:', bookingReference);

    let bookingResponse, roomResponse, userResponse, responseString;

    const bookingRequestData = {
        TableName: 'booking',
        ExpressionAttributeValues: {
            ":bookingCode": {
                S: bookingReference
            }
        },
        KeyConditionExpression: "bookingCode = :bookingCode"
    };
    try {
        const response = (await dynamoDB.query(bookingRequestData).promise()).$response;
        bookingResponse = response.httpResponse.body;
    } catch(err) {
        console.error('Unable to find booking. Error JSON:', JSON.stringify(err, null, 2));
    }
    
    const roomRequestData = {
        TableName: 'room',
        ExpressionAttributeValues: {
            ":roomId": {
                S: bookingResponse.roomId
            }
        },
        KeyConditionExpression: "roomId = :roomId"
    };
    try{
        const response = (await dynamoDB.query(roomRequestData).promise()).$response;
        roomResponse = response.httpResponse.body;
    } catch(err) {
        console.error('Unable to find room. Error JSON:', JSON.stringify(err, null, 2));
    }
    
    const userRequestData = {
        TableName: 'users',
        ExpressionAttributeValues: {
            ":userId": {
                S: bookingResponse.userId
            }
        },
        KeyConditionExpression: "userId = :userId"
    };
    try{
        const response = (await dynamoDB.query(userRequestData).promise()).$response;
        userResponse = response.httpResponse.body;
    } catch(err) {
        console.error('Unable to find user. Error JSON:', JSON.stringify(err, null, 2));
    }


    responseString = `The following are the booking details for reference code ${bookingReference}:\n
        Name: ${userResponse.name},
        Email ID: ${userResponse.email}
        Booking Code: ${bookingResponse.bookingCode}
        Booking Start Date: ${bookingResponse.bookingStartDate}
        Booking End Date: ${bookingResponse.bookingEndDate}
        Total Booking Days: ${bookingResponse.totalBookingDays}
        Status: ${bookingResponse.status}
        Room Type: ${roomResponse.roomType},
        Capacity: ${roomResponse.capacity},
        Price: ${roomResponse.price},
        Furnished Type: ${roomResponse.furnishedType}`;

    const response = {
        "fulfillment_response": {
            "messages": [
                {
                    "text": {
                        "text": [responseString]
                    }
                }
            ]
        }
    };

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
};
