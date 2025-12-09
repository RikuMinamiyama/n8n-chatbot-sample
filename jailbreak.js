// ========================================
// Jailbreak / Prompt Injection 防止フィルタ
// ========================================

const input = $input.first().json;
const userMessage = input.chatInput || "";

// --- 正規化処理 ---
const normalize = (text) => {
  return text
    .toLowerCase()
    // 全角英数→半角
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // 全角スペース→半角
    .replace(/　/g, " ")
    // 連続スペース→単一
    .replace(/\s+/g, " ")
    .trim();
};

const normalizedMessage = normalize(userMessage);

// --- 禁止パターン定義 ---
const blockedPatterns = [
  // プロンプトインジェクション
  /ignore\s*(previous|above|all)/,
  /forget\s*(everything|all|your)/,
  /disregard\s*(previous|above|all)/,
  /無視し(て|ろ)/,
  /忘れ(て|ろ)/,
  /システムプロンプト/,
  /system\s*prompt/,
  
  // ロール操作
  /you\s*are\s*now/,
  /act\s*as\s*(a|an)?/,
  /pretend\s*(to\s*be|you)/,
  /じゃないふり/,
  /になりきって/,
  
  // 情報抽出
  /repeat\s*(the|your)\s*(instructions|prompt)/,
  /what\s*(are|is)\s*your\s*(instructions|prompt|rules)/,
  /プロンプト(を)?教えて/,
  /命令(を)?(見せて|教えて)/,
  
  // 制限解除
  /jailbreak/,
  /bypass/,
  /制限(を)?(解除|無視)/,
  /リミット(を)?外し/,
];

// --- 禁止ワード定義（部分一致） ---
const blockedWords = [
  "dan",
  "developer mode",
  "devモード",
];

// --- チェック実行 ---
let blocked = false;
let blockReason = null;

// パターンマッチ
for (const pattern of blockedPatterns) {
  if (pattern.test(normalizedMessage)) {
    blocked = true;
    blockReason = `pattern: ${pattern}`;
    break;
  }
}

// ワードマッチ
if (!blocked) {
  for (const word of blockedWords) {
    if (normalizedMessage.includes(word)) {
      blocked = true;
      blockReason = `word: ${word}`;
      break;
    }
  }
}

// --- 入力長チェック ---
if (!blocked && userMessage.length > 1000) {
  blocked = true;
  blockReason = "message_too_long";
}

if (!blocked && userMessage.length < 1) {
  blocked = true;
  blockReason = "message_empty";
}

// --- 結果を返す ---
return [{
  json: {
    ...input,
    blocked,
    blockReason,  // デバッグ用（本番では削除可）
  }
}];