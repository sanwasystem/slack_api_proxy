import * as LambdaTypes from "aws-lambda";
import * as util from "../util";
import * as env from "../env";
import * as parser from "../multipartFormBodyParser";
import * as Types from "../types";
import * as parameters from "./parameterParaser";
import { IncomingWebhookSendArguments } from "@slack/webhook";

/**
 * 手抜きtype guard
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAPIGatewayEvent = (arg: any): arg is LambdaTypes.APIGatewayEvent => {
  if (arg.headers === null || typeof arg.headers !== "object") {
    return false;
  }
  return true;
};

/**
 * ファイル送信またはスニペット送信モード
 */
type FileMode = {
  channel: string;
  mode: "File";
  filename: string;
  contentType: string;
  buffer: Buffer;
};

/**
 * テキスト送信モード
 */
type TextMode = {
  channel: string;
  username: string;
  icon: string;
  mode: "Text";
  message: string | IncomingWebhookSendArguments;
};

const getString = (stringOrFile: string | parser.File): string => {
  if (typeof stringOrFile === "string") {
    return stringOrFile;
  } else {
    return stringOrFile.buffer.toString("utf-8");
  }
};
const getBuffer = (stringOrFile: string | parser.File): Buffer => {
  if (typeof stringOrFile === "string") {
    return Buffer.from(stringOrFile, "utf-8");
  } else {
    return stringOrFile.buffer;
  }
};

const parseRawResult = (raw: parameters.RawParseResult): FileMode | TextMode => {
  // パターン1: プレーンテキストメッセージ
  if (raw.text !== undefined && raw.mode !== "snippet" && raw.mode !== "json") {
    return {
      channel: raw.channel,
      username: raw.username,
      icon: raw.icon,
      mode: "Text",
      message: getString(raw.text)
    };
  }

  // パターン2: 複雑なメッセージ
  if (raw.text !== undefined && raw.mode === "json") {
    const text = getString(raw.text);
    let obj: object | string;
    try {
      obj = JSON.parse(text);
    } catch (e) {
      console.log("JSONモードが指定されましたがJSONとしてパースできませんでした。テキストとして送信します");
      obj = text;
    }

    return {
      channel: raw.channel,
      username: raw.username,
      icon: raw.icon,
      mode: "Text",
      message: obj
    };
  }

  // パターン3: スニペット
  if (raw.text !== undefined && raw.mode === "snippet") {
    return {
      channel: raw.channel,
      mode: "File",
      buffer: getBuffer(raw.text),
      filename: raw.filename ?? "snippet.txt",
      contentType: "text/plain; charset=utf-8"
    };
  }

  // パターン4: ファイル送信
  if (raw.file !== undefined) {
    return {
      channel: raw.channel,
      mode: "File",
      buffer: raw.file.buffer,
      contentType: raw.file.contentType,
      filename: raw.filename ?? raw.file.fileName
    };
  }

  throw new Error(`parameter error`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parse = async (event: LambdaTypes.APIGatewayEvent | any): Promise<FileMode | TextMode> => {
  if (isAPIGatewayEvent(event)) {
    // API Gateway経由で呼び出された
    if (event.httpMethod === "POST") {
      // POST
      return parseRawResult(await parameters.parsePost(event));
    } else {
      // GET
      return parseRawResult(parameters.parseGet(event));
    }
  } else {
    // Lambdaが直接呼び出された
    return parseRawResult(parameters.parseDirect(event));
  }
};
