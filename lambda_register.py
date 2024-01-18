# used to call AWS services
import boto3
# used to call s3 bucket
s3 = boto3.client('s3')
# used to call rekognition
rekognition = boto3.client('rekognition', region_name='ca-central-1')
# used to call dynamodb
dynamodbTableName = 'rekogdb'
dynamodb = boto3.client('dynamodb', region_name='ca-central-1')

# instantiate table
faceTable = dynamodb.Table(dynamodbTableName)
 
# define lambda handler
def lambda_handler(event, context):
    print(event) #debugging/understanding
    # once it gets invoked, bucketname and filename will be in 'event'
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    # index the image
    try:
        # takes the key(our filename) (passed) , and indexes it to bucket (passed)
        response = index_image(bucket, key)
        print(response) # debug
        # even though we get a response, we must verify that indexing was successful
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            # this is the unique id we will use to identify a person (uses algorithm)
            faceId = response['FaceRecords'][0]['Face']['FaceId']
            # get name from image, image will be named firstname_lastname.filetype
            name = key.split('.')[0].split('_')
            firstName = name[0]
            lastName = name[1]
            # save face to database
            register_image(faceId, firstName, lastName)
        return response
    except Exception as e:
        print(e)
        print('Error processing image {} from bucket{}.', format(key, bucket))
        raise e

def index_image(bucket, key):
    response = rekognition.index_faces(
        Image={
            'S3Object':
            {
                'Bucket': bucket,
                'Name': key
            }
        },
        CollectionId="faces" # create later
    )
    return response

def register_image(faceId, firstName, lastName):
    faceTable.put_item(
        Item={
            'rekognitionId': faceId,
            'firstName': firstName,
            'lastName': lastName
        }
    )