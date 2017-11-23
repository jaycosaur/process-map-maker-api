import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const params = {
      TableName: "processmap",
      Item: {
        userId: event.requestContext.identity.cognitoIdentityId,
        processMapId: uuid.v1(),
        title: data.title,
        description: data.description,
        content: data.content,
        isShared: null,
        lastShared: null,
        sharedLinkCode: null,
        createdAt: new Date().getTime()
      }
    };
  
    try {
      await dynamoDbLib.call("put", params);
      callback(null, success(params.Item));
    } catch (e) {
      callback(null, failure({ status: false }));
    }
  }

