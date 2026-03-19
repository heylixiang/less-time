export const categoryOptions = [
  "节日",
  "工作",
  "生活",
  "旅行",
  "纪念日",
] as const;

export const toneOptions = ["sunset", "ocean", "mint", "berry"] as const;

export type CountdownCategory = (typeof categoryOptions)[number];
export type CountdownTone = (typeof toneOptions)[number];

export interface CountdownItem {
  id: string;
  title: string;
  targetAt: string;
  category: CountdownCategory;
  tone: CountdownTone;
  note: string;
  createdAt: string;
}

export interface CountdownFormState {
  title: string;
  targetAt: string;
  category: CountdownCategory;
  tone: CountdownTone;
  note: string;
}
