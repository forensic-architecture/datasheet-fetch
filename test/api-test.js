var tape = require("tape"),
  { fetchDatasheet } = require("../");
const fetch = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

tape("fetchDatasheet() has the expected defaults", function (test) {
  var out = fetchDatasheet().then((out) => {
    console.log(out);
  });
  test.end();
});

tape("fetchDatasheet() works with a running datasheet URL", function (test) {
  var out = fetchDatasheet({
    features: {
      events: {
        src: "http://localhost:4040/grenfell/export_events/deeprows",
        fetch: true,
      },
    },
  }).then((out) => {
    console.log(out);
  });
  test.end();
});
