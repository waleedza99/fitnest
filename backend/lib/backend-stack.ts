import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const workoutsTable = new dynamodb.Table(this, "WorkoutsTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "workoutId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createWorkoutLambda = new NodejsFunction(
      this,
      "CreateWorkoutLambda",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/createWorkout.ts"),
        handler: "handler",
        environment: {
          WORKOUTS_TABLE_NAME: workoutsTable.tableName,
        },
      },
    );

    workoutsTable.grantWriteData(createWorkoutLambda);

    const getWorkoutsLambda = new NodejsFunction(this, "GetWorkoutsLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getWorkouts.ts"),
      handler: "handler",
      environment: {
        WORKOUTS_TABLE_NAME: workoutsTable.tableName,
      },
    });

    workoutsTable.grantReadData(getWorkoutsLambda);

    const api = new apigateway.RestApi(this, "FitnestApi", {
      restApiName: "Fitnest API",
    });

    const workouts = api.root.addResource("workouts");

    workouts.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createWorkoutLambda),
    );
    workouts.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getWorkoutsLambda),
    );
  }
}
