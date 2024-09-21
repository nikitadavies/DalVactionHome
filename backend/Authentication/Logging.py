import json
import boto3
from botocore.exceptions import ClientError
import time
import uuid
from datetime import datetime

def lambda_handler(event, context):
    user_id = event['userName']
    user_attributes = event['request']['userAttributes']
    user_email = user_attributes.get('email', '')
    user_name = user_attributes.get('custom:name', '')
    user_type = user_attributes.get('custom:user_type', '')

    log_sign_in_activity(user_id, user_email)
    print(event)
    event['response']['claimsOverrideDetails'] = {
        'claimsToAddOrOverride': {
            'custom:userId': user_id,
            'custom:userEmail': user_email,
            'custom:userName': user_name,
            'custom:userType': user_type
        }
    }

    return event

def log_sign_in_activity(user_id, user_email):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('LoginDetails')

    log_id = str(uuid.uuid4())  
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")  
    time_str = now.strftime("%H:%M:%S")  

    try:
        table.put_item(
            Item={
                'LogId': log_id, 
                'UserId': user_id,
                'UserEmail': user_email,
                'SignInDate': date_str, 
                'SignInTime': time_str   
            }
        )
    except ClientError as e:
        print(f"Error logging sign-in activity: {e}")
