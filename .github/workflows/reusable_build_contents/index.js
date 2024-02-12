const core = require("@actions/core");
const github = require("@actions/github");

const ntm = require("notion-to-md");
const notionhq = require("@notionhq/client");

const fs = require("fs");

const notion = new notionhq.Client({
  auth: core.getInput("AUTH_TOKEN"),
});

const generate = async () => {
  const dbs = await notion.databases.query({
    database_id: core.getInput("NOTION_DATABASE_ID"),
  });
  const publishedPages = dbs.results.filter(
    (page) => page.properties["드래프트"].select?.name === "배포"
  );

  // passing notion client to the option
  const n2m = new ntm.NotionToMarkdown({ notionClient: notion });

  const writeFile = (mdString, idx) => {
    return new Promise((resolve) => {
      fs.writeFile(`_posts/test${idx}.md`, mdString.parent, () => resolve());
    });
  };

  (async () => {
    await Promise.all(
      publishedPages.map(async (page, idx) => {
        const mdblocks = await n2m.pageToMarkdown(page.id);
        const mdString = n2m.toMarkdownString(mdblocks);
        await writeFile(mdString, idx);
      })
    );
    console.log("done");
  })();
};

try {
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2);
  // console.log(`The event payload: ${payload}`);

  generate();
} catch (error) {
  core.setFailed(error.message);
}
