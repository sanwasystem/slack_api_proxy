import * as https from "https";

export const postMessage = async (url: string, payload: object): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        host: "hooks.slack.com",
        path: url.replace("https://hooks.slack.com", "")
      },
      res => {
        const result: Buffer[] = [];
        res.on("data", (chunk: Buffer) => {
          result.push(chunk);
        });

        res.on("end", () => {
          resolve(Buffer.concat(result).toString("utf-8"));
        });

        res.on("error", (data: string | Buffer) => {
          reject(data.toString("utf-8"));
        });
      }
    );

    req.write(`payload=${encodeURIComponent(JSON.stringify(payload))}`);

    req.end();
  });
};
