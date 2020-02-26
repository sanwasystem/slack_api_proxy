// eslint-disable-next-line @typescript-eslint/no-var-requires
const Busboy: any = require("busboy");
import * as _ from "lodash";

/**
 * 適当に拡張子とMIME tyepとを並べたもの
 */
const extentionContentTypeMap: { [name: string]: string } = {
  aac: "audio/aac",
  abw: "application/x-abiword",
  arc: "application/octet-stream",
  avi: "video/x-msvideo",
  azw: "application/vnd.amazon.ebook",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bz: "application/x-bzip",
  bz2: "application/x-bzip2",
  csh: "application/x-csh",
  css: "text/css",
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  es: "application/ecmascript",
  gif: "image/gif",
  gzip: "multipart/x-gzip",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  ics: "text/calendar",
  jar: "application/java-archive",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  mid: "audio/midi audio/x-midi",
  midi: "audio/midi audio/x-midi",
  mpeg: "video/mpeg",
  mpkg: "application/vnd.apple.installer+xml",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  otf: "font/otf",
  png: "image/png",
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  rar: "application/x-rar-compressed",
  rtf: "application/rtf",
  sh: "application/x-sh",
  svg: "image/svg+xml",
  swf: "application/x-shockwave-flash",
  tar: "application/x-tar",
  txt: "text/plain",
  text: "text/plain",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "application/typescript",
  ttf: "font/ttf",
  vsd: "application/vnd.visio",
  wav: "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xml: "application/xml",
  xul: "application/vnd.mozilla.xul+xml",
  zip: "application/zip",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  "7z": "application/x-7z-compressed"
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFile = (arg: any): arg is File => {
  if (arg === null || typeof arg !== "object") {
    return false;
  }
  if (arg.fileName === undefined && typeof arg.fileName !== "string") {
    return false;
  }
  if (arg.encoding === undefined && typeof arg.encoding !== "string") {
    return false;
  }
  if (arg.contentType === undefined && typeof arg.contentType !== "string") {
    return false;
  }
  if (Buffer.isBuffer(arg.buffer)) {
    return false;
  }
  return true;
};

export type File = {
  fileName: string;
  encoding: string;
  contentType: string;
  buffer: Buffer;
};

type MultiPartFormParseResultType = {
  [fieldName: string]: string | File;
};

export const getContentTypeFromExtention = (fileName: string): string => {
  if (!fileName) {
    return "application/octet-stream";
  }
  const extention = _.last(fileName.split(".")) ?? "";
  const result = extentionContentTypeMap[extention];
  return result ?? "application/octet-stream";
};

export const parse = (buffer: Buffer, contentType: string): Promise<MultiPartFormParseResultType> => {
  const result: MultiPartFormParseResultType = {};

  return new Promise<MultiPartFormParseResultType>(resolve => {
    const busboy = new Busboy({
      headers: { "content-type": contentType }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    busboy.on("file", (fieldName: string, file: any, fileName: string, encoding: string, mimeType: string) => {
      file.on("data", (content: Buffer) => {
        if (!mimeType || mimeType === "octet-stream" || mimeType === "application/octet-stream") {
          mimeType = getContentTypeFromExtention(fileName);
        }

        result[fieldName] = {
          fileName,
          encoding,
          buffer: content,
          contentType: mimeType
        };
      });
    });

    busboy.on(
      "field",
      (
        fieldName: string,
        value: string,
        fieldnameTruncated: boolean,
        valTruncated: boolean,
        encoding: string,
        mimeType: string
      ) => {
        result[fieldName] = value;
      }
    );
    busboy.on("finish", () => {
      resolve(result);
    });

    busboy.write(buffer);
  });
};

export const getString = (multiPartFormParseResult: MultiPartFormParseResultType, name: string): string | undefined => {
  const result = multiPartFormParseResult[name];
  if (typeof result !== "string") {
    return undefined;
  }
  return result;
};

export const getFile = (multiPartFormParseResult: MultiPartFormParseResultType, name: string): File | undefined => {
  const result = multiPartFormParseResult[name];
  if (result === undefined || typeof result === "string") {
    return undefined;
  }
  return result;
};
