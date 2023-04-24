import { NextApiRequest } from "next";
import { useRepo as useMainRepo } from "lib/repo";
import { getToken } from "lib/server/session";
const API_URL = process.env.API_URL as string;

export async function useRepo() {
  return await useMainRepo({ fetcher: getToken, url: API_URL });
}

export async function useRepoFromPages(
  { request }: { request: NextApiRequest },
) {
  const fetcher = () => getToken({ request });
  return await useMainRepo({ fetcher, url: API_URL });
}
