// ── State ────────────────────────────────────────────
let fallCount = 0;
let lastRisk  = 20;
let startTime = Date.now();
const riskBuf = Array(24).fill(0);
const barBuf  = Array(10).fill(0);

// ── Line Chart ───────────────────────────────────────
const lineChart = new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: {
    labels: riskBuf.map((_, i) => i + 1),
    datasets: [{
      label: 'Risk',
      data: [...riskBuf],
      borderColor: '#378add',
      backgroundColor: 'rgba(55,138,221,0.07)',
      borderWidth: 2,
      pointRadius: 1.5,
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    animation: false, responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#334155', font: { size: 9 } }, grid: { color: 'rgba(30,58,95,0.4)' } },
      y: { min: 0, max: 100, ticks: { color: '#334155', font: { size: 9 } }, grid: { color: 'rgba(30,58,95,0.4)' } }
    }
  }
});

// ── Pie Chart ────────────────────────────────────────
const pieChart = new Chart(document.getElementById('pieChart'), {
  type: 'doughnut',
  data: {
    labels: ['Walking', 'Standing', 'Sitting', 'At risk'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: ['#378add', '#4ade80', '#a78bfa', '#f87171'],
      borderColor: '#0d1b2e',
      borderWidth: 2,
      hoverOffset: 5
    }]
  },
  options: {
    responsive: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#64748b', font: { size: 10 }, padding: 8, boxWidth: 10 }
      }
    }
  }
});

// ── Bar Chart ────────────────────────────────────────
const barChart = new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: barBuf.map((_, i) => 'T-' + (barBuf.length - i)),
    datasets: [{
      label: 'Risk',
      data: [...barBuf],
      backgroundColor: barBuf.map(v => v > 65 ? '#f87171' : v > 35 ? '#fbbf24' : '#4ade80'),
      borderRadius: 4,
      borderSkipped: false
    }]
  },
  options: {
    animation: false, responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#334155', font: { size: 9 } }, grid: { display: false } },
      y: { min: 0, max: 100, ticks: { color: '#334155', font: { size: 9 } }, grid: { color: 'rgba(30,58,95,0.4)' } }
    }
  }
});

// ── Helpers ───────────────────────────────────────────
function addAlert(msg, level) {
  const list = document.getElementById('alert-list');
  const time = new Date().toLocaleTimeString();
  const div  = document.createElement('div');
  div.className = `aitem ${level}`;
  div.innerHTML = `<strong>${msg}</strong><div class="at">${time}</div>`;
  list.prepend(div);
  if (list.children.length > 10) list.lastChild.remove();
}

function setBar(fillId, valId, pct, label) {
  document.getElementById(fillId).style.width = pct + '%';
  document.getElementById(valId).textContent  = label || pct + '%';
}

function resetFalls() {
  fallCount = 0;
  document.getElementById('c-falls').textContent = '0';
  addAlert('Falls counter reset by user', 'low');
}

// ── Main update loop ──────────────────────────────────
function update() {
  // Generate fake sensor values
  const risk  = Math.min(100, Math.max(0, Math.round(lastRisk + (Math.random() - 0.45) * 12)));
  lastRisk    = risk;
  const accel = (0.88 + Math.random() * 0.4).toFixed(2);
  const gyro  = (Math.random() * 9).toFixed(1);

  // Update stat cards
  document.getElementById('c-risk').textContent  = risk;
  document.getElementById('c-accel').textContent = accel + ' g';
  document.getElementById('c-gyro').textContent  = gyro  + ' °/s';

  // Uptime
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  document.getElementById('c-uptime').textContent =
    elapsed > 60 ? Math.floor(elapsed / 60) + 'm ' + (elapsed % 60) + 's' : elapsed + 's';

  // Clock
  document.getElementById('clock').textContent = new Date().toLocaleTimeString();

  // Risk trend arrow
  const tEl = document.getElementById('c-risk-trend');
  tEl.textContent = risk > lastRisk ? '▲ Rising' : risk < lastRisk ? '▼ Falling' : '— Stable';
  tEl.className   = 'trend ' + (risk > lastRisk ? 'up' : 'down');

  // Status pill + risk color
  const pill    = document.getElementById('status-pill');
  const riskEl  = document.getElementById('c-risk');
  if (risk < 30) {
    riskEl.className  = 'val vgreen';
    pill.className    = 'status-pill pill-ok';
    pill.textContent  = 'NORMAL';
  } else if (risk < 65) {
    riskEl.className  = 'val vamber';
    pill.className    = 'status-pill pill-warn';
    pill.textContent  = 'CAUTION';
    if (Math.random() < 0.12) addAlert('Unsteady movement detected', 'medium');
  } else {
    riskEl.className  = 'val vred';
    pill.className    = 'status-pill pill-danger';
    pill.textContent  = 'HIGH RISK';
    addAlert('High fall risk detected!', 'high');
    if (Math.random() < 0.04) {
      fallCount++;
      document.getElementById('c-falls').textContent = fallCount;
      addAlert('FALL DETECTED — check patient immediately!', 'high');
    }
  }

  // Update line chart
  riskBuf.shift(); riskBuf.push(risk);
  lineChart.data.datasets[0].data = [...riskBuf];
  lineChart.update('none');

  // Update bar chart
  barBuf.shift(); barBuf.push(risk);
  barChart.data.datasets[0].data            = [...barBuf];
  barChart.data.datasets[0].backgroundColor = barBuf.map(v =>
    v > 65 ? '#f87171' : v > 35 ? '#fbbf24' : '#4ade80'
  );
  barChart.update('none');

  // Update pie chart
  pieChart.data.datasets[0].data = [
    Math.max(5, Math.round(40 + (Math.random() - 0.5) * 10)),
    Math.max(5, Math.round(30 + (Math.random() - 0.5) * 8)),
    Math.max(5, Math.round(20 + (Math.random() - 0.5) * 8)),
    Math.max(2, Math.round(risk / 10))
  ];
  pieChart.update();

  // Update progress bars
  const bal  = Math.max(20, Math.min(99, Math.round(90 - risk * 0.5)));
  const gait = Math.max(20, Math.min(99, Math.round(70 - risk * 0.3)));
  const post = Math.max(20, Math.min(99, Math.round(80 - risk * 0.4)));
  const hr   = Math.round(65 + risk * 0.3 + Math.random() * 5);
  const step = Math.max(20, Math.min(99, Math.round(72 - risk * 0.25)));

  setBar('b-balance', 'bv-balance', bal);
  setBar('b-gait',    'bv-gait',    gait);
  setBar('b-posture', 'bv-posture', post);
  setBar('b-step',    'bv-step',    step);
  document.getElementById('b-hr').style.width      = (hr / 180 * 100) + '%';
  document.getElementById('bv-hr').textContent     = hr + ' bpm';
}

// Run immediately then every 1.4 seconds
update();
setInterval(update, 1400);