/* eslint-disable @typescript-eslint/no-empty-function */
import * as assert from "assert";
import * as myModule from "../src/index";
import * as LambdaTypes from "aws-lambda";
import * as fs from "fs";
import * as parser from "../src/multipartFormBodyParser";
import * as util from "../src/util";

const loadJson = <T>(filename: string): T => {
  const rawJson = JSON.parse(fs.readFileSync("test/fixtures/" + filename).toString("utf-8"));
  return rawJson as T;
};

const loadFile = (filename: string): Buffer => {
  return fs.readFileSync("test/fixtures/" + filename);
};

describe("multipartFormBodyParser", () => {
  describe("parse result", () => {
    it("text data", async () => {
      const event = loadJson<LambdaTypes.APIGatewayEvent>("test1_request.json");
      const buffer = util.getBodyAsBuffer(event);
      const contentType = util.getContentType(event.headers);
      const parseResult = await parser.parse(buffer, contentType);

      assert.equal(parseResult["channel"], "@username");
      assert.equal(parseResult["filename"], "testfile.txt");
      const file = parser.getFile(parseResult, "file");
      if (!file) {
        throw new Error("file is not file");
      }
      const fileExpected = loadFile("test1_text.txt");
      assert.equal(file.fileName, "test1_text.txt");
      assert.equal(file.buffer.toString("base64"), fileExpected.toString("base64"));
      assert.equal(file.contentType, "text/plain");
    });

    it("binary data", async () => {
      const event = loadJson<LambdaTypes.APIGatewayEvent>("test2_request.json");
      const buffer = util.getBodyAsBuffer(event);
      const contentType = util.getContentType(event.headers);
      const parseResult = await parser.parse(buffer, contentType);

      assert.equal(parseResult["channel"], "@username");
      assert.equal(parseResult["filename"], "binarytest.7z");
      const file = parser.getFile(parseResult, "file");
      if (!file) {
        throw new Error("file is not file");
      }
      const fileExpected = loadFile("test2_binary.7z");
      assert.equal(file.fileName, "binary.7z");
      assert.equal(file.buffer.toString("base64"), fileExpected.toString("base64"));
      assert.equal(file.contentType, "application/x-7z-compressed");
    });
  });
});

describe("get request", () => {
  describe("parse result", () => {
    it("text", async () => {
      const event = loadJson<LambdaTypes.APIGatewayEvent>("test3_request.json");
      assert.equal(event.queryStringParameters?.channel, "@username");
      assert.equal(event.queryStringParameters?.text, "HELLO WORLD");
    });
  });
});

describe("util", () => {
  describe("wrapWithColon", () => {
    it("wrapWithColon", () => {
      assert.equal(util.wrapWithColon("hoge"), ":hoge:");
    });
  });
});
