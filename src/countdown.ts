import {
  CountdownFormState,
  CountdownItem,
  CountdownPreset,
  CountdownTone,
  categoryOptions,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
export const STORAGE_KEY = "less-time.countdowns.v1";

export const toneDetails: Record<
  CountdownTone,
  { label: string; gradient: string }
> = {
  sunset: {
    label: "暖日落",
    gradient: "linear-gradient(135deg, #f2b359 0%, #ec7f67 100%)",
  },
  ocean: {
    label: "海平线",
    gradient: "linear-gradient(135deg, #69b8ff 0%, #4b7eff 100%)",
  },
  mint: {
    label: "薄荷绿",
    gradient: "linear-gradient(135deg, #84e1a5 0%, #36b493 100%)",
  },
  berry: {
    label: "莓果红",
    gradient: "linear-gradient(135deg, #ff9aa2 0%, #d16493 100%)",
  },
};

function addDays(base: Date, days: number, hours = 9, minutes = 0) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function createEmptyFormState(): CountdownFormState {
  return {
    title: "",
    targetAt: toDateTimeLocalValue(addDays(new Date(), 14, 19, 30)),
    category: categoryOptions[0],
    tone: "sunset",
    note: "",
  };
}

export function createSeedCountdowns(now = new Date()): CountdownItem[] {
  const nextYear = now.getFullYear() + 1;
  const newYear = new Date(nextYear, 0, 1, 0, 0, 0, 0);
  const productLaunch = addDays(now, 12, 18, 0);
  const holiday = addDays(now, 42, 9, 30);

  return [
    {
      id: crypto.randomUUID(),
      title: `${nextYear} 新年`,
      targetAt: newYear.toISOString(),
      category: "节日",
      tone: "sunset",
      note: "用它追踪下一次跨年倒计时。",
      createdAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "产品上线",
      targetAt: productLaunch.toISOString(),
      category: "工作",
      tone: "ocean",
      note: "适合追踪发版、考试、DDL 或冲刺节点。",
      createdAt: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "下一次旅行",
      targetAt: holiday.toISOString(),
      category: "旅行",
      tone: "mint",
      note: "所有数据都只保存在当前浏览器本地。",
      createdAt: now.toISOString(),
    },
  ];
}

export function createQuickPresets(now = new Date()): CountdownPreset[] {
  const nextYear = now.getFullYear() + 1;

  return [
    {
      label: "跨年",
      description: "快速生成下一次新年倒计时",
      title: `${nextYear} 新年`,
      targetAt: toDateTimeLocalValue(new Date(nextYear, 0, 1, 0, 0, 0, 0)),
      category: "节日",
      tone: "sunset",
      note: "跨年、春节、节假日都很适合这样记录。",
    },
    {
      label: "上线",
      description: "适合产品发版、考试和截止日期",
      title: "产品上线",
      targetAt: toDateTimeLocalValue(addDays(now, 14, 18, 0)),
      category: "工作",
      tone: "ocean",
      note: "把重要节点留在首页最醒目的位置。",
    },
    {
      label: "旅行",
      description: "记录下一次出发的时间点",
      title: "下一次旅行",
      targetAt: toDateTimeLocalValue(addDays(now, 30, 8, 30)),
      category: "旅行",
      tone: "mint",
      note: "护照、机票、行程准备都能围绕它展开。",
    },
    {
      label: "纪念日",
      description: "生日、周年或特别的私人时刻",
      title: "重要纪念日",
      targetAt: toDateTimeLocalValue(addDays(now, 100, 20, 0)),
      category: "纪念日",
      tone: "berry",
      note: "把值得记住的时刻留在时间轴上。",
    },
  ];
}

function isValidCountdown(value: unknown): value is CountdownItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as CountdownItem;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.targetAt === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.tone === "string" &&
    typeof candidate.note === "string" &&
    typeof candidate.createdAt === "string"
  );
}

export function loadCountdowns(): CountdownItem[] {
  if (typeof window === "undefined") {
    return createSeedCountdowns();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createSeedCountdowns();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return createSeedCountdowns();
    }

    const countdowns = parsed.filter(isValidCountdown);
    return countdowns.length > 0 ? countdowns : createSeedCountdowns();
  } catch {
    return createSeedCountdowns();
  }
}

export function persistCountdowns(items: CountdownItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function formatTargetDate(targetAt: string) {
  const date = new Date(targetAt);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getTimeParts(targetAt: string, nowMs: number) {
  const diff = new Date(targetAt).getTime() - nowMs;
  const isPast = diff < 0;
  const total = Math.abs(diff);
  const days = Math.floor(total / DAY_MS);
  const hours = Math.floor((total % DAY_MS) / (60 * 60 * 1000));
  const minutes = Math.floor((total % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((total % (60 * 1000)) / 1000);

  return {
    isPast,
    diff,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function getRelativeLabel(targetAt: string, nowMs: number) {
  const { isPast, days, hours, minutes } = getTimeParts(targetAt, nowMs);

  if (!isPast) {
    if (days > 0) {
      return `还有 ${days} 天`;
    }
    if (hours > 0) {
      return `还有 ${hours} 小时`;
    }
    if (minutes > 0) {
      return `还有 ${minutes} 分钟`;
    }

    return "不足 1 分钟";
  }

  if (days > 0) {
    return `已过去 ${days} 天`;
  }
  if (hours > 0) {
    return `已过去 ${hours} 小时`;
  }
  if (minutes > 0) {
    return `已过去 ${minutes} 分钟`;
  }

  return "刚刚过去";
}

export function sortCountdowns(items: CountdownItem[], nowMs: number) {
  return [...items].sort((left, right) => {
    const leftDiff = new Date(left.targetAt).getTime() - nowMs;
    const rightDiff = new Date(right.targetAt).getTime() - nowMs;
    const leftPast = leftDiff < 0;
    const rightPast = rightDiff < 0;

    if (leftPast !== rightPast) {
      return leftPast ? 1 : -1;
    }

    return leftDiff - rightDiff;
  });
}
