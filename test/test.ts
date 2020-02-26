/* eslint-disable @typescript-eslint/no-empty-function */
import * as assert from "assert";
import * as LambdaTypes from "aws-lambda";
import * as fs from "fs";
import * as formParser from "../src/multipartFormBodyParser";
import * as reqParser from "../src/parameters";
import * as util from "../src/util";
import * as Types from "../src/types";

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
      const parseResult = await formParser.parse(buffer, contentType);

      assert.equal(parseResult["channel"], "@username");
      assert.equal(parseResult["filename"], "testfile.txt");
      const file = formParser.getFile(parseResult, "file");
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
      const parseResult = await formParser.parse(buffer, contentType);

      assert.equal(parseResult["channel"], "@username");
      assert.equal(parseResult["filename"], "binarytest.7z");
      const file = formParser.getFile(parseResult, "file");
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

function assertTextMode(arg: reqParser.TextMode | reqParser.FileMode): asserts arg is reqParser.TextMode {
  if (arg.mode !== "Text") {
    throw new Error();
  }
}
function assertFileMode(arg: reqParser.TextMode | reqParser.FileMode): asserts arg is reqParser.FileMode {
  if (arg.mode !== "File") {
    throw new Error();
  }
}
describe("request parser", () => {
  describe("lambda direct execution", () => {
    it("simple text", async () => {
      const req = loadJson("request/direct/request_1.json");
      const result = await reqParser.parse(req);
      assertTextMode(result);
      assert.equal(result.channel, "bot-test");
      assert.equal(result.icon, ":cat:");
      assert.equal(result.message, "HELLO WORLD");
    });

    it("complex text", async () => {
      const req = loadJson("request/direct/request_2.json");
      const result = await reqParser.parse(req);
      const message = {
        text: "HELLO WORLD!",
        attachments: [
          {
            color: "#00FF00",
            fields: [
              { title: "Aisatsu1", value: "Nya! Nya! Nya!" },
              { title: "Aisatsu2", value: "Wan! Wan! Wan!" }
            ]
          }
        ]
      };

      assertTextMode(result);
      assert.equal(result.channel, "bot-test");
      assert.equal(result.username, "MyBOT");
      assert.deepStrictEqual(result.message, message);
    });

    it("binary file", async () => {
      const req = loadJson("request/direct/request_3.json");
      const file = loadFile("request/direct/request_3.7z");
      const result = await reqParser.parse(req);
      assertFileMode(result);
      assert.equal(result.channel, "bot-test");
      assert.equal(result.filename, "binary.7z");
      assert.equal(result.buffer.toString("base64"), file.toString("base64"));
    });

    it("snippet", async () => {
      const req = loadJson("request/direct/request_4.json");
      const snippet = Buffer.from("HELLO, WORLD!", "utf-8");
      const result = await reqParser.parse(req);
      assertFileMode(result);
      assert.equal(result.channel, "bot-test");
      assert.equal(result.filename, "snippet.txt"); // デフォルト値
      assert.equal(result.buffer.toString("base64"), snippet.toString("base64"));
    });

    it("snippet (filename assigned)", async () => {
      const req = loadJson("request/direct/request_5.json");
      const snippet = Buffer.from("HELLO, WORLD!", "utf-8");
      const result = await reqParser.parse(req);
      assertFileMode(result);
      assert.equal(result.channel, "bot-test");
      assert.equal(result.filename, "MyText.txt");
      assert.equal(result.buffer.toString("base64"), snippet.toString("base64"));
    });
  });

  describe("via API Gateway / POST", () => {
    it("simple text", async () => {
      const req = loadJson("request/post/request_1.json");
      const result = await reqParser.parse(req);
      // console.log(result);
      // assertTextMode(result);
      // assert.equal(result.channel, "@username");
      // assert.equal(result.icon, ":cat:");
      // assert.equal(result.message, "HELLO WORLD");
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
