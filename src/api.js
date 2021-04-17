const errorMsg = (type) =>
  `Something went wrong fetching ${type}. Check the URL or try disabling them in the config file.`;

export default async function fetchDomain(
  config = {
    // TODO Should we support list for sources, or post-transform functions?
    features: {
      events: { src: undefined, fetch: false },
      associations: { src: undefined, fetch: false },
      sources: { src: undefined, fetch: false },
      sites: { src: undefined, fetch: false },
      shapes: { src: undefined, fetch: false },
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

  // return async () => {
  onFetchStart();
  // dispatch(toggleFetchingDomain())

  // // NB: EVENT_DATA_URL is a list, and so results are aggregated
  // const eventPromise = Promise.all(
  //   EVENT_DATA_URL.map((url) =>
  //     fetch(url)
  //       .then((response) => response.json())
  //       .catch(() => handleError("events"))
  //   )
  // ).then((results) => results.flatMap((t) => t));

  // let associationsPromise = Promise.resolve([]);
  // if (features.USE_ASSOCIATIONS) {
  //   if (!ASSOCIATIONS_URL) {
  //     associationsPromise = Promise.resolve(
  //       handleError(
  //         "USE_ASSOCIATIONS is true, but you have not provided a ASSOCIATIONS_EXT URL"
  //       )
  //     );
  //   } else {
  //     associationsPromise = fetch(ASSOCIATIONS_URL)
  //       .then((response) => response.json())
  //       .catch(() => handleError(errorMsg("associations")));
  //   }
  // }

  // let sourcesPromise = Promise.resolve([]);
  // if (features.USE_SOURCES) {
  //   if (!SOURCES_URL) {
  //     sourcesPromise = Promise.resolve(
  //       handleError(
  //         "USE_SOURCES is true, but you have not provided a SOURCES_EXT URL"
  //       )
  //     );
  //   } else {
  //     sourcesPromise = fetch(SOURCES_URL)
  //       .then((response) => response.json())
  //       .catch(() => handleError(errorMsg("sources")));
  //   }
  // }

  // let sitesPromise = Promise.resolve([]);
  // if (features.USE_SITES) {
  //   sitesPromise = fetch(SITES_URL)
  //     .then((response) => response.json())
  //     .catch(() => handleError(errorMsg("sites")));
  // }

  // let shapesPromise = Promise.resolve([]);
  // if (features.USE_SHAPES) {
  //   shapesPromise = fetch(SHAPES_URL)
  //     .then((response) => response.json())
  //     .catch(() => handleError(errorMsg("shapes")));
  // }

  const promises = Object.entries(features).reduce((acc, [key, value]) => {
    const { src, fetch: shouldFetch } = value;
    let p = Promise.resolve([]);
    if (shouldFetch) {
      if (!src) {
        p = Promise.resolve(
          handleError(`no URL provided for [${key}] data retrieval`)
        );
      } else {
        p = fetch(src)
          .then((response) => response.json())
          .catch(() => handleError(errorMsg(key)));
      }
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

  // return Promise.all([
  //   eventPromise,
  //   associationsPromise,
  //   sourcesPromise,
  //   sitesPromise,
  //   shapesPromise,
  // ])
  //   .then(([events, associations, sources, sites, shapes]) => {
  //     const result = {
  //       events,
  //       associations,
  //       sources,
  //       sites,
  //       shapes,
  //       notifications,
  //     };
  //     if (
  //       // TODO this is probably hard-coded from datasheet-server
  //       Object.values(result).some((resp) => resp.hasOwnProperty("error"))
  //     ) {
  //       throw new Error(
  //         "Some URLs returned negative. If you are in development, check the server is running"
  //       );
  //     }
  //     // dispatch(toggleFetchingDomain());
  //     // dispatch(setInitialCategories(result.associations));
  //     return result;
  //   })
  //   .catch((err) => {
  //     // dispatch(fetchError(err.message));
  //     // dispatch(toggleFetchingDomain());
  //     onError(err);
  //     // TODO: handle this appropriately in React hierarchy
  //     // alert(err.message);
  //   });
  // };
}
