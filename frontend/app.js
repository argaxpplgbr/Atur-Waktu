const form = document.querySelector('#study-form');
const button = document.querySelector('#recommend');
const errorBox = document.querySelector('#error');
const startButton = document.querySelector('#start');
const clock = document.querySelector('#clock');
const subjectDisplay = document.querySelector('#subject-display');
const progress = document.querySelector('#progress');
const circumference = 2 * Math.PI * 104;
let duration = 25 * 60, remaining = duration, interval = null;
let hasRecommendation = false;

for (const name of ['energy', 'distraction']) {
  const slider = document.querySelector(`#${name}`);
  slider.addEventListener('input', () => document.querySelector(`#${name}-value`).value = slider.value);
}
form.elements.subject.addEventListener('input', () => subjectDisplay.textContent = form.elements.subject.value || 'Sesi belajar');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const payload = {
    availableMinutes: Number(values.get('availableMinutes')),
    energyLevel: Number(values.get('energyLevel')),
    distractionLevel: Number(values.get('distractionLevel'))
  };
  button.disabled = true; button.innerHTML = '<span>✧</span> Meminta rekomendasi…'; errorBox.hidden = true;
  try {
    const response = await fetch('http://localhost:5000/api/study/recommend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.title || 'Permintaan gagal.');
    stopTimer(); duration = data.focusMinutes * 60; remaining = duration; updateClock();
    hasRecommendation = true; document.querySelector('#phase').textContent = 'SESI FOKUS';
    subjectDisplay.textContent = form.elements.subject.value || 'Sesi belajar';
    document.querySelector('#recommendation').innerHTML = `<span class="spark">✦</span><p><b>Sesi fokus ${data.focusMinutes} menit · istirahat ${data.breakMinutes} menit</b><small>${escapeHtml(data.note)} · ${escapeHtml(data.model)}</small></p>`;
    startButton.disabled = false; startButton.innerHTML = 'Mulai fokus <span>▶</span>';
  } catch (err) {
    errorBox.textContent = `${err.message} Pastikan Python dan C# sedang berjalan.`; errorBox.hidden = false;
  } finally { button.disabled = false; button.innerHTML = '<span>✧</span> Buat sesi fokus <b>↗</b>'; }
});

startButton.addEventListener('click', () => {
  if (interval) { stopTimer(); startButton.innerHTML = 'Lanjutkan <span>▶</span>'; return; }
  startButton.innerHTML = 'Jeda sesi <span>Ⅱ</span>';
  interval = setInterval(() => {
    remaining = Math.max(0, remaining - 1); updateClock();
    if (remaining === 0) {
      stopTimer(); startButton.disabled = true; startButton.textContent = 'Sesi selesai';
      document.querySelector('#phase').textContent = 'WAKTUNYA ISTIRAHAT';
      document.querySelector('#recommendation').innerHTML = '<span class="spark">✦</span><p><b>Sesi fokus selesai!</b><small>Ambil jeda sejenak sebelum sesi berikutnya.</small></p>';
    }
  }, 1000);
});
document.querySelector('#reset').addEventListener('click', () => {
  stopTimer(); remaining = duration; updateClock(); startButton.disabled = !hasRecommendation;
  startButton.innerHTML = 'Mulai fokus <span>▶</span>'; document.querySelector('#phase').textContent = 'SESI FOKUS';
});
function stopTimer() { if (interval) clearInterval(interval); interval = null; }
function updateClock() {
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  clock.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  progress.style.strokeDasharray = circumference;
  progress.style.strokeDashoffset = circumference * (1 - remaining / duration);
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
