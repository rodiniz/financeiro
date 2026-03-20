import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const version = process.argv[2]?.trim();

if (!version) {
  console.error("Usage: npm run tauri:version -- <version>");
  process.exit(1);
}

const semverRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;
if (!semverRegex.test(version)) {
  console.error(`Invalid version \"${version}\". Use semver format, e.g. 1.2.3`);
  process.exit(1);
}

const root = process.cwd();

async function updateJsonFile(filePath, mutate) {
  const absolutePath = resolve(root, filePath);
  const raw = await readFile(absolutePath, "utf8");
  const data = JSON.parse(raw);
  mutate(data);
  await writeFile(absolutePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function updateCargoToml() {
  const filePath = resolve(root, "src-tauri", "Cargo.toml");
  const raw = await readFile(filePath, "utf8");

  const next = raw.replace(
    /(\[package\][\s\S]*?^version\s*=\s*")[^"]+("\s*$)/m,
    `$1${version}$2`
  );

  if (next === raw) {
    throw new Error("Could not find [package] version in src-tauri/Cargo.toml");
  }

  await writeFile(filePath, next, "utf8");
}

async function updateUpdaterJson() {
  const updaterPath = resolve(root, "src", "updater.json");
  const raw = await readFile(updaterPath, "utf8");
  const data = JSON.parse(raw);

  const previousVersion = String(data.version || "").replace(/^v/, "");
  data.version = `v${version}`;

  if (data.platforms && typeof data.platforms === "object") {
    for (const platform of Object.values(data.platforms)) {
      if (!platform || typeof platform !== "object" || typeof platform.url !== "string") {
        continue;
      }

      let nextUrl = platform.url;

      if (previousVersion) {
        nextUrl = nextUrl.split(`v${previousVersion}`).join(`v${version}`);
        nextUrl = nextUrl.split(previousVersion).join(version);
      }

      platform.url = nextUrl;
    }
  }

  await writeFile(updaterPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function updatePackageMetadata() {
  await updateJsonFile("package.json", (pkg) => {
    pkg.version = version;
  });

  const lockPath = resolve(root, "package-lock.json");
  if (existsSync(lockPath)) {
    await updateJsonFile("package-lock.json", (lock) => {
      lock.version = version;
      if (lock.packages && lock.packages[""]) {
        lock.packages[""].version = version;
      }
    });
  }
}

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(stderr || `git ${args.join(" ")} failed`);
  }

  return (result.stdout || "").trim();
}

function createReleaseTag() {
  runGit(["rev-parse", "--is-inside-work-tree"]);

  const tagName = `v${version}`;
  const existingTag = runGit(["tag", "--list", tagName]);
  if (existingTag === tagName) {
    throw new Error(`Tag ${tagName} already exists.`);
  }

  runGit(["tag", "-a", tagName, "-m", `Release ${tagName}`]);
  return tagName;
}

async function run() {
  await updateCargoToml();

  await updateJsonFile("src-tauri/tauri.conf.json", (config) => {
    config.version = version;
  });

  await updateUpdaterJson();
  await updatePackageMetadata();

  const createdTag = createReleaseTag();

  console.log(`Updated Tauri app version to ${version} in all tracked files.`);
  console.log(`Created git tag ${createdTag}.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
