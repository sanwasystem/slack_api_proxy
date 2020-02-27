// slack api proxy v1.0.1
// https://github.com/sanwasystem/slack_api_proxy

import * as LambdaTypes from "aws-lambda";
import * as util from "./util";
import send from "./send";

exports.handler = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: LambdaTypes.APIGatewayEvent | any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: LambdaTypes.Context
): Promise<util.ApiGatewayResultType | string> => {
  try {
    await send(event);
    if (event.httpMethod) {
      // API Gateway経由
      return util.completeForAPIGateway("OK", 200);
    } else {
      // Lambda直接実行
      return "OK";
    }
  } catch (e) {
    console.error(e);
    if (event.httpMethod) {
      // API Gateway経由
      return util.completeForAPIGateway(e, 500);
    } else {
      // Lambda直接実行
      throw e;
    }
  }
};
