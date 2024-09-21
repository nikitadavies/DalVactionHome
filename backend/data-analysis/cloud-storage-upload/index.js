const AWS = require('aws-sdk');
const { Storage } = require('@google-cloud/storage');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Initialize AWS Secrets Manager client
const secretsManager = new AWS.SecretsManager();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = 'login_statistics'; 
const bucketName = 'example_looker_studio_data';

async function getGCPServiceAccountKey() {
  const secretName = 'google-cloud-storage-account';
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}

async function scanDynamoDBTable() {
  const params = {
    TableName: tableName
  };
  
  const allItems = [];
  let items;
  do {
    items = await dynamoDB.scan(params).promise();
    items.Items.forEach(item => allItems.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== 'undefined');

  return allItems;
}

exports.handler = async (event) => {
  try {
    const serviceAccountKey = await getGCPServiceAccountKey();

    // Initialize Google Cloud Storage client with the retrieved service account key
    const gcs = new Storage({
      credentials: serviceAccountKey
    });

    const records = await scanDynamoDBTable();

    if (records.length === 0) {
      console.log('No records to process');
      return;
    }

    // Convert DynamoDB data to CSV format
    const parser = new Parser();
    const csv = parser.parse(records);

    // Define the file name and path
    const fileName = `dynamodb_export_login_statistics.csv`;
    const filePath = `/tmp/${fileName}`;

    // Write CSV data to a temporary file
    fs.writeFileSync(filePath, csv);

    // Upload the file to GCS
    await gcs.bucket(bucketName).upload(filePath, {
      destination: fileName
    });

    console.log(`File uploaded to GCS bucket ${bucketName} as ${fileName}`);
  } catch (error) {
    console.error('Error processing DynamoDB table:', error);
    throw error;
  }
};
