import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('UserDetails')

def lambda_handler(event, context):
    user_pool_id = 'us-east-1_I1n3jFVog'
    username = event['userName']
    user_attributes = event['request']['userAttributes']
    client = boto3.client('cognito-idp')

    try:
        group_name = user_attributes.get('custom:user_group')
        if not group_name:
            raise ValueError("custom:user_group attribute is missing")

        client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=username,
            GroupName=group_name
        )

        table.put_item(
            Item={
                'UserID': user_attributes['email'],
                'email': user_attributes['email'],
                'name': user_attributes['custom:name'],
                'security_question': user_attributes['custom:security_question'],
                'security_answer': user_attributes['custom:security_answer'],
                'cipher_key': int(user_attributes['custom:cipher_key']),
                'address': user_attributes.get('custom:address', ''),
                'city': user_attributes.get('custom:city', ''),
                'pincode': user_attributes.get('custom:pincode', ''),
                'contact_no': user_attributes.get('custom:contact_no', ''),
                'user_type': user_attributes.get('custom:user_type', '')
            }
        )
    except Exception as e:
        print(f"Error processing user {username} for group {group_name}: {e}")

    return event
