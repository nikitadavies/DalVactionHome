const AWS = require("aws-sdk");

AWS.config.update({ region: 'us-east-1' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const handler = async (event) => {
    console.log("****email value is",event.email)
    console.log("****answer value is",event.answer)
    const email = event.email;
    const answer = event.answer;

    const data = {
        TableName: 'UserDetails',
        ExpressionAttributeValues: {
            ":UserID": email
        },
        KeyConditionExpression: "UserID = :UserID"
    };

    try {
        const response = (await dynamoDB.query(data).promise()).$response;
        const result = response.data.Items[0].security_answer === answer;

        return {
            status: response.httpResponse.statusCode,
            result: result
        };
    } catch (err) {
        console.error('Unable to verify answer. Error JSON:', JSON.stringify(err, null, 2));
    }
};

module.exports.handler = handler;