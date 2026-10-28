// Webmate 포트폴리오에서 바로 써 볼 수 있도록 /demo/lowwave 경로로 빌드해 Webmate public/ 에 복사한다.
// 결제 승인·환불 서버 함수(functions/api)는 하나의 파일로 묶어 Webmate functions/demo/lowwave/api 에 넣는다.
// Firebase 설정값(.env.local)이 빌드에 들어가므로 이 컴퓨터에서 실행한다. 복사 후 Webmate 를 커밋·푸시하면 배포된다.
import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const BASE = "/demo/lowwave";
const webmate = path.resolve("../../my_randing/randing-page");
if (!existsSync(webmate)) throw new Error(`Webmate 폴더가 없습니다: ${webmate}`);
const dest = path.join(webmate, "public", BASE.slice(1));
const fnDest = path.join(webmate, "functions", BASE.slice(1), "api");

execSync("npm run build", { stdio: "inherit", env: { ...process.env, BASE_PATH: BASE } });
rmSync(dest, { recursive: true, force: true });
cpSync("out", dest, { recursive: true });

rmSync(fnDest, { recursive: true, force: true });
for (const f of readdirSync("functions/api")) {
  await build({ entryPoints: [`functions/api/${f}`], outfile: path.join(fnDest, f.replace(/\.ts$/, ".js")), bundle: true, format: "esm", platform: "neutral", target: "es2022", tsconfig: "tsconfig.json", legalComments: "none" });
}
console.log(`export:webmate: ${dest} 와 ${fnDest} 에 복사했습니다.`);
