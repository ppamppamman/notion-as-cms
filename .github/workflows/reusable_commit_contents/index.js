const github = require("@actions/github");
const fs = require("fs");

const core = require("@actions/core");
const token = core.getInput("GITHUB_TOKEN");

// Octokit 인스턴스를 생성합니다.
const octokit = new github.getOctokit(token);

// 리포지토리 정보를 설정합니다.
const owner = "ppamppamman";
const repo = "notion-as-cms";
const branch = "main"; // 또는 다른 브랜치 이름
const postsDirectory = "./_posts";

// _posts 디렉토리에서 파일 리스트 가져오기
const files = fs.readdirSync(postsDirectory);

const commitFiles = async () => {
  // 레포지토리 정보 가져오기
  // const { data: repoData } = await octokit.repos.get({
  //   owner,
  //   repo,
  // });

  // 기존 브랜치의 헤드 커밋 가져오기
  const { data: branchData } = await octokit.repos.getBranch({
    owner,
    repo,
    branch,
  });

  const baseTreeSha = branchData.commit.commit.tree.sha;

  // 변경된 파일들을 스테이징하고 트리 생성
  const tree = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: files.map((file) => ({
      path: `${postsDirectory}/${file}`,
      mode: "100644",
      type: "blob",
      content: fs.readFileSync(`${postsDirectory}/${file}`, "utf-8"),
    })),
  });

  // 새로운 커밋 생성
  const newCommit = await octokit.git.createCommit({
    owner,
    repo,
    message: "Add: Add new published contents",
    tree: tree.data.sha,
    parents: [baseTreeSha],
  });

  // 브랜치 업데이트
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.data.sha,
  });

  console.log("Files committed successfully.");
};

try {
  commitFiles();
} catch (error) {
  core.setFailed(error.message);
}
