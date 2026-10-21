/* Ported from AIOps-Enhance dist/new-aiops.html — analysis dashboards */
(function (global) {
  'use strict';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function modal(title, body) {
    var old = document.getElementById('aiopsAnalysisModal');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.id = 'aiopsAnalysisModal';
    wrap.className = 'aiops-analysis-modal';
    wrap.innerHTML =
      '<div class="aiops-analysis-modal-backdrop" data-close="1"></div>' +
      '<div class="aiops-analysis-modal-card" role="dialog" aria-modal="true">' +
        '<div class="aiops-analysis-modal-head"><h3>' + esc(title) + '</h3>' +
        '<button type="button" class="aiops-analysis-modal-close" data-close="1" aria-label="Close">×</button></div>' +
        '<div class="aiops-analysis-modal-body">' + body + '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target.getAttribute('data-close')) wrap.remove();
    });
  }

  // Host bridge — filled by aiops.js
  var host = {
    getRange: function () { return 7; },
    setRange: function () {},
    rerender: function () {},
    getPageRoot: function () { return document.getElementById('pageRoot'); }
  };

  // Minimal state object used by ported functions
  var state = {
    get range() { return host.getRange(); },
    set range(v) { host.setRange(v); },
    get page() { return host.getPage ? host.getPage() : ''; },
    healthAlertSeverity: 'all'
  };

  function render() {
    host.rerender();
  }

// Shared scene / asset selector for the four operational analysis dashboards.
const analysisScopes=[{id:'sales',name:'销售',items:[{id:'sales-leads',name:'销售线索 Agent',type:'Agent'},{id:'sales-orders',name:'销售订单 Agent',type:'Agent'},{id:'sales-allocation',name:'销售分货 Agent',type:'Agent'},{id:'sales-customers',name:'客户对象集',type:'本体对象集'},{id:'sales-order-set',name:'销售订单对象集',type:'本体对象集'}]},{id:'procurement',name:'采购',items:[{id:'procurement-plan',name:'采购计划 Agent',type:'Agent'},{id:'procurement-supplier',name:'供应商评估 Agent',type:'Agent'},{id:'procurement-supplier-set',name:'供应商对象集',type:'本体对象集'},{id:'procurement-order-set',name:'采购订单对象集',type:'本体对象集'}]}];
const analysisScopeState={scopeSelection:analysisScopes.flatMap(s=>s.items.map(x=>x.id)),scopeScene:'sales',menu:''};
function isOnlineSessionPage(){return false}
function analysisScopeCatalog(){return analysisScopes}
function analysisScopeChosen(){return analysisScopeState.scopeSelection}
function analysisScopeCheck(ids){const count=ids.filter(id=>analysisScopeChosen().includes(id)).length;return count===ids.length?'true':count?'mixed':'false'}
function analysisScopeSet(ids){analysisScopeState.scopeSelection=ids;render()}
function analysisScopeToggle(ids){const remove=analysisScopeCheck(ids)==='true';analysisScopeSet(remove?analysisScopeChosen().filter(id=>!ids.includes(id)):[...new Set([...analysisScopeChosen(),...ids])])}
function analysisScopeBulk(all){analysisScopeSet(all?analysisScopeCatalog().flatMap(scene=>scene.items.map(item=>item.id)):[])}
function analysisScopeScene(id){analysisScopeState.scopeScene=id;render()}
function analysisScopeMenu(){analysisScopeState.menu=analysisScopeState.menu?'':'scope';render()}
function analysisScopeClose(){analysisScopeState.menu='';render()}
function analysisScopeBox(ids,label){const checked=analysisScopeCheck(ids);return `<button class="analysis-scope-check ${checked}" role="checkbox" aria-checked="${checked}" aria-label="${esc(label)}" onclick="analysisScopeToggle(${esc(JSON.stringify(ids))})"><span aria-hidden="true">${checked==='true'?'✓':checked==='mixed'?'−':''}</span></button>`}
function analysisScopePicker(){let catalog=analysisScopeCatalog(),all=catalog.flatMap(s=>s.items.map(x=>x.id)),chosen=analysisScopeChosen(),scene=catalog.find(s=>s.id===analysisScopeState.scopeScene)||catalog[0],count=catalog.filter(s=>s.items.some(x=>chosen.includes(x.id))).length,title=chosen.length===all.length?'全部':chosen.length?`已选 ${count} 个场景 · ${chosen.length} 项`:'未选择';return `<div class="analysis-scope"><button id="analysis-picker-scope" class="analysis-scope-trigger" aria-label="场景筛选" aria-haspopup="dialog" aria-expanded="${analysisScopeState.menu==='scope'}" onclick="analysisScopeMenu()">${title}<span aria-hidden="true">⌄</span></button>${analysisScopeState.menu==='scope'?`<div class="analysis-scope-panel" role="dialog" aria-label="场景多选"><div class="analysis-scope-tools"><div><button onclick="analysisScopeBulk(true)">全选</button><button onclick="analysisScopeBulk(false)">清空</button></div></div><div class="analysis-scope-columns"><div class="analysis-scope-scenes"><div class="analysis-scope-caption">场景</div>${catalog.map(s=>`<div class="analysis-scope-row ${s.id===scene.id?'active':''}">${analysisScopeBox(s.items.map(x=>x.id),'选择场景 '+s.name)}<button class="analysis-scope-name" aria-label="展开场景 ${esc(s.name)}" aria-pressed="${s.id===scene.id}" onclick="analysisScopeScene('${s.id}')">${esc(s.name)}<span>›</span></button></div>`).join('')}</div><div class="analysis-scope-assets"><div class="analysis-scope-caption">${esc(scene.name)}</div>${scene.items.map(x=>`<div class="analysis-scope-row">${analysisScopeBox([x.id],'选择 '+x.type+' '+x.name)}<button class="analysis-scope-asset-name" onclick="analysisScopeToggle(${esc(JSON.stringify([x.id]))})">${esc(x.name)}<small>${x.type}</small></button></div>`).join('')}</div></div><div class="analysis-scope-foot"><span>已选 ${count} 个场景中的 ${chosen.length} 项</span><button onclick="analysisScopeClose()">完成</button></div></div>`:''}</div>`}
function toolbar(updated="2026-10-13 00:00"){return `<div class="toolbar"><span class="updated-time">更新时间：${updated}</span><div class="row toolbar-actions"><div class="segments">${[1,7,14].map(x=>`<button class="${state.range===x?'selected':''}" onclick="state.range=${x};render()">${x===1?'今日':x+' 天'}</button>`).join('')}</div>${analysisScopePicker()}</div></div>`}
function heading(title,sub){return `<div class="heading"><div><h1>${title}</h1>${sub?`<small>${sub}</small>`:''}</div></div>`}
function metricHelp(name,formula){return `<span class="metric-label">${esc(name)}<span class="metric-help" tabindex="0" aria-label="${esc(name)}计算口径"><svg class="icon" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor"/><path d="M8 7v4M8 4.5v1" stroke="currentColor" stroke-width="1.2"/></svg><span class="metric-tooltip" role="tooltip">${esc(formula)}</span></span></span>`}
const analysisMetricDefinitions={
 '总 Token':{key:'total',icon:'tokens'},'输入 Token':{key:'input',icon:'tokens'},'输出 Token':{key:'output',icon:'tokens'},'模型调用次数':{key:'calls',icon:'model'},'平均每轮 Token 消耗':{key:'perTurn',icon:'tokens'},'平均每会话 Token 消耗':{key:'perSession',icon:'tokens'},
 '异常会话率':{key:'anomalousRate',icon:'error',better:'lower'},'工具调用失败率':{key:'toolFailureRate',icon:'error',better:'lower'},'轮次错误率':{key:'turnErrorRate',icon:'error',better:'lower'},'警告事件数':{key:'warningEvents',icon:'warning',better:'lower'},'警告影响用户数':{key:'affectedUsers',icon:'affected',better:'lower'},
 '会话平均耗时':{key:'sessionAvgMs',icon:'clock',better:'lower'},'慢响应轮次率':{key:'slowRate',icon:'clock',better:'lower'},'工具平均耗时':{key:'toolAvgMs',icon:'clock',better:'lower'},'首 token 延迟（TTFT）':{key:'ttftAvgMs',icon:'clock',better:'lower'},
 '活跃会话数':{key:'sessions',icon:'session'},'活跃用户数':{key:'users',icon:'users'},'人均会话数':{key:'sessionsPerUser',icon:'session'},'平均会话轮次':{key:'averageTurns',icon:'turns'},'点赞点踩次数':{icon:'feedback'},'点赞次数':{key:'likes',better:'higher'},'点踩次数':{key:'dislikes',better:'lower'}
};
function analysisMetricSymbol(name){
 const paths={tokens:'<circle cx="12" cy="12" r="8.5"/><path d="M8 8h8m-4 0v8"/>',model:'<rect x="6" y="6" width="12" height="12" rx="3"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"/>',error:'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',warning:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',affected:'<circle cx="10" cy="7" r="4"/><path d="M3 21v-2a7 7 0 0 1 12-5m2 3 5 5m0-5-5 5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6h5"/>',session:'<path d="M4 4h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7l-4 3V5a1 1 0 0 1 1-1Z"/>',users:'<circle cx="10" cy="7" r="4"/><path d="M3 21v-2a7 7 0 0 1 14 0v2M17 3a4 4 0 0 1 0 8m2 3a7 7 0 0 1 3 6"/>',turns:'<path d="M4 3h14v12H7l-4 3V4a1 1 0 0 1 1-1Zm4 16h10l4 3V9"/>',feedback:'<path d="M8 10 12 3c3 0 3 3 2 6h5a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H8M3 10h5v11H3Z"/>'};
 return `<span class="metric-symbol" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[analysisMetricDefinitions[name]?.icon]||paths.session}</svg></span>`;
}
function analysisMetricOptions(name,current,previous){
 const definition=analysisMetricDefinitions[name]||{},raw=totals=>definition.key==='sessionsPerUser'?(totals.users?totals.sessions/totals.users:0):definition.key==='averageTurns'?(totals.sessions?totals.turns/totals.sessions:0):Number(totals[definition.key]||0);
 return {current:raw(current),previous:raw(previous),better:definition.better};
}
function analysisComparison(current,previous,better){
 const label=state.range===1?'日环比':state.range+' 天环比',delta=previous?(current-previous)/Math.abs(previous)*100:current?null:0;
 const rounded=delta===null?null:Math.round(delta*10)/10;
 const text=rounded===null?'新增':rounded===0?'0%':(rounded>0?'+':'−')+Math.abs(rounded).toLocaleString('zh-CN',{maximumFractionDigits:1})+'%';
 const sign=rounded===null?1:Math.sign(rounded),tone=!sign||!better?'neutral':(better==='lower'?sign<0:sign>0)?'improved':'worsened';
 const dates=analysisWindowRows(state.range,true).map(row=>row[0]);
 const title=`对比 ${dates[0]}${dates.length>1?' — '+dates.at(-1):''}，上期值 ${previous.toLocaleString('zh-CN',{maximumFractionDigits:2})}。`+(delta===null?'上期为 0，当前新增。':'环比 =（本期值 − 上期值）/ 上期值 × 100%。');
 return `<div class="metric-comparison" title="${esc(title)}" data-current="${current}" data-previous="${previous}" data-comparison="${delta===null?'new':delta}"><span class="metric-change ${tone}">${text}</span><span>${label}</span></div>`;
}
function analysisMetric(name,value,note,formula,comparison){return `<div class="compact-stat" data-metric="${esc(name)}"><div class="metric-card-head">${metricHelp(name,formula)}${analysisMetricSymbol(name)}</div><div class="metric-card-value"><strong title="${esc(note)}">${value}</strong></div>${comparison?analysisComparison(comparison.current,comparison.previous,comparison.better):''}</div>`}
function analysisMetrics(items){return `<div class="compact-stats analysis-metrics">${items.map(([name,value,note,formula,comparison])=>analysisMetric(name,value,note,formula||name+'，按所选统计周期汇总。',comparison)).join('')}</div>`}

// Fixed daily Mock records; all summaries and charts use the same filtered sessions.
const behaviorDailyMock=[
 ['2026-09-29',37,14,34,6.1,16,2],['2026-09-30',39,16,44,6.3,18,3],
 ['2026-10-01',35,17,54,5.9,15,2],['2026-10-02',40,18,50,6.2,21,3],
 ['2026-10-03',41,18,58,6.5,20,4],['2026-10-04',44,19,55,6.4,22,3],
 ['2026-10-05',48,16,35,6.6,25,4],['2026-10-06',42,16,0,6.3,20,3],
 ['2026-10-07',48,18,10,6.5,24,4],['2026-10-08',47,17,20,6.2,23,3],
 ['2026-10-09',61,24,18,6.8,31,6],['2026-10-10',42,19,8,6.1,21,2],
 ['2026-10-11',40,15,26,6.3,18,3],['2026-10-12',48,12,0,6.4,26,2]
];
// The preceding 14 days provide equal-length comparison windows without changing the current Mock baseline.
const analysisPreviousDailyMock=[
 ['2026-09-15',32,12,2,5.5,11,3],['2026-09-16',34,13,10,5.8,13,3],
 ['2026-09-17',33,12,19,5.7,12,4],['2026-09-18',36,14,28,6.0,14,4],
 ['2026-09-19',35,13,37,5.6,13,3],['2026-09-20',31,11,46,5.8,10,3],
 ['2026-09-21',36,14,55,6.0,14,4],['2026-09-22',38,15,64,5.9,16,5],
 ['2026-09-23',40,15,72,6.2,17,4],['2026-09-24',37,13,81,6.0,15,3],
 ['2026-09-25',43,17,4,6.3,20,5],['2026-09-26',38,14,13,6.0,16,4],
 ['2026-09-27',36,13,21,5.7,15,3],['2026-09-28',34,14,29,5.8,14,4]
];
function analysisWindowRows(range=state.range,previous=false){const rows=[...analysisPreviousDailyMock,...behaviorDailyMock];return previous?rows.slice(-range*2,-range):rows.slice(-range)}
function behaviorData(range=state.range,previous=false){
 const chosen=new Set(analysisScopeChosen()),agents=analysisScopes.flatMap(scene=>scene.items.filter(item=>item.type==='Agent').map(item=>item.id));
 const users=new Set(),totals={sessions:0,turns:0,likes:0,dislikes:0};
 const days=analysisWindowRows(range,previous).map(([date,count,userCount,userOffset,averageTurns,likes,dislikes])=>{
  const dayUsers=new Set(),row={date,label:date.slice(5).replace('-','/'),sessions:0,turns:0,likes:0,dislikes:0};
  const turnCount=Math.round(count*averageTurns),baseTurns=Math.floor(turnCount/count),extraTurns=turnCount%count;
  for(let i=0;i<count;i++){
   if(!chosen.has(agents[(i+Number(date.slice(-2)))%agents.length]))continue;
   const user='user-'+(userOffset+i%userCount+1);dayUsers.add(user);users.add(user);
   row.sessions++;row.turns+=baseTurns+(i<extraTurns?1:0);row.likes+=i<likes?1:0;row.dislikes+=i>=likes&&i<likes+dislikes?1:0;
  }
  row.users=dayUsers.size;Object.keys(totals).forEach(key=>totals[key]+=row[key]);return row;
 });
 totals.users=users.size;
 totals.sessionsPerUser=totals.users?(totals.sessions/totals.users).toFixed(1):'0.0';
 totals.averageTurns=totals.sessions?(totals.turns/totals.sessions).toFixed(1):'0.0';
 return {days,totals};
}
// Shape-preserving cubic interpolation passes through each observed point without overshooting extrema.
// SVG coordinates are CSS pixels. Only plot geometry is recomputed; text is never scaled.
function analysisTickIndices(count,plotWidth,minGap=58){
 if(count<2)return new Set(count?[0]:[]);
 const visible=Math.min(count,Math.max(2,Math.floor(plotWidth/minGap)+1));
 return new Set(Array.from({length:visible},(_,i)=>Math.round(i*(count-1)/(visible-1))));
}
let analysisChartObserver,analysisChartResizeFrame=0;
const analysisChartResizeQueue=new Set();
function drawAnalysisChart(host){
 const width=Math.floor(host.clientWidth),height=Math.floor(host.clientHeight),kind=host.dataset.analysisChart;
 if(width<1||height<1||host.dataset.chartSize===width+'x'+height)return;
 const focused=[...host.querySelectorAll('[tabindex]')].indexOf(document.activeElement);
 let svg='';
 if(kind.startsWith('cost-'))svg=costChart(costData().buckets,width,height,kind.slice(5));
 else if(kind==='health-alert')svg=healthAlertChartSVG(healthData(),width,height);
 else if(kind==='health-slow')svg=healthSlowChartSVG(healthData(),width,height);
 else if(kind.startsWith('behavior-'))svg=behaviorChartSVG(behaviorData().days,kind.slice(9),width,height);
 if(!svg)return;
 host.closest('.panel')?.querySelectorAll('.cost-chart-tooltip,.health-trend-tooltip').forEach(node=>node.hidden=true);
 host.innerHTML=svg;host.dataset.chartSize=width+'x'+height;
 if(focused>=0)host.querySelectorAll('[tabindex]')[focused]?.focus({preventScroll:true});
}
function syncAnalysisCharts(){
 analysisChartObserver?.disconnect();
 const hosts=document.querySelectorAll('#main[data-analysis] [data-analysis-chart]');
 if(typeof ResizeObserver==='function'&&!analysisChartObserver)analysisChartObserver=new ResizeObserver(entries=>{
  entries.forEach(entry=>analysisChartResizeQueue.add(entry.target));
  if(!analysisChartResizeFrame)analysisChartResizeFrame=requestAnimationFrame(()=>{
   analysisChartResizeFrame=0;
   analysisChartResizeQueue.forEach(host=>{if(host.isConnected)drawAnalysisChart(host)});analysisChartResizeQueue.clear();
  });
 });
 hosts.forEach(host=>{drawAnalysisChart(host);analysisChartObserver?.observe(host)});
}

function analysisCurvePath(points){
 if(!points.length)return '';if(points.length===1)return `M ${points[0][0]} ${points[0][1]}`;
 const slopes=points.slice(1).map((point,i)=>(point[1]-points[i][1])/(point[0]-points[i][0]));
 const tangents=points.map((point,i)=>i===0?slopes[0]:i===points.length-1?slopes.at(-1):slopes[i-1]*slopes[i]<=0?0:2/(1/slopes[i-1]+1/slopes[i]));
 const n=value=>Number(value.toFixed(3));
 return `M ${n(points[0][0])} ${n(points[0][1])}`+points.slice(1).map((point,i)=>{const start=points[i],third=(point[0]-start[0])/3;return ` C ${n(start[0]+third)} ${n(start[1]+tangents[i]*third)} ${n(point[0]-third)} ${n(point[1]-tangents[i+1]*third)} ${n(point[0])} ${n(point[1])}`}).join('');
}
function behaviorChartSVG(days,metric,width=metric==='feedback'?1080:560,height=metric==='feedback'?280:240){
 const feedback=metric==='feedback',name=feedback?'点赞点踩次数':metric==='sessions'?'活跃会话数':'活跃用户数';
 const left=52,right=width-20,top=20,bottom=height-34,plotWidth=right-left,visibleTicks=analysisTickIndices(days.length,plotWidth);
 const series=feedback?[{key:'likes',name:'点赞',color:'#4d8eff'},{key:'dislikes',name:'点踩',color:'#f0a142'}]:[{key:metric,name,color:'#4d8eff'}];
 const peak=Math.max(0,...days.flatMap(day=>series.map(item=>day[item.key]))),tick=Math.max(1,Math.ceil(peak/4)),max=tick*4;
 const y=value=>bottom-value/max*(bottom-top),step=plotWidth/days.length;
 const x=index=>feedback?left+(index+.5)*step:left+12+index*(plotWidth-24)/(days.length-1||1);
 const grid=Array.from({length:5},(_,i)=>{const value=i*tick;return `<line x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}" stroke="#e5ebf3"/><text x="${left-9}" y="${y(value)+4}" text-anchor="end">${value}</text>`}).join('');
 const marks=series.map((item,seriesIndex)=>{
  const line=feedback?'':`<path class="analysis-series" data-behavior-series="${item.key}" d="${analysisCurvePath(days.map((day,i)=>[x(i),y(day[item.key])]))}" fill="none" stroke="${item.color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>`;
  return line+days.map((day,i)=>{const value=day[item.key],label=`${day.date} · ${item.name} ${value} ${feedback?'次':metric==='sessions'?'个':'人'}`,attr=`class="behavior-mark" tabindex="0" role="img" aria-label="${label}"`;
   if(!feedback)return `<circle ${attr} cx="${x(i)}" cy="${y(value)}" r="3.5" fill="white" stroke="${item.color}" stroke-width="2"><title>${label}</title></circle>`;
   const barWidth=Math.min(22,step*.27);return `<rect ${attr} data-series="${item.key}" x="${x(i)+(seriesIndex===0?-barWidth-2:2)}" y="${y(value)}" width="${barWidth}" height="${bottom-y(value)}" rx="6" fill="${item.color}"><title>${label}</title></rect>`;
  }).join('');
 }).join('');
 const dates=days.map((day,i)=>`<text data-behavior-label="${day.label}" x="${x(i)}" y="${height-10}" text-anchor="middle"${visibleTicks.has(i)?'':' visibility="hidden"'}>${day.label}</text>`).join('');
 return `<svg class="behavior-chart ${days.length===14?'behavior-chart-long':''}" width="${width}" height="${height}" role="img" aria-label="${name} · ${days.length} 天逐日${feedback?'分组柱状图':'趋势'}">${grid}${marks}${dates}</svg>`;
}
function behaviorChart(days,metric){
 const series=[{name:'点赞',color:'#4d8eff'},{name:'点踩',color:'#f0a142'}];
 return `<div class="behavior-chart-scroll analysis-chart-host" data-analysis-chart="behavior-${metric}">${behaviorChartSVG(days,metric)}</div>${metric==='feedback'?`<div class="behavior-legend">${series.map(item=>`<span><i style="--series-color:${item.color}"></i>${item.name}</span>`).join('')}</div>`:''}`;
}
function behaviorPage(){
 const {days,totals}=behaviorData(),previous=behaviorData(state.range,true).totals,number=value=>value.toLocaleString('zh-CN');
 const metrics=[
  ['活跃会话数',number(totals.sessions),'个会话','所选周期内至少发生一次用户交互的会话数，按 session_id 去重。'],
  ['活跃用户数',number(totals.users),'位用户','所选周期内发生用户交互的用户数，按 user_id 跨日去重；不累加每日活跃用户数。'],
  ['人均会话数',totals.sessionsPerUser,'次 / 人','所选周期的活跃会话数 ÷ 同周期去重活跃用户数。'],
  ['平均会话轮次',totals.averageTurns,'轮 / 会话','所选周期内活跃会话的用户交互轮次总数 ÷ 活跃会话数；一次用户输入及对应回复为一轮。']
 ];
 const feedback=`<div class="compact-stat" data-feedback-card><div class="metric-card-head">${metricHelp('点赞点踩次数','所选周期内记录的点赞事件数和点踩事件数，分别统计，按反馈发生日期归属；不合并为净值或反馈率。')}${analysisMetricSymbol('点赞点踩次数')}</div><div class="behavior-feedback-values">${[['likes','点赞','点赞次数'],['dislikes','点踩','点踩次数']].map(([key,label,name])=>{const comparison=analysisMetricOptions(name,totals,previous);return `<div class="metric-feedback-item"><div class="metric-card-value"><strong>${number(totals[key])}</strong><small>${label}</small></div>${analysisComparison(comparison.current,comparison.previous,comparison.better)}</div>`}).join('')}</div></div>`;
 const charts=state.range===1?'':`<div class="behavior-trends"><section class="panel"><div class="panelhead"><h2>活跃会话趋势</h2><small>单位：个 · 按日</small></div>${behaviorChart(days,'sessions')}</section><section class="panel"><div class="panelhead"><h2>活跃用户趋势</h2><small>单位：人 · 按日</small></div>${behaviorChart(days,'users')}</section><section class="panel behavior-feedback-panel"><div class="panelhead"><h2>点赞点踩</h2><small>单位：次 · 按日</small></div>${behaviorChart(days,'feedback')}</section></div>`;
 return heading('用户行为分析','')+toolbar()+`<div class="behavior-dashboard"><div class="compact-stats analysis-metrics behavior-metrics">${metrics.map(item=>analysisMetric(...item,analysisMetricOptions(item[0],totals,previous))).join('')}${feedback}</div>${charts}<p class="behavior-range-note">${days[0].date.replaceAll('-','/')}${state.range===1?'':` — ${days.at(-1).date.replaceAll('-','/')}`} · Mock 数据${state.range===1?' · 今日累计':''}${state.range===1?'':' · 活跃用户按所选周期去重'}</p></div>`;
}
// Health uses fixed session, turn, tool and alert records shared by every summary and chart.
let healthMockCache,healthPreviousMockCache;
const healthAlertTypes=[
 {key:'slow',name:'慢响应',formula:'首 Token 输出耗时被规则识别为超过体验阈值的警告事件。'},
 {key:'llm',name:'LLM 报错',formula:'模型请求返回错误，或被 LLM 判断识别出的模型异常事件。'},
 {key:'rule',name:'规则触发异常',formula:'Trace 中的规则检查识别出的异常事件。'},
 {key:'action',name:'动作执行失败',formula:'本体或业务动作执行失败产生的警告事件。'}
];
const healthDurationTypes=[{key:'modelMs',name:'模型请求',color:'#4d8eff'},{key:'toolMs',name:'工具调用',color:'#18b99b'},{key:'retrievalMs',name:'知识检索',color:'#9b7aed'},{key:'ontologyMs',name:'本体操作',color:'#f0a142'}];
function healthMockRecords(previous=false){
 if(previous?healthPreviousMockCache:healthMockCache)return previous?healthPreviousMockCache:healthMockCache;
 const agents=analysisScopes.flatMap(scene=>scene.items),sessions=[],alerts=[];
 (previous?costPreviousSessions:costMockSessions).forEach((record,sessionIndex)=>{
  const session={id:(previous?'HP-':'HS-')+String(sessionIndex+1).padStart(4,'0'),date:record.date,hour:record.hour,agent:record.agent,agentName:agents.find(agent=>agent.id===record.agent).name,userId:'user-'+(sessionIndex%24+1),turns:[]};
  for(let index=0;index<record.turns;index++){
   const seed=(sessionIndex+1)*97+(index+1)*31+(previous?10000:0);
   const status=seed%53===0?'failed':seed%67===0?'no_return':seed%79===0?'interrupted':seed%89===0?'returned_error':'success';
   // Slow-response flags are fixed Mock evaluation results; no production threshold is implied.
   const slow=status==='success'&&seed%9===0,ttftMs=status==='no_return'?null:slow?3200+seed%2500:250+seed%1600;
   const tool={status:seed%41===0?'failed':'success',durationMs:300+seed%3500};
   const turn={id:session.id+'-T'+(index+1),index:index+1,status,slow,ttftMs,tool,modelMs:(ttftMs??0)+600+seed%3800,toolMs:tool.durationMs,retrievalMs:50+seed%650,ontologyMs:seed%3===0||seed%83===0?400+seed%1200:0};
   turn.durationMs=healthDurationTypes.reduce((sum,type)=>sum+turn[type.key],0);session.turns.push(turn);
   const addAlert=(type,severity,message,source='Trace 规则')=>alerts.push({id:turn.id+'-'+type,type,severity,message,source,sessionId:session.id,turnId:turn.id,turn:index+1,date:record.date,hour:record.hour,time:record.date+' '+String(record.hour).padStart(2,'0')+':'+String((index*7+sessionIndex%11)%60).padStart(2,'0')+':'+String(seed%60).padStart(2,'0'),agent:record.agent,agentName:session.agentName,userId:session.userId,status,ttftMs});
   if(slow)addAlert('slow','warning','慢响应：首 Token 输出耗时超过体验阈值');
   if(status==='failed'||status==='returned_error'||seed%71===0)addAlert('llm','severe','LLM 报错：provider=mock, model=mock-chat, error_code=UNKNOWN, error_type=AI_APICallError','LLM 判断');
   if(seed%37===0)addAlert('rule','warning','规则触发异常：Trace 规则检查发现返回内容与预期约束不一致');
   if(seed%83===0)addAlert('action','severe','动作执行失败：本体动作返回失败，需检查参数与执行结果');
  }
  session.durationMs=session.turns.reduce((sum,turn)=>sum+turn.durationMs,0);sessions.push(session);
 });
 const result={sessions,alerts};if(previous)healthPreviousMockCache=result;else healthMockCache=result;return result;
}
function healthAggregate(sessions,alerts){
 const turns=sessions.flatMap(session=>session.turns),tools=turns.map(turn=>turn.tool),completedTools=tools.filter(tool=>tool.status==='success'),ttfts=turns.filter(turn=>turn.ttftMs!==null);
 const errorSessions=sessions.filter(session=>session.turns.some(turn=>turn.status!=='success')).length,errorTurns=turns.filter(turn=>turn.status!=='success').length,slowTurns=turns.filter(turn=>turn.status==='success'&&turn.slow).length;
 const ratio=(n,d)=>d?n/d*100:0,mean=(rows,key)=>rows.length?rows.reduce((sum,row)=>sum+row[key],0)/rows.length:0;
 return {sessions:sessions.length,turns:turns.length,errorSessions,errorTurns,slowTurns,tools:tools.length,failedTools:tools.filter(tool=>tool.status==='failed').length,completedTools:completedTools.length,warningEvents:alerts.length,affectedUsers:new Set(alerts.map(alert=>alert.userId)).size,anomalousRate:ratio(errorSessions,sessions.length),turnErrorRate:ratio(errorTurns,turns.length),toolFailureRate:ratio(tools.filter(tool=>tool.status==='failed').length,tools.length),slowRate:ratio(slowTurns,turns.length),sessionAvgMs:mean(sessions,'durationMs'),toolAvgMs:mean(completedTools,'durationMs'),ttftAvgMs:mean(ttfts,'ttftMs'),validTtfts:ttfts.length,durations:healthDurationTypes.map(type=>({...type,value:turns.reduce((sum,turn)=>sum+turn[type.key],0)/1000}))};
}
function healthData(range=state.range,previous=false){
 const records=healthMockRecords(),prior=previous?healthMockRecords(true):{sessions:[],alerts:[]},allSessions=[...prior.sessions,...records.sessions],allAlerts=[...prior.alerts,...records.alerts],dates=analysisWindowRows(range,previous).map(row=>row[0]),chosen=new Set(analysisScopeChosen());
 const sessions=allSessions.filter(session=>dates.includes(session.date)&&chosen.has(session.agent)),alerts=allAlerts.filter(alert=>dates.includes(alert.date)&&chosen.has(alert.agent));
 const buckets=range===1?Array.from({length:24},(_,hour)=>({date:dates[0],hour,label:String(hour).padStart(2,'0')+':00'})):dates.map(date=>({date,label:date.slice(5)}));
 return {dates,sessions,alerts,totals:healthAggregate(sessions,alerts),buckets:buckets.map(bucket=>{const matches=row=>row.date===bucket.date&&(range!==1||row.hour===bucket.hour);return {...bucket,...healthAggregate(sessions.filter(matches),alerts.filter(matches))}})};
}
function healthPercent(value){return value.toFixed(2)+'%'}
function healthSeconds(value){return (value/1000).toFixed(2)+'s'}
function healthAlertChartSVG(data,width=600,height=250){
 const counts=healthAlertTypes.map(type=>({...type,count:data.alerts.filter(alert=>alert.type===type.key).length})),peak=Math.max(1,...counts.map(type=>type.count));
 const max=Math.max(4,Math.ceil(peak/4)*4),left=134,right=width-20,top=16,bottom=height-30;
 return `<svg class="health-alert-chart" width="${width}" height="${height}" role="img" aria-label="警告分布，${counts.map(type=>type.name+' '+type.count+' 次').join('，')}">${[0,1,2,3,4].map(i=>{const x=left+(right-left)*i/4;return `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="#e8eef8" stroke-dasharray="3 3"/><text x="${x}" y="${height-8}" text-anchor="middle">${max*i/4}</text>`}).join('')}${counts.map((type,i)=>{const y=top+(i+.5)*(bottom-top)/4;return `<g><text x="3" y="${y+4}">${type.name} ⓘ<title>${type.formula}</title></text><rect data-health-alert-type="${type.key}" x="${left}" y="${y-5}" width="${type.count/max*(right-left)}" height="10" rx="5" fill="#4d8eff"><title>${type.name}：${type.count} 次</title></rect></g>`}).join('')}</svg>`;
}
function healthAlertDistribution(data){
 return `<section class="panel health-alert-distribution"><div class="panelhead"><h2>${metricHelp('警告分布','按警告类型统计筛选范围内的事件数，与警告事件数使用同一批 Mock 记录。')}</h2></div><div class="analysis-chart-host health-alert-plot" data-analysis-chart="health-alert">${healthAlertChartSVG(data)}</div></section>`;
}
function healthAlertList(data){
 const filter=state.healthAlertSeverity||'all',events=data.alerts.filter(alert=>filter==='all'||alert.severity===filter).sort((a,b)=>b.time.localeCompare(a.time)||b.id.localeCompare(a.id));
 return `<div class="panelhead"><h2>${metricHelp('实时警告','展示所选场景与时间范围内最近的 20 条 Mock 警告记录，按事件时间倒序排列。')}</h2><div class="segments">${[['all','全部'],['severe','严重'],['warning','警告']].map(([key,label])=>`<button id="health-alert-filter-${key}" class="${filter===key?'selected':''}" aria-pressed="${filter===key}" onclick="healthSetAlertSeverity('${key}')">${label}</button>`).join('')}</div></div><div class="health-alert-feed">${events.slice(0,20).map(alert=>`<button class="health-alert-item" onclick="healthAlertDetail('${alert.id}')" aria-label="查看${alert.time} ${healthAlertTypes.find(type=>type.key===alert.type).name} ${alert.agentName}"><span class="health-alert-copy"><span class="health-alert-name"><b>${healthAlertTypes.find(type=>type.key===alert.type).name}</b><span>${esc(alert.agentName)}</span><span aria-hidden="true">›</span></span><span class="health-alert-message">${esc(alert.message)}</span></span><span class="health-alert-meta"><span class="health-alert-badge ${alert.severity}">${alert.severity==='severe'?'严重':'警告'}</span><time title="${alert.time}">${state.range===1?alert.time.slice(11,16):alert.time.slice(5,16)}</time></span></button>`).join('')||'<div class="health-alert-empty">所选范围暂无'+(filter==='severe'?'严重':filter==='warning'?'警告':'警告')+'事件</div>'}</div><div class="health-alert-footer">共 ${events.length} 条 · 展示最近 ${Math.min(20,events.length)} 条</div>`;
}
function healthSetAlertSeverity(value){state.healthAlertSeverity=value;$('#health-live-alerts').innerHTML=healthAlertList(healthData());$('#health-alert-filter-'+value)?.focus({preventScroll:true})}
function healthAlertDetail(id){
 const alert=healthMockRecords().alerts.find(item=>item.id===id);if(!alert)return;
 const type=healthAlertTypes.find(item=>item.key===alert.type),status={success:'最终成功返回',failed:'最终失败',no_return:'无返回',interrupted:'中断',returned_error:'返回错误'}[alert.status];
 modal('警告详情',`<div class="health-alert-detail-title"><b>${type.name}</b><span class="health-alert-badge ${alert.severity}">${alert.severity==='severe'?'严重':'警告'}</span></div><p>${esc(alert.message)}</p><div class="lineage-fields">${[['事件时间',alert.time],['识别来源',alert.source],['Agent',alert.agentName],['用户',alert.userId],['会话编号',alert.sessionId],['对话轮次','第 '+alert.turn+' 轮'],['轮次最终状态',status],['首 Token 输出耗时',alert.ttftMs===null?'无首 Token 返回':healthSeconds(alert.ttftMs)]].map(([name,value])=>`<div class="lineage-field"><span>${name}</span><b>${esc(value)}</b></div>`).join('')}</div><p class="note">固定 Mock 警告记录，刷新后恢复初始数据。</p>`);
}
function healthSlowChartSVG(data,width=1100,height=280){
 const buckets=data.buckets,left=64,right=width-20,top=20,bottom=height-34,max=Math.min(100,Math.max(5,Math.ceil(Math.max(0,...buckets.map(bucket=>bucket.slowRate))/5)*5));
 const visibleTicks=analysisTickIndices(buckets.length,right-left);
 const x=i=>left+12+i*(right-left-24)/(buckets.length-1||1),y=value=>bottom-value/max*(bottom-top);
 return `<svg class="health-slow-chart" width="${width}" height="${height}" role="img" aria-label="慢响应轮次率趋势，${state.range===1?'按小时':'按日'}">${[0,1,2,3,4].map(i=>{const py=bottom-i/4*(bottom-top);return `<line x1="${left}" y1="${py}" x2="${right}" y2="${py}" stroke="#e5ebf3"/><text x="${left-12}" y="${py+4}" text-anchor="end">${(max*i/4).toLocaleString('zh-CN',{maximumFractionDigits:2})}%</text>`}).join('')}<path class="analysis-series" data-health-slow-series d="${analysisCurvePath(buckets.map((bucket,i)=>[x(i),y(bucket.slowRate)]))}" fill="none" stroke="#f0a142" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>${buckets.map((bucket,i)=>`<text data-health-trend-label="${bucket.label}" x="${x(i)}" y="${height-10}" text-anchor="middle"${visibleTicks.has(i)?'':' visibility="hidden"'}>${bucket.label}</text>`).join('')}${buckets.map((bucket,i)=>{const start=i?(x(i-1)+x(i))/2:left,end=i===buckets.length-1?right:(x(i)+x(i+1))/2;return `<g class="health-slow-point" tabindex="0" role="button" aria-label="${bucket.label}，慢响应轮次率 ${healthPercent(bucket.slowRate)}，${bucket.slowTurns} / ${bucket.turns} 轮" onmouseenter="healthTrendHover(this,${i})" onmouseleave="healthTrendLeave(this)" onfocus="healthTrendHover(this,${i})" onblur="healthTrendLeave(this)"><rect x="${start}" y="${top}" width="${end-start}" height="${bottom-top}" fill="transparent"/><g class="health-slow-focus"><line x1="${x(i)}" y1="${top}" x2="${x(i)}" y2="${bottom}" stroke="#ccd5e3" stroke-dasharray="4 4"/><circle cx="${x(i)}" cy="${y(bucket.slowRate)}" r="3.5" fill="white" stroke="#f0a142" stroke-width="2" vector-effect="non-scaling-stroke"/></g></g>`}).join('')}</svg>`;
}
function healthSlowTrend(data){
 return `<section class="panel health-slow-panel"><div class="panelhead"><h2>${metricHelp('慢响应轮次率趋势','最终成功返回，但首 Token 输出耗时超过体验阈值的轮次数 / 总轮次数。按各时间点的分子与分母计算，不对百分比取平均。慢响应判定使用固定 Mock 标记。')}</h2><div class="health-slow-legend"><i></i>慢响应轮次率</div></div><div class="health-trend-scroll analysis-chart-host" data-analysis-chart="health-slow">${healthSlowChartSVG(data)}</div>${data.totals.turns?'':'<div class="health-trend-empty">所选范围暂无对话轮次数据</div>'}<div class="health-trend-tooltip" hidden></div></section>`;
}
function healthTrendHover(node,index){
 const panel=node.closest('.health-slow-panel');if(!panel)return;const tooltip=panel.querySelector('.health-trend-tooltip'),bucket=healthData().buckets[index];
 tooltip.innerHTML=`<b>${bucket.date}${state.range===1?' '+bucket.label:''}</b><div><span><i></i>慢响应轮次率</span><strong>${healthPercent(bucket.slowRate)}</strong></div><small>${bucket.slowTurns} 个慢响应轮次 / ${bucket.turns} 个总轮次</small>`;tooltip.hidden=false;
 const rect=node.getBoundingClientRect(),bounds=panel.getBoundingClientRect();tooltip.style.left=Math.max(12,Math.min(rect.left-bounds.left+rect.width/2+12,panel.clientWidth-tooltip.offsetWidth-12))+'px';
}
function healthTrendLeave(node){const tooltip=node.closest('.health-slow-panel')?.querySelector('.health-trend-tooltip');if(tooltip)tooltip.hidden=true}
function healthDurationDistribution(totals){
 const max=Math.max(1,...totals.durations.map(type=>type.value));
 return `<section class="panel step-performance health-duration-panel"><div class="panelhead"><h2>${metricHelp('耗时分布','按执行类型汇总筛选范围内的累计执行耗时。')}</h2><small>累计耗时 · 单位：秒</small></div><div class="step-bars">${totals.durations.map(type=>`<div class="step-row"><span><i style="background:${type.color}"></i>${type.name}</span><div class="step-track"><i style="width:${type.value/max*100}%;background:${type.color}"></i></div><b title="${type.value.toFixed(2)} 秒">${type.value.toLocaleString('zh-CN',{maximumFractionDigits:1})}s</b></div>`).join('')}</div></section>`;
}
function healthPage(){
 const data=healthData(),d=data.totals,previous=healthData(state.range,true).totals,number=value=>value.toLocaleString('zh-CN');
 return heading('健康度分析','')+toolbar()+`<div class="health-dashboard"><section class="analysis-section" aria-labelledby="error-analysis"><div class="panelhead"><h2 id="error-analysis">报错分析</h2></div><div class="health-error-metrics">`+analysisMetrics([
 ['异常会话率',healthPercent(d.anomalousRate),`${number(d.errorSessions)} / ${number(d.sessions)} 个会话`,'存在至少一轮最终失败、无返回、中断或返回错误的会话数 / 总会话数。'],
 ['工具调用失败率',healthPercent(d.toolFailureRate),`${number(d.failedTools)} / ${number(d.tools)} 次调用`,'失败工具调用次数 ÷ 已结束工具调用总次数 × 100%。'],
 ['轮次错误率',healthPercent(d.turnErrorRate),`${number(d.errorTurns)} / ${number(d.turns)} 轮`,'最终未成功返回、无返回、中断或返回错误的轮次数 / 总轮次数。'],
 ['警告事件数',number(d.warningEvents),'条警告事件','筛选范围内 trace 规则/LLM 判断识别出的告警事件总数。'],
 ['警告影响用户数',number(d.affectedUsers),'位用户 · 按用户去重','筛选范围内，至少关联 1 条告警事件的去重用户数。']
 ].map(item=>[...item,analysisMetricOptions(item[0],d,previous)]))+`</div><div class="health-alert-panels">${healthAlertDistribution(data)}<section id="health-live-alerts" class="panel health-live-alerts">${healthAlertList(data)}</section></div></section><section class="analysis-section" aria-labelledby="performance-analysis"><div class="panelhead"><h2 id="performance-analysis">性能分析</h2></div><div class="health-performance-metrics">`+analysisMetrics([
 ['会话平均耗时',healthSeconds(d.sessionAvgMs),`${number(d.sessions)} 个会话`,'筛选范围内所有会话的执行耗时总和 ÷ 总会话数。'],
 ['慢响应轮次率',healthPercent(d.slowRate),`${number(d.slowTurns)} / ${number(d.turns)} 轮`,'最终成功返回，但首 Token 输出耗时超过体验阈值的轮次数 / 总轮次数。'],
 ['工具平均耗时',healthSeconds(d.toolAvgMs),`${number(d.completedTools)} 次已完成调用`,'工具调用耗时总和 ÷ 已完成工具调用次数。'],
 ['首 token 延迟（TTFT）',healthSeconds(d.ttftAvgMs),`${number(d.validTtfts)} 个有效轮次`,'首个输出 token 时间 − 模型请求发起时间；展示有效轮次的首 Token 输出耗时均值。']
 ].map(item=>[...item,analysisMetricOptions(item[0],d,previous)]))+`</div>${healthSlowTrend(data)}${healthDurationDistribution(d)}</section><p class="health-range-note">${data.dates[0].replaceAll('-','/')}${state.range===1?'':` — ${data.dates.at(-1).replaceAll('-','/')}`} · Mock 数据 · ${state.range===1?'按小时':'按日'}统计</p></div>`;
}


// Fixed Mock sessions: each session belongs to one hourly bucket, so hourly and daily totals reconcile.
const costMetricDefinitions=[
 {key:'total',name:'总 Token',color:'#4d8eff',note:'Token',formula:'所选周期内模型调用的输入 Token 与输出 Token 之和。'},
 {key:'input',name:'输入 Token',color:'#18b99b',note:'Token',formula:'所选周期内全部模型调用记录的输入 Token 总数。'},
 {key:'output',name:'输出 Token',color:'#f0a142',note:'Token',formula:'所选周期内全部模型调用记录的输出 Token 总数。'},
 {key:'calls',name:'模型调用次数',color:'#9b7aed',note:'次',formula:'所选周期内实际发起的模型请求次数，重试请求单独计次。'},
 {key:'perTurn',name:'平均每轮 Token 消耗',color:'#e5799d',note:'Token / 轮',formula:'所选周期的总 Token ÷ 用户交互总轮次；一次用户输入及对应回复为一轮。'},
 {key:'perSession',name:'平均每会话 Token 消耗',color:'#f29b38',note:'Token / 会话',formula:'所选周期的总 Token ÷ 同周期有模型调用的去重会话数。'}
];
function costMockDay([date,count,,,averageTurns],dayIndex,dailyTokens){
 const agents=analysisScopes.flatMap(scene=>scene.items.filter(item=>item.type==='Agent'));
 const weights=Array.from({length:count},(_,i)=>7+(i*7+dayIndex*3)%11),sum=weights.reduce((a,b)=>a+b,0);
 let consumed=0;
 return weights.map((weight,index)=>{
  const before=Math.round(consumed/sum*dailyTokens);consumed+=weight;
  const total=Math.round(consumed/sum*dailyTokens)-before,input=Math.round(total*(.68+(index+dayIndex)%9/100));
  const turns=Math.max(1,Math.round(averageTurns)+(index%3)-1);
  return {date,hour:(index*5+dayIndex*3)%24,agent:agents[(index+dayIndex)%agents.length].id,sessionId:'cost-'+date+'-'+index,input,output:total-input,calls:turns+1+index%3,turns};
 });
}
const costMockSessions=behaviorDailyMock.flatMap((row,i)=>costMockDay(row,i,[7.4,7.8,8.1,8.6,9.2,8.8,10.9,12.3,12.4,14,18.9,13.4,11.6,12.8][i]*1e6));
const costPreviousSessions=analysisPreviousDailyMock.flatMap((row,i)=>costMockDay(row,i+14,[6.8,7.1,7.4,8.2,7.7,6.9,8.1,9.2,10.1,8.9,12.1,10.2,9.6,8.8][i]*1e6));
function costAggregate(rows){
 const result={input:0,output:0,calls:0,turns:0,sessions:new Set(rows.map(row=>row.sessionId)).size};
 rows.forEach(row=>['input','output','calls','turns'].forEach(key=>result[key]+=row[key]));
 result.total=result.input+result.output;
 result.perTurn=result.turns?result.total/result.turns:0;
 result.perSession=result.sessions?result.total/result.sessions:0;
 return result;
}
function costData(range=state.range,previous=false){
 const dates=analysisWindowRows(range,previous).map(row=>row[0]),chosen=new Set(analysisScopeChosen());
 const rows=[...costPreviousSessions,...costMockSessions].filter(row=>dates.includes(row.date)&&chosen.has(row.agent));
 const buckets=range===1?Array.from({length:24},(_,hour)=>({label:String(hour).padStart(2,'0')+':00',date:dates[0],hour})):dates.map(date=>({label:date.slice(5),date}));
 return {dates,totals:costAggregate(rows),buckets:buckets.map(bucket=>({...bucket,...costAggregate(rows.filter(row=>row.date===bucket.date&&(range!==1||row.hour===bucket.hour)))}))};
}
function costNumber(value,compact=true){
 if(!compact)return value.toLocaleString('zh-CN',{maximumFractionDigits:1});
 if(value>=1e6)return (value/1e6).toLocaleString('en-US',{maximumFractionDigits:2})+'M';
 if(value>=1e3)return (value/1e3).toLocaleString('en-US',{maximumFractionDigits:2})+'k';
 return value.toLocaleString('zh-CN',{maximumFractionDigits:1});
}
const costTrendGroups=[
 {key:'total',title:'Token 用量趋势',keys:['total','input','output'],formula:'总 Token、输入 Token、输出 Token 按所选范围汇总。今日按小时统计，7 天和 14 天按日统计。'},
 {key:'average',title:'平均 Token 消耗趋势',keys:['perTurn','perSession'],formula:'平均每轮 Token 消耗 = 各时间点总 Token / 轮次数；平均每会话 Token 消耗 = 各时间点总 Token / 会话数。今日按小时统计，7 天和 14 天按日统计。'}
];
function costChartSeries(group='total'){const keys=(costTrendGroups.find(item=>item.key===group)||costTrendGroups[0]).keys;return costMetricDefinitions.filter(item=>keys.includes(item.key))}
function costChart(buckets,width=1100,height=280,group='total'){
 const series=costChartSeries(group),title=(costTrendGroups.find(item=>item.key===group)||costTrendGroups[0]).title;
 const left=64,right=width-20,top=30,bottom=height-34,visibleTicks=analysisTickIndices(buckets.length,right-left);
 const ceiling=peak=>{if(!peak)return 4;const raw=peak/4,power=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].find(n=>n*power>=raw)*power;return step*4};
 const tokenMax=ceiling(Math.max(0,...buckets.flatMap(bucket=>series.map(item=>bucket[item.key]))));
 const x=i=>left+12+i*(right-left-24)/(buckets.length-1||1),y=value=>bottom-value/tokenMax*(bottom-top);
 const tick=value=>value>=1e6?costNumber(value/1e6,false)+'M':value>=1e4?costNumber(value/1e4,false)+'万':costNumber(value,false);
 return `<svg class="cost-trend-chart" width="${width}" height="${height}" role="img" aria-label="${title}，${state.range===1?'每小时':'每日'}，${series.map(item=>item.name).join('、')}"><text class="cost-axis-unit" x="${left}" y="14">Token</text>${[0,1,2,3,4].map(i=>{const py=bottom-i/4*(bottom-top);return `<line x1="${left}" y1="${py}" x2="${right}" y2="${py}" stroke="#e5ebf3"/><text x="${left-12}" y="${py+4}" text-anchor="end">${tick(tokenMax*i/4)}</text>`}).join('')}${series.map(item=>`<path class="analysis-series" data-cost-series="${item.key}" d="${analysisCurvePath(buckets.map((bucket,i)=>[x(i),y(bucket[item.key])]))}" fill="none" stroke="${item.color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`).join('')}${buckets.map((bucket,i)=>`<text data-cost-label="${bucket.label}" x="${x(i)}" y="${height-10}" text-anchor="middle"${visibleTicks.has(i)?'':' visibility="hidden"'}>${bucket.label}</text>`).join('')}${buckets.map((bucket,i)=>{const start=i?(x(i-1)+x(i))/2:left,end=i===buckets.length-1?right:(x(i)+x(i+1))/2;return `<g class="cost-chart-point" tabindex="0" role="button" aria-label="${bucket.label}，${series.map(item=>item.name+' '+costNumber(bucket[item.key],false)).join('，')}" onmouseenter="costChartHover(this,${i})" onmouseleave="costChartLeave(this)" onfocus="costChartHover(this,${i})" onblur="costChartLeave(this)"><rect x="${start}" y="${top}" width="${end-start}" height="${bottom-top}" fill="transparent"/><g class="cost-chart-focus"><line x1="${x(i)}" y1="${top}" x2="${x(i)}" y2="${bottom}" stroke="#c5cfdf" stroke-dasharray="4 4"/>${series.map(item=>`<circle cx="${x(i)}" cy="${y(bucket[item.key])}" r="3.5" fill="white" stroke="${item.color}" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join('')}</g></g>`}).join('')}</svg>`;
}
function costChartHover(node,index){
 const panel=node.closest('.cost-trend-panel');if(!panel)return;const tooltip=panel.querySelector('.cost-chart-tooltip'),bucket=costData().buckets[index],series=costChartSeries(panel.dataset.costChart);
 tooltip.innerHTML=`<b>${bucket.date}${state.range===1?' '+bucket.label:''}</b>${series.map(item=>`<div><span><i style="background:${item.color}"></i>${item.name}</span><strong>${costNumber(bucket[item.key],false)}</strong></div>`).join('')}`;
 tooltip.hidden=false;
 const rect=node.getBoundingClientRect(),bounds=panel.getBoundingClientRect();
 tooltip.style.left=Math.max(12,Math.min(rect.left-bounds.left+rect.width/2+12,panel.clientWidth-tooltip.offsetWidth-12))+'px';
}
function costChartLeave(node){const tooltip=node.closest('.cost-trend-panel')?.querySelector('.cost-chart-tooltip');if(tooltip)tooltip.hidden=true}
function costTrendPanel(group,buckets,totals){
 const series=costChartSeries(group.key);
 return `<section class="panel cost-trend-panel" data-cost-chart="${group.key}"><div class="panelhead cost-trend-head"><h2>${metricHelp(group.title,group.formula)}</h2><div class="cost-trend-legend">${series.map(item=>`<span><i style="background:${item.color}"></i>${item.name}</span>`).join('')}</div></div><div class="cost-chart-scroll analysis-chart-host" data-analysis-chart="cost-${group.key}">${costChart(buckets,1100,280,group.key)}</div>${totals.calls?'':'<div class="cost-chart-empty">所选范围暂无模型调用数据</div>'}<div class="cost-chart-tooltip" hidden></div></section>`;
}
function costPage(){
 const {dates,totals,buckets}=costData(),previous=costData(state.range,true).totals;
 return heading('成本分析','')+toolbar()+`<section class="cost-dashboard">${analysisMetrics(costMetricDefinitions.map(item=>[item.name,costNumber(totals[item.key],item.key!=='calls'),item.note,item.formula,analysisMetricOptions(item.name,totals,previous)]))}<div class="cost-trend-panels">${costTrendGroups.map(group=>costTrendPanel(group,buckets,totals)).join('')}</div><p class="cost-range-note">${dates[0].replaceAll('-','/')}${state.range===1?'':` — ${dates.at(-1).replaceAll('-','/')}`} · Mock 数据 · ${state.range===1?'按小时':'按日'}统计</p></section>`;
}



  // Adapt chart host selector from #main to page root
  var _syncAnalysisCharts = syncAnalysisCharts;
  syncAnalysisCharts = function () {
    analysisChartObserver && analysisChartObserver.disconnect();
    var root = host.getPageRoot() || document;
    var hosts = root.querySelectorAll('[data-analysis-chart]');
    if (typeof ResizeObserver === 'function' && !analysisChartObserver) {
      analysisChartObserver = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { analysisChartResizeQueue.add(entry.target); });
        if (!analysisChartResizeFrame) {
          analysisChartResizeFrame = requestAnimationFrame(function () {
            analysisChartResizeFrame = 0;
            analysisChartResizeQueue.forEach(function (h) {
              if (h.isConnected) drawAnalysisChart(h);
            });
            analysisChartResizeQueue.clear();
          });
        }
      });
    }
    hosts.forEach(function (h) {
      drawAnalysisChart(h);
      analysisChartObserver && analysisChartObserver.observe(h);
    });
  };

  // Host paints title + time range; boards are body-only from Enhance.
  function stripEnhanceChrome(html, title) {
    return html.replace(heading(title, '') + toolbar(), '');
  }
  function costBoard() {
    return stripEnhanceChrome(costPage(), '成本分析');
  }
  function healthBoard() {
    return stripEnhanceChrome(healthPage(), '健康度分析');
  }
  function behaviorBoard() {
    return stripEnhanceChrome(behaviorPage(), '用户行为分析');
  }

  global.AIOpsBoards = {
    configure: function (opts) {
      Object.assign(host, opts || {});
    },
    costPage: costBoard,
    healthPage: healthBoard,
    behaviorPage: behaviorBoard,
    syncCharts: function () {
      syncAnalysisCharts();
    },
    scopePicker: function () {
      return analysisScopePicker();
    }
  };

  Object.assign(global, {
    analysisScopeMenu: analysisScopeMenu,
    analysisScopeBulk: analysisScopeBulk,
    analysisScopeScene: analysisScopeScene,
    analysisScopeToggle: analysisScopeToggle,
    analysisScopeClose: analysisScopeClose,
    healthSetAlertSeverity: healthSetAlertSeverity,
    healthAlertDetail: healthAlertDetail,
    healthTrendHover: healthTrendHover,
    healthTrendLeave: healthTrendLeave,
    costChartHover: costChartHover,
    costChartLeave: costChartLeave
  });

})(window);
