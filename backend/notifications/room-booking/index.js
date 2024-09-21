const AWS = require('aws-sdk');
const uuid = require('uuid');

const sqs = new AWS.SQS();
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/401985591036/RoomBookingQueue';

exports.handler = async (event) => {
    const { userId, roomId, bookingStartDate, bookingEndDate, totalBookingDays } = event;

    const bookingRequest = {
        registrationId: uuid.v4(),
        userId,
        roomId,
        bookingStartDate,
        bookingEndDate,
        totalBookingDays
    };

    const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(bookingRequest)
    };

    try {
        await sqs.sendMessage(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Booking request submitted successfully!' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to submit booking request' })
        };
    }
};
