// 中转站对外配置 — 同事只需改这一处即可同步到页面
window.RELAY_CONFIG = {
  title: "晴天小猪猪中转站",
  subtitle: "OpenAI 兼容 · 内网极速接入",
  // 对外 Base URL（根路径，不含 /v1）
  baseUrl: "http://172.16.23.13:8317",
  apiKey: "sk-HUyg3sqfFTGeA2ud8",
  status: "online",
  provider: "xai",
  models: [
    { id: "grok-build-0.1", name: "Grok Build 0.1", tags: ["chat", "build"] },
    { id: "grok-4.5", name: "Grok 4.5", tags: ["chat", "flagship"] },
    { id: "grok-4.3", name: "Grok 4.3", tags: ["chat"] },
    { id: "grok-4.20-0309-reasoning", name: "Grok 4.20 0309 Reasoning", tags: ["chat", "reasoning"] },
    { id: "grok-4.20-0309-non-reasoning", name: "Grok 4.20 0309 Non Reasoning", tags: ["chat"] },
    { id: "grok-4.20-multi-agent-0309", name: "Grok 4.20 Multi Agent 0309", tags: ["chat", "agent"] },
    { id: "grok-3-mini", name: "Grok 3 Mini", tags: ["chat", "fast"] },
    { id: "grok-3-mini-fast", name: "Grok 3 Mini Fast", tags: ["chat", "fast"] },
    { id: "grok-composer-2.5-fast", name: "Composer 2.5 Fast", tags: ["chat", "code"] },
    { id: "grok-imagine-image", name: "Grok Imagine Image", tags: ["image"] },
    { id: "grok-imagine-image-quality", name: "Grok Imagine Image Quality", tags: ["image"] },
    { id: "grok-imagine-video", name: "Grok Imagine Video", tags: ["video"] },
  ],
};
