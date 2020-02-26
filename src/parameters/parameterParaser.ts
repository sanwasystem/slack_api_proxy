/* eslint-disable @typescript-eslint/no-explicit-any */
import * as LambdaTypes from "aws-lambda";
import * as util from "../util";
import * as env from "../env";
import * as parser from "../multipartFormBodyParser";
import * as Types from "../types";

export type RawParseResult = {
  channel: string;
  username: string;
  icon: string;
  text: string | parser.File | Types._IncomingWebhookSendArguments | undefined;
  file: parser.File | undefined;
  filename: string | undefined;
  mode: string | undefined;
};

export const parsePost = async (event: LambdaTypes.APIGatewayEvent): Promise<RawParseResult> => {
  const contentType = util.getContentType(event.headers);
  const buffer = util.getBodyAsBuffer(event);
  const multiPart = await parser.parse(buffer, contentType);

  console.log("POST request. parameter:");
  console.log(JSON.stringify(multiPart));

  const channel = parser.getString(multiPart, "channel") ?? env.defaultChannel;
  const username = parser.getString(multiPart, "name") ?? parser.getString(multiPart, "username") ?? env.defaultName;
  const _icon = parser.getString(multiPart, "icon") ?? parser.getString(multiPart, "user_icon") ?? env.defaultIcon;
  const icon = util.wrapWithColon(_icon);
  const textStr = parser.getString(multiPart, "text");
  const textFile = parser.getFile(multiPart, "text");
  const text = textStr ?? textFile;
  const file = parser.getFile(multiPart, "file");
  const filename = parser.getString(multiPart, "filename");
  const mode = parser.getString(multiPart, "mode");

  return { channel, username, icon, text, file, filename, mode };
};

export const parseGet = (event: LambdaTypes.APIGatewayEvent): RawParseResult => {
  console.log("GET request. parameter:");
  console.log(JSON.stringify(event.queryStringParameters));

  const channel = event.queryStringParameters?.channel ?? env.defaultChannel;
  const username = event.queryStringParameters?.name ?? event.queryStringParameters?.username ?? env.defaultName;
  const _icon = event.queryStringParameters?.icon ?? event.queryStringParameters?.user_icon ?? env.defaultIcon;
  const icon = util.wrapWithColon(_icon);
  const text = event.queryStringParameters?.text;
  const file = undefined;
  const filename = event.queryStringParameters?.filename;
  const mode = event.queryStringParameters?.mode;

  return { channel, username, icon, text, file, filename, mode };
};

export const parseDirect = (event: any): RawParseResult => {
  console.log("direct lambda execution. parameter:");
  console.log(JSON.stringify(event));
  if (!Types.isEventType(event)) {
    throw new Error(`malformed parameter`);
  }

  let file: parser.File | undefined = undefined;
  const filename = event.filename ?? "unknown.dat";
  if (event.base64) {
    const buffer = Buffer.from(event.base64 ?? "", "base64");
    file = {
      buffer: buffer,
      fileName: filename,
      contentType: parser.getContentTypeFromExtention(filename),
      encoding: ""
    };
  }

  return {
    channel: event.channel ?? env.defaultChannel,
    username: event.name ?? event.username ?? env.defaultName,
    icon: util.wrapWithColon(event.icon ?? event.user_icon ?? env.defaultIcon),
    text: event.text,
    file: file,
    filename: event.filename,
    mode: event.mode
  };
};
