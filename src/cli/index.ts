// eslint-disable-next-line @typescript-eslint/no-var-requires
const myModule = require("../index");

(async () => {
  myModule.handler(
    {
      channel: "bot-test",
      text: "HELLO, HAPPY WORLD!",
      name: "MySlackBot",
      icon: "nico"
    },
    {}
  );

  console.log("OK");
})();
