(() => {
  'use strict';
  // Only public referral settings belong here. Never add a Hevy API key.
  fetch('/data/training-config.json', { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error('Settings unavailable'); return response.json(); })
    .then(settings => {
      if (typeof settings.hevyReferralUrl !== 'string' || !settings.hevyReferralUrl.trim()) return;
      const url = new URL(settings.hevyReferralUrl);
      if (url.protocol !== 'https:' || url.username || url.password) return;
      const link = document.getElementById('hevy-referral-link');
      if (!link) return;
      link.href = url.href;
      link.hidden = false;
      document.getElementById('hevy-referral-pending').hidden = true;
      document.getElementById('referral-status').textContent = 'Use my link to get started with Hevy in the mobile app.';
      document.getElementById('referral-disclosure').hidden = false;
    })
    .catch(() => { /* Keep the honest coming-soon state and working profile links. */ });
})();
(() => {
  'use strict';
  const metricInfo = {
    weight_kg: ['Body weight', 'kg'], lean_mass_kg: ['Lean mass', 'kg'], fat_percent: ['Body fat', '%'],
    neck_cm: ['Neck', 'cm'], shoulder_cm: ['Shoulders', 'cm'], chest_cm: ['Chest', 'cm'],
    left_bicep_cm: ['Left bicep', 'cm'], right_bicep_cm: ['Right bicep', 'cm'],
    left_forearm_cm: ['Left forearm', 'cm'], right_forearm_cm: ['Right forearm', 'cm'],
    abdomen: ['Abdomen', 'cm'], waist: ['Waist', 'cm'], hips: ['Hips', 'cm'],
    left_thigh: ['Left thigh', 'cm'], right_thigh: ['Right thigh', 'cm'],
    left_calf: ['Left calf', 'cm'], right_calf: ['Right calf', 'cm']
  };
  const number = value => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value);
  const date = value => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
  const node = (tag, text, className) => { const element = document.createElement(tag); if (text !== undefined) element.textContent = text; if (className) element.className = className; return element; };
  const profileLink = () => { const a = node('a', 'Open my training on Hevy ↗', 'training-text-link'); a.href = 'https://hevy.com/user/thomalex'; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
  function stat(label, value) { const div = node('div'); div.append(node('dt', label), node('dd', value)); return div; }
  function exercises(workout) {
    const details = node('details', undefined, 'workout-exercises');
    const summary = node('summary', 'Inside this session'); const mark = node('span', '＋'); mark.setAttribute('aria-hidden', 'true'); summary.append(mark); details.append(summary);
    const ul = node('ul');
    for (const exercise of workout.exercises) {
      const li = node('li'); const text = node('span', exercise.title);
      const setText = exercise.sets.map(set => {
        const parts = [];
        if (Number.isFinite(set.weightKg)) parts.push(`${number(set.weightKg)} kg`);
        if (Number.isFinite(set.reps)) parts.push(`${number(set.reps)} reps`);
        if (Number.isFinite(set.distanceMeters)) parts.push(`${number(set.distanceMeters)} m`);
        if (Number.isFinite(set.durationSeconds)) parts.push(`${number(set.durationSeconds)} sec`);
        return `${set.type === 'warmup' ? 'Warm-up: ' : ''}${parts.join(' × ') || 'Set logged'}`;
      }).join(' · ');
      text.append(node('small', setText, 'session-set-detail'));
      li.append(text, node('span', `${exercise.sets.length} sets`)); ul.append(li);
    }
    details.append(ul, node('p', 'Sets are shown as logged in Hevy, including warm-ups.')); return details;
  }
  function renderWorkouts(feed) {
    const holder = document.getElementById('featured-workout');
    holder.replaceChildren();
    if (!feed.workouts.length) { holder.append(node('h3', 'The next session starts here.'), node('p', 'No workouts in the connected log yet.', 'workout-description'), profileLink()); holder.removeAttribute('aria-labelledby'); return; }
    const latest = feed.workouts[0];
    const top = node('div', undefined, 'workout-top'); top.append(node('span', 'LATEST SESSION / HEVY', 'training-index'));
    const time = node('time', date(latest.startTime)); time.dateTime = latest.startTime; top.append(time);
    const title = node('h3', latest.title); title.id = 'workout-title';
    const metrics = node('dl', undefined, 'workout-metrics');
    metrics.append(stat('DURATION', `${number(latest.durationMinutes)} min`), stat('EXERCISES', String(latest.exercises.length)), stat('LOGGED SETS', String(latest.exercises.reduce((count, e) => count + e.sets.length, 0))));
    holder.append(top, title, metrics, exercises(latest), profileLink(), node('p', 'From my connected Hevy training log.', 'workout-source'));
    const history = document.getElementById('workout-history'); const list = document.getElementById('workout-history-list'); const more = document.getElementById('load-workouts');
    list.replaceChildren(); history.hidden = feed.workouts.length < 2;
    let shown = 1;
    function showMore() {
      const end = Math.min(shown + 6, feed.workouts.length);
      for (; shown < end; shown++) {
        const workout = feed.workouts[shown]; const item = node('details', undefined, 'history-session'); const summary = node('summary'); const label = node('span');
        const when = node('time', date(workout.startTime)); when.dateTime = workout.startTime; label.append(when, node('strong', workout.title));
        summary.append(label, node('small', `${number(workout.durationMinutes)} min · ${workout.exercises.length} ${workout.exercises.length === 1 ? 'exercise' : 'exercises'}`));
        const body = node('div'); body.append(exercises(workout)); item.append(summary, body); list.append(item);
      }
      more.hidden = shown >= feed.workouts.length;
    }
    more.onclick = showMore; showMore();
  }
  function renderMeasurements(measurements) {
    const available = Object.keys(metricInfo).filter(key => measurements.some(m => Number.isFinite(m.values[key])));
    if (!available.length) return;
    const select = document.getElementById('measurement-metric');
    for (const key of available) { const option = node('option', metricInfo[key][0]); option.value = key; select.append(option); }
    document.getElementById('measurements-empty').hidden = true; document.getElementById('measurement-dashboard').hidden = false;
    function renderMetric() {
      const key = select.value; const [label, unit] = metricInfo[key];
      const readings = measurements.filter(m => Number.isFinite(m.values[key])).map(m => ({ date: m.date, value: m.values[key] })).sort((a,b) => a.date.localeCompare(b.date));
      const first = readings[0], last = readings[readings.length - 1], change = last.value-first.value;
      const summary = document.getElementById('measurement-summary'); summary.replaceChildren();
      for (const [title, value, detail] of [['LATEST', `${number(last.value)} ${unit}`, date(last.date)], ['FIRST LOGGED', `${number(first.value)} ${unit}`, date(first.date)], ['CHANGE', `${change > 0 ? '+' : ''}${number(change)} ${unit}`, `${readings.length} recorded readings`]]) { const s = stat(title,value); s.querySelector('dd').append(node('small', detail)); summary.append(s); }
      const chart = document.getElementById('measurement-chart'); chart.replaceChildren();
      const svgNode = (tag, attrs, text) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for(const [name,value] of Object.entries(attrs)) n.setAttribute(name,String(value)); if(text!==undefined)n.textContent=text; return n; };
      const svg = svgNode('svg', {viewBox:'0 0 700 220', role:'img', 'aria-labelledby':'progress-chart-title progress-chart-description'});
      svg.append(svgNode('title',{id:'progress-chart-title'},`${label} over time`),svgNode('desc',{id:'progress-chart-description'},`${readings.length} readings. From ${number(first.value)} ${unit} on ${date(first.date)} to ${number(last.value)} ${unit} on ${date(last.date)}. Full values are available in the measurement history below.`));
      const minimum = Math.min(...readings.map(r=>r.value)), maximum = Math.max(...readings.map(r=>r.value));
      const pad = Math.max((maximum-minimum)*.12,.5), low=minimum-pad, high=maximum+pad;
      const start=Date.parse(first.date), finish=Date.parse(last.date);
      const points = readings.map(r=>({x:finish===start?350:20+(Date.parse(r.date)-start)/(finish-start)*660,y:200-(r.value-low)/(high-low)*180,entry:r}));
      for(const y of [20,110,200])svg.append(svgNode('line',{x1:20,x2:680,y1:y,y2:y,class:'chart-grid'}));
      if(points.length>1)svg.append(svgNode('polyline',{points:points.map(p=>`${p.x},${p.y}`).join(' '),class:'chart-line'}));
      for(const point of points) { const dot=svgNode('circle',{cx:point.x,cy:point.y,r:4,class:'chart-point'});dot.append(svgNode('title',{},`${date(point.entry.date)}: ${number(point.entry.value)} ${unit}`));svg.append(dot); }
      const caption=node('div',undefined,'chart-caption');caption.append(node('span',date(first.date)),node('span',date(last.date)));
      chart.append(svg,caption,node('p',`Recorded range: ${number(minimum)}–${number(maximum)} ${unit}.`,'chart-range'));
      const table = document.getElementById('measurement-table'); table.replaceChildren();
      document.getElementById('measurement-table-caption').textContent=`${label} (${unit})`;
      for(const reading of readings.slice().reverse()){ const row=node('tr');row.append(node('td',date(reading.date)),node('td',`${number(reading.value)} ${unit}`));table.append(row);}
    }
    select.onchange = renderMetric; renderMetric();
  }
  fetch('/data/hevy-feed.json', { cache:'no-store' })
    .then(response => {if(!response.ok)throw new Error('Feed unavailable');return response.json();})
    .then(feed => {
      if(feed.schemaVersion!==1 || !feed.updatedAt || !Array.isArray(feed.workouts) || !Array.isArray(feed.measurements))return;
      if(!Number.isFinite(Date.parse(feed.updatedAt)))return;
      if(!feed.workouts.every(w=>typeof w.title==='string'&&Number.isFinite(Date.parse(w.startTime))&&Number.isFinite(w.durationMinutes)&&Array.isArray(w.exercises)&&w.exercises.every(e=>typeof e.title==='string'&&Array.isArray(e.sets))))return;
      if(!feed.measurements.every(m=>/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&Number.isFinite(Date.parse(m.date))&&m.values&&typeof m.values==='object'))return;
      renderWorkouts(feed);renderMeasurements(feed.measurements);
      const status=document.getElementById('hevy-log-status');status.replaceChildren(node('span','CONNECTED TRAINING LOG','training-index'),node('p',`Updated ${date(feed.updatedAt)}. Workouts and measurements are checked automatically about every 30 minutes.`));
    })
    .catch(()=>{/* Keep the dated public workout if no connected feed is available. */});
})();

