// app/api/github-commits/route.ts (Next.js 13+ App Router)
import { NextResponse } from "next/server";

export async function GET() {
  const GITHUB_PAT = process.env.GITHUB_PAT!;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME!;
  
  try {
    // Get all repos of the user
    const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
      },
    });

    const repos = await reposRes.json();

    let totalCommits = 0;

    // Loop through repos and get commit counts
    for (const repo of repos) {
      const commitsRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/contributors`, {
        headers: {
          Authorization: `token ${GITHUB_PAT}`,
        },
      });
      const contributors = await commitsRes.json();
      const userContrib = contributors.find((c: any) => c.login === GITHUB_USERNAME);
      if (userContrib) totalCommits += userContrib.contributions;
    }

    return NextResponse.json({ commits: totalCommits });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 });
  }
}
