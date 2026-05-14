/**
 * shell.js — يرسم الـ Topbar والـ Sidebar في كل صفحة
 * يُحمَّل بعد shared.js
 * يتوقع وجود عنصر id="appShell"
 */

function buildShell() {
  const nav = [
    { id:'dashboard',  icon:'🏠',  label:'لوحة التحكم',      url:'dashboard.html' },
    { id:'students',   icon:'👥',  label:'الطلاب',             url:'students.html',  badge:'nb-students' },
    { id:'attendance', icon:'📋',  label:'الحضور اليومي',      url:'attendance.html' },
    { id:'gradebook',  icon:'📒',  label:'دفتر الدرجات',        url:'gradebook.html' },
    { id:'behavior',   icon:'⭐',  label:'تقييم السلوك',        url:'behavior.html' },
    { id:'reports',    icon:'📊',  label:'التقارير',             url:'reports.html' },
    { id:'notes',      icon:'📝',  label:'الملاحظات',           url:'notes.html',     badge:'nb-notes' },
    { id:'goals',      icon:'🎯',  label:'الأهداف والخطط',      url:'goals.html',     badge:'nb-goals' },
    { id:'planner',    icon:'📅',  label:'المخطط الأسبوعي',     url:'planner.html' },
    { id:'meetings',   icon:'🤝',  label:'لقاءات الأولياء',     url:'meetings.html' },
    { id:'resources',  icon:'☁️',  label:'مكتبة الموارد',       url:'resources.html' },
    { id:'insights',   icon:'🤖',  label:'رؤى ذكية',            url:'insights.html' },
    { id:'seatmap',    icon:'🪑',  label:'خريطة المقاعد',       url:'seatmap.html' },
    { id:'profile',    icon:'⚙️',  label:'الملف الشخصي',        url:'profile.html' },
  ];

  const cur = window.PAGE_ID || '';

  const navHTML = nav.map(n => `
    <a class="nav-btn${n.id===cur?' active':''}" data-page="${n.id}" href="${n.url}">
      <span class="nav-icon">${n.icon}</span>
      ${n.label}
      ${n.badge ? `<span class="nav-badge" id="${n.badge}" style="display:none;">0</span>` : ''}
    </a>
  `).join('');

  const mobileNav = [
    { id:'dashboard',  icon:'🏠', label:'الرئيسية', url:'dashboard.html' },
    { id:'students',   icon:'👥', label:'الطلاب',   url:'students.html' },
    { id:'attendance', icon:'📋', label:'الحضور',   url:'attendance.html' },
    { id:'reports',    icon:'📊', label:'التقارير', url:'reports.html' },
    { id:'profile',    icon:'⚙️', label:'ملفي',     url:'profile.html' },
  ].map(n => `
    <a class="bn-item${n.id===cur?' active':''}" data-page="${n.id}" href="${n.url}">
      <span class="bn-icon">${n.icon}</span>${n.label}
    </a>
  `).join('');

  const shell = document.getElementById('appShell');
  if (!shell) return;

  shell.innerHTML = `
    <!-- Topbar -->
    <header class="topbar">
      <button class="btn btn-ghost btn-sm" style="padding:6px 10px;" onclick="openClassManager()" title="تغيير الفصل">🏫</button>
      <div class="topbar-logo">مدارس <span>البشرى</span></div>
      <div class="topbar-spacer"></div>
      <div class="tb-user" onclick="window.location='profile.html'">
        <div class="tb-avatar" id="tbAvatar">م</div>
        <div>
          <div class="tb-name" id="tbName">...</div>
          <div class="tb-class" id="tbClass">—</div>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <nav class="sidebar">
      <div onclick="openClassManager()" class="class-selector" title="انقر لتغيير الفصل">
        <div class="cs-label">الفصل الحالي</div>
        <div class="cs-name" id="sidebarClass">—</div>
      </div>
      <span class="nav-section-label">القائمة الرئيسية</span>
      ${navHTML}
      <div class="sidebar-quick">
        <button class="sb-qbtn" onclick="window.location='students.html'">➕ طالب</button>
        <button class="sb-qbtn" onclick="window.location='reports.html'">📄 تقارير</button>
        <button class="sb-qbtn" onclick="DB.signOutUser().then(()=>window.location='../index.html')">🚪 خروج</button>
      </div>
    </nav>

    <!-- Bottom nav (mobile) -->
    <nav class="bottom-nav">${mobileNav}</nav>
  `;

  // sync class name in sidebar
  const origUpdate = window.updateTopbar;
  window.updateTopbar = function() {
    if (origUpdate) origUpdate();
    const sc = document.getElementById('sidebarClass');
    if (sc) sc.textContent = APP.activeClassName || '—';
  };
}

// استدعاء بعد تحميل DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildShell);
} else {
  buildShell();
}
