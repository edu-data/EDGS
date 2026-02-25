// ============================================================
//  EDGS KPI Engine — K01~K08 산출 함수
// ============================================================

window.KPI = (function () {

    // K01/K02: 학부/대학원 충원율
    function getEnrollmentRates(year, campus) {
        const rows = MOCK.admissions.filter(r =>
            (year === 'all' || r.year === parseInt(year)) &&
            (campus === 'all' || r.campus === campus)
        );
        const undergrad = rows.filter(r => r.type === '학부');
        const grad = rows.filter(r => r.type === '대학원');

        const uQuota = undergrad.reduce((s, r) => s + r.quota, 0);
        const uEnrolled = undergrad.reduce((s, r) => s + r.enrolled, 0);
        const gQuota = grad.reduce((s, r) => s + r.quota, 0);
        const gEnrolled = grad.reduce((s, r) => s + r.enrolled, 0);

        return {
            undergrad: uQuota ? +((uEnrolled / uQuota) * 100).toFixed(1) : 0,
            grad: gQuota ? +((gEnrolled / gQuota) * 100).toFixed(1) : 0,
            uQuota, uEnrolled, gQuota, gEnrolled,
        };
    }

    // K03: 임용 응시율 (응시자 / 졸업생)
    function getExamRate(year, campus) {
        const rows = MOCK.employment.filter(r =>
            (year === 'all' || r.gradYear === parseInt(year)) &&
            (campus === 'all' || r.campus === campus)
        );
        if (!rows.length) return { rate: 0, examinees: 0, total: 0 };
        const total = rows.length;
        const examinees = rows.filter(r => r.result !== 'na').length;
        return { rate: +((examinees / total) * 100).toFixed(1), examinees, total };
    }

    // K04: 임용 합격률 (합격 / 응시자)
    function getPassRate(year, campus) {
        const rows = MOCK.employment.filter(r =>
            (year === 'all' || r.gradYear === parseInt(year)) &&
            (campus === 'all' || r.campus === campus) &&
            r.result !== 'na'
        );
        if (!rows.length) return { rate: 0, pass: 0, examinees: 0 };
        const pass = rows.filter(r => r.result === 'pass').length;
        return { rate: +((pass / rows.length) * 100).toFixed(1), pass, examinees: rows.length };
    }

    // K05: 평균 임용 소요 기간
    function getAvgYearsToPass(year, campus) {
        const rows = MOCK.employment.filter(r =>
            (year === 'all' || r.gradYear === parseInt(year)) &&
            (campus === 'all' || r.campus === campus) &&
            r.result === 'pass' && r.yearsToPass !== null
        );
        if (!rows.length) return { avg: 0, count: 0 };
        const avg = rows.reduce((s, r) => s + r.yearsToPass, 0) / rows.length;
        return { avg: +avg.toFixed(1), count: rows.length };
    }

    // K06: 졸업 후 5년 임용률
    function get5YearPassRate(gradYear) {
        const rows = MOCK.employment.filter(r => r.gradYear === parseInt(gradYear));
        if (!rows.length) return { rate: 0, pass: 0, total: 0 };
        // 합격자 중 소요 기간 5년 이내
        const pass5 = rows.filter(r => r.result === 'pass' && r.yearsToPass <= 5).length;
        return { rate: +((pass5 / rows.length) * 100).toFixed(1), pass: pass5, total: rows.length };
    }

    // K07: 비임용 진로 다각화율
    function getAltCareerRate(year, campus) {
        const rows = MOCK.employment.filter(r =>
            (year === 'all' || r.gradYear === parseInt(year)) &&
            (campus === 'all' || r.campus === campus)
        );
        if (!rows.length) return { rate: 0, alt: 0, total: 0 };
        const alt = rows.filter(r => r.result === 'na').length;
        return { rate: +((alt / rows.length) * 100).toFixed(1), alt, total: rows.length };
    }

    // K08: 실습 평가 우수 비율 (상위 30%)
    function getPracticumExcRate(year, campus) {
        const rows = MOCK.practicum.filter(r =>
            (year === 'all' || r.year === parseInt(year)) &&
            (campus === 'all' || r.campus === campus)
        );
        if (!rows.length) return { rate: 0, exc: 0, total: 0 };
        const sortedScores = [...rows].map(r => r.score).sort((a, b) => b - a);
        const threshold = sortedScores[Math.floor(sortedScores.length * 0.3)] || 85;
        const exc = rows.filter(r => r.score >= threshold).length;
        return { rate: +((exc / rows.length) * 100).toFixed(1), exc, total: rows.length };
    }

    // 연도별 임용합격률 시계열 (차트용)
    function getPassRateTrend() {
        return [2019, 2020, 2021, 2022, 2023, 2024].map(y => ({
            year: y,
            rate: MOCK.kpiSummary[y].passRate,
            national: 65.0, // 전국 평균 (가상)
        }));
    }

    // 연도별 충원율 시계열 (차트용)
    function getEnrollmentTrend(type) {
        // type: 'undergrad' | 'grad'
        return [2019, 2020, 2021, 2022, 2023, 2024].map(y => ({
            year: y,
            incheon: type === 'undergrad' ?
                MOCK.admissions.find(r => r.year === y && r.campus === 'incheon' && r.type === '학부')?.rate || 0 :
                MOCK.admissions.find(r => r.year === y && r.campus === 'incheon' && r.type === '대학원')?.rate || 0,
            gyeonggi: type === 'undergrad' ?
                MOCK.admissions.find(r => r.year === y && r.campus === 'gyeonggi' && r.type === '학부')?.rate || 0 : 0,
        }));
    }

    // 응시 지역 분포 (차트용)
    function getRegionDistribution(year, campus) {
        const rows = MOCK.employment.filter(r =>
            (year === 'all' || r.gradYear === parseInt(year)) &&
            (campus === 'all' || r.campus === campus) &&
            r.result === 'pass' && r.region
        );
        const map = {};
        rows.forEach(r => { map[r.region] = (map[r.region] || 0) + 1; });
        const total = Object.values(map).reduce((s, v) => s + v, 0);
        return Object.entries(map)
            .map(([name, count]) => ({ name, count, pct: total ? +((count / total) * 100).toFixed(1) : 0 }))
            .sort((a, b) => b.count - a.count);
    }

    // 임용 소요 기간 히스토그램 (차트용)
    function getYearsHistogram(year, campus) {
        const rows = MOCK.employment.filter(r =>
            (year === 'all' || r.gradYear === parseInt(year)) &&
            (campus === 'all' || r.campus === campus) &&
            r.result === 'pass' && r.yearsToPass !== null
        );
        const bins = [0, 1, 2, 3, 4, 5];
        return bins.map(b => ({
            label: b === 0 ? '당해년도' : `${b}년 후`,
            count: rows.filter(r => r.yearsToPass === b).length,
        }));
    }

    // 전형 유형별 합격률 (차트용)
    function getPassRateByAdmType(year, campus) {
        const types = ['수시', '정시', '특별'];
        return types.map(t => {
            const rows = MOCK.employment.filter(r =>
                (year === 'all' || r.gradYear === parseInt(year)) &&
                (campus === 'all' || r.campus === campus) &&
                r.admType === t && r.result !== 'na'
            );
            const pass = rows.filter(r => r.result === 'pass').length;
            return {
                type: t,
                passRate: rows.length ? +((pass / rows.length) * 100).toFixed(1) : 0,
                total: rows.length,
            };
        });
    }

    // 실습 점수 분포 (차트용)
    function getPracticumScoreDist(year, campus) {
        const rows = MOCK.practicum.filter(r =>
            (year === 'all' || r.year === parseInt(year)) &&
            (campus === 'all' || r.campus === campus)
        );
        const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
        return grades.map(g => ({
            grade: g,
            count: rows.filter(r => r.grade === g).length,
        }));
    }

    return {
        getEnrollmentRates, getExamRate, getPassRate,
        getAvgYearsToPass, get5YearPassRate, getAltCareerRate, getPracticumExcRate,
        getPassRateTrend, getEnrollmentTrend, getRegionDistribution,
        getYearsHistogram, getPassRateByAdmType, getPracticumScoreDist,
    };
})();
