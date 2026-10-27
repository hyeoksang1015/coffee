// Windows에서 빌드하면 Next.js가 미리 불러오기용 파일을 out/경로/__next.a/b.txt 처럼 폴더로 쪼개 쓰는데,
// 브라우저는 out/경로/__next.a.b.txt 를 요청해 404가 난다. 폴더를 점(.)으로 이어 붙인 파일명으로 되돌린다.
// Linux/macOS 빌드에서는 해당 폴더가 없어 아무 일도 하지 않는다.
import { readdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

let moved = 0;
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (!entry.name.startsWith("__next.")) {
      walk(full);
      continue;
    }
    for (const file of readdirSync(full, { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue;
      const rel = path.relative(full, path.join(file.parentPath, file.name));
      renameSync(path.join(full, rel), path.join(dir, [entry.name, ...rel.split(path.sep)].join(".")));
      moved++;
    }
    rmSync(full, { recursive: true });
  }
}

walk("out");
if (moved) console.log(`fix-export: 미리 불러오기 파일 ${moved}개의 경로를 바로잡았습니다.`);
