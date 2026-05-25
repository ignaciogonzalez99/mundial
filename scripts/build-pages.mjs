import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { rename, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "src", "app", "api");
const disabledApiDir = path.join(root, "src", "app", "__api_disabled_for_pages__");
const nextDir = path.join(root, ".next");

async function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with ${code}`));
      }
    });
    child.on("error", reject);
  });
}

async function main() {
  let movedApi = false;

  if (existsSync(disabledApiDir)) {
    await rm(disabledApiDir, { recursive: true, force: true });
  }

  try {
    if (existsSync(apiDir)) {
      await rename(apiDir, disabledApiDir);
      movedApi = true;
    }

    await rm(nextDir, { recursive: true, force: true });

    await run("next", ["build"], {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_STATIC_EXPORT: "true",
    });
  } finally {
    if (movedApi && existsSync(disabledApiDir)) {
      await rename(disabledApiDir, apiDir);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
