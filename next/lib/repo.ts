import type { TokenFetcher } from "types/main";
import type { User } from "@backend/types";

export function useRepo(
  { fetcher, url }: { fetcher: TokenFetcher; url: string },
) {
  /** Get common fetch options */
  function getOptions() {
    return {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${fetcher()}`,
      },
    };
  }

  /** Uses fetch to send requests with the header Authorization header added */
  async function send(
    { endpoint, options }: { endpoint: string; options?: object },
  ): Promise<object> {
    const defaultOptions = getOptions();

    const response = await fetch(endpoint, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    return response.json();
  }

  return {
    /** Gets the logged user */
    getUser: function () {
      return send({ endpoint: url }) as Promise<User>;
    },

    /** Adds an adapter to the logged user */
    sendAdapter: function (
      data: { accessToken: string; provider: string },
    ) {
      return send({
        endpoint: new URL("adapter", url).href,
        options: {
          method: "POST",
          body: JSON.stringify(data),
        },
      }) as Promise<{ message: string }>;
    },

    /** Get data from facebook api test */
    getFacebookApi: function () {
      return send({
        endpoint: new URL("facebook-api", url).href,
        options: { method: "POST" },
      }) as Promise<{ message: string }>;
    },

    /** Get data from github api test */
    getGithubApi: function () {
      return send({
        endpoint: new URL("github-api", url).href,
        options: { method: "POST" },
      }) as Promise<{ message: string }>;
    },

    /** Get a list of user to follow */
    getUsersToFollow: async function () {
      return send({
        endpoint: new URL("users-to-follow", url).href,
      }) as Promise<[{ uuid: string; following: boolean }]>;
    },

    /** Follow a user */
    followUser: function ({ uuid }: { uuid: string }) {
      return send({
        endpoint: new URL("users-to-follow", url).href,
        options: { method: "POST", body: JSON.stringify({ uuid }) },
      }) as Promise<{ message: string }>;
    },
  };
}
