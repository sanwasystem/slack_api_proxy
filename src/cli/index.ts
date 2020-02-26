// eslint-disable-next-line @typescript-eslint/no-var-requires
const myModule = require("../index");

(async () => {
  const event = {
    channel: "bot-test",
    text: "HELLO WORLD!"
  };

  myModule.handler(event, {});

  console.log("OK");
})();
