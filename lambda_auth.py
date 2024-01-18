import boto3
# have a nice return object for frontend
import json 
# used to call s3 bucket
s3 = boto3.client('s3')
# used to call rekognition
rekognition = boto3.client('rekognition', region_name='ca-central-1')
# used to call dynamodb
dynamodbTableName = 'rekogdb'
dynamodb = boto3.client('dynamodb', region_name='ca-central-1')
# instantiate table
faceTable = dynamodb.Table(dynamodbTableName)
# specify bucket
bucketName = 'input-pic-bucket'

def lambda_handler(event, context):
    print(event)
    # extract request param from frontend
    objectKey = event['queryStringParameters']['objectKey']
    # rekognition is expecting a binary datatype
    image_bytes = s3.get_object(Bucket=bucketName, Key=objectKey)['Body'].read()
    response = rekognition.search_faces_by_image(
        CollectionId='faces',
        Image={'Bytes':image_bytes}  
    )

    for match in response['FaceMatches']:
        print (match['Face']['FaceId'], match['Face']['Confidence'])

        face = faceTable.get_item(
            Key={
                'rekognitionld': match['Face']['FaceId']
            }
        )
        if 'Item' in face: 
            print('Person Found: ', face['Item'])
            return buildResponse(200, {
                'Message': 'Success',
                'firstName': face['Item']['firstName'],
                'lastName': face['Item']['lastName']
            })
        print('Person could not be found.')
        return buildResponse(403, {'Message': 'Person not found xd'})
    
def buildResponse(statusCode, body=None):
    response={
        'statusCode': statusCode,
        'headers':{
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body)
    return response