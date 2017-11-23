import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const paramsUpdate = {
    TableName: "processmap",
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      processMapId: event.pathParameters.id
    },
    UpdateExpression: "SET isShared = :isShared",
    ExpressionAttributeValues: {
      ":isShared": false
    },
    ReturnValues: "ALL_NEW"
  };

  const paramsget = {
    TableName: "processmap",
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'processMapId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      processMapId: event.pathParameters.id
    }
  };

  const params = {
    TableName: "processmapshared",
    Key: {
      shareId: event.pathParameters.shareId,
    }
  };

  try {
    await dynamoDbLib.call("get", paramsget);
    await dynamoDbLib.call("update", paramsUpdate);
    const result = await dynamoDbLib.call("delete", params);
    callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}