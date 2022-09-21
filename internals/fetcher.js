export const fetcher = async (url, args) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...args,
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");

    try {
      error.info = await res.clone().json();
    } catch (e) {
      error.info = { message: "An uncaught error has occurred" };
      error.infotext = { message: await res.text() };
    }

    error.status = res.status;
    throw error;
  }

  return res.json();
};

export const authFetcher = async (url, token, args) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    ...args,
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");

    try {
      error.info = { message: "Sorry, an error has occurred.", ...(await res.clone().json()) };
    } catch (e) {
      error.info = { message: "An uncaught error has occurred" };
      error.infotext = { message: await res.text() };
    }

    error.status = res.status;
    throw error;
  }

  return res.json();
};
