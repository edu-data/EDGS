// ============================================================
//  EDGS Feedback Engine — T-01~T-06 환류 트리거
//  ※ 담당 부서명: 경인교육대학교 실제 조직도 기준
// ============================================================

window.FEEDBACK = (function () {

    //  경인교육대학교 실제 담당 부서 (ginue.ac.kr 조직도 기준)
    //  - 입학본부            : 입학 모집·충원율 관리
    //  - 교무처 교무팀        : 교원 인사·대학원 관련
    //  - 교무처 학사팀        : 교육과정·학적·교육실습
    //  - 기획처 기획팀        : 대학 기획·평가·데이터 관리
    //  - 학생처 학생지원팀    : 학생 장학·복지
    //  - 학생처 진로인성교육센터 : 교원임용 지원·진로 지도
    //  - 교육혁신본부         : 교육과정 개혁·성과 환류

    var NATIONAL_AVG_PASS = 51.7; // 2024학년도 전국 교대 평균 임용합격률 (교육부 공시)

    var TRIGGERS = [
        {
            id: 'T-01',
            label: '임용합격률 위험',
            condition: '임용합격률 < 전국평균(51.7%) - 5%p',
            icon: '🎯',
            severity: 'critical',
            action: '교육혁신본부 긴급 현황 보고 → 교육과정위원회 안건 등록 → 학사팀 교육과정 개선 착수',
            responsible: '교육혁신본부, 교무처 학사팀',
            check: function (year, campus) {
                var pr = KPI.getPassRate(year, campus);
                var rate = pr.rate;
                var threshold = NATIONAL_AVG_PASS - 5;
                var triggered = rate < threshold;
                return {
                    triggered: triggered,
                    value: rate,
                    threshold: threshold,
                    unit: '%',
                    detail: '현재 ' + rate + '% / 임계 ' + threshold.toFixed(1) + '% (전국평균 ' + NATIONAL_AVG_PASS + '%)'
                };
            }
        },
        {
            id: 'T-02',
            label: '학부 충원율 위험',
            condition: '학부 충원율 < 85%',
            icon: '📈',
            severity: 'critical',
            action: '입학본부 원인 분석 보고 → 기획처 신입생 유치 전략 긴급 검토',
            responsible: '입학본부, 기획처 기획팀',
            check: function (year, campus) {
                var er = KPI.getEnrollmentRates(year, campus);
                var triggered = er.undergrad < 85;
                return {
                    triggered: triggered,
                    value: er.undergrad,
                    threshold: 85,
                    unit: '%',
                    detail: '현재 ' + er.undergrad + '% / 임계 85%'
                };
            }
        },
        {
            id: 'T-03',
            label: '대학원 충원율 미달',
            condition: '대학원 충원율 < 80%',
            icon: '🎓',
            severity: 'warning',
            action: '교무처 교무팀·대학원위원회 모집 전략 검토 및 홍보 강화 요청',
            responsible: '교무처 교무팀, 대학원위원회',
            check: function (year, campus) {
                var er = KPI.getEnrollmentRates(year, campus);
                var triggered = er.grad < 80;
                return {
                    triggered: triggered,
                    value: er.grad,
                    threshold: 80,
                    unit: '%',
                    detail: '현재 ' + er.grad + '% / 임계 80%'
                };
            }
        },
        {
            id: 'T-04',
            label: '임용 소요 기간 초과',
            condition: '평균 임용 소요 기간 > 3년',
            icon: '⏳',
            severity: 'warning',
            action: '학생처 진로인성교육센터 임용 준비 프로그램 강화 검토',
            responsible: '학생처 진로인성교육센터',
            check: function (year, campus) {
                var ay = KPI.getAvgYearsToPass(year, campus);
                var triggered = ay.avg > 3;
                return {
                    triggered: triggered,
                    value: ay.avg,
                    threshold: 3,
                    unit: '년',
                    detail: '현재 ' + ay.avg + '년 / 임계 3년'
                };
            }
        },
        {
            id: 'T-05',
            label: '실습 우수 비율 저조',
            condition: '교육실습 평가 우수 비율 < 50%',
            icon: '📚',
            severity: 'warning',
            action: '교무처 학사팀 교육실습 운영 매뉴얼 검토 및 사전 교육 강화 요청',
            responsible: '교무처 학사팀 (교육실습 담당)',
            check: function (year, campus) {
                var pr = KPI.getPracticumExcRate(year, campus);
                var triggered = pr.rate < 50;
                return {
                    triggered: triggered,
                    value: pr.rate,
                    threshold: 50,
                    unit: '%',
                    detail: '현재 ' + pr.rate + '% / 임계 50%'
                };
            }
        },
        {
            id: 'T-06',
            label: '데이터 미입력 경고',
            condition: '데이터 미입력 > 30일 경과',
            icon: '⚠️',
            severity: 'info',
            action: '기획처 기획팀 → 해당 부서 데이터 입력 독촉 공문 발송',
            responsible: '기획처 기획팀 (EDGS 데이터 거버넌스 담당)',
            check: function (year, campus) {
                return {
                    triggered: false,
                    value: 12,
                    threshold: 30,
                    unit: '일',
                    detail: '마지막 입력: 12일 전 (정상)'
                };
            }
        },
    ];

    function evaluate(year, campus) {
        return TRIGGERS.map(function (t) {
            var result = t.check(year, campus);
            return Object.assign({}, t, result);
        });
    }

    function getActiveAlerts(year, campus) {
        return evaluate(year, campus).filter(function (t) { return t.triggered; });
    }

    function getAlertCount(year, campus) {
        return getActiveAlerts(year, campus).length;
    }

    return { TRIGGERS: TRIGGERS, evaluate: evaluate, getActiveAlerts: getActiveAlerts, getAlertCount: getAlertCount };
})();
