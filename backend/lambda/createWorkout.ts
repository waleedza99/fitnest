import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoClient);

const tableName = process.env.WORKOUTS_TABLE_NAME;

type CreateWorkoutRequest = {
  date?: string;
  exercise?: string;
  sets?: number;
  reps?: number;
  weight?: number;
};

const response = (statusCode: number, body: object): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!tableName) {
      console.error("WORKOUTS_TABLE_NAME is not configured");
      return response(500, { message: "Server configuration error" });
    }

    if (!event.body) {
      return response(400, { message: "Request body is required" });
    }

    const body = JSON.parse(event.body) as CreateWorkoutRequest;

    if (
      !body.date ||
      !body.exercise ||
      body.sets == null ||
      body.reps == null ||
      body.weight == null
    ) {
      return response(400, {
        message: "date, exercise, sets, reps, and weight are required",
      });
    }

    if (
      typeof body.date !== "string" ||
      typeof body.exercise !== "string" ||
      typeof body.sets !== "number" ||
      typeof body.reps !== "number" ||
      typeof body.weight !== "number"
    ) {
      return response(400, {
        message: "Invalid field types",
      });
    }

    if (body.sets <= 0 || body.reps <= 0 || body.weight < 0) {
      return response(400, {
        message:
          "sets and reps must be greater than 0, weight cannot be negative",
      });
    }

    const workoutId = randomUUID();
    const createdAt = new Date().toISOString();

    const item = {
      userId: "TEMP_USER_ID",
      workoutId,
      date: body.date,
      exercise: body.exercise.trim(),
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

    return response(201, {
      message: "Workout created",
      workout: item,
    });
  } catch (error) {
    console.error("Error creating workout:", error);

    return response(500, {
      message: "Failed to create workout",
    });
  }
};
