import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: 'us-east-1' }); // Replace 'your-region' with your actual region

const queueUrl = 'https://sqs.us-east-1.amazonaws.com/139157793567/UserCreationQueue'; // Replace with your actual SQS Queue URL

export const handler = async (event) => {
    const { email } = event; // Assuming the email is passed in the event

    const params = {
        MessageBody: JSON.stringify({ email }),
        QueueUrl: queueUrl
    };

    try {
        const command = new SendMessageCommand(params);
        await sqsClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify('Message sent to SQS')
        };
    } catch (error) {
        console.error('Error sending message to SQS:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error sending message to SQS')
        };
    }
};
