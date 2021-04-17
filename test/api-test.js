var tape = require("tape"),
  { fetchDatasheet } = require("../");
const fetch = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

tape("fetchDatasheet() has the expected defaults", async function (test) {
  var result = await fetchDatasheet();
  console.log(result);
  test.ok(result.events.length === 0);
  test.end();
});

tape(
  "fetchDatasheet() works with a running datasheet URL",
  async function (test) {
    var result = await fetchDatasheet({
      features: {
        events: {
          src:
            "https://blmprotests.forensic-architecture.org/us2020-server/api/us2020/export_events/deeprows",
          fetch: true,
        },
      },
    });

    console.log(result.events[0]);
    test.ok(result.events);
    test.end();
  }
);
