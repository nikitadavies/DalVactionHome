const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const handler = async (event) => {
    const { email, encodedString, attemptedDecoding } = event;

    const params = {
        TableName: 'UserDetails',
        Key: {
            'UserID': email
        }
    };

    try {
        const data = await dynamoDb.get(params).promise();
        if (!data.Item) {
            throw new Error('User not found');
        }

        const key = data.Item.cipher_key;
        const decodedString = caesarCipherDecode(encodedString, key);

        const isDecodingCorrect = decodedString === attemptedDecoding;

        return {
            statusCode: 200,
            body:{
                isDecodingCorrect: isDecodingCorrect
            }
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

function caesarCipherDecode(encodedString, key) {
    return encodedString.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            let shiftedCode;
            if (code >= 65 && code <= 90) {
                // Uppercase letters
                shiftedCode = ((code - 65 - key + 26) % 26) + 65;
            } else if (code >= 97 && code <= 122) {
                // Lowercase letters
                shiftedCode = ((code - 97 - key + 26) % 26) + 97;
            }
            return String.fromCharCode(shiftedCode);
        }
        return char;
    }).join('');
}

module.exports.handler = handler;
