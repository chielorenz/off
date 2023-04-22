import useRepo from "lib/repo";

export default async function Home() {
  const repo = await useRepo();
  const data = await repo.getGithubApi();

  return <main>Test facebook API: {JSON.stringify(data)}</main>;
}