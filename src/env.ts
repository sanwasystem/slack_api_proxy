import * as dotenv from "dotenv";
dotenv.config();

// 指定した名前の環境変数を返す。定義されていなければ例外をスローする
const getEnv = (name: string) => {
  const result = process.env[name];
  if (result === undefined) {
    throw new Error(`environment variable "${name}" not defined`);
  }
  return result;
};

const defaultChannel = getEnv("defaultChannel");
const defaultName = getEnv("defaultName");
const defaultIcon = getEnv("defaultIcon");
const webhookUrl = getEnv("webhookUrl");
const botToken = getEnv("botToken");

export { defaultChannel, defaultName, defaultIcon, webhookUrl, botToken };
