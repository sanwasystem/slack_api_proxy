/**
 * チャンネルによってエンドポイントやトークンを切り替える必要があるときのために用意してある
 */
import * as env from "./env";

export const getWebhookUrl = async (channel: string): Promise<string> => {
  return env.webhookUrl;
};

export const getToken = async (channel: string): Promise<string> => {
  return env.botToken;
};
