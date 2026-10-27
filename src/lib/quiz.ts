// 홈 '나만의 커피 리듬 찾기' 퀴즈. 세 가지 답으로 원두 하나를 고른다.
import { beans, type Bean } from "@/data/beans";

export const QUIZ = [
  { id: "tool", q: "평소 어떻게 내려 드시나요?", options: [{ id: "drip", label: "핸드드립" }, { id: "espresso", label: "에스프레소 머신" }, { id: "moka", label: "모카포트 · 프렌치프레스" }] },
  { id: "acid", q: "산미는 어느 쪽이 좋으세요?", options: [{ id: "bright", label: "화사한 산미" }, { id: "balanced", label: "적당히 균형" }, { id: "low", label: "산미 없이 고소하게" }] },
  { id: "milk", q: "우유를 넣어 드시나요?", options: [{ id: "black", label: "블랙으로" }, { id: "sometimes", label: "가끔" }, { id: "latte", label: "주로 라떼" }] },
] as const;

export type Answers = { tool: string; acid: string; milk: string };

/** 원하는 산미·바디 수준에 가장 가까운 원두. 동점이면 카탈로그 앞쪽(추천순)을 고른다. */
export function recommend(a: Answers): Bean {
  const acidity = a.acid === "bright" ? 5 : a.acid === "balanced" ? 3 : 1;
  let body = a.tool === "drip" ? 2 : a.tool === "espresso" ? 4 : 3;
  if (a.milk === "latte") body += 1;
  if (a.milk === "black" && a.tool === "drip") body -= 0.5;
  const pool = beans.filter((b) => b.category !== "decaf");
  return pool.reduce((best, b) => (score(b, acidity, body) < score(best, acidity, body) ? b : best));
}

const score = (b: Bean, acidity: number, body: number) => Math.abs(b.acidity - acidity) * 1.2 + Math.abs(b.body - body);
