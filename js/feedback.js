// ============================================================
//  EDGS Feedback Engine — T-01~T-06 환류 트리거
// ============================================================

window.FEEDBACK = (function () {

    const TRIGGERS = [
        {
            id: 'T-01',
            label: '임용합격률 위험',
            condition: '임용합격률 < 전국평균 - 5%p',
            icon: '🎯',
            severity: 'critical',
            action: '교육과정위원회 긴급 안건 등록 + 교학처장 알림',
            responsible: '교학처장, 교육과정위원장',
            check(year, campus) {
                const { rate } = KPI.getPassRate(year, campus);
                const national = 65.0;
                const triggered = rate < (national - 5);
                return { triggered, value: rate, threshold: national - 5, unit: '%', detail: `현재 ${rate}% / 임계 ${national - 5}% (전국평균 ${national}%)` };
            }
        },
        {
            id: 'T-02',
            label: '학부 충원율 위험',
            condition: '학부 충원율 < 85%',
            icon: '📈',
            severity: 'critical',
            action: '입학처·기획처 알림 + 원인 분석 리포트 자동 생성',
            responsible: '입학처장, 기획처장',
            check(year, campus) {
                const { undergrad } = KPI.getEnrollmentRates(year, campus);
                const triggered = undergrad < 85;
                return { triggered, value: undergrad, threshold: 85, unit: '%', detail: `현재 ${undergrad}% / 임계 85%` };
            }
        },
        {
            id: 'T-03',
            label: '대학원 충원율 미달',
            condition: '대학원 충원율 < 80%',
            icon: '🎓',
            severity: 'warning',
            action: '모집 전략 검토 요청 알림',
            responsible: '교학처장, 대학원위원장',
            check(year, campus) {
                const { grad } = KPI.getEnrollmentRates(year, campus);
                const triggered = grad < 80;
                return { triggered, value: grad, threshold: 80, unit: '%', detail: `현재 ${grad}% / 임계 80%` };
            }
        },
        {
            id: 'T-04',
            label: '임용 소요 기간 초과',
            condition: '평균 임용 소요 기간 > 3년',
            icon: '⏳',
            severity: 'warning',
            action: '임용 준비 지원 강화 검토 요청',
            responsible: '취업지원팀장',
            check(year, campus) {
                const { avg } = KPI.getAvgYearsToPass(year, campus);
                const triggered = avg > 3;
                return { triggered, value: avg, threshold: 3, unit: '년', detail: `현재 ${avg}년 / 임계 3년` };
            }
        },
        {
            id: 'T-05',
            label: '실습 우수 비율 저조',
            condition: '실습 평가 우수 비율 < 50%',
            icon: '📚',
            severity: 'warning',
            action: '교육실습 운영 방식 검토 요청',
            responsible: '실습지원팀장',
            check(year, campus) {
                const { rate } = KPI.getPracticumExcRate(year, campus);
                const triggered = rate < 50;
                return { triggered, value: rate, threshold: 50, unit: '%', detail: `현재 ${rate}% / 임계 50%` };
            }
        },
        {
            id: 'T-06',
            label: '데이터 미입력 경고',
            condition: '데이터 미입력 > 30일 경과',
            icon: '⚠️',
            severity: 'info',
            action: '담당 부서 입력 독촉 알림',
            responsible: '데이터 거버넌스 담당',
            check(year, campus) {
                // 현장 데이터는 선택적 수집이므로 항상 일부 미입력 시뮬레이션
                const triggered = false;
                return { triggered, value: 12, threshold: 30, unit: '일', detail: '마지막 입력: 12일 전 (정상)' };
            }
        },
    ];

    function evaluate(year, campus) {
        return TRIGGERS.map(t => {
            const result = t.check(year, campus);
            return { ...t, ...result };
        });
    }

    function getActiveAlerts(year, campus) {
        return evaluate(year, campus).filter(t => t.triggered);
    }

    function getAlertCount(year, campus) {
        return getActiveAlerts(year, campus).length;
    }

    return { TRIGGERS, evaluate, getActiveAlerts, getAlertCount };
})();
