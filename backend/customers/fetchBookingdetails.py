import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    
    USERS_TABLE = 'UserDetails'
    ROOMS_TABLE = 'Rooms'
    BOOKING_TABLE = 'Booking'
    
    booking_code = event['bookingCode']
    
    booking_table = dynamodb.Table(BOOKING_TABLE)
    booking_response = booking_table.get_item(
        Key={'bookingCode': booking_code}
    )
    
    if 'Item' not in booking_response:
        return {"error": "Booking code is invalid"}
    
    booking_details = booking_response['Item']
    
    user_id = booking_details['userId']
    users_table = dynamodb.Table(USERS_TABLE)
    user_response = users_table.get_item(
        Key={'UserID': user_id}
    )
    
    if 'Item' not in user_response:
        return {"error": "User not found"}
    
    user_details = user_response['Item']
    
    room_id = booking_details['roomId']
    rooms_table = dynamodb.Table(ROOMS_TABLE)
    room_response = rooms_table.get_item(
        Key={'roomId': room_id}
    )
    
    if 'Item' not in room_response:
        return {"error": "Room not found"}
    
    room_details = room_response['Item']
    
    result = {
        "bookingStartDate": booking_details.get('bookingStartDate'),
        "bookingEndDate": booking_details.get('bookingEndDate'),
        "totalBookingDays": booking_details.get('totalBookingDays'),
        "status": booking_details.get('status'),
        "roomType": room_details.get('roomType'),
        "capacity": room_details.get('capacity'),
        "price": room_details.get('price'),
        "furnishedType": room_details.get('furnishedType'),
        "name": user_details.get('name'),
        "emailId": user_details.get('email'),
        "address": user_details.get('address')
    }
    
    return result
