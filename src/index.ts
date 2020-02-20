// slack api proxy v1.0.0
// https://github.com/sanwasystem/slack_api_proxy

/* eslint-disable @typescript-eslint/camelcase */
import * as LambdaTypes from "aws-lambda";
import * as util from "./util";
import * as parameters from "./parameters";
import * as token from "./tokenManager";
import { WebClient } from "@slack/web-api";
import * as webhook from "./webhookClient";

const neverComesHere = (arg: never): never => {
  throw new Error(arg);
};

exports.handler = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: LambdaTypes.APIGatewayEvent | any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: LambdaTypes.Context
): Promise<util.ApiGatewayResultType> => {
  try {
    const param = await parameters.parse(event);
    switch (param.mode) {
      case "File": {
        const botToken = await token.getToken(param.channel);
        const web = new WebClient(botToken);
        const result = await web.files.upload({
          channels: param.channel,
          filename: param.filename,
          file: param.buffer
        });
        if (result.ok) {
          return util.completeForAPIGateway("OK");
        } else {
          return util.completeForAPIGateway(JSON.stringify(result.response_metadata), 500);
        }
      }

      case "Text": {
        const url = await token.getWebhookUrl(param.channel);
        let payload: object;
        if (typeof param.message === "string") {
          payload = {
            channel: param.channel,
            username: param.username,
            icon_emoji: util.wrapWithColon(param.icon),
            text: param.message
          };
        } else {
          payload = {
            channel: param.channel,
            username: param.username,
            icon_emoji: util.wrapWithColon(param.icon),
            ...param.message
          };
        }
        console.log(payload);
        await webhook.postMessage(url, payload).catch(e => {
          return util.completeForAPIGateway(e, 500);
        });
        return util.completeForAPIGateway("OK", 200);
      }

      default: {
        return neverComesHere(param);
      }
    }
  } catch (e) {
    return util.completeForAPIGateway(e, 500);
  }
};
