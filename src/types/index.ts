export const isEventType = (arg: any): arg is EventType => {
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
  if (arg.text !== undefined && typeof arg.text !== "string") {
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

export type EventType = {
  channel?: string;
  name?: string;
  username?: string;
  icon?: string;
  user_icon?: string;
  text?: string;
  base64?: string;
  filename?: string;
  mode?: "snippet";
};
