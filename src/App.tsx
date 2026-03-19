import { FormEvent, useEffect, useState } from "react";
import {
  createEmptyFormState,
  formatTargetDate,
  getRelativeLabel,
  getTimeParts,
  loadCountdowns,
  persistCountdowns,
  sortCountdowns,
  toDateTimeLocalValue,
  toneDetails,
} from "./countdown";
import {
  CountdownFormState,
  CountdownItem,
  categoryOptions,
  toneOptions,
} from "./types";

function App() {
  const [items, setItems] = useState<CountdownItem[]>(() => loadCountdowns());
  const [form, setForm] = useState<CountdownFormState>(() =>
    createEmptyFormState(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    persistCountdowns(items);
  }, [items]);

  const orderedItems = sortCountdowns(items, nowMs);
  const upcomingItems = orderedItems.filter(
    (item) => new Date(item.targetAt).getTime() >= nowMs,
  );
  const passedItems = orderedItems.length - upcomingItems.length;
  const nearestItem = upcomingItems[0] ?? null;
  const farthestItem = upcomingItems[upcomingItems.length - 1] ?? null;

  function updateForm<K extends keyof CountdownFormState>(
    key: K,
    value: CountdownFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(createEmptyFormState());
    setEditingId(null);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("请先填写倒计时标题。");
      return;
    }

    if (!form.targetAt) {
      setError("请先选择目标时间。");
      return;
    }

    const normalized: CountdownItem = {
      id: editingId ?? crypto.randomUUID(),
      title: form.title.trim(),
      targetAt: new Date(form.targetAt).toISOString(),
      category: form.category,
      tone: form.tone,
      note: form.note.trim(),
      createdAt:
        items.find((item) => item.id === editingId)?.createdAt ??
        new Date().toISOString(),
    };

    setItems((current) => {
      if (!editingId) {
        return [normalized, ...current];
      }

      return current.map((item) =>
        item.id === editingId ? normalized : item,
      );
    });

    resetForm();
  }

  function handleEdit(item: CountdownItem) {
    setEditingId(item.id);
    setError("");
    setForm({
      title: item.title,
      targetAt: toDateTimeLocalValue(item.targetAt),
      category: item.category,
      tone: item.tone,
      note: item.note,
    });
  }

  function handleDelete(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  }

  return (
    <div className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="app">
        <section className="hero panel">
          <div className="hero-copy">
            <span className="eyebrow">LESS TIME</span>
            <h1>把重要的日子，留在视线正中央。</h1>
            <p>
              浏览器本地保存、实时跳动的倒计时空间。可以追踪新年、旅行、项目上线，或任何你不想错过的目标日。
            </p>

            <div className="hero-pills">
              <span>本地存储</span>
              <span>实时刷新</span>
              <span>可编辑删除</span>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card primary">
              <span>当前规划</span>
              <strong>{items.length} 个倒计时</strong>
              <small>
                {upcomingItems.length} 个进行中，{passedItems} 个已到期
              </small>
            </div>

            <div className="stat-grid">
              <article className="stat-card">
                <span>最近的目标</span>
                <strong>
                  {nearestItem ? getRelativeLabel(nearestItem.targetAt, nowMs) : "暂无"}
                </strong>
                <small>{nearestItem ? nearestItem.title : "创建第一个倒计时开始使用"}</small>
              </article>
              <article className="stat-card">
                <span>最长的期待</span>
                <strong>
                  {farthestItem ? getRelativeLabel(farthestItem.targetAt, nowMs) : "暂无"}
                </strong>
                <small>{farthestItem ? farthestItem.title : "所有数据都只保存在本地"}</small>
              </article>
            </div>
          </div>
        </section>

        <section className="workspace">
          <form className="panel panel-soft composer" onSubmit={handleSubmit}>
            <div className="section-heading">
              <div>
                <span className="eyebrow">CREATE</span>
                <h2>{editingId ? "编辑倒计时" : "添加一个新的倒计时"}</h2>
              </div>
              <p>
                {editingId
                  ? "修改后会立即覆盖原数据，并同步保存在当前浏览器。"
                  : "例如：新年还有多少天、下次发版还有多久。"}
              </p>
            </div>

            <div className="field">
              <label htmlFor="title">标题</label>
              <input
                id="title"
                className="control"
                maxLength={28}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="例如：2027 新年"
                value={form.title}
              />
            </div>

            <div className="field">
              <label htmlFor="targetAt">目标时间</label>
              <input
                id="targetAt"
                className="control"
                onChange={(event) => updateForm("targetAt", event.target.value)}
                type="datetime-local"
                value={form.targetAt}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="category">分类</label>
                <select
                  id="category"
                  className="control"
                  onChange={(event) =>
                    updateForm(
                      "category",
                      event.target.value as CountdownFormState["category"],
                    )
                  }
                  value={form.category}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="note">备注</label>
                <input
                  id="note"
                  className="control"
                  maxLength={60}
                  onChange={(event) => updateForm("note", event.target.value)}
                  placeholder="一句提醒、目标说明或备忘"
                  value={form.note}
                />
              </div>
            </div>

            <div className="field">
              <label>视觉颜色</label>
              <div className="tone-list">
                {toneOptions.map((tone) => (
                  <button
                    className={`tone-chip${form.tone === tone ? " tone-chip-active" : ""}`}
                    key={tone}
                    onClick={() => updateForm("tone", tone)}
                    style={{
                      backgroundImage: toneDetails[tone].gradient,
                    }}
                    type="button"
                  >
                    {toneDetails[tone].label}
                  </button>
                ))}
              </div>
            </div>

            {error ? <p className="form-message form-error">{error}</p> : null}

            <div className="form-actions">
              <button className="cta-button" type="submit">
                {editingId ? "保存修改" : "添加倒计时"}
              </button>
              {editingId ? (
                <button className="ghost-button" onClick={resetForm} type="button">
                  取消编辑
                </button>
              ) : null}
            </div>
          </form>

          <section className="panel list-panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">OVERVIEW</span>
                <h2>倒计时总览</h2>
              </div>
              <p>按时间先后排序，已过去的事件会自动放到后面。</p>
            </div>

            {orderedItems.length === 0 ? (
              <div className="empty-state">
                <strong>还没有倒计时</strong>
                <p>从左侧创建一个目标日，它会立刻出现在这里。</p>
              </div>
            ) : (
              <div className="countdown-grid">
                {orderedItems.map((item) => {
                  const parts = getTimeParts(item.targetAt, nowMs);

                  return (
                    <article
                      className={`countdown-card tone-${item.tone}${parts.isPast ? " countdown-card-past" : ""}`}
                      key={item.id}
                    >
                      <div className="card-header">
                        <div>
                          <span className="card-tag">{item.category}</span>
                          <h3>{item.title}</h3>
                        </div>

                        <div className="card-actions">
                          <button onClick={() => handleEdit(item)} type="button">
                            编辑
                          </button>
                          <button onClick={() => handleDelete(item.id)} type="button">
                            删除
                          </button>
                        </div>
                      </div>

                      <strong>{getRelativeLabel(item.targetAt, nowMs)}</strong>

                      <div className="time-grid">
                        <div>
                          <span>{String(parts.days).padStart(2, "0")}</span>
                          <small>天</small>
                        </div>
                        <div>
                          <span>{String(parts.hours).padStart(2, "0")}</span>
                          <small>时</small>
                        </div>
                        <div>
                          <span>{String(parts.minutes).padStart(2, "0")}</span>
                          <small>分</small>
                        </div>
                        <div>
                          <span>{String(parts.seconds).padStart(2, "0")}</span>
                          <small>秒</small>
                        </div>
                      </div>

                      <p>{formatTargetDate(item.targetAt)}</p>
                      {item.note ? <p className="note">{item.note}</p> : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
