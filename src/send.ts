// slack api proxy v1.0.0
// https://github.com/sanwasystem/slack_api_proxy

/* eslint-disable @typescript-eslint/camelcase */
import * as LambdaTypes from "aws-lambda";
import * as util from "./util";
import * as parameters from "./parameters";
import * as token from "./tokenManager";
import { WebClient } from "@slack/web-api";
import * as webhook from "./webhookClient";

/**
 * Lambdaに渡された引数を処理し、エラーが起きたら例外をスローする
 * @param event Lambdaの引数
 */
const send = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: LambdaTypes.APIGatewayEvent | any
): Promise<void> => {
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
        return;
      } else {
        throw new Error(JSON.stringify(result.response_metadata));
      }
    }

    case "Text": {
      const url = await token.getWebhookUrl(param.channel);
      let payload: object;
      if (typeof param.message === "string") {
        payload = {
          channel: param.channel,
          username: param.username,
          icon_emoji: param.icon,
          text: param.message
        };
      } else {
        payload = {
          channel: param.channel,
          username: param.username,
          icon_emoji: param.icon,
          ...param.message
        };
      }
      console.log(payload);
      await webhook.postMessage(url, payload);
      return;
    }

    default: {
      return util.neverComesHere(param);
    }
  }
};

export default send;
