const AWS = require('aws-sdk');
const { LanguageServiceClient } = require('@google-cloud/language');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager();
const fs = require('fs');
const path = require('path');

let languageClient;
let credentialsFetched = false;

const getGoogleCredentials = async () => {
    if (credentialsFetched) return; // Prevent re-fetching the credentials

    console.log('Fetching Google Cloud credentials from Secrets Manager...');
    const secretName = 'google-cloud-service-account';
    const secret = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    console.log("secret", secret);
    const credentials = JSON.parse(secret.SecretString);
    console.log("credentials", credentials);

    // Write the credentials to a file specified by the environment variable
    const credentialFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    fs.writeFileSync(credentialFilePath, JSON.stringify(credentials));

    languageClient = new LanguageServiceClient();
    credentialsFetched = true;
    console.log('Google Cloud credentials fetched and client initialized.');
};

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));
    const { roomId, roomType, feedback, rating, userId } = event;
    const feedbackId = Math.floor(Math.random() * 1000000).toString();

    try {
        await getGoogleCredentials();

        const document = {
            content: feedback,
            type: 'PLAIN_TEXT',
        };

        console.log('Analyzing sentiment...');
        const [result] = await languageClient.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;
        console.log('Sentiment analysis result:', sentiment);

        const params = {
            TableName: 'Feedback',
            Item: {
                feedbackId: feedbackId,
                roomId: roomId,
                roomType: roomType,
                feedback: feedback,
                rating: rating,
                userId: userId,
                sentimentScore: sentiment.score,
                sentimentMagnitude: sentiment.magnitude,
            },
        };

        console.log('Saving feedback to DynamoDB...');
        await dynamoDb.put(params).promise();
        console.log('Feedback saved successfully.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Feedback added and analyzed successfully' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to add feedback', error: error.message }),
        };
    }
};
