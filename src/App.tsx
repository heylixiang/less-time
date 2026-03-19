const previewItems = [
  {
    title: "2027 新年",
    metric: "还有 288 天",
    detail: "目标日期 2027-01-01 00:00",
    accent: "gold",
  },
  {
    title: "下一次旅行",
    metric: "还有 43 天",
    detail: "目标日期 2026-05-01 09:30",
    accent: "green",
  },
  {
    title: "产品上线",
    metric: "还有 15 天",
    detail: "目标日期 2026-04-03 18:00",
    accent: "blue",
  },
];

function App() {
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
              一个纯浏览器本地运行的倒计时工具，帮你追踪节日、计划、发布、旅行和任何值得期待的时间点。
            </p>

            <div className="hero-pills">
              <span>本地存储</span>
              <span>现代化界面</span>
              <span>响应式布局</span>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card primary">
              <span>当前规划</span>
              <strong>6 个倒计时</strong>
              <small>分布在节日、工作和生活场景</small>
            </div>

            <div className="stat-grid">
              <article className="stat-card">
                <span>最近事件</span>
                <strong>15 天</strong>
                <small>产品上线冲刺中</small>
              </article>
              <article className="stat-card">
                <span>最长期待</span>
                <strong>288 天</strong>
                <small>下一次跨年</small>
              </article>
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="panel panel-soft form-preview">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CREATE</span>
                <h2>快速创建一个倒计时</h2>
              </div>
              <p>下一阶段会接入真正的表单与本地存储能力。</p>
            </div>

            <div className="mock-form">
              <div className="field">
                <label>标题</label>
                <div className="input">例如：新年还有多少天</div>
              </div>
              <div className="field">
                <label>目标时间</label>
                <div className="input">2027-01-01 00:00</div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>分类</label>
                  <div className="input">节日</div>
                </div>
                <div className="field">
                  <label>颜色</label>
                  <div className="input">暖金色</div>
                </div>
              </div>

              <button className="cta-button" type="button">
                添加倒计时
              </button>
            </div>
          </div>

          <div className="panel list-preview">
            <div className="section-heading">
              <div>
                <span className="eyebrow">OVERVIEW</span>
                <h2>倒计时卡片总览</h2>
              </div>
              <p>后续会支持编辑、删除、排序和状态提示。</p>
            </div>

            <div className="countdown-grid">
              {previewItems.map((item) => (
                <article
                  className={`countdown-card accent-${item.accent}`}
                  key={item.title}
                >
                  <span className="card-tag">预览</span>
                  <h3>{item.title}</h3>
                  <strong>{item.metric}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
