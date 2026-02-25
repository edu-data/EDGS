// ============================================================
//  EDGS Mock Data — 전주기 교육데이터 샘플셋
//  경인교육대학교 EduData Governance System
// ============================================================

// ── Helper constants (먼저 선언) ───────────────────────────
const REGIONS_DATA = [
    { name: '경기', pct: 32 }, { name: '인천', pct: 24 },
    { name: '서울', pct: 14 }, { name: '충청', pct: 9 },
    { name: '전라', pct: 7 }, { name: '강원', pct: 5 },
    { name: '경상', pct: 5 }, { name: '기타', pct: 4 },
];
const SCHOOLS_DATA = ['인천부개초', '경기성남초', '인천간석초', '경기수원초', '인천계양초', '경기고양초', '서울상원초', '경기안산초'];

function _randAdmType() { return ['수시', '수시', '수시', '정시', '정시', '특별'][Math.floor(Math.random() * 6)]; }
function _randCampus() { return Math.random() > 0.5 ? 'incheon' : 'gyeonggi'; }
function _randAltCareer() { return ['대학원 진학', '사기업 취업', '공무원', '교육 스타트업', '기타'][Math.floor(Math.random() * 5)]; }

// ── 임용 데이터 생성 함수 ──────────────────────────────────
function _generateEmployment(gradYear, total, opts) {
    const rows = [];
    const examinees = Math.round(total * 0.84);
    const passCount = Math.round(examinees * opts.passRate);
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

// ── 전역 MOCK 객체 (window에 직접 할당) ───────────────────
window.MOCK = (function () {

    // 1. 연도별 입학·충원 데이터
    var admissions = [
        { year: 2019, campus: 'incheon', type: '학부', quota: 200, enrolled: 196, rate: 98.0, dropout: 3 },
        { year: 2019, campus: 'gyeonggi', type: '학부', quota: 200, enrolled: 201, rate: 100.5, dropout: 2 },
        { year: 2019, campus: 'incheon', type: '대학원', quota: 40, enrolled: 31, rate: 77.5, dropout: 0 },
        { year: 2020, campus: 'incheon', type: '학부', quota: 200, enrolled: 194, rate: 97.0, dropout: 4 },
        { year: 2020, campus: 'gyeonggi', type: '학부', quota: 200, enrolled: 198, rate: 99.0, dropout: 3 },
        { year: 2020, campus: 'incheon', type: '대학원', quota: 40, enrolled: 34, rate: 85.0, dropout: 1 },
        { year: 2021, campus: 'incheon', type: '학부', quota: 200, enrolled: 199, rate: 99.5, dropout: 2 },
        { year: 2021, campus: 'gyeonggi', type: '학부', quota: 200, enrolled: 200, rate: 100.0, dropout: 1 },
        { year: 2021, campus: 'incheon', type: '대학원', quota: 40, enrolled: 32, rate: 80.0, dropout: 0 },
        { year: 2022, campus: 'incheon', type: '학부', quota: 200, enrolled: 197, rate: 98.5, dropout: 3 },
        { year: 2022, campus: 'gyeonggi', type: '학부', quota: 200, enrolled: 202, rate: 101.0, dropout: 2 },
        { year: 2022, campus: 'incheon', type: '대학원', quota: 40, enrolled: 33, rate: 82.5, dropout: 1 },
        { year: 2023, campus: 'incheon', type: '학부', quota: 200, enrolled: 196, rate: 98.0, dropout: 5 },
        { year: 2023, campus: 'gyeonggi', type: '학부', quota: 200, enrolled: 198, rate: 99.0, dropout: 3 },
        { year: 2023, campus: 'incheon', type: '대학원', quota: 40, enrolled: 30, rate: 75.0, dropout: 2 },
        { year: 2024, campus: 'incheon', type: '학부', quota: 200, enrolled: 196, rate: 98.0, dropout: 2 },
        { year: 2024, campus: 'gyeonggi', type: '학부', quota: 200, enrolled: 201, rate: 100.5, dropout: 1 },
        { year: 2024, campus: 'incheon', type: '대학원', quota: 40, enrolled: 31, rate: 77.5, dropout: 0 },
    ];

    // 2. 임용 시험 데이터
    var employment = [].concat(
        _generateEmployment(2019, 380, { passRate: 0.68, avgYears: 1.6 }),
        _generateEmployment(2020, 385, { passRate: 0.70, avgYears: 1.7 }),
        _generateEmployment(2021, 390, { passRate: 0.72, avgYears: 1.8 }),
        _generateEmployment(2022, 395, { passRate: 0.74, avgYears: 1.8 }),
        _generateEmployment(2023, 392, { passRate: 0.72, avgYears: 1.9 }),
        _generateEmployment(2024, 388, { passRate: 0.724, avgYears: 1.8 })
    );

    // 3. 교육실습 데이터
    var practicum = [];
    for (var y = 2020; y <= 2024; y++) {
        for (var i = 0; i < 180; i++) {
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

    // 4. 비임용 진로 데이터
    var altCareers = [
        { label: '대학원 진학', count: 112, pct: 28.0, color: '#6366F1' },
        { label: '사기업 취업', count: 88, pct: 22.0, color: '#F59E0B' },
        { label: '공무원·교육공무직', count: 76, pct: 19.0, color: '#10B981' },
        { label: '교육 관련 스타트업', count: 52, pct: 13.0, color: '#3B6FE8' },
        { label: '기타 교육기관', count: 44, pct: 11.0, color: '#EC4899' },
        { label: '기타', count: 28, pct: 7.0, color: '#8B98B8' },
    ];

    // 5. KPI 연도별 요약 (차트 보조용)
    var kpiSummary = {
        2019: { enrU: 99.3, enrG: 77.5, passRate: 68.0, examRate: 83.2, avgYears: 1.6, practExc: 58.2 },
        2020: { enrU: 98.0, enrG: 85.0, passRate: 70.0, examRate: 83.8, avgYears: 1.7, practExc: 60.1 },
        2021: { enrU: 99.8, enrG: 80.0, passRate: 72.0, examRate: 84.1, avgYears: 1.8, practExc: 62.4 },
        2022: { enrU: 99.8, enrG: 82.5, passRate: 74.0, examRate: 84.5, avgYears: 1.8, practExc: 64.2 },
        2023: { enrU: 98.5, enrG: 75.0, passRate: 72.0, examRate: 84.0, avgYears: 1.9, practExc: 61.5 },
        2024: { enrU: 99.1, enrG: 77.5, passRate: 72.4, examRate: 84.2, avgYears: 1.8, practExc: 62.8 },
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
        { id: 'S008', name: '장○○', campus: '경기', admYear: 2020, admType: '수시', gpa: 3.55, gradYear: 2024, examRegion: '전라', result: 'pass', passYear: 2025, yearsToPass: 1, risk: 'low' },
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
    };
})();
