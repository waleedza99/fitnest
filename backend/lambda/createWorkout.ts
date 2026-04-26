import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoClient);

const tableName = process.env.WORKOUTS_TABLE_NAME;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Create workout Lambda invoked");

  if (!tableName) {
    throw new Error("WORKOUTS_TABLE_NAME is not configured");
  }

  const body = event.body ? JSON.parse(event.body) : {};

  const workoutId = randomUUID();
  const createdAt = new Date().toISOString();

  const item = {
    userId: "TEMP_USER_ID",
    workoutId,
    date: body.date,
    exercise: body.exercise,
    sets: body.sets,
    reps: body.reps,
    weight: body.weight,
    createdAt,
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Workout created",
      workout: item,
    }),
  };
};
