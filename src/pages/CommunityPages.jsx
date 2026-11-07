import React, { useState } from "react";
import { Eye, MessageCircle, ThumbsUp, Flame, Send, ChevronRight } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, SectionHead, Breadcrumb } from "../components/ui.jsx";
import { NotFoundPage } from "./StaticPages.jsx";

export const COMMU_TABS = ["전체", "이용 후기", "공간 추천", "데이트 추천", "생일·파티", "가족모임", "키즈모임", "스파 후기", "비추천 후기", "호스트 Q&A", "지역별 추천"];

/* 운영 샘플 게시글 — 실제 커뮤니티 백엔드 연동 전까지의 예시 */
export const POSTS = [
  { id: 1, tab: "이용 후기", region: "서울", title: "강남 프라이빗 사우나 유형 이용 팁 정리 (예약 전 꼭 보세요)", author: "휴식장인", views: 1240, comments: 18, likes: 46, photo: true, body: "프라이빗 사우나를 고를 때 제가 확인하는 순서예요. 1) 독립룸인지 단독대관인지, 2) 샤워실이 룸 안에 있는지, 3) 수건·어메니티 제공 여부, 4) 커플 이용 가능 여부. 특히 두 번째가 만족도를 크게 좌우하더라고요. 예약 전 전화로 '샤워실이 룸 내부에 있나요?' 한 마디만 물어봐도 실패 확률이 확 줄어요." },
  { id: 2, tab: "생일·파티", region: "서울", title: "20명 생일파티, 올인원 파티룸 고르는 기준 공유합니다", author: "파티플래너J", views: 980, comments: 12, likes: 33, photo: true, body: "20명 규모면 최소 25인 정원 공간을 잡는 게 좋아요. 테이블 세팅하면 체감 공간이 확 줄거든요. 노래방 기기 유무, 주류 반입 규정, 주차 대수 이 세 가지는 예약 전 필수 확인!" },
  { id: 3, tab: "키즈모임", region: "경기", title: "아이 4명 데리고 프라이빗 워터룸 다녀온 솔직 후기", author: "쌍둥이맘", views: 1520, comments: 24, likes: 58, photo: true, body: "수온이 제일 중요해요. 예약 전에 '수온 몇 도로 맞춰주시나요?' 꼭 물어보세요. 34도 이상이면 아이들이 오래 놀아도 안 추워요. 수건은 인당 2장씩 챙겨가면 넉넉합니다." },
  { id: 4, tab: "데이트 추천", region: "서울", title: "기념일 데이트 코스: 프라이빗 시네마 + 룸 다이닝 조합", author: "로맨틱가이", views: 860, comments: 9, likes: 27, photo: false, body: "저녁 6시 프라이빗 키친에서 쿠킹 클래스 → 8시 시네마룸에서 영화 한 편. 이동 동선만 가까우면 최고의 조합이에요. 홍대·연남 쪽에 붙어있는 곳이 많아요." },
  { id: 5, tab: "스파 후기", region: "부산", title: "1인 세신 처음 가봤는데 신세계네요 (부산 기준 가격대 공유)", author: "부산토박이", views: 1130, comments: 15, likes: 41, photo: false, body: "코스별로 6~18만원 선인데, 처음이면 기본 코스로 충분해요. 관리사 지정 가능 여부와 여성 전용 시간대 운영 여부를 미리 확인하면 훨씬 편하게 이용할 수 있습니다." },
  { id: 6, tab: "호스트 Q&A", region: "전국", title: "[호스트] 파티룸 운영 3년차, 예약률 올린 방법 공유", author: "공간사장님", views: 2210, comments: 31, likes: 74, photo: false, body: "사진이 절반입니다. 대표 사진을 낮/밤 두 버전으로 준비하고, 인원별 세팅 예시 사진을 올려두면 문의가 확실히 늘어요. 프빗 호스트 등록하면서 사진 가이드 받은 게 도움이 됐습니다." },
  { id: 7, tab: "비추천 후기", region: "서울", title: "'독립룸'이라더니 복도 공유... 예약 전 이것만은 확인하세요", author: "솔직리뷰어", views: 1890, comments: 27, likes: 63, photo: false, body: "독립룸이라고 해서 갔는데 복도와 화장실을 다른 팀과 공유하는 구조였어요. '화장실이 룸 전용인가요?'라고 꼭 물어보세요. 프라이빗의 기준이 업체마다 달라서 확인이 필수입니다." },
  { id: 8, tab: "지역별 추천", region: "제주", title: "제주 독채 유형 총정리 — 가족여행 vs 커플여행 기준", author: "제주살이3년", views: 1420, comments: 19, likes: 52, photo: true, body: "가족여행이면 마당 있는 단층 독채, 커플이면 오션뷰 복층이 만족도가 높아요. 겨울엔 난방비 별도인 곳이 있으니 예약 전 확인하세요." },
];

function PostCard({ post }) {
  return (
    <Link to={`/community/${post.id}`} className="pv-card w-full" style={{ display: "block", textDecoration: "none", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
      <div className="flex items-center gap-2" style={{ fontSize: 11.5, fontWeight: 800 }}>
        <span style={{ color: C.violet, background: C.violetSoft, padding: "3px 9px", borderRadius: 999 }}>{post.tab}</span>
        <span style={{ color: C.sub }}>{post.region}</span>
        {post.photo && <span className="flex items-center gap-1" style={{ color: C.sub }}><Eye size={11} /> 사진</span>}
      </div>
      <div className="pv-clamp2" style={{ fontWeight: 800, fontSize: 15.5, color: C.ink, marginTop: 9, lineHeight: 1.45 }}>{post.title}</div>
      <div className="flex items-center gap-3" style={{ fontSize: 12, color: C.sub, marginTop: 10 }}>
        <span>{post.author}</span>
        <span className="flex items-center gap-1"><Eye size={11} /> {post.views.toLocaleString()}</span>
        <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.comments}</span>
        <span className="flex items-center gap-1"><ThumbsUp size={11} /> {post.likes}</span>
      </div>
    </Link>
  );
}

export function CommunityPage() {
  const [tab, setTab] = useState("전체");
  const list = tab === "전체" ? POSTS : POSTS.filter((p) => p.tab === tab);
  const hot = [...POSTS].sort((a, b) => b.views - a.views).slice(0, 4);
  useSEO({
    title: "프라이빗 공간 커뮤니티 — 이용 후기, 비추천 후기, 호스트 Q&A",
    description: "파티룸·사우나·키즈룸·시네마룸 실제 이용 후기와 실패 후기, 데이트·생일·가족모임 공간 추천, 호스트 운영 노하우를 나누는 프빗 커뮤니티입니다.",
    path: "/community",
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "커뮤니티", path: "/community" }])],
  });
  return (
    <Container className="py-8">
      <SectionHead eyebrow="COMMUNITY" title="프라이빗 공간 커뮤니티" sub="실패 없는 선택을 위한 진짜 이용 정보 (아래 글은 운영 샘플이에요)" as="h1" />
      <div className="flex gap-1.5" style={{ overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
        {COMMU_TABS.map((t) => <button key={t} className={`pv-chip ${tab === t ? "on" : ""}`} onClick={() => setTab(t)} style={{ flexShrink: 0 }}>{t}</button>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.length ? list.map((p) => <PostCard key={p.id} post={p} />) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: `1px solid ${C.line}`, color: C.sub, fontSize: 14 }}>이 게시판의 첫 글을 기다리고 있어요 ✍️</div>
          )}
        </div>
        <aside>
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, position: "sticky", top: 80 }}>
            <div className="flex items-center gap-1.5" style={{ fontWeight: 900, fontSize: 15, color: C.ink, marginBottom: 12 }}><Flame size={16} color={C.coral} /> 지금 인기 글</div>
            {hot.map((p, i) => (
              <Link key={p.id} to={`/community/${p.id}`} className="w-full flex gap-2.5" style={{ textDecoration: "none", padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: i < 2 ? C.coral : C.sub, width: 18, flexShrink: 0 }}>{i + 1}</span>
                <span className="pv-clamp2" style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.45 }}>{p.title}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </Container>
  );
}

export function PostPage({ id }) {
  const { notify } = useApp();
  const p = POSTS.find((x) => String(x.id) === String(id));
  if (!p) return <NotFoundPage />;
  const [comments, setComments] = useState([{ who: "익명", text: "정보 감사합니다! 저장해둘게요." }, { who: "예비이용자", text: "덕분에 예약 전에 물어볼 것 정리했어요." }]);
  const [input, setInput] = useState("");
  const [liked, setLiked] = useState(false);
  const related = POSTS.filter((x) => x.id !== p.id && x.tab === p.tab).slice(0, 3);
  useSEO({
    title: p.title,
    description: p.body.slice(0, 150),
    path: `/community/${p.id}`,
    type: "article",
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "커뮤니티", path: "/community" }, { name: p.tab, path: "/community" }])],
  });
  const add = () => { if (input.trim()) { setComments([...comments, { who: "나", text: input.trim() }]); setInput(""); } };
  return (
    <Container className="py-8">
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "커뮤니티", to: "/community" }, { name: p.tab }]} />
        <div className="flex items-center gap-2" style={{ fontSize: 12, fontWeight: 800 }}>
          <span style={{ color: C.violet, background: C.violetSoft, padding: "4px 10px", borderRadius: 999 }}>{p.tab}</span>
          <span style={{ color: C.sub }}>{p.region}</span>
        </div>
        <h1 style={{ fontSize: "clamp(20px, 3.6vw, 28px)", fontWeight: 900, color: C.ink, lineHeight: 1.35, margin: "12px 0 8px" }}>{p.title}</h1>
        <div className="flex items-center gap-3" style={{ fontSize: 13, color: C.sub, paddingBottom: 16, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontWeight: 700 }}>{p.author}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {p.views.toLocaleString()}</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} /> {comments.length}</span>
        </div>
        <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.85, padding: "22px 0" }}>{p.body}</p>
        <div className="flex justify-center" style={{ paddingBottom: 22, borderBottom: `1px solid ${C.line}` }}>
          <button className={`pv-btn ${liked ? "pv-primary" : "pv-ghost"}`} style={{ padding: "11px 26px", borderRadius: 999, fontSize: 14 }} onClick={() => { setLiked(!liked); notify(liked ? "추천을 취소했어요" : "이 글을 추천했어요 👍"); }}>
            <ThumbsUp size={15} /> 추천 {p.likes + (liked ? 1 : 0)}
          </button>
        </div>
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 16.5, color: C.ink, marginBottom: 12 }}>댓글 {comments.length}</div>
          {comments.map((cm, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 13, padding: "13px 16px", marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: C.ink }}>{cm.who}</div>
              <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>{cm.text}</div>
            </div>
          ))}
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <input className="pv-input" placeholder="따뜻한 댓글을 남겨주세요" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} aria-label="댓글" />
            <button className="pv-btn pv-primary" style={{ padding: "0 18px", borderRadius: 12, flexShrink: 0 }} onClick={add} aria-label="댓글 등록"><Send size={15} /></button>
          </div>
        </div>
        {related.length > 0 && (
          <div style={{ marginTop: 34 }}>
            <div style={{ fontWeight: 900, fontSize: 16.5, color: C.ink, marginBottom: 12 }}>함께 보면 좋은 글</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{related.map((r) => <PostCard key={r.id} post={r} />)}</div>
          </div>
        )}
        <Link to="/community" className="pv-link flex items-center gap-1" style={{ fontSize: 13.5, marginTop: 24 }}><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> 커뮤니티로</Link>
      </div>
    </Container>
  );
}
