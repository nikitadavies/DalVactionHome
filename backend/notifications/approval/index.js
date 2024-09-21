const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/401985591036/RoomBookingQueue';
const topicArn = 'arn:aws:sns:us-east-1:401985591036:RoomBookingRequest';

exports.handler = async (event) => {
    const messages = event.Records;

    for (const message of messages) {
        const bookingRequest = JSON.parse(message.body);
        const { registrationId, userId, roomId, bookingStartDate, bookingEndDate, totalBookingDays } = bookingRequest;

        try {
             // Fetch user's emailId
             const emailId = await getUserEmail(userId);

             if (!emailId) {
                 console.error('Email not found for userId:', userId);
                 continue;
             }

            // Check room availability
            const params = {
                TableName: 'registration',
                FilterExpression: 'roomId = :roomId AND (bookingStartDate BETWEEN :startDate AND :endDate OR bookingEndDate BETWEEN :startDate AND :endDate)',
                ExpressionAttributeValues: {
                    ':roomId': roomId,
                    ':startDate': bookingStartDate,
                    ':endDate': bookingEndDate
                }
            };

            const data = await docClient.scan(params).promise();

            const confirmationMessage = `
                Dear User,
                
                Thank you for your interest in booking with DALVacationHome! We are pleased to inform you that your booking has been successfully confirmed. Here are your booking details:
                
                Registration ID: ${registrationId}
                Room ID: ${roomId}
                Booking Start Date: ${bookingStartDate}
                Booking End Date: ${bookingEndDate}
                Total Booking Days: ${totalBookingDays}
                
                We look forward to hosting you!
                
                Best regards,
                The DALVacationHome Team
            `;

            const rejectionMessage = `
                Dear User,
                
                We regret to inform you that your booking request for the following room could not be processed as the room is already booked during the requested period:
                
                Room ID: ${roomId}
                Requested Start Date: ${bookingStartDate}
                Requested End Date: ${bookingEndDate}
                
                Please feel free to choose another available room or modify your booking dates.
                
                Best regards,
                The DALVacationHome Team
            `;
            if (data.Items.length === 0) {
                // Room is available, proceed with booking
                const putParams = {
                    TableName: 'registration',
                    Item: {
                        registrationId,
                        userId,
                        roomId,
                        bookingStartDate,
                        bookingEndDate,
                        totalBookingDays
                    }
                };

                await docClient.put(putParams).promise();
                await sendEmailAndSubscribe(emailId, 'Booking Confirmation', confirmationMessage);
            } else {
                // Room is not available
                await sendEmail(emailId, 'Booking Rejection', rejectionMessage);
            }
        } catch (error) {
            console.error('Error processing booking request:', error);
            throw error;
        }
    }
};


const getUserEmail = async (userId) => {
    const params = {
        TableName: 'users',
        Key: {
            userId: userId
        }
    };

    try {
        const data = await docClient.get(params).promise();
        return data.Item ? data.Item.emailId : null;
    } catch (error) {
        console.error('Error fetching user email:', error);
        throw error;
    }
};


const sendEmailAndSubscribe = async (emailId, subject, message) => {
    try {
        // Subscribe the emailId to the SNS topic
        const subscribeParams = {
            Protocol: 'email',
            TopicArn: topicArn,
            Endpoint: emailId
        };

        await sns.subscribe(subscribeParams).promise();

        // Send email notification
        await sendEmail(emailId, subject, message);
    } catch (error) {
        console.error('Error subscribing email to SNS topic:', error);
        throw error;
    }
};

const sendEmail = async (emailId, subject, message) => {
    const params = {
        Message: message,
        Subject: subject,
        TopicArn: topicArn,
        MessageAttributes: {
            'emailId': {
                DataType: 'String',
                StringValue: emailId
            }
        }
    };

    await sns.publish(params).promise();
};
