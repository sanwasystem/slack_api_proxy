import * as LambdaTypes from "aws-lambda";

/**
 * API GatewayのLambda Proxyで呼び出されるLambdaはこれを使って結果を返す
 */
export const completeForAPIGateway = (
  obj: object | string,
  statusCode = 200,
  headers: { [name: string]: string } = {}
): ApiGatewayResultType => {
  if (typeof obj == "object") {
    obj = JSON.stringify(obj);
  }
  const result: ApiGatewayResultType = {
    statusCode: statusCode,
    body: obj,
    headers: { ...headers }
  };

  result.headers["Content-Type"] = result.headers["Content-Type"] || "application/json; charset=utf-8";
  result.headers["Access-Control-Allow-Origin"] = result.headers["Access-Control-Allow-Origin"] || "*";
  return result;
};

export type ApiGatewayResultType = {
  statusCode: number;
  body: string;
  headers: { [name: string]: string | number };
};

export const getBodyAsBuffer = (event: LambdaTypes.APIGatewayEvent): Buffer => {
  const body = event.body ?? "";
  return Buffer.from(body, event.isBase64Encoded ? "base64" : "utf-8");
};

export const getContentType = (headers: { [name: string]: string }): string => {
  for (const name of Object.keys(headers)) {
    if (name.toLowerCase() === "content-type") {
      return headers[name];
    }
  }
  return "octet-stream";
};

export const wrapWithColon = (str: string): string => {
  if (!/^:/.test(str)) {
    str = ":" + str;
  }
  if (!/:$/.test(str)) {
    str = str + ":";
  }
  return str;
};
