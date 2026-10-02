(() => {
  'use strict';
  const t = (text, vars = {}) => window.siteI18n ? window.siteI18n.t(text, vars) : text.replace(/\{(\w+)\}/g, (match, key) => vars[key] === undefined ? match : String(vars[key]));
  const dynamic = element => { if (element) element.setAttribute('data-i18n-dynamic', ''); return element; };
  let referralReady = false;
  function renderReferral() {
    if (referralReady) dynamic(document.getElementById('referral-status')).textContent = t('Use my link to get started with Hevy in the mobile app.');
  }
  // Only public referral settings belong here. Never add a Hevy API key.
  fetch('/data/training-config.json', { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error('Settings unavailable'); return response.json(); })
    .then(settings => {
      if (typeof settings.hevyReferralUrl !== 'string' || !settings.hevyReferralUrl.trim()) return;
      const url = new URL(settings.hevyReferralUrl);
      if (url.protocol !== 'https:' || url.username || url.password) return;
      const link = document.getElementById('hevy-referral-link');
      if (!link) return;
      link.href = url.href; link.hidden = false;
      document.getElementById('hevy-referral-pending').hidden = true;
      document.getElementById('referral-disclosure').hidden = false;
      referralReady = true; renderReferral();
    })
    .catch(() => { /* Keep the honest coming-soon state and working profile links. */ });
  window.addEventListener('site:languagechange', renderReferral);
})();
(() => {
  'use strict';
  const t = (text, vars = {}) => window.siteI18n ? window.siteI18n.t(text, vars) : text.replace(/\{(\w+)\}/g, (match, key) => vars[key] === undefined ? match : String(vars[key]));
  const dynamic = element => { if (element) element.setAttribute('data-i18n-dynamic', ''); return element; };
  const metricInfo = {
    weight_kg: ['Body weight', 'kg'], lean_mass_kg: ['Lean mass', 'kg'], fat_percent: ['Body fat', '%'],
    neck_cm: ['Neck', 'cm'], shoulder_cm: ['Shoulders', 'cm'], chest_cm: ['Chest', 'cm'],
    left_bicep_cm: ['Left bicep', 'cm'], right_bicep_cm: ['Right bicep', 'cm'],
    left_forearm_cm: ['Left forearm', 'cm'], right_forearm_cm: ['Right forearm', 'cm'],
    abdomen: ['Abdomen', 'cm'], waist: ['Waist', 'cm'], hips: ['Hips', 'cm'],
    left_thigh: ['Left thigh', 'cm'], right_thigh: ['Right thigh', 'cm'],
    left_calf: ['Left calf', 'cm'], right_calf: ['Right calf', 'cm']
  };
  const locale = () => window.siteI18n ? window.siteI18n.locale : 'en-GB';
  const number = value => new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(value);
  const date = value => new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value.length === 10 ? value + 'T12:00:00Z' : value));
  const node = (tag, text, className) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; };
  const icon = id => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [name, value] of Object.entries({ class: 'ui-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(name, value);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '/assets/ui-icons.svg?v=2#' + id);
    svg.append(use);
    return svg;
  };
  const profileLink = () => { const a = node('a', t('Open my training on Hevy'), 'training-text-link'); a.append(' ', icon('arrow-up-right')); a.href = 'https://hevy.com/user/thomalex'; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
  const workoutKey = workout => String(workout.id || workout.startTime + '|' + workout.title);
  let currentFeed = null;
  let historyLimit = 7;
  function stat(label, value) { const div = node('div'); div.append(node('dt', label), node('dd', value)); return div; }
  function exercises(workout) {
    const details = node('details', undefined, 'workout-exercises'); details.dataset.workoutDetail = workoutKey(workout);
    const summary = node('summary', t('Inside this session')); const mark = node('span'); mark.setAttribute('aria-hidden', 'true'); mark.append(icon('plus')); summary.append(mark); details.append(summary);
    const ul = node('ul');
    for (const exercise of workout.exercises) {
      const li = node('li'); const text = node('span', exercise.title);
      const setText = exercise.sets.map(set => {
        const parts = [];
        if (Number.isFinite(set.weightKg)) parts.push(number(set.weightKg) + ' kg');
        if (Number.isFinite(set.reps) && set.reps > 0) parts.push(t('{count} reps', { count: number(set.reps) }));
        if (Number.isFinite(set.distanceMeters) && set.distanceMeters > 0) parts.push(number(set.distanceMeters) + ' m');
        if (Number.isFinite(set.durationSeconds) && set.durationSeconds > 0) parts.push(t('{count} sec', { count: number(set.durationSeconds) }));
        const detail = parts.join(' × ') || t('Set logged');
        return set.type === 'warmup' ? t('Warm-up: {detail}', { detail }) : detail;
      }).join(' · ');
      text.append(node('small', setText, 'session-set-detail'));
      li.append(text, node('span', t(exercise.sets.length === 1 ? '{count} set' : '{count} sets', { count: number(exercise.sets.length) }))); ul.append(li);
    }
    details.append(ul, node('p', t('Sets are shown as logged in Hevy, including warm-ups.'))); return details;
  }
  function renderWorkouts(feed) {
    const openSessions = new Set(Array.from(document.querySelectorAll('[data-workout-session][open]'), e => e.dataset.workoutSession));
    const openDetails = new Set(Array.from(document.querySelectorAll('[data-workout-detail][open]'), e => e.dataset.workoutDetail));
    const holder = dynamic(document.getElementById('featured-workout'));
    const history = document.getElementById('workout-history'); const list = dynamic(document.getElementById('workout-history-list')); const more = document.getElementById('load-workouts');
    holder.replaceChildren(); list.replaceChildren(); history.hidden = feed.workouts.length < 2;
    if (!feed.workouts.length) { holder.append(node('h3', t('The next session starts here.')), node('p', t('No workouts in the connected log yet.'), 'workout-description'), profileLink()); holder.removeAttribute('aria-labelledby'); more.hidden = true; return; }
    const latest = feed.workouts[0];
    const top = node('div', undefined, 'workout-top'); top.append(node('span', t('LATEST SESSION / HEVY'), 'training-index'));
    const time = node('time', date(latest.startTime)); time.dateTime = latest.startTime; top.append(time);
    const title = node('h3', latest.title); title.id = 'workout-title'; holder.setAttribute('aria-labelledby', 'workout-title');
    const metrics = node('dl', undefined, 'workout-metrics');
    metrics.append(stat(t('DURATION'), number(latest.durationMinutes) + ' min'), stat(t('EXERCISES'), number(latest.exercises.length)), stat(t('LOGGED SETS'), number(latest.exercises.reduce((count, e) => count + e.sets.length, 0))));
    holder.append(top, title, metrics, exercises(latest), profileLink(), node('p', t('From my connected Hevy training log.'), 'workout-source'));
    let shown = 1;
    function appendThrough(end) {
      for (; shown < end; shown++) {
        const workout = feed.workouts[shown]; const item = node('details', undefined, 'history-session'); const summary = node('summary'); const label = node('span'); item.dataset.workoutSession = workoutKey(workout);
        const when = node('time', date(workout.startTime)); when.dateTime = workout.startTime; label.append(when, node('strong', workout.title));
        const exerciseCount = t(workout.exercises.length === 1 ? '{count} exercise' : '{count} exercises', { count: number(workout.exercises.length) });
        summary.append(label, node('small', number(workout.durationMinutes) + ' min · ' + exerciseCount));
        const body = node('div'); body.append(exercises(workout)); item.append(summary, body); list.append(item);
      }
      more.hidden = shown >= feed.workouts.length;
    }
    appendThrough(Math.min(historyLimit, feed.workouts.length));
    more.onclick = () => { historyLimit += 6; appendThrough(Math.min(historyLimit, feed.workouts.length)); };
    for (const element of document.querySelectorAll('[data-workout-session]')) element.open = openSessions.has(element.dataset.workoutSession);
    for (const element of document.querySelectorAll('[data-workout-detail]')) element.open = openDetails.has(element.dataset.workoutDetail);
  }
  function renderMeasurements(measurements) {
    const available = Object.keys(metricInfo).filter(key => measurements.some(m => Number.isFinite(m.values[key])));
    const select = dynamic(document.getElementById('measurement-metric')); const previousMetric = select.value; select.replaceChildren();
    document.getElementById('measurements-empty').hidden = available.length > 0; document.getElementById('measurement-dashboard').hidden = available.length === 0;
    if (!available.length) return;
    for (const key of available) { const option = node('option', t(metricInfo[key][0])); option.value = key; select.append(option); }
    if (available.includes(previousMetric)) select.value = previousMetric;
    function renderMetric() {
      const key = select.value; const [englishLabel, unit] = metricInfo[key]; const label = t(englishLabel);
      const readings = measurements.filter(m => Number.isFinite(m.values[key])).map(m => ({ date: m.date, value: m.values[key] })).sort((a,b) => a.date.localeCompare(b.date));
      const first = readings[0], last = readings[readings.length - 1], change = last.value-first.value;
      const summary = dynamic(document.getElementById('measurement-summary')); summary.replaceChildren();
      const readingCount = t(readings.length === 1 ? '{count} recorded reading' : '{count} recorded readings', { count: number(readings.length) });
      for (const [title, value, detail] of [[t('LATEST'), number(last.value) + ' ' + unit, date(last.date)], [t('FIRST LOGGED'), number(first.value) + ' ' + unit, date(first.date)], [t('CHANGE'), (change > 0 ? '+' : '') + number(change) + ' ' + unit, readingCount]]) { const s = stat(title,value); s.querySelector('dd').append(node('small', detail)); summary.append(s); }
      const chart = dynamic(document.getElementById('measurement-chart')); chart.replaceChildren();
      const svgNode = (tag, attrs, text) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for(const [name,value] of Object.entries(attrs)) n.setAttribute(name,String(value)); if(text!==undefined)n.textContent=text; return n; };
      const svg = svgNode('svg', {viewBox:'0 0 700 220', role:'img', 'aria-labelledby':'progress-chart-title progress-chart-description'});
      svg.append(svgNode('title',{id:'progress-chart-title'},t('{label} over time', { label })),svgNode('desc',{id:'progress-chart-description'},t('{count} readings. From {first} {unit} on {firstDate} to {last} {unit} on {lastDate}. Full values are available in the measurement history below.', { count: number(readings.length), first: number(first.value), unit, firstDate: date(first.date), last: number(last.value), lastDate: date(last.date) })));
      const minimum = Math.min(...readings.map(r=>r.value)), maximum = Math.max(...readings.map(r=>r.value));
      const pad = Math.max((maximum-minimum)*.12,.5), low=minimum-pad, high=maximum+pad;
      const start=Date.parse(first.date), finish=Date.parse(last.date);
      const points = readings.map(r=>({x:finish===start?350:20+(Date.parse(r.date)-start)/(finish-start)*660,y:200-(r.value-low)/(high-low)*180,entry:r}));
      for(const y of [20,110,200])svg.append(svgNode('line',{x1:20,x2:680,y1:y,y2:y,class:'chart-grid'}));
      if(points.length>1)svg.append(svgNode('polyline',{points:points.map(p=>p.x + ',' + p.y).join(' '),class:'chart-line'}));
      for(const point of points) { const dot=svgNode('circle',{cx:point.x,cy:point.y,r:4,class:'chart-point'});dot.append(svgNode('title',{},date(point.entry.date) + ': ' + number(point.entry.value) + ' ' + unit));svg.append(dot); }
      const caption=node('div',undefined,'chart-caption');caption.append(node('span',date(first.date)),node('span',date(last.date)));
      chart.append(svg,caption,node('p',t('Recorded range: {minimum}–{maximum} {unit}.', { minimum: number(minimum), maximum: number(maximum), unit }),'chart-range'));
      const table = dynamic(document.getElementById('measurement-table')); table.replaceChildren();
      dynamic(document.getElementById('measurement-table-caption')).textContent=label + ' (' + unit + ')';
      for(const reading of readings.slice().reverse()){ const row=node('tr');row.append(node('td',date(reading.date)),node('td',number(reading.value) + ' ' + unit));table.append(row);}
    }
    select.onchange = renderMetric; renderMetric();
  }
  function renderFeed() {
    if (!currentFeed) return;
    renderWorkouts(currentFeed); renderMeasurements(currentFeed.measurements);
    const status=dynamic(document.getElementById('hevy-log-status'));status.replaceChildren(node('span',t('CONNECTED TRAINING LOG'),'training-index'),node('p',t('Updated {date}. Workouts and measurements are checked automatically about every 30 minutes.', { date: date(currentFeed.updatedAt) })));
  }
  window.addEventListener('site:languagechange', renderFeed);
  fetch('/data/hevy-feed.json', { cache:'no-store' })
    .then(response => {if(!response.ok)throw new Error('Feed unavailable');return response.json();})
    .then(feed => {
      if(feed.schemaVersion!==1 || !feed.updatedAt || !Array.isArray(feed.workouts) || !Array.isArray(feed.measurements))return;
      if(!Number.isFinite(Date.parse(feed.updatedAt)))return;
      if(!feed.workouts.every(w=>typeof w.title==='string'&&Number.isFinite(Date.parse(w.startTime))&&Number.isFinite(w.durationMinutes)&&Array.isArray(w.exercises)&&w.exercises.every(e=>typeof e.title==='string'&&Array.isArray(e.sets))))return;
      if(!feed.measurements.every(m=>/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&Number.isFinite(Date.parse(m.date))&&m.values&&typeof m.values==='object'))return;
      currentFeed = feed; renderFeed();
    })
    .catch(()=>{/* Keep the dated public workout if no connected feed is available. */});
})();

