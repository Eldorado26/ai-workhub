import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Boxes, Megaphone, MessagesSquare, Sparkles, ShieldCheck,
  Plus, Search, CheckCircle2, Clock, X, ExternalLink, User, ThumbsUp, Send,
  Star, Crown, Calendar, StickyNote, Trash2, Circle, LogOut,
} from "lucide-react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

/* ── 데이터 ───────────────────────────────── */
const DEFAULT_CATEGORIES = ["문서작성", "데이터분석", "개발", "디자인", "번역", "마케팅", "영상·이미지", "회의·협업"];
const SECURITY = {
  S1: { label: "S1 공개", color: "#22A06B", bg: "#E4F6EE" },
  S2: { label: "S2 사내", color: "#C58A12", bg: "#FBF1DC" },
  S3: { label: "S3 기밀", color: "#D14343", bg: "#FBE6E6" },
};
const seedTools = [
  { id: 1, name: "ChatGPT Enterprise", domain: "chatgpt.com", desc: "범용 LLM. 문서 초안·요약·아이디에이션 전반에 사용.", cat: "문서작성", admin: "김도현 (전략기획)", sec: "S2", status: "approved", by: "관리자", fav: true },
  { id: 2, name: "Claude", domain: "claude.ai", desc: "긴 문서 분석·검토와 코드 리뷰에 강점.", cat: "개발", admin: "이서연 (개발팀)", sec: "S2", status: "approved", by: "관리자", fav: true },
  { id: 3, name: "Perplexity", domain: "perplexity.ai", desc: "출처가 달린 리서치·시장조사용 검색 AI.", cat: "데이터분석", admin: "박민준 (마케팅)", sec: "S1", status: "approved", by: "관리자", fav: false },
  { id: 4, name: "Gamma", domain: "gamma.app", desc: "텍스트를 슬라이드로. 제안서·보고 덱 초안.", cat: "문서작성", admin: "최유진 (영업)", sec: "S1", status: "approved", by: "관리자", fav: false },
  { id: 5, name: "DeepL", domain: "deepl.com", desc: "고품질 번역. 계약·기술문서 다국어 처리.", cat: "번역", admin: "정하늘 (글로벌)", sec: "S2", status: "approved", by: "관리자", fav: false },
  { id: 6, name: "Midjourney", domain: "midjourney.com", desc: "이미지 생성. 마케팅 비주얼 시안용.", cat: "영상·이미지", admin: "박민준 (마케팅)", sec: "S1", status: "approved", by: "관리자", fav: false },
  { id: 101, name: "Cursor", domain: "cursor.com", desc: "AI 코드 에디터. 사내 레포 연동 검토 필요.", cat: "개발", admin: "이서연 (개발팀)", sec: "S3", status: "pending", by: "이서연", fav: false },
  { id: 102, name: "Notion AI", domain: "notion.so", desc: "회의록 자동 정리·요약. 팀 단위 도입 검토.", cat: "회의·협업", admin: "최유진 (영업)", sec: "S2", status: "pending", by: "최유진", fav: false },
];
const seedNotices = [
  { id: 1, tag: "필독", title: "AI 워크스페이스 사용 보안 가이드 v2.1 배포", body: "고객 개인정보·미공개 재무자료는 S3 등급 툴에 입력 금지. 위반 시 접근 제한됩니다.", date: "06.05", pin: true },
  { id: 2, tag: "공지", title: "6월 신규 승인 툴 추가 안내", body: "데이터분석·번역 카테고리에 신규 툴이 추가되었습니다.", date: "06.03", pin: false },
  { id: 3, tag: "교육", title: "프롬프트 작성 사내 세미나 (6/12 14시)", body: "부서별 1명 이상 참석 권장. 녹화본 추후 공유.", date: "06.01", pin: false },
];
const seedSchedule = [
  { id: 1, day: "06.10", title: "신규 툴 보안 검토 회의", time: "10:00" },
  { id: 2, day: "06.12", title: "프롬프트 세미나", time: "14:00" },
  { id: 3, day: "06.13", title: "Notion AI 도입 회신 마감", time: "18:00" },
];
const seedMemos = [
  { id: 1, body: "S3 등급 툴 입력 데이터 분기 점검 필요" },
  { id: 2, body: "번역 한도 상향 건 — 글로벌팀 회신 대기" },
];
const seedRequests = [
  { id: 1, title: "Notion AI 사내 도입 검토 요청", body: "회의록 자동 정리 용도로 팀 단위 도입을 검토하고 싶습니다.", by: "최유진 (영업)", date: "06.06", status: "답변완료", up: 7, answers: [{ by: "관리자", body: "보안 검토 진행 중입니다. 데이터 잔존 정책 확인 후 6/13까지 회신드리겠습니다.", date: "06.07" }] },
  { id: 2, title: "번역 툴 사용량 한도 상향 가능할까요?", body: "DeepL 월 한도가 부족합니다. 글로벌팀 한정 상향 요청드립니다.", by: "정하늘 (글로벌)", date: "06.04", status: "검토중", up: 3, answers: [] },
];
const seedUsers = [
  { id: 1, name: "이서연", dept: "개발팀", role: "팀원", sec: "S3", status: "active", pw: "1234" },
  { id: 2, name: "박민준", dept: "마케팅", role: "팀원", sec: "S2", status: "active", pw: "1234" },
  { id: 3, name: "한지우", dept: "재무팀", role: "팀원", sec: "S2", status: "pending", pw: "1234" },
  { id: 4, name: "오세훈", dept: "인사팀", role: "팀원", sec: "S1", status: "pending", pw: "1234" },
];
const AI_RECS = [
  { task: "보고서·제안서 초안", icon: "📝", tools: ["ChatGPT Enterprise", "Gamma", "Claude"], tip: "구조 → 초안 → 슬라이드 순으로 이어서 사용" },
  { task: "데이터 분석·리서치", icon: "📊", tools: ["Perplexity", "ChatGPT Enterprise"], tip: "출처 확인은 Perplexity, 가공·해석은 ChatGPT" },
  { task: "코드 작성·리뷰", icon: "💻", tools: ["Claude", "Cursor"], tip: "민감 코드는 S3 승인 후 사용" },
  { task: "다국어 번역", icon: "🌐", tools: ["DeepL", "ChatGPT Enterprise"], tip: "계약·기술문서는 DeepL 우선" },
  { task: "비주얼·시안 제작", icon: "🎨", tools: ["Midjourney"], tip: "외부 공유 전 저작권 확인 필수" },
  { task: "회의록·협업 정리", icon: "🤝", tools: ["Notion AI", "Claude"], tip: "녹취 요약 후 액션아이템만 추출" },
];

/* ── 스타일 (자체 CSS · Tailwind 미사용) ──────── */
const CSS = `
.ph *{box-sizing:border-box}
.ph{min-height:100vh;background:#ECEBF6;color:#211D45;font-family:Pretendard,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
.ph .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.wrap{max-width:1120px;margin:0 auto;padding:20px 16px}
.row{display:flex;align-items:center}
.between{justify-content:space-between}
.gap2{gap:8px}.gap3{gap:12px}.wrapg{flex-wrap:wrap}
.stack{display:flex;flex-direction:column}
button{font-family:inherit}

/* header */
.hd{background:linear-gradient(135deg,#2C2760,#221E48);border-radius:24px;padding:16px;color:#fff;box-shadow:0 18px 40px -20px rgba(39,35,80,.55);margin-bottom:20px}
.logo{width:44px;height:44px;border-radius:16px;background:#6C4FE0;display:grid;place-items:center}
.logo-t{font-size:18px;font-weight:800;line-height:1}
.logo-s{margin-top:4px;font-size:10px;letter-spacing:.2em;color:#A8A4D0}
.sysbar{display:flex;align-items:center;gap:8px}
.sys-t{font-size:11px;letter-spacing:.14em;color:#C9C5E6}
.clock{font-size:13px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}
.switch{display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;background:rgba(255,255,255,.1);color:#fff;padding:8px 14px;border-radius:999px;font-size:12px;font-weight:600;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}
.nav{display:flex;gap:4px;margin-top:16px;overflow-x:auto;padding-bottom:2px}
.navbtn{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;border:0;cursor:pointer;background:transparent;color:#C9C5E6;padding:8px 14px;border-radius:999px;font-size:13px;font-weight:600}
.navbtn:hover{background:rgba(255,255,255,.1)}
.navbtn.on{background:#fff;color:#272350}
.nav-en{font-size:9px;letter-spacing:.16em;color:#7C789E}
.navbtn.on .nav-en{color:#8A86B8}

/* cards */
.board{display:grid;gap:16px;grid-template-columns:repeat(3,1fr)}
.span2{grid-column:span 2}
.card{background:#fff;border-radius:22px;padding:20px;box-shadow:0 1px 3px rgba(33,29,69,.05)}
.card.dark{background:linear-gradient(135deg,#2C2760,#221E48);color:#fff;box-shadow:0 18px 40px -22px rgba(39,35,80,.5)}
.card.dash{background:#F4F3FC;border:2px dashed #C9C5E6;box-shadow:none}

/* eyebrow */
.eb{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.eb-l{display:flex;align-items:baseline;gap:8px}
.eb-l h2{margin:0;font-size:15px;font-weight:700}
.eb-en{font-size:10px;letter-spacing:.18em;color:#9C99B8}
.eb.light h2{color:#fff}.eb.light .eb-en{color:#A8A4D0}
.link{border:0;background:none;cursor:pointer;color:#6C4FE0;font-size:12px;font-weight:600}

/* add btn */
.add{display:inline-flex;align-items:center;gap:4px;border:0;cursor:pointer;background:#F0EEFA;color:#6C4FE0;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}
.add.light{background:rgba(255,255,255,.1);color:#fff}

/* buttons */
.btn{border:0;cursor:pointer;font-weight:700;border-radius:999px;display:inline-flex;align-items:center;gap:6px}
.btn-p{background:#6C4FE0;color:#fff;padding:10px 20px;font-size:14px;box-shadow:0 10px 22px -10px rgba(108,79,224,.6)}
.btn-approve{background:#22A06B;color:#fff;padding:6px 12px;font-size:11px}
.btn-reject{background:#FBE6E6;color:#D14343;padding:6px 12px;font-size:11px}

/* chips */
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:0;cursor:pointer;background:#fff;color:#5B5780;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600}
.chip:hover{background:#F2F1FA}
.chip.on{background:#272350;color:#fff}
.chip.sm{padding:4px 10px;font-size:11px;background:#F2F1FA;font-weight:700}
.chip.sm.on{background:#272350;color:#fff}

/* badges */
.sec{border-radius:6px;padding:2px 6px;font-size:10px;font-weight:700;white-space:nowrap}
.tag{border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;color:#fff;background:#6C4FE0}
.tag.pin{background:#FF6B8A}
.status{border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap}

/* generic boxes */
.ic{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#F0EEFA;color:#6C4FE0;font-weight:800;font-size:14px;flex:none}
.ic.lg{width:44px;height:44px;border-radius:16px;font-size:20px}
.ic.cal{background:#6C4FE0;color:#fff}
.ic.round{border-radius:999px;background:#272350;color:#fff;font-size:13px}
.darkbox{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;border:0;cursor:pointer;background:#322C63;color:#fff;border-radius:16px;padding:12px}
.darkbox:hover{background:#3A3473}
.soft{background:#F6F5FC;border-radius:16px;padding:12px}
.listrow{display:flex;align-items:center;gap:12px;border:1px solid #EBE9F6;border-radius:16px;padding:12px;background:#fff}
.toolcard{border:1px solid #EBE9F6;background:#fff;border-radius:16px;padding:16px}
.domain{display:flex;align-items:center;gap:10px;border:1px solid #EBE9F6;border-radius:12px;padding:10px 12px;text-decoration:none;color:inherit}
.domain:hover{border-color:#6C4FE0}
.memo{display:flex;align-items:flex-start;gap:8px;background:#FCFBF3;border:1px solid #F0EBD8;border-radius:12px;padding:8px 12px}
.empty{display:grid;place-items:center;background:#F6F5FC;border-radius:16px;padding:32px;color:#9C99B8;font-size:12px}
.grid2{display:grid;gap:12px;grid-template-columns:1fr 1fr}
.dlt{border:0;background:none;cursor:pointer;opacity:0;display:grid;place-items:center}
.dlt:hover{opacity:1!important}
.hovrow:hover .dlt{opacity:.6}

/* text */
.t-name{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}
.t-dom{font-size:11px;color:#9C99B8}
.t-title{font-size:16px;font-weight:700;margin:0}
.t-desc{margin:10px 0 0;font-size:12.5px;line-height:1.6;color:#5B5780}
.clip1{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.clip2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.muted{color:#9C99B8;font-size:11px}
.divider{border-top:1px solid #F0EEF8;margin-top:12px;padding-top:10px}

/* upvote */
.upv{display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid #EBE9F6;border-radius:16px;padding:8px 12px;background:#fff;cursor:pointer;color:#6C4FE0}
.upv:hover{border-color:#6C4FE0}

/* AI rec */
.recnum{font-size:11px;font-weight:700;letter-spacing:.14em;color:#C9C5E6}
.recline{display:flex;align-items:center;gap:8px;background:#F6F5FC;border-radius:12px;padding:8px 12px}
.tip{display:flex;align-items:flex-start;gap:8px;background:#FCF8E8;border-radius:12px;padding:12px;font-size:12px;color:#8A6A12;margin-top:12px}
.dashbtn{width:100%;border:2px dashed #C9C5E6;background:none;cursor:pointer;border-radius:16px;padding:16px;font-size:13px;font-weight:600;color:#6C4FE0}

/* admin sec grid */
.seccard{border-radius:16px;padding:12px;text-align:center}
.secbtn{border:0;cursor:pointer;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700}

/* search */
.search{display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:10px 16px;box-shadow:0 1px 3px rgba(33,29,69,.05);flex:1;min-width:220px}
.search input{border:0;outline:none;background:none;width:100%;font-size:14px;font-family:inherit}

/* reply */
.reply{display:flex;gap:8px;margin-top:12px}
.reply input{flex:1;border:0;outline:none;background:#F4F3FC;border-radius:999px;padding:10px 16px;font-size:13px;font-family:inherit}
.send{width:40px;height:40px;border-radius:999px;border:0;cursor:pointer;background:#6C4FE0;color:#fff;display:grid;place-items:center;flex:none}
.answer{display:flex;gap:10px;background:#F4F3FC;border-radius:16px;padding:14px;margin-top:12px}

/* modal + form */
.overlay{position:fixed;inset:0;background:rgba(20,16,48,.45);display:grid;place-items:center;padding:16px;z-index:40}
.modal{width:100%;max-width:420px;background:#fff;border-radius:24px;padding:24px;box-shadow:0 30px 70px -20px rgba(0,0,0,.4)}
.iconbtn{width:32px;height:32px;border-radius:999px;border:0;cursor:pointer;background:#F0EEF8;display:grid;place-items:center}
.label{display:block;font-size:12px;font-weight:600;color:#5B5780;margin-bottom:4px}
.input{width:100%;border:1px solid #E3E0F2;border-radius:12px;padding:10px 14px;font-size:14px;outline:none;background:#fff;font-family:inherit}
.input:focus{border-color:#6C4FE0}
.fbtns{display:flex;gap:8px;margin-top:20px}
.fcancel{flex:1;border:0;cursor:pointer;background:#F0EEF8;color:#5B5780;padding:12px;border-radius:999px;font-weight:700;font-size:14px}
.fsubmit{flex:1;border:0;cursor:pointer;background:#6C4FE0;color:#fff;padding:12px;border-radius:999px;font-weight:700;font-size:14px}
.fsubmit:disabled{background:#C9C5E6;cursor:default}
.toggle{height:46px;width:100%;border:0;cursor:pointer;border-radius:12px;font-size:14px;font-weight:700;background:#F0EEF8;color:#5B5780}
.toggle.on{background:#6C4FE0;color:#fff}

.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#272350;color:#fff;padding:12px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:50;box-shadow:0 20px 40px -15px rgba(0,0,0,.5)}
.foot{display:flex;align-items:center;justify-content:space-between;margin-top:32px;font-size:11px;color:#9C99B8}

@media(max-width:760px){
  .board{grid-template-columns:1fr}
  .span2{grid-column:span 1}
  .grid2{grid-template-columns:1fr}
}

/* login */
.login{min-height:100vh;display:grid;place-items:center;padding:20px}
.login-card{width:100%;max-width:400px}
.login-top{background:linear-gradient(135deg,#2C2760,#221E48);border-radius:24px 24px 0 0;padding:28px 24px;color:#fff;text-align:center}
.login-top .logo{margin:0 auto 12px}
.login-body{background:#fff;border-radius:0 0 24px 24px;padding:24px;box-shadow:0 20px 50px -20px rgba(39,35,80,.4)}
.atabs{display:flex;gap:4px;background:#F2F1FA;border-radius:999px;padding:4px;margin-bottom:16px}
.atab{flex:1;border:0;cursor:pointer;background:none;padding:9px;border-radius:999px;font-size:13px;font-weight:600;color:#5B5780}
.atab.on{background:#fff;color:#272350;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.msg{border-radius:12px;padding:10px 12px;font-size:12px;font-weight:600;margin-top:12px}
.msg.err{background:#FBE6E6;color:#D14343}
.msg.ok{background:#E4F6EE;color:#22A06B}
.hint{margin-top:16px;border-radius:12px;background:#F6F5FC;padding:10px 12px;font-size:11px;color:#7C789E;line-height:1.7}
.identity{display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:rgba(255,255,255,.1);padding:8px 14px;font-size:12px;font-weight:600;color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}
`;

const cls = (...a) => a.filter(Boolean).join(" ");

/* ── Firestore 동기화 ──────────────────────────
   board 컬렉션의 문서 하나(tools, notices, …)에 데이터 배열을 통째로 저장합니다.
   setX(...) 호출 방식은 기존 useState와 동일하지만, 변경될 때마다 Firestore에
   자동 저장되고 onSnapshot으로 다른 사람 화면에도 실시간 반영됩니다. */
const CONFIG_SEED = { categories: DEFAULT_CATEGORIES, adminPw: "admin" };

function useSyncedDoc(path, seed) {
  const ref = useMemo(() => doc(db, "board", path), [path]);
  const [val, setVal] = useState(seed);
  useEffect(() => {
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (snap.exists() && data && data.v !== undefined) setVal(data.v);
      else setDoc(ref, { v: seed }, { merge: true }).catch(() => {});
    }, (err) => console.error("Firestore:", err));
    return unsub;
  }, [ref]);
  const update = (next) => setVal((prev) => {
    const resolved = typeof next === "function" ? next(prev) : next;
    setDoc(ref, { v: resolved }, { merge: true }).catch((e) => console.error(e));
    return resolved;
  });
  return [val, update];
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { const s = localStorage.getItem("ph_session"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [tab, setTab] = useState("dashboard");
  const [tools, setTools] = useSyncedDoc("tools", seedTools);
  const [notices, setNotices] = useSyncedDoc("notices", seedNotices);
  const [requests, setRequests] = useSyncedDoc("requests", seedRequests);
  const [users, setUsers] = useSyncedDoc("users", seedUsers);
  const [schedule, setSchedule] = useSyncedDoc("schedule", seedSchedule);
  const [memos, setMemos] = useSyncedDoc("memos", seedMemos);
  const [config, setConfig] = useSyncedDoc("config", CONFIG_SEED);
  const categories = config.categories || [];
  const adminPw = config.adminPw ?? "admin";
  const setCategories = (next) => setConfig((c) => ({ ...c, categories: typeof next === "function" ? next(c.categories || []) : next }));
  const setAdminPw = (v) => setConfig((c) => ({ ...c, adminPw: v }));
  const [clock, setClock] = useState("--:--:--");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!document.getElementById("ph-fonts")) {
      const l = document.createElement("link");
      l.id = "ph-fonts"; l.rel = "stylesheet";
      l.href = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";
      document.head.appendChild(l);
      const m = document.createElement("link");
      m.rel = "stylesheet";
      m.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap";
      document.head.appendChild(m);
    }
    const tick = () => setClock(new Date().toLocaleTimeString("ko-KR", { hour12: false }));
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const isAdmin = session?.type === "admin";

  useEffect(() => {
    try {
      if (session) localStorage.setItem("ph_session", JSON.stringify(session));
      else localStorage.removeItem("ph_session");
    } catch (e) { /* ignore */ }
  }, [session]);

  const loginMember = (name, pw) => {
    if (!name || !pw) return "이름과 비밀번호를 입력하세요";
    const u = users.find((x) => x.name === name && x.pw === pw);
    if (!u) return "이름 또는 비밀번호가 올바르지 않습니다";
    if (u.status === "pending") return "아직 관리자 승인 대기 중입니다";
    setSession({ type: "member", user: u }); setTab("dashboard"); return null;
  };
  const register = (name, pw) => {
    if (!name || !pw) return "이름과 비밀번호를 입력하세요";
    if (users.some((x) => x.name === name)) return "이미 등록된 이름입니다";
    setUsers((p) => [...p, { id: Date.now(), name, dept: "미지정", role: "팀원", sec: "S1", status: "pending", pw }]);
    return null;
  };
  const loginAdmin = (pw) => {
    if (pw !== adminPw) return "관리자 비밀번호가 올바르지 않습니다";
    setSession({ type: "admin" }); setTab("dashboard"); return null;
  };
  const logout = () => { setSession(null); setTab("dashboard"); };

  const nav = [
    { id: "dashboard", label: "보드", en: "BOARD", icon: LayoutDashboard },
    { id: "tools", label: "워크스페이스", en: "DOMAINS", icon: Boxes },
    { id: "notice", label: "공지", en: "NOTICE", icon: Megaphone },
    { id: "request", label: "요청", en: "REQUEST", icon: MessagesSquare },
    { id: "ai", label: "AI 추천", en: "GUIDE", icon: Sparkles },
    ...(isAdmin ? [{ id: "admin", label: "관리자", en: "ADMIN", icon: ShieldCheck }] : []),
  ];

  if (!session) {
    return (
      <div className="ph">
        <style>{CSS}</style>
        <Login users={users} onMember={loginMember} onRegister={register} onAdmin={loginAdmin} />
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="ph">
      <style>{CSS}</style>
      <div className="wrap">
        {/* Header */}
        <header className="hd">
          <div className="row between wrapg" style={{ gap: 12 }}>
            <div className="row gap3">
              <div className="logo"><Sparkles size={24} color="#fff" /></div>
              <div>
                <div className="logo-t">AI WorkHub</div>
                <div className="logo-s mono">TOTAL AI BOARD</div>
              </div>
            </div>
            <div className="row" style={{ gap: 12 }}>
              <div className="sysbar" style={{ display: "flex" }}>
                <Circle size={8} fill="#4ADE80" color="#4ADE80" />
                <span className="clock mono">{clock}</span>
              </div>
              <span className="identity">
                {isAdmin ? <Crown size={16} color="#FFD466" /> : <User size={16} />}
                {isAdmin ? "관리자" : session.user.name}
              </span>
              <button className="switch" onClick={logout}>
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          </div>
          <nav className="nav">
            {nav.map((n) => { const Icon = n.icon; const on = tab === n.id; return (
              <button key={n.id} className={cls("navbtn", on && "on")} onClick={() => setTab(n.id)}>
                <Icon size={16} />{n.label}<span className="nav-en mono">{n.en}</span>
              </button>
            ); })}
          </nav>
        </header>

        {tab === "dashboard" && <Dashboard {...{ tools, notices, requests, schedule, setSchedule, memos, setMemos, categories, setTab, flash }} />}
        {tab === "tools" && <ToolsBoard {...{ tools, setTools, categories, isAdmin, flash }} />}
        {tab === "notice" && <Notices {...{ notices, setNotices, isAdmin, flash }} />}
        {tab === "request" && <Requests {...{ requests, setRequests, isAdmin, flash }} />}
        {tab === "ai" && <AIRecs tools={tools} setTab={setTab} />}
        {tab === "admin" && isAdmin && <Admin {...{ tools, setTools, users, setUsers, categories, setCategories, adminPw, setAdminPw, flash }} />}

        <footer className="foot mono">
          <span>AI WORKHUB · PROTOTYPE v0.5</span>
        </footer>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ── 로그인 / 신청 화면 ───────────────────────── */
function Login({ users, onMember, onRegister, onAdmin }) {
  const [mode, setMode] = useState("login"); // login | signup | admin
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const reset = (m) => { setMode(m); setMsg(null); setName(""); setPw(""); };
  const submit = () => {
    if (mode === "login") { const r = onMember(name.trim(), pw); if (r) setMsg({ t: "err", x: r }); }
    else if (mode === "signup") {
      const r = onRegister(name.trim(), pw);
      if (r) setMsg({ t: "err", x: r });
      else { setMsg({ t: "ok", x: "신청 완료! 관리자 승인 후 로그인할 수 있어요." }); setName(""); setPw(""); }
    } else { const r = onAdmin(pw); if (r) setMsg({ t: "err", x: r }); }
  };
  const tabs = [{ id: "login", l: "로그인" }, { id: "signup", l: "신청" }, { id: "admin", l: "관리자" }];
  return (
    <div className="login">
      <div className="login-card">
        <div className="login-top">
          <div className="logo"><Sparkles size={26} color="#fff" /></div>
          <div className="logo-t" style={{ fontSize: 20 }}>AI WorkHub</div>
          <div className="logo-s mono" style={{ marginTop: 6 }}>TOTAL AI BOARD</div>
        </div>
        <div className="login-body">
          <div className="atabs">
            {tabs.map((t) => <button key={t.id} className={cls("atab", mode === t.id && "on")} onClick={() => reset(t.id)}>{t.l}</button>)}
          </div>

          <div className="stack" style={{ gap: 12 }}>
            {mode !== "admin" && (
              <Field label="이름"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" onKeyDown={(e) => e.key === "Enter" && submit()} /></Field>
            )}
            <Field label={mode === "admin" ? "관리자 비밀번호" : "비밀번호"}>
              <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••" onKeyDown={(e) => e.key === "Enter" && submit()} />
            </Field>
          </div>

          {msg && <div className={cls("msg", msg.t)}>{msg.x}</div>}

          <button className="fsubmit" style={{ width: "100%", marginTop: 16 }} onClick={submit}>
            {mode === "login" ? "로그인" : mode === "signup" ? "사용자 신청" : "관리자 모드 진입"}
          </button>

          {mode === "signup" && (
            <div className="hint">신청 후 관리자가 승인하면 로그인할 수 있습니다. 부서·보안등급은 관리자가 지정합니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 공통 ─────────────────────────────────── */
const Eyebrow = ({ kr, en, right, light }) => (
  <div className={cls("eb", light && "light")}>
    <div className="eb-l"><h2>{kr}</h2><span className="eb-en mono">· {en}</span></div>
    {right}
  </div>
);
const Sec = ({ sec }) => { const s = SECURITY[sec]; return <span className="sec" style={{ color: s.color, background: s.bg }}>{s.label}</span>; };
const Status = ({ s }) => {
  const map = { "답변완료": ["#22A06B", "#E4F6EE"], "검토중": ["#C58A12", "#FBF1DC"], "접수": ["#2E8FE0", "#E3F0FB"] };
  const [c, bg] = map[s] || ["#7C789E", "#eee"];
  return <span className="status" style={{ color: c, background: bg }}>{s}</span>;
};
const Empty = ({ msg }) => <div className="empty">{msg}</div>;
const Field = ({ label, children }) => <label><span className="label">{label}</span>{children}</label>;
function Modal({ title, en, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ marginBottom: 16 }}>
          <div className="eb-l"><h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h2><span className="eb-en mono">{en}</span></div>
          <button className="iconbtn" onClick={onClose}><X size={16} color="#5B5780" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
const FormBtns = ({ onClose, ok, onSubmit, label = "등록" }) => (
  <div className="fbtns">
    <button className="fcancel" onClick={onClose}>취소</button>
    <button className="fsubmit" disabled={!ok} onClick={onSubmit}>{label}</button>
  </div>
);

/* ── 1. 대시보드 ───────────────────────────── */
function Dashboard({ tools, notices, requests, schedule, setSchedule, memos, setMemos, categories, setTab, flash }) {
  const [domF, setDomF] = useState("ALL");
  const [memoVal, setMemoVal] = useState("");
  const [schForm, setSchForm] = useState(false);
  const approved = tools.filter((t) => t.status === "approved");
  const pending = tools.filter((t) => t.status === "pending");
  const sortedNotice = [...notices].sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
  const domFilters = ["ALL", "승인", "대기", ...categories.slice(0, 3)];
  const domList = approved.concat(pending).filter((t) => domF === "ALL" ? true : domF === "승인" ? t.status === "approved" : domF === "대기" ? t.status === "pending" : t.cat === domF);

  return (
    <div className="board">
      {/* 공지 */}
      <section className="card dark span2">
        <Eyebrow kr="공지사항" en="NOTICE" light right={<button className="add light" onClick={() => setTab("notice")}><Plus size={12} /> 추가</button>} />
        <div className="stack" style={{ gap: 8 }}>
          {sortedNotice.slice(0, 3).map((n) => (
            <button key={n.id} className="darkbox" onClick={() => setTab("notice")}>
              <span className={cls("tag", n.pin && "pin")} style={{ marginTop: 2 }}>{n.tag}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                <span className="clip1" style={{ display: "block", fontSize: 11, color: "#B5B1DC" }}>{n.body}</span>
              </span>
              <span className="mono" style={{ fontSize: 11, color: "#8A86B8" }}>{n.date}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 일정 */}
      <section className="card">
        <Eyebrow kr="금주 일정" en="SCHEDULE" right={<button className="add" onClick={() => setSchForm(true)}><Plus size={12} /> 추가</button>} />
        <div className="stack" style={{ gap: 8 }}>
          {schedule.length === 0 ? <Empty msg="일정이 없습니다." /> : schedule.map((s) => (
            <div key={s.id} className="soft hovrow row gap2" style={{ padding: 10 }}>
              <div className="ic cal"><Calendar size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{s.title}</div>
                <div className="mono" style={{ fontSize: 11, color: "#9C99B8" }}>{s.day} · {s.time}</div>
              </div>
              <button className="dlt" onClick={() => setSchedule((p) => p.filter((x) => x.id !== s.id))}><Trash2 size={14} color="#C9C5E6" /></button>
            </div>
          ))}
        </div>
      </section>

      {/* 도메인 */}
      <section className="card span2">
        <Eyebrow kr="AI 도메인" en="DOMAINS" right={<button className="link" onClick={() => setTab("tools")}>전체보기 →</button>} />
        <div className="chips" style={{ marginBottom: 12 }}>
          {domFilters.map((f) => <button key={f} className={cls("chip sm", domF === f && "on", ["ALL", "승인", "대기"].includes(f) && "mono")} onClick={() => setDomF(f)}>{f}</button>)}
        </div>
        <div className="grid2">
          {domList.map((t) => (
            <a key={t.id} className="domain" href={`https://${t.domain}`} target="_blank" rel="noreferrer">
              <div className="ic" style={{ width: 32, height: 32 }}>{t.name[0]}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="t-name" style={{ fontSize: 13 }}>{t.name}{t.fav && <Star size={12} fill="#FFC53D" color="#FFC53D" />}</div>
                <div className="t-dom mono clip1">{t.domain}</div>
              </div>
              {t.status === "pending" ? <span className="sec" style={{ color: "#C58A12", background: "#FBF1DC" }}>대기</span> : <Sec sec={t.sec} />}
            </a>
          ))}
        </div>
      </section>

      {/* 메모 */}
      <section className="card">
        <Eyebrow kr="메모장" en="MEMO PAD" />
        <div className="row gap2" style={{ marginBottom: 8 }}>
          <input className="input" style={{ fontSize: 12, padding: "8px 12px" }} value={memoVal} onChange={(e) => setMemoVal(e.target.value)} placeholder="메모 입력" />
          <button className="send" style={{ width: 36, height: 36 }} onClick={() => { if (memoVal) { setMemos((p) => [{ id: Date.now(), body: memoVal }, ...p]); setMemoVal(""); } }}><Plus size={16} /></button>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          {memos.map((m) => (
            <div key={m.id} className="memo hovrow">
              <StickyNote size={14} color="#C58A12" style={{ marginTop: 2, flex: "none" }} />
              <span style={{ flex: 1, fontSize: 12, lineHeight: 1.4, color: "#5B5780" }}>{m.body}</span>
              <button className="dlt" onClick={() => setMemos((p) => p.filter((x) => x.id !== m.id))}><X size={14} color="#C9C5E6" /></button>
            </div>
          ))}
        </div>
      </section>

      {/* 요청 */}
      <section className="card span2">
        <Eyebrow kr="요청사항" en="REQUEST" right={<button className="link" onClick={() => setTab("request")}>전체보기 →</button>} />
        <div className="stack" style={{ gap: 8 }}>
          {requests.slice(0, 3).map((r) => (
            <div key={r.id} className="soft row gap3">
              <div className="stack" style={{ alignItems: "center" }}><ThumbsUp size={16} color="#6C4FE0" /><span style={{ fontSize: 11, fontWeight: 700, color: "#6C4FE0" }}>{r.up}</span></div>
              <div style={{ flex: 1 }}><div className="clip1" style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div><div className="muted">{r.by} · {r.date}</div></div>
              <Status s={r.status} />
            </div>
          ))}
        </div>
      </section>

      {/* AI 추천 */}
      <section className="card dark">
        <Eyebrow kr="AI 추천" en="GUIDE" light right={<button className="link" style={{ color: "#8A6CFF" }} onClick={() => setTab("ai")}>전체 →</button>} />
        <div className="stack" style={{ gap: 8 }}>
          {AI_RECS.slice(0, 3).map((r) => (
            <button key={r.task} className="darkbox" style={{ alignItems: "center" }} onClick={() => setTab("ai")}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{r.task}</div><div className="clip1" style={{ fontSize: 11, color: "#B5B1DC" }}>{r.tools.join(" · ")}</div></div>
            </button>
          ))}
        </div>
      </section>

      {schForm && <ScheduleForm onClose={() => setSchForm(false)} onSubmit={(d) => { setSchedule((p) => [...p, { id: Date.now(), ...d }]); setSchForm(false); flash("일정이 추가되었습니다"); }} />}
    </div>
  );
}
function ScheduleForm({ onClose, onSubmit }) {
  const [f, setF] = useState({ day: "", time: "", title: "" });
  return (
    <Modal title="일정 추가" en="SCHEDULE" onClose={onClose}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="grid2">
          <Field label="날짜"><input className="input" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} placeholder="06.15" /></Field>
          <Field label="시간"><input className="input" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} placeholder="14:00" /></Field>
        </div>
        <Field label="일정명"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      </div>
      <FormBtns onClose={onClose} ok={f.day && f.title} onSubmit={() => onSubmit(f)} />
    </Modal>
  );
}

/* ── 2. AI 워크스페이스 ─────────────────────────────── */
function ToolsBoard({ tools, setTools, categories, isAdmin, flash }) {
  const [q, setQ] = useState("");
  const [catF, setCatF] = useState("전체");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => tools.filter((t) => (catF === "전체" || t.cat === catF) && (t.name + t.domain + t.desc).toLowerCase().includes(q.toLowerCase())), [tools, q, catF]);
  const approved = filtered.filter((t) => t.status === "approved");
  const pending = filtered.filter((t) => t.status === "pending");
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row gap3 wrapg">
        <div className="search"><Search size={16} color="#9C99B8" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="툴 이름·도메인·설명 검색" /></div>
        <button className="btn btn-p" onClick={() => setOpen(true)}><Plus size={16} /> 도메인 추가</button>
      </div>
      <div className="chips">{["전체", ...categories].map((c) => <button key={c} className={cls("chip", catF === c && "on")} onClick={() => setCatF(c)}>{c}</button>)}</div>

      <section className="card">
        <Eyebrow kr="승인된 AI 워크스페이스" en={`APPROVED · ${approved.length}`} right={<CheckCircle2 size={20} color="#22A06B" />} />
        {approved.length === 0 ? <Empty msg="조건에 맞는 승인 툴이 없습니다." /> : <div className="grid2">{approved.map((t) => <ToolCard key={t.id} t={t} />)}</div>}
      </section>

      <section className="card dash">
        <Eyebrow kr="승인 전 · 팀원 등록" en={`PENDING · ${pending.length}`} right={<Clock size={20} color="#E0922F" />} />
        {pending.length === 0 ? <Empty msg="등록된 대기 툴이 없습니다." /> : (
          <div className="grid2">{pending.map((t) => (
            <ToolCard key={t.id} t={t} action={isAdmin && <button className="btn btn-approve" onClick={() => { setTools((p) => p.map((x) => x.id === t.id ? { ...x, status: "approved", by: "관리자" } : x)); flash(`${t.name} 승인 완료`); }}>승인</button>} />
          ))}</div>
        )}
      </section>

      {open && <ToolForm categories={categories} onClose={() => setOpen(false)} onSubmit={(d) => { setTools((p) => [{ id: Date.now(), status: "pending", by: "나", fav: false, ...d }, ...p]); setOpen(false); flash("승인 대기 목록에 등록되었습니다"); }} />}
    </div>
  );
}
function ToolCard({ t, action }) {
  return (
    <div className="toolcard">
      <div className="row between" style={{ alignItems: "flex-start", gap: 8 }}>
        <div className="row gap2">
          <div className="ic">{t.name[0]}</div>
          <div>
            <div className="t-name">{t.name}{t.fav && <Star size={14} fill="#FFC53D" color="#FFC53D" />}</div>
            <a className="t-dom mono row" style={{ color: "#6C4FE0", textDecoration: "none", gap: 4 }} href={`https://${t.domain}`} target="_blank" rel="noreferrer">{t.domain}<ExternalLink size={12} /></a>
          </div>
        </div>
        <Sec sec={t.sec} />
      </div>
      <p className="t-desc clip2">{t.desc}</p>
      <div className="divider row between">
        <div className="row" style={{ gap: 6, fontSize: 11, color: "#9C99B8" }}><User size={14} /> {t.admin}</div>
        <div className="row gap2"><span style={{ borderRadius: 6, background: "#F2F1FA", padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "#6C4FE0" }}>{t.cat}</span>{action}</div>
      </div>
    </div>
  );
}
function ToolForm({ categories, onClose, onSubmit }) {
  const [f, setF] = useState({ name: "", domain: "", desc: "", cat: categories[0] || "", admin: "", sec: "S2" });
  return (
    <Modal title="도메인 추가" en="ADD DOMAIN" onClose={onClose}>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: "#7C789E" }}>등록 시 <b>승인 전 목록</b>에 들어가며, 관리자 승인 후 공개됩니다.</p>
      <div className="stack" style={{ gap: 12 }}>
        <Field label="툴 이름"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="예: Notion AI" /></Field>
        <Field label="도메인"><input className="input" value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })} placeholder="예: notion.so" /></Field>
        <Field label="간단한 설명"><textarea className="input" rows={3} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="어떤 업무에 어떻게 쓰는지" /></Field>
        <div className="grid2">
          <Field label="카테고리"><select className="input" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="요청 보안등급"><select className="input" value={f.sec} onChange={(e) => setF({ ...f, sec: e.target.value })}>{Object.keys(SECURITY).map((s) => <option key={s} value={s}>{SECURITY[s].label}</option>)}</select></Field>
        </div>
        <Field label="담당자 정보"><input className="input" value={f.admin} onChange={(e) => setF({ ...f, admin: e.target.value })} placeholder="예: 홍길동 (부서명)" /></Field>
      </div>
      <FormBtns onClose={onClose} ok={f.name && f.domain && f.admin} onSubmit={() => onSubmit(f)} label="등록 요청" />
    </Modal>
  );
}

/* ── 3. 공지 ───────────────────────────────── */
function Notices({ notices, setNotices, isAdmin, flash }) {
  const [open, setOpen] = useState(false);
  const sorted = [...notices].sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row between">
        <Eyebrow kr="공지사항" en="NOTICE" />
        {isAdmin && <button className="btn btn-p" onClick={() => setOpen(true)}><Plus size={16} /> 공지 추가</button>}
      </div>
      <div className="stack" style={{ gap: 12 }}>
        {sorted.map((n) => (
          <article key={n.id} className={cls("card", n.pin && "dark")}>
            <div className="row between">
              <div className="row gap2"><span className={cls("tag", n.pin && "pin")}>{n.tag}</span><h3 className="t-title">{n.title}</h3></div>
              <span className="mono" style={{ fontSize: 12, color: n.pin ? "#B5B1DC" : "#9C99B8" }}>{n.date}</span>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.6, color: n.pin ? "#D6D3F0" : "#5B5780" }}>{n.body}</p>
          </article>
        ))}
      </div>
      {open && <NoticeForm onClose={() => setOpen(false)} onSubmit={(d) => { setNotices((p) => [{ id: Date.now(), date: "오늘", pin: false, ...d }, ...p]); setOpen(false); flash("공지가 등록되었습니다"); }} />}
    </div>
  );
}
function NoticeForm({ onClose, onSubmit }) {
  const [f, setF] = useState({ tag: "공지", title: "", body: "", pin: false });
  return (
    <Modal title="공지 작성" en="NEW NOTICE" onClose={onClose}>
      <div className="stack" style={{ gap: 12 }}>
        <div className="grid2">
          <Field label="태그"><select className="input" value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}>{["필독", "공지", "교육", "업데이트"].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="상단 고정"><button className={cls("toggle", f.pin && "on")} onClick={() => setF({ ...f, pin: !f.pin })}>{f.pin ? "고정 ON" : "고정 OFF"}</button></Field>
        </div>
        <Field label="제목"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="내용"><textarea className="input" rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      </div>
      <FormBtns onClose={onClose} ok={!!f.title} onSubmit={() => onSubmit(f)} />
    </Modal>
  );
}

/* ── 4. 요청 ───────────────────────────────── */
function Requests({ requests, setRequests, isAdmin, flash }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState({});
  const addReply = (id) => { const body = reply[id]; if (!body) return; setRequests((p) => p.map((r) => r.id === id ? { ...r, status: "답변완료", answers: [...r.answers, { by: "관리자", body, date: "오늘" }] } : r)); setReply({ ...reply, [id]: "" }); flash("답변이 등록되었습니다"); };
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row between">
        <Eyebrow kr="요청사항" en="REQUEST" />
        <button className="btn btn-p" onClick={() => setOpen(true)}><Plus size={16} /> 요청 등록</button>
      </div>
      <div className="stack" style={{ gap: 12 }}>
        {requests.map((r) => (
          <article key={r.id} className="card">
            <div className="row between" style={{ alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="row gap2"><h3 className="t-title">{r.title}</h3><Status s={r.status} /></div>
                <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.6, color: "#5B5780" }}>{r.body}</p>
                <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>{r.by} · {r.date}</div>
              </div>
              <button className="upv" onClick={() => setRequests((p) => p.map((x) => x.id === r.id ? { ...x, up: x.up + 1 } : x))}><ThumbsUp size={16} color="#6C4FE0" /><span style={{ fontSize: 13, fontWeight: 700 }}>{r.up}</span></button>
            </div>
            {r.answers.map((a, i) => (
              <div key={i} className="answer">
                <div className="ic" style={{ width: 28, height: 28, borderRadius: 8, background: "#6C4FE0", color: "#fff" }}><ShieldCheck size={16} /></div>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: "#6C4FE0" }}>{a.by} <span style={{ fontWeight: 400, color: "#9C99B8" }}>· {a.date}</span></div><p style={{ margin: 0, fontSize: 13, color: "#3D3960" }}>{a.body}</p></div>
              </div>
            ))}
            {isAdmin && (
              <div className="reply">
                <input value={reply[r.id] || ""} onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} placeholder="관리자 답변 작성" />
                <button className="send" onClick={() => addReply(r.id)}><Send size={16} /></button>
              </div>
            )}
          </article>
        ))}
      </div>
      {open && <RequestForm onClose={() => setOpen(false)} onSubmit={(d) => { setRequests((p) => [{ id: Date.now(), by: "나", date: "오늘", status: "접수", up: 0, answers: [], ...d }, ...p]); setOpen(false); flash("요청이 등록되었습니다"); }} />}
    </div>
  );
}
function RequestForm({ onClose, onSubmit }) {
  const [f, setF] = useState({ title: "", body: "" });
  return (
    <Modal title="요청 등록" en="NEW REQUEST" onClose={onClose}>
      <div className="stack" style={{ gap: 12 }}>
        <Field label="제목"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="예: OO 툴 도입 검토 요청" /></Field>
        <Field label="내용"><textarea className="input" rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="필요한 이유와 용도를 적어주세요" /></Field>
      </div>
      <FormBtns onClose={onClose} ok={!!f.title} onSubmit={() => onSubmit(f)} />
    </Modal>
  );
}

/* ── 5. AI 추천 ────────────────────────────── */
function AIRecs({ tools, setTab }) {
  const find = (name) => tools.find((t) => t.name === name);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <Eyebrow kr="업무별 AI 추천" en="HOW TO USE" />
      <p style={{ margin: "-8px 0 0", fontSize: 13, color: "#7C789E" }}>하려는 일을 고르면, 승인된 툴 조합과 사용 팁을 알려드립니다.</p>
      <div className="grid2">
        {AI_RECS.map((r, i) => (
          <div key={r.task} className="card">
            <div className="row gap3">
              <span className="recnum mono">{String(i + 1).padStart(2, "0")}</span>
              <div className="ic lg">{r.icon}</div>
              <h3 className="t-title">{r.task}</h3>
            </div>
            <div className="stack" style={{ gap: 8, marginTop: 12 }}>
              {r.tools.map((name) => { const t = find(name); return (
                <div key={name} className="recline">
                  <Sparkles size={16} color="#6C4FE0" /><span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{name}</span>
                  {t && t.status === "approved" ? <Sec sec={t.sec} /> : <span style={{ fontSize: 10, fontWeight: 700, color: "#E0922F" }}>승인 대기</span>}
                </div>
              ); })}
            </div>
            <div className="tip">💡 <span>{r.tip}</span></div>
          </div>
        ))}
      </div>
      <button className="dashbtn" onClick={() => setTab("tools")}>전체 AI 워크스페이스 보기 →</button>
    </div>
  );
}

/* ── 6. 관리자 ─────────────────────────────── */
function Admin({ tools, setTools, users, setUsers, categories, setCategories, adminPw, setAdminPw, flash }) {
  const [sub, setSub] = useState("domain");
  const [newCat, setNewCat] = useState("");
  const [pwf, setPwf] = useState({ cur: "", n1: "", n2: "" });
  const pendingTools = tools.filter((t) => t.status === "pending");
  const pendingUsers = users.filter((u) => u.status === "pending");
  const subs = [
    { id: "domain", label: "도메인 승인", n: pendingTools.length },
    { id: "user", label: "사용자 승인", n: pendingUsers.length },
    { id: "category", label: "카테고리", n: 0 },
    { id: "sec", label: "보안등급", n: 0 },
    { id: "settings", label: "관리자 PW", n: 0 },
  ];
  const addCat = () => {
    const v = newCat.trim();
    if (!v) return;
    if (categories.includes(v)) { flash("이미 있는 카테고리입니다"); return; }
    setCategories((p) => [...p, v]); setNewCat(""); flash(`'${v}' 카테고리 추가됨`);
  };
  const changePw = () => {
    if (pwf.cur !== adminPw) { flash("현재 비밀번호가 일치하지 않습니다"); return; }
    if (!pwf.n1 || pwf.n1 !== pwf.n2) { flash("새 비밀번호가 일치하지 않습니다"); return; }
    setAdminPw(pwf.n1); setPwf({ cur: "", n1: "", n2: "" }); flash("관리자 비밀번호가 변경되었습니다");
  };
  return (
    <div className="stack" style={{ gap: 16 }}>
      <Eyebrow kr="관리자" en="ADMIN" />
      <div className="chips">
        {subs.map((s) => (
          <button key={s.id} className={cls("chip", sub === s.id && "on")} onClick={() => setSub(s.id)}>
            {s.label}{s.n > 0 && <span style={{ marginLeft: 6, borderRadius: 999, background: "#FF6B8A", color: "#fff", padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{s.n}</span>}
          </button>
        ))}
      </div>

      {sub === "domain" && (
        <section className="card">
          <Eyebrow kr="도메인 승인 대기" en={`PENDING · ${pendingTools.length}`} />
          {pendingTools.length === 0 ? <Empty msg="대기 중인 도메인이 없습니다." /> : (
            <div className="stack" style={{ gap: 8 }}>{pendingTools.map((t) => (
              <div key={t.id} className="listrow">
                <div className="ic">{t.name[0]}</div>
                <div style={{ flex: 1 }}><div className="t-name">{t.name} <span className="t-dom mono" style={{ fontWeight: 400 }}>· {t.domain}</span></div><div className="muted">{t.cat} · {t.by} 등록</div></div>
                <Sec sec={t.sec} />
                <button className="btn btn-reject" onClick={() => { setTools((p) => p.filter((x) => x.id !== t.id)); flash("반려 처리되었습니다"); }}>반려</button>
                <button className="btn btn-approve" onClick={() => { setTools((p) => p.map((x) => x.id === t.id ? { ...x, status: "approved", by: "관리자" } : x)); flash(`${t.name} 승인 완료`); }}>승인</button>
              </div>
            ))}</div>
          )}
        </section>
      )}

      {sub === "user" && (
        <section className="card">
          <Eyebrow kr="사용자 승인 / 관리" en={`USERS · ${users.length}`} />
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#7C789E" }}>보안등급을 지정한 뒤 승인하세요. 등급은 승인 후에도 변경할 수 있습니다.</p>
          <div className="stack" style={{ gap: 8 }}>{users.map((u) => (
            <div key={u.id} className="listrow" style={{ flexWrap: "wrap" }}>
              <div className="ic round">{u.name[0]}</div>
              <div style={{ flex: 1, minWidth: 130 }}>
                <div className="t-name">{u.name} <span className="t-dom" style={{ fontWeight: 400 }}>· {u.dept}</span></div>
                <div className="muted">{u.status === "pending" ? "승인 대기" : "활성"} 사용자</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span className="muted" style={{ fontSize: 11 }}>보안등급</span>
                <div className="row" style={{ gap: 4 }}>{Object.keys(SECURITY).map((s) => (
                  <button key={s} className="secbtn" style={{ color: SECURITY[s].color, background: SECURITY[s].bg, opacity: u.sec === s ? 1 : 0.45, boxShadow: u.sec === s ? `0 0 0 2px ${SECURITY[s].color}` : "none" }}
                    onClick={() => { setUsers((p) => p.map((x) => x.id === u.id ? { ...x, sec: s } : x)); flash(`${u.name} → ${SECURITY[s].label}`); }}>{s}</button>
                ))}</div>
              </div>
              {u.status === "pending"
                ? <button className="btn btn-approve" onClick={() => { setUsers((p) => p.map((x) => x.id === u.id ? { ...x, status: "active" } : x)); flash(`${u.name} 승인 완료 · ${SECURITY[u.sec].label}`); }}>승인</button>
                : <span className="status" style={{ color: "#22A06B", background: "#E4F6EE" }}>활성</span>}
            </div>
          ))}</div>
        </section>
      )}

      {sub === "category" && (
        <section className="card">
          <Eyebrow kr="카테고리 관리" en={`CATEGORY · ${categories.length}`} />
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#7C789E" }}>여기서 만든 카테고리가 도메인 등록 폼의 선택지로 표시됩니다.</p>
          <div className="row gap2" style={{ marginBottom: 12 }}>
            <input className="input" style={{ flex: 1 }} value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} placeholder="새 카테고리 입력 (예: 음성·오디오)" />
            <button className="btn btn-p" onClick={addCat}><Plus size={16} /> 추가</button>
          </div>
          <div className="chips">
            {categories.map((c) => {
              const used = tools.filter((t) => t.cat === c).length;
              return (
                <span key={c} className="row gap2" style={{ background: "#F2F1FA", borderRadius: 999, padding: "6px 8px 6px 14px", fontSize: 12, fontWeight: 600, color: "#5B5780" }}>
                  {c}<span className="mono" style={{ fontSize: 10, color: "#9C99B8" }}>{used}</span>
                  <button className="iconbtn" style={{ width: 22, height: 22, background: "#E6E2FA" }} title="삭제"
                    onClick={() => { setCategories((p) => p.filter((x) => x !== c)); flash(`'${c}' 삭제됨`); }}><X size={12} color="#6C4FE0" /></button>
                </span>
              );
            })}
          </div>
        </section>
      )}

      {sub === "sec" && (
        <section className="card">
          <Eyebrow kr="보안등급 설정" en="SECURITY LEVEL" />
          <div className="row gap2" style={{ marginBottom: 16 }}>
            {Object.entries(SECURITY).map(([k, s]) => (
              <div key={k} className="seccard" style={{ flex: 1, background: s.bg }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.label}</div>
                <div style={{ marginTop: 2, fontSize: 11, color: "#7C789E" }}>{k === "S1" ? "외부 공유 가능" : k === "S2" ? "사내 데이터" : "기밀·승인 필요"}</div>
              </div>
            ))}
          </div>
          <div className="stack" style={{ gap: 8 }}>{tools.filter((t) => t.status === "approved").map((t) => (
            <div key={t.id} className="listrow">
              <div style={{ flex: 1 }} className="t-name">{t.name} <span className="t-dom mono" style={{ fontWeight: 400 }}>· {t.domain}</span></div>
              <div className="row" style={{ gap: 4 }}>{Object.keys(SECURITY).map((s) => (
                <button key={s} className="secbtn" style={{ color: SECURITY[s].color, background: SECURITY[s].bg, opacity: t.sec === s ? 1 : 0.45, boxShadow: t.sec === s ? `0 0 0 2px ${SECURITY[s].color}` : "none" }}
                  onClick={() => { setTools((p) => p.map((x) => x.id === t.id ? { ...x, sec: s } : x)); flash(`${t.name} → ${SECURITY[s].label}`); }}>{s}</button>
              ))}</div>
            </div>
          ))}</div>
        </section>
      )}

      {sub === "settings" && (
        <section className="card" style={{ maxWidth: 460 }}>
          <Eyebrow kr="관리자 비밀번호 변경" en="PASSWORD" />
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#7C789E" }}>관리자 모드 진입 시 사용하는 비밀번호입니다.</p>
          <div className="stack" style={{ gap: 12 }}>
            <Field label="현재 비밀번호"><input className="input" type="password" value={pwf.cur} onChange={(e) => setPwf({ ...pwf, cur: e.target.value })} placeholder="••••••" /></Field>
            <Field label="새 비밀번호"><input className="input" type="password" value={pwf.n1} onChange={(e) => setPwf({ ...pwf, n1: e.target.value })} placeholder="••••••" /></Field>
            <Field label="새 비밀번호 확인"><input className="input" type="password" value={pwf.n2} onChange={(e) => setPwf({ ...pwf, n2: e.target.value })} placeholder="••••••" onKeyDown={(e) => e.key === "Enter" && changePw()} /></Field>
          </div>
          <button className="fsubmit" style={{ width: "100%", marginTop: 16 }} onClick={changePw}>비밀번호 변경</button>
        </section>
      )}
    </div>
  );
}
