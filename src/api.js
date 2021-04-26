const errorMsg = (type) =>
  `Something went wrong fetching ${type}. Check the URL or try disabling them in the config file.`;

export default async function fetchDomain(
  config = {
    // TODO Should we support list for sources, or post-transform functions?
    features: {
      events: { src: undefined },
      associations: { src: undefined },
      sources: { src: undefined },
      sites: { src: undefined },
      shapes: { src: undefined },
    },
  },
  callbacks = {
    onFetchStart: () => {},
    onFetchEnd: () => {},
    onError: (e) => {},
  }
) {
  const { features } = config;
  const { onFetchStart, onFetchEnd, onError } = callbacks;
  const notifications = [];

  console.log(config);

  function handleError(message) {
    notifications.push({
      message,
      type: "error",
    });
    return [];
  }

  onFetchStart();

  const promises = Object.entries(features).reduce((acc, [key, value]) => {
    const { src, fetch: shouldFetch } = value;
    let p = Promise.resolve([]);

    if (!src) {
      p = Promise.resolve(
        handleError(`no URL provided for [${key}] data retrieval`)
      );
    } else {
      p = fetch(src)
        .then((response) => response.json())
        .catch(() => handleError(errorMsg(key)));
    }
    return [...acc, p];
  }, []);

  return Promise.all(promises)
    .then((data) => {
      const result = Object.keys(features).reduce(
        (acc, curr, idx) => ({ ...acc, [curr]: data[idx] }),
        {}
      );

      if (Object.values(result).some((resp) => resp.hasOwnProperty("error"))) {
        throw new Error(
          "Some URLs returned negative. If you are in development, check the ser"
        );
      }

      onFetchEnd();
      return result;
    })
    .catch((err) => {
      onFetchEnd();
      onError(err);
      console.error(err.message);
    });
}
