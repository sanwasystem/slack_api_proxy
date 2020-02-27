/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageAttachment, KnownBlock, Block } from "@slack/types/dist";

export type _IncomingWebhookSendArguments = {
  text?: string;
  link_names?: boolean;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  unfurl_links?: boolean;
  unfurl_media?: boolean;
};

export const isIncomingWebhookSendArguments = (arg: any): arg is _IncomingWebhookSendArguments => {
  if (arg === null || typeof arg !== "object") {
    return false;
  }
  if (arg.text !== undefined && typeof arg.text !== "string") {
    return false;
  }
  if (arg.link_names !== undefined && typeof arg.link_names !== "boolean") {
    return false;
  }
  if (arg.attachments !== undefined && !Array.isArray(arg.attachments)) {
    return false;
  }
  if (arg.blocks !== undefined && !Array.isArray(arg.blocks)) {
    return false;
  }
  if (arg.unfurl_links !== undefined && typeof arg.unfurl_links !== "boolean") {
    return false;
  }
  if (arg.unfurl_media !== undefined && typeof arg.unfurl_media !== "boolean") {
    return false;
  }

  // これだと空のオブジェクトや File を誤認してしまうのでこのチェックも加える
  if (Buffer.isBuffer(arg.buffer)) {
    return false;
  }

  return true;
};

export const isEventType = (arg: any): arg is EventType => {
  if (arg === null || typeof arg !== "object") {
    return false;
  }
  if (arg.channel !== undefined && typeof arg.channel !== "string") {
    return false;
  }
  if (arg.name !== undefined && typeof arg.name !== "string") {
    return false;
  }
  if (arg.username !== undefined && typeof arg.username !== "string") {
    return false;
  }
  if (arg.icon !== undefined && typeof arg.icon !== "string") {
    return false;
  }
  if (arg.user_icon !== undefined && typeof arg.user_icon !== "string") {
    return false;
  }
  if (arg.text !== undefined && typeof arg.text !== "string" && !isIncomingWebhookSendArguments(arg.text)) {
    return false;
  }
  if (arg.base64 !== undefined && typeof arg.base64 !== "string") {
    return false;
  }
  if (arg.filename !== undefined && typeof arg.filename !== "string") {
    return false;
  }
  if (arg.mode !== undefined && arg.mode !== "snippet") {
    return false;
  }

  return true;
};

/**
 * Lambdaを直接実行したときに期待する引数
 */
export type EventType = {
  channel?: string;
  name?: string;
  username?: string;
  icon?: string;
  user_icon?: string;
  text?: string | _IncomingWebhookSendArguments;
  base64?: string;
  filename?: string;
  mode?: "snippet";
};
