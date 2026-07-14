export type Language = "ja" | "en"

export const LANGUAGE_STORAGE_KEY = "morphos-ja:language"

export function parseLanguage(value: string | null): Language {
  return value === "en" ? "en" : "ja"
}

export const messages = {
  "meta.title": {
    ja: "Morphous 日本語版 - 自然から生まれたデザインシステム",
    en: "Morphous - Nature-driven design systems",
  },
  "meta.description": {
    ja: "自然をモチーフにしたデザインシステム、生成アセット、再利用できるプロンプト、shadcn対応CSSテーマのカタログです。",
    en: "A catalog of nature-inspired design systems, generated motif assets, reusable prompt records, and shadcn-compatible CSS themes.",
  },
  "common.language": { ja: "表示言語", en: "Display language" },
  "common.japanese": { ja: "日本語", en: "Japanese" },
  "common.english": { ja: "English", en: "English" },
  "common.light": { ja: "ライト", en: "Light" },
  "common.dark": { ja: "ダーク", en: "Dark" },
  "common.all": { ja: "すべて", en: "All" },
  "common.clear": { ja: "クリア", en: "Clear" },
  "common.reset": { ja: "リセット", en: "Reset" },
  "common.open": { ja: "開く", en: "Open" },
  "common.hide": { ja: "閉じる", en: "Hide" },
  "common.close": { ja: "閉じる", en: "Close" },
  "common.download": { ja: "ダウンロード", en: "Download" },
  "common.copy": { ja: "コピー", en: "Copy" },
  "common.copied": { ja: "コピー済み", en: "Copied" },
  "common.copyAll": { ja: "すべてコピー", en: "Copy all" },
  "common.showMore": { ja: "もっと見る", en: "Show more" },
  "common.showLess": { ja: "閉じる", en: "Show less" },
  "common.view": { ja: "表示", en: "View" },
  "common.custom": { ja: "カスタム", en: "Custom" },
  "common.github": { ja: "GitHubリポジトリ", en: "GitHub repository" },
  "common.original": { ja: "原作: Ameyanagi", en: "Built by Ameyanagi" },
  "common.pageTop": { ja: "ページ上部へ ↑", en: "Back to top ↑" },

  "landing.subtitle": {
    ja: "自然から生まれたデザインシステム",
    en: "Nature-coded design systems",
  },
  "landing.mobileSubtitle": {
    ja: "Morphous ギャラリー",
    en: "Morphous gallery",
  },
  "landing.openGallery": { ja: "ギャラリーを開く", en: "Open gallery" },
  "landing.badge": {
    ja: "AI生成による{count}種類のシステム · 開発中",
    en: "{count} AI-generated systems · in active development",
  },
  "landing.headlinePrefix": {
    ja: "動物、花、石を選んで、",
    en: "Pick an animal, a flower, or a stone,",
  },
  "landing.headlineAccent": {
    ja: "デザインシステムを作ろう。",
    en: "ship a design system.",
  },
  "landing.description": {
    ja: "Morphousは自然のモチーフを8色のパレット、ライト／ダーク対応のshadcnテーマ、PowerPoint・Wordテンプレートへ展開します。生成プロンプトも公開され、再現・共有できます。",
    en: "Morphous turns a single nature motif into an 8-role palette, a light/dark shadcn theme, and matching PowerPoint + Word templates. Every prompt is recorded so the catalog stays reproducible.",
  },
  "landing.browse": { ja: "ギャラリーを見る", en: "Browse the gallery" },
  "landing.openInGallery": { ja: "ギャラリーで開く", en: "Open in gallery" },
  "landing.about": { ja: "このサイトについて", en: "Why this exists" },
  "landing.aboutBody": {
    ja: "Morphousは、自然から着想を得た配色を、Webサイトやプレゼンテーション、文書で実際に使える形に整理したカタログです。PowerPointとWordのテンプレートは現在も開発中ですが、配色とフォントはすでに反映されます。",
    en: "I started this to curate a private collection of nature-inspired palettes for the things I actually ship: my own website, the PowerPoint decks I present from, and the Word documents I write. The PowerPoint and Word templates are still in development; the themes already pick up the palette and fonts.",
  },
  "landing.inspiration": {
    ja: "生き物が持つ色や構造の完成度と、Codex + ChatGPT Images 2.0の表現力から着想を得て制作されています。",
    en: "The push came from the quality of Codex + ChatGPT Images 2.0 and from seeing how well-resolved the colors and structures of living things already are.",
  },
  "landing.respectPrefix": { ja: "テーマ設計は", en: "Huge respect to" },
  "landing.and": { ja: "と", en: "and" },
  "landing.respectSuffix": {
    ja: "から多くを学び、どちらでも活用できる構成になっています。",
    en: "Morphous slots into both, and the token-driven theming is inspired by their work.",
  },
  "landing.sourcePrefix": {
    ja: "ソースコード、カタログデータ、生成プロンプトは",
    en: "Everything is open:",
  },
  "landing.sourceLink": { ja: "GitHub", en: "source on GitHub" },
  "landing.sourceSuffix": {
    ja: "で公開しています。日本語版はsoichirowによるフォークで、原作は",
    en: "including catalog data, Codex skills, and the prompt for every system. Original by",
  },
  "landing.sourceEnd": { ja: "です。", en: "." },
  "landing.featured": { ja: "注目のシステム", en: "Featured systems" },
  "landing.browseAll": {
    ja: "全{count}件を見る →",
    en: "Browse all {count} →",
  },
  "landing.hoverHint": {
    ja: "カードにカーソルを合わせると、このページのテーマをプレビューできます。",
    en: "Hover a card to preview its theme on this page.",
  },
  "landing.shipsWith": {
    ja: "すべてのシステムに含まれるもの",
    en: "What every system ships with",
  },
  "landing.paletteTitle": { ja: "8役のカラーパレット", en: "8-role palette" },
  "landing.paletteBody": {
    ja: "背景、文字、プライマリ、セカンダリ、アクセントなどをhexとoklchで収録。",
    en: "Background, Ink, Primary, Secondary, Accent, Signal, Surface, Depth: hex + oklch.",
  },
  "landing.themeTitle": {
    ja: "ライト／ダークテーマ",
    en: "Light + dark theme",
  },
  "landing.themeBody": {
    ja: "両モードのshadcnトークンを収録した、そのまま使えるtheme.css。",
    en: "Drop-in theme.css with all 30 shadcn tokens for both modes.",
  },
  "landing.powerPointBody": {
    ja: "配色をOOXMLテーマに組み込んだ、編集可能なプレゼンテーション。",
    en: "Editable deck with the palette baked into the OOXML theme.",
  },
  "landing.wordBody": {
    ja: "表紙、配色バー、パレット資料を収録。欧文・日本語フォントに対応。",
    en: "Cover, palette stripe, palette appendix. Latin + Japanese fonts wired in.",
  },
  "landing.footer": {
    ja: "Morphous · {count}種類 · AI生成モチーフ · 開発中",
    en: "Morphous · {count} systems · AI-generated motifs · under active development",
  },

  "gallery.home": { ja: "Morphous ホーム", en: "Morphous home" },
  "gallery.title": {
    ja: "自然から生まれた shadcn デザインシステム",
    en: "Nature-coded design systems for shadcn",
  },
  "gallery.search": {
    ja: "モチーフ・カテゴリ・プロンプトを検索",
    en: "Search motif, category, prompt",
  },
  "gallery.randomSystem": { ja: "ランダム表示", en: "Show random" },
  "gallery.clearSearch": { ja: "検索をクリア", en: "Clear search" },
  "gallery.motifFilter": { ja: "モチーフ", en: "Motif" },
  "gallery.sort": { ja: "並び順", en: "Sort" },
  "gallery.clearFilters": { ja: "絞り込みを解除", en: "Clear filters" },
  "gallery.introCount": {
    ja: "自然を基にした{count}種類のデザインシステム",
    en: "{count} nature-coded design systems",
  },
  "gallery.introBody": {
    ja: "1つのモチーフから、配色、shadcnテーマ、ボード、PPTX・DOCXを生成。プロンプトも公開しています。",
    en: "One motif → palette, shadcn theme, board, PPTX & DOCX. AI-generated, prompts attached.",
  },
  "gallery.resultCount": { ja: "{count}件のシステム", en: "{count} systems" },
  "gallery.chooseSystem": { ja: "システムを選択", en: "Choose a system" },
  "gallery.noResults": {
    ja: "条件に一致するシステムがありません。",
    en: "No systems match these filters.",
  },
  "gallery.detailLinks": {
    ja: "システム詳細リンク",
    en: "System detail links",
  },
  "gallery.systemUse": {
    ja: "このデザインシステムを使う",
    en: "Use this design system",
  },
  "gallery.favoriteAdd": { ja: "お気に入りに追加", en: "Add to favorites" },
  "gallery.favoriteRemove": {
    ja: "お気に入りから外す",
    en: "Remove from favorites",
  },
  "gallery.favorite": { ja: "お気に入り", en: "Favorite" },
  "gallery.favoriteSaved": { ja: "保存済み", en: "Saved" },
  "gallery.copyUrl": { ja: "URLをコピー", en: "Copy URL" },
  "gallery.copyUrlTitle": {
    ja: "このページの共有URLをコピー",
    en: "Copy the shareable URL for this page",
  },
  "gallery.palette": { ja: "パレット", en: "Palette" },
  "gallery.tuned": { ja: "調整済み", en: "Tuned" },
  "gallery.paletteHelp": {
    ja: "色をクリックして調整できます。変更は背景とPPTX／DOCX出力へ反映され、システムごとに保存されます。",
    en: "Click a swatch to retune. Edits flow into the page backdrop and PPTX/DOCX exports, and are remembered per system.",
  },
  "gallery.assets": { ja: "アセット", en: "Assets" },
  "gallery.downloadable": {
    ja: "PNG · ダウンロード可能",
    en: "PNG · downloadable",
  },
  "gallery.motif": { ja: "モチーフ", en: "Motif" },
  "gallery.lightBoard": { ja: "ライトボード", en: "Light board" },
  "gallery.darkBoard": { ja: "ダークボード", en: "Dark board" },
  "gallery.hero": { ja: "ヒーロー画像", en: "Hero" },
  "gallery.texture": { ja: "テクスチャ", en: "Texture" },
  "gallery.prompts": { ja: "生成プロンプト", en: "Generation Prompts" },
  "gallery.promptsHelp": {
    ja: "このページのモチーフとボードはAI生成です。再現できるよう、使用したプロンプトを記録しています。",
    en: "Every motif and board on this page is AI-generated. Prompts are recorded so the catalog stays reproducible.",
  },
  "gallery.typography": { ja: "タイポグラフィ", en: "Typography" },
  "gallery.layout": { ja: "レイアウト", en: "Layout" },
  "gallery.paletteStripe": { ja: "カラーパレット", en: "Palette stripe" },
  "gallery.fullMotif": {
    ja: "{name}の高解像度モチーフを表示",
    en: "View full-resolution {name} motif",
  },
  "gallery.board": {
    ja: "デザインシステム・ボード",
    en: "Design-system board",
  },
  "gallery.boardHelp": {
    ja: "トークン、コンポーネント、モチーフの扱いを示すAI生成リファレンスです。",
    en: "AI-generated reference board showing tokens, components, and motif treatment.",
  },
  "gallery.viewBoard": {
    ja: "高解像度ボードを表示",
    en: "View full-resolution board",
  },
  "gallery.componentPreview": {
    ja: "shadcn コンポーネントプレビュー",
    en: "shadcn Component Preview",
  },
  "gallery.componentHelp": {
    ja: "すべての部品に選択中のテーマトークンが適用されます。システムを切り替えて変化を確認できます。",
    en: "All components use the active theme tokens. Switch the system and watch them retune.",
  },
  "gallery.components": { ja: "コンポーネント", en: "Components" },
  "gallery.dashboard": { ja: "ダッシュボード", en: "Dashboard" },
  "gallery.settings": { ja: "設定", en: "Settings" },
  "gallery.overview": { ja: "概要", en: "Overview" },
  "gallery.analytics": { ja: "分析", en: "Analytics" },
  "gallery.reports": { ja: "レポート", en: "Reports" },
  "gallery.boards": { ja: "ボード", en: "Boards" },
  "gallery.themeTokens": { ja: "テーマトークン", en: "Theme tokens" },
  "gallery.revenue": { ja: "売上", en: "Revenue" },
  "gallery.sessions": { ja: "セッション", en: "Sessions" },
  "gallery.conversion": { ja: "コンバージョン率", en: "Conv. rate" },
  "gallery.recentActivity": {
    ja: "最近のアクティビティ",
    en: "Recent activity",
  },
  "gallery.system": { ja: "システム", en: "System" },
  "gallery.status": { ja: "状態", en: "Status" },
  "gallery.roles": { ja: "役割数", en: "Roles" },
  "gallery.coverage": { ja: "カバー率", en: "Coverage" },
  "gallery.shipped": { ja: "公開済み", en: "Shipped" },
  "gallery.review": { ja: "レビュー中", en: "Review" },
  "gallery.profile": { ja: "プロフィール", en: "Profile" },
  "gallery.workspace": { ja: "ワークスペース", en: "Workspace" },
  "gallery.plan": { ja: "プラン", en: "Plan" },
  "gallery.solo": { ja: "個人", en: "Solo" },
  "gallery.studio": { ja: "スタジオ", en: "Studio" },
  "gallery.atelier": { ja: "アトリエ", en: "Atelier" },
  "gallery.emailNotifications": { ja: "メール通知", en: "Email notifications" },
  "gallery.dailyDigest": {
    ja: "カタログ変更のデイリーダイジェスト。",
    en: "Daily digest of catalog changes.",
  },
  "gallery.density": { ja: "表示密度", en: "Density" },
  "gallery.themeSynced": { ja: "テーマを同期しました", en: "Theme synced" },
  "gallery.latestTokens": {
    ja: "最新トークンをshadcnレジストリへ公開済み · サンプル表示",
    en: "Latest tokens published to shadcn registry · sample status",
  },
  "gallery.default": { ja: "標準", en: "Default" },
  "gallery.accent": { ja: "アクセント", en: "Accent" },
  "gallery.muted": { ja: "控えめ", en: "Muted" },
  "gallery.secondary": { ja: "セカンダリ", en: "Secondary" },
  "gallery.destructive": { ja: "危険操作", en: "Destructive" },
  "gallery.online": { ja: "オンライン", en: "Online" },
  "gallery.buttons": { ja: "ボタン", en: "Buttons" },
  "gallery.primaryButton": { ja: "プライマリ", en: "Primary" },
  "gallery.secondaryButton": { ja: "セカンダリ", en: "Secondary" },
  "gallery.outlineButton": { ja: "アウトライン", en: "Outline" },
  "gallery.ghostButton": { ja: "ゴースト", en: "Ghost" },
  "gallery.linkButton": { ja: "リンク", en: "Link" },
  "gallery.disabled": { ja: "無効", en: "Disabled" },
  "gallery.withIcon": { ja: "アイコン付き", en: "With icon" },
  "gallery.inputs": { ja: "入力欄", en: "Inputs" },
  "gallery.email": { ja: "メール", en: "Email" },
  "gallery.description": { ja: "説明", en: "Description" },
  "gallery.sampleDescription": {
    ja: "自然から生まれたデザインシステム。",
    en: "A nature-coded design system.",
  },
  "gallery.selection": { ja: "選択UI", en: "Selection" },
  "gallery.weeklyDigest": {
    ja: "週次ダイジェストを送信",
    en: "Send weekly digest",
  },
  "gallery.auto": { ja: "自動", en: "Auto" },
  "gallery.switch": { ja: "スイッチ", en: "Switch" },
  "gallery.sliderProgress": { ja: "スライダーと進捗", en: "Slider & Progress" },
  "gallery.volume": { ja: "音量", en: "Volume" },
  "gallery.indexing": { ja: "インデックス作成", en: "Indexing" },
  "gallery.sync": { ja: "同期", en: "Sync" },
  "gallery.cleanup": { ja: "クリーンアップ", en: "Cleanup" },
  "gallery.badgesAvatars": { ja: "バッジとアバター", en: "Badges & Avatars" },
  "gallery.tabs": { ja: "タブ", en: "Tabs" },
  "gallery.activity": { ja: "アクティビティ", en: "Activity" },
  "gallery.members": { ja: "メンバー", en: "Members" },
  "gallery.billing": { ja: "請求", en: "Billing" },
  "gallery.alerts": { ja: "アラート", en: "Alerts" },
  "gallery.headsUp": { ja: "お知らせ", en: "Heads up" },
  "gallery.republishBody": {
    ja: "テーマは5分後に再公開されます。",
    en: "Theme will be republished in 5 minutes.",
  },
  "gallery.saved": { ja: "保存しました", en: "Saved" },
  "gallery.savedBody": {
    ja: "パレット調整をこのブラウザに保存しました。",
    en: "Palette tuning persisted to this browser.",
  },
  "gallery.contrastWarning": { ja: "コントラスト警告", en: "Contrast warning" },
  "gallery.contrastBody": {
    ja: "アクセントとサーフェスの組み合わせがAA未満です。",
    en: "Accent vs surface is below AA.",
  },
  "gallery.deleteSystem": {
    ja: "システムを削除しますか？",
    en: "Delete system?",
  },
  "gallery.deleteBody": {
    ja: "この操作は取り消せません。",
    en: "This action cannot be undone.",
  },
  "gallery.cards": { ja: "カード", en: "Cards" },
  "gallery.card": { ja: "カード", en: "Card" },
  "gallery.cardBody": {
    ja: "標準的なコンテンツ用サーフェス。",
    en: "Standard surface for content.",
  },
  "gallery.popover": { ja: "ポップオーバー", en: "Popover" },
  "gallery.popoverBody": {
    ja: "メニューやツールチップ用の浮遊サーフェス。",
    en: "Floating surfaces, menus, tooltips.",
  },
  "gallery.sidebar": { ja: "サイドバー", en: "Sidebar" },
  "gallery.sidebarBody": {
    ja: "常設ナビゲーションの背景。",
    en: "Persistent nav background.",
  },
  "gallery.tooltipPopover": {
    ja: "ツールチップとポップオーバー",
    en: "Tooltip & Popover",
  },
  "gallery.hoverTarget": { ja: "ホバー対象", en: "Hover target" },
  "gallery.themeTooltip": { ja: "テーマのツールチップ", en: "Theme tooltip" },
  "gallery.quickAction": { ja: "クイック操作", en: "Quick action" },
  "gallery.confirm": { ja: "確認", en: "Confirm" },
  "gallery.cancel": { ja: "キャンセル", en: "Cancel" },
  "gallery.skeleton": { ja: "スケルトン", en: "Skeleton" },
  "gallery.tokens": { ja: "shadcn トークン", en: "shadcn Tokens" },
  "gallery.tokensHelp": {
    ja: "ライト（:root）とダーク（.dark）を1つのブロックに収録。shadcnプロジェクトへ貼り付けて使えます。",
    en: "Light (:root) and dark (.dark) in one block. Paste into any shadcn project.",
  },
  "gallery.cssVariables": { ja: "CSS変数", en: "CSS variables" },
  "gallery.color": { ja: "色", en: "Color" },
  "gallery.anyColor": { ja: "指定なし", en: "Any" },
  "gallery.pickColor": { ja: "色を選択", en: "Pick color" },
  "gallery.colorRole": { ja: "照合する色の役割", en: "Color role to match" },
  "gallery.clearColor": { ja: "色フィルターを解除", en: "Clear color filter" },
  "gallery.colorPresets": { ja: "色プリセット", en: "Color presets" },
  "gallery.sortClosest": {
    ja: "{role}に近い色で並び替え",
    en: "Sort by closest {role} color",
  },
  "gallery.tuneRole": { ja: "{role}を調整", en: "Tune {role}" },
  "gallery.copyPrompt": { ja: "プロンプトをコピー", en: "Copy prompt" },
  "gallery.viewAsset": { ja: "{label}を表示", en: "View {label}" },
  "gallery.downloadAsset": {
    ja: "{label}をダウンロード",
    en: "Download {label}",
  },
  "gallery.copyPromptSuccess": {
    ja: "プロンプトをコピーしました",
    en: "Prompt copied",
  },
  "gallery.copyThemeCss": {
    ja: "theme.cssをコピー",
    en: "Copy theme.css",
  },
  "gallery.copyThemeJson": {
    ja: "theme.jsonをコピー",
    en: "Copy theme.json",
  },
  "gallery.copyPromptsJson": {
    ja: "prompts.jsonをコピー",
    en: "Copy prompts.json",
  },
  "gallery.weeklyThroughput": {
    ja: "週間スループット",
    en: "Weekly throughput",
  },
  "gallery.activityApproved": {
    ja: "モナークのパレットを承認",
    en: "Approved monarch palette",
  },
  "gallery.activityPushed": {
    ja: "セミのtheme.cssを公開",
    en: "Pushed cicada theme.css",
  },
  "gallery.activityDrafted": {
    ja: "鯉のプロンプトを作成",
    en: "Drafted koi prompts",
  },
  "gallery.mon": { ja: "月", en: "Mon" },
  "gallery.tue": { ja: "火", en: "Tue" },
  "gallery.wed": { ja: "水", en: "Wed" },
  "gallery.thu": { ja: "木", en: "Thu" },
  "gallery.fri": { ja: "金", en: "Fri" },
  "gallery.sat": { ja: "土", en: "Sat" },
  "gallery.sun": { ja: "日", en: "Sun" },
  "gallery.snowLeopard": { ja: "ユキヒョウ", en: "Snow Leopard" },
  "gallery.cicada": { ja: "セミ", en: "Cicada" },
  "gallery.koi": { ja: "鯉", en: "Koi" },
  "gallery.icon": { ja: "アイコン", en: "Icon" },

  "typography.preset": {
    ja: "タイポグラフィプリセット",
    en: "Typography preset",
  },
  "typography.latin": { ja: "欧文フォント", en: "Latin font" },
  "typography.japanese": { ja: "日本語フォント", en: "Japanese font" },
  "office.downloadPowerPoint": {
    ja: "PowerPointをダウンロード",
    en: "Download PowerPoint",
  },
  "office.downloadWord": { ja: "Wordをダウンロード", en: "Download Word" },
  "office.building": { ja: "作成中…", en: "Building…" },
} as const

export type TranslationKey = keyof typeof messages
export type TranslationValues = Record<string, string | number>

export function translate(
  language: Language,
  key: TranslationKey,
  values: TranslationValues = {}
): string {
  let value: string = messages[key][language]
  for (const [name, replacement] of Object.entries(values)) {
    value = value.replaceAll(`{${name}}`, String(replacement))
  }
  return value
}

const japaneseTaxonomy: Record<string, string> = {
  amphibian: "両生類",
  animal: "動物",
  bird: "鳥",
  celestial: "天体",
  crustacean: "甲殻類",
  fish: "魚",
  flower: "花",
  fruit: "果物",
  fungi: "菌類",
  insect: "昆虫",
  landscape: "風景",
  mammal: "哺乳類",
  marine: "海洋",
  microorganism: "微生物",
  mineral: "鉱物",
  mollusk: "軟体動物",
  plant: "植物",
  reptile: "爬虫類",
  weather: "気象",
}

const japaneseRoles: Record<string, string> = {
  Primary: "プライマリ",
  Secondary: "セカンダリ",
  Accent: "アクセント",
  Background: "背景",
  Surface: "サーフェス",
  Ink: "文字",
  Signal: "シグナル",
  Depth: "奥行き",
  Muted: "控えめ",
  Highlight: "ハイライト",
  Action: "アクション",
  Focus: "フォーカス",
  Success: "成功",
  Support: "サポート",
  Texture: "テクスチャ",
}

const japaneseSort: Record<string, string> = {
  name: "システム名",
  motifName: "モチーフ名",
  color: "色の近さ",
}

const englishSort: Record<string, string> = {
  name: "System name",
  motifName: "Motif name",
  color: "Closest color",
}

const japaneseColors: Record<string, string> = {
  Red: "赤",
  Orange: "オレンジ",
  Amber: "琥珀",
  Yellow: "黄",
  Lime: "ライム",
  Green: "緑",
  Teal: "青緑",
  Cyan: "シアン",
  Blue: "青",
  Indigo: "藍",
  Violet: "紫",
  Pink: "ピンク",
  Brown: "茶",
  Stone: "ストーン",
  Slate: "スレート",
  Black: "黒",
  White: "白",
  Cream: "クリーム",
}

export function translateTaxonomy(language: Language, value: string): string {
  return language === "ja" ? (japaneseTaxonomy[value] ?? value) : value
}

export function translateRole(language: Language, value: string): string {
  return language === "ja" ? (japaneseRoles[value] ?? value) : value
}

export function translateSort(language: Language, value: string): string {
  return language === "ja"
    ? (japaneseSort[value] ?? value)
    : (englishSort[value] ?? value)
}

export function translateColor(language: Language, value: string): string {
  return language === "ja" ? (japaneseColors[value] ?? value) : value
}

const japaneseBiomes: Record<string, string> = {
  "mediterranean field": "地中海の野原",
}

const japaneseSystemDescriptions: Record<string, string> = {
  "morphous-artichoke":
    "地中海の畑に育つアーティチョークのつぼみから着想を得た、shadcn／tweakcn互換の構造的なコンテンツシステムです。セージグリーンの苞、くすんだオリーブの骨格、銀色がかった表面、落ち着いた紫の中心、淡い茎のクリーム色、温かみのある苞先、オリーブチャコールの奥行きを、階層的な編集ワークフローへ展開します。",
}

export function translateBiome(language: Language, value: string): string {
  return language === "ja" ? (japaneseBiomes[value] ?? value) : value
}

export function translateSystemDescription(
  language: Language,
  slug: string,
  fallback: string
): string {
  return language === "ja"
    ? (japaneseSystemDescriptions[slug] ?? fallback)
    : fallback
}
