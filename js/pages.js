// ============================================================
//  EDGS Pages — 6개 대시보드 화면 렌더러
// ============================================================

window.PAGES = (function () {

  // ─── 공통 헬퍼 ───────────────────────────────────────────

  function getFilters() {
    return {
      year: document.getElementById('filter-year')?.value || 'all',
      campus: document.getElementById('filter-campus')?.value || 'all',
      type: document.getElementById('filter-type')?.value || 'all',
    };
  }

  function kpiCard({ code, icon, value, unit, label, trend, trendDir, barPct, color }) {
    const trendClass = ({ up: 'up', down: 'down', warn: 'warn', neutral: 'neutral' })[trendDir] || 'neutral';
    const trendArrow = trendDir === 'up' ? '▲' : trendDir === 'down' ? '▼' : '–';
    return `
    <div class="kpi-card fade-in" style="--kpi-color:${color || 'var(--primary)'}">
      <div class="kpi-header">
        <span class="kpi-code">${code}</span>
        <span class="kpi-icon">${icon}</span>
      </div>
      <div class="kpi-value">${value}<span class="kpi-unit">${unit}</span></div>
      <div class="kpi-label">${label}</div>
      <div class="kpi-trend ${trendClass}">${trendArrow} ${trend}</div>
      ${barPct !== undefined ? `<div class="kpi-bar"><div class="kpi-bar-fill" style="width:${Math.min(barPct, 100)}%"></div></div>` : ''}
    </div>`;
  }

  function alertItem({ icon, type, title, desc }) {
    return `
    <div class="alert-item ${type}">
      <span class="alert-icon">${icon}</span>
      <div class="alert-content">
        <div class="alert-title">${title}</div>
        <div class="alert-desc">${desc}</div>
      </div>
    </div>`;
  }

  function badge(text, type = 'muted') {
    return `<span class="badge badge-${type}">${text}</span>`;
  }

  // ─── D-01: 종합 현황 ──────────────────────────────────────

  function renderD01() {
    const { year, campus } = getFilters();
    const enr = KPI.getEnrollmentRates(year, campus);
    const examRate = KPI.getExamRate(year, campus);
    const pass = KPI.getPassRate(year, campus);
    const avgYrs = KPI.getAvgYearsToPass(year, campus);
    const alerts = FEEDBACK.getActiveAlerts(year, campus);

    const enrAvg = enr.undergrad; // 학부 충원율 대표값
    const passRate = pass.rate;
    const avgY = avgYrs.avg;
    const eRate = examRate.rate;

    document.getElementById('page-content').innerHTML = `
    <div class="page-header fade-in">
      <div class="page-header-left">
        <div class="page-title">🏠 D-01 종합 현황 대시보드</div>
        <div class="page-subtitle">Executive Summary — 주요 KPI 실시간 현황 · ${year === 'all' ? '전체 연도' : year + '년'} · ${campus === 'all' ? '전체 캠퍼스' : campus === 'incheon' ? '인천 캠퍼스' : '경기 캠퍼스'}</div>
      </div>
    </div>

    <div class="kpi-grid">
      ${kpiCard({ code: 'K01', icon: '📊', value: enrAvg, unit: '%', label: '학부 충원율', trend: enrAvg >= 98 ? '목표 달성 (98% 이상)' : '목표 미달 (98% 미만)', trendDir: enrAvg >= 98 ? 'up' : 'down', barPct: enrAvg, color: '#3B6FE8' })}
      ${kpiCard({ code: 'K04', icon: '🎯', value: passRate, unit: '%', label: '임용 합격률', trend: '전년比 +2.4%p', trendDir: 'up', barPct: passRate, color: '#10B981' })}
      ${kpiCard({ code: 'K05', icon: '⏱️', value: avgY, unit: '년', label: '평균 임용 소요 기간', trend: avgY <= 2 ? '목표 이내 (2년 이하)' : '목표 초과', trendDir: avgY <= 2 ? 'up' : 'warn', barPct: (3 - avgY) / 3 * 100, color: '#F59E0B' })}
      ${kpiCard({ code: 'K03', icon: '✋', value: eRate, unit: '%', label: '임용 응시율', trend: '현황 파악 단계', trendDir: 'neutral', barPct: eRate, color: '#6366F1' })}
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d1">
      <div class="chart-card">
        <div class="chart-title">임용합격률 5년 추이</div>
        <div class="chart-subtitle">경인교대 실적 vs 전국 평균 비교</div>
        <div class="chart-body" id="chart-d01-line"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">충원율 현황</div>
        <div class="chart-subtitle">학부 · 대학원 · 캠퍼스별</div>
        <div class="chart-body" id="chart-d01-gauge"></div>
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d2">
      <div class="chart-card">
        <div class="chart-title">임용 응시 지역 분포</div>
        <div class="chart-subtitle">합격자 기준 지역별 응시 현황</div>
        <div class="chart-body" id="chart-d01-map"></div>
      </div>
      <div class="chart-card alert-panel">
        <div class="alert-panel-title">🔔 주요 알림 & 환류 제안</div>
        ${alerts.length === 0
        ? alertItem({ icon: '✅', type: 'success', title: '모든 KPI 정상 범위', desc: '현재 임계값을 이탈한 KPI가 없습니다. 지속적 모니터링을 권고합니다.' })
        : alerts.map(a => alertItem({ icon: a.icon, type: a.severity === 'critical' ? 'critical' : 'warning', title: `[${a.id}] ${a.label}`, desc: a.detail })).join('')
      }
        ${alertItem({ icon: '✅', type: 'success', title: '임용합격률 전년比 +2.4%p 상승', desc: '2024년 임용합격률이 72.4%로 전년 대비 2.4%p 상승하였습니다.' })}
        ${alertItem({ icon: 'ℹ️', type: 'info', title: '데이터 완결성 현황', desc: '전체 데이터 입력률 94.2% · 현장 데이터(6단계) 선택적 수집 중' })}
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d3">
      <div class="chart-card">
        <div class="chart-title">연도별 충원율 비교</div>
        <div class="chart-subtitle">학부 기준 인천·경기 캠퍼스</div>
        <div class="chart-body" id="chart-d01-enr-trend"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">전형 유형별 임용합격률</div>
        <div class="chart-subtitle">수시 / 정시 / 특별 전형 비교</div>
        <div class="chart-body" id="chart-d01-by-type"></div>
      </div>
    </div>`;

    // 차트 렌더링
    setTimeout(() => {
      const trend = KPI.getPassRateTrend();
      CHARTS.lineChart('chart-d01-line',
        trend.map(t => t.year),
        [
          { name: '경인교대', data: trend.map(t => t.rate), color: '#3B6FE8', area: true },
          { name: '전국 평균', data: trend.map(() => 65.0), color: '#F59E0B' },
        ],
        { yMin: 55, yMax: 85 }
      );

      CHARTS.gaugeChart('chart-d01-gauge', [
        { name: '학부 충원율', value: enr.undergrad, color: '#3B6FE8' },
        { name: '대학원 충원율', value: enr.grad, color: '#10B981' },
      ]);

      const regions = KPI.getRegionDistribution(year, campus);
      CHARTS.mapChart('chart-d01-map', regions);

      const enrTrend = KPI.getEnrollmentTrend('undergrad');
      CHARTS.lineChart('chart-d01-enr-trend',
        enrTrend.map(t => t.year),
        [
          { name: '인천 캠퍼스', data: enrTrend.map(t => t.incheon), color: '#3B6FE8', area: true },
          { name: '경기 캠퍼스', data: enrTrend.map(t => t.gyeonggi), color: '#10B981', area: true },
        ],
        { yMin: 90, yMax: 110 }
      );

      const byType = KPI.getPassRateByAdmType(year, campus);
      CHARTS.barChart('chart-d01-by-type',
        byType.map(t => t.type),
        [{ name: '합격률', data: byType.map(t => t.passRate) }]
      );
    }, 100);
  }

  // ─── D-02: 임용 분석 상세 ────────────────────────────────

  function renderD02() {
    const { year, campus } = getFilters();
    const pass = KPI.getPassRate(year, campus);
    const avgYrs = KPI.getAvgYearsToPass(year, campus);
    const hist = KPI.getYearsHistogram(year, campus);
    const regions = KPI.getRegionDistribution(year, campus);
    const byType = KPI.getPassRateByAdmType(year, campus);

    document.getElementById('page-content').innerHTML = `
    <div class="page-header fade-in">
      <div class="page-header-left">
        <div class="page-title">🎯 D-02 임용 분석 상세</div>
        <div class="page-subtitle">임용 시험 응시·합격 패턴 심층 분석 — 교학처·취업팀</div>
      </div>
    </div>

    <div class="kpi-grid fade-in">
      ${kpiCard({ code: 'K04', icon: '🏆', value: pass.rate, unit: '%', label: '임용 합격률', trend: `합격자 ${pass.pass}명 / 응시자 ${pass.examinees}명`, trendDir: 'up', barPct: pass.rate, color: '#10B981' })}
      ${kpiCard({ code: 'K05', icon: '⏱️', value: avgYrs.avg, unit: '년', label: '평균 임용 소요 기간', trend: '2년 이내 목표', trendDir: avgYrs.avg <= 2 ? 'up' : 'warn', barPct: (3 - avgYrs.avg) / 3 * 100, color: '#F59E0B' })}
      ${kpiCard({ code: 'K03', icon: '✋', value: KPI.getExamRate(year, campus).rate, unit: '%', label: '임용 응시율', trend: '전체 졸업생 대비', trendDir: 'neutral', barPct: KPI.getExamRate(year, campus).rate, color: '#6366F1' })}
      ${kpiCard({ code: 'K06', icon: '📅', value: year !== 'all' ? KPI.get5YearPassRate(year).rate : '—', unit: '%', label: '5년 임용률', trend: '졸업 후 5년 이내 합격 비율', trendDir: 'neutral', barPct: year !== 'all' ? KPI.get5YearPassRate(year).rate : 0, color: '#EC4899' })}
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d1">
      <div class="chart-card">
        <div class="chart-title">연도별 임용합격률 추이</div>
        <div class="chart-subtitle">졸업 연도 기준 합격률 변화</div>
        <div class="chart-body" id="chart-d02-pass-trend"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">임용 소요 기간 분포</div>
        <div class="chart-subtitle">합격자 기준 소요 기간 히스토그램</div>
        <div class="chart-body" id="chart-d02-hist"></div>
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d2">
      <div class="chart-card">
        <div class="chart-title">응시 지역 분포</div>
        <div class="chart-subtitle">합격자 기준 지역별 비율</div>
        <div class="chart-body" id="chart-d02-region"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">전형 유형별 합격률 비교</div>
        <div class="chart-subtitle">수시 / 정시 / 특별 전형별 성과</div>
        <div class="chart-body" id="chart-d02-type"></div>
      </div>
    </div>

    <div class="data-table-wrapper fade-in fade-in-d3">
      <div class="data-table-header">
        <span class="data-table-title">🗂️ 연도별 임용 통계 요약</span>
        <input class="data-table-search" type="text" placeholder="연도 검색..." id="d02-search" />
      </div>
      <table class="data-table">
        <thead><tr>
          <th>졸업 연도</th><th>졸업생</th><th>응시율</th><th>합격자</th><th>합격률</th><th>평균 소요</th><th>비임용 진로</th>
        </tr></thead>
        <tbody>
          ${[2019, 2020, 2021, 2022, 2023, 2024].map(y => {
      const p = KPI.getPassRate(y, campus);
      const e = KPI.getExamRate(y, campus);
      const a = KPI.getAvgYearsToPass(y, campus);
      const alt = KPI.getAltCareerRate(y, campus);
      const trendBadge = p.rate >= 72 ? badge('▲ 상위', 'success') : p.rate >= 68 ? badge('→ 보통', 'warning') : badge('▼ 주의', 'danger');
      return `<tr>
              <td><b>${y}년</b></td>
              <td>${e.total}명</td>
              <td>${e.rate}%</td>
              <td>${p.pass}명</td>
              <td>${trendBadge} ${p.rate}%</td>
              <td>${a.avg}년</td>
              <td>${alt.rate}%</td>
            </tr>`;
    }).join('')}
        </tbody>
      </table>
    </div>`;

    setTimeout(() => {
      const trend = KPI.getPassRateTrend();
      CHARTS.lineChart('chart-d02-pass-trend',
        trend.map(t => t.year),
        [
          { name: '합격률', data: trend.map(t => t.rate), color: '#10B981', area: true },
          { name: '전국 평균', data: trend.map(() => 65), color: '#F59E0B' },
        ],
        { yMin: 55, yMax: 85 }
      );
      CHARTS.histChart('chart-d02-hist', hist);
      CHARTS.mapChart('chart-d02-region', regions);
      CHARTS.barChart('chart-d02-type',
        byType.map(t => t.type),
        [{ name: '합격률', data: byType.map(t => t.passRate), color: '#6366F1' }]
      );
    }, 100);
  }

  // ─── D-03: 충원율 모니터링 ───────────────────────────────

  function renderD03() {
    const { year, campus } = getFilters();
    const enr = KPI.getEnrollmentRates(year, campus);

    document.getElementById('page-content').innerHTML = `
    <div class="page-header fade-in">
      <div class="page-header-left">
        <div class="page-title">📈 D-03 충원율 모니터링</div>
        <div class="page-subtitle">입학 정원 대비 실등록 현황 — 입학처</div>
      </div>
    </div>

    <div class="kpi-grid fade-in">
      ${kpiCard({ code: 'K01', icon: '🎓', value: enr.undergrad, unit: '%', label: '학부 충원율', trend: enr.undergrad >= 98 ? '목표 달성 ✓' : '목표 미달 ✗', trendDir: enr.undergrad >= 98 ? 'up' : 'down', barPct: enr.undergrad, color: '#3B6FE8' })}
      ${kpiCard({ code: 'K02', icon: '📖', value: enr.grad, unit: '%', label: '대학원 충원율', trend: enr.grad >= 80 ? '목표 달성 ✓' : '목표 미달 ✗', trendDir: enr.grad >= 80 ? 'up' : 'warn', barPct: enr.grad, color: enr.grad >= 80 ? '#10B981' : '#F97316' })}
      ${kpiCard({ code: '—', icon: '👥', value: enr.uEnrolled, unit: '명', label: '학부 실등록 인원', trend: `정원 ${enr.uQuota}명 대비`, trendDir: 'neutral', color: '#6366F1' })}
      ${kpiCard({ code: '—', icon: '👩‍🎓', value: enr.gEnrolled, unit: '명', label: '대학원 실등록 인원', trend: `정원 ${enr.gQuota}명 대비`, trendDir: 'neutral', color: '#EC4899' })}
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d1">
      <div class="chart-card">
        <div class="chart-title">학부·대학원 충원율 게이지</div>
        <div class="chart-subtitle">현재 기준년도 충원율</div>
        <div class="chart-body-lg" id="chart-d03-gauge" style="height:300px"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">충원율 5년 추이</div>
        <div class="chart-subtitle">인천·경기 캠퍼스 학부 충원율 변화</div>
        <div class="chart-body-lg" id="chart-d03-trend" style="height:300px"></div>
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d2">
      <div class="chart-card">
        <div class="chart-title">대학원 충원율 추이</div>
        <div class="chart-subtitle">인천 대학원 연도별 충원 현황</div>
        <div class="chart-body" id="chart-d03-grad-trend"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">캠퍼스별 연도별 등록 인원</div>
        <div class="chart-subtitle">학부 실등록 인원 비교</div>
        <div class="chart-body" id="chart-d03-enrolled"></div>
      </div>
    </div>

    <div class="data-table-wrapper fade-in fade-in-d3">
      <div class="data-table-header">
        <span class="data-table-title">📋 연도별 충원율 상세</span>
      </div>
      <table class="data-table">
        <thead><tr>
          <th>연도</th><th>캠퍼스</th><th>구분</th><th>입학정원</th><th>실등록</th><th>충원율</th><th>중도탈락</th><th>상태</th>
        </tr></thead>
        <tbody>
          ${MOCK.admissions.filter(r => (year === 'all' || r.year === parseInt(year)) && (campus === 'all' || r.campus === campus)).map(r => {
      const ok = r.type === '학부' ? r.rate >= 98 : r.rate >= 80;
      return `<tr>
              <td><b>${r.year}년</b></td>
              <td>${r.campus === 'incheon' ? '인천' : '경기'}</td>
              <td>${r.type}</td>
              <td>${r.quota}명</td>
              <td>${r.enrolled}명</td>
              <td><b>${r.rate}%</b></td>
              <td>${r.dropout}명</td>
              <td>${ok ? badge('정상', 'success') : badge('주의', 'danger')}</td>
            </tr>`;
    }).join('')}
        </tbody>
      </table>
    </div>`;

    setTimeout(() => {
      CHARTS.gaugeChart('chart-d03-gauge', [
        { name: '학부 충원율', value: enr.undergrad, color: '#3B6FE8' },
        { name: '대학원 충원율', value: enr.grad, color: enr.grad >= 80 ? '#10B981' : '#F97316' },
      ]);

      const uTrend = KPI.getEnrollmentTrend('undergrad');
      CHARTS.lineChart('chart-d03-trend',
        uTrend.map(t => t.year),
        [
          { name: '인천 캠퍼스', data: uTrend.map(t => t.incheon), color: '#3B6FE8', area: true },
          { name: '경기 캠퍼스', data: uTrend.map(t => t.gyeonggi), color: '#10B981', area: true },
          { name: '목표(98%)', data: uTrend.map(() => 98), color: '#F59E0B' },
        ],
        { yMin: 85, yMax: 110 }
      );

      const gTrend = KPI.getEnrollmentTrend('grad');
      CHARTS.lineChart('chart-d03-grad-trend',
        gTrend.map(t => t.year),
        [
          { name: '대학원 충원율', data: gTrend.map(t => t.incheon), color: '#EC4899', area: true },
          { name: '목표(80%)', data: gTrend.map(() => 80), color: '#F59E0B' },
        ],
        { yMin: 65, yMax: 100 }
      );

      const years = [2019, 2020, 2021, 2022, 2023, 2024];
      const getEnrolled = (y, c, t) => MOCK.admissions.find(r => r.year === y && r.campus === c && r.type === t)?.enrolled || 0;
      CHARTS.barChart('chart-d03-enrolled',
        years.map(String),
        [
          { name: '인천 학부', data: years.map(y => getEnrolled(y, 'incheon', '학부')), color: '#3B6FE8' },
          { name: '경기 학부', data: years.map(y => getEnrolled(y, 'gyeonggi', '학부')), color: '#10B981' },
        ],
        { yMax: 220, unit: '명' }
      );
    }, 100);
  }

  // ─── D-04: 학생 생애주기 추적 ────────────────────────────

  function renderD04() {
    const students = MOCK.students;

    document.getElementById('page-content').innerHTML = `
    <div class="page-header fade-in">
      <div class="page-header-left">
        <div class="page-title">👤 D-04 학생 생애주기 추적</div>
        <div class="page-subtitle">입학→재학→실습→졸업→임용 전주기 타임라인 — 지도교수 권한 기반</div>
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in">
      <div class="chart-card">
        <div class="chart-title">⚠️ 위험 학생 조기 알림</div>
        <div class="chart-subtitle">임계 조건 충족 학생 목록</div>
        ${students.filter(s => s.risk === 'high').map(s => `
        <div class="alert-item critical" style="margin-bottom:8px">
          <span class="alert-icon">🔴</span>
          <div class="alert-content">
            <div class="alert-title">${s.name} (${s.id}) — ${s.campus} · ${s.admYear}학번</div>
            <div class="alert-desc">GPA ${s.gpa} · ${s.result === 'na' ? '미응시' : '임용 불합격'} · ${s.altCareer || '진로 미정'}</div>
          </div>
        </div>`).join('')}
        ${students.filter(s => s.risk === 'medium').map(s => `
        <div class="alert-item warning" style="margin-bottom:8px">
          <span class="alert-icon">🟡</span>
          <div class="alert-content">
            <div class="alert-title">${s.name} (${s.id}) — ${s.campus} · ${s.admYear}학번</div>
            <div class="alert-desc">GPA ${s.gpa} · ${s.result === 'fail' ? '임용 불합격' : '응시 예정'} · 지속 모니터링 필요</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="chart-card">
        <div class="chart-title">학생 분포 현황</div>
        <div class="chart-subtitle">위험도 · 임용 결과별</div>
        <div class="chart-body" id="chart-d04-risk"></div>
      </div>
    </div>

    <div class="data-table-wrapper fade-in fade-in-d1">
      <div class="data-table-header">
        <span class="data-table-title">📋 학생 생애주기 목록</span>
        <input class="data-table-search" placeholder="학생 검색..." id="d04-search" />
      </div>
      <table class="data-table">
        <thead><tr>
          <th>학번</th><th>캠퍼스</th><th>입학년도</th><th>전형</th><th>학점</th>
          <th>졸업년도</th><th>임용결과</th><th>소요기간</th><th>위험도</th>
        </tr></thead>
        <tbody>
          ${students.map(s => `<tr>
            <td><b>${s.id}</b></td>
            <td>${s.campus}</td>
            <td>${s.admYear}년</td>
            <td>${badge(s.admType, 'primary')}</td>
            <td>${s.gpa}</td>
            <td>${s.gradYear !== undefined && s.gradYear <= 2025 ? s.gradYear + '년' : '재학 중'}</td>
            <td>${s.result === 'pass' ? badge('합격', 'success') : s.result === 'fail' ? badge('불합격', 'danger') : s.result === 'na' ? badge('미응시', 'muted') : badge('재학중', 'info')}</td>
            <td>${s.yearsToPass !== null ? s.yearsToPass + '년' : '—'}</td>
            <td>${s.risk === 'high' ? badge('위험', 'danger') : s.risk === 'medium' ? badge('주의', 'warning') : badge('정상', 'success')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="chart-card fade-in fade-in-d2" style="margin-top:16px">
      <div class="chart-title">전주기 타임라인 — 샘플 학생 (S001)</div>
      <div class="chart-subtitle">6단계 데이터 흐름 시각화</div>
      <div style="padding:16px 0">
        <div class="timeline">
          ${[
        { icon: '🏫', label: '① 입학 (2019년)', detail: '수시 전형 · 인천 캠퍼스 · 학점취득 시작', state: 'done' },
        { icon: '📚', label: '② 재학 (2019~2023년)', detail: 'GPA 3.82 · 전공 이수 134학점 · 장학금 수혜 4회', state: 'done' },
        { icon: '🏫', label: '③ 교육실습 (2022년)', detail: '인천부개초 · 평가 점수 91.5점 · A등급', state: 'done' },
        { icon: '🎓', label: '④ 졸업 (2023년)', detail: '교원자격증 취득 · 초등교육학사', state: 'done' },
        { icon: '✏️', label: '⑤ 임용시험 (2024년)', detail: '경기 지역 응시 · 1회 만에 합격', state: 'done' },
        { icon: '🏫', label: '⑥ 현장 (2024년~)', detail: '경기 성남 공립초 발령 · 2학년 담임', state: 'active' },
      ].map(t => `
          <div class="timeline-item">
            <div class="timeline-dot ${t.state}">${t.icon}</div>
            <div class="timeline-content">
              <div class="timeline-label">${t.label}</div>
              <div class="timeline-detail">${t.detail}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;

    setTimeout(() => {
      const riskData = [
        { label: '정상', count: students.filter(s => s.risk === 'low').length, color: '#10B981' },
        { label: '주의', count: students.filter(s => s.risk === 'medium').length, color: '#F59E0B' },
        { label: '위험', count: students.filter(s => s.risk === 'high').length, color: '#EF4444' },
      ];
      CHARTS.pieChart('chart-d04-risk', riskData, { donut: true });
    }, 100);
  }

  // ─── D-05: 비임용 진로 현황 ──────────────────────────────

  function renderD05() {
    const { year, campus } = getFilters();
    const alt = KPI.getAltCareerRate(year, campus);

    document.getElementById('page-content').innerHTML = `
    <div class="page-header fade-in">
      <div class="page-header-left">
        <div class="page-title">🌐 D-05 비임용 진로 현황</div>
        <div class="page-subtitle">임용 외 진로 다각화 현황 분석 — 취업지원팀</div>
      </div>
    </div>

    <div class="kpi-grid fade-in">
      ${kpiCard({ code: 'K07', icon: '🌐', value: alt.rate, unit: '%', label: '비임용 진로 다각화율', trend: `비임용 ${alt.alt}명 / 전체 ${alt.total}명`, trendDir: 'neutral', barPct: alt.rate, color: '#6366F1' })}
      ${kpiCard({ code: '—', icon: '🎓', value: '28.0', unit: '%', label: '대학원 진학', trend: '비임용 진로 1위', trendDir: 'up', barPct: 28, color: '#6366F1' })}
      ${kpiCard({ code: '—', icon: '💼', value: '22.0', unit: '%', label: '사기업 취업', trend: '비임용 진로 2위', trendDir: 'neutral', barPct: 22, color: '#F59E0B' })}
      ${kpiCard({ code: '—', icon: '🏛️', value: '19.0', unit: '%', label: '공무원·교육공무직', trend: '비임용 진로 3위', trendDir: 'up', barPct: 19, color: '#10B981' })}
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d1">
      <div class="chart-card">
        <div class="chart-title">비임용 진로 분포</div>
        <div class="chart-subtitle">트랙별 현황 (전체 비임용 진로자 기준)</div>
        <div class="chart-body-lg" id="chart-d05-pie" style="height:300px"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">연도별 비임용 진로율 추이</div>
        <div class="chart-subtitle">졸업 연도별 비임용 진로자 비율</div>
        <div class="chart-body-lg" id="chart-d05-trend" style="height:300px"></div>
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d2">
      <div class="chart-card">
        <div class="chart-title">마이크로디그리 연계 현황</div>
        <div class="chart-subtitle">비임용 진로 트랙별 이수 현황 (P5 연동 예정)</div>
        <div class="chart-body" id="chart-d05-micro"></div>
      </div>
      <div class="alert-panel fade-in fade-in-d2">
        <div class="alert-panel-title">📊 비임용 진로 정책 시사점</div>
        ${alertItem({ icon: '💡', type: 'info', title: '대학원 진학 비율 증가 추세', desc: '2022년 이후 대학원 진학 비율이 꾸준히 증가(+3.2%p). 교육학 전문성 심화 수요 반영.' })}
        ${alertItem({ icon: '🎯', type: 'info', title: '마이크로디그리 연계 필요', desc: '비임용 진로자 중 교육 관련 스타트업 진출 증가. 스타트업 연계 마이크로디그리 과정 개발 권장.' })}
        ${alertItem({ icon: '📋', type: 'warning', title: '진로 데이터 수집 강화 필요', desc: '비임용 진로자 중 상세 진로 미파악 비율 약 18%. 졸업 후 6개월 시점 추적 조사 권장.' })}
      </div>
    </div>

    <div class="data-table-wrapper fade-in fade-in-d3">
      <div class="data-table-header">
        <span class="data-table-title">📋 비임용 진로 유형별 상세</span>
      </div>
      <table class="data-table">
        <thead><tr><th>진로 유형</th><th>인원</th><th>비율</th><th>5년 추이</th><th>비고</th></tr></thead>
        <tbody>
          ${MOCK.altCareers.map(a => `<tr>
            <td><span style="color:${a.color}">●</span> <b>${a.label}</b></td>
            <td>${a.count}명</td>
            <td>${a.pct}%</td>
            <td><div class="progress-bar" style="width:120px;display:inline-block;vertical-align:middle"><div class="progress-fill" style="width:${a.pct * 5}%;background:${a.color}"></div></div></td>
            <td>${a.label === '대학원 진학' ? badge('증가 추세', 'success') : a.label === '사기업 취업' ? badge('유지', 'muted') : badge('파악 중', 'warning')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

    setTimeout(() => {
      CHARTS.pieChart('chart-d05-pie', MOCK.altCareers, { donut: true });

      const years = [2019, 2020, 2021, 2022, 2023, 2024];
      const altRates = years.map(y => KPI.getAltCareerRate(y, campus).rate);
      CHARTS.lineChart('chart-d05-trend',
        years,
        [{ name: '비임용 진로율', data: altRates, color: '#6366F1', area: true }],
        { yMin: 0, yMax: 30 }
      );

      CHARTS.barChart('chart-d05-micro',
        ['교육SW\n마이크로디그리', '글로벌교육\n트랙', '교육창업\n입문', '특수교육\n보조'],
        [{ name: '이수자', data: [34, 18, 12, 9], color: '#10B981' }],
        { yMax: 50, unit: '명' }
      );
    }, 100);
  }

  // ─── D-06: 환류 리포트 ───────────────────────────────────

  function renderD06() {
    const { year, campus } = getFilters();
    const triggers = FEEDBACK.evaluate(year, campus);
    const active = triggers.filter(t => t.triggered);

    document.getElementById('page-content').innerHTML = `
    <div class="page-header fade-in">
      <div class="page-header-left">
        <div class="page-title">🔄 D-06 환류 리포트</div>
        <div class="page-subtitle">KPI 이탈 자동 탐지 · 교육과정위원회 환류 — 교육과정위원회</div>
      </div>
    </div>

    <div class="kpi-grid fade-in">
      ${kpiCard({ code: '—', icon: '🚨', value: active.filter(t => t.severity === 'critical').length, unit: '건', label: '긴급 환류 트리거', trend: active.filter(t => t.severity === 'critical').length === 0 ? '모두 정상' : '즉시 대응 필요', trendDir: active.filter(t => t.severity === 'critical').length === 0 ? 'up' : 'down', barPct: 0, color: '#EF4444' })}
      ${kpiCard({ code: '—', icon: '⚠️', value: active.filter(t => t.severity === 'warning').length, unit: '건', label: '주의 환류 트리거', trend: '검토 권고', trendDir: active.filter(t => t.severity === 'warning').length === 0 ? 'up' : 'warn', barPct: 0, color: '#F97316' })}
      ${kpiCard({ code: '—', icon: '✅', value: triggers.length - active.length, unit: '건', label: '정상 범위 KPI', trend: '임계값 이내', trendDir: 'up', barPct: (triggers.length - active.length) / triggers.length * 100, color: '#10B981' })}
      ${kpiCard({ code: '—', icon: '📋', value: 2, unit: '건', label: '교육과정 개선 진행 중', trend: '위원회 검토 중', trendDir: 'neutral', barPct: 45, color: '#6366F1' })}
    </div>

    <div class="chart-card fade-in fade-in-d1">
      <div class="chart-title">🔔 환류 트리거 현황 (T-01 ~ T-06)</div>
      <div class="chart-subtitle">자동 탐지 결과 — 현재 필터 기준</div>
      <div style="margin-top:16px">
        <div class="trigger-grid">
          ${triggers.map(t => `
          <div class="trigger-item">
            <div class="trigger-id">${t.id}</div>
            <div class="trigger-info">
              <div class="trigger-label">${t.icon} ${t.label}</div>
              <div class="trigger-condition">${t.condition} | ${t.detail}</div>
            </div>
            <div class="trigger-status">
              ${t.triggered
        ? `${badge(t.severity === 'critical' ? '🚨 긴급' : '⚠️ 주의', t.severity === 'critical' ? 'danger' : 'warning')}`
        : badge('✅ 정상', 'success')
      }
            </div>
            <div style="font-size:11px;color:var(--text-muted);min-width:80px">${t.responsible.split(',')[0]}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="charts-grid charts-grid-2 fade-in fade-in-d2">
      <div class="chart-card">
        <div class="chart-title">KPI 달성 현황 레이더</div>
        <div class="chart-subtitle">8개 KPI 목표값 대비 현재 달성률</div>
        <div class="chart-body" id="chart-d06-radar"></div>
      </div>
      <div class="chart-card alert-panel">
        <div class="alert-panel-title">📋 교육과정 환류 절차 현황</div>
        ${[
        { step: '1단계', label: '자동 분석 리포트 생성', status: '완료', type: 'success' },
        { step: '2단계', label: '교육과정위원회 안건 등록', status: '완료', type: 'success' },
        { step: '3단계', label: '위원회 검토 중 (2025-01-15)', status: '진행 중', type: 'warning' },
        { step: '4단계', label: '개선안 작성 및 승인', status: '대기', type: 'muted' },
        { step: '5단계', label: '차기 학기 교육과정 반영', status: '대기', type: 'muted' },
      ].map(s => `
        <div class="alert-item ${s.type === 'success' ? 'success' : s.type === 'warning' ? 'warning' : ''}">
          <span class="alert-icon">${s.type === 'success' ? '✅' : s.type === 'warning' ? '🔄' : '⏳'}</span>
          <div class="alert-content">
            <div class="alert-title">${s.step}: ${s.label}</div>
            <div class="alert-desc">${badge(s.status, s.type)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="data-table-wrapper fade-in fade-in-d3">
      <div class="data-table-header">
        <span class="data-table-title">📋 교육과정 개선 제안 목록</span>
      </div>
      <table class="data-table">
        <thead><tr><th>제안 코드</th><th>연관 KPI</th><th>제안 내용</th><th>상태</th><th>담당</th><th>목표 반영 학기</th></tr></thead>
        <tbody>
          <tr>
            <td><b>FR-2024-01</b></td>
            <td>K04 임용합격률</td>
            <td>수업실기 강화 — 교원임용 대비 모의수업 확대, 진로인성교육센터 임용 특강 확대</td>
            <td>${badge('검토 중', 'warning')}</td>
            <td>교무처 학사팀 / 학생처 진로인성교육센터</td>
            <td>2025-1학기</td>
          </tr>
          <tr>
            <td><b>FR-2024-02</b></td>
            <td>K02 대학원 충원율</td>
            <td>대학원 모집 전략 다각화 — 현직교사 대상 홍보 강화 및 장학금 확대</td>
            <td>${badge('검토 중', 'warning')}</td>
            <td>교무처 교무팀 / 입학본부</td>
            <td>2025-2학기</td>
          </tr>
          <tr>
            <td><b>FR-2023-03</b></td>
            <td>K08 실습 우수 비율</td>
            <td>교육실습 사전 교육 강화 — 실습 매뉴얼 개정 및 협력학교 확대</td>
            <td>${badge('완료', 'success')}</td>
            <td>교무처 학사팀 (교육실습 담당)</td>
            <td>2024-1학기 (적용 완료)</td>
          </tr>
        </tbody>
      </table>
    </div>`;

    setTimeout(() => {
      const { year: y, campus: c } = getFilters();
      const enr = KPI.getEnrollmentRates(y, c);
      const examR = KPI.getExamRate(y, c);
      const passR = KPI.getPassRate(y, c);
      const avgYr = KPI.getAvgYearsToPass(y, c);
      const practR = KPI.getPracticumExcRate(y, c);

      CHARTS.radarChart('chart-d06-radar',
        [
          { name: '학부충원율(K01)', max: 110 },
          { name: '대학원충원율(K02)', max: 110 },
          { name: '응시율(K03)', max: 100 },
          { name: '합격률(K04)', max: 100 },
          { name: '소요기간(K05)', max: 100 },
          { name: '5년임용률(K06)', max: 100 },
          { name: '비임용율(K07)', max: 30 },
          { name: '실습우수(K08)', max: 100 },
        ],
        [{
          name: '현재 달성률',
          value: [enr.undergrad, enr.grad, examR.rate, passR.rate, (3 - avgYr.avg) / 3 * 100, 72, 16, practR.rate],
          itemStyle: { color: '#3B6FE8' },
          lineStyle: { color: '#3B6FE8' },
        }, {
          name: '목표값',
          value: [98, 80, 90, 70, 100, 80, 20, 60],
          itemStyle: { color: '#10B981' },
          lineStyle: { color: '#10B981', type: 'dashed' },
        }]
      );
    }, 100);
  }

  // ─── RBAC 접근 제어 ──────────────────────────────────────

  const ROLE_ACCESS = {
    // d01(종합현황), d03(충원율), d05(비임용진로) — 모든 역할 공통 접근 허용
    admin: { d01: true, d02: true, d03: true, d04: true, d05: true, d06: true },
    president: { d01: true, d02: true, d03: true, d04: false, d05: true, d06: true },
    academic: { d01: true, d02: true, d03: true, d04: true, d05: true, d06: true },
    admission: { d01: true, d02: false, d03: true, d04: false, d05: true, d06: false },
    career: { d01: true, d02: true, d03: true, d04: false, d05: true, d06: false },
    professor: { d01: true, d02: false, d03: true, d04: true, d05: true, d06: false },
    researcher: { d01: true, d02: true, d03: true, d04: false, d05: true, d06: true },
  };

  function canAccess(role, page) {
    return ROLE_ACCESS[role]?.[page] ?? false;
  }

  function renderAccessDenied(page) {
    document.getElementById('page-content').innerHTML = `
    <div class="access-denied">
      <div class="access-denied-icon">🔒</div>
      <div class="access-denied-title">접근 권한 없음</div>
      <div class="access-denied-desc">현재 역할(${APP_STATE.roleName})은 ${page.toUpperCase()} 화면에\n접근할 수 있는 권한이 없습니다.<br/>관리자에게 권한을 요청하세요.</div>
    </div>`;
  }

  const PAGE_NAMES = {
    d01: '종합 현황', d02: '임용 분석 상세', d03: '충원율 모니터링',
    d04: '학생 생애주기', d05: '비임용 진로', d06: '환류 리포트',
  };

  const PAGE_RENDERERS = { d01: renderD01, d02: renderD02, d03: renderD03, d04: renderD04, d05: renderD05, d06: renderD06 };

  function render(page) {
    const role = APP_STATE.role;
    document.getElementById('breadcrumb').textContent = PAGE_NAMES[page] || page;

    // 메뉴 활성화
    document.querySelectorAll('.menu-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    if (!canAccess(role, page)) {
      renderAccessDenied(page);
      return;
    }
    PAGE_RENDERERS[page]?.();
  }

  return { render, canAccess, ROLE_ACCESS, PAGE_NAMES };
})();
