(function () {
  "use strict";

  var cfg = window.RELAY_CONFIG || {};
  var baseUrl = cfg.baseUrl || "";
  var apiKey = cfg.apiKey || "";
  var models = Array.isArray(cfg.models) ? cfg.models : [];
  var keyVisible = false;
  var activeTag = "all";
  var activeTab = "curl";
  var toastTimer = null;

  var el = {
    title: document.getElementById("site-title"),
    subtitle: document.getElementById("site-subtitle"),
    statusText: document.getElementById("status-text"),
    modelCount: document.getElementById("model-count"),
    baseUrl: document.getElementById("base-url"),
    apiKey: document.getElementById("api-key"),
    toggleKey: document.getElementById("toggle-key"),
    toggleKeyText: document.getElementById("toggle-key-text"),
    copyAll: document.getElementById("copy-all"),
    search: document.getElementById("model-search"),
    filterBar: document.getElementById("filter-bar"),
    modelList: document.getElementById("model-list"),
    empty: document.getElementById("empty-state"),
    snippetLang: document.getElementById("snippet-lang"),
    snippetCode: document.getElementById("snippet-code"),
    copySnippet: document.getElementById("copy-snippet"),
    toast: document.getElementById("toast"),
  };

  function maskKey(key) {
    if (!key) return "—";
    if (key.length <= 8) return "••••••••";
    return key.slice(0, 4) + "••••••••" + key.slice(-4);
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove("show");
    }, 1800);
  }

  function copyText(text, successMsg, btn) {
    var done = function () {
      showToast(successMsg || "已复制");
      if (btn) {
        btn.classList.add("copied");
        setTimeout(function () {
          btn.classList.remove("copied");
        }, 1200);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      showToast("复制失败，请手动选择");
    }
    document.body.removeChild(ta);
  }

  function renderKey() {
    el.apiKey.textContent = keyVisible ? apiKey : maskKey(apiKey);
    el.apiKey.dataset.masked = keyVisible ? "false" : "true";
    el.toggleKeyText.textContent = keyVisible ? "隐藏" : "显示";
    el.toggleKey.setAttribute("aria-pressed", keyVisible ? "true" : "false");
  }

  function allTags() {
    var set = {};
    models.forEach(function (m) {
      (m.tags || []).forEach(function (t) {
        set[t] = true;
      });
    });
    return Object.keys(set).sort();
  }

  function renderFilters() {
    var tags = ["all"].concat(allTags());
    el.filterBar.innerHTML = "";
    tags.forEach(function (tag) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (tag === activeTag ? " active" : "");
      btn.textContent = tag === "all" ? "全部" : tag;
      btn.addEventListener("click", function () {
        activeTag = tag;
        renderFilters();
        renderModels();
      });
      el.filterBar.appendChild(btn);
    });
  }

  function filteredModels() {
    var q = (el.search.value || "").trim().toLowerCase();
    return models.filter(function (m) {
      var tags = m.tags || [];
      var tagOk = activeTag === "all" || tags.indexOf(activeTag) !== -1;
      if (!tagOk) return false;
      if (!q) return true;
      var hay = (m.id + " " + (m.name || "") + " " + tags.join(" ")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderModels() {
    var list = filteredModels();
    el.modelList.innerHTML = "";
    el.empty.hidden = list.length > 0;

    list.forEach(function (m) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "model-row";
      row.setAttribute("role", "listitem");
      row.setAttribute("aria-label", "复制模型 " + m.id);

      var main = document.createElement("div");
      main.className = "model-main";
      main.innerHTML =
        '<span class="model-id"></span><span class="model-name"></span>';
      main.querySelector(".model-id").textContent = m.id;
      main.querySelector(".model-name").textContent = m.name || "";

      var tags = document.createElement("div");
      tags.className = "model-tags";
      (m.tags || []).forEach(function (t) {
        var span = document.createElement("span");
        span.className = "tag " + t;
        span.textContent = t;
        tags.appendChild(span);
      });

      var hint = document.createElement("span");
      hint.className = "model-copy-hint";
      hint.textContent = "点击复制 ID";

      row.appendChild(main);
      row.appendChild(tags);
      row.appendChild(hint);
      row.addEventListener("click", function () {
        copyText(m.id, "已复制模型: " + m.id);
      });
      el.modelList.appendChild(row);
    });
  }

  function defaultModelId() {
    var prefer = models.find(function (m) {
      return m.id === "grok-4.5";
    });
    return (prefer || models[0] || { id: "grok-4.5" }).id;
  }

  // 根路径 Base URL 时，示例请求走 /v1/...（OpenAI 兼容约定）
  function apiRoot() {
    return String(baseUrl || "").replace(/\/+$/, "");
  }

  function snippets() {
    var model = defaultModelId();
    var root = apiRoot();
    var chatUrl = root + "/v1/chat/completions";
    // SDK 的 base_url 常需带 /v1；页面展示/复制的仍是根路径
    var sdkBase = root + "/v1";
    return {
      curl: {
        lang: "bash",
        code:
          'curl "' +
          chatUrl +
          '" \\\n' +
          '  -H "Authorization: Bearer ' +
          apiKey +
          '" \\\n' +
          '  -H "Content-Type: application/json" \\\n' +
          "  -d '{\n" +
          '    "model": "' +
          model +
          '",\n' +
          '    "messages": [{"role": "user", "content": "你好"}]\n' +
          "  }'",
      },
      python: {
        lang: "python",
        code:
          "from openai import OpenAI\n\n" +
          "client = OpenAI(\n" +
          '    base_url="' +
          sdkBase +
          '",\n' +
          '    api_key="' +
          apiKey +
          '",\n' +
          ")\n\n" +
          "resp = client.chat.completions.create(\n" +
          '    model="' +
          model +
          '",\n' +
          '    messages=[{"role": "user", "content": "你好"}],\n' +
          ")\n" +
          "print(resp.choices[0].message.content)",
      },
      js: {
        lang: "javascript",
        code:
          "import OpenAI from 'openai';\n\n" +
          "const client = new OpenAI({\n" +
          "  baseURL: '" +
          sdkBase +
          "',\n" +
          "  apiKey: '" +
          apiKey +
          "',\n" +
          "});\n\n" +
          "const resp = await client.chat.completions.create({\n" +
          "  model: '" +
          model +
          "',\n" +
          "  messages: [{ role: 'user', content: '你好' }],\n" +
          "});\n\n" +
          "console.log(resp.choices[0].message.content);",
      },
    };
  }

  function renderSnippet() {
    var map = snippets();
    var item = map[activeTab] || map.curl;
    el.snippetLang.textContent = item.lang;
    el.snippetCode.textContent = item.code;
  }

  function bindCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-copy-target");
        if (target === "base-url") {
          copyText(baseUrl, "已复制 Base URL", btn);
        } else if (target === "api-key") {
          copyText(apiKey, "已复制 API Key", btn);
        }
      });
    });
  }

  // 口号逐字拆分，实现入场 + 霓虹呼吸
  function initMotto() {
    var node = document.getElementById("motto-text");
    if (!node) return;
    var text = node.getAttribute("data-text") || node.textContent || "";
    if (!text) return;
    // 尊重系统「减少动态效果」
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    node.classList.add("is-split");
    node.setAttribute("aria-label", text);
    node.textContent = "";
    var chars = Array.from(text);
    chars.forEach(function (ch, i) {
      var span = document.createElement("span");
      // 仅空白字符作占位；中文标点仍参与霓虹动画
      span.className = "motto-char" + (ch.trim() === "" ? " is-space" : "");
      span.style.setProperty("--i", String(i));
      span.textContent = ch;
      node.appendChild(span);
    });
  }

  function init() {
    if (cfg.title) el.title.textContent = cfg.title;
    if (cfg.subtitle) el.subtitle.textContent = cfg.subtitle;
    el.statusText.textContent = (cfg.status || "online").toUpperCase();
    el.modelCount.textContent = String(models.length);
    el.baseUrl.textContent = baseUrl || "—";
    initMotto();
    renderKey();
    renderFilters();
    renderModels();
    renderSnippet();
    bindCopyButtons();

    el.toggleKey.addEventListener("click", function () {
      keyVisible = !keyVisible;
      renderKey();
    });

    el.copyAll.addEventListener("click", function () {
      var pack =
        "Base URL: " + baseUrl + "\nAPI Key: " + apiKey + "\n";
      copyText(pack, "已复制凭证包", el.copyAll);
    });

    el.search.addEventListener("input", function () {
      renderModels();
    });

    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeTab = tab.getAttribute("data-tab") || "curl";
        document.querySelectorAll(".tab").forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderSnippet();
      });
    });

    el.copySnippet.addEventListener("click", function () {
      copyText(el.snippetCode.textContent || "", "已复制代码", el.copySnippet);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
