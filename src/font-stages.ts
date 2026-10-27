export const FONT_STAGES_KEY = "olymp-font-stages-v1";
export const fontStages = [
  { title: "Знакомые цифры 1 и 9", digits: ["1", "9"], added: ["1", "9"] },
  { title: "Добавь 0 и 2", digits: ["1", "9", "0", "2"], added: ["0", "2"] },
  {
    title: "Добавь 3 и 4",
    digits: ["1", "9", "0", "2", "3", "4"],
    added: ["3", "4"],
  },
  {
    title: "Добавь 5 и 6",
    digits: ["1", "9", "0", "2", "3", "4", "5", "6"],
    added: ["5", "6"],
  },
  {
    title: "Добавь 7 и 8 — все десять",
    digits: ["1", "9", "0", "2", "3", "4", "5", "6", "7", "8"],
    added: ["7", "8"],
  },
];
export type FontStageState = {
  selected: number;
  passed: Record<string, { code: string; at: string }>;
};
export const emptyFontStages = (): FontStageState => ({
  selected: 0,
  passed: {},
});
export function parseFontStages(raw: string | null): FontStageState {
  if (!raw) return emptyFontStages();
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Invalid stages");
  const result = emptyFontStages();
  if (
    Number.isInteger(data.selected) &&
    data.selected >= 0 &&
    data.selected < fontStages.length
  )
    result.selected = data.selected;
  for (let i = 0; i < fontStages.length; i++) {
    const saved = data.passed?.[i];
    if (
      saved &&
      typeof saved.code === "string" &&
      saved.code.length <= 100000 &&
      typeof saved.at === "string" &&
      Number.isFinite(Date.parse(saved.at))
    )
      result.passed[i] = { code: saved.code, at: saved.at };
  }
  return result;
}
export function acceptFontStage(
  state: FontStageState,
  stage: number,
  code: string,
): FontStageState {
  const passed = { ...state.passed };
  // Each stage checks all earlier digits, so success confirms its predecessors too.
  for (let i = 0; i <= stage; i++)
    passed[i] = { code, at: new Date().toISOString() };
  return { ...state, passed };
}
