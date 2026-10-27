// Webmate 포트폴리오에서 바로 써 볼 수 있도록 /demo/lowwave 경로로 빌드해 Webmate public/ 에 복사한다.
// 복사 후 Webmate 를 커밋·푸시하면 배포된다.
import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const BASE = "/demo/lowwave";
const dest = path.resolve("../../my_randing/randing-page/public", BASE.slice(1));
if (!existsSync(path.dirname(path.dirname(dest)))) throw new Error(`Webmate 폴더가 없습니다: ${dest}`);

execSync("npm run build", { stdio: "inherit", env: { ...process.env, BASE_PATH: BASE } });
rmSync(dest, { recursive: true, force: true });
cpSync("out", dest, { recursive: true });
console.log(`export:webmate: ${dest} 에 복사했습니다.`);
