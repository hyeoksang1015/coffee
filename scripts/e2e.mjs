// 브라우저 점검: 빌드된 out/ 을 로컬 서버로 띄우고 헤드리스 Edge(또는 Chrome)를 원격 조작해 확인한다.
// 사용법: npm run build && npm run e2e   (화면 캡처는 SHOTS=폴더 를 주면 그 폴더에 저장)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const OUT = path.resolve("out");
const PORT = 4184, CDP = 9344, BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = process.env.SHOTS;
const WIDTHS = [375, 768, 1440];
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon" };

if (!existsSync(OUT)) throw new Error("out/ 이 없습니다. 먼저 npm run build 를 실행하세요.");

const server = http.createServer((req, res) => {
  let file = path.join(OUT, decodeURIComponent(new URL(req.url, BASE).pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  const ok = existsSync(file);
  if (!ok) file = path.join(OUT, "404.html");
  res.writeHead(ok ? 200 : 404, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(PORT);

const browserPath = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find(existsSync);
const browser = spawn(browserPath, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${CDP}`, `--user-data-dir=${mkdtempSync(path.join(os.tmpdir(), "coffee-e2e-"))}`, "about:blank"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const problems = [], external = [], results = [];
const check = (name, pass, detail = "") => { results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  [" + detail + "]" : ""}`); if (process.env.VERBOSE) console.error(results.at(-1)); };

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id) { pending.get(msg.id)?.(msg); return pending.delete(msg.id); }
    if (msg.method === "Runtime.exceptionThrown") problems.push("exception: " + msg.params.exceptionDetails.text);
    if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) problems.push(`console.${msg.params.type}: ` + msg.params.args.map((a) => a.value ?? a.description).join(" "));
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") problems.push("log: " + msg.params.entry.text + " " + (msg.params.entry.url ?? ""));
    if (msg.method === "Network.requestWillBeSent") {
      const { url } = msg.params.request;
      // Firebase(로그인·DB, 연결 확인용 cleardot.gif)는 실제 백엔드라 허용한다. 그 밖의 외부 요청은 없어야 한다.
      if (!["http://127.0.0.1:4184", "about:", "data:", "blob:", "mailto:", "https://firestore.googleapis.com/", "https://identitytoolkit.googleapis.com/", "https://securetoken.googleapis.com/", "https://www.google.com/images/cleardot.gif"].some((p) => url.startsWith(p))) external.push(url);
    }
  };
  // 응답이 없으면 무한정 기다리지 않고 어느 단계에서 멈췄는지 알린다.
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const myId = ++id;
    const timer = setTimeout(() => { pending.delete(myId); reject(new Error(`CDP 응답 없음: ${method}`)); }, 60000);
    pending.set(myId, (msg) => { clearTimeout(timer); resolve(msg); });
    ws.send(JSON.stringify({ id: myId, method, params }));
  });
  return { send, close: () => ws.close() };
}

await sleep(1500);
const root = await connect((await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json()).webSocketDebuggerUrl);

async function openPage(width, height = 900) {
  const { result } = await root.send("Target.createTarget", { url: "about:blank" });
  const { send, close } = await connect(`ws://127.0.0.1:${CDP}/devtools/page/${result.targetId}`);
  await root.send("Target.activateTarget", { targetId: result.targetId });
  for (const d of ["Runtime", "Log", "Page", "Network"]) await send(d + ".enable");
  const mobile = width < 768;
  const resize = (w, h) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await resize(width, height);
  const js = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.result.exceptionDetails) throw new Error(expression.slice(0, 80) + " -> " + r.result.exceptionDetails.exception?.description);
    return r.result.result.value;
  };
  return {
    send, js, resize,
    close: async () => { close(); await root.send("Target.closeTarget", { targetId: result.targetId }); },
    go: async (url) => { await send("Page.navigate", { url: BASE + url }); await sleep(1000); },
    key: async (key) => { const k = { key, code: key, windowsVirtualKeyCode: { Escape: 27 }[key] }; await send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...k }); await send("Input.dispatchKeyEvent", { type: "keyUp", ...k }); await sleep(150); },
    noOverflow: () => js("document.documentElement.scrollWidth <= window.innerWidth"),
    loadAllImages: () => js(`(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); }))); scrollTo(0, 0); return [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')); })()`),
    shot: async (name) => {
      if (!SHOTS) return;
      const h = await js("document.documentElement.scrollHeight");
      const { result: r } = await send("Page.captureScreenshot", { format: "jpeg", quality: 70, clip: { x: 0, y: 0, width, height: h, scale: width > 800 ? 0.5 : 1 }, captureBeyondViewport: true });
      mkdirSync(SHOTS, { recursive: true });
      writeFileSync(path.join(SHOTS, name + ".jpg"), Buffer.from(r.data, "base64"));
    },
  };
}

// 입력칸에 값을 넣고 React 가 알아채도록 input·change 이벤트를 보낸다.
const fill = (sel, v) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement : e.tagName === 'SELECT' ? HTMLSelectElement : HTMLInputElement; Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); })()`;
// 보이는 요소 중 글자가 맞는 첫 요소를 누른다. 없으면 어떤 요소를 못 찾았는지 알린다.
const click = (sel, text) => `(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})].find(e => e.offsetParent !== null && ${text ? `e.textContent.includes(${JSON.stringify(text)})` : "true"}); if (!e) throw new Error(${JSON.stringify("없음: " + sel + " " + (text ?? ""))}); e.click(); })()`;
const COUNT = "Number(document.querySelector('[data-testid=cart-count]')?.textContent ?? 0)";
const TOTAL = "document.querySelector('[data-testid=cart-total]')?.textContent";
const CART = "document.querySelector('dialog[aria-labelledby=cart-title]')";

try {
  // ── 페이지별 레이아웃
  for (const w of WIDTHS) {
    for (const url of ["/", "/beans/", "/beans/aricha/", "/beans/tempo/", "/wholesale/", "/checkout/", "/account/", "/admin/"]) {
      const p = await openPage(w);
      await p.go(url);
      const broken = await p.loadAllImages();
      check(`[${w}] ${url} 가로 스크롤 없음`, await p.noOverflow(), String(await p.js("document.documentElement.scrollWidth")));
      check(`[${w}] ${url} 이미지 모두 불러옴`, broken.length === 0, broken.join(", "));
      check(`[${w}] ${url} h1 하나`, (await p.js("document.querySelectorAll('h1').length")) === 1);
      const clipped = await p.js(`[...document.querySelectorAll('h1,h2,h3,p,a,button,dd,dt,li,label')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1 && !['visible', 'clip'].includes(getComputedStyle(e).overflowX) && !/truncate|line-clamp/.test(e.className) && !e.closest('.sr-only') && !e.classList.contains('sr-only')).map(e => e.textContent.trim().slice(0, 30))`);
      check(`[${w}] ${url} 글자가 잘린 요소 없음`, clipped.length === 0, clipped.join(" | "));
      if (w === 375) {
        const small = await p.js(`[...document.querySelectorAll('main button, main a[class*=min-h], header button, footer a, footer button')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 36).map(e => e.textContent.trim().slice(0, 16) + ':' + Math.round(e.getBoundingClientRect().height))`);
        check(`[375] ${url} 버튼 높이 36px 이상`, small.length === 0, small.join(", "));
      }
      await p.shot(`${url.replace(/\//g, "_")}-${w}`);
      await p.close();
    }
  }

  // ── 원두 목록: 필터·정렬·용량·담기·장바구니
  const s = await openPage(1440);
  await s.go("/beans/");
  const slugs = () => s.js("[...document.querySelectorAll('article[data-slug]')].map(a => a.dataset.slug)");
  check("목록: 원두 10종", (await slugs()).length === 10);
  await s.js(click("button[aria-pressed]", "시그니처 블렌드")); await sleep(200);
  const blends = await slugs();
  check("카테고리 '시그니처 블렌드'", blends.length === 3 && (await s.js("document.querySelector('[data-testid=result-count]').textContent")) === "3", blends.join(","));
  await s.js(click("button[aria-label='필터 초기화']")); await sleep(200);
  await s.js(click("button[role=radio]", "라이트")); await s.js(click("button[aria-label='산미 (Acidity) 5']")); await sleep(200);
  const bright = await slugs();
  check("배전도 라이트 + 산미 5", JSON.stringify(bright) === '["socorro","geisha-reserve"]', bright.join(","));
  await s.js(click("button[aria-label='바디감 (Body) 5']")); await sleep(200);
  check("결과가 없으면 안내", await s.js("document.body.innerText.includes('조건에 맞는 원두가 없습니다')"));
  await s.js(click("main button", "필터 초기화")); await sleep(200);
  check("필터 초기화 → 전체 10종", (await slugs()).length === 10);
  await s.js(fill("#sort-select", "price-asc")); await sleep(200);
  const prices = await s.js("[...document.querySelectorAll('article[data-slug] [data-testid=price]')].map(e => Number(e.textContent.replace(/\\D/g, '')))");
  check("낮은 가격순 정렬", JSON.stringify(prices) === JSON.stringify([...prices].sort((a, b) => a - b)), prices.join(","));
  await s.js(fill("#sort-select", "recommend")); await sleep(100);
  await s.js(click("article[data-slug=aricha] button[role=radio]", "1kg")); await sleep(100);
  check("카드 용량 1kg → ₩76,000", (await s.js("document.querySelector('article[data-slug=aricha] [data-testid=price]').textContent")) === "₩76,000");
  await s.js(click("article[data-slug=aricha] button[aria-label$='장바구니 담기']")); await sleep(300);
  check("담기 → 헤더 수량 1 + 알림", (await s.js(COUNT)) === 1 && (await s.js("document.body.innerText.includes('장바구니에 담았습니다')")));
  await s.js(click("article[data-slug=tempo] button", "바로구매")); await sleep(300);
  check("바로구매 → 장바구니 열림, 2종", (await s.js(`${CART}.open`)) && (await s.js(`${CART}.querySelectorAll('li').length`)) === 2);
  check("합계 76,000 + 18,000 = 94,000 (무료배송)", (await s.js(TOTAL)) === "₩94,000");
  await s.js(click("dialog li button[aria-label='수량 늘리기']")); await sleep(150);
  check("수량 + → 170,000, 헤더 3", (await s.js(TOTAL)) === "₩170,000" && (await s.js(COUNT)) === 3);
  await s.js(click("dialog li button[aria-label$='빼기']")); await sleep(150);
  check("빼기 → 템포만 남고 배송비 3,000", (await s.js(`${CART}.querySelectorAll('li').length`)) === 1 && (await s.js(TOTAL)) === "₩21,000");
  check("주문하기 → 주문서(/checkout/) 링크", await s.js("document.querySelector('dialog a[href=\"/checkout/\"]')?.textContent.includes('21,000')"));
  await s.key("Escape"); await sleep(200);
  check("Esc → 장바구니 닫힘", !(await s.js(`${CART}.open`)));
  await s.send("Page.reload"); await sleep(1200);
  check("새로고침해도 장바구니 유지", (await s.js(COUNT)) === 1);
  await s.js("localStorage.setItem('lowwave-cart', JSON.stringify([{ slug: 'x', grams: 1, grind: 'whole', plan: 'once', qty: 1 }, { slug: 'aricha', grams: 200, grind: 'whole', plan: 'once', qty: 999 }]))");
  await s.send("Page.reload"); await sleep(1200);
  check("저장소의 잘못된 값은 버리고 수량은 20개까지", (await s.js(COUNT)) === 20);
  await s.js("localStorage.clear()");
  await s.go("/beans/?category=single"); await sleep(300);
  check("?category=single → 싱글 오리진만", (await s.js("[...document.querySelectorAll('button[aria-pressed=true]')].some(b => b.textContent.includes('싱글 오리진'))")) && (await slugs()).length === 6);
  await s.close();

  // ── 원두 상세: 옵션·가격·갤러리
  const d = await openPage(375);
  await d.go("/beans/aricha/");
  await d.js(click("main button[aria-pressed]", "500g")); await sleep(100);
  check("상세: 500g → ₩42,000", (await d.js("document.querySelector('[data-testid=unit-price]').textContent")) === "₩42,000");
  await d.js(click("main button[aria-pressed]", "정기구독")); await sleep(100);
  check("정기구독 → 15% 할인 ₩35,700 + 배송 주기", (await d.js("document.querySelector('[data-testid=unit-price]').textContent")) === "₩35,700" && (await d.js("document.body.innerText.includes('배송 주기')")));
  await d.js(click("main button[aria-label='수량 늘리기']")); await d.js(click("main button[aria-label='수량 늘리기']")); await sleep(100);
  check("수량 3 → 총 ₩107,100", (await d.js("document.querySelector('[data-testid=qty]').textContent")) === "3" && (await d.js("document.querySelector('[data-testid=total-price]').textContent")) === "₩107,100");
  await d.js(click("main button", "장바구니 담기")); await sleep(300);
  check("담기 → 헤더 3 + '담김 완료'", (await d.js(COUNT)) === 3 && (await d.js("document.body.innerText.includes('담김 완료')")));
  await d.js(click("main button", "바로 구매하기")); await sleep(300);
  check("같은 옵션 바로 구매 → 한 줄로 합쳐 6개", (await d.js(`${CART}.querySelectorAll('li').length`)) === 1 && (await d.js(COUNT)) === 6);
  await d.key("Escape"); await sleep(200);
  const before = await d.js("document.querySelector('main [aria-labelledby] img, main .aspect-\\\\[4\\\\/3\\\\] img').getAttribute('src')");
  await d.js(click("main button[aria-label='ESTATE 02 사진 보기']")); await sleep(300);
  const after = await d.js("document.querySelector('main .aspect-\\\\[4\\\\/3\\\\] img').getAttribute('src')");
  check("갤러리 썸네일 → 큰 사진 바뀜", before !== after && after.includes("gallery-farm"), after);
  check("#brew 추출 가이드 있음", await d.js("!!document.getElementById('brew')"));
  await d.js("localStorage.clear()");
  await d.go("/beans/tempo/");
  check("리뷰 없는 원두는 같은 종류 추천", await d.js("document.body.innerText.includes('함께 보면 좋은 시그니처 블렌드')"));
  await d.close();

  // ── 홈: 큐레이션 탭·퀴즈·샘플러·커핑 예약·뉴스레터
  const h = await openPage(375);
  await h.go("/");
  await h.js(click("button[role=tab]", "시그니처 블렌드")); await sleep(200);
  const tabCards = await h.js("[...document.querySelectorAll('[role=tabpanel] h3 a')].map(a => a.getAttribute('href'))");
  check("큐레이션 '시그니처 블렌드' 탭 → 블렌드 3종", JSON.stringify(tabCards) === '["/beans/tempo/","/beans/cadence/","/beans/velvet-night/"]', tabCards.join(","));
  await h.js(click("button", "퀴즈 시작")); await sleep(150);
  await h.js(click("fieldset button", "핸드드립")); await h.js(click("fieldset button", "화사한 산미")); await h.js(click("fieldset button", "블랙으로")); await sleep(200);
  check("퀴즈 3문항 → 추천 원두", await h.js("!!document.querySelector('[data-testid=quiz-result] a[href^=\"/beans/\"]')"));
  await h.js(click("[data-testid=quiz-result] button", "장바구니 담기")); await sleep(300);
  check("추천 원두 담기 (핸드드립 → 필터 분쇄)", (await h.js(COUNT)) === 1 && (await h.js("JSON.parse(localStorage.getItem('lowwave-cart'))[0].grind")) === "filter");
  await h.js("localStorage.clear()");
  // 커핑 예약
  await h.js(click("button", "목요 퍼블릭 커핑 예약")); await sleep(200);
  check("커핑 예약 창 열림 + 목요일 4개", (await h.js("document.querySelector('dialog[aria-labelledby=cupping-title]').open")) && (await h.js("document.querySelectorAll('dialog input[name=date]').length")) === 4);
  await h.js(click("dialog button", "예약하기")); await sleep(150);
  check("빈 예약 → 날짜·이름·연락처 오류", (await h.js("[...document.querySelectorAll('dialog .text-error')].length")) === 3);
  await h.js("document.querySelector('dialog input[name=date]').click()");
  await h.js(fill("#cup-name", "홍길동")); await h.js(fill("#cup-phone", "010-1234-5678")); await h.js(fill("#cup-people", "2"));
  await h.js(click("dialog button", "예약하기")); await sleep(150);
  check("예약 완료 → 날짜·인원 안내", await h.js("document.querySelector('dialog [role=status]')?.textContent.includes('2명')"));
  await h.key("Escape"); await sleep(150);
  // 뉴스레터
  await h.js(fill("#newsletter-email", "abc")); await h.js(click("footer button", "구독")); await sleep(150);
  check("뉴스레터 잘못된 이메일 → 오류", await h.js("!!document.getElementById('newsletter-error')"));
  await h.js(fill("#newsletter-email", "me@example.com")); await h.js(click("footer button", "구독")); await sleep(150);
  check("뉴스레터 올바른 이메일 → 확인", await h.js("document.querySelector('footer [role=status]')?.textContent.includes('구독')"));
  // 샘플러 빠른 신청 → B2B 신청서에 미리 채움
  await h.js(fill("#quick-store", "카페 테스트")); await h.js(click("button", "샘플러 키트 신청")); await sleep(150);
  check("샘플러: 연락처 없으면 오류", await h.js("document.body.innerText.includes('010-0000-0000 형식')"));
  await h.js(fill("#quick-phone", "010-2222-3333")); await h.js(click("button", "샘플러 키트 신청")); await sleep(1500);
  check("샘플러 → /wholesale/ 신청서에 상호·연락처 채움", (await h.js("location.pathname")) === "/wholesale/" && (await h.js("document.querySelector('#w-store').value")) === "카페 테스트" && (await h.js("document.querySelector('#w-phone').value")) === "010-2222-3333");
  await h.close();

  // ── B2B 신청서
  const b = await openPage(1440);
  await b.go("/wholesale/");
  await b.js(click("form button[type=submit]")); await sleep(150);
  const errs = await b.js("[...document.querySelectorAll('form [aria-invalid=true]')].map(e => e.name)");
  check("빈 신청 → 필수 항목 오류", JSON.stringify(errs) === '["store","manager","phone","location"]', errs.join(","));
  check("첫 오류 칸으로 포커스", (await b.js("document.activeElement?.name")) === "store");
  await b.js(fill("#w-store", "카페 모먼트")); await b.js(fill("#w-manager", "홍길동")); await b.js(fill("#w-phone", "010-1234-5678")); await b.js(fill("#w-location", "서울 성동구"));
  await b.js("document.querySelector('input[value=over_50kg]').click(); document.querySelector('input[name=profiles]').click()");
  // 실제 DB 에 테스트 문의가 쌓이지 않도록 Firestore 요청은 막고, 저장을 시도하는지만 본다.
  await b.send("Network.setBlockedURLs", { urls: ["*firestore.googleapis.com*"] });
  await b.js(click("form button[type=submit]")); await sleep(300);
  check("올바른 신청 → 저장 요청(접수 중)", await b.js("document.querySelector('#inquiry form button[type=submit]').disabled && document.querySelector('#inquiry form button[type=submit]').textContent.includes('접수 중')"));
  await b.send("Network.setBlockedURLs", { urls: [] });
  await b.js(click("details summary")); await sleep(150);
  check("FAQ 펼침", await b.js("document.querySelector('details').open"));
  await b.go("/nope/");
  check("없는 주소 → 404 안내", await b.js("document.body.innerText.includes('찾으시는 페이지가 없습니다')"));
  for (const [url, status] of [["/", 200], ["/beans/", 200], ["/beans/socorro/", 200], ["/wholesale/", 200], ["/checkout/", 200], ["/checkout/success/", 200], ["/checkout/fail/", 200], ["/account/", 200], ["/admin/", 200], ["/beans/none/", 404]]) check(`${url} → ${status}`, (await fetch(BASE + url)).status === status);
  await b.close();

  // ── 로그인·주문·관리자 (로그아웃 상태)
  const a = await openPage(375);
  await a.go("/");
  await a.js("localStorage.setItem('lowwave-cart', JSON.stringify([{ slug: 'aricha', grams: 200, grind: 'whole', plan: 'once', qty: 1 }]))");
  await a.go("/checkout/"); await sleep(1000);
  check("주문서: 로그인 전이면 로그인 안내", await a.js("document.querySelector('h1')?.textContent.includes('로그인해 주세요')"));
  await a.js(fill("input[name=email]", "nope")); await a.js(fill("input[name=password]", "123456")); await a.js(click("form button[type=submit]")); await sleep(150);
  check("로그인: 잘못된 이메일 → 오류 (서버 요청 없이)", await a.js("document.querySelector('[role=alert]').textContent.includes('이메일 형식')"));
  await a.js(click("button[role=tab]", "회원가입")); await sleep(100);
  check("회원가입 탭 → 이름 칸", await a.js("!!document.querySelector('input[name=name]')"));
  await a.js(click("form button[type=submit]")); await sleep(150);
  check("회원가입: 이름 없으면 오류", await a.js("document.querySelector('[role=alert]').textContent.includes('이름')"));
  await a.go("/admin/"); await sleep(1000);
  check("관리자: 로그인 전이면 관리자 로그인", await a.js("document.querySelector('h1')?.textContent.includes('관리자 로그인')"));
  await a.go("/checkout/fail/?code=PAY_PROCESS_CANCELED&message=x&orderId=LW-20261028-AAAAAA"); await sleep(500);
  check("결제창 취소 → 취소 안내", await a.js("document.querySelector('h1')?.textContent.includes('결제를 취소했습니다')"));
  await a.go("/checkout/success/?paymentKey=x&orderId=LW-20261028-AAAAAA&amount=21000"); await sleep(1200);
  check("승인 실패(서버 없음) → 오류 안내, 장바구니 유지", (await a.js("document.querySelector('h1')?.textContent.includes('완료하지 못했습니다')")) && (await a.js(COUNT)) === 1);
  await a.js("localStorage.clear()");
  await a.close();
} finally {
  // /nope/ 는 일부러 연 404 페이지라 그 기록은 뺀다.
  // /api/confirm 은 정적 서버라 일부러 실패시킨 요청이고, Firestore 경고는 B2B 저장 요청을 막아서 생긴다.
  const real = problems.filter((m) => !m.includes("/nope/") && !m.includes("/api/confirm") && !/Firestore|ERR_BLOCKED/i.test(m));
  check("콘솔 오류·경고 없음", real.length === 0, [...new Set(real)].slice(0, 5).join(" | "));
  check("Firebase 말고 외부 요청 없음(글꼴·이미지 자체 호스팅)", external.length === 0, [...new Set(external)].slice(0, 5).join(", "));
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${results.length - failed}/${results.length} 통과`);
  browser.kill();
  server.close();
  process.exitCode = failed ? 1 : 0;
}

