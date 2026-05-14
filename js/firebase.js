/**
 * firebase.js — طبقة Firebase الموحّدة
 *
 * هيكل Firestore:
 *   teachers/{uid}/profile          → بيانات المعلم
 *   teachers/{uid}/classes          → (collection) كل فصل
 *   teachers/{uid}/classes/{classId}/data  → بيانات الفصل
 *
 * كيف تستخدمه في أي صفحة:
 *   <script type="module" src="../js/firebase.js"></script>
 *   ثم استخدم window.DB.*
 */

import { initializeApp }                      from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider,
         signInWithPopup, signOut,
         onAuthStateChanged }                 from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc,
         collection, getDocs, deleteDoc,
         onSnapshot, serverTimestamp }        from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ═══════════════════════════════════════════════
// 🔧 إعدادات Firebase
// ═══════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "AIzaSyBRoDBs5cH1Ud2k8LYTAT7g40JqyhHpZ4Q",
  authDomain:        "el-bushra-school-admin.firebaseapp.com",
  projectId:         "el-bushra-school-admin",
  storageBucket:     "el-bushra-school-admin.firebasestorage.app",
  messagingSenderId: "1073893646584",
  appId:             "1:1073893646584:web:b8c3cd998d2314791a1b0d"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ═══════════════════════════════════════════════
// 🗄️  طبقة البيانات — مفاتيح لكل معلم
// ═══════════════════════════════════════════════

// كاش في الذاكرة لتقليل القراءات من Firestore
const _cache = {};

/**
 * path للـ document الخاص بالمعلم الحالي
 * teachers/{uid}/classes/{classId}/data
 */
function classDocRef(uid, classId) {
  return doc(db, 'teachers', uid, 'classes', classId, 'meta', 'data');
}

function profileDocRef(uid) {
  return doc(db, 'teachers', uid, 'profile', 'info');
}

function classesColRef(uid) {
  return collection(db, 'teachers', uid, 'classes');
}

// ── حفظ ──────────────────────────────────────
async function saveSection(uid, classId, section, value) {
  const key = `${uid}:${classId}:${section}`;
  _cache[key] = value;
  try {
    const ref = doc(db, 'teachers', uid, 'classes', classId, 'sections', section);
    await setDoc(ref, { value: JSON.stringify(value), updatedAt: serverTimestamp() });
    return true;
  } catch(e) {
    console.error('[DB] saveSection error:', section, e);
    return false;
  }
}

// ── قراءة ─────────────────────────────────────
async function loadSection(uid, classId, section, fallback = null) {
  const key = `${uid}:${classId}:${section}`;
  if (_cache[key] !== undefined) return _cache[key];
  try {
    const ref  = doc(db, 'teachers', uid, 'classes', classId, 'sections', section);
    const snap = await getDoc(ref);
    const val  = snap.exists() ? JSON.parse(snap.data().value) : fallback;
    _cache[key] = val;
    return val;
  } catch(e) {
    console.error('[DB] loadSection error:', section, e);
    return fallback;
  }
}

// ── حفظ profile المعلم ──────────────────────
async function saveProfile(uid, profileData) {
  try {
    await setDoc(profileDocRef(uid), { ...profileData, updatedAt: serverTimestamp() }, { merge: true });
    _cache[`${uid}:profile`] = profileData;
    return true;
  } catch(e) {
    console.error('[DB] saveProfile error:', e);
    return false;
  }
}

// ── قراءة profile المعلم ─────────────────────
async function loadProfile(uid) {
  const key = `${uid}:profile`;
  if (_cache[key]) return _cache[key];
  try {
    const snap = await getDoc(profileDocRef(uid));
    const val  = snap.exists() ? snap.data() : null;
    _cache[key] = val;
    return val;
  } catch(e) {
    console.error('[DB] loadProfile error:', e);
    return null;
  }
}

// ── قائمة الفصول ──────────────────────────────
async function loadClasses(uid) {
  try {
    const snap = await getDocs(classesColRef(uid));
    const classes = [];
    snap.forEach(d => classes.push({ id: d.id, ...d.data() }));
    return classes;
  } catch(e) {
    console.error('[DB] loadClasses error:', e);
    return [];
  }
}

// ── إنشاء/تحديث فصل ─────────────────────────
async function saveClass(uid, classId, classInfo) {
  try {
    await setDoc(doc(db, 'teachers', uid, 'classes', classId), {
      ...classInfo,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch(e) {
    console.error('[DB] saveClass error:', e);
    return false;
  }
}

// ── حذف فصل ──────────────────────────────────
async function deleteClass(uid, classId) {
  try {
    await deleteDoc(doc(db, 'teachers', uid, 'classes', classId));
    Object.keys(_cache).forEach(k => {
      if (k.startsWith(`${uid}:${classId}:`)) delete _cache[k];
    });
    return true;
  } catch(e) {
    console.error('[DB] deleteClass error:', e);
    return false;
  }
}

// ── مسح الكاش لفصل معين ──────────────────────
function clearCache(uid, classId) {
  Object.keys(_cache).forEach(k => {
    if (!classId || k.startsWith(`${uid}:${classId}:`)) delete _cache[k];
  });
}

// ═══════════════════════════════════════════════
// 🔐 Auth helpers
// ═══════════════════════════════════════════════

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch(e) {
    console.error('[Auth] Google sign-in error:', e);
    throw e;
  }
}

async function signOutUser() {
  clearCache(auth.currentUser?.uid);
  await signOut(auth);
}

function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

function currentUser() {
  return auth.currentUser;
}

// ═══════════════════════════════════════════════
// 📦 Export to window (يتيح استخدامه من أي صفحة)
// ═══════════════════════════════════════════════
window.DB = {
  // Data
  saveSection,
  loadSection,
  saveProfile,
  loadProfile,
  loadClasses,
  saveClass,
  deleteClass,
  clearCache,
  // Auth
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  currentUser,
  // Firestore instance (للاستخدام المتقدم)
  db,
  auth
};

export {
  saveSection, loadSection,
  saveProfile, loadProfile,
  loadClasses, saveClass, deleteClass, clearCache,
  signInWithGoogle, signOutUser, onAuthChange, currentUser,
  db, auth
};
