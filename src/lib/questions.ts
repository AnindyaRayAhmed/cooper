import type { Question } from "@/types";

const options = [{ label: "Not today", value: 0 as const }, { label: "A little", value: 1 as const }, { label: "Yes", value: 2 as const }];
export const questions: Question[] = [
  ["transport", "Did you walk, cycle, or use public transport?", "Low-carbon travel"],
  ["meals", "Did you choose a plant-forward meal?", "Food choices"],
  ["waste", "Did you avoid single-use packaging?", "Waste prevention"],
  ["energy", "Did you switch off unused lights and devices?", "Home energy"],
  ["water", "Did you keep showers and water use brief?", "Water conservation"],
  ["reuse", "Did you reuse, repair, or refill something?", "Circular habits"],
  ["local", "Did you choose local or seasonal food?", "Lower food miles"],
  ["laundry", "Did you wash clothes cold or air dry them?", "Efficient laundry"],
  ["shopping", "Did you avoid an unnecessary purchase?", "Mindful consumption"],
  ["influence", "Did you encourage someone else to act sustainably?", "Community impact"],
].map(([id, prompt, hint]) => ({ id, prompt, hint, options }));
