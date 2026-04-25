import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Create workout Lambda invoked');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Create workout Lambda is working',
    }),
  };
};