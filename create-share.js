import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
    const shareUID = uuid.v1();
    const data = JSON.parse(event.body);

    const paramsUpdate = {
      TableName: "processmap",
      Key: {
        userId: event.requestContext.identity.cognitoIdentityId,
        processMapId: data.id
      },
      UpdateExpression: "SET isShared = :isShared, lastShared = :lastShared, sharedLinkCode = :sharedLinkCode",
      ExpressionAttributeValues: {
        ":isShared": true,
        ":lastShared": new Date().getTime(),
        ":sharedLinkCode": shareUID,
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
      Item: {
        shareId: shareUID,
        userId: event.requestContext.identity.cognitoIdentityId,
        processMapId: data.id,
        createdAt: new Date().getTime(),
        title: data.title,
        description: data.description,
        content: data.content,
      }
    };
    try {
      await dynamoDbLib.call("put", paramsShare);
      callback(null, success(paramsShare.Item))
    } catch (e) {
      callback(null, failure({ status: false }));
    }
  }

