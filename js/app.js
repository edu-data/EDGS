// ============================================================ 
// EDGS App Controller — 메인 애플리케이션 로직 
// ============================================================ 

// 전역 상태 
const APP_STATE = {
  role: 'academic',
  roleName: '교학처 담당자',
  currentPage: 'd01', 
};

const ROLE_META = {
  admin:     { name: '시스템 관리자', initial: '관', color: '#3B6FE8' },
  president: { name: '총장·처장',    initial: '총', color: '#F59E0B' },
  academic:  { name: '교학처 담당자', initial: '교', color: '#10B981' },
  admission: { name: '입학처 담당자', initial: '입', color: '#6366F1' },
  career:    { name: '취업지원 담당자', initial: '취', color: '#EC4899' },
  professor: { name: '지도교수',     initial: '교', color: '#F97316' },
  researcher:{ name: '연구자',       initial: '연', color: '#8B98B8' },
};

// ── 로그인 ────────────────────────────────────────────────
document.getElementById('login-btn').addEventListener('click', () => {
  const role = document.getElementById('role-select').value;
  const meta = ROLE_META[role];
  
  APP_STATE.role = role;
  APP_STATE.roleName = meta.name;
  
  // UI 업데이트
  document.getElementById('user-avatar').textContent = meta.initial;
  document.getElementById('user-avatar').style.background = `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`;
  document.getElementById('user-name').textContent = document.getElementById('user-id').value.split('@')[0];
  document.getElementById('user-role-badge').textContent = meta.name;
  
  // 메뉴 권한 처리
  updateMenuAccess(role);
  
  // 화면 전환
  document.getElementById('login-screen').style.opacity = '0';
  document.getElementById('login-screen').style.transition = 'opacity 0.4s';
  
  setTimeout(() => {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('main-app').style.opacity = '0';
    document.getElementById('main-app').style.transition = 'opacity 0.4s';
    
    setTimeout(() => {
      document.getElementById('main-app').style.opacity = '1';
    }, 10);

    // 첫 접근 가능 페이지로 이동
    const firstPage = getFirstAccessiblePage(role);
    navigateTo(firstPage);
    updateAlertBadge();
    startClock();
  }, 400);
});

function getFirstAccessiblePage(role) { 
  return ['d01', 'd02', 'd03', 'd04', 'd05', 'd06'].find(p => PAGES.canAccess(role, p)) || 'd01'; 
}

function updateMenuAccess(role) {
  ['d01', 'd02', 'd03', 'd04', 'd05', 'd06'].forEach(page => {
    const item = document.getElementById(`menu-${page}`);
    if (item) {
      item.classList.toggle('disabled', !PAGES.canAccess(role, page));
    }
  });
}

// ── 로그아웃 ──────────────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', () => {
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-screen').style.opacity = '1';
});

// ── 내비게이션 ────────────────────────────────────────────
document.querySelectorAll('.menu-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    navigateTo(page);
  });
});

function navigateTo(page) {
  APP_STATE.currentPage = page;
  PAGES.render(page);
}

// ── 전역 필터 변경 감지 ───────────────────────────────────
['filter-year', 'filter-campus', 'filter-type'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    PAGES.render(APP_STATE.currentPage);
    updateAlertBadge();
  });
});

// ── 알림 배지 업데이트 ────────────────────────────────────
function updateAlertBadge() {
  const { year, campus } = {
    year: document.getElementById('filter-year').value,
    campus: document.getElementById('filter-campus').value,
  };
  const count = FEEDBACK.getAlertCount(year, campus);
  const badge = document.getElementById('alert-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count === 0 ? 'none' : 'flex';
  }
}

document.getElementById('alert-btn').addEventListener('click', () => {
  navigateTo('d06');
});

// ── 사이드바 토글 ─────────────────────────────────────────
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── 시계 ──────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('header-time');
  function update() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  update();
  setInterval(update, 1000);
}

// ── 엔터키 로그인 지원 ────────────────────────────────────
document.getElementById('user-pw').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

// 페이지 로드 시 로그인 화면 표시
document.getElementById('main-app').classList.add('hidden');
