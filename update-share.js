import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);

    const paramsUpdate = {
      TableName: "processmap",
      Key: {
        userId: event.requestContext.identity.cognitoIdentityId,
        processMapId: event.pathParameters.id
      },
      UpdateExpression: "SET isShared = :isShared, lastShared = :lastShared",
      ExpressionAttributeValues: {
        ":isShared": event.pathParameters.shareId,
        ":lastShared": new Date().getTime()
      },
      ReturnValues: "ALL_NEW"
    };

    try {
      await dynamoDbLib.call("update", paramsUpdate);
    } catch (e) {
      console.log(e);
      callback(null, failure({ status: false }));
    }

    const paramsShare = {
      TableName: "processmapshared",
      Key: {
        shareId: event.pathParameters.shareId
      },
      UpdateExpression: "SET title = :title, description = :description, content = :content",
      ExpressionAttributeValues: {
        ":title": data.title ? data.title : null,
        ":description": data.description ? data.description : null,
        ":content": data.content ? data.content : null
      },
      ReturnValues: "ALL_NEW"
    };
    try {
      const result = await dynamoDbLib.call("update", paramsShare);
      callback(null, success({ status: true }));
    } catch (e) {
      callback(null, failure({ status: false }));
    }
  }

