import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoClient);

const tableName = process.env.WORKOUTS_TABLE_NAME;

const response = (statusCode: number, body: object): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

export const handler = async (
  _event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!tableName) {
      console.error("WORKOUTS_TABLE_NAME is not configured");
      return response(500, { message: "Server configuration error" });
    }

    const result = await documentClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": "TEMP_USER_ID",
        },
      }),
    );

    return response(200, {
      workouts: result.Items ?? [],
    });
  } catch (error) {
    console.error("Error getting workouts:", error);

    return response(500, {
      message: "Failed to get workouts",
    });
  }
};
