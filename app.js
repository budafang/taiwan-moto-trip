import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const STORAGE_KEY = "taiwan_moto_trip_shu_v1";
const DEFAULT_TRIP_ID = "shu-moto-5d4n";

const DEFAULT_TRIP = [
  {
    day: 1,
    label: "第1天",
    routeShort: "世新大學 → 嘉義市區",
    routeTitle: "台北世新大學出發・西海岸南下至嘉義",
    subtitle: "台3線接台61／台1線南下，海風吹拂與高美夕陽",
    distanceKm: 255,
    rideHours: "約 6.0 小時",
    roadTip: "出發前先在木柵路加滿油、檢查胎壓與煞車。苗栗後龍至台中清水段海風較大，側風路段請減速穩握龍頭。",
    spots: [
      {
        id: "d1-1",
        time: "07:30",
        name: "台北世新大學校門口（山洞口）集合出發",
        category: "出發/抵達",
        note: "拍照留念、歸零里程表，從木柵路轉新店接台3線南下。",
        done: false
      },
      {
        id: "d1-2",
        time: "10:15",
        name: "新竹南寮漁港・魚鱗天梯",
        category: "景點",
        note: "第一站伸展筋骨、補充水分，看新竹海岸線風光。",
        done: false
      },
      {
        id: "d1-3",
        time: "12:00",
        name: "苗栗白沙屯拱天宮 & 廟口午餐",
        category: "美食",
        note: "祈求五天環島平安順遂，順路吃在地鴨肉羹或肉圓。",
        done: false
      },
      {
        id: "d1-4",
        time: "13:30",
        name: "後龍好望角觀景台",
        category: "景點",
        note: "俯瞰白色大風車與海線鐵道，機車好停且視野極佳。",
        done: false
      },
      {
        id: "d1-5",
        time: "16:30",
        name: "台中高美濕地木棧道",
        category: "景點",
        note: "欣賞西海岸夕陽餘暉，注意潮汐與木棧道開放時間。",
        done: false
      },
      {
        id: "d1-6",
        time: "19:30",
        name: "嘉義文化路夜市（林聰明沙鍋魚頭／火雞肉飯）",
        category: "美食",
        note: "抵達嘉義後放好行李，步行逛夜市補充滿滿熱量。",
        done: false
      }
    ],
    stay: {
      name: "嘉義輕行旅 Hotel Discover（或嘉義市區背包客棧）",
      location: "嘉義市西區仁愛路一帶（近文化路夜市）",
      price: 1100,
      checkin: "15:00 / 11:00",
      note: "市區周邊有室內或監視器機車停車格，離火車站與夜市騎車 3 分鐘。",
      isHome: false
    },
    expenses: [
      { id: "e1-1", category: "油資", title: "木柵出發加滿 + 台中清水加油", amount: 240 },
      { id: "e1-2", category: "餐飲", title: "白沙屯午餐 + 飲料咖啡", amount: 220 },
      { id: "e1-3", category: "餐飲", title: "嘉義文化路夜市晚餐（火雞肉飯、豆花）", amount: 280 },
      { id: "e1-4", category: "住宿", title: "嘉義市區住宿（第1晚）", amount: 1100 }
    ]
  },
  {
    day: 2,
    label: "第2天",
    routeShort: "嘉義 → 台南高雄 → 墾丁",
    routeTitle: "府城古蹟美食・一路向南直奔國境之南",
    subtitle: "台1線接台17線海線南下，從台南小吃到墾丁海風",
    distanceKm: 235,
    rideHours: "約 5.5 小時",
    roadTip: "台南至高雄路段市區紅綠燈較多，請預留緩衝時間；進入屏東楓港台26線後車速較快，注意測速照相與落山風。",
    spots: [
      {
        id: "d2-1",
        time: "08:30",
        name: "嘉義出發 → 台南國華街／永樂市場",
        category: "美食",
        note: "早餐來碗牛肉湯或富盛號碗粿，體驗府城早午餐文化。",
        done: false
      },
      {
        id: "d2-2",
        time: "10:30",
        name: "安平古堡 & 安平老街",
        category: "景點",
        note: "感受百年歷史巷弄，快速拍照打卡。",
        done: false
      },
      {
        id: "d2-3",
        time: "13:00",
        name: "高雄駁二藝術特區 & 旗津渡輪遠眺",
        category: "景點",
        note: "港邊吹海風喝冰飲，避開正午最烈陽光稍作休息。",
        done: false
      },
      {
        id: "d2-4",
        time: "15:30",
        name: "屏東枋山海景咖啡（台26線屏鵝公路）",
        category: "休息/加油",
        note: "在海景第一排喝杯冰美式，同時於楓港中油加滿油。",
        done: false
      },
      {
        id: "d2-5",
        time: "17:30",
        name: "墾丁白沙灣／關山日落",
        category: "景點",
        note: "看台灣海峽與巴士海峽交界的壯麗夕陽。",
        done: false
      },
      {
        id: "d2-6",
        time: "19:30",
        name: "墾丁大街晚餐與補給",
        category: "美食",
        note: "逛逛熱鬧大街、採買隔天騎南迴公路的補給飲品。",
        done: false
      }
    ],
    stay: {
      name: "墾丁恆春／南灣青年旅宿（海景背包客棧）",
      location: "屏東縣恆春鎮南灣路／墾丁大街周邊",
      price: 1200,
      checkin: "15:00 / 11:00",
      note: "民宿前院可直接停放機車，建議住恆春鎮或南灣，安靜且選擇多。",
      isHome: false
    },
    expenses: [
      { id: "e2-1", category: "油資", title: "台南 + 楓港中油加油", amount: 230 },
      { id: "e2-2", category: "餐飲", title: "台南牛肉湯早餐 + 枋山海景咖啡", amount: 340 },
      { id: "e2-3", category: "餐飲", title: "墾丁大街晚餐", amount: 300 },
      { id: "e2-4", category: "住宿", title: "墾丁／恆春住宿（第2晚）", amount: 1200 }
    ]
  },
  {
    day: 3,
    label: "第3天",
    routeShort: "墾丁 → 最南點 → 台東市",
    routeTitle: "極南燈塔打卡・跨越山海的南迴公路",
    subtitle: "台26線接縣道199甲／壽卡鐵馬驛站 → 台9線最美海線",
    distanceKm: 165,
    rideHours: "約 4.0 小時",
    roadTip: "今天是五天中里程最輕鬆的一天！縣道199與壽卡段為山路彎道，切勿壓車超速；出南迴接台9線後太平洋豁然開朗，超好騎。",
    spots: [
      {
        id: "d3-1",
        time: "08:30",
        name: "鵝鑾鼻燈塔 & 台灣最南點意象標誌",
        category: "景點",
        note: "環島必拍地標！站在台灣本島最南端遠眺太平洋與巴士海峽。",
        done: false
      },
      {
        id: "d3-2",
        time: "10:15",
        name: "龍磐公園大草原 & 滿州海岸",
        category: "景點",
        note: "遼闊草原配湛藍海灣，台26線東海岸精華段。",
        done: false
      },
      {
        id: "d3-3",
        time: "12:00",
        name: "壽卡鐵馬驛站（南迴最高點）",
        category: "休息/加油",
        note: "環島騎士必打卡聖地，稍微休息再滑下達仁接台9線。",
        done: false
      },
      {
        id: "d3-4",
        time: "14:00",
        name: "台東多良觀光車站",
        category: "景點",
        note: "全台灣最美車站，拍紅欄杆、鐵道與太平洋同框照。",
        done: false
      },
      {
        id: "d3-5",
        time: "16:30",
        name: "台東森林公園（琵琶湖）＆海濱公園",
        category: "景點",
        note: "傍晚到海邊吹風放空，感受台東慢活步調。",
        done: false
      },
      {
        id: "d3-6",
        time: "18:30",
        name: "台東鐵花村音樂聚落 & 正氣路夜市",
        category: "美食",
        note: "聽現場音樂、吃藍蜻蜓炸雞或榕樹下米苔目。",
        done: false
      }
    ],
    stay: {
      name: "台東鐵花文創旅宿（或台東市區青旅）",
      location: "台東縣台東市新生路／鐵花路周邊",
      price: 1150,
      checkin: "15:00 / 11:00",
      note: "附設專屬機車停車區，步行 5 分鐘可達鐵花村與夜市。",
      isHome: false
    },
    expenses: [
      { id: "e3-1", category: "油資", title: "恆春出發加滿 + 太麻里補油", amount: 180 },
      { id: "e3-2", category: "門票/雜支", title: "鵝鑾鼻公園門票 + 多良清潔費", amount: 70 },
      { id: "e3-3", category: "餐飲", title: "太麻里午餐 + 台東正氣路夜市晚餐", amount: 420 },
      { id: "e3-4", category: "住宿", title: "台東市區住宿（第3晚）", amount: 1150 }
    ]
  },
  {
    day: 4,
    label: "第4天",
    routeShort: "台東 → 台11海岸線 → 花蓮",
    routeTitle: "太平洋一路相伴・花東海岸絕美騎行",
    subtitle: "沿台11線北上，右手邊整天都是湛藍太平洋",
    distanceKm: 175,
    rideHours: "約 4.5 小時",
    roadTip: "台11線加油站間距較長，建議在台東市區與成功鎮各補一次油。沿途風景極美，想拍照務必停靠路肩安全處，勿突然急煞。",
    spots: [
      {
        id: "d4-1",
        time: "09:00",
        name: "加路蘭海岸遊憩區",
        category: "景點",
        note: "漂流木裝置藝術與無敵海景，開啟台11線完美序幕。",
        done: false
      },
      {
        id: "d4-2",
        time: "10:30",
        name: "都蘭糖廠咖啡 & 杉原灣",
        category: "休息/加油",
        note: "逛文創小店喝杯咖啡，享受東海岸慢節奏。",
        done: false
      },
      {
        id: "d4-3",
        time: "12:15",
        name: "成功漁港海產午餐 & 三仙台跨海步橋",
        category: "景點",
        note: "品嚐新鮮鬼頭刀魚料理，遠眺八拱跨海步橋。",
        done: false
      },
      {
        id: "d4-4",
        time: "14:45",
        name: "北回歸線標誌公園 & 石梯坪",
        category: "景點",
        note: "欣賞海蝕壺穴地形，台11線必停地標。",
        done: false
      },
      {
        id: "d4-5",
        time: "17:00",
        name: "花蓮遠雄海岸公路（牛山呼庭路段）",
        category: "景點",
        note: "沿著海崖一路進入花蓮市區。",
        done: false
      },
      {
        id: "d4-6",
        time: "19:00",
        name: "花蓮東大門夜市",
        category: "美食",
        note: "炸彈蔥油餅、原住民一條街烤肉、公正包子一次滿足。",
        done: false
      }
    ],
    stay: {
      name: "花蓮市區設計青旅（近東大門／花蓮車站）",
      location: "花蓮縣花蓮市中山路／國聯一路周邊",
      price: 1100,
      checkin: "15:00 / 11:00",
      note: "提供雨天騎樓或地下機車位，明早北上蘇花前可先在市區加油與檢查機油。",
      isHome: false
    },
    expenses: [
      { id: "e4-1", category: "油資", title: "台東市區 + 成功鎮中油加油", amount: 190 },
      { id: "e4-2", category: "餐飲", title: "成功漁港午餐 + 都蘭咖啡", amount: 380 },
      { id: "e4-3", category: "餐飲", title: "花蓮東大門夜市晚餐", amount: 300 },
      { id: "e4-4", category: "住宿", title: "花蓮市區住宿（第4晚）", amount: 1100 }
    ]
  },
  {
    day: 5,
    label: "第5天",
    routeShort: "花蓮 → 蘇花 → 宜蘭 → 世新",
    routeTitle: "清水斷崖與蘭陽平原・凱旋返抵世新大學",
    subtitle: "台9丁／蘇花改白牌路段 → 宜蘭礁溪 → 北宜公路（台9線）回台北",
    distanceKm: 210,
    rideHours: "約 5.5 小時",
    roadTip: "白牌機車騎蘇花時請留意「蘇花改」開放與禁行標誌（部分隧道走台9丁舊蘇花），與砂石車保持安全距離！北宜公路九彎十八拐請放慢車速、注意區間測速。",
    spots: [
      {
        id: "d5-1",
        time: "08:00",
        name: "七星潭風景區",
        category: "景點",
        note: "最後一眼花蓮礫石海灘，精神飽滿準備挑戰蘇花公路。",
        done: false
      },
      {
        id: "d5-2",
        time: "09:15",
        name: "崇德休憩區・清水斷崖觀景台",
        category: "景點",
        note: "台灣十景之一，絕壁千仞配太平洋漸層藍，必拍留念。",
        done: false
      },
      {
        id: "d5-3",
        time: "11:30",
        name: "南方澳觀景台 & 蘇澳漁港午餐",
        category: "美食",
        note: "順利走完蘇花！俯瞰內埤海灣與三港合一，吃碗米糕或海鮮麵慶祝。",
        done: false
      },
      {
        id: "d5-4",
        time: "13:45",
        name: "宜蘭礁溪湯圍溝溫泉公園（泡腳舒壓）",
        category: "休息/加油",
        note: "免費泡腳放鬆連騎五天的雙腿，在礁溪加滿最後一桶油。",
        done: false
      },
      {
        id: "d5-5",
        time: "15:15",
        name: "北宜公路（台9線）→ 坪林茶葉博物館稍歇",
        category: "休息/加油",
        note: "越過石牌縣界公園回望蘭陽平原，在坪林喝杯包種茶再進新店。",
        done: false
      },
      {
        id: "d5-6",
        time: "17:00",
        name: "回到台北世新大學校門口・環台圓滿達成！",
        category: "出發/抵達",
        note: "拍下總里程表照片，恭喜完成 5 天 4 夜騎機車環台灣一圈！",
        done: false
      }
    ],
    stay: {
      name: "溫暖的家（台北世新大學周邊）",
      location: "台北市文山區木柵路一段（終點站）",
      price: 0,
      checkin: "圓滿返家",
      note: "環台結束！建議隔天去車行換機油、齒輪油並洗車保養陪你征戰千里的愛車。",
      isHome: true
    },
    expenses: [
      { id: "e5-1", category: "油資", title: "花蓮出發 + 宜蘭礁溪加油", amount: 210 },
      { id: "e5-2", category: "餐飲", title: "蘇澳午餐 + 坪林茶飲 + 返校慶功晚餐", amount: 480 },
      { id: "e5-3", category: "門票/雜支", title: "宜蘭伴手禮（奶凍捲／牛舌餅）", amount: 350 }
    ]
  }
];

let tripData = loadTripData();
let currentDay = 1;
let currentUser = null;
let db = null;
let auth = null;
let unsubscribeTrip = null;
let currentTripId = getTripIdFromUrl();

const firebaseEnabled = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID"
);

function getTripIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = (params.get("trip") || "").trim();
  return id || DEFAULT_TRIP_ID;
}

function canEdit() {
  // 若尚未填入 firebaseConfig，允許本地編輯；一旦啟用 Firebase，必須登入 Google 才能編輯
  if (!firebaseEnabled) return true;
  return Boolean(currentUser);
}

function requireEditPermission() {
  if (canEdit()) return true;
  showToast("🔒 請先登入 Google 帳號才能編輯行程");
  return false;
}

function loadTripData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 1) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("讀取儲存資料失敗，使用預設行程。", err);
  }
  return structuredClone(DEFAULT_TRIP);
}

function renumberDays() {
  tripData.forEach((d, idx) => {
    d.day = idx + 1;
    d.label = `第${idx + 1}天`;
  });
}

function addDay() {
  if (!requireEditPermission()) return;
  const nextNum = tripData.length + 1;
  tripData.push({
    day: nextNum,
    label: `第${nextNum}天`,
    routeShort: "自訂路線",
    routeTitle: `第${nextNum}天・自訂環台行程`,
    subtitle: "點擊下方「編輯路線資訊」設定今日出發地、目的地與里程",
    distanceKm: 120,
    rideHours: "約 3.5 小時",
    roadTip: "騎車請注意安全，適時休息並留意沿途加油站位置。",
    spots: [],
    stay: {
      name: "自訂住宿點",
      location: "請輸入住宿區域或地址",
      price: 1000,
      checkin: "15:00 / 11:00",
      note: "建議事先確認是否提供機車停放空間。",
      isHome: false
    },
    expenses: []
  });
  currentDay = nextNum;
  saveTripData();
  closeForms();
  renderAll();
  showToast(`已新增第${nextNum}天行程`);
}

function deleteDay(dayNum) {
  if (!requireEditPermission()) return;
  if (tripData.length <= 1) {
    showToast("至少需保留 1 天行程");
    return;
  }
  const target = tripData.find((d) => d.day === dayNum);
  if (!target) return;
  if (!confirm(`確定要刪除「${target.label}（${target.routeShort}）」嗎？該天的景點、住宿與花費記錄將會一併移除。`)) {
    return;
  }
  tripData = tripData.filter((d) => d.day !== dayNum);
  renumberDays();
  if (currentDay > tripData.length) {
    currentDay = tripData.length;
  }
  saveTripData();
  closeForms();
  renderAll();
  showToast(`已刪除 ${target.label}，並重新編排天數`);
}

async function saveTripData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tripData));

  if (!firebaseEnabled || !db || !currentUser) return;

  const syncBadge = document.getElementById("syncBadge");
  syncBadge.textContent = "⏳ 同步中...";
  try {
    await setDoc(
      doc(db, "trips", currentTripId),
      {
        days: tripData,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.displayName || currentUser.email || "Google 使用者",
        updatedByEmail: currentUser.email || ""
      },
      { merge: true }
    );
    syncBadge.textContent = "☁️ Firestore 已同步";
    syncBadge.classList.remove("local");
  } catch (err) {
    console.error("寫入 Firestore 失敗：", err);
    syncBadge.textContent = "⚠️ 同步失敗";
    showToast("雲端儲存失敗，請確認 Firestore 權限或網路連線");
  }
}

function formatMoney(num) {
  return `NT$ ${Number(num || 0).toLocaleString("zh-TW")}`;
}

function getDayTotalCost(dayObj) {
  return dayObj.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function getCategoryClass(category) {
  if (category === "美食") return "food";
  if (category === "出發/抵達") return "start";
  if (category === "休息/加油") return "rest";
  return "";
}

function renderSidebar() {
  const dayNav = document.getElementById("dayNav");
  dayNav.innerHTML = "";

  const daysCount = tripData.length;
  const nightsCount = Math.max(0, daysCount - 1);
  document.getElementById("tripTitle").textContent = `台灣環島 ${daysCount}天${nightsCount}夜`;
  document.getElementById("grandTotalLabel").textContent = `${daysCount}天總花費`;

  let grandTotal = 0;
  let totalKm = 0;
  let doneSpots = 0;
  let totalSpots = 0;
  const canDelete = daysCount > 1;

  tripData.forEach((d) => {
    const dayCost = getDayTotalCost(d);
    grandTotal += dayCost;
    totalKm += Number(d.distanceKm || 0);
    totalSpots += d.spots.length;
    doneSpots += d.spots.filter((s) => s.done).length;

    const itemWrap = document.createElement("div");
    itemWrap.className = `day-nav-item${canDelete ? " has-delete" : ""}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `day-btn${d.day === currentDay ? " active" : ""}`;
    btn.setAttribute("aria-current", d.day === currentDay ? "page" : "false");
    btn.innerHTML = `
      <div class="day-btn-top">
        <span class="day-label">${escapeHtml(d.label)}</span>
        <span class="day-km mono">${d.distanceKm} km</span>
      </div>
      <div class="day-route-mini">${escapeHtml(d.routeShort)}</div>
      <div class="day-meta-mini">
        <span>景點 ${d.spots.filter((s) => s.done).length}/${d.spots.length}</span>
        <span class="mono">${formatMoney(dayCost)}</span>
      </div>
    `;
    btn.addEventListener("click", () => {
      currentDay = d.day;
      closeForms();
      renderAll();
      if (window.innerWidth <= 820) {
        document.getElementById("mainContent").scrollIntoView({ behavior: "smooth" });
      }
    });
    itemWrap.appendChild(btn);

    if (canDelete) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "day-delete-btn";
      delBtn.title = `刪除 ${d.label}`;
      delBtn.setAttribute("aria-label", `刪除 ${d.label}`);
      delBtn.textContent = "✕";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteDay(d.day);
      });
      itemWrap.appendChild(delBtn);
    }

    dayNav.appendChild(itemWrap);
  });

  // 更新總覽數據
  document.getElementById("totalDistance").textContent = `${totalKm.toLocaleString("zh-TW")} km`;
  document.getElementById("grandTotalCost").textContent = formatMoney(grandTotal);
  document.getElementById("totalProgress").textContent = `${doneSpots} / ${totalSpots}`;
  const pct = totalSpots > 0 ? Math.round((doneSpots / totalSpots) * 100) : 0;
  document.getElementById("progressBarFill").style.width = `${pct}%`;

  // 更新台灣 SVG 路線高亮
  document.querySelectorAll(".route-seg").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.day) === currentDay);
  });
  document.querySelectorAll(".route-node[data-day]").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.day) === currentDay);
  });
}

function renderHero(dayObj) {
  const hero = document.getElementById("dayHero");
  const dayCost = getDayTotalCost(dayObj);
  const canDelete = tripData.length > 1;
  hero.innerHTML = `
    <div class="hero-top">
      <div>
        <div class="hero-day-tag">🛵 ${escapeHtml(dayObj.label)} ・ ${escapeHtml(dayObj.routeShort)}</div>
        <h2 class="hero-title">${escapeHtml(dayObj.routeTitle)}</h2>
        <p class="hero-subtitle">${escapeHtml(dayObj.subtitle)}</p>
      </div>
      <div class="hero-metrics">
        <div class="hero-metric">
          <span>預估里程</span>
          <strong class="mono">${dayObj.distanceKm} km</strong>
        </div>
        <div class="hero-metric">
          <span>騎乘時間</span>
          <strong>${escapeHtml(dayObj.rideHours)}</strong>
        </div>
        <div class="hero-metric">
          <span>當日花費</span>
          <strong class="mono">${formatMoney(dayCost)}</strong>
        </div>
      </div>
    </div>
    <div class="hero-tip">
      <strong>💡 騎士路況提醒：</strong>${escapeHtml(dayObj.roadTip)}
    </div>
    <div class="hero-actions">
      <button type="button" class="hero-btn" id="openEditDayBtn">✏️ 編輯路線資訊</button>
      ${canDelete ? `<button type="button" class="hero-btn danger" id="heroDeleteDayBtn">🗑️ 刪除這一天</button>` : ""}
    </div>
  `;

  document.getElementById("openEditDayBtn").addEventListener("click", () => {
    if (!requireEditPermission()) return;
    const form = document.getElementById("editDayForm");
    document.getElementById("dayRouteShortInput").value = dayObj.routeShort || "";
    document.getElementById("dayDistanceInput").value = dayObj.distanceKm || 0;
    document.getElementById("dayHoursInput").value = dayObj.rideHours || "";
    document.getElementById("dayTitleInput").value = dayObj.routeTitle || "";
    document.getElementById("daySubtitleInput").value = dayObj.subtitle || "";
    document.getElementById("dayTipInput").value = dayObj.roadTip || "";
    form.classList.toggle("hidden");
  });

  if (canDelete) {
    document.getElementById("heroDeleteDayBtn").addEventListener("click", () => {
      deleteDay(dayObj.day);
    });
  }
}

function renderSpots(dayObj) {
  const list = document.getElementById("spotsList");
  list.innerHTML = "";

  if (dayObj.spots.length === 0) {
    list.innerHTML = `<li class="empty-state">目前還沒有景點，點右上角「+ 新增景點」開始規劃吧！</li>`;
    return;
  }

  dayObj.spots.forEach((spot) => {
    const li = document.createElement("li");
    li.className = `spot-item${spot.done ? " done" : ""}`;
    const mapQuery = encodeURIComponent(spot.name.replace(/（.*?）|\(.*?\)/g, ""));
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    li.innerHTML = `
      <input type="checkbox" class="spot-check" ${spot.done ? "checked" : ""} aria-label="標記 ${spot.name} 為已完成" />
      <div class="spot-body">
        <div class="spot-top">
          <span class="spot-time mono">${spot.time}</span>
          <span class="spot-tag ${getCategoryClass(spot.category)}">${spot.category}</span>
        </div>
        <div class="spot-name">${escapeHtml(spot.name)}</div>
        ${spot.note ? `<p class="spot-note">${escapeHtml(spot.note)}</p>` : ""}
        <div class="spot-actions">
          <a class="map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">🗺️ 開啟 Google 地圖</a>
          <button type="button" class="icon-delete" title="刪除此景點">刪除</button>
        </div>
      </div>
    `;

    li.querySelector(".spot-check").addEventListener("change", (e) => {
      if (!requireEditPermission()) {
        e.target.checked = spot.done;
        return;
      }
      spot.done = e.target.checked;
      saveTripData();
      renderAll();
    });

    li.querySelector(".icon-delete").addEventListener("click", () => {
      if (!requireEditPermission()) return;
      dayObj.spots = dayObj.spots.filter((s) => s.id !== spot.id);
      saveTripData();
      renderAll();
      showToast("已刪除景點");
    });

    list.appendChild(li);
  });
}

function renderStay(dayObj) {
  const display = document.getElementById("stayDisplay");
  const subtitle = document.getElementById("staySubtitle");
  const stay = dayObj.stay;

  subtitle.textContent = stay.isHome ? "環台最後一天・平安返抵台北" : "機車友善住宿建議（點擊右上角可自訂）";

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.name + " " + stay.location)}`;

  display.innerHTML = `
    <div class="stay-banner${stay.isHome ? " home-stay" : ""}">
      <div class="stay-name-row">
        <div class="stay-name">${escapeHtml(stay.name)}</div>
        <div class="stay-price mono">${stay.price > 0 ? formatMoney(stay.price) : "免費（自宅）"}</div>
      </div>
      <div class="stay-location">📍 ${escapeHtml(stay.location)}</div>
      <div class="stay-details">
        <div class="stay-detail-item">
          <span>入住 / 退房</span>
          <strong>${escapeHtml(stay.checkin || "15:00 / 11:00")}</strong>
        </div>
        <div class="stay-detail-item">
          <span>導航連結</span>
          <strong><a class="map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">查看地圖位置 ↗</a></strong>
        </div>
      </div>
    </div>
    <div class="stay-note-box">
      <strong>🛵 停車與住宿備註：</strong>${escapeHtml(stay.note || "無")}
    </div>
  `;
}

function renderExpenses(dayObj) {
  const dayTotal = getDayTotalCost(dayObj);
  document.getElementById("dayTotalCost").textContent = formatMoney(dayTotal);

  // 分類統計
  const breakdownEl = document.getElementById("expenseBreakdown");
  const catTotals = {};
  dayObj.expenses.forEach((item) => {
    catTotals[item.category] = (catTotals[item.category] || 0) + Number(item.amount || 0);
  });

  breakdownEl.innerHTML = "";
  Object.entries(catTotals).forEach(([cat, amount]) => {
    const chip = document.createElement("span");
    chip.className = "cat-chip";
    chip.innerHTML = `${cat} <strong>${formatMoney(amount)}</strong>`;
    breakdownEl.appendChild(chip);
  });

  // 花費明細
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  if (dayObj.expenses.length === 0) {
    list.innerHTML = `<li class="empty-state">尚未記錄花費，從上方輸入一筆試試！</li>`;
    return;
  }

  dayObj.expenses.forEach((item) => {
    const li = document.createElement("li");
    li.className = "expense-row";
    li.innerHTML = `
      <div class="expense-left">
        <span class="expense-cat-badge" data-cat="${escapeHtml(item.category)}">${escapeHtml(item.category)}</span>
        <span class="expense-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
      </div>
      <div class="expense-right">
        <span class="expense-amount mono">${formatMoney(item.amount)}</span>
        <button type="button" class="icon-delete" title="刪除此筆花費">✕</button>
      </div>
    `;

    li.querySelector(".icon-delete").addEventListener("click", () => {
      if (!requireEditPermission()) return;
      dayObj.expenses = dayObj.expenses.filter((ex) => ex.id !== item.id);
      saveTripData();
      renderAll();
      showToast("已刪除花費項目");
    });

    list.appendChild(li);
  });
}

function renderAll() {
  const dayObj = tripData.find((d) => d.day === currentDay) || tripData[0];
  renderSidebar();
  renderHero(dayObj);
  renderSpots(dayObj);
  renderStay(dayObj);
  renderExpenses(dayObj);
}

function closeForms() {
  document.getElementById("addSpotForm").classList.add("hidden");
  document.getElementById("editStayForm").classList.add("hidden");
  document.getElementById("editDayForm").classList.add("hidden");
  document.getElementById("stayDisplay").classList.remove("hidden");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 綁定互動事件
function setupEvents() {
  // 新增一天
  document.getElementById("addDayBtn").addEventListener("click", addDay);

  // 編輯當日路線資訊
  const editDayForm = document.getElementById("editDayForm");
  document.getElementById("cancelDayEdit").addEventListener("click", () => {
    editDayForm.classList.add("hidden");
  });
  editDayForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!requireEditPermission()) return;
    const dayObj = tripData.find((d) => d.day === currentDay);
    if (!dayObj) return;
    dayObj.routeShort = document.getElementById("dayRouteShortInput").value.trim();
    dayObj.distanceKm = Number(document.getElementById("dayDistanceInput").value) || 0;
    dayObj.rideHours = document.getElementById("dayHoursInput").value.trim();
    dayObj.routeTitle = document.getElementById("dayTitleInput").value.trim();
    dayObj.subtitle = document.getElementById("daySubtitleInput").value.trim();
    dayObj.roadTip = document.getElementById("dayTipInput").value.trim();

    saveTripData();
    editDayForm.classList.add("hidden");
    renderAll();
    showToast(`已更新 ${dayObj.label} 路線資訊`);
  });

  // 展開/收合新增景點表單
  const toggleAddSpotBtn = document.getElementById("toggleAddSpotBtn");
  const addSpotForm = document.getElementById("addSpotForm");
  toggleAddSpotBtn.addEventListener("click", () => {
    if (!requireEditPermission()) return;
    addSpotForm.classList.toggle("hidden");
    if (!addSpotForm.classList.contains("hidden")) {
      document.getElementById("spotTime").focus();
    }
  });

  // 新增景點送出
  addSpotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!requireEditPermission()) return;
    const dayObj = tripData.find((d) => d.day === currentDay);
    const time = document.getElementById("spotTime").value.trim();
    const name = document.getElementById("spotName").value.trim();
    const category = document.getElementById("spotCategory").value;
    const note = document.getElementById("spotNote").value.trim();

    if (!time || !name) return;

    dayObj.spots.push({
      id: `spot-${Date.now()}`,
      time,
      name,
      category,
      note,
      done: false
    });

    saveTripData();
    addSpotForm.reset();
    addSpotForm.classList.add("hidden");
    renderAll();
    showToast(`已新增景點：${name}`);
  });

  // 編輯住宿點
  const editStayBtn = document.getElementById("editStayBtn");
  const editStayForm = document.getElementById("editStayForm");
  const stayDisplay = document.getElementById("stayDisplay");
  const cancelStayEdit = document.getElementById("cancelStayEdit");

  editStayBtn.addEventListener("click", () => {
    if (!requireEditPermission()) return;
    const dayObj = tripData.find((d) => d.day === currentDay);
    document.getElementById("stayNameInput").value = dayObj.stay.name;
    document.getElementById("stayLocationInput").value = dayObj.stay.location;
    document.getElementById("stayPriceInput").value = dayObj.stay.price;
    document.getElementById("stayCheckinInput").value = dayObj.stay.checkin || "";
    document.getElementById("stayNoteInput").value = dayObj.stay.note || "";

    stayDisplay.classList.add("hidden");
    editStayForm.classList.remove("hidden");
  });

  cancelStayEdit.addEventListener("click", () => {
    editStayForm.classList.add("hidden");
    stayDisplay.classList.remove("hidden");
  });

  editStayForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!requireEditPermission()) return;
    const dayObj = tripData.find((d) => d.day === currentDay);
    dayObj.stay.name = document.getElementById("stayNameInput").value.trim();
    dayObj.stay.location = document.getElementById("stayLocationInput").value.trim();
    dayObj.stay.price = Number(document.getElementById("stayPriceInput").value) || 0;
    dayObj.stay.checkin = document.getElementById("stayCheckinInput").value.trim();
    dayObj.stay.note = document.getElementById("stayNoteInput").value.trim();

    saveTripData();
    editStayForm.classList.add("hidden");
    stayDisplay.classList.remove("hidden");
    renderAll();
    showToast("已更新住宿資訊");
  });

  // 新增花費
  const addExpenseForm = document.getElementById("addExpenseForm");
  addExpenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!requireEditPermission()) return;
    const dayObj = tripData.find((d) => d.day === currentDay);
    const category = document.getElementById("expenseCategory").value;
    const title = document.getElementById("expenseTitle").value.trim();
    const amount = Number(document.getElementById("expenseAmount").value);

    if (!title || Number.isNaN(amount) || amount < 0) return;

    dayObj.expenses.push({
      id: `exp-${Date.now()}`,
      category,
      title,
      amount
    });

    saveTripData();
    addExpenseForm.reset();
    renderAll();
    showToast(`已記錄花費 ${formatMoney(amount)}`);
  });

  // 匯出 JSON
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taiwan-moto-5days-trip.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("已匯出 5 天環台行程檔案");
  });

  // 重置預設
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!requireEditPermission()) return;
    if (confirm("確定要將所有景點、住宿與花費重置為預設的 5 天 4 夜環台行程嗎？")) {
      tripData = structuredClone(DEFAULT_TRIP);
      currentDay = 1;
      saveTripData();
      closeForms();
      renderAll();
      showToast("已重置為預設行程");
    }
  });

  // Google 登入與登出
  const handleLogin = async () => {
    if (!firebaseEnabled || !auth) {
      showToast("請先在 firebase-config.js 填入 Firebase 設定");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Google 帳號登入成功，已解鎖共編權限！");
    } catch (err) {
      console.error("Google 登入失敗：", err);
      showToast(`登入失敗：${err.code || err.message}`);
    }
  };

  document.getElementById("loginBtn").addEventListener("click", handleLogin);
  document.getElementById("bannerLoginBtn").addEventListener("click", handleLogin);

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (!auth) return;
    await signOut(auth);
    closeForms();
    showToast("已登出 Google 帳號");
  });

  // 複製共編分享連結
  document.getElementById("copyShareBtn").addEventListener("click", async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?trip=${encodeURIComponent(currentTripId)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("已複製共編連結，快分享給同學吧！");
    } catch {
      prompt("請複製以下共編連結分享給同學：", shareUrl);
    }
  });

  // 建立全新共編行程
  document.getElementById("newTripBtn").addEventListener("click", () => {
    if (!requireEditPermission()) return;
    const newId = `trip-${Math.random().toString(36).slice(2, 8)}`;
    const url = new URL(window.location.href);
    url.searchParams.set("trip", newId);
    window.history.pushState({}, "", url.toString());
    currentTripId = newId;
    tripData = structuredClone(DEFAULT_TRIP);
    currentDay = 1;
    subscribeToTrip(currentTripId);
    saveTripData();
    renderAll();
    showToast(`已建立新共編行程：${newId}`);
  });
}

function updateAuthUI() {
  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView = document.getElementById("loggedInView");
  const readonlyBanner = document.getElementById("readonlyBanner");
  const readonlyTitle = document.getElementById("readonlyTitle");
  const readonlyDesc = document.getElementById("readonlyDesc");
  const bannerLoginBtn = document.getElementById("bannerLoginBtn");
  const syncBadge = document.getElementById("syncBadge");
  const tripIdTag = document.getElementById("tripIdTag");

  tripIdTag.textContent = `#${currentTripId}`;

  if (!firebaseEnabled) {
    syncBadge.textContent = "💾 本地模式";
    syncBadge.classList.add("local");
    loggedOutView.classList.add("hidden");
    loggedInView.classList.add("hidden");
    readonlyBanner.classList.remove("hidden");
    readonlyTitle.textContent = "⚙️ 尚未填入 Firebase 設定（目前為本機暫存模式）";
    readonlyDesc.textContent = "請將 Firebase Console 的 firebaseConfig 貼到 firebase-config.js，即可啟用 Google 登入與 Firestore 多人共編。";
    bannerLoginBtn.classList.add("hidden");
    document.body.classList.remove("readonly");
    return;
  }

  bannerLoginBtn.classList.remove("hidden");

  if (currentUser) {
    loggedOutView.classList.add("hidden");
    loggedInView.classList.remove("hidden");
    document.getElementById("userName").textContent = currentUser.displayName || "Google 使用者";
    document.getElementById("userEmail").textContent = currentUser.email || "";
    const avatar = document.getElementById("userAvatar");
    avatar.src = currentUser.photoURL || "https://www.gravatar.com/avatar/?d=mp";
    readonlyBanner.classList.add("hidden");
    document.body.classList.remove("readonly");
  } else {
    loggedOutView.classList.remove("hidden");
    loggedInView.classList.add("hidden");
    readonlyBanner.classList.remove("hidden");
    readonlyTitle.textContent = "🔒 目前為唯讀檢視模式";
    readonlyDesc.textContent = "請登入 Google 帳號後，即可與同學一起新增、修改行程、住宿與花費。";
    document.body.classList.add("readonly");
  }
}

function subscribeToTrip(tripId) {
  if (unsubscribeTrip) {
    unsubscribeTrip();
    unsubscribeTrip = null;
  }
  if (!db) return;

  const syncBadge = document.getElementById("syncBadge");
  const lastUpdatedText = document.getElementById("lastUpdatedText");
  syncBadge.textContent = "⏳ 載入雲端行程...";

  unsubscribeTrip = onSnapshot(
    doc(db, "trips", tripId),
    (snap) => {
      syncBadge.textContent = "☁️ Firestore 已連線";
      syncBadge.classList.remove("local");

      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.days) && data.days.length >= 1) {
          tripData = data.days;
          if (currentDay > tripData.length) {
            currentDay = tripData.length;
          }
          renderAll();
        }
        if (data.updatedBy) {
          const timeStr = data.updatedAt?.toDate
            ? data.updatedAt.toDate().toLocaleString("zh-TW", { hour12: false })
            : "剛剛";
          lastUpdatedText.textContent = `最後編輯：${data.updatedBy}（${timeStr}）`;
        }
      } else {
        lastUpdatedText.textContent = "尚未儲存雲端版本，登入後修改即自動建立";
      }
    },
    (err) => {
      console.error("Firestore 監聽失敗：", err);
      syncBadge.textContent = "⚠️ 雲端連線異常";
      syncBadge.classList.add("local");
    }
  );
}

function initFirebase() {
  if (!firebaseEnabled) {
    updateAuthUI();
    return;
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI();
  });

  subscribeToTrip(currentTripId);
}

setupEvents();
initFirebase();
renderAll();
