/**
 * shell.js — يرسم الـ Topbar والـ Sidebar في كل صفحة
 */

function buildShell() {
  const navSections = [
    {
      label: 'الرئيسية',
      items: [
        { id:'dashboard',  icon:'🏠',  label:'لوحة التحكم',           url:'dashboard.html' },
        { id:'overview',   icon:'📋',  label:'العرض الشامل',           url:'overview.html' },
        { id:'students',   icon:'👥',  label:'الطلاب',                  url:'students.html',   badge:'nb-students' },
        { id:'attendance', icon:'📅',  label:'الحضور اليومي',           url:'attendance.html' },
      ]
    },
    {
      label: 'التقارير والأدوات',
      items: [
        { id:'reports',    icon:'📊',  label:'التقارير',                url:'reports.html' },
        { id:'absence',    icon:'🚫',  label:'تقرير الغياب',            url:'absence.html',    badgeNew:true },
        { id:'analytics',  icon:'📈',  label:'تحليلات',                  url:'analytics.html' },
        { id:'gradebook',  icon:'📒',  label:'دفتر الدرجات',             url:'gradebook.html' },
        { id:'notes',      icon:'📝',  label:'الملاحظات',               url:'notes.html',      badge:'nb-notes' },
        { id:'resources',  icon:'☁️',  label:'مكتبة الموارد',            url:'resources.html' },
      ]
    },
    {
      label: 'أدوات الفصل',
      items: [
        { id:'lesson',     icon:'🖥️',  label:'وضع الحصة',               url:'lesson.html',     badgeLive:true },
        { id:'questions',  icon:'🎮',  label:'بنك الأسئلة',             url:'questions.html' },
        { id:'treasure',   icon:'🗺️',  label:'خريطة الكنز',             url:'treasure.html',   badgeNew:true },
        { id:'seatmap',    icon:'🪑',  label:'خريطة المقاعد',           url:'seatmap.html' },
        { id:'behavior',   icon:'⭐',  label:'تقييم السلوك',             url:'behavior.html' },
        { id:'goals',      icon:'🎯',  label:'الأهداف والخطط',          url:'goals.html',      badge:'nb-goals' },
        { id:'planner',    icon:'📅',  label:'المخطط الأسبوعي',         url:'planner.html' },
        { id:'meetings',   icon:'🤝',  label:'لقاءات الأولياء',         url:'meetings.html' },
        { id:'insights',   icon:'🤖',  label:'رؤى ذكية',                url:'insights.html' },
      ]
    },
    {
      label: 'الإعدادات والأدوات',
      items: [
        { id:'subjects',   icon:'📚',  label:'إدارة المواد والمهارات',  url:'subjects.html' },
        { id:'changelog',  icon:'📜',  label:'سجل التغييرات',            url:'changelog.html',  badge:'nb-changelog' },
        { id:'import',     icon:'🎓',  label:'استيراد Classroom',        url:'import.html' },
        { id:'photos',     icon:'📷',  label:'صور الطلاب',              url:'photos.html' },
        { id:'profile',    icon:'⚙️',  label:'الملف الشخصي',            url:'profile.html' },
        { id:'compare',    icon:'📊',  label:'مقارنة الفصول',           url:'compare.html' },
        { id:'about',      icon:'💙',  label:'حول التطبيق',             url:'about.html' },
        { id:'guide',      icon:'📖',  label:'دليل الاستخدام',          url:'guide.html' },
      ]
    }
  ];

  const cur = window.PAGE_ID || '';

  const navHTML = navSections.map(section => `
    <span class="nav-section-label">${section.label}</span>
    ${section.items.map(n => `
      <a class="nav-btn${n.id===cur?' active':''}" data-page="${n.id}" href="${n.url}">
        <span class="nav-icon">${n.icon}</span>
        ${n.label}
        ${n.badge     ? `<span class="nav-badge" id="${n.badge}" style="display:none;">0</span>` : ''}
        ${n.badgeLive ? `<span class="nav-badge live">LIVE</span>` : ''}
        ${n.badgeNew  ? `<span class="nav-badge new">جديد</span>` : ''}
      </a>
    `).join('')}
  `).join('');

  const mobileNav = [
    { id:'dashboard',  icon:'🏠',  label:'الرئيسية', url:'dashboard.html' },
    { id:'students',   icon:'👥',  label:'الطلاب',   url:'students.html' },
    { id:'lesson',     icon:'🖥️',  label:'الحصة',    url:'lesson.html' },
    { id:'attendance', icon:'📅',  label:'الحضور',   url:'attendance.html' },
    { id:'profile',    icon:'⚙️',  label:'ملفي',     url:'profile.html' },
  ].map(n => `
    <a class="bn-item${n.id===cur?' active':''}" data-page="${n.id}" href="${n.url}">
      <span class="bn-icon">${n.icon}</span>${n.label}
    </a>
  `).join('');

  const shell = document.getElementById('appShell');
  if (!shell) return;

  shell.innerHTML = `
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

    <nav class="sidebar">
      <div onclick="openClassManager()" class="class-selector" title="انقر لتغيير الفصل">
        <div class="cs-label">الفصل الحالي</div>
        <div class="cs-name" id="sidebarClass">—</div>
      </div>
      ${navHTML}
      <div class="sidebar-quick">
        <button class="sb-qbtn" onclick="window.location='lesson.html'">🖥️ حصة</button>
        <button class="sb-qbtn" onclick="window.location='students.html'">➕ طالب</button>
        <button class="sb-qbtn" onclick="DB.signOutUser().then(()=>window.location='../index.html')">🚪 خروج</button>
      </div>
    </nav>

    <nav class="bottom-nav">${mobileNav}</nav>
  `;

  const origUpdate = window.updateTopbar;
  window.updateTopbar = function() {
    if (origUpdate) origUpdate();
    const sc = document.getElementById('sidebarClass');
    if (sc) sc.textContent = APP.activeClassName || '—';
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildShell);
} else {
  buildShell();
}
