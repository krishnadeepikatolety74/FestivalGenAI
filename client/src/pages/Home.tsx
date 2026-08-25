/* Reference-matched festival editorial UI. No duplicate modules, no clipart, no human imagery. */
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Download,
  Gift,
  Globe2,
  Home as HomeIcon,
  Image as ImageIcon,
  IndianRupee,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  Tags,
  Utensils,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { MapView } from "@/components/Map";

const asset = {
  hero: "/assets/festivalgen-hero.png",
  authSignin: "/assets/sign%20in.png",
  authSignup: "/assets/signup.png",
  banner: "/assets/function.png",
  inviteHappy: "/assets/invite-happy-portrait.jpg",
  inviteCelebration: "/assets/invite-celebration-portrait.jpg",
  inviteLights: "/assets/invite-lights-portrait.jpg",
};

const festivalPhotos = {
  Diwali: "/assets/festival-diwali.jpg",
  Dussehra: "/assets/festival-dussehra.jpg",
  Holi: "/assets/festival-holi.jpg",
  Pongal: "/assets/festival-pongal.jpg",
  Sankranti: "/assets/festival-sankranti.jpg",
  Eid: "/assets/festival-eid.jpg",
  Christmas: "/assets/festival-christmas.jpg",
};

type FestivalEvent = {
  name: string;
  aliases?: string;
  category: string;
  region: string;
  description: string;
  icon: string;
  dates: Record<number, string>;
};

const festivalCalendar: FestivalEvent[] = [
  { name: "Makar Sankranti", aliases: "Pongal · Lohri", category: "Harvest & New Year", region: "Pan-India", description: "A harvest celebration marking the Sun's movement into Makara.", icon: "☀", dates: { 2026: "2026-01-14", 2027: "2027-01-14" } },
  { name: "Pongal", category: "Harvest & New Year", region: "Tamil Nadu", description: "Tamil harvest thanksgiving celebrated over four joyful days.", icon: "🌾", dates: { 2026: "2026-01-15", 2027: "2027-01-15" } },
  { name: "Lohri", category: "Harvest & New Year", region: "Punjab", description: "A winter harvest festival centered around warmth, song and community.", icon: "🔥", dates: { 2026: "2026-01-13", 2027: "2027-01-13" } },
  { name: "Republic Day", category: "National", region: "India", description: "India celebrates the adoption of its Constitution.", icon: "🇮🇳", dates: { 2026: "2026-01-26", 2027: "2027-01-26" } },
  { name: "Vasant Panchami", category: "Religious & Cultural", region: "Pan-India", description: "A spring festival honoring learning, music and Saraswati.", icon: "🌼", dates: { 2026: "2026-01-23", 2027: "2027-02-11" } },
  { name: "Maha Shivaratri", category: "Religious & Cultural", region: "Pan-India", description: "A night of devotion dedicated to Lord Shiva.", icon: "🔱", dates: { 2026: "2026-02-15", 2027: "2027-03-06" } },
  { name: "Holi", category: "Religious & Cultural", region: "Pan-India", description: "The spring festival of colors, renewal and togetherness.", icon: "🎨", dates: { 2026: "2026-03-04", 2027: "2027-03-22" } },
  { name: "Ugadi", aliases: "Gudi Padwa", category: "Regional New Year", region: "Karnataka · Andhra Pradesh · Telangana", description: "The traditional New Year celebrated across the Deccan.", icon: "🌿", dates: { 2026: "2026-03-19", 2027: "2027-04-08" } },
  { name: "Gudi Padwa", category: "Regional New Year", region: "Maharashtra · Goa", description: "A Maharashtrian New Year marked by the raising of the gudi.", icon: "🚩", dates: { 2026: "2026-03-19", 2027: "2027-04-08" } },
  { name: "Eid-ul-Fitr", category: "Religious & Cultural", region: "Pan-India", description: "The celebration marking the end of Ramadan.", icon: "🌙", dates: { 2026: "2026-03-20", 2027: "2027-03-10" } },
  { name: "Ram Navami", category: "Religious & Cultural", region: "Pan-India", description: "A celebration of the birth of Lord Rama.", icon: "🏹", dates: { 2026: "2026-03-26", 2027: "2027-04-15" } },
  { name: "Mahavir Jayanti", category: "Religious & Cultural", region: "Pan-India", description: "Jain communities honor the birth of Lord Mahavira.", icon: "🪷", dates: { 2026: "2026-04-01", 2027: "2027-04-19" } },
  { name: "Baisakhi", category: "Harvest & New Year", region: "Punjab · Haryana", description: "A spring harvest and Sikh New Year celebration.", icon: "🌾", dates: { 2026: "2026-04-14", 2027: "2027-04-14" } },
  { name: "Vishu", category: "Regional New Year", region: "Kerala", description: "Malayali New Year celebrated with Vishukkani and family gatherings.", icon: "🌼", dates: { 2026: "2026-04-15", 2027: "2027-04-15" } },
  { name: "Bihu", category: "Harvest & New Year", region: "Assam", description: "Assam's spring harvest festival of music, dance and feasting.", icon: "🥁", dates: { 2026: "2026-04-14", 2027: "2027-04-14" } },
  { name: "Good Friday", category: "Religious & Cultural", region: "Pan-India", description: "A solemn Christian observance commemorating the crucifixion of Jesus.", icon: "✝", dates: { 2026: "2026-04-03", 2027: "2027-03-26" } },
  { name: "Easter", category: "Religious & Cultural", region: "Pan-India", description: "Christian communities celebrate the resurrection of Jesus.", icon: "🕊", dates: { 2026: "2026-04-05", 2027: "2027-03-28" } },
  { name: "Akshaya Tritiya", category: "Religious & Cultural", region: "Pan-India", description: "An auspicious day for new beginnings, giving and purchases.", icon: "✨", dates: { 2026: "2026-04-19", 2027: "2027-05-09" } },
  { name: "Buddha Purnima", category: "Religious & Cultural", region: "Pan-India", description: "A Buddhist festival commemorating the life of Gautama Buddha.", icon: "☸", dates: { 2026: "2026-05-01", 2027: "2027-05-20" } },
  { name: "Jagannath Rath Yatra", aliases: "Rath Yatra", category: "Religious & Cultural", region: "Odisha", description: "The grand chariot procession of Lord Jagannath in Puri.", icon: "🛕", dates: { 2026: "2026-07-16", 2027: "2027-07-05" } },
  { name: "Guru Purnima", category: "Religious & Cultural", region: "Pan-India", description: "A day of gratitude for teachers and spiritual guides.", icon: "📖", dates: { 2026: "2026-07-29", 2027: "2027-07-18" } },
  { name: "Eid-al-Adha", category: "Religious & Cultural", region: "Pan-India", description: "The festival of sacrifice and community sharing.", icon: "🌙", dates: { 2026: "2026-05-27", 2027: "2027-05-17" } },
  { name: "Raksha Bandhan", category: "Religious & Cultural", region: "Pan-India", description: "Siblings celebrate their bond with the tying of rakhi.", icon: "🧵", dates: { 2026: "2026-08-28", 2027: "2027-08-17" } },
  { name: "Krishna Janmashtami", category: "Religious & Cultural", region: "Pan-India", description: "A devotional celebration of Lord Krishna's birth.", icon: "🪈", dates: { 2026: "2026-09-04", 2027: "2027-08-25" } },
  { name: "Ganesh Chaturthi", category: "Religious & Cultural", region: "Maharashtra · Pan-India", description: "Communities welcome Lord Ganesha with prayer and celebration.", icon: "🐘", dates: { 2026: "2026-09-14", 2027: "2027-09-04" } },
  { name: "Onam", category: "Harvest & New Year", region: "Kerala", description: "Kerala's harvest festival with feasts, flowers and boat races.", icon: "🌸", dates: { 2026: "2026-08-26", 2027: "2027-09-12" } },
  { name: "Navratri", aliases: "Dussehra", category: "Religious & Cultural", region: "Pan-India", description: "Nine nights of devotion, dance and celebration of the divine feminine.", icon: "🪔", dates: { 2026: "2026-10-11", 2027: "2027-10-02" } },
  { name: "Durga Puja", category: "Religious & Cultural", region: "West Bengal · East India", description: "A magnificent celebration honoring Goddess Durga's victory.", icon: "🪷", dates: { 2026: "2026-10-18", 2027: "2027-10-09" } },
  { name: "Mysore Dasara", aliases: "Dussehra", category: "Grand Gathering", region: "Karnataka", description: "A royal Dasara procession and cultural celebration in Mysuru.", icon: "👑", dates: { 2026: "2026-10-20", 2027: "2027-10-12" } },
  { name: "Dussehra", category: "Religious & Cultural", region: "Pan-India", description: "The triumph of good over evil, celebrated with dramatic traditions.", icon: "🏹", dates: { 2026: "2026-10-20", 2027: "2027-10-12" } },
  { name: "Karwa Chauth", category: "Religious & Cultural", region: "North India", description: "A traditional day of prayer and family observance.", icon: "🌕", dates: { 2026: "2026-10-29", 2027: "2027-10-18" } },
  { name: "Diwali", aliases: "Deepavali", category: "Religious & Cultural", region: "Pan-India", description: "The festival of lights, prosperity and new beginnings.", icon: "🪔", dates: { 2026: "2026-11-08", 2027: "2027-10-29" } },
  { name: "Govardhan Puja", category: "Religious & Cultural", region: "North India", description: "A thanksgiving observance honoring Govardhan Hill and nature.", icon: "⛰", dates: { 2026: "2026-11-09", 2027: "2027-10-30" } },
  { name: "Bhai Dooj", category: "Religious & Cultural", region: "Pan-India", description: "Siblings gather to celebrate love and protection.", icon: "🎁", dates: { 2026: "2026-11-11", 2027: "2027-11-01" } },
  { name: "Chhath Puja", category: "Harvest & New Year", region: "Bihar · Jharkhand · Uttar Pradesh", description: "A devotional thanksgiving to the Sun and rivers.", icon: "🌅", dates: { 2026: "2026-11-15", 2027: "2027-11-05" } },
  { name: "Guru Nanak Jayanti", category: "Religious & Cultural", region: "Punjab · Pan-India", description: "Sikhs celebrate the birth anniversary of Guru Nanak Dev Ji.", icon: "☬", dates: { 2026: "2026-11-24", 2027: "2027-11-14" } },
  { name: "Hornbill Festival", category: "Grand Gathering", region: "Nagaland", description: "Nagaland's vibrant showcase of indigenous culture and crafts.", icon: "🪶", dates: { 2026: "2026-12-01", 2027: "2027-12-01" } },
  { name: "Pushkar Fair", category: "Grand Gathering", region: "Rajasthan", description: "A famed cultural fair blending pilgrimage, markets and camel trading.", icon: "🐪", dates: { 2026: "2026-11-17", 2027: "2027-11-04" } },
  { name: "Kumbh Mela", category: "Grand Gathering", region: "India · Rotating hosts", description: "A major pilgrimage gathering held in a rotating host city.", icon: "🕉", dates: { 2027: "2027-01-14" } },
  { name: "Milad-un-Nabi", category: "Religious & Cultural", region: "Pan-India", description: "Muslim communities commemorate the birth of Prophet Muhammad.", icon: "🌙", dates: { 2026: "2026-08-26", 2027: "2027-08-15" } },
  { name: "Christmas", category: "Religious & Cultural", region: "Pan-India", description: "Christian communities celebrate Christmas with prayer and togetherness.", icon: "🎄", dates: { 2026: "2026-12-25", 2027: "2027-12-25" } },
];

type PageKey =
  | "home"
  | "dashboard"
  | "plan"
  | "calendar"
  | "shopping"
  | "budget"
  | "recipes"
  | "rituals"
  | "nearby"
  | "reports"
  | "settings"
  | "signin"
  | "signup";

const navItems: { id: PageKey; label: string; icon: typeof HomeIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "plan", label: "My Plan", icon: CalendarDays },
  { id: "calendar", label: "Festival Calendar", icon: CalendarDays },
  { id: "shopping", label: "Shopping List", icon: ShoppingBasket },
  { id: "budget", label: "Budget Planner", icon: WalletCards },
  { id: "recipes", label: "Recipes", icon: Utensils },
  { id: "rituals", label: "Rituals & Puja", icon: Sparkles },
  { id: "nearby", label: "Nearby Stores", icon: MapPin },
  { id: "reports", label: "Reports", icon: Tags },
  { id: "settings", label: "Settings", icon: Settings },
];

function getPlanningProfile() {
  try {
    const input = JSON.parse(localStorage.getItem("festivalgen:last-plan-input") || "null");
    const settings = JSON.parse(localStorage.getItem("festivalgen:settings") || "null");
    return {
      festival: input?.festival || "",
      city: input?.city || settings?.city || "Not set",
      familySize: input?.familySize || "Not set",
      budget: input?.budget ? `₹${Number(input.budget).toLocaleString("en-IN")}` : "Not set",
      language: input?.language || settings?.language || "Not set",
    };
  } catch {
    return { festival: "", city: "Not set", familySize: "Not set", budget: "Not set", language: "Not set" };
  }
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`}>
      <span className="brand-mark" aria-label="UtsavMitra flower-star mark"><i /><i /><i /><i /><i /><i /><b /></span>
      <div>
        <div className="brand-name"><span>UtsavMitra</span></div>
        {!compact && <div className="brand-tagline">Your Personal AI Festival Planner</div>}
      </div>
    </div>
  );
}

function AppButton({
  children,
  variant = "primary",
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "soft" | "outline" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return <button type={type} onClick={onClick} className={`app-button app-button-${variant}`}>{children}</button>;
}

function AppSidebar({ current, onNavigate, onSignOut }: { current: PageKey; onNavigate: (page: PageKey) => void; onSignOut: () => void }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-top"><Logo compact /></div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`sidebar-item ${current === id ? "is-active" : ""}`} onClick={() => onNavigate(id)}>
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <div><strong>Happy Planning!</strong><span>Make your festival memorable with AI ✨</span></div>
        <span className="brand-mark brand-mark-small" aria-hidden="true"><i /><i /><i /><i /><i /><i /><b /></span>
      </div>
      <button className="sidebar-account" onClick={onSignOut}><CircleUserRound size={16} /> Sign out</button>
    </aside>
  );
}

function AppHeader({ onNavigate, userName }: { onNavigate: (page: PageKey) => void; userName: string }) {
  return (
    <header className="app-header">
      <div className="mobile-brand"><Logo compact /></div>
      <div className="header-actions">
        <button className="language-button"><Globe2 size={14} /> English <ChevronDown size={13} /></button>
        <button className="icon-button" aria-label="Notifications" onClick={() => toast("You’re all caught up") }><Bell size={17} /><span className="notification-dot" /></button>
        <button className="profile-button" onClick={() => onNavigate("settings")}><span className="profile-orb">{userName.charAt(0).toUpperCase()}</span><span>{userName}</span><ChevronDown size={13} /></button>
      </div>
    </header>
  );
}

function AppLayout({ current, onNavigate, children, onSignOut, userName = "there" }: { current: PageKey; onNavigate: (page: PageKey) => void; children: React.ReactNode; onSignOut: () => void; userName?: string }) {
  return (
    <div className="app-shell">
      <AppSidebar current={current} onNavigate={onNavigate} onSignOut={onSignOut} />
      <main className="app-main"><AppHeader onNavigate={onNavigate} userName={userName} /><div className="page-wrap">{children}</div></main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone, action, onClick }: { icon: typeof ShoppingBasket; label: string; value: string; detail: string; tone: string; action: string; onClick: () => void }) {
  return <div className={`metric-card metric-${tone}`}>
    <div className="metric-top"><span>{label}</span><Icon size={25} strokeWidth={1.7} /></div>
    <strong>{value}</strong><small>{detail}</small>
    <button onClick={onClick}>{action} <ArrowRight size={12} /></button>
  </div>;
}

function AnalyticsBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return <div className="analytics-bar-row"><span>{label}</span><div><i className={tone} style={{ width: `${max ? Math.max(4, value / max * 100) : 0}%` }} /></div><strong>{value}</strong></div>;
}

function AnalyticsDonut({ values, colors, center, label }: { values: number[]; colors: string[]; center: string; label: string }) {
  const total = values.reduce((sum, value) => sum + value, 0);
  let offset = 0;
  const segments = values.map((value, index) => { const start = offset; offset += total ? value / total * 100 : 0; return `${colors[index]} ${start}% ${offset}%`; });
  return <div className="analytics-donut-wrap"><div className="analytics-donut" style={{ background: total ? `conic-gradient(${segments.join(", ")})` : "#eee8f3" }}><div><strong>{center}</strong><small>{label}</small></div></div></div>;
}

function AnalyticsLineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  const pointsData = values.map((value, index) => ({
    x: index * (100 / Math.max(1, values.length - 1)),
    y: 92 - (value / max) * 70
  }));
  const points = pointsData.map(p => `${p.x},${p.y}`).join(" ");
  
  return (
    <div className="analytics-line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Timeline tasks by stage">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d252a0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#d252a0" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`M ${points} L 100 100 L 0 100 Z`} fill="url(#chartGradient)" />
        <polyline points={points} className="analytics-line" style={{ strokeWidth: 3 }} />
        {pointsData.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="#ffffff"
            stroke="#d252a0"
            strokeWidth="1.2"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" }}
          />
        ))}
      </svg>
      <div>{labels.map(label => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function timelineCategory(task: GeneratedPlanPreview["timeline"][number]) {
  const text = `${task.title} ${task.description}`.toLowerCase();
  if (text.includes("shop") || text.includes("buy") || text.includes("market")) return "Shopping";
  if (text.includes("cook") || text.includes("recipe") || text.includes("food")) return "Cooking";
  if (text.includes("puja") || text.includes("prayer") || text.includes("ritual")) return "Puja";
  if (text.includes("celebrat") || text.includes("festival") || text.includes("guest")) return "Celebration";
  return "Preparation";
}

const getFallbackFestivalPhoto = (festival: string) => {
  const fest = (festival || "").toLowerCase().trim();
  if (fest.includes("jagannath") || fest.includes("ratha yatra") || fest.includes("rath yatra")) return "/assets/jagannath_ratha_yatra.png";
  if (fest.includes("janmashtami") || fest.includes("krishna")) return "/assets/krishna_janmashtami.png";
  if (fest.includes("milad") || fest.includes("mawlid") || fest.includes("nabi")) return "/assets/festival-eid.jpg";
  if (fest.includes("eid-ul-fitr") || fest.includes("eid ul fitr")) return "/assets/eid_ul_fitr.png";
  if (fest.includes("eid")) return "/assets/eid.png";
  if (fest.includes("karwa chauth") || fest.includes("karwachauth")) return "/assets/karwa_chauth.png";
  if (fest.includes("diwali") || fest.includes("deepavali")) return "/assets/diwali.png";
  if (fest.includes("govardhan")) return "/assets/govardhan_puja.png";
  if (fest.includes("pongal")) return "/assets/pongal.png";
  if (fest.includes("navratri")) return "/assets/navratri.png";
  if (fest.includes("durga puja") || fest.includes("durgapuja")) return "/assets/durga_puja.png";
  if (fest.includes("mysore dasara")) return "/assets/mysore_dasara.png";
  if (fest.includes("dussehra") || fest.includes("dasara")) return "/assets/dussehra.png";
  if (fest.includes("bhai dooj")) return "/assets/bhai_dooj.png";
  if (fest.includes("chhath puja")) return "/assets/chhath_puja.png";
  if (fest.includes("pushkar fair")) return "/assets/pushkar_fair.png";
  if (fest.includes("guru nanak jayanti")) return "/assets/guru_nanak_jayanti.png";
  if (fest.includes("hornbill festival")) return "/assets/hornbill_festival.png";
  if (fest.includes("lohri")) return "/assets/lohri.png";
  if (fest.includes("makar sankranti")) return "/assets/makar_sankranti.png";
  if (fest.includes("vasant panchami")) return "/assets/vasant_panchami.png";
  if (fest.includes("republic day")) return "/assets/republic_day.png";
  if (fest.includes("kumbh mela")) return "/assets/kumbh_mela.png";
  if (fest.includes("maha shivaratri") || fest.includes("maha shivratri") || fest.includes("shivaratri") || fest.includes("shivratri")) return "/assets/maha_shivaratri.png";
  if (fest.includes("raksha bandhan") || fest.includes("rakhi")) return "/assets/bhai_dooj.png";
  if (fest.includes("holi")) return "/assets/holi.png";
  if (fest.includes("ugadi")) return "/assets/ugadi.png";
  if (fest.includes("gudi padwa")) return "/assets/gudi_padwa.png";
  if (fest.includes("ram navami")) return "/assets/ram_navami.png";
  if (fest.includes("mahavir jayanti")) return "/assets/mahavir_jayanti.png";
  if (fest.includes("good friday")) return "/assets/good_friday.png";
  if (fest.includes("easter")) return "/assets/easter.png";
  if (fest.includes("baisakhi")) return "/assets/baisakhi.png";
  if (fest.includes("bihu")) return "/assets/bihu.png";
  if (fest.includes("vishu")) return "/assets/vishu.png";
  if (fest.includes("akshaya tritiya")) return "/assets/akshaya_tritiya.png";
  if (fest.includes("buddha purnima")) return "/assets/buddha_purnima.png";
  
  if (fest.includes("onam")) return "/assets/festival-onam.jpg";
  if (fest.includes("christmas")) return "/assets/festival-christmas.jpg";
  if (fest.includes("sankranti") || fest.includes("gudi") || fest.includes("padwa") || fest.includes("baisakhi") || fest.includes("bihu")) return "/assets/festival-sankranti.jpg";
  return "/assets/festivalgen-hero.png";
};

function Dashboard({ onNavigate, onCreatePlan, userName }: { onNavigate: (page: PageKey) => void; onCreatePlan: (festival: string) => void; userName: string }) {
  const profile = getPlanningProfile();
  const upcoming = getUpcomingFestival(profile.festival);
  const upcomingDate = upcoming?.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const daysRemaining = upcoming ? Math.max(0, Math.ceil((upcoming.date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)) : null;
  const localPlan = readGeneratedPlan();
  const latestPlanQuery = trpc.plans.latest.useQuery(undefined, { refetchOnMount: "always" });
  const apiPlan = useMemo(() => {
    if (!latestPlanQuery.data?.planJson) return null;
    try { return { plan: JSON.parse(latestPlanQuery.data.planJson) as GeneratedPlanPreview, budget: latestPlanQuery.data.budget, festival: latestPlanQuery.data.festival, city: latestPlanQuery.data.city, imageUrl: (latestPlanQuery.data as any).imageUrl }; } catch { return null; }
  }, [latestPlanQuery.data]);
  const savedPlan = apiPlan?.plan || localPlan;

  const selectedFestival = apiPlan?.festival || profile.festival;
  const festivalImage = apiPlan?.imageUrl || getFallbackFestivalPhoto(selectedFestival);

  if (!savedPlan && latestPlanQuery.isLoading) return <div className="dashboard-page"><div className="analytics-empty">Loading your festival plan...</div></div>;
  if (!savedPlan) return <div className="dashboard-page dashboard-empty-state"><section className="upcoming-card"><div className="card-kicker">Upcoming Festival</div><h3>{upcoming?.event.name || "No upcoming festival"} <span>{upcoming?.event.icon || "✨"}</span></h3><div className="date-chip">{upcomingDate || "Check the calendar"}</div><p className="days-count">{daysRemaining === null ? "Plan your next celebration" : `${daysRemaining} Days to go!`}</p>{upcoming && <img className="upcoming-card-art" src={getFallbackFestivalPhoto(upcoming.event.name)} alt={upcoming.event.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", marginTop: "10px", marginBottom: "10px" }} /> }<div className="upcoming-details"><span><MapPin size={15} /> {profile.city}</span><span><CircleUserRound size={15} /> Family Size: {profile.familySize}{profile.familySize !== "Not set" && " Members"}</span><span><IndianRupee size={15} /> Budget: {profile.budget}</span><span><Globe2 size={15} /> Language: {profile.language}</span></div><AppButton variant="soft" onClick={() => onCreatePlan(upcoming?.event.name || "Diwali")}>Create Festival Plan <ArrowRight size={14} /></AppButton></section><div className="analytics-empty"><span>🎉</span><h2>No festival plan yet</h2><p>Create your first festival plan to see your analytics here.</p><AppButton onClick={() => onNavigate("plan")}>Create Festival Plan <ArrowRight size={14} /></AppButton></div></div>;

  const recipes = savedPlan.recipes || [];
  const rituals = savedPlan.rituals || [];
  const shopping = savedPlan.shoppingList || [];
  const invitations = savedPlan.invitations || [];
  const timeline = savedPlan.timeline || [];
  const budget = savedPlan.budget || [];
  const recipeCategories = ["Main Course", "Dessert", "Sweet", "Drink"].map(category => ({ category, count: recipes.filter(recipe => recipe.category === category).length }));
  const purchased = shopping.filter(item => Boolean((item as { purchased?: boolean; status?: string }).purchased || (item as { status?: string }).status === "Purchased")).length;
  const completedRituals = rituals.filter(ritual => (ritual as { status?: string }).status === "Completed").length;
  const plannedSpending = budget.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalBudget = apiPlan?.budget || (profile.budget === "Not set" ? plannedSpending : Number(profile.budget.replace(/[^0-9]/g, "")));
  const timelineGroups = ["Preparation", "Shopping", "Cooking", "Puja", "Celebration"].map(group => ({ group, count: timeline.filter(task => `${task.title} ${task.description}`.toLowerCase().includes(group.toLowerCase())).length }));

  return (
    <div className="dashboard-page">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">Your personal festival planner</p>
          <h1>Welcome back, {userName}! <span>👋</span></h1>
          <p className="muted">Let’s plan your perfect festival</p>
        </div>
        <div className="welcome-shortcuts">
          <button className="language-button">📅 {selectedFestival || "Select Festival"}</button>
          <button className="icon-button"><Bell size={17} /></button>
        </div>
      </div>
      <section className="dashboard-top-grid">
        <section className="upcoming-card">
          <div className="card-kicker">Upcoming Festival</div>
          <h3>{upcoming?.event.name || "No upcoming festival"} <span>{upcoming?.event.icon || "✨"}</span></h3>
          <div className="date-chip">{upcomingDate || "Check the calendar"}</div>
          <p className="days-count">{daysRemaining === null ? "Plan your next celebration" : `${daysRemaining} Days to go!`}</p>
          {upcoming && (
            <img
              className="upcoming-card-art"
              src={festivalImage}
              alt={upcoming.event.name}
              style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", marginTop: "10px", marginBottom: "10px" }}
            />
          )}
          <div className="upcoming-details">
            <span><MapPin size={15} /> {profile.city}</span>
            <span><CircleUserRound size={15} /> Family Size: {profile.familySize}{profile.familySize !== "Not set" && " Members"}</span>
            <span><IndianRupee size={15} /> Budget: {profile.budget}</span>
            <span><Globe2 size={15} /> Language: {profile.language}</span>
          </div>
          <AppButton variant="soft" onClick={() => onCreatePlan(upcoming?.event.name || "Diwali")}>View Full Plan</AppButton>
        </section>
        <section className="dashboard-art-card" aria-label="Festival artwork">
          <img className="dashboard-art" src={festivalImage} alt="Festival celebration" />
        </section>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>📊 Festival Plan Overview</h2>
          </div>
          <button className="text-action" onClick={() => onNavigate("reports")}>View report <ArrowRight size={14} /></button>
        </div>
        <div className="metric-grid analytics-metrics"><MetricCard icon={Utensils} label="Recipes" value={String(recipes.length)} detail="Generated recipes" tone="saffron" action="View Recipes" onClick={() => onNavigate("recipes")} /><MetricCard icon={Sparkles} label="Rituals & Puja" value={String(rituals.length)} detail="Generated rituals" tone="violet" action="View Guide" onClick={() => onNavigate("rituals")} /><MetricCard icon={ShoppingBasket} label="Shopping Items" value={String(shopping.length)} detail="Generated items" tone="pink" action="View List" onClick={() => onNavigate("shopping")} /><MetricCard icon={Mail} label="Invitations" value={String(invitations.length)} detail="Content items" tone="rose" action="View Invites" onClick={() => toast("Invitation content is included in your generated plan")} /><MetricCard icon={CalendarDays} label="Timeline Tasks" value={String(timeline.length)} detail="Preparation tasks" tone="blue" action="View Timeline" onClick={() => toast("Timeline tasks are included in your generated plan")} /><MetricCard icon={WalletCards} label="Budget" value={`₹${totalBudget.toLocaleString("en-IN")}`} detail="Planned spending" tone="mint" action="View Budget" onClick={() => onNavigate("budget")} /></div>
        <div className="dashboard-chart-grid"><section className="analytics-card"><div className="analytics-card-heading"><div><span className="card-kicker">Recipe distribution</span><h3>🍛 Recipes by Category</h3></div><AnalyticsDonut values={recipeCategories.map(item => item.count)} colors={["#b99ae8", "#f5c979", "#f3a7c8", "#91d9c4"]} center={String(recipes.length)} label="Total Recipes" /></div><div className="analytics-legend">{recipeCategories.map((item, index) => <span key={item.category}><i style={{ background: ["#b99ae8", "#f5c979", "#f3a7c8", "#91d9c4"][index] }} />{item.category}<b>{item.count}</b></span>)}</div></section><section className="analytics-card"><div className="analytics-card-heading"><div><span className="card-kicker">Shopping List Overview</span><h3>🛍️ Purchased vs Pending</h3></div><AnalyticsDonut values={[purchased, shopping.length - purchased]} colors={["#91d9c4", "#f3a7c8"]} center={String(shopping.length)} label="Total Items" /></div><div className="analytics-bars"><AnalyticsBar label="Purchased" value={purchased} max={shopping.length} tone="mint" /><AnalyticsBar label="Pending" value={shopping.length - purchased} max={shopping.length} tone="pink" /></div></section><section className="analytics-card"><div className="analytics-card-heading"><div><span className="card-kicker">Budget Breakdown</span><h3>💰 Budget by Category</h3></div><strong className="analytics-total">₹{plannedSpending.toLocaleString("en-IN")}</strong></div><div className="analytics-bars">{["Food", "Shopping", "Decorations", "Puja", "Other"].map((category, index) => { const item = budget.find(entry => entry.category.toLowerCase().includes(category.toLowerCase())); const amount = Number(item?.amount || 0); return <AnalyticsBar key={category} label={category} value={amount} max={Math.max(totalBudget, plannedSpending)} tone={["saffron", "pink", "violet", "mint", "blue"][index]} />; })}</div></section><section className="analytics-card"><div className="analytics-card-heading"><div><span className="card-kicker">Preparation Timeline</span><h3>📅 Timeline Progress</h3></div><strong className="analytics-total">{timeline.length}</strong></div><AnalyticsLineChart values={timelineGroups.map(item => item.count)} labels={timelineGroups.map(item => item.group)} /></section></div>
      </section>
    </div>
  );
}


function Landing({ onNavigate, onSection, onCreatePlan }: { onNavigate: (page: PageKey) => void; onSection: (section: string) => void; onCreatePlan: (festival: string) => void }) {
  const howItWorks = [["🌸", "Choose Your Festival", "Select from our festival calendar and choose your celebration."], ["✨", "Tell Us Your Preferences", "Add your city, family size, budget, language and preferences."], ["🤖", "Let AI Plan Everything", "Groq AI creates your rituals, recipes, shopping list, budget and timeline."], ["🎉", "Celebrate Stress-Free", "Follow your organized plan and enjoy the festival with your family."]];
  const features = [["🪔", "Festival Planning", "Personalized plans for different Indian festivals."], ["🛍️", "Smart Shopping", "Festival-specific shopping lists and special items."], ["🍛", "Festival Recipes", "Traditional recipes with ingredients and preparation steps."], ["🙏", "Rituals & Puja", "Important festival-specific rituals and puja information."], ["💰", "Budget Planning", "Organize your festival expenses within your budget."], ["💌", "Invitations", "Create festival-specific invitations and social content."], ["📅", "Festival Calendar", "Discover upcoming festivals and important dates."], ["⏰", "Preparation Timeline", "Follow a day-by-day preparation plan."]];
  const aboutItems = [["🌺", "Celebrate Traditions", "Preserve meaningful traditions."], ["🤖", "Powered by AI", "AI organizes the practical details."], ["👨‍👩‍👧‍👦", "Made for Families", "Plan celebrations together."], ["✨", "Everything in One Place", "Recipes, rituals, shopping, budget, invitations and timeline."]];
  const faqs = [["❓", "What can FestivalGen AI plan?", "Shopping, budgets, recipes, rituals, invitations and a preparation timeline."], ["📅", "Which festivals are supported?", "Explore major Indian festivals including Diwali, Holi, Pongal, Eid, Christmas and more."], ["📍", "Can I choose my city?", "Yes. Your city helps personalize shopping suggestions and local planning."], ["👨‍👩‍👧‍👦", "Can I specify family size?", "Yes. Add your family size so recipes, quantities and budgets fit your celebration."], ["💰", "Can I set my budget?", "Yes. FestivalGen can organize your plan around the budget you provide."], ["🌐", "Can I choose my language?", "Choose from the available languages while creating your festival plan."], ["🤖", "How does the AI generate my plan?", "Groq AI uses your festival, preferences and planning details to create a tailored plan."], ["🔒", "Is my personal information safe?", "Your account and festival planning details are kept private in your session."]];
  return <div className="landing-page">
    <header className="landing-nav"><Logo /><nav><button className="is-current" onClick={() => onSection("home")}>Home</button><button onClick={() => onSection("features")}>Features</button><button onClick={() => onSection("how-it-works")}>How It Works</button><button onClick={() => onSection("about")}>About Us</button><button onClick={() => onSection("faqs")}>FAQs</button><button onClick={() => onSection("contact")}>Contact</button></nav><div className="landing-actions"><button className="language-button"><Globe2 size={15} /> English <ChevronDown size={13} /></button><AppButton variant="outline" onClick={() => onNavigate("signin")}>Sign In</AppButton><AppButton onClick={() => onNavigate("signup")}>Sign Up</AppButton></div><button className="mobile-menu" onClick={() => onSection("features")} aria-label="Open landing page sections"><Menu size={20} /></button></header>
    <section className="landing-hero" id="home"><img className="landing-hero-image" src={asset.hero} alt="Diwali lights and diyas arranged for a festival celebration" /><div className="landing-copy"><span className="hero-pill"><Sparkles size={13} /> AI-Powered <b>•</b> Personalized <b>•</b> Smart</span><h1>Plan Your Festival,<br /><em>The Smart Way with AI</em></h1><p>FestivalGen AI creates a complete, personalized festival plan for you—from shopping and budgeting to recipes, rituals, invitations and a day-by-day preparation timeline.</p><div className="trust-row"><span><CircleUserRound size={16} /> Personalized for You</span><span><Clock3 size={16} /> Save Time & Money</span><span><Sparkles size={16} /> AI Powered Planning</span></div><div className="landing-cta"><AppButton onClick={() => onNavigate("signup")}>Get Started Free <ArrowRight size={16} /></AppButton><AppButton variant="outline" onClick={() => onSection("features")}>Explore Features <ChevronRight size={16} /></AppButton></div><div className="social-proof"><div className="proof-orbs"><span>✦</span><span>✿</span><span>◈</span><span>❈</span></div><span>Trusted by 5,000+ families across India <b>♥</b></span></div></div></section>
    <section className="festival-strip" id="festivals"><div className="strip-heading"><div><h2>Plan for Any Festival <span>🪔</span></h2><p>Choose your festival and let AI handle the rest</p></div><button className="soft-link" onClick={() => onSection("festivals")}>▦ &nbsp; View All Festivals</button></div><div className="festival-cards">{[["Diwali","Festival of Lights","peach",festivalPhotos.Diwali],["Dussehra","Victory of Good","cream",festivalPhotos.Dussehra],["Holi","Festival of Colors","pink",festivalPhotos.Holi],["Pongal","Harvest Festival","mint",festivalPhotos.Pongal],["Sankranti","Sun’s Transition","blue",festivalPhotos.Sankranti],["Eid","Festival of Peace","aqua",festivalPhotos.Eid],["Christmas","Celebrate Together","lilac",festivalPhotos.Christmas]].map(([name, sub, tone, image]) => <button key={name} className={`festival-card ${tone}`} onClick={() => onCreatePlan(name as string)}><img src={image as string} alt={`${name} festival`} onError={(event) => { event.currentTarget.style.display = "none"; }} /><strong>{name}</strong><small>{sub}</small></button>)}</div></section>
    <section className="landing-feature-section" id="features"><div className="feature-band-title"><span>❧</span><div><p className="eyebrow">Made for your celebration</p><h2>Everything You Need, All in One Place</h2></div><span>❧</span></div><div className="landing-feature-grid">{features.map(([emoji, title, copy]) => <article className="landing-feature-card" key={title}><span className="landing-card-emoji">{emoji}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></section>
    <section className="landing-info-band how-it-works-section" id="how-it-works"><div className="landing-section-heading"><p className="eyebrow">A calmer way to prepare</p><h2>From first idea to festival day</h2><p>Four simple steps to bring every detail of your celebration together.</p></div><div className="how-steps">{howItWorks.map(([emoji, title, copy], index) => <article className="how-step-card" key={title}><span className="step-number">0{index + 1}</span><span className="landing-card-emoji">{emoji}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="landing-info-grid about-section" id="about"><div className="landing-section-heading"><p className="eyebrow">About FestivalGen AI</p><h2>Tradition, thoughtfully organized.</h2><p>A little structure for the practical details, so families can spend more time being together.</p></div><div className="about-card-grid">{aboutItems.map(([emoji, title, copy]) => <article className="about-card" key={title}><span className="landing-card-emoji">{emoji}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></section>
    <section className="landing-info-band faq-section" id="faqs"><div className="landing-section-heading"><p className="eyebrow">Questions, answered simply</p><h2>Everything you need to know</h2></div><div className="faq-list">{faqs.map(([emoji, question, answer]) => <details className="faq-card" key={question}><summary><span>{emoji}</span>{question}<ChevronDown size={15} /></summary><p>{answer}</p></details>)}</div></section>
    <section className="landing-contact" id="contact"><div className="landing-section-heading"><p className="eyebrow">Get in touch</p><h2>Let’s make the next celebration easier.</h2><p>Have questions or suggestions about FestivalGen AI? We’d love to hear from you.</p></div><div className="contact-layout"><div className="contact-card-grid"><a className="contact-card" href="mailto:hello@festivalgen.ai"><span className="landing-card-emoji">📧</span><strong>Email</strong><small>hello@festivalgen.ai</small></a><a className="contact-card" href="mailto:support@festivalgen.ai"><span className="landing-card-emoji">💬</span><strong>Support</strong><small>We’re here to help</small></a><div className="contact-card"><span className="landing-card-emoji">📱</span><strong>Contact</strong><small>Mon–Fri, 9am–6pm</small></div><div className="contact-card"><span className="landing-card-emoji">📍</span><strong>India</strong><small>Made for Indian families</small></div></div><form className="contact-form" onSubmit={event => { event.preventDefault(); toast.success("Thanks for reaching out to FestivalGen AI"); event.currentTarget.reset(); }}><input name="name" placeholder="Your name" aria-label="Your name" required /><input name="email" type="email" placeholder="Your email" aria-label="Your email" required /><textarea name="message" placeholder="How can we help?" aria-label="How can we help?" rows={3} required /><AppButton type="submit">Send Message <ArrowRight size={14} /></AppButton></form></div></section>
    <section className="stats-strip">{[["5,000+","Happy Families",CircleUserRound,"violet"],["50+","Festivals Covered",Star,"saffron"],["100+","Cities Supported",MapPin,"pink"],["10,000+","Plans Generated",WalletCards,"purple"],["100%","Secure & Private",LockKeyhole,"mint"]].map(([value, label, Icon, tone]) => <div key={label as string}><span className={`stat-icon ${tone}`}><Icon size={20} /></span><strong>{value as string}</strong><small>{label as string}</small></div>)}</section>
    <footer className="landing-footer">© 2026 FestivalGen AI. All rights reserved. <span>♥</span></footer>
  </div>;
}

type GeneratedPlanPreview = {
  summary: string;
  specialItems: string[];
  decorations: string[];
  shoppingList: Array<{ item: string; category: string; quantity: string; estimatedPrice: number }>;
  budget: Array<{ category: string; amount: number; percentage: number }>;
  recipes: Array<{ name: string; category: string; cookTime: string; ingredients: string[]; steps: string[]; servings?: number; description?: string; tips?: string[]; rating: number }>;
  rituals: Array<{ stepNumber: number; title: string; description?: string; materials?: string[]; procedure?: string[]; purpose?: string; duration: string; mantra?: string | null }>;
  invitations: Array<{ type: string; title: string; content: string }>;
  timeline: Array<{ dayDate: string; title: string; description: string; status: "Completed" | "In Progress" | "Upcoming" }>;
};

function readGeneratedPlan() {
  try { return JSON.parse(localStorage.getItem("festivalgen:last-plan") || "null") as GeneratedPlanPreview | null; } catch { return null; }
}

const shoppingDownloadLabels: Record<string, { title: string; festival: string; language: string; purchased: string; pending: string }> = {
  English: { title: "Shopping List Notes", festival: "Festival", language: "Language", purchased: "Purchased", pending: "Pending" },
  Hindi: { title: "खरीदारी सूची नोट्स", festival: "त्योहार", language: "भाषा", purchased: "खरीदा गया", pending: "बाकी" },
  Telugu: { title: "షాపింగ్ జాబితా గమనికలు", festival: "పండుగ", language: "భాష", purchased: "కొనుగోలు చేశారు", pending: "మిగిలినవి" },
  Tamil: { title: "ஷாப்பிங் பட்டியல் குறிப்புகள்", festival: "திருவிழா", language: "மொழி", purchased: "வாங்கியது", pending: "நிலுவையில்" },
  Bengali: { title: "কেনাকাটার তালিকার নোট", festival: "উৎসব", language: "ভাষা", purchased: "কেনা হয়েছে", pending: "বাকি" },
};

const shoppingPdfFonts: Record<string, { file: string; family: string }> = {
  English: { file: "NotoSans-Regular.ttf", family: "NotoSans" },
  Hindi: { file: "NotoSansDevanagari-Regular.ttf", family: "NotoSansDevanagari" },
  Telugu: { file: "NotoSansTelugu-Regular.ttf", family: "NotoSansTelugu" },
  Tamil: { file: "NotoSansTamil-Regular.ttf", family: "NotoSansTamil" },
  Kannada: { file: "NotoSansKannada-Regular.ttf", family: "NotoSansKannada" },
  Malayalam: { file: "NotoSansMalayalam-Regular.ttf", family: "NotoSansMalayalam" },
  Bengali: { file: "NotoSansBengali-Regular.ttf", family: "NotoSansBengali" },
  Marathi: { file: "NotoSansDevanagari-Regular.ttf", family: "NotoSansDevanagari" },
  Gujarati: { file: "NotoSansGujarati-Regular.ttf", family: "NotoSansGujarati" },
  Punjabi: { file: "NotoSansGurmukhi-Regular.ttf", family: "NotoSansGurmukhi" },
};

async function loadShoppingPdfFont(doc: jsPDF, language: string) {
  const font = shoppingPdfFonts[language] || shoppingPdfFonts.English;
  const response = await fetch(`/fonts/${font.file}`);
  if (!response.ok) throw new Error(`Unable to load PDF font for ${language}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  doc.addFileToVFS(font.file, btoa(binary));
  doc.addFont(font.file, font.family, "normal");
  doc.setFont(font.family, "normal");
  return font.family;
}

function festivalDate(event: FestivalEvent, year: number) {
  const value = event.dates[year];
  return value ? new Date(`${value}T12:00:00`) : null;
}

function getUpcomingFestival(preferredName?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const years = [today.getFullYear(), today.getFullYear() + 1];
  const datedEvents = years.flatMap(year => festivalCalendar.map(event => {
    const date = festivalDate(event, year);
    return date ? { event, date } : null;
  }).filter((entry): entry is { event: FestivalEvent; date: Date } => Boolean(entry && entry.date >= today)));
  const preferred = datedEvents.find(entry => entry.event.name === preferredName);
  return preferred || datedEvents.sort((left, right) => left.date.getTime() - right.date.getTime())[0] || null;
}

function FestivalCalendar({ onNavigate, onCreatePlan }: { onNavigate: (page: PageKey) => void; onCreatePlan: (festival: string) => void }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [region, setRegion] = useState("All regions");
  const [selected, setSelected] = useState<FestivalEvent | null>(null);
  const categories = ["All categories", ...Array.from(new Set(festivalCalendar.map(event => event.category)))];
  const regions = ["All regions", ...Array.from(new Set(festivalCalendar.flatMap(event => event.region.split(" · "))))];
  const visible = festivalCalendar.filter(event => {
    const matchesQuery = `${event.name} ${event.aliases || ""} ${event.region}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || event.category === category;
    const matchesRegion = region === "All regions" || event.region.includes(region);
    const date = festivalDate(event, year);
    const matchesMonth = query.trim() ? true : (date ? date.getMonth() === month : month === 0);
    return matchesQuery && matchesCategory && matchesRegion && matchesMonth;
  }).sort((left, right) => (festivalDate(left, year)?.getDate() || 99) - (festivalDate(right, year)?.getDate() || 99));
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const moveMonth = (offset: number) => { const next = new Date(year, month + offset, 1); setYear(next.getFullYear()); setMonth(next.getMonth()); setSelected(null); };
  return <div className="content-page calendar-page"><PageHeading eyebrow="Plan around the year" title="Festival Calendar" subtitle="Explore India's major celebrations and plan the moments that matter." action={<AppButton onClick={() => onCreatePlan(selected?.name || "Diwali")}><CalendarDays size={14} /> Create Festival Plan</AppButton>} />
    <div className="calendar-toolbar"><div className="calendar-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search festivals" aria-label="Search festivals" /></div><label className="calendar-filter"><span>Year</span><select value={year} onChange={event => setYear(Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => currentYear - 2 + index).map(value => <option key={value}>{value}</option>)}</select></label><label className="calendar-filter"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label className="calendar-filter"><span>Region</span><select value={region} onChange={event => setRegion(event.target.value)}>{regions.map(value => <option key={value}>{value}</option>)}</select></label></div>
    <div className="calendar-heading"><button className="icon-button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button><div><span className="eyebrow">Selected month</span><h2>{monthLabel}</h2></div><button className="icon-button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={16} /></button></div>
    <div className="calendar-months">{Array.from({ length: 12 }, (_, index) => <button key={index} className={index === month ? "is-active" : ""} onClick={() => { setMonth(index); setSelected(null); }}>{new Date(year, index, 1).toLocaleDateString("en-IN", { month: "short" })}</button>)}</div>
    <div className="calendar-content"><section className="calendar-list">{visible.length === 0 ? <div className="calendar-empty"><CalendarDays size={22} /><strong>No festivals found for this view</strong><span>Try another month, region or search.</span></div> : visible.map(event => { const date = festivalDate(event, year); return <button className={`calendar-event ${selected?.name === event.name ? "is-selected" : ""}`} key={event.name} onClick={() => setSelected(event)}><span className="calendar-event-icon">{event.icon}</span><span className="calendar-event-date"><strong>{date?.getDate() || "-"}</strong><small>{date?.toLocaleDateString("en-IN", { weekday: "short" }) || "Varies"}</small></span><span className="calendar-event-copy"><strong>{event.name}</strong><small>{event.aliases ? `${event.aliases} · ` : ""}{event.description}</small><em>{event.category} · {event.region}</em></span><ChevronRight size={15} /></button>; })}</section>{selected && <aside className="calendar-detail"><span className="calendar-detail-icon">{selected.icon}</span><span className="card-kicker">{selected.category}</span><h3>{selected.name}</h3><strong>{festivalDate(selected, year)?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) || "Date varies annually"}</strong><p>{selected.description}</p><small>{selected.region}</small><AppButton onClick={() => onCreatePlan(selected.name)}>Create Festival Plan <ArrowRight size={14} /></AppButton></aside>}</div>
  </div>;
}

function PlanGenerator({ onNavigate, initialFestival = "Diwali" }: { onNavigate: (page: PageKey) => void; initialFestival?: string }) {
  const [step, setStep] = useState(1);
  const [festival, setFestival] = useState(initialFestival);
  const [city, setCity] = useState("Hyderabad, Telangana");
  const [familySize, setFamilySize] = useState("4");
  const [budget, setBudget] = useState("15000");
  const [language, setLanguage] = useState("English");
  const [preferences, setPreferences] = useState<string[]>(["Vegetarian", "Family-friendly", "Traditional rituals"]);
  const [generated, setGenerated] = useState<GeneratedPlanPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
    const requestPlan = async (input: { festival: string; city: string; familySize: number; budget: number; language: string; preferences: string[] }) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/plans/generate", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json().catch(() => null) as { success?: boolean; error?: string; details?: string | string[]; plan?: GeneratedPlanPreview } | null;
      const errorDetails = Array.isArray(payload?.details) ? payload.details.join(", ") : payload?.details;
      if (!response.ok || !payload?.success || !payload.plan) throw new Error(errorDetails || payload?.error || `Plan generation failed (${response.status})`);
      setGenerated(payload.plan);
      try { localStorage.setItem("festivalgen:last-plan", JSON.stringify(payload.plan)); } catch { /* local storage can be unavailable in private browsing */ }
      setStep(4);
      toast.success("Your personalized festival plan is ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the plan");
    } finally {
      setIsGenerating(false);
    }
  };
  const generatePlan = { isPending: isGenerating };
  const togglePreference = (preference: string) => {
    setPreferences(current => current.includes(preference) ? current.filter(item => item !== preference) : [...current, preference]);
  };
  const nextStep = () => {
    if (step === 3) {
      try { localStorage.setItem("festivalgen:last-plan-input", JSON.stringify({ festival, city, familySize: Number(familySize), budget: Number(budget), language, preferences })); } catch { /* local storage can be unavailable in private browsing */ }
      void requestPlan({ festival, city, familySize: Number(familySize), budget: Number(budget), language, preferences });
      return;
    }
    setStep(current => Math.min(4, current + 1));
  };

  return <div className="content-page plan-page"><PageHeading eyebrow="Personalized planning" title="Plan Generator" subtitle="Tell us about your festival and get a personalized plan." action={<button className="page-close" onClick={() => onNavigate("dashboard")}><X size={18} /></button>} />
    <div className="progress-steps">{["Festival Details", "Preferences", "Generate Plan", "Complete"].map((label, i) => <div key={label} className={`progress-step ${i + 1 <= step ? "is-done" : ""}`}><span>{i + 1 < step ? <Check size={14} /> : i + 1}</span><small>{label}</small></div>)}</div>
    <div className="plan-layout"><section className="form-card"><p className="eyebrow">Step {step} of 4</p><h2>{step === 1 ? "Festival Details" : step === 2 ? "Your Preferences" : step === 3 ? "Review Your Plan" : "Your plan is ready"}</h2>{step === 1 && <div className="form-grid"><PlannerField label="Select Festival" value={festival} onChange={setFestival} select options={festivalCalendar.map(event => event.name)} /><PlannerField label="Your City" value={city} onChange={setCity} icon={MapPin} /><PlannerField label="Family Size" value={familySize} onChange={setFamilySize} select options={["1", "2", "4", "6", "8", "10"]} /><PlannerField label="Budget (₹)" value={budget} onChange={setBudget} icon={IndianRupee} type="number" /><PlannerField label="Preferred Language" value={language} onChange={setLanguage} select options={["English", "Hindi", "Telugu", "Tamil", "Bengali"]} /></div>}{step === 2 && <div className="preference-list">{[["Vegetarian", "Family-friendly recipes", Utensils], ["Local shopping", "Nearby stores and local prices", Store], ["Traditional rituals", "Step-by-step cultural guidance", Sparkles], ["Social content", "Invitations and messages for guests", Mail]].map(([title, copy, Icon]) => <button type="button" className={`preference-row ${preferences.includes(title as string) ? "is-selected" : ""}`} key={title as string} onClick={() => togglePreference(title as string)}><span><Icon size={18} /></span><div><strong>{title as string}</strong><small>{copy as string}</small></div><span className="preference-check">{preferences.includes(title as string) ? <Check size={14} /> : <ChevronRight size={15} />}</span></button>)}</div>}{step === 3 && <div className="review-box"><strong>{festival} plan for {city}</strong><span>{familySize} family members · ₹{Number(budget).toLocaleString("en-IN")} budget · {language}</span><span>{preferences.length} preferences selected · shopping, recipes, rituals, invitations and a day-by-day timeline</span></div>}{step === 4 && <div className="complete-box"><span><Check size={25} /></span><h3>Your festival plan is ready!</h3><p>{generated?.summary || "We organized everything into one calm, easy-to-follow celebration guide."}</p>{generated && <><div className="generated-counts"><span>{generated.shoppingList.length} shopping items</span><span>{generated.recipes.length} recipes</span><span>{generated.timeline.length} timeline steps</span></div><div className="generated-specifics"><strong>Special items</strong><span>{generated.specialItems.join(" · ")}</span><strong>Decorations</strong><span>{generated.decorations.join(" · ")}</span></div></>}</div>}<div className="form-actions">{step > 1 && !generatePlan.isPending && <AppButton variant="outline" onClick={() => setStep(current => current - 1)}><ChevronLeft size={15} /> Back</AppButton>}{step < 4 ? <AppButton onClick={nextStep}>{generatePlan.isPending ? "Creating your plan…" : `Next: ${step === 1 ? "Preferences" : step === 2 ? "Generate Plan" : "Create Plan"}`} {!generatePlan.isPending && <ArrowRight size={15} />}</AppButton> : <AppButton onClick={() => onNavigate("dashboard")}>View Dashboard <ArrowRight size={15} /></AppButton>}</div></section><aside className="plan-promo"><img className="banner-photo" src={getFallbackFestivalPhoto(festival)} alt={festival} onError={(event) => { event.currentTarget.style.display = "none"; }} /><div><Gift size={25} /><h3>AI will create a complete festival plan just for you!</h3><p>Personalized &bull; Smart &bull; Complete</p></div></aside></div>
  </div>;
}

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{subtitle}</p></div>{action}</div>; }
function Field({ label, value, select, icon: Icon, name, type = "text", autoComplete }: { label: string; value: string; select?: boolean; icon?: typeof MapPin; name?: string; type?: string; autoComplete?: string }) { return <label className="field"><span>{label}</span><div>{Icon && <Icon size={14} />}{select ? <select name={name} defaultValue="" autoComplete={autoComplete}><option value="" disabled>{value}</option><option value="English">English</option><option value="Hindi">Hindi</option><option value="Telugu">Telugu</option></select> : <input autoComplete={autoComplete} name={name} type={type} placeholder={value} required={Boolean(name)} />}{select && <ChevronDown size={14} />}</div></label>; }
function PlannerField({ label, value, onChange, select, options, icon: Icon, type = "text" }: { label: string; value: string; onChange: (value: string) => void; select?: boolean; options?: string[]; icon?: typeof MapPin; type?: string }) { return <label className="field planner-field"><span>{label}</span><div>{Icon && <Icon size={14} />}{select ? <select value={value} onChange={event => onChange(event.target.value)}>{options?.map(option => <option value={option} key={option}>{option}{label === "Family Size" ? " Members" : ""}</option>)}</select> : <input type={type} value={value} onChange={event => onChange(event.target.value)} />}{select && <ChevronDown size={14} />}</div></label>; }
function Preference({ icon: Icon, title, copy }: { icon: typeof Utensils; title: string; copy: string }) { return <div className="preference-row"><span><Icon size={18} /></span><div><strong>{title}</strong><small>{copy}</small></div><ChevronRight size={15} /></div>; }

function BudgetPage() {
  const savedPlan = readGeneratedPlan();
  const generatedTotal = savedPlan?.budget.reduce((sum, item) => sum + item.amount, 0);
  const [total, setTotal] = useState(generatedTotal || 15000);
  const [editing, setEditing] = useState(false);
  const [suggestionsReady, setSuggestionsReady] = useState(false);
  const fallbackAllocation = [{ label: "Decorations", amount: 3000, percentage: 20, color: "#b969db" }, { label: "Food & Sweets", amount: 6000, percentage: 40, color: "#72a8eb" }, { label: "Gifts", amount: 3500, percentage: 23, color: "#37bda9" }, { label: "Puja & Rituals", amount: 1500, percentage: 10, color: "#ef7fb2" }, { label: "Miscellaneous", amount: 1000, percentage: 7, color: "#f1b049" }];
  const allocation = savedPlan?.budget.map((item, index) => ({ label: item.category, amount: item.amount, percentage: item.percentage, color: fallbackAllocation[index % fallbackAllocation.length].color })) || fallbackAllocation;
  return <div className="content-page"><PageHeading eyebrow="Money, made calmer" title="Budget Planner" subtitle="See how your budget is allocated across your festival plan." /><div className="budget-layout"><section className="chart-card"><div className="card-title-row"><div><span className="card-kicker">Budget Summary</span><h2>Total Budget</h2>{editing ? <input className="inline-number-input" type="number" value={total} onChange={event => setTotal(Number(event.target.value))} onBlur={() => setEditing(false)} autoFocus /> : <strong>₹{total.toLocaleString("en-IN")}</strong>}</div><button className="icon-button" onClick={() => setEditing(true)} aria-label="Edit total budget"><Pencil size={15} /></button></div><div className="donut-wrap"><div className="donut"><div><strong>₹{total.toLocaleString("en-IN")}</strong><small>Total</small></div></div><div className="budget-legend">{allocation.map(item => <span key={item.label}><i style={{ background: item.color }} /> <b>{item.label}</b><small>₹{item.amount.toLocaleString("en-IN")} ({item.percentage}%)</small></span>)}</div></div></section><aside className="tip-card"><span className="tip-mark">AI Tip</span><p>You can optimize your decor budget by 10% by choosing local markets.</p>{suggestionsReady && <p className="suggestions-ready" role="status">Suggestions are ready for your next review.</p>}<button onClick={() => setSuggestionsReady(true)}>View Suggestions <ArrowRight size={13} /></button></aside></div></div>;
}

function RecipesPage() {
  const fallbackRecipes = [
    { name: "Kaju Katli", category: "Sweet", cookTime: "30 mins", servings: 8, rating: 4.8, ingredients: ["Cashews", "sugar", "cardamom"], steps: ["Blend cashews into a fine powder.", "Cook with sugar syrup until the mixture leaves the pan.", "Roll, cool and cut into diamonds."], tips: ["Use room-temperature cashews for an even powder.", "Stop cooking as soon as the mixture leaves the pan.", "Roll between parchment sheets while warm for smooth pieces."], description: "A smooth, diamond-cut festive sweet." },
    { name: "Laddu", category: "Dessert", cookTime: "25 mins", servings: 10, rating: 4.7, ingredients: ["Besan", "ghee", "sugar", "nuts"], steps: ["Roast besan in ghee until fragrant.", "Stir in sugar and cardamom.", "Cool slightly and shape into laddus."], tips: ["Roast besan slowly for a nutty aroma.", "Cool the mixture enough to handle before shaping.", "Grease your palms lightly for even laddus."], description: "Soft golden laddus made for sharing." },
    { name: "Pulao", category: "Main Course", cookTime: "45 mins", servings: 4, rating: 4.5, ingredients: ["Basmati rice", "vegetables", "whole spices"], steps: ["Rinse and soak the rice.", "Saute spices and vegetables.", "Add rice and water, then cook until fluffy."], tips: ["Soak rice for evenly cooked grains.", "Use the correct water ratio.", "Rest covered for five minutes before fluffing."], description: "A fragrant rice centerpiece for the family table." },
    { name: "Paneer Curry", category: "Main Course", cookTime: "35 mins", servings: 4, rating: 4.6, ingredients: ["Paneer", "tomato", "cream", "spices"], steps: ["Saute the spices and tomatoes.", "Blend into a smooth sauce.", "Simmer paneer in the sauce and finish with cream."], tips: ["Do not overcook paneer or it can become chewy.", "Blend the sauce for a smooth festive gravy.", "Add cream over low heat."], description: "Comforting paneer in a gently spiced gravy." },
    { name: "Thandai", category: "Drink", cookTime: "15 mins", servings: 6, rating: 4.4, ingredients: ["Milk", "almonds", "fennel", "saffron"], steps: ["Soak and blend the nuts and spices.", "Stir the paste into chilled milk.", "Strain, chill and garnish before serving."], tips: ["Soak nuts overnight for a smoother paste.", "Chill the milk before blending.", "Add saffron to warm milk to release its color."], description: "A cool, aromatic festive drink." },
  ];
  const savedPlan = readGeneratedPlan();
  const recipes = (savedPlan?.recipes || fallbackRecipes).slice(0, 5).map(recipe => ({ ...recipe, ingredients: recipe.ingredients, tips: recipe.tips || ["Prepare the ingredients before you begin.", "Taste and adjust seasoning during cooking."] }));
  const [category, setCategory] = useState("All Recipes");
  const [selected, setSelected] = useState<typeof recipes[number] | null>(null);
  const filtered = category === "All Recipes" ? recipes : recipes.filter(recipe => recipe.category === category);
  return <div className="content-page"><PageHeading eyebrow="Made for your table" title="Recipes" subtitle="Five festival-specific recipes with complete preparation details." action={<AppButton variant="soft" onClick={() => toast("Recipes are generated for your selected festival")}><Sparkles size={14} /> Refresh Recipes</AppButton>} /><div className="tab-row">{["All Recipes", "Main Course", "Dessert", "Sweet", "Drink"].map(tab => <button className={category === tab ? "is-active" : ""} key={tab} onClick={() => setCategory(tab)}>{tab === "All Recipes" ? tab : tab === "Main Course" ? tab : tab}</button>)}</div><div className="recipe-grid">{filtered.map(recipe => <article className="recipe-card recipe-text-card" key={recipe.name} onClick={() => setSelected(recipe)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter") setSelected(recipe); }}><div className="recipe-body"><span className="recipe-category">{recipe.category}</span><h3>🍛 {recipe.name}</h3><p><Clock3 size={12} /> {recipe.cookTime} <span>👨‍👩‍👧 {recipe.servings} servings <Star size={11} fill="currentColor" /> {recipe.rating}</span></p><small>{recipe.description}</small></div></article>)}</div>{selected && <section className="recipe-detail-card"><div><span className="card-kicker">Recipe details</span><h3>🍛 {selected.name}</h3><p>{selected.description}</p><div className="recipe-detail-section"><strong>🥣 Ingredients</strong><ul>{selected.ingredients.map(ingredient => <li key={ingredient}>{ingredient}</li>)}</ul></div><div className="recipe-detail-section"><strong>👩‍🍳 Preparation Process</strong><ol>{selected.steps.map((step, index) => <li key={step}><b>Step {index + 1}</b><span>{step}</span></li>)}</ol></div><div className="recipe-detail-section"><strong>💡 Tips</strong><ul>{selected.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></div></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close recipe details"><X size={16} /></button></section>}<div className="center-action"><AppButton variant="soft" onClick={() => { setCategory("All Recipes"); toast("Showing all festival recipes"); }}>View All Recipes <ArrowRight size={14} /></AppButton></div></div>;
}

/*
function RecipesPage() {
  const fallbackRecipes = [{ name: "Kaju Katli", category: "Sweet", cookTime: "30 mins", servings: 8, rating: 4.8, ingredients: ["Cashews", "sugar", "cardamom"], steps: ["Blend cashews into a fine powder.", "Cook with sugar syrup until the mixture leaves the pan.", "Roll, cool and cut into diamonds."], description: "A smooth, diamond-cut festive sweet." }, { name: "Laddu", category: "Sweet", cookTime: "25 mins", servings: 10, rating: 4.7, ingredients: ["Besan", "ghee", "sugar", "nuts"], steps: ["Roast besan in ghee until fragrant.", "Stir in sugar and cardamom.", "Cool slightly and shape into laddus."], description: "Soft golden laddus made for sharing." }, { name: "Chakli", category: "Snack", cookTime: "40 mins", servings: 12, rating: 4.6, ingredients: ["Rice flour", "gram flour", "sesame"], steps: ["Mix flours and spices with warm water.", "Shape the dough into spirals.", "Fry until crisp and golden."], description: "Crisp spiral snacks with a savory spice blend." }, { name: "Pulao", category: "Main Course", cookTime: "45 mins", servings: 4, rating: 4.5, ingredients: ["Basmati rice", "vegetables", "whole spices"], steps: ["Rinse and soak the rice.", "Saute spices and vegetables.", "Add rice and water, then cook until fluffy."], description: "A fragrant rice centerpiece for the family table." }, { name: "Thandai", category: "Drink", cookTime: "15 mins", servings: 6, rating: 4.4, ingredients: ["Milk", "almonds", "fennel", "saffron"], steps: ["Soak and blend the nuts and spices.", "Stir the paste into chilled milk.", "Strain, chill and garnish before serving."], description: "A cool, aromatic festive drink." }];
    const fallbackRecipes = [{ name: "Kaju Katli", category: "Sweet", cookTime: "30 mins", servings: 8, rating: 4.8, ingredients: ["Cashews", "sugar", "cardamom"], steps: ["Blend cashews into a fine powder.", "Cook with sugar syrup until the mixture leaves the pan.", "Roll, cool and cut into diamonds."], tips: ["Use room-temperature cashews for an even powder.", "Stop cooking as soon as the mixture leaves the pan.", "Roll between parchment sheets while warm for smooth pieces."], description: "A smooth, diamond-cut festive sweet." }, { name: "Laddu", category: "Sweet", cookTime: "25 mins", servings: 10, rating: 4.7, ingredients: ["Besan", "ghee", "sugar", "nuts"], steps: ["Roast besan in ghee until fragrant.", "Stir in sugar and cardamom.", "Cool slightly and shape into laddus."], tips: ["Roast besan slowly so it develops a nutty aroma.", "Let the mixture cool enough to handle before shaping.", "Grease your palms lightly for evenly shaped laddus."], description: "Soft golden laddus made for sharing." }, { name: "Chakli", category: "Snack", cookTime: "40 mins", servings: 12, rating: 4.6, ingredients: ["Rice flour", "gram flour", "sesame"], steps: ["Mix flours and spices with warm water.", "Shape the dough into spirals.", "Fry until crisp and golden."], tips: ["Keep the dough soft so the spirals do not crack.", "Fry on medium heat for an even crisp texture.", "Cool completely before storing in an airtight container."], description: "Crisp spiral snacks with a savory spice blend." }, { name: "Pulao", category: "Main Course", cookTime: "45 mins", servings: 4, rating: 4.5, ingredients: ["Basmati rice", "vegetables", "whole spices"], steps: ["Rinse and soak the rice.", "Saute spices and vegetables.", "Add rice and water, then cook until fluffy."], tips: ["Soak the rice to help each grain cook evenly.", "Use the correct water ratio for fluffy pulao.", "Rest covered for five minutes before fluffing."], description: "A fragrant rice centerpiece for the family table." }, { name: "Thandai", category: "Drink", cookTime: "15 mins", servings: 6, rating: 4.4, ingredients: ["Milk", "almonds", "fennel", "saffron"], steps: ["Soak and blend the nuts and spices.", "Stir the paste into chilled milk.", "Strain, chill and garnish before serving."], tips: ["Soak nuts overnight for a smoother paste.", "Chill the milk before blending for a refreshing drink.", "Add saffron to warm milk first to release its color."], description: "A cool, aromatic festive drink." }];
  const savedPlan = readGeneratedPlan();
  const recipes = (savedPlan?.recipes || fallbackRecipes).slice(0, 5).map(recipe => ({ name: recipe.name, category: recipe.category, time: recipe.cookTime, servings: recipe.servings || "4", rating: String(recipe.rating), ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients], steps: recipe.steps || [], tips: recipe.tips || ["Prepare the ingredients before you begin.", "Taste and adjust seasoning during cooking."], description: recipe.description || "A festival-specific recipe prepared for your celebration." }));
    return <div className="content-page"><PageHeading eyebrow="Made for your table" title="Recipes" subtitle="Five festival-specific recipes with complete preparation details." action={<AppButton variant="soft" onClick={() => toast("Recipes are generated for your selected festival")}><Sparkles size={14} /> Refresh Recipes</AppButton>} /><div className="tab-row">{["All Recipes", "Sweet", "Snack", "Main Course", "Drink"].map(tab => <button className={category === (tab === "Sweet" ? "Sweet" : tab === "Snack" ? "Snack" : tab) ? "is-active" : ""} key={tab} onClick={() => setCategory(tab)}>{tab === "Sweet" ? "Sweets" : tab === "Snack" ? "Snacks" : tab}</button>)}</div><div className="recipe-grid">{filtered.map(recipe => <article className="recipe-card recipe-text-card" key={recipe.name} onClick={() => setSelected(recipe)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter") setSelected(recipe); }}><div className="recipe-body"><span className="recipe-category">{recipe.category}</span><h3>🍛 {recipe.name}</h3><p><Clock3 size={12} /> {recipe.time} <span>👨‍👩‍👧 {recipe.servings} servings <Star size={11} fill="currentColor" /> {recipe.rating}</span></p><small>{recipe.description}</small></div></article>)}</div>{selected && <section className="recipe-detail-card"><div><span className="card-kicker">Recipe details</span><h3>🍛 {selected.name}</h3><p>{selected.description}</p><div className="recipe-detail-section"><strong>🥣 Ingredients</strong><ul>{selected.ingredients.map(ingredient => <li key={ingredient}>{ingredient}</li>)}</ul></div><div className="recipe-detail-section"><strong>👩‍🍳 Preparation Process</strong><ol>{selected.steps.map((step, index) => <li key={step}><b>Step {index + 1}</b><span>{step}</span></li>)}</ol></div><div className="recipe-detail-section"><strong>💡 Tips</strong><ul>{selected.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></div></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close recipe details"><X size={16} /></button></section>}<div className="center-action"><AppButton variant="soft" onClick={() => { setCategory("All Recipes"); toast("Showing all festival recipes"); }}>View All Recipes <ArrowRight size={14} /></AppButton></div></div>;
  const [category, setCategory] = useState("All Recipes");
  const [selected, setSelected] = useState<typeof recipes[number] | null>(null);
  const filtered = category === "All Recipes" ? recipes : recipes.filter(recipe => recipe.category === category);
  return <div className="content-page"><PageHeading eyebrow="Made for your table" title="Recipes" subtitle="Five festival-specific recipes with complete preparation details." action={<AppButton variant="soft" onClick={() => toast("Recipes are generated for your selected festival")}>Refresh Recipes <Sparkles size={14} /></AppButton>} /><div className="tab-row">{["All Recipes", "Sweet", "Snack", "Main Course", "Drink"].map(tab => <button className={category === (tab === "Sweet" ? "Sweet" : tab === "Snack" ? "Snack" : tab) ? "is-active" : ""} key={tab} onClick={() => setCategory(tab)}>{tab === "Sweet" ? "Sweets" : tab === "Snack" ? "Snacks" : tab}</button>)}</div><div className="recipe-grid">{filtered.map(recipe => <article className="recipe-card recipe-text-card" key={recipe.name} onClick={() => setSelected(recipe)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter") setSelected(recipe); }}><div className="recipe-body"><span className="recipe-category">{recipe.category}</span><h3>🍛 {recipe.name}</h3><p><Clock3 size={12} /> {recipe.time} <span>👨‍👩‍👧 {recipe.servings} servings <Star size={11} fill="currentColor" /> {recipe.rating}</span></p><small>{recipe.description}</small></div></article>)}</div>{selected && <section className="recipe-detail-card"><div><span className="card-kicker">Recipe details</span><h3>🍛 {selected.name}</h3><p>{selected.description}</p><small><strong>Ingredients:</strong> {selected.ingredients}</small><div className="recipe-process"><strong>Preparation Process</strong>{selected.steps.map((step, index) => <span key={step}>Step {index + 1} → {step}</span>)}</div></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close recipe details"><X size={16} /></button></section>}<div className="center-action"><AppButton variant="soft" onClick={() => { setCategory("All Recipes"); toast("Showing all festival recipes"); }}>View All Recipes <ArrowRight size={14} /></AppButton></div></div>;
}

*/
function InvitationsPage() {
  const cards = [{ title: "Happy Diwali", copy: "Celebrate the festival of lights!", className: "inv-a", image: asset.inviteHappy }, { title: "Diwali Celebration", copy: "Join us for a joyful celebration!", className: "inv-b", image: asset.inviteCelebration }, { title: "Festival of Lights", copy: "Let’s celebrate together!", className: "inv-c", image: asset.inviteLights }];
  const [activeTab, setActiveTab] = useState("Invitation Cards");
  const [selected, setSelected] = useState(cards[0]);
  const copyInvite = async () => { const text = `${selected.title}\n${selected.copy}\n31 Oct 2026 · 7:00 PM onwards\nVenue: Our Home`; try { await navigator.clipboard?.writeText(text); toast.success("Invitation copied to clipboard"); } catch { toast.success("Invitation ready to share"); } };
  return <div className="content-page"><PageHeading eyebrow="Share the celebration" title="Invitation & Content Generator" subtitle="Create beautiful invitations and social content with AI." action={<AppButton onClick={() => toast.success("New invitation draft created")}><Plus size={14} /> Create New</AppButton>} /><div className="tab-row invite-tabs">{["Invitation Cards", "Social Media Posts", "WhatsApp Messages"].map(tab => <button className={activeTab === tab ? "is-active" : ""} key={tab} onClick={() => { setActiveTab(tab); toast(`${tab} view selected`); }}>{tab}</button>)}</div><div className="invitation-layout"><div className="invitation-cards">{cards.map(card => <article className={`invitation-card ${card.className} ${selected.title === card.title ? "is-selected" : ""}`} key={card.title} onClick={() => setSelected(card)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter") setSelected(card); }}><img className="invitation-image" src={card.image} alt={`${card.title} invitation photograph`} onError={(event) => { event.currentTarget.style.display = "none"; }} /><div><h3>{card.title}</h3><p>{card.copy}</p><small>31 Oct 2026<br />7:00 PM onwards<br />Venue: Our Home</small></div><span>✦</span></article>)}</div><aside className="content-blank"><ImageIcon size={22} /><h3>{activeTab}</h3><p>Selected: <strong>{selected.title}</strong>. Edit the message, timing and tone before sharing.</p><div className="invite-actions"><AppButton variant="soft" onClick={copyInvite}>Copy <Check size={14} /></AppButton><AppButton onClick={() => toast.success("Full invitation preview opened")}>View Full <ArrowRight size={14} /></AppButton></div></aside></div></div>;
}

function ShoppingPage() {
  const savedPlan = readGeneratedPlan();
  const fallbackItems = [{ name: "Clay diyas", category: "Decorations", quantity: "12 pieces", price: "₹20", checked: true }, { name: "Marigold garlands", category: "Decorations", quantity: "3 bunches", price: "₹120", checked: false }, { name: "Basmati rice", category: "Food", quantity: "5 kg", price: "₹70", checked: true }, { name: "Kaju & almonds", category: "Food", quantity: "2 kg", price: "₹340", checked: false }, { name: "Cotton wicks", category: "Puja", quantity: "2 packs", price: "₹45", checked: false }];
  const generatedItems = savedPlan?.shoppingList.map(item => ({ name: item.item, category: item.category, quantity: item.quantity, price: Number.isFinite(item.estimatedPrice) ? `₹${item.estimatedPrice.toLocaleString("en-IN")}` : "N/A", checked: false }));
  const [items, setItems] = useState(generatedItems || fallbackItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const profile = getPlanningProfile();
  const categories = ["All categories", ...Array.from(new Set(items.map(item => item.category)))];
  const visible = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) && (category === "All categories" || item.category === category));
  const toggle = (name: string) => setItems(current => current.map(item => item.name === name ? { ...item, checked: !item.checked } : item));
  const addItem = () => { if (!draft.trim()) return; setItems(current => [...current, { name: draft.trim(), category: "Custom", quantity: "1 unit", price: "N/A", checked: false }]); setDraft(""); setAdding(false); toast.success("Item added to your shopping list"); };
  const downloadNotes = async () => {
    const parseQuantity = (quantity: string) => {
      const match = quantity.match(/[0-9]+(?:[.,][0-9]+)?/);
      return match ? Number(match[0].replace(",", ".")) : null;
    };
    const unit = (quantity: string) => quantity.replace(/^[^a-zA-Z0-9]*[0-9]+(?:[.,][0-9]+)?\s*/i, "").trim() || "unit";
    const currency = (value: number | null) => value === null ? "N/A" : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    const rows = items.map(item => {
      const quantity = parseQuantity(item.quantity);
      const unitPrice = Number(item.price.replace(/[^0-9.]/g, ""));
      const hasPrice = item.price !== "N/A" && Number.isFinite(unitPrice);
      return { ...item, quantity, unit: unit(item.quantity), unitPrice: hasPrice ? unitPrice : null, total: quantity !== null && hasPrice ? quantity * unitPrice : null };
    });
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const fontFamily = await loadShoppingPdfFont(doc, profile.language);
    const columnLabels: Record<string, string[]> = {
      English: ["S.No", "Item", "Quantity", "Unit", "Estimated Price", "Total"],
      Telugu: ["క్రమ సంఖ్య", "వస్తువు", "పరిమాణం", "యూనిట్", "అంచనా ధర", "మొత్తం"],
      Hindi: ["क्रम सं.", "वस्तु", "मात्रा", "इकाई", "अनुमानित कीमत", "कुल"],
      Tamil: ["வ.எண்", "பொருள்", "அளவு", "அலகு", "மதிப்பிடப்பட்ட விலை", "மொத்தம்"],
      Kannada: ["ಕ್ರಮ ಸಂಖ್ಯೆ", "ವಸ್ತು", "ಪ್ರಮಾಣ", "ಘಟಕ", "ಅಂದಾಜು ಬೆಲೆ", "ಒಟ್ಟು"],
      Malayalam: ["ക്രമ നമ്പർ", "ഇനം", "അളവ്", "യൂണിറ്റ്", "അനുമാന വില", "ആകെ"],
      Bengali: ["ক্রমিক", "পণ্য", "পরিমাণ", "একক", "আনুমানিক মূল্য", "মোট"],
      Marathi: ["अनु. क्र.", "वस्तू", "प्रमाण", "एकक", "अंदाजे किंमत", "एकूण"],
      Gujarati: ["ક્રમ", "વસ્તુ", "જથ્થો", "એકમ", "અંદાજિત કિંમત", "કુલ"],
      Punjabi: ["ਕ੍ਰਮ ਸੰ.", "ਵਸਤੂ", "ਮਾਤਰਾ", "ਇਕਾਈ", "ਅੰਦਾਜ਼ਨ ਕੀਮਤ", "ਕੁੱਲ"],
    };
    const labels = columnLabels[profile.language] || columnLabels.English;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const footer = () => { doc.setFont(fontFamily, "normal"); doc.setFontSize(8); doc.setTextColor(120, 120, 120); doc.text("Generated by UtsavMitra · Personalized Festival Planner", pageWidth / 2, pageHeight - 10, { align: "center" }); };
    const header = (pageNumber: number) => { doc.setFillColor(111, 66, 193); doc.rect(0, 0, pageWidth, 9, "F"); doc.setTextColor(255, 255, 255); doc.setFont(fontFamily, "normal"); doc.setFontSize(16); doc.text("UtsavMitra", margin, 25); doc.setFontSize(19); doc.text(labels === columnLabels.English ? "Festival Shopping List" : (shoppingDownloadLabels[profile.language]?.title || "Festival Shopping List"), margin, 35); doc.setFontSize(9); doc.setTextColor(80, 80, 90); doc.text(`Festival: ${profile.festival || "Festival"}`, margin, 44); doc.text(`Location: ${profile.city || "Not set"}`, margin, 50); doc.text(`Date generated: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, 44, { align: "right" }); doc.text(`Page ${pageNumber}`, pageWidth - margin, 50, { align: "right" }); };
    const columns = { serial: margin + 7, item: margin + 15, quantity: margin + 100, unit: margin + 120, price: margin + 153, total: pageWidth - margin - 5 };
    const drawTableHeader = (y: number) => { doc.setFillColor(111, 66, 193); doc.setTextColor(255, 255, 255); doc.setFont(fontFamily, "normal"); doc.setFontSize(8); doc.rect(margin, y, pageWidth - margin * 2, 9, "F"); doc.text(labels[0], columns.serial, y + 6, { align: "center" }); doc.text(labels[1], columns.item, y + 6); doc.text(labels[2], columns.quantity, y + 6, { align: "center" }); doc.text(labels[3], columns.unit, y + 6, { align: "center" }); doc.text(labels[4], columns.price, y + 6, { align: "right" }); doc.text(labels[5], columns.total, y + 6, { align: "right" }); return y + 9; };
    let pageNumber = 1;
    header(pageNumber);
    let y = drawTableHeader(61);
    rows.forEach((row, index) => {
      const itemLines = doc.splitTextToSize(row.name, 79);
      const rowHeight = Math.max(10, itemLines.length * 4 + 5);
      if (y + rowHeight > pageHeight - 27) { footer(); doc.addPage(); pageNumber += 1; header(pageNumber); y = drawTableHeader(61); }
      if (index % 2 === 0) { doc.setFillColor(248, 246, 252); doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F"); }
      doc.setDrawColor(220, 215, 230); doc.rect(margin, y, pageWidth - margin * 2, rowHeight); doc.setTextColor(45, 40, 60); doc.setFont(fontFamily, "normal"); doc.setFontSize(8); doc.text(String(index + 1), columns.serial, y + rowHeight / 2 + 1, { align: "center" }); doc.text(itemLines, columns.item, y + 5); doc.text(row.quantity === null ? "N/A" : String(row.quantity), columns.quantity, y + rowHeight / 2 + 1, { align: "center" }); doc.text(row.unit, columns.unit, y + rowHeight / 2 + 1, { align: "center" }); doc.text(currency(row.unitPrice), columns.price, y + rowHeight / 2 + 1, { align: "right" }); doc.text(currency(row.total), columns.total, y + rowHeight / 2 + 1, { align: "right" }); y += rowHeight;
    });
    const subtotal = rows.reduce((sum, row) => sum + (row.total || 0), 0);
    const budget = Number(profile.budget.replace(/[^0-9]/g, "")) || 0;
    const categoriesTotal = rows.reduce<Record<string, number>>((totals, row) => { totals[row.category] = (totals[row.category] || 0) + (row.total || 0); return totals; }, {});
    if (y + 48 > pageHeight - 27) { footer(); doc.addPage(); pageNumber += 1; header(pageNumber); y = drawTableHeader(61); }
    y += 8; doc.setTextColor(45, 40, 60); doc.setFont(fontFamily, "normal"); doc.setFontSize(10); doc.text("Summary", margin, y); doc.setFontSize(9); doc.text(`Total Items: ${rows.length}`, margin, y + 8); doc.text(`Estimated Subtotal: ${currency(subtotal)}`, margin, y + 15); doc.text(`Budget: ${budget ? currency(budget) : "N/A"}`, margin, y + 22); doc.text(`Remaining Budget: ${budget ? currency(budget - subtotal) : "N/A"}`, margin, y + 29); const categoryEntries = Object.entries(categoriesTotal); categoryEntries.forEach(([name, total], index) => doc.text(`${name}: ${currency(total)}`, pageWidth - margin, y + 8 + index * 7, { align: "right" })); footer(); doc.save(`utsavmitra-festival-shopping-list-${(profile.festival || "festival").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`); toast.success("Shopping list PDF downloaded");
  };
  return <div className="content-page"><PageHeading eyebrow="Keep it together" title="Shopping List" subtitle="Everything you need, grouped by category." action={<><AppButton variant="soft" onClick={downloadNotes}><Download size={14} /> Download PDF</AppButton><AppButton onClick={() => setAdding(true)}><Plus size={14} /> Add Item</AppButton></>} />{adding && <div className="inline-add-row"><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Add an item" autoFocus /><AppButton onClick={addItem}>Add</AppButton><AppButton variant="ghost" onClick={() => setAdding(false)}>Cancel</AppButton></div>}<div className="shopping-bar"><div className="search-field"><Search size={15} /><input placeholder="Search your list" value={query} onChange={event => setQuery(event.target.value)} /></div><select className="category-select" value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></div><div className="list-card">{visible.map(item => <div className={`shopping-row ${item.checked ? "checked" : ""}`} key={item.name}><button type="button" className="shopping-check-button" onClick={() => toggle(item.name)} aria-label={`Mark ${item.name} ${item.checked ? "not purchased" : "purchased"}`}><span className="fake-check">{item.checked && <Check size={12} />}</span></button><div><strong>{item.name}</strong><small>{item.category} · {item.quantity}</small></div><b>{item.price}</b><button type="button" aria-label={`Edit ${item.name}`} onClick={() => { const next = window.prompt("Update item", item.name); if (next?.trim() && next.trim() !== item.name) { setItems(current => current.map(entry => entry.name === item.name ? { ...entry, name: next.trim() } : entry)); toast.success("Shopping item updated"); } }}><Pencil size={14} /></button></div>)}{visible.length === 0 && <div className="empty-state"><Search size={18} /><p>No shopping items match your filters.</p></div>}</div></div>;
}

function RitualsPage() {
  const savedPlan = readGeneratedPlan();
  const profile = getPlanningProfile();
  const steps = savedPlan?.rituals.map(item => ({ number: String(item.stepNumber).padStart(2, "0"), title: item.title, materials: item.materials || [], procedure: item.procedure || (item.description ? [item.description] : []), purpose: item.purpose, duration: item.duration, mantra: item.mantra })) || [
    { number: "01", title: "Prepare the space", materials: ["Clean cloth", "Puja platform", "Festival items"], procedure: ["Clean the puja area thoroughly.", "Spread a clean cloth on the platform.", "Arrange the required items in the order they will be used."], purpose: "Creates a clean, ready space for the ritual.", duration: "15 mins", mantra: null },
    { number: "02", title: "Light the diya", materials: ["Diya", "Oil or ghee", "Cotton wick"], procedure: ["Place the diya on a stable, heat-safe surface.", "Add oil or ghee and position the wick.", "Light it carefully and place it near the deity."], purpose: "Marks the beginning of the prayer with light.", duration: "10 mins", mantra: null },
    { number: "03", title: "Offer prayers", materials: ["Flowers", "Sandalwood", "Fruit or naivedyam"], procedure: ["Offer flowers and apply sandalwood as customary.", "Place the fruit or naivedyam before the deity.", "Complete the family prayer sequence before moving on."], purpose: "Offers gratitude and devotion according to family custom.", duration: "20 mins", mantra: null },
    { number: "04", title: "Share prasad", materials: ["Prepared prasad", "Serving bowls"], procedure: ["Wait until the prayer is complete.", "Offer the prepared prasad briefly before the deity.", "Serve it to the family and close the ritual with gratitude."], purpose: "Brings the household together at the close of the ritual.", duration: "10 mins", mantra: null },
  ];
  const [expanded, setExpanded] = useState<string | null>(null);
  return <div className="content-page"><PageHeading eyebrow="Rituals & Puja" title="Ritual Guide" subtitle="Festival-specific ritual steps for your celebration." action={<AppButton variant="soft" onClick={() => toast.success("Ritual guide personalized for your family")}><Sparkles size={14} /> Personalize Guide</AppButton>} /><div className="ritual-guide"><div className="ritual-summary"><span className="generic-symbol">🪔</span><div><strong>{savedPlan ? "Festival ritual guide" : "Diwali ritual guide"}</strong><p>{profile.language === "Not set" ? "English" : profile.language} · Festival-specific sequence · {steps.length} steps</p></div><span className="status-pill green">Ready</span></div>{steps.map(step => <div className="ritual-step-wrap" key={step.number}><button type="button" className={`ritual-step ${expanded === step.number ? "is-expanded" : ""}`} onClick={() => setExpanded(current => current === step.number ? null : step.number)} aria-expanded={expanded === step.number}><span className="ritual-number">{step.number}</span><span><strong>{step.title}</strong><small>{step.procedure[0] || "Open for step-by-step instructions."}</small></span><span className="ritual-duration">{step.duration}</span><ChevronRight size={15} /></button>{expanded === step.number && <div className="ritual-step-detail"><strong>What you need</strong><ul>{step.materials.map(material => <li key={material}>{material}</li>)}</ul><strong>Procedure</strong><ol>{step.procedure.map(instruction => <li key={instruction}>{instruction}</li>)}</ol>{step.purpose && <><strong>Purpose / Note</strong><p>{step.purpose}</p></>}{step.mantra?.trim() && <><strong>Mantra</strong><p>{step.mantra}</p><small>Use this only at this step, or follow your family’s customary wording.</small></>}</div>}</div>)}</div><section className="ritual-about"><span className="card-kicker">About this ritual</span><h2>Make space for meaning.</h2><p>{profile.festival || "This festival"} rituals bring the family together through preparation, prayer and gratitude. Use this guide as a respectful starting point and adapt it to your family tradition.</p></section><div className="ritual-tips"><div><span>✦</span><strong>Family note</strong><p>Keep the sequence flexible—your family customs always come first.</p></div><div><span>◌</span><strong>Language aware</strong><p>Switch the guide language from Settings whenever you like.</p></div></div></div>;
}

function NearbyPage() { const city = getPlanningProfile().city === "Not set" ? "Hyderabad" : getPlanningProfile().city; return <div className="content-page nearby-page"><MapView className="nearby-map" location={city} /></div>; }

function ReportsPage() { const stats = [["Shopping ready", "42 items", "82%", "pink"], ["Budget allocated", "₹15,000", "68%", "mint"], ["Recipes saved", "12 ideas", "74%", "saffron"]]; return <div className="content-page"><PageHeading eyebrow="Your progress" title="Festival Reports" subtitle="A calm view of your Diwali planning progress." action={<AppButton variant="soft" onClick={() => { window.print(); toast.success("Print dialog opened"); }}><Tags size={14} /> Download Report</AppButton>} /><div className="report-summary"><div><span className="card-kicker">Plan health</span><strong>72%</strong><small>Your celebration is taking shape.</small></div><div className="report-progress"><span style={{ width: "72%" }} /></div></div><div className="report-grid">{stats.map(([label, value, percent, tone]) => <div className={`report-card ${tone}`} key={label}><span>{label}</span><strong>{value}</strong><div><i style={{ width: percent }} /></div><small>{percent} complete</small></div>)}</div><div className="report-note"><Sparkles size={18} /><div><strong>A little more to go</strong><p>Finish your shopping list and review your festival plan for a smoother celebration.</p></div><AppButton variant="soft">View Plan <ArrowRight size={14} /></AppButton></div></div>; }

function SettingsPage({ userName }: { userName: string }) {
  const [name, setName] = useState(userName);
  const [city, setCity] = useState("Hyderabad, Telangana");
  const [language, setLanguage] = useState("English");
  const [preferences, setPreferences] = useState({ markets: true, reminders: true, recipes: true });
  return <div className="content-page"><PageHeading eyebrow="Your preferences" title="Settings" subtitle="Keep your FestivalGen experience feeling like yours." action={<AppButton onClick={() => { try { localStorage.setItem("festivalgen:settings", JSON.stringify({ name, city, language, preferences })); } catch { /* storage may be unavailable */ } toast.success(`${name}'s settings saved`); }}>Save Changes</AppButton>} /><div className="settings-grid"><section className="settings-card"><div className="settings-card-heading"><span className="generic-symbol"><CircleUserRound size={20} /></span><div><strong>Profile details</strong><small>Used to personalize your festival plan.</small></div></div><div className="settings-fields"><PlannerField label="Name" value={name} onChange={setName} icon={CircleUserRound} /><PlannerField label="City" value={city} onChange={setCity} icon={MapPin} /><PlannerField label="Preferred Language" value={language} onChange={setLanguage} select options={["English", "Hindi", "Telugu", "Tamil", "Bengali"]} /></div></section><section className="settings-card"><div className="settings-card-heading"><span className="generic-symbol"><Sparkles size={20} /></span><div><strong>Planning preferences</strong><small>Fine-tune the way AI prepares your plan.</small></div></div><div className="settings-options"><label><span><strong>Local market suggestions</strong><small>Include nearby stores and local prices.</small></span><input type="checkbox" checked={preferences.markets} onChange={event => setPreferences(current => ({ ...current, markets: event.target.checked }))} /></label><label><span><strong>Preparation reminders</strong><small>Keep timeline steps visible as your festival nears.</small></span><input type="checkbox" checked={preferences.reminders} onChange={event => setPreferences(current => ({ ...current, reminders: event.target.checked }))} /></label><label><span><strong>Personalized recipe ideas</strong><small>Prioritize family-friendly recipes.</small></span><input type="checkbox" checked={preferences.recipes} onChange={event => setPreferences(current => ({ ...current, recipes: event.target.checked }))} /></label></div></section></div></div>;
}

function AuthPage({ mode, onNavigate, onComplete }: { mode: "signin" | "signup"; onNavigate: (page: PageKey) => void; onComplete: () => Promise<void> }) { const signIn = mode === "signin"; const [formError, setFormError] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false); const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const email = String(data.get("email") || ""); const password = String(data.get("password") || ""); if (!email.includes("@")) { setFormError("Enter a valid email address."); return; } if (password.length < 6) { setFormError("Your password must be at least 6 characters."); return; } if (!signIn && password !== String(data.get("confirmPassword") || "")) { setFormError("Passwords do not match."); return; } setFormError(""); setIsSubmitting(true); try { const response = await fetch(`/api/auth/${signIn ? "login" : "signup"}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email, password, name: String(data.get("name") || "").trim() }) }); const payload = await response.json().catch(() => null) as { error?: string } | null; if (!response.ok) throw new Error(payload?.error || "Authentication failed"); await onComplete(); } catch (error) { setFormError(error instanceof Error ? error.message : "Authentication failed"); } finally { setIsSubmitting(false); } }; return <div className="auth-page"><div className="auth-topbar"><button onClick={() => onNavigate("home")}><Logo /></button><div>{signIn ? <>New here? <button onClick={() => onNavigate("signup")}>Sign Up</button></> : <>Already have an account? <button onClick={() => onNavigate("signin")}>Sign In</button></>}</div></div><div className="auth-layout"><section className="auth-art"><img className="auth-generated-image" src={signIn ? asset.authSignin : asset.authSignup} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="auth-art-copy"><span className="auth-badge">THE CALM WAY TO CELEBRATE</span><h1>{signIn ? <>Welcome Back! <span>✨</span></> : <>Plan Smarter,<br />Celebrate Better <span>✨</span></>}</h1><p>{signIn ? "Sign in to continue planning your perfect festival with AI" : "Join FestivalGen AI and get a personalized festival experience tailored just for you."}</p>{!signIn && <div className="auth-benefits">{[[Sparkles,"AI-Powered Planning","Smart shopping, budget, recipes, rituals & more."],[MapPin,"Location Aware","Local prices, nearby stores and market updates."],[WalletCards,"Save Time & Money","Optimized plans to help you stay on budget."],[ImageIcon,"Beautiful Creations","Invitations & social content generated for you."],[CalendarDays,"Day-by-Day Guide","Countdown timeline for a stress-free preparation."]].map(([Icon, title, copy]) => <div key={title as string}><span><Icon size={17} /></span><section><strong>{title as string}</strong><small>{copy as string}</small></section></div>)}</div>}</div></section><section className="auth-form-card"><span className="auth-form-kicker">FESTIVALGEN AI · PERSONAL PLANNER</span><p className="auth-eyebrow">{signIn ? "Let's get you back to your festival plan" : "Start your personalized festival journey"}</p><h2>{signIn ? "Sign In" : "Create Your Account"}</h2><div className="auth-rule">❧</div><form autoComplete="on" onSubmit={handleSubmit}>{!signIn && <><Field label="Full Name" value="Enter your full name" name="name" icon={CircleUserRound} autoComplete="name" /><Field label="Phone Number" value="Enter your phone number" name="phone" type="tel" icon={Phone} autoComplete="tel" /></>}<Field label="Email Address" value="Enter your email" name="email" type="email" icon={Mail} autoComplete="email" /><Field label="Password" value={signIn ? "Enter your password" : "Create a password"} name="password" type="password" icon={LockKeyhole} autoComplete={signIn ? "current-password" : "new-password"} />{!signIn && <Field label="Confirm Password" value="Confirm your password" name="confirmPassword" type="password" icon={LockKeyhole} autoComplete="new-password" />}<label className="check-row"><input type="checkbox" defaultChecked={signIn} /><span>{signIn ? "Remember me" : <>I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a></>}</span>{signIn && <a>Forgot Password?</a>}</label>{formError && <p className="auth-form-error" role="alert">{formError}</p>}<AppButton type="submit">{isSubmitting ? "Connecting..." : signIn ? "Sign In" : "Create Account"} {!isSubmitting && <ArrowRight size={15} />}</AppButton></form>{signIn && <><div className="or-line"><span>or continue with</span></div><button type="button" className="social-button" onClick={() => startLogin()}><span>G</span> Continue with Google</button><button type="button" className="social-button" onClick={() => startLogin()}><span className="facebook">f</span> Continue with Facebook</button></>}<p className="auth-footnote">{signIn ? "Your festival plans stay private and easy to find." : "By creating an account, you agree to our terms and conditions."}</p></section></div></div>; }

export default function Home() {
  const { logout, user, refresh } = useAuth();
  const [page, setPage] = useState<PageKey>(() => {
    const hash = window.location.hash.slice(1) as PageKey;
    return [...navItems.map((item) => item.id), "signin", "signup"].includes(hash) ? hash : "home";
  });
  const [selectedFestival, setSelectedFestival] = useState("Diwali");
  const userName = user?.name?.trim() || user?.email?.split("@")[0] || "there";
  const signOut = async () => { try { await logout(); } catch { toast("You have been signed out"); } setPage("home"); window.history.replaceState(null, "", "/"); };
  const go = (next: PageKey) => { if (next === "dashboard" && !user) { setPage("signin"); return; } setPage(next); window.history.replaceState(null, "", next === "home" ? "/" : `#${next}`); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goSection = (section: string) => { if (page !== "home") { setPage("home"); window.history.replaceState(null, "", "/"); } window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const createPlan = (festival: string) => { setSelectedFestival(festival); go("plan"); };
  const body = useMemo(() => {
    if (page === "home") return <Landing onNavigate={go} onSection={goSection} onCreatePlan={createPlan} />;
    if (page === "signin") return <AuthPage mode="signin" onNavigate={go} onComplete={async () => { await refresh(); go("dashboard"); toast.success("Welcome back to FestivalGen AI"); }} />;
    if (page === "signup") return <AuthPage mode="signup" onNavigate={go} onComplete={async () => { await refresh(); go("dashboard"); toast.success("Your FestivalGen plan space is ready"); }} />;
    if (page === "dashboard") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><Dashboard onNavigate={go} onCreatePlan={createPlan} userName={userName} /></AppLayout>;
    if (page === "calendar") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><FestivalCalendar onNavigate={go} onCreatePlan={createPlan} /></AppLayout>;
    if (page === "plan") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><PlanGenerator initialFestival={selectedFestival} onNavigate={go} /></AppLayout>;
    if (page === "budget") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><BudgetPage /></AppLayout>;
    if (page === "recipes") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><RecipesPage /></AppLayout>;
    if (page === "shopping") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><ShoppingPage /></AppLayout>;
    if (page === "rituals") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><RitualsPage /></AppLayout>;
    if (page === "nearby") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><NearbyPage /></AppLayout>;
    if (page === "reports") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><ReportsPage /></AppLayout>;
    if (page === "settings") return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><SettingsPage userName={userName} /></AppLayout>;
    return <AppLayout current={page} onNavigate={go} onSignOut={signOut} userName={userName}><div className="content-page generic-page"><PageHeading eyebrow="FestivalGen AI" title="FestivalGen AI" subtitle="Plan every detail with a little more ease." /><div className="generic-card"><span className="generic-symbol">✦</span><h2>Choose a section from the sidebar to continue.</h2><p>This section is ready for your festival plan.</p><AppButton variant="soft" onClick={() => go("plan")}>Continue planning <ArrowRight size={14} /></AppButton></div></div></AppLayout>;
  }, [page, selectedFestival, userName]);
  return body;
}
