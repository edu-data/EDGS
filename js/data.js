// ============================================================
//  EDGS Mock Data — 경인교육대학교 실제 통계 기반 데이터셋
//  출처: 경인교육대학교 공시, 교육부 교원통계, 언론 보도
//  ※ 연구용 프로토타입 — 일부 수치는 공개 자료 기반 추정치 포함
// ============================================================

// ── 보조 헬퍼 ─────────────────────────────────────────────
const REGIONS_DATA = [
    { name: '경기', pct: 38 }, { name: '인천', pct: 28 },
    { name: '서울', pct: 10 }, { name: '충청', pct: 7 },
    { name: '전라', pct: 5 }, { name: '강원', pct: 5 },
    { name: '경상', pct: 4 }, { name: '기타', pct: 3 },
];
const SCHOOLS_DATA = [
    '인천부개초', '경기성남초', '인천간석초', '경기수원초',
    '인천계양초', '경기고양초', '서울상원초', '경기안산초'
];

function _randAdmType() { return ['수시', '수시', '수시', '정시', '정시', '특별'][Math.floor(Math.random() * 6)]; }
function _randCampus() { return Math.random() > 0.5 ? 'incheon' : 'gyeonggi'; }
function _randAltCareer() { return ['대학원 진학', '사기업 취업', '공무원', '교육 스타트업', '기타'][Math.floor(Math.random() * 5)]; }

function _generateEmployment(gradYear, total, opts) {
    const rows = [];
    const examinees = Math.round(total * opts.examRate);
    const passCount = Math.round(examinees * (opts.passRate / 100));
    const failCount = examinees - passCount;
    const nonExam = total - examinees;

    let id = 1;
    function nextId() { return 'E' + gradYear + '-' + String(id++).padStart(4, '0'); }

    for (let i = 0; i < passCount; i++) {
        const yearsToPass = Math.max(0, Math.round(opts.avgYears + (Math.random() - 0.5) * 1.2));
        const r = REGIONS_DATA[Math.floor(Math.random() * REGIONS_DATA.length)];
        rows.push({
            id: nextId(), gradYear, examYear: gradYear + yearsToPass,
            region: r.name, result: 'pass', yearsToPass,
            admType: _randAdmType(), campus: _randCampus(), gpa: +(3.0 + Math.random() * 1.0).toFixed(2),
        });
    }
    for (let i = 0; i < failCount; i++) {
        const r = REGIONS_DATA[Math.floor(Math.random() * REGIONS_DATA.length)];
        rows.push({
            id: nextId(), gradYear, examYear: gradYear,
            region: r.name, result: 'fail', yearsToPass: null,
            admType: _randAdmType(), campus: _randCampus(), gpa: +(2.5 + Math.random() * 1.5).toFixed(2),
        });
    }
    for (let i = 0; i < nonExam; i++) {
        rows.push({
            id: nextId(), gradYear, examYear: null,
            region: null, result: 'na', yearsToPass: null,
            altCareer: _randAltCareer(),
            admType: _randAdmType(), campus: _randCampus(), gpa: +(2.0 + Math.random() * 2.0).toFixed(2),
        });
    }
    return rows;
}

// ── 전역 MOCK 객체 ─────────────────────────────────────────
window.MOCK = (function () {

    // ────────────────────────────────────────────────────────
    //  1. 입학 · 충원율 데이터 (실제 공시 기반)
    //
    //  주요 출처:
    //  - 경인교육대학교 입학처 공시 (ginue.ac.kr)
    //  - 대학알리미 정보공시
    //  - 2024~2025 학부 총정원: 526명 (인천263 + 경기263)
    //  - 2024 대학원 석사 충원율: 75.6% (647명 정원)
    //  - 2025 대학원 석사 충원율: 76.4%
    //  ─── ※ 2019~2023 학부 정원은 당시 598명(인천299+경기299) 기준 ───
    // ────────────────────────────────────────────────────────
    var admissions = [
        // 2020 (학부 정원 598명, 미충원 약 1~2%)
        { year: 2020, campus: 'incheon', type: '학부', quota: 299, enrolled: 296, rate: 99.0, dropout: 3, source: '추정' },
        { year: 2020, campus: 'gyeonggi', type: '학부', quota: 299, enrolled: 301, rate: 100.7, dropout: 2, source: '추정' },
        { year: 2020, campus: 'incheon', type: '대학원', quota: 324, enrolled: 290, rate: 89.5, dropout: 1, source: '추정' },
        // 2021
        { year: 2021, campus: 'incheon', type: '학부', quota: 299, enrolled: 298, rate: 99.7, dropout: 2, source: '추정' },
        { year: 2021, campus: 'gyeonggi', type: '학부', quota: 299, enrolled: 300, rate: 100.3, dropout: 1, source: '추정' },
        { year: 2021, campus: 'incheon', type: '대학원', quota: 324, enrolled: 278, rate: 85.8, dropout: 0, source: '추정' },
        // 2022 (학부 정원 598, 대학원 647명 기준 시작)
        { year: 2022, campus: 'incheon', type: '학부', quota: 299, enrolled: 297, rate: 99.3, dropout: 3, source: '추정' },
        { year: 2022, campus: 'gyeonggi', type: '학부', quota: 299, enrolled: 302, rate: 101.0, dropout: 2, source: '추정' },
        { year: 2022, campus: 'incheon', type: '대학원', quota: 324, enrolled: 255, rate: 78.7, dropout: 1, source: '추정' },
        // 2023 (학부 정원 598명 → 526명 축소 발표 이전)
        { year: 2023, campus: 'incheon', type: '학부', quota: 299, enrolled: 295, rate: 98.7, dropout: 5, source: '추정' },
        { year: 2023, campus: 'gyeonggi', type: '학부', quota: 299, enrolled: 298, rate: 99.7, dropout: 3, source: '추정' },
        { year: 2023, campus: 'incheon', type: '대학원', quota: 324, enrolled: 245, rate: 75.6, dropout: 2, source: '대학알리미' },
        // 2024 (학부 정원 526 = 263+263 / 대학원 647명 정원, 충원율 75.6% 공시)
        { year: 2024, campus: 'incheon', type: '학부', quota: 263, enrolled: 256, rate: 97.3, dropout: 4, source: '입학처 공시' },
        { year: 2024, campus: 'gyeonggi', type: '학부', quota: 263, enrolled: 260, rate: 98.9, dropout: 2, source: '입학처 공시' },
        { year: 2024, campus: 'incheon', type: '대학원', quota: 324, enrolled: 245, rate: 75.6, dropout: 1, source: '대학알리미 공시' },
        // 2025 (학부 정원 526명, 대학원 석사 충원율 76.4% / 박사 90.0% 공시)
        { year: 2025, campus: 'incheon', type: '학부', quota: 263, enrolled: 253, rate: 96.2, dropout: 2, source: '입학처 공시' },
        { year: 2025, campus: 'gyeonggi', type: '학부', quota: 263, enrolled: 258, rate: 98.1, dropout: 1, source: '입학처 공시' },
        { year: 2025, campus: 'incheon', type: '대학원', quota: 324, enrolled: 248, rate: 76.4, dropout: 0, source: '대학알리미 공시' },
    ];

    // ────────────────────────────────────────────────────────
    //  2. 임용시험 데이터 (실제 합격률 기반)
    //
    //  확인된 실제 수치 (출처: 언론/대학 공시):
    //   - 2020졸: 합격률 55.8% (졸업 622명 중 합격 347명)
    //   - 2022졸: 합격률 49.3% (졸업 682명 중 합격 336명)
    //   - 2023졸: 합격률 47.1% (졸업 615명 중 합격 261명)
    //   - 2024졸: 합격률 42.4% (전국평균 51.7% - 경인교대 하회)
    //   ※ 2021, 2025는 추정치
    //   ※ 응시율(examRate): 약 80~85% 추정
    //
    //  ★ 최근 하락 원인: 학령인구 감소 → 신규 초등교사 선발 축소
    // ────────────────────────────────────────────────────────
    var employment = [].concat(
        // 2020졸: 실제 55.8% (622명 졸업, 347명 합격)
        _generateEmployment(2020, 622, { examRate: 0.84, passRate: 55.8, avgYears: 1.5 }),
        // 2021졸: 추정 ~52% (교원 채용 축소 시작)
        _generateEmployment(2021, 635, { examRate: 0.83, passRate: 51.9, avgYears: 1.6 }),
        // 2022졸: 실제 49.3% (682명 졸업, 336명 합격)
        _generateEmployment(2022, 682, { examRate: 0.82, passRate: 49.3, avgYears: 1.7 }),
        // 2023졸: 실제 47.1% (615명 졸업, 261명 합격)
        _generateEmployment(2023, 615, { examRate: 0.81, passRate: 47.1, avgYears: 1.8 }),
        // 2024졸: 실제 42.4% (전국평균 51.7% 크게 하회)
        _generateEmployment(2024, 590, { examRate: 0.80, passRate: 42.4, avgYears: 1.9 }),
        // 2025졸: 추정 — 학령인구 감소 추세 지속, 유사 수준 예상
        _generateEmployment(2025, 521, { examRate: 0.79, passRate: 41.5, avgYears: 2.0 })
    );

    // 3. 교육실습 데이터
    var practicum = [];
    for (var y = 2020; y <= 2025; y++) {
        var count = y >= 2024 ? 140 : 180; // 2024~2025 정원 감소 반영
        for (var i = 0; i < count; i++) {
            var score = Math.min(100, Math.max(0, 60 + Math.random() * 40 + (Math.random() - 0.5) * 10));
            practicum.push({
                year: y,
                studentId: 'S' + y + '-' + String(i + 1).padStart(3, '0'),
                school: SCHOOLS_DATA[Math.floor(Math.random() * SCHOOLS_DATA.length)],
                score: +score.toFixed(1),
                grade: score >= 90 ? 'A+' : score >= 85 ? 'A' : score >= 80 ? 'B+' : score >= 75 ? 'B' : score >= 70 ? 'C+' : 'C',
                campus: _randCampus(),
            });
        }
    }

    // 4. 비임용 진로 데이터 (증가 추세 반영)
    var altCareers = [
        { label: '대학원 진학', count: 142, pct: 30.0, color: '#6366F1' },
        { label: '사기업 취업', count: 104, pct: 21.9, color: '#F59E0B' },
        { label: '공무원·교육공무직', count: 90, pct: 19.0, color: '#10B981' },
        { label: '교육 관련 스타트업', count: 58, pct: 12.2, color: '#3B6FE8' },
        { label: '기타 교육기관', count: 48, pct: 10.1, color: '#EC4899' },
        { label: '기타', count: 32, pct: 6.8, color: '#8B98B8' },
    ];

    // ────────────────────────────────────────────────────────
    //  5. KPI 연도별 요약
    //
    //  임용합격률 출처:
    //  - 2020: 55.8% (실제) / 2022: 49.3% (실제) / 2023: 47.1% (실제) / 2024: 42.4% (실제)
    //  - 2021, 2025: 추정치
    //  충원율 출처: 대학알리미, 경인교육대학교 입학처
    //  전국 평균 임용합격률: 2024학년도 51.7% (교육부/대학 공시)
    // ────────────────────────────────────────────────────────
    var kpiSummary = {
        2020: { enrU: 99.9, enrG: 89.5, passRate: 55.8, examRate: 84.0, avgYears: 1.5, practExc: 61.2, source: '실제(일부 추정)' },
        2021: { enrU: 100.0, enrG: 85.8, passRate: 51.9, examRate: 83.0, avgYears: 1.6, practExc: 60.5, source: '추정' },
        2022: { enrU: 100.2, enrG: 78.7, passRate: 49.3, examRate: 82.0, avgYears: 1.7, practExc: 59.8, source: '실제' },
        2023: { enrU: 99.2, enrG: 75.6, passRate: 47.1, examRate: 81.0, avgYears: 1.8, practExc: 58.3, source: '실제' },
        2024: { enrU: 98.1, enrG: 75.6, passRate: 42.4, examRate: 80.0, avgYears: 1.9, practExc: 57.0, source: '실제' },
        2025: { enrU: 97.1, enrG: 76.4, passRate: 41.5, examRate: 79.0, avgYears: 2.0, practExc: 56.0, source: '추정(2025학년도 공시 기준)' },
    };

    // 6. 학생 샘플 (D-04 생애주기)
    var students = [
        { id: 'S001', name: '김○○', campus: '인천', admYear: 2019, admType: '수시', gpa: 3.82, gradYear: 2023, examRegion: '경기', result: 'pass', passYear: 2024, yearsToPass: 1, risk: 'low' },
        { id: 'S002', name: '이○○', campus: '경기', admYear: 2020, admType: '정시', gpa: 3.41, gradYear: 2024, examRegion: '인천', result: 'fail', passYear: null, yearsToPass: null, risk: 'medium' },
        { id: 'S003', name: '박○○', campus: '인천', admYear: 2018, admType: '수시', gpa: 2.95, gradYear: 2022, examRegion: '서울', result: 'na', passYear: null, yearsToPass: null, risk: 'high', altCareer: '대학원 진학' },
        { id: 'S004', name: '최○○', campus: '경기', admYear: 2019, admType: '특별', gpa: 3.67, gradYear: 2023, examRegion: '경기', result: 'pass', passYear: 2024, yearsToPass: 1, risk: 'low' },
        { id: 'S005', name: '정○○', campus: '인천', admYear: 2020, admType: '정시', gpa: 3.15, gradYear: 2024, examRegion: '충청', result: 'fail', passYear: null, yearsToPass: null, risk: 'medium' },
        { id: 'S006', name: '강○○', campus: '인천', admYear: 2021, admType: '수시', gpa: 3.90, gradYear: 2025, examRegion: '경기', result: '_', passYear: null, yearsToPass: null, risk: 'low' },
        { id: 'S007', name: '윤○○', campus: '경기', admYear: 2019, admType: '정시', gpa: 2.78, gradYear: 2023, examRegion: '인천', result: 'fail', passYear: null, yearsToPass: null, risk: 'high' },
        { id: 'S008', name: '장○○', campus: '경기', admYear: 2021, admType: '수시', gpa: 3.55, gradYear: 2025, examRegion: '전라', result: '_', passYear: null, yearsToPass: null, risk: 'low' },
        { id: 'S009', name: '임○○', campus: '인천', admYear: 2018, admType: '정시', gpa: 2.62, gradYear: 2022, examRegion: '_', result: 'na', passYear: null, yearsToPass: null, risk: 'high', altCareer: '사기업 취업' },
        { id: 'S010', name: '한○○', campus: '경기', admYear: 2021, admType: '수시', gpa: 3.74, gradYear: 2025, examRegion: '_', result: '_', passYear: null, yearsToPass: null, risk: 'low' },
    ];

    return {
        admissions: admissions,
        employment: employment,
        practicum: practicum,
        altCareers: altCareers,
        kpiSummary: kpiSummary,
        students: students,
        REGIONS: REGIONS_DATA,
        // 데이터 출처 메타정보
        meta: {
            updated: '2026-02-25',
            sources: [
                '경인교육대학교 입학처 공시 (ginue.ac.kr)',
                '대학알리미 정보공시 (academyinfo.go.kr)',
                '교육부 교원임용통계',
                '언론보도 (에듀인뉴스, 베리타스알파 등)',
            ],
            disclaimer: '연구용 프로토타입 — 일부 수치(추정 표기)는 공개 자료 기반 추정치입니다.',
        },
    };
})();
