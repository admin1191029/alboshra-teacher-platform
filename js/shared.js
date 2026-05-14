/**
 * shared.js — أدوات مشتركة بين كل الصفحات
 * يُحمَّل بعد firebase.js
 */

// ═══════════════════════════════════════════════
// الحالة العامة (State)
// ═══════════════════════════════════════════════
window.APP = {
  uid:       null,
  user:      null,
  teacher:   { n1:'', n2:'', n3:'', photo:'' },
  activeClassId:   null,
  activeClassName: '',
  classes:   [],   // [{ id, name, subject, ... }]
  // بيانات الفصل الحالي (تُملأ عند تحميل كل صفحة)
  students:  [],
  attendance:{},
  evals:     {},
  behavior:  {},
  grades:    { columns:[], rows:{} },
  notes:     [],
  planner:   {},
  meetings:  [],
  goals:     [],
  resources: [],
  subjects:  [],
  seatLayout:[],
  changelog: [],
};

const A = window.APP;

// ═══════════════════════════════════════════════
// الاسم الكامل للمعلم
// ═══════════════════════════════════════════════
function fullName() {
  return [A.teacher.n3, A.teacher.n1, A.teacher.n2].filter(Boolean).join(' ')
    || A.user?.displayName
    || 'المعلم';
}
window.fullName = fullName;

// ═══════════════════════════════════════════════
// Toast notifications
// ═══════════════════════════════════════════════
function toast(msg, type = 'info', duration = 3000) {
  let wrap = document.getElementById('toastContainer');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastContainer';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, duration);
}
window.toast = toast;

// ═══════════════════════════════════════════════
// Modal helpers
// ═══════════════════════════════════════════════
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
window.openModal  = openModal;
window.closeModal = closeModal;

// Close modal when clicking overlay
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ═══════════════════════════════════════════════
// Topbar — تحديث بيانات المعلم
// ═══════════════════════════════════════════════
function updateTopbar() {
  const nameEl   = document.getElementById('tbName');
  const classEl  = document.getElementById('tbClass');
  const avatarEl = document.getElementById('tbAvatar');
  if (nameEl)  nameEl.textContent  = A.teacher.n1 || fullName();
  if (classEl) classEl.textContent = A.activeClassName || '—';
  if (avatarEl) {
    if (A.teacher.photo) {
      avatarEl.innerHTML = `<img src="${A.teacher.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    } else {
      avatarEl.textContent = (A.teacher.n1 || 'م').charAt(0);
    }
  }
}
window.updateTopbar = updateTopbar;

// ═══════════════════════════════════════════════
// Active nav link
// ═══════════════════════════════════════════════
function setActiveNav() {
  const page = window.PAGE_ID || '';
  document.querySelectorAll('.nav-btn, .bn-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}
window.setActiveNav = setActiveNav;

// ═══════════════════════════════════════════════
// تحميل بيانات الفصل من Firebase
// ═══════════════════════════════════════════════
async function loadClassData(sections = []) {
  const uid     = A.uid;
  const classId = A.activeClassId;
  if (!uid || !classId) return;

  await Promise.all(sections.map(async sec => {
    const val = await DB.loadSection(uid, classId, sec, getDefaultFor(sec));
    A[sec] = val;
  }));
}
window.loadClassData = loadClassData;

function getDefaultFor(sec) {
  const defaults = {
    students:  [],
    attendance:{},
    evals:     {},
    behavior:  {},
    grades:    { columns:[], rows:{} },
    notes:     [],
    planner:   {},
    meetings:  [],
    goals:     [],
    resources: [],
    subjects:  defaultSubjects(),
    seatLayout:[],
    changelog: [],
  };
  return defaults[sec] ?? null;
}

function defaultSubjects() {
  return [
    { id:'sub_arabic',  name:'اللغة العربية', icon:'📖' },
    { id:'sub_math',    name:'الرياضيات',      icon:'📐' },
    { id:'sub_science', name:'العلوم',          icon:'🔬' },
    { id:'sub_english', name:'اللغة الإنجليزية',icon:'🌍' },
    { id:'sub_islamic', name:'التربية الإسلامية',icon:'📗' },
    { id:'sub_social',  name:'الدراسات الاجتماعية',icon:'🗺️' },
  ];
}
window.defaultSubjects = defaultSubjects;

// ═══════════════════════════════════════════════
// حفظ قسم واحد
// ═══════════════════════════════════════════════
async function saveSection(section) {
  const uid     = A.uid;
  const classId = A.activeClassId;
  if (!uid || !classId) { toast('لم يتم تسجيل الدخول', 'error'); return false; }
  return DB.saveSection(uid, classId, section, A[section]);
}
window.saveSection = saveSection;

// ═══════════════════════════════════════════════
// انتظار تحميل Firebase (لأن module يتأخر)
// ═══════════════════════════════════════════════
function waitForDB(timeout = 8000) {
  return new Promise((resolve, reject) => {
    if (window.DB) { resolve(); return; }
    const start = Date.now();
    const check = setInterval(() => {
      if (window.DB) { clearInterval(check); resolve(); }
      else if (Date.now() - start > timeout) {
        clearInterval(check);
        reject(new Error('Firebase لم يتحمل — تحقق من الاتصال بالإنترنت'));
      }
    }, 50);
  });
}
window.waitForDB = waitForDB;

// ═══════════════════════════════════════════════
// init — يُستدعى في بداية كل صفحة
// ═══════════════════════════════════════════════
async function initApp(options = {}) {
  const { requireAuth = true, onReady, sections = [] } = options;

  // انتظر حتى يتحمل Firebase
  try {
    await waitForDB();
  } catch(e) {
    document.getElementById('mainContent').innerHTML = `
      <div class="empty-state" style="padding:60px 20px;">
        <div class="es-icon">⚠️</div>
        <div class="es-title">تعذّر الاتصال بـ Firebase</div>
        <div class="es-sub">${e.message}</div>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="location.reload()">🔄 إعادة المحاولة</button>
      </div>`;
    return null;
  }

  return new Promise((resolve) => {
    DB.onAuthChange(async (user) => {
      if (!user) {
        if (requireAuth) {
          window.location.href = '../index.html';
        }
        resolve(null);
        return;
      }

      A.uid  = user.uid;
      A.user = user;

      // تحميل profile المعلم
      const profile = await DB.loadProfile(user.uid);
      if (profile) {
        A.teacher.n1    = profile.n1    || '';
        A.teacher.n2    = profile.n2    || '';
        A.teacher.n3    = profile.n3    || '';
        A.teacher.photo = profile.photo || '';
      } else {
        // معلم جديد — احفظ بياناته من Google
        A.teacher.n1 = user.displayName?.split(' ')[0] || '';
        A.teacher.n2 = user.displayName?.split(' ').slice(1).join(' ') || '';
        await DB.saveProfile(user.uid, { n1: A.teacher.n1, n2: A.teacher.n2, n3: '', photo: user.photoURL || '', email: user.email });
      }

      // تحميل الفصول
      A.classes = await DB.loadClasses(user.uid);
      if (!A.classes.length) {
        // إنشاء فصل افتراضي
        const defaultId = 'class_default';
        await DB.saveClass(user.uid, defaultId, { name: 'فصلي الأول', subject: '', createdAt: new Date().toISOString() });
        A.classes = [{ id: defaultId, name: 'فصلي الأول', subject: '' }];
      }

      // الفصل النشط
      const savedClass = localStorage.getItem(`bs_active_class_${user.uid}`);
      const found = A.classes.find(c => c.id === savedClass);
      A.activeClassId   = found ? savedClass : A.classes[0].id;
      A.activeClassName = (found || A.classes[0]).name;

      // تحديث الواجهة
      updateTopbar();
      setActiveNav();

      // تحميل الأقسام المطلوبة
      if (sections.length) {
        await loadClassData(sections);
      }

      if (onReady) onReady(user);
      resolve(user);
    });
  });
}
window.initApp = initApp;

// ═══════════════════════════════════════════════
// تغيير الفصل
// ═══════════════════════════════════════════════
async function switchClass(classId) {
  const cls = A.classes.find(c => c.id === classId);
  if (!cls) return;
  A.activeClassId   = classId;
  A.activeClassName = cls.name;
  localStorage.setItem(`bs_active_class_${A.uid}`, classId);
  DB.clearCache(A.uid, classId);
  updateTopbar();
  // إعادة تحميل الصفحة لتحديث البيانات
  window.location.reload();
}
window.switchClass = switchClass;

// ═══════════════════════════════════════════════
// IDs فريدة
// ═══════════════════════════════════════════════
function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}
window.genId = genId;

// ═══════════════════════════════════════════════
// تنسيق التاريخ
// ═══════════════════════════════════════════════
function formatDate(d) {
  const date = d ? new Date(d) : new Date();
  return date.toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' });
}
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
window.formatDate = formatDate;
window.todayStr   = todayStr;

// ═══════════════════════════════════════════════
// HTML escape
// ═══════════════════════════════════════════════
function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
window.esc = esc;

// ═══════════════════════════════════════════════
// Confirm dialog
// ═══════════════════════════════════════════════
function confirm2(msg, onYes) {
  const id = 'confirmModal';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.className = 'modal-overlay';
    el.innerHTML = `
      <div class="modal-box" style="max-width:380px;">
        <div class="modal-body" style="text-align:center;padding:32px 24px;">
          <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
          <p id="confirmMsg" style="font-size:1rem;font-weight:700;color:var(--ink2);margin-bottom:24px;"></p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-danger" id="confirmYes">تأكيد</button>
            <button class="btn btn-ghost" onclick="closeModal('confirmModal')">إلغاء</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
  }
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmYes').onclick = () => { closeModal(id); onYes(); };
  openModal(id);
}
window.confirm2 = confirm2;

// ═══════════════════════════════════════════════
// Class manager modal
// ═══════════════════════════════════════════════
function openClassManager() {
  let el = document.getElementById('classManagerModal');
  if (!el) {
    el = document.createElement('div');
    el.id = 'classManagerModal';
    el.className = 'modal-overlay';
    el.innerHTML = `
      <div class="modal-box" style="max-width:460px;">
        <div class="modal-header">
          <h3>🏫 إدارة الفصول</h3>
          <button class="modal-close" onclick="closeModal('classManagerModal')">✕</button>
        </div>
        <div class="modal-body">
          <div id="classesList" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;"></div>
          <div class="fg">
            <label>اسم الفصل الجديد</label>
            <input type="text" id="newClassName" placeholder="مثال: الصف الأول أ — الرياضيات" />
          </div>
          <button class="btn btn-primary" style="width:100%;" onclick="createNewClass()">➕ إنشاء فصل</button>
        </div>
      </div>`;
    document.body.appendChild(el);
  }
  renderClassesList();
  openModal('classManagerModal');
}
window.openClassManager = openClassManager;

function renderClassesList() {
  const el = document.getElementById('classesList');
  if (!el) return;
  el.innerHTML = A.classes.map(c => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;
         background:${c.id===A.activeClassId?'rgba(21,101,192,0.12)':'var(--surface)'};
         border:1.5px solid ${c.id===A.activeClassId?'var(--sky)':'var(--border)'};
         border-radius:var(--r-sm);cursor:pointer;"
         onclick="switchClass('${c.id}')">
      <span style="font-size:1.2rem;">🏫</span>
      <div style="flex:1;">
        <div style="font-weight:800;color:${c.id===A.activeClassId?'var(--sky)':'var(--ink2)'};">${esc(c.name)}</div>
        ${c.subject ? `<div style="font-size:0.78rem;color:var(--muted);">${esc(c.subject)}</div>` : ''}
      </div>
      ${c.id===A.activeClassId ? '<span style="color:var(--sky);font-size:1.2rem;">✓</span>' : ''}
    </div>
  `).join('');
}
window.renderClassesList = renderClassesList;

async function createNewClass() {
  const name = document.getElementById('newClassName')?.value.trim();
  if (!name) { toast('أدخل اسم الفصل', 'warning'); return; }
  const id = genId('class');
  await DB.saveClass(A.uid, id, { name, subject:'', createdAt: new Date().toISOString() });
  A.classes.push({ id, name, subject:'' });
  document.getElementById('newClassName').value = '';
  renderClassesList();
  toast('تم إنشاء الفصل', 'success');
}
window.createNewClass = createNewClass;
