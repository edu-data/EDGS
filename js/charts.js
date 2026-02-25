// ============================================================
//  EDGS Chart Helpers — ECharts 래퍼
// ============================================================

window.CHARTS = (function () {
    const instances = {};

    function getOrCreate(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        if (instances[id]) {
            try { instances[id].dispose(); } catch (e) { }
        }
        instances[id] = echarts.init(el, null, { renderer: 'canvas' });
        return instances[id];
    }

    // 색상 팔레트
    const COLORS = {
        primary: '#3B6FE8', secondary: '#10B981', accent: '#F59E0B',
        danger: '#EF4444', info: '#6366F1', pink: '#EC4899',
        light: '#60A5FA', grid: 'rgba(255,255,255,0.05)',
        axis: '#4A5568', label: '#8B98B8',
    };
    const PALETTE = ['#3B6FE8', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#F97316', '#60A5FA'];

    const BASE_OPTS = {
        backgroundColor: 'transparent',
        textStyle: { fontFamily: 'Noto Sans KR, Inter, sans-serif' },
    };

    function lineChart(id, years, series, opts = {}) {
        const chart = getOrCreate(id); if (!chart) return;
        chart.setOption({
            ...BASE_OPTS,
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1E2535',
                borderColor: 'rgba(255,255,255,0.1)',
                textStyle: { color: '#F0F6FF', fontSize: 12 },
                formatter(params) {
                    let s = `<div style="font-weight:700;margin-bottom:6px">${params[0].axisValue}년</div>`;
                    params.forEach(p => { s += `<div style="color:${p.color}">● ${p.seriesName}: <b>${p.value}%</b></div>`; });
                    return s;
                }
            },
            legend: {
                data: series.map(s => s.name), bottom: 0,
                textStyle: { color: COLORS.label, fontSize: 11 },
                icon: 'roundRect', itemWidth: 10, itemHeight: 4,
            },
            grid: { top: 12, left: 40, right: 16, bottom: 40 },
            xAxis: {
                type: 'category', data: years.map(y => String(y)),
                axisLine: { lineStyle: { color: COLORS.axis } },
                axisLabel: { color: COLORS.label, fontSize: 11 },
                splitLine: { lineStyle: { color: COLORS.grid } },
            },
            yAxis: {
                type: 'value', min: opts.yMin || 0, max: opts.yMax || 100,
                axisLabel: { color: COLORS.label, fontSize: 10, formatter: v => v + '%' },
                splitLine: { lineStyle: { color: COLORS.grid } },
                axisLine: { show: false },
            },
            series: series.map((s, i) => ({
                name: s.name, type: 'line', data: s.data,
                smooth: true, symbol: 'circle', symbolSize: 6,
                lineStyle: { width: 2.5, color: s.color || PALETTE[i] },
                itemStyle: { color: s.color || PALETTE[i] },
                areaStyle: s.area ? {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: (s.color || PALETTE[i]) + '55' }, { offset: 1, color: (s.color || PALETTE[i]) + '00' }]
                    }
                } : undefined,
            })),
        });
    }

    function barChart(id, categories, series, opts = {}) {
        const chart = getOrCreate(id); if (!chart) return;
        chart.setOption({
            ...BASE_OPTS,
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1E2535', borderColor: 'rgba(255,255,255,0.1)',
                textStyle: { color: '#F0F6FF', fontSize: 12 },
            },
            legend: series.length > 1 ? {
                data: series.map(s => s.name), bottom: 0,
                textStyle: { color: COLORS.label, fontSize: 11 },
            } : { show: false },
            grid: { top: 12, left: 48, right: 16, bottom: series.length > 1 ? 40 : 24 },
            xAxis: {
                type: 'category', data: categories,
                axisLabel: { color: COLORS.label, fontSize: 11, rotate: opts.rotate || 0 },
                axisLine: { lineStyle: { color: COLORS.axis } },
            },
            yAxis: {
                type: 'value', max: opts.yMax || 100,
                axisLabel: { color: COLORS.label, fontSize: 10, formatter: v => v + (opts.unit || '%') },
                splitLine: { lineStyle: { color: COLORS.grid } },
                axisLine: { show: false },
            },
            series: series.map((s, i) => ({
                name: s.name, type: 'bar', data: s.data,
                barMaxWidth: 40,
                itemStyle: {
                    color: s.color || {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: PALETTE[i] + 'CC' }, { offset: 1, color: PALETTE[i] + '44' }]
                    },
                    borderRadius: [4, 4, 0, 0],
                },
                label: { show: true, position: 'top', formatter: v => v.value + (opts.unit || '%'), fontSize: 10, color: COLORS.label },
            })),
        });
    }

    function gaugeChart(id, values, opts = {}) {
        // values: [{name, value, color}]
        const chart = getOrCreate(id); if (!chart) return;
        chart.setOption({
            ...BASE_OPTS,
            series: values.map((v, i) => ({
                type: 'gauge',
                center: values.length === 1 ? ['50%', '55%'] : [`${25 + 50 * i}%`, '55%'],
                radius: values.length === 1 ? '80%' : '75%',
                min: 0, max: 110,
                startAngle: 200, endAngle: -20,
                splitNumber: 5,
                pointer: {
                    icon: 'path://M12.8,0.7l12.3,24.9H0.5L12.8,0.7z',
                    width: 8, length: '60%',
                    itemStyle: { color: v.color || PALETTE[i] },
                },
                axisLine: {
                    lineStyle: {
                        width: 16,
                        color: [[v.value / 110, v.color || PALETTE[i]], [1, 'rgba(255,255,255,0.06)']],
                    }
                },
                axisTick: { show: false },
                splitLine: {
                    distance: -20, length: 10,
                    lineStyle: { color: 'rgba(255,255,255,0.1)', width: 1 },
                },
                axisLabel: {
                    distance: -36, color: COLORS.label, fontSize: 9,
                    formatter: val => val === 0 || val === 110 ? '' : val + '%',
                },
                title: { offsetCenter: ['0%', '15%'], color: COLORS.label, fontSize: 11 },
                detail: {
                    valueAnimation: true,
                    formatter: val => `{a|${val.toFixed(1)}}{b|%}`,
                    rich: {
                        a: { fontSize: 22, fontWeight: 700, color: '#F0F6FF' },
                        b: { fontSize: 12, color: COLORS.label },
                    },
                    offsetCenter: ['0%', '-10%'],
                },
                data: [{ value: Math.min(v.value, 110), name: v.name }],
                animationDuration: 1200,
            }))
        });
    }

    function pieChart(id, data, opts = {}) {
        const chart = getOrCreate(id); if (!chart) return;
        chart.setOption({
            ...BASE_OPTS,
            tooltip: {
                trigger: 'item',
                backgroundColor: '#1E2535', borderColor: 'rgba(255,255,255,0.1)',
                textStyle: { color: '#F0F6FF', fontSize: 12 },
                formatter: p => `${p.name}<br/><b>${p.value}명 (${p.percent}%)</b>`,
            },
            legend: {
                orient: 'vertical', right: '5%', top: 'center',
                textStyle: { color: COLORS.label, fontSize: 11 },
                icon: 'circle', itemWidth: 8, itemHeight: 8,
            },
            series: [{
                type: 'pie',
                radius: opts.donut ? ['45%', '75%'] : '70%',
                center: ['38%', '50%'],
                data: data.map((d, i) => ({ name: d.label || d.name, value: d.count || d.value, itemStyle: { color: d.color || PALETTE[i] } })),
                label: { show: false },
                emphasis: {
                    itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' },
                    label: { show: true, fontSize: 12, fontWeight: 700, color: '#F0F6FF', formatter: p => `${p.name}\n${p.percent}%` }
                },
                animationType: 'expansion',
            }]
        });
    }

    function histChart(id, bins) {
        const chart = getOrCreate(id); if (!chart) return;
        chart.setOption({
            ...BASE_OPTS,
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1E2535', borderColor: 'rgba(255,255,255,0.1)',
                textStyle: { color: '#F0F6FF', fontSize: 12 },
                formatter: p => `${p[0].name}: <b>${p[0].value}명</b>`,
            },
            grid: { top: 12, left: 44, right: 16, bottom: 24 },
            xAxis: {
                type: 'category', data: bins.map(b => b.label),
                axisLabel: { color: COLORS.label, fontSize: 10 },
                axisLine: { lineStyle: { color: COLORS.axis } },
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: COLORS.label, fontSize: 10, formatter: v => v + '명' },
                splitLine: { lineStyle: { color: COLORS.grid } },
                axisLine: { show: false },
            },
            series: [{
                type: 'bar', data: bins.map(b => b.count),
                barMaxWidth: 50,
                itemStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: '#3B6FE8CC' }, { offset: 1, color: '#3B6FE844' }]
                    },
                    borderRadius: [4, 4, 0, 0],
                },
                label: { show: true, position: 'top', fontSize: 10, color: COLORS.label, formatter: v => v.value + '명' },
            }]
        });
    }

    function mapChart(id, regionData) {
        const chart = getOrCreate(id); if (!chart) return;
        // 한국 지도가 없으므로 수평바 차트로 대체
        const sorted = [...regionData].sort((a, b) => b.pct - a.pct).slice(0, 8);
        chart.setOption({
            ...BASE_OPTS,
            tooltip: {
                trigger: 'axis', axisPointer: { type: 'none' },
                backgroundColor: '#1E2535', borderColor: 'rgba(255,255,255,0.1)',
                textStyle: { color: '#F0F6FF', fontSize: 12 },
                formatter: p => `${p[0].name}: <b>${p[0].value}%</b>`,
            },
            grid: { top: 8, left: 56, right: 48, bottom: 8, containLabel: true },
            xAxis: {
                type: 'value', max: 'dataMax',
                axisLabel: { color: COLORS.label, fontSize: 10, formatter: v => v + '%' },
                splitLine: { lineStyle: { color: COLORS.grid } },
                axisLine: { show: false },
            },
            yAxis: {
                type: 'category',
                data: sorted.map(r => r.name),
                axisLabel: { color: COLORS.label, fontSize: 11 },
                axisLine: { lineStyle: { color: COLORS.axis } },
                inverse: true,
            },
            series: [{
                type: 'bar', data: sorted.map(r => r.pct),
                barMaxWidth: 20,
                itemStyle: {
                    color: (params) => {
                        const g = PALETTE[params.dataIndex % PALETTE.length];
                        return {
                            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [{ offset: 0, color: g + 'CC' }, { offset: 1, color: g + '44' }]
                        };
                    },
                    borderRadius: [0, 4, 4, 0],
                },
                label: { show: true, position: 'right', formatter: v => v.value + '%', fontSize: 10, color: COLORS.label },
            }]
        });
    }

    function radarChart(id, indicators, data) {
        const chart = getOrCreate(id); if (!chart) return;
        chart.setOption({
            ...BASE_OPTS,
            tooltip: { backgroundColor: '#1E2535', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#F0F6FF' } },
            radar: {
                indicator: indicators,
                center: ['50%', '50%'], radius: '70%',
                splitNumber: 4,
                axisName: { color: COLORS.label, fontSize: 11 },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
                splitArea: { show: false },
                axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            },
            series: [{
                type: 'radar', data,
                areaStyle: { opacity: 0.15 },
                lineStyle: { width: 2 },
            }]
        });
    }

    // 창 크기 변화 대응
    window.addEventListener('resize', () => {
        Object.values(instances).forEach(c => { try { c.resize(); } catch (e) { } });
    });

    return { lineChart, barChart, gaugeChart, pieChart, histChart, mapChart, radarChart };
})();
