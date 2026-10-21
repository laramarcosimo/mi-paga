// Mi paga: lógica y pantallas de la app (antes dentro de index.html).
// Los cálculos de dinero están al principio: inc() paga y extras, exp() gastado, spend() gasto neto por categoría,
// saved() ahorro total, bal() saldo de cada cuenta, pend() pendiente de devolver.
const EC = ["Comida", "Comida fuera de casa", "Salidas y ocio", "Gasolina", "Regalos", "Otros"], P = ["#1f6f5c", "#d98a2b", "#b5514a", "#4a78b5", "#8a6bb0", "#8b8f8c"], CU = ["EUR", "USD", "GBP", "CHF", "MXN", "ARS", "COP", "CLP", "PEN", "BRL", "CAD", "AUD", "JPY", "CNY", "MAD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "THB", "AED"], TABS = { vis: "Vista", res: "Mes", sem: "Semana", dia: "Día", inf: "Devolver", biz: "Bizum", ano: "Año", cue: "Cuentas", inv: "Inversiones", pre: "Ajustes" }, AC = ["Tarjeta de crédito", "Cuenta de ahorro", "Efectivo"], CC = ["#4a78b5", "#1f6f5c", "#d98a2b"], IC = { vis: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2"/>', inv: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>', dia: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15.5" r="2.2"/>', sem: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 15h4"/>', res: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', ano: '<path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/>', inf: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>', biz: '<path d="M4 8h14l-4-4"/><path d="M20 16H6l4 4"/>', cue: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 11h20M6 16h4"/>', pre: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>' };
let S = { cur: "EUR", paga: 0, meta: 0, tx: [], bud: {}, acc: {}, tr: [], since: "", pacc: "", lac: "", rec: [], rskip: [], rem: true, lb: "", bz: [], sbu: "", sbk: "", apd: [], ui: null }, tab = "res", mo = ((d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 7))(new Date()), q = { what: "", ac: defAc(), k: "g", w: "p", rc: "Comida", c: "Comida", a: "", d: "", n: "" }, pt = "res";
// Repositorio: único punto de acceso al almacenamiento del dispositivo
const Store = { key: "fin1", load() {
  try {
    const r = localStorage.getItem(this.key);
    return r ? JSON.parse(r) : null;
  } catch (e) {
    return null;
  }
}, write(d) {
  try {
    localStorage.setItem(this.key, JSON.stringify(d));
    return true;
  } catch (e) {
    return false;
  }
} };
{
  const d = Store.load();
  if (d && typeof d == "object") S = Object.assign(S, d);
}
const save = () => {
  if (!Store.write(S)) toast("No se ha podido guardar en este dispositivo");
  cloud();
};
function sanitize() {
  const ren = (o, n, kind) => {
    if (kind == "c") {
      S.tx.forEach((t) => {
        if (t.c == o) t.c = n;
      });
      (S.rec || []).forEach((r) => {
        if (r.c == o) r.c = n;
      });
      (S.bz || []).forEach((x) => {
        if (x.cat == o) x.cat = n;
      });
      (S.subs || []).forEach((x) => {
        if (x.c == o) x.c = n;
      });
      if (S.bud && S.bud[o] != null) {
        S.bud[n] = S.bud[o];
        delete S.bud[o];
      }
    } else if (kind == "a") {
      const sw = (x) => x == o ? n : x;
      S.tx.forEach((t) => {
        t.ac = sw(t.ac);
        if (t.dac) t.dac = sw(t.dac);
      });
      (S.bz || []).forEach((x) => x.ac = sw(x.ac));
      (S.rec || []).forEach((x) => x.ac = sw(x.ac));
      (S.tr || []).forEach((x) => {
        x.f = sw(x.f);
        x.t = sw(x.t);
      });
      if (S.acc && S.acc[o] != null) {
        S.acc[n] = S.acc[o];
        delete S.acc[o];
      }
      S.pacc = sw(S.pacc);
      S.sacc = sw(S.sacc);
      S.dac = sw(S.dac);
    }
  };
  (S.cats || []).forEach((x) => {
    const n = clean(x.n) || "Otros";
    if (n != x.n) {
      ren(x.n, n, "c");
      x.n = n;
    }
  });
  (S.accs || []).forEach((x) => {
    const n = clean(x.n) || "Cuenta";
    if (n != x.n) {
      ren(x.n, n, "a");
      x.n = n;
    }
  });
  S.cont = (S.cont || []).map(clean).filter(Boolean);
  (S.bz || []).forEach((x) => {
    x.p = clean(x.p);
  });
  S.contF = (S.contF || []).map(clean);
  S.contH = (S.contH || []).map(clean);
  (S.rec || []).forEach((r) => {
    r.n = clean(r.n);
  });
  (S.inv || []).forEach((x) => {
    x.n = clean(x.n);
  });
  if (S.sbu && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(S.sbu)) S.sbu = "";
}
function mig() {
  sanitize();
  const m = { "Comidas fuera de casa": "Comida fuera de casa" };
  S.tx.forEach((t) => {
    if (m[t.c]) t.c = m[t.c];
    if (t.r && t.c == "Otras cosas") t.c = "Otros";
  });
  (S.rec || []).forEach((r) => {
    if (m[r.c]) r.c = m[r.c];
  });
  for (const k in m) if (S.bud && S.bud[k] != null) {
    S.bud[m[k]] = S.bud[k];
    delete S.bud[k];
  }
  if (!S.dvm) {
    S.tx.forEach((t) => {
      if (t.r && !t.dv && t.d.slice(0, 7) < cm()) {
        const x = new Date(t.d.slice(0, 7) + "-01T12:00");
        x.setMonth(x.getMonth() + 1);
        t.dv = ymd(x);
        t.dac = S.pacc || "";
      }
    });
    S.dvm = 1;
  }
}
const f0 = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: S.cur, currencyDisplay: "narrowSymbol" }).format(n || 0).replace("-", "−"), f = (n) => {
  const b = f0(n), c = typeof f2 == "function" ? f2(n) : "";
  return c ? b + " (" + c + ")" : b;
};
const rnd = (x) => Math.round(x * 100) / 100, sum = (a, fn) => rnd(a.reduce((s, x) => s + fn(x), 0)), $ = (id) => document.getElementById(id), today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
}, uid = () => Math.random().toString(36).slice(2);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Nombres que el usuario escribe (categorías, cuentas, contactos…): sin caracteres que puedan romper el HTML o el código
const clean = (s) => String(s == null ? "" : s).replace(/[<>"'`\\]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
const CATS = EC.concat("Bizum"), bzX = () => (S.bz || []).filter((x) => x.t != "deb").map((x) => x.t == "env" ? { id: "bz_" + x.id, bz: x.id, ot: x.cat == "Otros" ? x.ot || "" : "", src: x.src, k: "g", a: x.a, c: x.cat ? EC.includes(x.cat) ? x.cat : "Otros" : "Bizum", ac: x.ac, d: x.d, r: false, what: "Bizum a " + x.p + (x.c ? " · " + x.c : ""), n: "" } : x.dev || x.g ? { id: "bz_" + x.id, bz: x.id, pd: !!x.dd, ot: x.cat == "Otros" ? x.ot || "" : "", src: x.src, k: "d", lk: !!(x.g || x.rr), a: x.a, c: x.cat && EC.includes(x.cat) ? x.cat : "Bizum", ac: x.ac, d: x.d, r: false, what: "Te devolvió " + x.p + (x.c ? " · " + x.c : ""), n: "Te devolvió " + x.p + (x.c ? " · " + x.c : "") } : { id: "bz_" + x.id, bz: x.id, ot: x.cat == "Otros" ? x.ot || "" : "", src: x.src, k: "i", a: x.a, c: "Bizum", ac: x.ac, d: x.d, r: false, what: "", n: "Bizum de " + x.p + (x.c ? " · " + x.c : "") }), ALL0 = () => {
  const lk = {};
  (S.bz || []).forEach((x) => {
    if ((x.t == "rec" || x.t == "deb") && x.g) lk[x.g] = (lk[x.g] || 0) + x.a;
  });
  return S.tx.map((t) => t.sh != null ? Object.assign({}, t, { a: t.sh, full: t.a }) : lk[t.id] && t.k == "g" && !t.r ? Object.assign({}, t, { a: rnd(Math.max(0, t.a - lk[t.id])), full: t.a }) : t).concat(bzX()).filter((t) => !sepMode() || (t.src || "p") == UI().view);
};
const ext = (m) => rnd(sum(ALL().filter((t) => t.k == "i" && t.d.startsWith(m)), (t) => t.a) + spM(m).x + sum(ALL().filter((t) => t.k == "g" && t.r && t.dv && t.dv.startsWith(m)), (t) => t.a)), inc = (m) => {
  if (m < first()) return 0;
  const u = UI(), sal = u.both ? S.sal || 0 : 0;
  return u.both && !u.uni ? u.view == "s" ? sal + ext(m) + pxt(m) : (S.paga || 0) + ext(m) : (S.paga || 0) + sal + ext(m) + pxt(m);
}, exp = (m) => spM(m).g;
const gm = () => ALL().filter((t) => t.k == "g" && t.d.startsWith(mo)), rl = () => S.tx.filter((t) => t.r && t.d.startsWith(mo)), rlOld = () => S.tx.filter((t) => t.r && !t.dv && t.d.slice(0, 7) < mo), pend = () => sum(rl().filter((t) => !t.dv).concat(rlOld()), (t) => t.a), rs = (c) => sum(rl().filter((t) => t.c == c), (t) => t.a), cm = () => today().slice(0, 7), isPend = (m) => m >= cm(), first = () => /^\d{4}-\d{2}/.test(S.ini || S.since || "") ? (S.ini || S.since).slice(0, 7) : ALL().filter((t) => !(t.k == "g" && t.r)).map((t) => t.d.slice(0, 7)).concat(cm()).sort()[0], act = (m) => m >= first() && m <= cm(), col = (c) => c == "Bizum" ? "#12a1a8" : P[EC.indexOf(EC.includes(c) ? c : "Otros")], pmo = () => {
  const x = new Date(mo + "-01T12:00");
  x.setMonth(x.getMonth() - 1);
  return x.toISOString().slice(0, 7);
}, yms = () => [...Array(12)].map((_, i) => yr + "-" + String(i + 1).padStart(2, "0"));
mig();
if (!S.since) {
  S.since = today();
  try {
    localStorage.setItem("fin1", JSON.stringify(S));
  } catch (e) {
  }
}
{
  const st = UI().start;
  tab = pt = tabOk(st) && st != "pre" ? st : firstTab();
}
let yr = (new Date()).getFullYear();
// Gastado de un periodo: gastos por categoría menos lo que te devuelven de esa categoría. Lo devuelto que supera lo gastado
// en esa categoría (o sin categoría) cuenta como dinero extra. Así el gráfico suma siempre lo mismo que «Gastado».
function spend(l) {
  const o = {};
  l.filter((t) => t.k == "g").forEach((t) => {
    const c = CATS.includes(t.c) ? t.c : "Otros";
    o[c] = (o[c] || 0) + t.a;
  });
  let x = 0;
  l.filter((t) => t.k == "d" && !t.lk).forEach((t) => {
    const u = Math.min(o[t.c] || 0, t.a);
    if (u) o[t.c] -= u;
    if (!t.pd) x += t.a - u;
  });
  Object.keys(o).forEach((k) => {
    o[k] = rnd(o[k]);
    if (!(o[k] > 0)) delete o[k];
  });
  return { c: o, g: rnd(sum(Object.values(o), (v) => v)), x: rnd(x) };
}
const spM = (m) => spend(ALL().filter((t) => t.d.startsWith(m)));
function cat(m) {
  return spM(m).c;
}
function ny(d) {
  yr += d;
  R();
}
function by(key) {
  const o = {};
  ALL().filter((t) => t.k == "g" && t.d.startsWith(mo)).forEach((t) => {
    const c = t[key] || (key == "ac" ? "Sin cuenta" : "Otros");
    o[c] = rnd((o[c] || 0) + t.a);
  });
  return o;
}
function nm(d) {
  const x = new Date(mo + "-01T12:00");
  x.setMonth(x.getMonth() + d);
  mo = x.toISOString().slice(0, 7);
  sd = null;
  pSel = null;
  R();
}
function go(t) {
  if (t == "vis") t = lastV();
  if (tab == "pre" && t != "pre") {
    accO.clear();
    recE = null;
  }
  tab = t;
  R();
  scrollTo(0, 0);
}
function saved() {
  const cur = today().slice(0, 7), ms = [first()];
  let t = 0, x = new Date(ms[0] + "-01T12:00");
  while (x.toISOString().slice(0, 7) <= cur) {
    const m = x.toISOString().slice(0, 7);
    t += inc(m) - exp(m);
    x.setMonth(x.getMonth() + 1);
  }
  return t;
}
function pieLbl(t) {
  t = String(t);
  const w = t.split(" ");
  let a = t, b = "";
  if (t.length > 14 && w.length > 1) {
    let i = 1;
    while (i < w.length && w.slice(0, i + 1).join(" ").length <= Math.ceil(t.length / 2) + 2) i++;
    a = w.slice(0, i).join(" ");
    b = w.slice(i).join(" ");
  }
  const fs = Math.min(7, 62 / Math.max(a.length, b.length, 1) * 1.6);
  return b ? `<text x="60" y="${49 - fs * 0.2}" text-anchor="middle" font-size="${fs}" fill="var(--mut)">${esc(a)}</text><text x="60" y="${54.5 - fs * 0.1}" text-anchor="middle" font-size="${fs}" fill="var(--mut)">${esc(b)}</text>` : `<text x="60" y="52" text-anchor="middle" font-size="${fs}" fill="var(--mut)">${esc(a)}</text>`;
}
let pSel = null;
function pk(c) {
  pSel = pSel == c ? null : c;
  R();
}
function pie(d, lab) {
  d = d.filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const tot = sum(d, (x) => x[1]);
  if (!tot) return '<p class="mut">Aún no hay gastos.</p>';
  const Rr = 48, C = 2 * Math.PI * Rr, gap = d.length > 1 ? 1.2 : 0, sel = d.find((x) => x[0] == pSel);
  let o = 0;
  const segs = d.map((x) => {
    const l = x[1] / tot * C, len = Math.max(0.5, l - gap), s = `<circle r="${Rr}" cx="60" cy="60" fill="none" stroke="${col(x[0])}" stroke-width="${sel && sel[0] == x[0] ? 14 : 11}" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)" opacity="${sel && sel[0] != x[0] ? 0.3 : 1}" data-c="${esc(x[0])}" onclick="pk(this.dataset.c)" style="cursor:pointer"><title>${esc(x[0])}: ${f(x[1])}</title></circle>`;
    o += l;
    return s;
  }).join(""), ct = sel ? [sel[0], f0(sel[1]), Math.round(sel[1] / tot * 100) + "% del total" + (f2(sel[1]) ? " · " + f2(sel[1]) : "")] : [lab, f0(tot), f2(tot) || d.length + (d.length == 1 ? " categoría" : " categorías")];
  return `<div style="display:flex;justify-content:center"><svg viewBox="0 0 120 120" width="330" style="max-width:100%" role="img" aria-label="Gastos por categoría">${segs}${pieLbl(ct[0])}<text x="60" y="65" text-anchor="middle" font-size="12" font-weight="700" fill="var(--tx)">${ct[1]}</text><text x="60" y="75" text-anchor="middle" font-size="6" fill="var(--mut)">${ct[2]}</text></svg></div>
<p class="mut hint" style="text-align:center;font-size:13px;margin-top:6px">Toca un color para ver su categoría.</p>`;
}
function donut(d) {
  const tot = sum(d, (x) => x[1]);
  if (!tot) return '<p class="mut">Aún no hay gastos este mes.</p>';
  const C = 2 * Math.PI * 40;
  let o = 0;
  const a = d.map((x, i) => {
    const l = x[1] / tot * C, s = `<circle r="40" cx="60" cy="60" fill="none" stroke="${col(x[0])}" stroke-width="18" stroke-dasharray="${l} ${C - l}" stroke-dashoffset="${-o}" transform="rotate(-90 60 60)"/>`;
    o += l;
    return s;
  }).join("");
  return `<svg viewBox="0 0 120 120" width="140" role="img" aria-label="Gastos por categoría">${a}</svg><div class="lg">${d.map((x, i) => `<span style="--c:${col(x[0])}">${esc(x[0])} ${Math.round(x[1] / tot * 100)}%</span>`).join("")}</div>`;
}
function sbars() {
  const ms = yms(), cs = ms.map(cat), rm = ms.map((m) => sum(S.tx.filter((t) => t.r && t.d.startsWith(m)), (t) => t.a)), tot = cs.map((o) => sum(Object.values(o), (x) => x)), mx = Math.max(1, S.paga || 0, ...tot, ...rm);
  return `<svg viewBox="0 0 300 125" width="100%" role="img" aria-label="Gasto por mes">${ms.map((m, i) => {
    let y = 100;
    const X = i * 25 + 4;
    return CATS.map((c) => {
      const h = (cs[i][c] || 0) / mx * 90;
      y -= h;
      return h ? `<rect x="${X}" y="${y}" width="12" height="${h}" fill="${col(c)}"/>` : "";
    }).join("") + (rm[i] ? `<rect x="${X + 13}" y="${100 - rm[i] / mx * 90}" width="8" height="${rm[i] / mx * 90}" fill="var(--rem)"/>` : "") + `<text x="${X + 10}" y="114" font-size="9" text-anchor="middle" fill="var(--mut)">${"EFMAMJJASOND"[i]}</text>`;
  }).join("")}${S.paga ? `<line x1="0" x2="300" y1="${100 - S.paga / mx * 90}" y2="${100 - S.paga / mx * 90}" stroke="var(--amb)" stroke-dasharray="4 3"/>` : ""}</svg><div class="lg">${CATS.map((c) => `<span style="--c:${col(c)}">${c}</span>`).join("")}<span style="--c:var(--rem)">Te lo devuelven</span>${S.paga ? '<span style="--c:var(--amb)">' + W("Tu sueldo", "Tu paga") + "</span>" : ""}</div>`;
}
function sline() {
  const ms = yms();
  let a = 0;
  const pts = ms.map((m) => act(m) ? a += inc(m) - exp(m) : null), v = pts.filter((x) => x !== null);
  if (!v.length) return '<p class="mut">Aún no hay meses este año.</p>';
  const mn = Math.min(0, ...v), mx = Math.max(1, ...v), sy = (x) => 100 - (x - mn) / (mx - mn) * 90, d = pts.map((x, i) => x === null ? null : `${i * 25 + 12},${sy(x)}`).filter(Boolean).join(" ");
  return `<svg viewBox="0 0 300 115" width="100%" role="img" aria-label="Ahorro acumulado"><line x1="0" x2="300" y1="${sy(0)}" y2="${sy(0)}" stroke="var(--line)"/><polyline points="${d}" fill="none" stroke="var(--grn)" stroke-width="3" stroke-linejoin="round"/>${pts.map((x, i) => x === null ? "" : `<circle cx="${i * 25 + 12}" cy="${sy(x)}" r="3.5" fill="var(--grn)"/>`).join("")}</svg><div class="k">Llevas ${f(v[v.length - 1])} ahorrados este año</div>`;
}
function daily() {
  const [y, n] = mo.split("-").map(Number), dim = new Date(y, n, 0).getDate(), cur = mo == cm() ? (new Date()).getDate() : mo < cm() ? dim : 0, d = Array(dim).fill(0);
  for (let i = 0; i < dim; i++) d[i] = dSpent(mo + "-" + String(i + 1).padStart(2, "0"));
  const rdv = Array(dim).fill(0);
  rl().forEach((t) => {
    rdv[+t.d.slice(8, 10) - 1] += t.a;
  });
  let a = 0;
  const cu = d.map((x) => a += x), top = Math.max(1, S.paga || 0, ...cu, ...rdv), sx = (i) => 6 + i / (dim - 1 || 1) * 288, sy = (v) => 100 - v / top * 90;
  return `<svg viewBox="0 0 300 115" width="100%" role="img" aria-label="Gasto acumulado del mes">${S.paga ? `<line x1="0" x2="300" y1="${sy(S.paga)}" y2="${sy(S.paga)}" stroke="var(--amb)" stroke-dasharray="4 3"/>` : ""}${d.map((x, i) => x > 0 ? `<rect x="${sx(i) - 2}" y="${sy(x)}" width="4" height="${100 - sy(x)}" fill="var(--acc)" opacity=".3"/>` : "").join("")}${rdv.map((x, i) => x ? `<rect x="${sx(i) + 2}" y="${sy(x)}" width="4" height="${100 - sy(x)}" fill="var(--rem)" opacity=".75"/>` : "").join("")}<polyline points="${cu.slice(0, cur).map((v, i) => `${sx(i)},${sy(v)}`).join(" ")}" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linejoin="round"/>${d.map((x, i) => {
    const ds = mo + "-" + String(i + 1).padStart(2, "0");
    return (sd == ds ? `<line x1="${sx(i)}" x2="${sx(i)}" y1="8" y2="100" stroke="var(--tx)" stroke-width="1.5" stroke-dasharray="3 2"/><text x="${Math.min(290, Math.max(10, sx(i)))}" y="112" font-size="9" text-anchor="middle" fill="var(--tx)">${i + 1}</text>` : "") + `<rect x="${sx(i) - 150 / dim}" y="0" width="${300 / dim}" height="115" fill="transparent" style="cursor:pointer" onclick="pickD('${ds}')"><title>Día ${i + 1}</title></rect>`;
  }).join("")}</svg><div class="lg"><span style="--c:var(--acc)">Lo que llevas gastado</span><span style="--c:var(--rem)">De eso, te lo devuelven</span><span style="--c:var(--amb)">${W("Tu sueldo", "Tu paga")}</span></div>`;
}
function vAno() {
  const ms = yms(), ac = ms.filter(act), g = sum(ms, exp), rv = sum(S.tx.filter((t) => t.r && t.d.startsWith(yr + "-")), (t) => t.a), sv = sum(ac, (m) => inc(m) - exp(m)), c = {};
  ms.forEach((m) => {
    const o = cat(m);
    for (const k in o) c[k] = (c[k] || 0) + o[k];
  });
  const mm = ms.filter((m) => exp(m) > 0).sort((a, b) => exp(b) - exp(a)), nn = (m) => (new Date(m + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" });
  return `<div class="grid"><div class="card"><div class="k">${W("Gastado de tu sueldo", "Gastado de tu paga")}</div><div class="v neg">${f(g)}</div></div><div class="card"><div class="k">Ahorrado</div><div class="v ${sv < 0 ? "neg" : "pos"}">${f(sv)}</div></div><div class="card"><div class="k">Media al mes</div><div class="v">${f(ac.length ? sum(ac, exp) / ac.length : 0)}</div></div><div class="card"><div class="k">Pagado por tus padres</div><div class="v">${f(rv)}</div></div></div>
<div class="card"><h2>Gasto mes a mes</h2>${sbars()}${mm.length ? `<div class="tip">Más caro: ${nn(mm[0])} (${f(exp(mm[0]))}). Más barato: ${nn(mm[mm.length - 1])} (${f(exp(mm[mm.length - 1]))}).</div>` : ""}</div>
<div class="card"><h2>Ahorro acumulado</h2>${sline()}</div>
<div class="card"><h2>En qué gastas al año</h2>${pie(Object.entries(c), "Gastado en el año")}</div>`;
}
function alerts() {
  const s = cat(mo);
  return Object.keys(S.bud).filter((c) => S.bud[c] > 0 && (s[c] || 0) >= S.bud[c] * 0.8).map((c) => {
    const o = s[c] > S.bud[c];
    return `<div class="al ${o ? "r" : ""}"><strong>${esc(c)}</strong>: ${o ? "te has pasado por " + f(s[c] - S.bud[c]) : "llevas el " + Math.round(s[c] / S.bud[c] * 100) + "% de tu límite"}</div>`;
  }).join("");
}
function vRes() {
  const i = inc(mo), g = exp(mo), left = i - g, now = new Date(), isNow = mo == cm(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), dl2 = dim - now.getDate() + 1, pm = by("ac"), mx = Math.max(1, ...Object.values(pm)), p = i > 0 ? Math.min(1, g / i) : 0, C = 2 * Math.PI * 50, cl = g > i ? "var(--red)" : p > 0.8 ? "var(--amb)" : "var(--acc)", cu = cat(mo), pv = cat(pmo()), cx = Math.max(1, ...Object.values(cu)), tr = Math.max(1, pend()), top = gm().sort((a, b) => b.a - a.a).slice(0, 3), ideal = (S.paga || 0) * now.getDate() / dim;
  return `${nag()}${mHero(mo)}${stats(ALL().filter((t) => t.k == "i" && !t.bz && t.d.startsWith(mo)), mo + "-01", mo + "-31", pend())}${UI().pie ? `<div class="card"><h2>Gastos por categoría</h2>${pie(Object.entries(cu), "Gastado")}</div>` : ""}
${alerts() ? `<div class="card"><h2>Alertas</h2>${alerts()}</div>` : ""}
<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px"><button class="x" onclick="nm(-1)" aria-label="Mes anterior">${ic("left", 20)}</button><h2 style="margin:0;text-align:center">Gasto día a día<small class="mut" style="display:block;font-size:13px;font-weight:400;margin-top:2px">${(new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</small></h2><button class="x" onclick="nm(1)" aria-label="Mes siguiente">${ic("right", 20)}</button></div>${daily()}<p class="mut hint" style="font-size:13px;margin-top:4px">Toca un día del gráfico para ver sus gastos.</p></div>${sd && sd.startsWith(mo) ? dayDetail(sd, 1) : ""}
<div class="card"><h2>En qué gastas</h2>${UI().pie ? "" : donut(Object.entries(cu))}<div style="margin-top:12px">${CATS.filter((c) => cu[c] || pv[c]).map((c) => {
    const v = cu[c] || 0, d = v - (pv[c] || 0);
    return `<div class="m"><span>${c}<small class="mut" style="display:block">${pv[c] ? (d >= 0 ? "▲ " : "▼ ") + f(Math.abs(d)) : "nuevo"}</small></span><div class="bar"><i style="width:${v / cx * 100}%;background:${col(c)}"></i></div><span>${f(v)}</span></div>`;
  }).join("")}<div class="tip hint">Las flechas comparan con el mes anterior.</div></div></div>
${top.length ? `<div class="card"><h2>Tus 3 gastos más grandes</h2>${top.map((t) => `<div class="li"><div class="g">${esc(t.c)}${t.ot ? " · " + esc(t.ot) : ""}${t.what ? " · " + esc(t.what) : ""}<small>${t.d}${t.n ? " · " + esc(t.n) : ""}</small></div><strong class="neg">${f(t.a)}</strong></div>`).join("")}</div>` : ""}
${rl().some((t) => !t.dv) || rlOld().length ? `<div class="card"><h2>Pendiente de que te lo devuelvan</h2><div class="bar" style="height:14px;display:flex">${repD().gr.map((g2) => `<i style="width:${g2.a / tr * 100}%;background:${col(g2.c)}"></i>`).join("")}</div><div class="lg">${repD().gr.map((g2) => `<span style="--c:${col(g2.c)}">${g2.c} ${f(g2.a)}</span>`).join("")}</div><div class="k" style="margin-top:6px">Total ${f(pend())}.<span class="hint"> Se cierra solo cada mes, igual que ${W("el sueldo", "la paga")}.</span></div><button class="pdfl" onclick="pdfRep()">${ic("download", 14)} PDF de gastos a devolver</button></div>` : ""}
<div class="card"><div class="k">Ahorrado en total</div><div class="v ${saved() < 0 ? "neg" : "pos"}">${f(saved())}</div>
${S.meta ? `<div class="bar" style="margin-top:8px"><i style="width:${Math.max(0, Math.min(100, left / S.meta * 100))}%;background:var(--grn)"></i></div><div class="k">Meta de este mes: ${f(S.meta)} (${left >= S.meta ? "¡conseguida!" : "te faltan " + f(S.meta - left)})</div>` : ""}</div>
<div class="card"><h2>Movimientos del mes</h2>${mvList(S.tx.filter((t) => t.d.startsWith(mo)))}</div>
<div class="card"><h2>Gasto por cuenta</h2>${AC.concat(Object.keys(pm).filter((k) => !AC.includes(k) && pm[k])).map((k) => `<div class="m"><span>${AC.includes(k) ? k : k == "Sin cuenta" ? "Sin cuenta (todavía no pagado)" : k}</span><div class="bar"><i style="width:${(pm[k] || 0) / mx * 100}%;background:var(--acc)"></i></div><span>${f(pm[k] || 0)}</span></div>`).join("")}${Math.abs(rnd(g - sum(Object.values(pm), (v) => v))) > 0.004 ? `<div class="m"><span>Devoluciones recibidas</span><div class="bar"></div><span>${f(rnd(g - sum(Object.values(pm), (v) => v)))}</span></div>` : ""}</div>
<button class="b" onclick="pdfAsk()">PDF de gastos del mes</button>`;
}
function bal(a) {
  const s = S.since;
  let b = S.acc[a] || 0;
  if (!s) return b;
  S.tx.forEach((t) => {
    if (t.r && t.dv && !t.dbz && t.dac == a && t.dv >= s) b += t.a;
    if (t.d < s || !t.ac) return;
    if (t.ac == a) b += t.k == "i" ? t.a : -t.a;
  });
  (S.bz || []).forEach((x) => {
    if (x.t != "deb" && x.ac == a && x.d >= s) b += x.t == "rec" ? x.a : -x.a;
    if (x.ac == a && !x.g && !x.rr) {
      if (x.t == "deb" && x.d >= s) b -= x.a;
      if (x.t == "rec" && x.dd && x.dd >= s) b -= x.a;
    }
  });
  (S.ow || []).forEach((x) => (x.pays || []).forEach((y) => {
    if (y.ac == a && y.d >= s) b -= y.v;
  }));
  S.tr.forEach((x) => {
    if (x.d < s) return;
    if (x.f == a) b -= x.a;
    if (x.t == a) b += x.a;
  });
  if (S.pacc == a) b += payIn(s);
  if (UI().both && S.sacc == a) b += payIn(s, S.sal || 0, 1);
  return rnd(b);
}
function pxt(m) {
  return (UI().work || UI().both) && S.pext && (S.pextm || [6, 12]).includes(+m.slice(5, 7)) ? S.pext : 0;
}
function payIn(s, amt, sal) {
  if (amt === void 0) amt = S.paga || 0;
  const isSal = sal || UI().work, day = isSal ? S.pday || 1 : S.pdayP || 1;
  let t = 0;
  const x = new Date(s.slice(0, 7) + "-01T12:00"), td = today();
  for (; ; ) {
    const m = ymd(x).slice(0, 7);
    if (m > td.slice(0, 7)) break;
    const dim = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(), pd = m + "-" + String(Math.min(day, dim)).padStart(2, "0");
    if (pd > s && pd <= td) t += amt + (isSal ? pxt(m) : 0);
    x.setMonth(x.getMonth() + 1);
  }
  return t;
}
function tgPx(m) {
  const a = (S.pextm || [6, 12]).slice(), i = a.indexOf(m);
  i < 0 ? a.push(m) : a.splice(i, 1);
  S.pextm = a;
  save();
  R();
}
function setBal(a, v) {
  const c = bal(a);
  S.acc[a] = (S.acc[a] || 0) + (parseFloat(v) || 0) - c;
  if (!S.since) S.since = today();
  save();
  R();
}
function xfer() {
  const a = parseFloat($("xa").value), o = $("xf").value, e = $("xt").value;
  if (!(a > 0) || o == e) {
    $("xa").focus();
    return;
  }
  if (!S.since) S.since = today();
  S.tr.push({ id: Math.random().toString(36).slice(2), f: o, t: e, a, d: $("xd").value || today() });
  save();
  R();
}
let ca = "Tarjeta de crédito";
const cAc = () => AC.includes(ca) ? ca : AC[0];
function movs(a) {
  const s = S.since || "", l = [];
  S.tx.forEach((t) => {
    if (t.ac == a && t.d >= s) l.push({ d: t.d, n: t.k == "i" ? "Dinero extra" + (t.n ? " · " + t.n : "") : (t.r ? "Me lo devuelven · " : "") + t.c + (t.ot ? " · " + t.ot : "") + (t.what ? " · " + t.what : t.n ? " · " + t.n : ""), v: t.k == "i" ? t.a : -t.a });
    if (t.r && t.dv && !t.dbz && t.dac == a && t.dv >= s) l.push({ d: t.dv, n: "Te devolvieron · " + (t.what || t.c), v: t.a });
  });
  (S.bz || []).forEach((x) => {
    if (x.t != "deb" && x.ac == a && x.d >= s) l.push({ d: x.d, n: (x.t == "env" ? "Bizum a " : "Bizum de ") + x.p + (x.c ? " · " + x.c : ""), v: x.t == "rec" ? x.a : -x.a });
    if (x.ac == a && !x.g && !x.rr) {
      if (x.t == "deb" && x.d >= s) l.push({ d: x.d, n: "Prestado a " + x.p + (x.c ? " · " + x.c : ""), v: -x.a });
      if (x.t == "rec" && x.dd && x.dd >= s) l.push({ d: x.dd, n: "Prestado a " + x.p + (x.c ? " · " + x.c : ""), v: -x.a });
    }
  });
  (S.ow || []).forEach((x) => (x.pays || []).forEach((y) => {
    if (y.ac == a && y.d >= s) l.push({ d: y.d, n: "Pago a " + x.p + " · Debo" + (x.c ? " · " + x.c : ""), v: -y.v });
  }));
  S.tr.forEach((x) => {
    if (x.d < s) return;
    if (x.f == a) l.push({ d: x.d, n: "Transferencia a " + x.t, v: -x.a });
    if (x.t == a) l.push({ d: x.d, n: "Transferencia desde " + x.f, v: x.a });
  });
  return l.sort((p, q2) => q2.d.localeCompare(p.d));
}
function delX(id) {
  preDel();
  S.tr = S.tr.filter((x) => x.id != id);
  save();
  R();
}
function owe(a) {
  return rnd(sum((S.ow || []).filter((x) => x.ac == a), owRem));
}
function owed(a) {
  return rnd(sum(S.tx.filter((t) => t.r && !t.dv && t.ac == a), (t) => t.a) + sum((S.bz || []).filter((x) => x.t == "deb" && x.ac == a), (x) => x.a));
}
function vCue() {
  const tot = sum(AC, bal), pos = Math.max(1, sum(AC, (a) => Math.max(0, bal(a))));
  return `<div class="card"><div class="k">Total en tus cuentas</div><div class="big ${tot < 0 ? "neg" : ""}">${f0(tot)}</div>${f2(tot) ? `<div class="mut" style="font-weight:600">≈ ${f2(tot)}</div>` : ""}${sum(AC, owed) || sum(AC, owe) ? `<div style="margin-top:8px;padding:10px 12px;border-radius:10px;background:var(--bg)">${sum(AC, owed) ? `<div class="k">Te deben <b style="color:#4a78b5">${f(sum(AC, owed))}</b> (Devolver + Bizum)</div>` : ""}${sum(AC, owe) ? `<div class="k">Debes <b style="color:var(--red)">${f(sum(AC, owe))}</b> (Bizum)</div>` : ""}<div style="font-weight:700;margin-top:2px">Podrías gastar ${f(tot + sum(AC, owed) - sum(AC, owe))} contando lo que te deben${sum(AC, owe) ? " y lo que debes" : ""}</div></div>` : ""}<div class="bar" style="height:12px;display:flex;margin-top:10px">${AC.map((a, i) => bal(a) > 0 ? `<i style="width:${bal(a) / pos * 100}%;background:${CC[i]}"></i>` : "").join("")}</div></div>
${Object.keys(S.acc || {}).length ? "" : '<div class="al hint">Escribe cuánto tienes ahora en cada cuenta. Desde ahí se actualiza solo con tus gastos, Bizums, devoluciones y transferencias.</div>'}
<div class="card"><h2>Saldos</h2>${AC.map((a, i) => `<div class="li"><span style="width:10px;height:10px;border-radius:50%;background:${CC[i]};flex:none"></span><div class="g">${a}${f2(bal(a)) ? `<small style="font-weight:600">${f2(bal(a))}</small>` : ""}<small>${owed(a) || owe(a) ? `<span style="color:#4a78b5;font-weight:700">${owed(a) ? "Te deben " + f(owed(a)) : ""}${owed(a) && owe(a) ? " · " : ""}${owe(a) ? "Debes " + f(owe(a)) : ""} · podrías gastar ${f(bal(a) + owed(a) - owe(a))}</span>` : '<span class="hint">Cámbialo para corregir el saldo</span>'}</small></div><input type="number" inputmode="decimal" step="0.01" value="${bal(a).toFixed(2)}" style="width:120px;text-align:right;${bal(a) < 0 ? "color:var(--red);font-weight:700" : ""}" onchange="setBal('${a}',this.value)"></div>`).join("")}<div style="display:flex;gap:8px;margin-top:10px"><input id="an2" placeholder="Añadir cuenta (ej. Revolut, hucha…)" style="flex:1;min-width:0" onkeydown="if(event.key=='Enter')accAdd('an2')"><button class="chip on" onclick="accAdd('an2')">Añadir</button></div><p class="mut hint" style="font-size:13px;margin-top:6px">Nombres y colores se cambian en Ajustes → Categorías y subcategorías.</p></div>
<details class="card acc mvd" ${mvOpen ? "open" : ""} ontoggle="mvOpen=this.open"><summary><span style="min-width:0"><h2>Movimientos</h2><span class="d">Gastos, Bizums, devoluciones y traspasos de cada cuenta</span></span></summary><div class="bd"><div class="chips" style="margin-bottom:8px">${AC.map((a) => `<button class="chip ${cAc() == a ? "on" : ""}" onclick="ca='${a}';R()">${a}</button>`).join("")}</div>${(() => {
    const l = movs(cAc());
    return l.length ? l.slice(0, 25).map((m) => `<div class="li"><div class="g">${esc(m.n)}<small>${fd(m.d)}</small></div><strong class="${m.v < 0 ? "neg" : "pos"}" style="text-align:right">${m.v < 0 ? "−" : "+"}${f0(Math.abs(m.v))}${f2(m.v) ? `<small style="display:block;font-weight:500;color:var(--mut);font-size:12px">${m.v < 0 ? "−" : "+"}${f2(Math.abs(m.v))}</small>` : ""}</strong></div>`).join("") + (l.length > 25 ? `<p class="mut" style="margin-top:6px">Se muestran los 25 últimos de ${l.length}.</p>` : "") : '<p class="mut">Todavía no hay movimientos en esta cuenta.</p>';
  })()}</div></details>
<div class="card"><h2>Pasar dinero entre cuentas</h2><div class="grid" style="margin-bottom:10px"><div><p class="lab">Desde</p><select id="xf" onchange="xfSync()">${AC.map((a) => `<option>${esc(a)}</option>`).join("")}</select></div><div><p class="lab">Hacia</p><select id="xt">${AC.slice(1).map((a) => `<option>${esc(a)}</option>`).join("")}</select></div><div><p class="lab">Importe<span class="req">*</span></p><input id="xa" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00"></div><div><p class="lab">Fecha</p><input id="xd" type="date" value="${today()}"></div></div><button class="b" onclick="xfer()">Transferir</button>
${S.tr.length ? `<div style="margin-top:12px">${S.tr.slice().sort((a, b) => b.d.localeCompare(a.d)).slice(0, 8).map((x) => `<div class="li"><div class="g">${x.f} → ${x.t}<small>${x.d}</small></div><strong>${f(x.a)}</strong><button class="x" onclick="delX('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`).join("")}</div>` : ""}</div>
<div class="card"><h2>${UI().both ? "¿Dónde te llega el dinero?" : W("¿Dónde cobras el sueldo?", "¿Dónde te llega la paga?")}</h2>${UI().both ? '<p class="lab">Paga</p>' : ""}<select onchange="S.pacc=this.value;save();R()"><option value="">En ninguna</option>${AC.map((a) => `<option ${S.pacc == a ? "selected" : ""}>${a}</option>`).join("")}</select>${UI().both ? `<p class="lab" style="margin-top:10px">Sueldo</p><select onchange="S.sacc=this.value;save();R()"><option value="">En ninguna</option>${AC.map((a) => `<option ${S.sacc == a ? "selected" : ""}>${a}</option>`).join("")}</select>` : ""}<div class="tip hint">${UI().both ? "La paga se suma el día " + (S.pdayP || 1) + " y el sueldo el día " + (S.pday || 1) + " de cada mes." : W("El sueldo se suma el día " + (S.pday || 1) + " de cada mes a esa cuenta.", "La paga se suma el día " + (S.pdayP || 1) + " de cada mes a esa cuenta.")} Lo que te devuelven se suma cuando lo marcas como devuelto en «Devolver».</div></div>
<div class="card"><h2>¿Dónde te llegan las devoluciones?</h2><select onchange="S.dac=this.value;save();R()">${AC.map((a) => `<option ${dAc() == a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select><div class="tip hint">Sale elegida en «Te lo devuelven en» al apuntar algo que te devuelven. Puedes cambiarla en cada gasto.</div></div>`;
}
function needW() {
  return false;
}
// Subcategoría opcional (informativa): se guarda en «what» y sale como «Categoría · Subcategoría»
function subF(cat2) {
  if (UI().sub === false) return cat2 == "Otros" ? `<p class="lab">¿Qué es?<span class="hint opt"> (opcional)</span></p><input id="qot" autocomplete="off" placeholder="Ej. peluquería" value="${esc(q.ot || "")}" oninput="otS('q',this.value)" style="margin-bottom:6px"><div id="otSq">${otSugH(q.ot, "q")}</div>` : "";
  const l = [...new Set(S.tx.filter((t) => t.what && t.c == cat2).sort((a, b) => b.d.localeCompare(a.d)).map((t) => t.what))].slice(0, 30);
  const sub = subBox("qwh", cat2, q.what);
  if (cat2 == "Otros") {
    const lo = [...new Set(S.tx.filter((t) => t.ot).map((t) => t.ot))].slice(0, 30);
    return `<div class="grid" style="margin-bottom:10px;align-items:end"><div><p class="lab">¿Qué es?<span class="hint opt"> (opcional)</span></p><input id="qot" list="otl" autocomplete="off" placeholder="Ej. peluquería" value="${esc(q.ot || "")}" oninput="otS('q',this.value)"><datalist id="otl">${lo.map((x) => `<option value="${esc(x)}">`).join("")}</datalist></div><div><p class="lab">Subcategoría<span class="hint opt"> (opcional)</span></p>${sub}</div></div><div id="otSq">${otSugH(q.ot, "q")}</div>`;
  }
  return `<p class="lab">Subcategoría<span class="hint opt"> (opcional)</span></p><div style="margin-bottom:10px">${sub}</div>`;
}
const hOn = () => !document.body.classList.contains("nohints");
// Categoría aprendida: si ya apuntaste ese comercio, usa la misma categoría
function learnC(m) {
  const n = String(m || "").trim().toLowerCase();
  if (!n) return "";
  const t = S.tx.filter((x) => x.k == "g" && (x.what || "").trim().toLowerCase() == n).sort((a, b) => b.d.localeCompare(a.d))[0];
  return t && EC.includes(t.c) ? t.c : "";
}
let bkLater = 0, colOpen = false;
function bkAuto() {
  return UI().autobk !== false && !!(S.sbu && S.sbk);
}
function bkDue() {
  if (bkLater || !(S.tx.length + (S.bz || []).length)) return false;
  if (bkAuto() && nbE && navigator.onLine) return "fail";
  const nb = nbGet();
  if (bkAuto() && nb && (Date.now() - new Date(nb)) / 864e5 < 3) return false;
  const d = new Date(), dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), lb2 = S.lb || "";
  if (lb2.slice(0, 7) == cm()) return false;
  return d.getDate() >= dim - 2 || !lb2 || (Date.now() - new Date(lb2)) / 864e5 > 35 ? "month" : false;
}
function bkBan(k) {
  const fail = k == "fail";
  return `<div class="apb" style="background:${fail ? "var(--red)" : "var(--amb)"};box-shadow:none;--apc:${fail ? "#8a2a25" : "#8a5a0a"}"><div class="t">${fail ? ic("alert", 18) + " La copia automática ha fallado" : ic("save", 18) + " Haz tu copia de seguridad del mes"}</div><div class="s">${fail ? esc(nbE) + " Haz una copia a mano para no perder tus datos." : (bkAuto() ? "La copia automática no se ha podido hacer." : UI().autobk === false ? "Tienes la copia en modo manual." : "No tienes activada la copia automática.") + " Guarda una copia para no perder tus datos."}</div>${S.sbu && S.sbk ? `<button onclick="nbNow()">${fail ? "Reintentar copia en Supabase" : "Hacer copia en Supabase"}</button><button class="sec" onclick="expB()">Guardar copia en Archivos</button>` : '<button onclick="expB()">Guardar copia ahora</button>'}<button class="sec" onclick="bkLater=1;R()">Más tarde</button></div>`;
}
function fxTxt() {
  if (!q.cur || q.cur == S.cur) return "Elige la moneda en la que has pagado.";
  const a = parseFloat(q.a), fx = parseFloat(q.fx), t = S.ratesT && S.ratesT[q.cur], st = q.fxMan ? 'Cambio puesto por ti · <a href="#" onclick="q.fxMan=false;fxGet(1);return false">usar el automático</a>' : q.fxLd ? "Buscando el cambio de hoy…" : q.fxErr ? "No he podido buscar el cambio: escríbelo tú." : t ? "Cambio automático · " + new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + ' · <a href="#" onclick="fxGet(1);return false">actualizar</a>' : "";
  return (fx > 0 ? a > 0 ? "≈ <b>" + f0(a * fx) + "</b> en tu moneda principal" : "Escribe el importe en " + q.cur : "Pon el cambio") + (st ? '<br><span style="font-size:12px">' + st + "</span>" : "");
}
function fxInfo() {
  const e = $("fxi");
  if (e) e.innerHTML = fxTxt();
}
async function fxGet(force) {
  const c = q.cur;
  if (!c || c == S.cur || q.fxMan) return;
  const t = S.ratesT && S.ratesT[c], put = (v) => {
    q.fx = String(v);
    const e = $("qfx");
    if (e) e.value = q.fx;
  };
  if (!force && t && Date.now() - t < 36e5 && S.rates && S.rates[c]) {
    put(S.rates[c]);
    fxInfo();
    return;
  }
  q.fxLd = 1;
  q.fxErr = 0;
  fxInfo();
  try {
    const r = await sbF("https://open.er-api.com/v6/latest/" + encodeURIComponent(S.cur)), j = await r.json(), v = j && j.rates && j.rates[c];
    if (!(v > 0)) throw 0;
    const fx = Math.round(1 / v * 1e4) / 1e4;
    S.rates = Object.assign({}, S.rates, { [c]: fx });
    S.ratesT = Object.assign({}, S.ratesT, { [c]: Date.now() });
    if (q.cur == c && !q.fxMan) put(fx);
  } catch (e) {
    q.fxErr = 1;
    if (!parseFloat(q.fx) && S.rates && S.rates[c]) put(S.rates[c]);
  }
  q.fxLd = 0;
  fxInfo();
}
function sym() {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: S.cur }).formatToParts(0).find((p) => p.type == "currency").value;
  } catch (e) {
    return S.cur;
  }
}
const CUN = { EUR: "Euro", USD: "Dólar estadounidense", GBP: "Libra esterlina", CHF: "Franco suizo", MXN: "Peso mexicano", ARS: "Peso argentino", COP: "Peso colombiano", CLP: "Peso chileno", PEN: "Sol peruano", BRL: "Real brasileño", CAD: "Dólar canadiense", AUD: "Dólar australiano", JPY: "Yen japonés", CNY: "Yuan chino", MAD: "Dírham marroquí", SEK: "Corona sueca", NOK: "Corona noruega", DKK: "Corona danesa", PLN: "Esloti polaco", CZK: "Corona checa", HUF: "Florín húngaro", TRY: "Lira turca", THB: "Baht tailandés", AED: "Dírham de Emiratos" }, CUK = { EUR: "europa españa", USD: "eeuu usa estados unidos americano dolar", GBP: "reino unido inglaterra uk londres", CHF: "suiza", MXN: "mexico", ARS: "argentina", COP: "colombia", CLP: "chile", PEN: "peru", BRL: "brasil", CAD: "canada", AUD: "australia", JPY: "japon", CNY: "china", MAD: "marruecos", SEK: "suecia", NOK: "noruega", DKK: "dinamarca", PLN: "polonia", CZK: "chequia republica checa", HUF: "hungria", TRY: "turquia", THB: "tailandia", AED: "emiratos dubai" };
const nrm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
function curLbl(c) {
  return c + " · " + (CUN[c] || c);
}
function curSrch(id, fn) {
  const e = $(id), box = $(id + "l");
  if (!e || !box) return;
  let v = nrm(e.value);
  if (v == nrm(curLbl(id == "cur1" ? S.cur : (S.c2 || {}).cur))) v = "";
  const w = v.replace(/(es|s)$/, ""), m = CU.filter((c) => !v || nrm(c).startsWith(v) || nrm(CUN[c]).includes(w) || nrm(CUK[c]).includes(w)).slice(0, 8);
  box.innerHTML = m.length ? m.map((c) => `<button class="chip" style="padding:7px 12px;font-size:14px" onmousedown="event.preventDefault()" onclick="${fn}('${c}')">${curLbl(c)}</button>`).join("") : '<p class="mut" style="font-size:14px">No encuentro esa moneda</p>';
}
function setCur(c) {
  if (c == S.cur) {
    R();
    return;
  }
  S.cur = c;
  if (S.c2) {
    if (S.c2.cur == c) S.c2.cur = c == "EUR" ? "USD" : "EUR";
    S.c2.rate = 0;
    S.c2.man = 0;
  }
  save();
  R();
  toast("Moneda principal: " + curLbl(c));
  if (S.c2) c2Get();
}
function tgC2(on) {
  S.c2 = on ? { cur: S.cur == "EUR" ? "GBP" : "EUR", rate: 0 } : null;
  save();
  R();
  if (on) c2Get();
}
function setCur2(c) {
  S.c2 = { cur: c, rate: 0 };
  save();
  R();
  c2Get();
}
async function c2Get() {
  if (!S.c2 || S.c2.cur == S.cur || S.c2.man) return;
  try {
    const r = await sbF("https://open.er-api.com/v6/latest/" + encodeURIComponent(S.cur)), j = await r.json(), v = j && j.rates && j.rates[S.c2.cur];
    if (v > 0 && S.c2 && !S.c2.man) {
      S.c2.rate = Math.round(v * 1e4) / 1e4;
      S.c2.d = today();
      S.c2.t = Date.now();
      save();
      R();
    }
  } catch (e) {
    toast("No he podido actualizar el cambio");
  }
}
function c2Due() {
  return S.c2 && !S.c2.man && S.c2.cur != S.cur && (!S.c2.t || Date.now() - S.c2.t > (S.c2.ev || 24) * 36e5);
}
function f2(n) {
  if (!S.c2 || !(S.c2.rate > 0)) return "";
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: S.c2.cur, currencyDisplay: "narrowSymbol" }).format((n || 0) * S.c2.rate).replace("-", "−");
  } catch (e) {
    return "";
  }
}
function fab() {
  if (tab == "biz") return bzNew();
  if (tab == "inf") return fabD();
  fab0();
}
function fab0() {
  if (tab != "gas") pt = tab;
  q.id = null;
  q.k = "g";
  q.what = "";
  q.ot = "";
  gmO = false;
  q.dvf = false;
  q.spf = false;
  q.w = "p";
  q.sp = false;
  q.fxOn = !!S.c2 && !!S.tc && S.tc != S.cur;
  q.cur = q.fxOn ? S.tc : "";
  q.fx = q.fxOn && S.rates ? S.rates[S.tc] || "" : "";
  q.fxMan = false;
  if (q.fxOn) setTimeout(() => fxGet(), 0);
  q.src = UI().view;
  q.d = tab == "dia" && dday != today() ? dday : "";
  tab = "gas";
  R();
  scrollTo(0, 0);
  const e = $("qa");
  if (e) e.focus();
}
function short() {
  const m = {};
  S.tx.filter((t) => t.k == "g" && !t.rid).forEach((t) => {
    const k = [t.c, t.r ? 1 : 0, t.ac, t.what || "", t.n || ""].join("|"), o = m[k] || (m[k] = { t, n: 0 });
    o.n++;
    if (t.d >= o.t.d) o.t = t;
  });
  return Object.values(m).filter((o) => o.n >= 2).sort((a, b) => b.n - a.n).slice(0, 6);
}
function scH() {
  const sc = [];
  return sc.length ? `<div class="card"><p class="lab">Atajos: tus gastos más repetidos</p><div class="sc">${sc.map((o, i) => `<button class="chip" onclick="useS(${i})">${esc(o.t.what || o.t.n || o.t.c)} <span class="mut">${f(o.t.a)}${o.t.r ? " · devuelven" : ""}</span></button>`).join("")}</div></div>` : "";
}
function useS(i) {
  const o = short()[i];
  if (!o) return;
  const t = o.t;
  Object.assign(q, { id: null, k: "g", a: String(t.a), w: t.r ? "d" : "p", ac: t.ac || defAc(), what: t.what || "", n: t.n || "", d: "" });
  if (t.r) q.rc = t.c;
  else q.c = EC.includes(t.c) ? t.c : "Otros";
  R();
  scrollTo(0, 0);
  $("qa").focus();
}
const fd = (d) => d.slice(8) + "/" + d.slice(5, 7) + "/" + d.slice(0, 4), fp = (n) => n.toFixed(2).replace(".", ",") + " " + S.cur;
function repD(all) {
  if (all == 2) {
    const l2 = S.tx.filter((t) => t.k == "g" && !t.r && t.d.startsWith(mo)).map((t) => t.sh != null ? Object.assign({}, t, { a: t.sh }) : t).sort((a, b) => a.d.localeCompare(b.d)), gr2 = CATS.map((c) => {
      const x = l2.filter((t) => (CATS.includes(t.c) ? t.c : "Otros") == c);
      return { c, l: x, a: sum(x, (t) => t.a) };
    }).filter((g) => g.l.length), tot = sum(gr2, (g) => g.a);
    return { gr: gr2, tot, own: tot, rv: 0, mes: (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long", year: "numeric" }), mn: (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" }) + (mo.slice(0, 4) == cm().slice(0, 4) ? "" : " de " + mo.slice(0, 4)), st: "" };
  }
  const l = (all ? ALL().filter((t) => t.k == "g" && t.d.startsWith(mo)) : rl().filter((t) => !t.dv).concat(rlOld())).slice().sort((a, b) => a.d.localeCompare(b.d)), gr = CATS.map((c) => {
    const x = l.filter((t) => (CATS.includes(t.c) ? t.c : "Otros") == c);
    return { c, l: x, a: sum(x, (t) => t.a) };
  }).filter((g) => g.l.length);
  if (all) {
    const sp = spM(mo), own = l, rr = [], rv = sum(rr, (t) => t.a), ow = {};
    own.forEach((t) => {
      const c = CATS.includes(t.c) ? t.c : "Otros";
      ow[c] = (ow[c] || 0) + t.a;
    });
    const dl2 = [];
    ALL().filter((t) => t.k == "d" && !t.lk && t.d.startsWith(mo)).forEach((t) => {
      const u = rnd(Math.min(ow[t.c] || 0, t.a));
      if (u > 0) {
        ow[t.c] -= u;
        dl2.push(Object.assign({}, t, { a: -u, what: /^Te devolvi/.test(lb(t)) ? lb(t) : "Te lo devolvieron" + (lb(t) && lb(t) != t.c ? " · " + lb(t) : "") }));
      }
    });
    const own2 = own.concat(dl2).sort((a, b) => a.d.localeCompare(b.d)), g2 = CATS.map((c) => ({ c, l: own2.filter((t) => (CATS.includes(t.c) ? t.c : "Otros") == c), a: sp.c[c] || 0 })).filter((g) => g.l.length);
    if (rr.length) g2.push({ c: "Ya me lo devolvieron (no cuenta en el total)", l: rr, a: rv, x: 1 });
    gr.length = 0;
    gr.push(...g2);
    return { gr, tot: sp.g, own: sp.g, rv, mes: (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long", year: "numeric" }), mn: (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" }) + (mo.slice(0, 4) == cm().slice(0, 4) ? "" : " de " + mo.slice(0, 4)), st: "" };
  }
  return { gr, tot: sum(l, (t) => t.a), own: sum(l.filter((t) => !t.r), (t) => t.a), rv: sum(l.filter((t) => t.r), (t) => t.a), mes: (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long", year: "numeric" }), mn: (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" }) + (mo.slice(0, 4) == cm().slice(0, 4) ? "" : " de " + mo.slice(0, 4)), st: rl().some((t) => !t.dv) ? "Pendiente de devolver" : "Ya devuelto" };
}
const lb = (t) => [t.ot, t.what].filter(Boolean).join(" · ") || t.n || t.c;
const dAc = () => AC.includes(S.dac) ? S.dac : AC.includes(S.pacc) ? S.pacc : AC.includes("Cuenta de ahorro") ? "Cuenta de ahorro" : AC[0];
function tgD(id) {
  const t = S.tx.find((x) => x.id == id);
  if (!t) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  if (t.dv) {
    if (t.dbz) S.bz = S.bz.filter((y) => y.id != t.dbz);
    delete t.dv;
    delete t.dac;
    delete t.dbz;
  } else {
    t.dv = today();
    t.dac = t.rac || dAc();
  }
  save();
  R();
  toast(t.dv ? "Devuelto: +" + f(t.a) + " en " + t.dac : "Marcado como pendiente", 1);
}
function allD() {
  const l = rl().filter((t) => !t.dv).concat(rlOld());
  if (!l.length) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  const ac = dAc();
  l.forEach((t) => {
    t.dv = today();
    t.dac = t.rac || ac;
  });
  save();
  R();
  toast("Devuelto todo: +" + f(sum(l, (t) => t.a)), 1);
}
let bq = { t: "env", p: "", a: "", c: "", d: "", ac: defAc() }, bf = "all";
function brd() {
  ["p", "a", "c", "d"].forEach((k) => {
    const e = $("b" + k);
    if (e) bq[k] = e.value;
  });
  const o = $("bot");
  if (o) bq.ot = o.value;
}
function bsq(k, v) {
  brd();
  bq[k] = v;
  R();
}
function autoLk(p, a) {
  const n = (p || "").trim().toLowerCase(), v = rnd(parseFloat(a)), l = n ? S.bz.filter((y2) => y2.t == "deb" && y2.p.trim().toLowerCase() == n) : [], x = l.find((y2) => y2.a == v) || l[0];
  if (x) return "d:" + x.id;
  const lr = n ? S.tx.filter((t) => t.r && !t.dv && (t.what || "").toLowerCase().split(" · ")[0] == n) : [], y = lr.find((t) => t.a == v) || lr[0];
  return y ? "r:" + y.id : "";
}
function lkUpd() {
  if (bq.lkt) return;
  brd();
  const e = $("blk");
  if (e) e.value = autoLk(bq.p, bq.a);
}
function lkOptsD() {
  const sel = bq.lkt ? bq.lk : "", gs = S.tx.filter((t) => t.k == "g" && !t.r).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 40);
  if (sel && sel[0] == "g" && !gs.some((t) => "g:" + t.id == sel)) {
    const z = S.tx.find((t) => "g:" + t.id == sel);
    if (z) gs.push(z);
  }
  return `<option value="">Nada en concreto</option>` + gs.map((t) => `<option value="g:${t.id}" ${sel == "g:" + t.id ? "selected" : ""}>${esc(fd(t.d).slice(0, 5) + " · " + (t.what || t.n || t.c) + " · " + f(t.a))}</option>`).join("");
}
function bzLkD(v) {
  brd();
  bq.lk = v;
  bq.lkt = 1;
  const t = v.startsWith("g:") && S.tx.find((x) => x.id == v.slice(2));
  if (t) {
    if (!(parseFloat(bq.a) > 0)) bq.a = String(t.a);
    bq.d = t.d;
  }
  R();
}
function lkOpts() {
  const sel = bq.lkt ? bq.lk : autoLk(bq.p, bq.a), db = S.bz.filter((x) => x.t == "deb").sort((a, b) => b.d.localeCompare(a.d)), gs = S.tx.filter((t) => t.k == "g" && !t.r).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 20), rs2 = S.tx.filter((t) => t.r && !t.dv).sort((a, b) => b.d.localeCompare(a.d)), o = (v, l) => `<option value="${v}" ${sel == v ? "selected" : ""}>${esc(l)}</option>`;
  if (sel && sel[0] == "g" && !gs.some((t) => "g:" + t.id == sel)) {
    const z = S.tx.find((t) => "g:" + t.id == sel);
    if (z) gs.push(z);
  }
  return o("", "Nada en concreto") + (db.length ? `<optgroup label="Lo que te deben">${db.map((x) => o("d:" + x.id, x.p + " te debe " + f(x.a) + (x.c ? " · " + x.c : ""))).join("")}</optgroup>` : "") + (rs2.length ? `<optgroup label="Gastos que te tienen que devolver">${rs2.map((t) => o("r:" + t.id, fd(t.d).slice(0, 5) + " · " + (t.what || t.c) + " · " + f(t.a))).join("")}</optgroup>` : "") + (gs.length ? `<optgroup label="Tus últimos gastos">${gs.map((t) => o("g:" + t.id, fd(t.d).slice(0, 5) + " · " + (t.what || t.n || t.c) + " · " + f(t.a))).join("")}</optgroup>` : "");
}
let bze = null;
function contAll() {
  const m = {}, fv = S.contF || [], nw2 = (n) => ({ n, env: 0, rec: 0, deb: 0, last: "" });
  (S.bz || []).forEach((x) => {
    const n = (x.p || "").trim();
    if (!n) return;
    m[n] = m[n] || nw2(n);
    m[n][x.t] = (m[n][x.t] || 0) + 1;
    const d = x.dd && x.dd > x.d ? x.dd : x.d;
    if (d > m[n].last) m[n].last = d;
  });
  (S.cont || []).forEach((n) => {
    m[n] = m[n] || nw2(n);
  });
  const h = S.contH || [];
  return Object.values(m).filter((c) => !h.includes(c.n)).map((c) => Object.assign(c, { fav: fv.includes(c.n) }));
}
function contSort(l, t) {
  const w = (c) => (c[t] || 0) * 3 + c.env + c.rec + c.deb;
  return l.sort((a, b) => b.fav - a.fav || (b.last || "").localeCompare(a.last || "") || w(b) - w(a) || a.n.localeCompare(b.n));
}
function contTop(t, k) {
  return contSort(contAll(), t).slice(0, k || 8);
}
function lev(a, b) {
  const m = a.length, n = b.length, d = [...Array(m + 1)].map((_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1));
    if (i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}
function cMatch(v, all) {
  const q2 = nrm(v);
  if (!q2) return all ? contSort(contAll(), "rec") : [];
  const sc = (c) => {
    const n = nrm(c.n), ws = n.split(/\s+/);
    if (n == q2) return 6;
    if (n.startsWith(q2)) return 5;
    if (ws.some((w) => w.startsWith(q2))) return 4;
    if (n.includes(q2)) return 3;
    if (q2.length >= 3 && ws.some((w) => lev(q2, w) <= (q2.length <= 4 ? 1 : 2))) return 2;
    if (q2.length >= 4 && ws.some((w) => lev(q2, w.slice(0, q2.length)) <= 1)) return 1;
    return 0;
  };
  return contAll().map((c) => [c, sc(c)]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1] || b[0].fav - a[0].fav || (b[0].last || "").localeCompare(a[0].last || "")).map((x) => x[0]);
}
function cBox(v) {
  v = String(v || "").trim();
  const chip = (c, on) => `<button class="chip" style="padding:6px 12px;font-size:14px;${on ? "background:var(--acc);color:#fff;border-color:var(--acc)" : ""}" data-n="${esc(c.n)}" onclick="cSet(this.dataset.n)">${c.fav ? ic("star", 13, 1) + " " : ""}${esc(c.n)}</button>`;
  if (!v) {
    const t = contSort(contAll(), bq.t);
    return t.length ? cBar(t, chip, "") : "";
  }
  const m = cMatch(v).slice(0, 8), ex = contAll().some((c) => nrm(c.n) == nrm(v));
  return (m.length ? cBar(m, chip, v) : "") + (ex ? "" : `<div class="chips" style="margin:6px 0 0"><button class="chip" style="padding:6px 12px;font-size:14px;border-style:dashed;color:var(--acc);border-color:var(--acc)" data-n="${esc(v)}" onclick="cNew(this.dataset.n)">+ Guardar «${esc(v)}» como contacto</button></div>`);
}
// Barra de nombres en una sola línea: los que no caben pasan a un desplegable «Más», en el mismo orden (favoritos y más usados primero)
function cBar(l, chip, v, fn) {
  fn = fn || "cSet";
  return `<div class="cbar"><div class="cfit">${l.map((c) => chip(c, !!v && nrm(c.n) == nrm(v))).join("")}</div><select class="cmore" hidden onchange="if(this.value)${fn}(this.value)" aria-label="Más nombres"></select></div>`;
}
function cFit() {
  document.querySelectorAll(".cbar").forEach((b) => {
    const w = b.querySelector(".cfit"), s = b.querySelector(".cmore"), cs = [...w.children];
    cs.forEach((c) => c.hidden = false);
    s.hidden = true;
    if (w.scrollWidth <= w.clientWidth + 1) return;
    s.hidden = false;
    s.innerHTML = `<option>Más (${cs.length})</option>`;
    for (let i = cs.length - 1; i > 0 && w.scrollWidth > w.clientWidth + 1; i--) cs[i].hidden = true;
    const op = (n) => s.innerHTML = `<option>Más (${n})</option>`;
    for (const c of cs.filter((c2) => c2.hidden)) {
      c.hidden = false;
      op(cs.filter((c2) => c2.hidden).length);
      if (w.scrollWidth > w.clientWidth + 1) {
        c.hidden = true;
        break;
      }
    }
    const hid = cs.filter((c) => c.hidden), sel = hid.find((c) => c.style.background);
    s.innerHTML = `<option value="">Más (${hid.length})</option>` + hid.map((c) => `<option value="${esc(c.dataset.n)}" ${c === sel ? "selected" : ""}>${esc(c.textContent)}</option>`).join("");
  });
}
addEventListener("resize", () => cFit());
function cSrch(v) {
  bq.p = v;
  const e = $("bpS");
  if (e) {
    e.innerHTML = cBox(v);
    cFit();
  }
  lkUpd();
}
function cSet(n) {
  bq.p = n;
  const e = $("bp");
  if (e) e.value = n;
  cSrch(n);
}
function cNew(n) {
  n = clean(n);
  if (!n) return;
  S.cont = [...new Set([...S.cont || [], n])];
  S.contH = (S.contH || []).filter((x) => x != n);
  save();
  cSet(n);
  toast("«" + n + "» guardado en tus contactos");
}
function contFav(n) {
  const f3 = S.contF || [];
  S.contF = f3.includes(n) ? f3.filter((x) => x != n) : [...f3, n];
  save();
  R();
  toast((S.contF || []).includes(n) ? "★ " + n + " es favorito" : n + " ya no es favorito");
}
function cRow(c) {
  return `<div class="li"><input value="${esc(c.n)}" data-o="${esc(c.n)}" onchange="contRen(this.dataset.o,this.value)" style="flex:1;min-width:0" aria-label="Nombre del contacto"><button class="chip" data-n="${esc(c.n)}" onclick="contFav(this.dataset.n)" aria-pressed="${c.fav}" style="padding:6px 10px;font-size:13px;flex:none;${c.fav ? "background:var(--amb);border-color:var(--amb);color:#fff;font-weight:600" : ""}">${ic("star", 14, c.fav)} Favorito</button><button class="x" data-n="${esc(c.n)}" onclick="contDel(this.dataset.n)" aria-label="Quitar ${esc(c.n)}">${ic("x", 16)}</button></div>`;
}
function ctList(v) {
  v = String(v || "").trim();
  const l = cMatch(v, 1), ex = contAll().some((c) => nrm(c.n) == nrm(v));
  return (l.length ? l.map(cRow).join("") : v ? "" : '<p class="mut hint" style="font-size:14px">Se añaden solos cuando apuntas Bizums.</p>') + (v && !ex ? `<button class="chip" style="width:100%;margin-top:8px;border-style:dashed;color:var(--acc);border-color:var(--acc)" data-n="${esc(v)}" onclick="cAddS(this.dataset.n)">+ Añadir «${esc(v)}» como contacto</button>` : "");
}
function ctSrch(v) {
  ctq = v;
  const e = $("ctL");
  if (e) e.innerHTML = ctList(v);
}
function cAddS(n) {
  n = clean(n);
  if (!n) return;
  S.cont = [...new Set([...S.cont || [], n])];
  S.contH = (S.contH || []).filter((x) => x != n);
  save();
  const e = $("cts");
  if (e) e.value = "";
  ctSrch("");
  toast("«" + n + "» añadido");
}
function cPick(el) {
  brd();
  bq.p = el.dataset.n;
  R();
}
function contAdd() {
  const e = $("ctn"), n = clean(e && e.value);
  if (!n) return;
  S.cont = [...new Set([...S.cont || [], n])];
  S.contH = (S.contH || []).filter((x) => x != n);
  save();
  R();
  toast("Contacto añadido");
}
function contRen(o, v) {
  const n = clean(v);
  if (!n || n == o) {
    R();
    return;
  }
  (S.bz || []).forEach((x) => {
    if (x.p == o) x.p = n;
  });
  S.cont = [...new Set((S.cont || []).filter((x) => x != o).concat(n))];
  S.contH = (S.contH || []).filter((x) => x != n);
  save();
  R();
  toast("Contacto renombrado");
}
function contDel(n) {
  S.cont = (S.cont || []).filter((x) => x != n);
  S.contH = [...new Set([...S.contH || [], n])];
  save();
  R();
  toast("Quitado de tus contactos");
}
// Buscador mini de contactos para «La pagué por más gente»
function spBar(v) {
  v = String(v || "").trim();
  const ya = (q.sm || "eq") == "eq" ? (q.snm || "").split(",").map((x) => nrm(x.trim())) : (q.rows || []).map((r) => nrm(r.p || "")), l = (v ? cMatch(v).slice(0, 12) : contSort(contAll(), "deb")).filter((c) => !ya.includes(nrm(c.n))), ex = !v || contAll().some((c) => nrm(c.n) == nrm(v)), chip = (c) => `<button class="chip" data-n="${esc(c.n)}" onclick="spAddN(this.dataset.n)">+ ${c.fav ? ic("star", 13, 1) + " " : ""}${esc(c.n)}</button>`;
  return (ex ? "" : `<button class="chip spn" data-n="${esc(v)}" onclick="spNew(this.dataset.n)">+ Añadir «${esc(v)}»</button>`) + (l.length ? cBar(l, chip, "", "spAddN") : v ? "" : '<span class="mut" style="font-size:13px">Escribe un nombre</span>');
}
function spQ(v) {
  const e = $("spS");
  if (e) e.innerHTML = spSug(v);
}
const spYa = () => (q.sm || "eq") == "eq" ? (q.snm || "").split(",").map((x) => x.trim()).filter(Boolean) : (q.rows || []).map((r) => (r.p || "").trim()).filter(Boolean);
function spMore() {
  const ya = spYa().map(nrm), l = contSort(contAll(), "deb").filter((c) => !ya.includes(nrm(c.n)));
  return l.length ? `<select class="spm" onchange="if(this.value)spAddN(this.value)" aria-label="Elegir de tus contactos"><option value="">Más</option>${l.map((c) => `<option value="${esc(c.n)}">${c.fav ? "★ " : ""}${esc(c.n)}</option>`).join("")}</select>` : "";
}
function spSug(v) {
  v = String(v || "").trim();
  if (!v) return "";
  const ya = spYa().map(nrm), l = cMatch(v).filter((c) => !ya.includes(nrm(c.n))).slice(0, 6), ex = contAll().some((c) => nrm(c.n) == nrm(v));
  return `<div class="chips" style="margin:-2px 0 8px">${l.map((c) => `<button class="chip sps" data-n="${esc(c.n)}" onclick="spAddN(this.dataset.n)">+ ${c.fav ? ic("star", 13, 1) + " " : ""}${esc(c.n)}</button>`).join("")}${ex || ya.includes(nrm(v)) ? "" : `<button class="chip sps spn" data-n="${esc(v)}" onclick="spNew(this.dataset.n)">+ Añadir «${esc(v)}»</button>`}</div>`;
}
function spTags() {
  const l = spYa();
  return l.length ? `<div class="chips" style="margin:0 0 8px">${l.map((n) => `<button class="chip sps on" data-n="${esc(n)}" onclick="spRm(this.dataset.n)" aria-label="Quitar ${esc(n)}">${esc(n)} ${ic("x", 12)}</button>`).join("")}</div>` : "";
}
function spRm(n) {
  rd();
  q.snm = spYa().filter((x) => x != n).join(", ");
  R();
}
function spFlush() {
  const e = $("spq");
  if (!e || !e.value.trim()) return;
  const n = clean(e.value);
  e.value = "";
  if ((q.sm || "eq") != "eq") {
    q.rows = q.rows || [];
    if (n && !q.rows.some((r) => r.p == n)) q.rows.push({ p: n, a: "" });
    return;
  }
  const l = spYa();
  if (n && !l.includes(n)) {
    l.push(n);
    q.snm = l.join(", ");
    if (l.length + 1 > (parseInt(q.sn, 10) || 2)) q.sn = String(l.length + 1);
  }
}
function spNew(n) {
  n = clean(n);
  if (!n) return;
  S.cont = [...new Set([...S.cont || [], n])];
  S.contH = (S.contH || []).filter((x) => x != n);
  save();
  spAddN(n);
}
function spAddN(n) {
  rd();
  if ((q.sm || "eq") == "eq") {
    const l = (q.snm || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (!l.includes(n)) l.push(n);
    q.snm = l.join(", ");
    if (l.length + 1 > (parseInt(q.sn, 10) || 2)) q.sn = String(l.length + 1);
  } else {
    q.rows = q.rows || [];
    if (!q.rows.some((r) => r.p == n)) {
      const e = q.rows.find((r) => !r.p);
      e ? e.p = n : q.rows.push({ p: n, a: "" });
    }
  }
  R();
  if ((q.sm || "eq") != "eq") {
    const e = $("qra" + q.rows.findIndex((r) => r.p == n));
    if (e) e.focus();
  }
}
function bzEd(id) {
  const x = S.bz.find((y) => y.id == id);
  if (!x) return;
  bze = id;
  Object.assign(bq, { t: x.t, p: x.p, a: String(x.a), c: x.c || "", cat: x.cat || "", ot: x.ot || "", d: x.d, ac: x.ac || defAc(), dv: x.t == "rec" ? x.dev !== false : true, pg: true, lk: x.g ? "g:" + x.g : x.rr ? "r:" + x.rr : "", lkt: 1, src: x.src });
  if (tab != "bzf") bzPt = tab;
  tab = "bzf";
  R();
  scrollTo(0, 0);
  setTimeout(() => {
    const e = $("bp");
    if (e) e.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 60);
}
const bkey = (x) => String(x.p || "").trim().toLowerCase(), owRem = (x) => Math.max(0, rnd(x.a - sum(x.pays || [], (y) => y.v)));
function bzNet(to) {
  to = to || "9999-12-31";
  const o = {}, g = (x) => o[bkey(x)] || (o[bkey(x)] = { p: x.p, D: 0, O: 0, k: bkey(x) });
  (S.bz || []).filter((x) => x.t == "deb" && x.d <= to).forEach((x) => {
    const v = g(x);
    v.D = rnd(v.D + x.a);
  });
  (S.ow || []).filter((x) => x.d <= to && owRem(x) > 0).forEach((x) => {
    const v = g(x);
    v.O = rnd(v.O + owRem(x));
  });
  Object.values(o).forEach((v) => {
    v.n = rnd(v.D - v.O);
  });
  return o;
}
// Totales de Bizum: lo que te deben y lo que debes, en bruto (la misma cuenta que usa Cuentas). Para cruzarlos con una persona está «Compensar».
function bzTot(to) {
  to = to || "9999-12-31";
  return { d: sum((S.bz || []).filter((x) => x.t == "deb" && x.d <= to), (x) => x.a), o: sum((S.ow || []).filter((x) => x.d <= to), owRem) };
}
function oweSave(p, a) {
  const cat2 = bq.cat || "Otros", ot = cat2 == "Otros" && bq.ot ? clean(bq.ot) : "", d = bq.d || today(), c = bq.c.trim(), what = "Debo a " + p + (c ? " · " + c : ""), eid = typeof bze == "string" && bze.startsWith("ow:") ? bze.slice(3) : null;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  S.ow = S.ow || [];
  if (eid) {
    const o = S.ow.find((x) => x.id == eid);
    if (o) {
      Object.assign(o, { p, a, c, d, ac: bq.ac, cat: cat2, ot });
      const t = S.tx.find((y) => y.id == o.tx);
      if (t) Object.assign(t, { a, c: cat2, d, what, ot });
    }
    bzCancel(1);
    save();
    R();
    toast("Actualizado", 1);
    return;
  }
  const cv = bze ? S.bz.find((y) => y.id == bze) : null;
  if (cv) {
    unRR(cv);
    S.bz = S.bz.filter((y) => y.id != cv.id);
    shSync(cv.g);
  }
  const id = uid(), tid = uid();
  S.ow.push({ id, p, a, c, d, ac: bq.ac, cat: cat2, ot, tx: tid, pays: [] });
  S.tx.push({ id: tid, k: "g", a, c: cat2, r: false, ok: false, ac: "", m: "", d, n: "", what, ot, ow: id });
  bq.p = "";
  bq.a = "";
  bq.c = "";
  bq.d = "";
  bze = null;
  save();
  if (tab == "bzf") tab = bzPt || "biz";
  R();
  toast(cv ? "Cambiado a «Debo»: debes " + f(a) + " a " + p : "Debes " + f(a) + " a " + p + " · ya cuenta como gasto", 1);
}
function oweEd(id) {
  const x = (S.ow || []).find((y) => y.id == id);
  if (!x) return;
  bze = "ow:" + id;
  Object.assign(bq, { t: "owe", p: x.p, a: String(x.a), c: x.c || "", cat: x.cat || "", ot: x.ot || "", d: x.d, ac: x.ac || defAc(), lk: "", lkt: 0 });
  if (tab != "bzf") bzPt = tab;
  tab = "bzf";
  R();
  scrollTo(0, 0);
}
function oweDel(id) {
  preDel();
  const x = (S.ow || []).find((y) => y.id == id);
  if (!x) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  S.tx = S.tx.filter((t) => t.id != x.tx);
  S.ow = S.ow.filter((y) => y.id != id);
  if (tab == "bzf") tab = bzPt || "biz";
  bze = null;
  save();
  R();
  toast("Borrado", 1);
}
function oweUnpay(id) {
  const x = (S.ow || []).find((y) => y.id == id);
  if (!x || !(x.pays || []).some((y) => !y.cp)) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  x.pays = x.pays.filter((y) => y.cp);
  save();
  R();
  toast("Anotado: aún no le has pagado a " + x.p, 1);
}
async function updApp() {
  toast("Buscando la última versión…");
  try {
    if (navigator.serviceWorker) {
      const rs2 = await navigator.serviceWorker.getRegistrations();
      for (const r of rs2) await r.unregister();
    }
    if (window.caches) {
      const ks = await caches.keys();
      for (const k of ks) await caches.delete(k);
    }
  } catch (e) {
  }
  location.replace(location.pathname + "?v=" + Date.now());
}
function owePay(id) {
  const x = (S.ow || []).find((y) => y.id == id), r = x && owRem(x);
  if (!(r > 0)) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  const ac = AC.includes(x.ac) ? x.ac : defAc();
  (x.pays = x.pays || []).push({ d: today(), v: r, ac });
  save();
  R();
  toast("Le pagaste " + f(r) + " a " + x.p + " · restado de " + ac, 1);
}
function bzComp(key) {
  const by2 = (a, b) => a.d.localeCompare(b.d), debs = (S.bz || []).filter((x) => x.t == "deb" && bkey(x) == key).sort(by2), owes = (S.ow || []).filter((x) => bkey(x) == key && owRem(x) > 0).sort(by2), c = rnd(Math.min(sum(debs, (x) => x.a), sum(owes, owRem)));
  if (!(c > 0)) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  let r = c;
  for (const o of owes) {
    if (r <= 0) break;
    const v = rnd(Math.min(r, owRem(o)));
    (o.pays = o.pays || []).push({ d: today(), v, cp: 1 });
    r = rnd(r - v);
  }
  r = c;
  for (const x of debs) {
    if (r <= 0) break;
    const v = rnd(Math.min(r, x.a));
    if (v < x.a) S.bz.push({ id: uid(), t: "deb", p: x.p, a: rnd(x.a - v), c: x.c, d: x.d, ac: x.ac, src: x.src, g: x.g, cat: x.cat });
    x.a = v;
    x.t = "rec";
    x.dev = true;
    x.dd = x.d;
    x.d = today();
    x.ac = "";
    x.cp = 1;
    r = rnd(r - v);
  }
  save();
  R();
  toast("Compensado " + f(c) + " con " + (debs[0] || owes[0]).p, 1);
}
function oweCards(nt) {
  const ow = (S.ow || []).filter((x) => owRem(x) > 0).sort((a, b) => a.d.localeCompare(b.d)), both = Object.values(nt).filter((v) => v.D > 0 && v.O > 0), tg = (x) => x.d.slice(0, 7) < mo ? `<span class="mtag">${(new Date(x.d + "T12:00")).toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}</span>` : "";
  return (both.length ? `<div class="card"><h2>Compensar</h2>${both.map((v) => `<div class="li"><div class="g">${esc(v.p)}<small>Te debe ${f(v.D)} · le debes ${f(v.O)} → ${v.n > 0 ? esc(v.p) + " te debe " + f(v.n) : v.n < 0 ? "debes " + f(-v.n) + " a " + esc(v.p) : "estáis en paz"}</small></div><button class="chip" style="padding:4px 10px;font-size:12px;flex:none;background:var(--acc);color:#fff;border-color:var(--acc)" onclick="bzComp('${esc(v.k)}')">Compensar</button></div>`).join("")}<div class="tip hint">Compensar resta lo mismo de las dos deudas, sin mover dinero de ninguna cuenta.</div></div>` : "") + `<div class="card"><h2>Debo</h2>${ow.length ? ow.map((x) => `<div class="li"><div class="g">${esc(x.p)}${x.c ? " · " + esc(x.c) : ""}${tg(x)}<small>Desde el ${fd(x.d)}${x.pays && x.pays.length ? " · ya has pagado " + f(rnd(x.a - owRem(x))) : ""}</small></div><strong class="neg">${f(owRem(x))}</strong><button class="chip" style="padding:4px 10px;font-size:12px;flex:none;background:var(--acc);color:#fff;border-color:var(--acc)" onclick="owePay('${x.id}')">Se lo pagué</button><button class="x" onclick="oweEd('${x.id}')" aria-label="Editar">${ic("pencil", 17)}</button><button class="x" onclick="oweDel('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`).join("") + '<div class="tip hint">Lo que debes ya cuenta como gasto. Al tocar «Se lo pagué» se resta de la cuenta que elegiste, sin contarlo dos veces.</div>' : '<p class="mut">No debes nada. Usa «Debo» al apuntar un Bizum.</p>'}</div>`;
}
function bzCancel(q2) {
  if (tab == "bzf") tab = bzPt || "biz";
  bze = null;
  bq.p = "";
  bq.a = "";
  bq.c = "";
  bq.d = "";
  if (!q2) R();
}
function bzUnpay(id) {
  const x = S.bz.find((y) => y.id == id);
  if (!x || !x.dd) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  x.t = "deb";
  x.d = x.dd;
  delete x.dd;
  delete x.dev;
  save();
  R();
  toast(x.p + " vuelve a «Me deben»", 1);
}
function addB() {
  brd();
  const a = rnd(parseFloat(bq.a)), p = clean(bq.p);
  if (!p) {
    toast("Escribe el nombre");
    $("bp").focus();
    return;
  }
  if (!(a > 0)) {
    $("ba").focus();
    return;
  }
  if (bzNeedCat(p, a) && !bq.cat) {
    toast(bq.t == "deb" ? "Elige la categoría de lo que te deben" : "Elige de qué categoría te lo devuelven");
    return;
  }
  if (bq.t == "owe") {
    oweSave(p, a);
    return;
  }
  if (bze) {
    const x = S.bz.find((y) => y.id == bze);
    if (x) {
      L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
      Object.assign(x, { t: bq.t, p, a, c: bq.c.trim(), d: bq.d || x.d, ac: bq.ac, cat: bq.t == "env" ? bq.cat || "Otros" : bq.cat || void 0, ot: (bq.cat || (bq.t == "env" ? "Otros" : "")) == "Otros" && bq.ot ? clean(bq.ot) : void 0 });
      if (bq.t == "rec") x.dev = bq.dv !== false;
      else delete x.dev;
      if (bq.t == "deb") {
        delete x.dd;
      }
      if (bq.lkt && (bq.t == "deb" || bq.t == "rec")) {
        const ng = (bq.lk || "").startsWith("g:") ? bq.lk.slice(2) : void 0;
        if (ng !== x.g) {
          const og = x.g;
          if (ng) x.g = ng;
          else delete x.g;
          shSync(og);
          shSync(ng);
        }
      }
      shSync(x.g);
      if (bq.t != "rec") unRR(x);
      else if (x.rr) {
        const rt = S.tx.find((t) => t.id == x.rr && t.dbz == x.id);
        if (rt) {
          rt.dv = x.d;
          rt.dac = x.ac;
        }
      }
    }
    bzCancel(1);
    save();
    R();
    toast("Bizum actualizado", 1);
    return;
  }
  const dv = bq.t == "rec" && bq.dv !== false, lk = dv ? bq.lkt ? bq.lk || "" : autoLk(p, a) : bq.t == "deb" && bq.pg !== false && bq.lkt && (bq.lk || "").startsWith("g:") ? bq.lk : "", ld = lk.startsWith("d:") && S.bz.find((y) => y.id == lk.slice(2) && y.t == "deb");
  if (ld) {
    if (bq.cat) ld.cat = bq.cat;
    const rest = rnd(ld.a - a);
    if (rest > 0) S.bz.push({ id: uid(), t: "deb", p: ld.p, a: rest, c: ld.c, d: ld.d, ac: ld.ac, src: ld.src, g: ld.g });
    ld.t = "rec";
    ld.dev = true;
    if (sepMode()) ld.src = bq.src || UI().view;
    ld.dd = ld.d;
    ld.d = bq.d || today();
    ld.a = a;
    ld.ac = bq.ac;
    if (bq.c.trim()) ld.c = bq.c.trim();
  } else S.bz.push(Object.assign({ id: uid(), t: bq.t, p, a, c: bq.c.trim(), d: bq.d || today(), ac: bq.ac, dev: dv, cat: bq.t == "env" ? bq.cat || "Otros" : bq.cat || void 0, ot: (bq.cat || (bq.t == "env" ? "Otros" : "")) == "Otros" && bq.ot ? clean(bq.ot) : void 0, src: sepMode() ? bq.src || UI().view : void 0 }, lk.startsWith("g:") ? { g: lk.slice(2) } : {}));
  if (!ld && lk.startsWith("r:")) {
    const rt = S.tx.find((t) => t.id == lk.slice(2) && t.r), nb = S.bz[S.bz.length - 1];
    if (rt) {
      nb.rr = rt.id;
      rt.dv = nb.d;
      rt.dac = nb.ac;
      rt.dbz = nb.id;
    }
  }
  bq.lk = "";
  bq.lkt = 0;
  if (ld) shSync(ld.g);
  if (lk.startsWith("g:")) shSync(lk.slice(2));
  save();
  const m = { env: "Bizum enviado a " + p, rec: "Bizum recibido de " + p, deb: p + " te debe " + f(a) }[bq.t];
  bq.p = "";
  bq.a = "";
  bq.c = "";
  bq.d = "";
  if (bpi != null) {
    doneQ(bpi);
    bpi = null;
  }
  if (tab == "bzf") tab = bzPt || "biz";
  R();
  toast(m);
  if (pq.length) openP();
}
function shSync(gid) {
  const t = gid && S.tx.find((y) => y.id == gid && y.sh != null && !y.r);
  if (t) t.sh = rnd(Math.max(0, t.a - sum(S.bz.filter((x) => x.g == gid), (x) => x.a)));
}
function unRR(x) {
  if (!x || !x.rr) return;
  const rt = S.tx.find((t) => t.id == x.rr && t.dbz == x.id);
  if (rt) {
    delete rt.dv;
    delete rt.dac;
    delete rt.dbz;
  }
  delete x.rr;
}
function payB(id) {
  const x = S.bz.find((y) => y.id == id);
  if (!x) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  x.t = "rec";
  x.dev = true;
  x.dd = x.d;
  x.d = today();
  x.ac = AC.includes(x.ac) ? x.ac : bq.ac;
  save();
  R();
  toast(x.p + " te pagó " + f(x.a) + " · sumado a " + x.ac, 1);
}
function delB(id) {
  if (String(id).startsWith("ow:")) {
    oweDel(String(id).slice(3));
    return;
  }
  preDel();
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  const xb = S.bz.find((y) => y.id == id);
  unRR(xb);
  S.bz = S.bz.filter((y) => y.id != id);
  if (xb) shSync(xb.g);
  save();
  R();
  toast("Borrado", 1);
}
function bzPie(bm) {
  const o = {};
  bm.filter((x) => x.t == "env").forEach((x) => {
    const c = x.cat && EC.includes(x.cat) ? x.cat : "Otros";
    o[c] = rnd((o[c] || 0) + x.a);
  });
  return Object.keys(o).length ? `<div class="card"><h2>Bizums hechos por categoría</h2>${pie(Object.entries(o), "Bizums hechos")}</div>` : "";
}
function vBiz() {
  const bm = S.bz.filter((x) => x.t != "deb" && x.d.startsWith(mo)), en = sum(bm.filter((x) => x.t == "env"), (x) => x.a), re = sum(bm.filter((x) => x.t == "rec" && !x.cp), (x) => x.a), db = S.bz.filter((x) => x.t == "deb").sort((a, b) => a.d.localeCompare(b.d)), nt = bzNet(), td = bzTot().d, tdo = bzTot().o, pp = {}, hl = bm.filter((x) => bf == "all" || x.t == bf).sort((a, b) => b.d.localeCompare(a.d)), dbl = bf == "all" || bf == "deb" ? S.bz.filter((x) => x.t == "deb" && x.d.startsWith(mo)).sort((a, b) => b.d.localeCompare(a.d)) : [], dbRow = (x) => `<div class="li"><div class="g">${esc(x.p)} te debe${x.c ? " · " + esc(x.c) : ""}<small>Desde el ${fd(x.d)}${x.ac ? " · " + esc(x.ac) : ""} · pendiente</small></div><strong style="text-align:right;color:var(--rem)">${f0(x.a)}</strong><button class="chip" style="padding:4px 10px;font-size:12px;flex:none;background:var(--acc);color:#fff;border-color:var(--acc)" onclick="payB('${x.id}')">Me lo pagó</button><button class="x" onclick="bzEd('${x.id}')" aria-label="Editar">${ic("pencil", 17)}</button><button class="x" onclick="delB('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`, owl = bf == "all" || bf == "owe" ? (S.ow || []).filter((x) => x.d.startsWith(mo)).sort((a, b) => b.d.localeCompare(a.d)) : [], owRow = (x) => {
    const r = owRem(x), pd = r <= 0;
    return `<div class="li"><div class="g">Debo a ${esc(x.p)}${x.c ? " · " + esc(x.c) : ""}<small>${fd(x.d)}${x.ac ? " · " + esc(x.ac) : ""}${pd ? " · ya pagado" : x.pays && x.pays.length ? " · te quedan " + f(r) : " · pendiente"}</small></div><strong class="neg" style="text-align:right">−${f0(x.a)}</strong>${pd ? "" : `<button class="chip" style="padding:4px 10px;font-size:12px;flex:none;background:var(--acc);color:#fff;border-color:var(--acc)" onclick="owePay('${x.id}')">Se lo pagué</button>`}${(x.pays || []).some((y) => !y.cp) ? `<button class="chip" style="padding:4px 10px;font-size:12px;flex:none" onclick="oweUnpay('${x.id}')">${ic("undo", 14)} No se lo pagué</button>` : ""}<button class="x" onclick="oweEd('${x.id}')" aria-label="Editar">${ic("pencil", 17)}</button><button class="x" onclick="oweDel('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`;
  }, ty = [["env", "Hice un Bizum"], ["rec", "Me hicieron un Bizum"], ["deb", "Me deben"]];
  Object.values(nt).filter((v) => v.n > 0).forEach((v) => pp[v.p] = v.n);
  return `<div class="grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:12px"><div class="card" style="margin:0"><div class="k">Hechos por mí</div><div class="v neg">${f(en)}</div></div><div class="card" style="margin:0"><div class="k">Me hicieron</div><div class="v pos">${f(re)}</div></div><div class="card" style="margin:0"><div class="k">Me deben</div><div class="v" style="color:#4a78b5">${f(td)}</div></div><div class="card" style="margin:0"><div class="k">Debo</div><div class="v ${tdo ? "neg" : ""}">${f(tdo)}</div></div></div>
${UI().pie2 ? bzPie(bm) : ""}<div class="card"><h2>Me deben</h2>${db.length ? `<div class="lg" style="margin-bottom:8px">${Object.entries(pp).map(([n, v]) => `<span style="--c:#4a78b5">${esc(n)} ${f(v)}</span>`).join("")}</div>` + db.map((x) => {
    const gt = x.g && S.tx.find((t) => t.id == x.g);
    return `<div class="li"><div class="g">${esc(x.p)}${x.c ? " · " + esc(x.c) : ""}${x.d.slice(0, 7) < mo ? `<span class="mtag">${(new Date(x.d + "T12:00")).toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}</span>` : ""}<small>Desde el ${fd(x.d)}${gt && x.c !== "Parte de " + (gt.what || gt.n || gt.c) ? " · de " + esc(gt.what || gt.n || gt.c) + " (" + f0(gt.sh != null ? gt.full || gt.a : gt.a) + ")" : ""}</small></div><strong>${f(x.a)}</strong><button class="chip" style="padding:4px 10px;font-size:12px;flex:none;background:var(--acc);color:#fff;border-color:var(--acc)" onclick="payB('${x.id}')">Me lo pagó</button><button class="x" onclick="bzEd('${x.id}')" aria-label="Editar">${ic("pencil", 17)}</button><button class="x" onclick="delB('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`;
  }).join("") + '<div class="tip hint">Al tocar «Me lo pagó» pasa a «Me hicieron» y se suma a la cuenta que elegiste.</div>' : '<p class="mut">Nadie te debe nada.</p>'}</div>
${oweCards(nt)}<div class="card"><h2>Bizums del mes</h2><div class="chips" style="margin-bottom:8px">${[["all", "Todos"], ["env", "Hechos por mí"], ["rec", "Me hicieron"], ["deb", "Me deben"], ["owe", "Debo"]].map(([k, v]) => `<button class="chip ${bf == k ? "on" : ""}" onclick="bf='${k}';R()">${v}</button>`).join("")}</div>${hl.length || dbl.length || owl.length ? hl.map((x) => `<div class="li"><div class="g">${x.t == "env" ? "A " : "De "}${esc(x.p)}${x.c ? " · " + esc(x.c) : ""}<small>${fd(x.d)}${x.ac ? " · " + esc(x.ac) : x.cp ? " · compensado" : ""}${x.dd ? " · te lo debía desde el " + fd(x.dd) : ""}${x.t == "rec" && (x.dev || x.g) ? " · te devolvió tu parte" : ""}</small></div><strong class="${x.t == "env" ? "neg" : "pos"}" style="text-align:right">${x.t == "env" ? "−" : "+"}${f0(x.a)}${f2(x.a) ? `<small style="display:block;font-weight:500;color:var(--mut);font-size:12px">${f2(x.a)}</small>` : ""}</strong>${x.dd && !x.cp ? `<button class="chip" style="padding:4px 10px;font-size:12px;flex:none" onclick="bzUnpay('${x.id}')" title="Me equivoqué: aún no me lo ha pagado">${ic("undo", 14)} No me lo pagó</button>` : ""}<button class="x" onclick="bzEd('${x.id}')" aria-label="Editar">${ic("pencil", 17)}</button><button class="x" onclick="delB('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`).join("") + dbl.map(dbRow).join("") + owl.map(owRow).join("") : '<p class="mut">No hay Bizums este mes.</p>'}</div>`;
}
function vBzF() {
  const ty = [["env", "Hice un Bizum"], ["rec", "Me hicieron un Bizum"], ["deb", "Me deben"], ["owe", "Debo"]].filter((t) => !(bze && String(bze).startsWith("ow:")) || t[0] == "owe").concat(bze ? [] : [["spl", "Pagué por varios"]]);
  return `<button class="chip" onclick="bzBack()" style="margin-bottom:10px">${ic("left", 16)} Volver</button>${bpi != null ? `<div class="apb"><div class="t">${ic("phone", 18)} Bizum desde el atajo</div><div class="s">Revisa los datos y pulsa «${bq.t == "deb" ? "Guardar lo que me deben" : "Guardar Bizum"}».${pq.length > 1 ? pq.length == 2 ? " Después te queda 1 más." : " Después te quedan " + (pq.length - 1) + " más." : ""}</div>${dupH("b")}${pDupTxt ? "" : '<button class="sec" onclick="skipB()">Descartar este Bizum</button>'}</div>` : ""}<div class="card"><h2>${bze ? "Editar Bizum" : "Apuntar"}</h2><div class="chips">${ty.map(([k, v]) => `<button class="chip ${bq.t == k ? "on" : ""}" onclick="${k == "spl" ? "brd();spFromB()" : `bsq('t','${k}')`}">${v}</button>`).join("")}</div>
<p class="lab" style="margin-top:10px">${bq.t == "env" || bq.t == "owe" ? "A quién" : "Quién"}<span class="req">*</span></p><input id="bp" class="srch" placeholder="Busca o escribe un nombre" autocomplete="off" autocorrect="off" value="${esc(bq.p)}" oninput="cSrch(this.value)"><div id="bpS">${cBox(bq.p)}</div><p class="lab" style="margin-top:10px">Importe<span class="req">*</span></p><input id="ba" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${bq.a}" oninput="lkUpd()" style="margin-bottom:10px"><p class="lab">Categoría${bzNeedCat() ? '<span class="req">*</span>' : ""}</p><div class="chips">${EC.map((c) => `<button class="chip cc ${(bq.cat || (bq.t == "env" || bq.t == "owe" ? "Otros" : "")) == c ? "on" : ""}" style="--cc:${col(c)}" data-c="${esc(c)}" onclick="bzCat(this.dataset.c)">${esc(c)}</button>`).join("")}</div>${bzSubF()}<p class="lab">Fecha</p><input id="bd" type="date" value="${bq.d || today()}" style="margin-bottom:10px">
${sepMode() ? `<p class="lab">¿De tu paga o de tu sueldo?</p><div class="chips"><button class="chip ${(bq.src || UI().view) == "p" ? "on" : ""}" onclick="bsq('src','p')">Paga</button><button class="chip ${(bq.src || UI().view) == "s" ? "on" : ""}" onclick="bsq('src','s')">Sueldo</button></div>` : ""}<p class="lab">${bq.t == "owe" ? "Desde qué cuenta se lo pagarás" : bq.t == "env" ? "Desde qué cuenta" : bq.t == "rec" ? "A qué cuenta" : "Cuando te lo paguen, a qué cuenta"}</p><div class="chips">${AC.map((a) => `<button class="chip ${bq.ac == a ? "on" : ""}" onclick="bsq('ac','${a}')">${a}</button>`).join("")}</div>
${bq.t == "deb" ? `<label class="chk" style="margin-top:12px"><input type="checkbox" ${bq.pg !== false ? "checked" : ""} onchange="brd();bq.pg=this.checked;if(!this.checked){bq.lk='';bq.lkt=0}R()"><b>Es para devolverme algo que pagué yo</b></label>${bq.pg !== false ? `<p class="lab">¿Qué te deben?</p><select id="blk" onchange="bzLkD(this.value)">${lkOptsD()}</select><p class="tip hint" style="margin:6px 0 0">Pon en Importe solo lo que te deben. Del gasto cuenta solo tu parte desde que lo apuntas.</p>` : ""}` : ""}${bq.t == "rec" ? `<label class="chk" style="margin-top:12px"><input type="checkbox" ${bq.dv !== false ? "checked" : ""} onchange="brd();bq.dv=this.checked;R()"><b>Es para devolverme algo que pagué yo</b></label>${bq.dv !== false ? `<p class="lab">¿Qué te está pagando?</p><select id="blk" onchange="brd();bq.lk=this.value;bq.lkt=1;R()">${lkOpts()}</select>` : ""}` : ""}<button class="b" style="margin-top:10px" onclick="addB()">${bze ? "Guardar cambios" : bq.t == "deb" ? "Guardar lo que me deben" : bq.t == "owe" ? "Guardar lo que debo" : "Guardar Bizum"}</button>${bze ? `<button class="chip" style="width:100%;margin-top:8px" onclick="bzCancel()">Cancelar</button><button class="chip" style="width:100%;margin-top:8px;color:var(--red);border-color:var(--red)" onclick="const i=bze;bzCancel(1);delB(i)">Borrar este Bizum</button>` : ""}</div>`;
}
let bzPt = "biz";
function bzNew() {
  bzPt = "biz";
  bze = null;
  bpi = null;
  Object.assign(bq, { p: "", a: "", c: "", cat: "", ot: "", d: "", lk: "", lkt: 0, dv: true });
  if (!AC.includes(bq.ac)) bq.ac = defAc();
  tab = "bzf";
  R();
  scrollTo(0, 0);
  const e = $("bp");
  if (e) e.focus();
}
function bzBack() {
  bpi = null;
  bzCancel();
}
function vInf() {
  const D = repD(), pn = sum(rl().filter((t) => !t.dv), (t) => t.a), dvd = sum(S.tx.filter((t) => t.r && t.dv && t.dv.startsWith(mo)), (t) => t.a), op = sum(rlOld(), (t) => t.a), rows = (l) => l.length ? l.map((t) => `<tr><td>${fd(t.d)}</td><td>${esc(lb(t))}${mTag(t)}</td><td>${f(t.a)}</td></tr>`).join("") : '<tr><td colspan="3" class="mut">Nada este mes</td></tr>', sec = (ti, l, a, c) => `<div style="margin-top:16px"><div style="display:flex;justify-content:space-between;font-weight:600"><span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${c};margin-right:6px"></i>${ti}</span><span>${f(a)}</span></div><table><tr><th>Fecha</th><th>Qué es</th><th>Importe</th></tr>${rows(l)}</table></div>`;
  return `<div class="card"><div class="k">Te deben en total</div><div class="big">${f(pn + op)}</div>${dvd ? `<div class="k">Ya te devolvieron ${f(dvd)} en ${D.mn}</div>` : ""}${op ? `<div class="stats s3 dvb" style="margin:12px 0 0;grid-template-columns:1fr 1fr"><div class="stat"><small>De ${D.mn}</small><b style="${pn ? "color:var(--rem)" : ""}">${f(pn)}</b></div><div class="stat"><small>Atrasado</small><b style="color:var(--red)">${f(op)}</b></div></div>` : ""}
${pn + op ? `<button class="b" style="margin-top:10px" onclick="allD()">Me lo devolvieron todo (${f(pn + op)})</button>` : ""}</div>
${UI().pie2 && D.gr.length ? `<div class="card"><h2>Por devolver por categoría</h2>${pie(D.gr.map((g) => [g.c, g.a]), "Por devolver")}</div>` : ""}<div class="card"><p class="lab">Tu nombre (aparece en el informe)</p><input value="${esc(S.uname || "")}" placeholder="Ej. Lucía" onchange="S.uname=this.value.trim();save();R()"></div>
<div id="rep" class="card"><h2 style="font-size:19px;margin-bottom:2px">Pendiente de devolver · ${D.mn}</h2>${S.uname ? `<div class="k">${esc(S.uname)}</div>` : ""}
<div class="bar" style="height:12px;display:flex;margin-top:12px">${D.gr.map((g) => `<i style="width:${g.a / D.tot * 100}%;background:${col(g.c)}"></i>`).join("")}</div><div class="lg">${D.gr.map((g) => `<span style="--c:${col(g.c)}">${g.c} ${f(g.a)}</span>`).join("")}</div>
${D.gr.length ? D.gr.map((g) => sec(g.c, g.l, g.a, col(g.c))).join("") : '<p class="mut" style="margin-top:12px">Nada este mes.</p>'}
<div style="margin-top:16px;padding:12px;border-radius:8px;background:var(--acc);color:#fff;display:flex;justify-content:space-between;font-weight:700"><span>TOTAL</span><span>${f(D.tot)}</span></div></div>
<button class="b" onclick="pdfRep()">PDF de gastos a devolver</button>
<textarea id="rt" rows="8" hidden style="width:100%;margin-top:8px;font:inherit;font-size:13px;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--tx)"></textarea>
<p class="tip hint">El PDF se guarda en tu dispositivo y lo puedes enviar por WhatsApp o correo. Si no se genera, se guarda una página web equivalente.</p>
<div class="card" style="margin-top:14px"><h2>Gasto a gasto</h2>${mvList(rlOld().concat(rl()))}</div>`;
}
function fabD() {
  fab0();
  q.k = "g";
  q.w = "d";
  q.dvf = true;
  q.fxOn = false;
  q.sp = false;
  q.what = "";
  q.n = "";
  q.rac = dAc();
  R();
  const e = $("qa");
  if (e) e.focus();
}
function repTxt() {
  const D = repD(), L2 = (l) => l.length ? l.map((t) => `- ${fd(t.d)} · ${lb(t)} · ${fp(t.a)}`).join("\n") : "- Nada este mes";
  return `Gastos a devolver de ${D.mn}${S.uname ? " (" + S.uname + ")" : ""}

TOTAL: ${fp(D.tot)}
${D.gr.map((g) => g.c + ": " + fp(g.a)).join("\n")}${D.gr.map((g) => "\n\n" + g.c.toUpperCase() + "\n" + L2(g.l)).join("")}`;
}
// iPhone: ventana «listo» para que compartir/abrir se haga con un toque nuevo (el iPhone lo exige)
let fsU = "";
function fileSheet(name, data, ty) {
  const old = document.querySelector(".fsh");
  if (old) old.remove();
  if (fsU) URL.revokeObjectURL(fsU);
  const bl = new Blob([data], { type: ty });
  fsU = URL.createObjectURL(bl);
  window._fsF = new File([bl], name, { type: ty });
  const d = document.createElement("div");
  d.className = "fsh";
  d.innerHTML = `<div class="fsc"><h3>${ic("download", 18)} Tu archivo está listo</h3><p class="mut">${esc(name)}</p><button class="b" onclick="fsShare()">Compartir</button><a class="chip" href="${fsU}" target="_blank" rel="noopener">Abrir el archivo</a><button class="chip" onclick="fsData()">Descargar</button><button class="chip" onclick="this.closest('.fsh').remove()">Cerrar</button><p id="fsSt" class="fsst" hidden></p></div>`;
  d.addEventListener("click", (e) => {
    if (e.target === d) d.remove();
  });
  document.body.appendChild(d);
}
function fsSt(t) {
  const e = $("fsSt");
  if (e) {
    e.hidden = false;
    e.textContent = t;
  }
}
async function fsShare() {
  const f3 = window._fsF;
  if (!navigator.share) {
    fsSt("Este iPhone no permite compartir archivos desde aquí. Usa «Abrir el archivo» o «Descargar».");
    return;
  }
  if (navigator.canShare && !navigator.canShare({ files: [f3] })) {
    fsSt("El iPhone no acepta compartir este tipo de archivo. Usa «Abrir el archivo».");
    return;
  }
  fsSt("Abriendo el menú de Compartir…");
  try {
    await navigator.share({ files: [f3] });
    fsSt("Listo ✓");
  } catch (e) {
    if (e && e.name == "AbortError") {
      fsSt("Cancelado.");
      return;
    }
    fsSt("No se pudo compartir (" + (e && e.name || "error") + ": " + (e && e.message || "") + "). Prueba «Abrir el archivo» o «Descargar».");
  }
}
function fsData() {
  const f3 = window._fsF, rd2 = new FileReader();
  fsSt("Preparando…");
  rd2.onload = () => {
    const a = document.createElement("a");
    a.href = rd2.result;
    a.download = f3.name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
    fsSt("");
    const e = $("fsSt");
    if (e) e.hidden = true;
  };
  rd2.onerror = () => fsSt("No se pudo preparar el archivo.");
  rd2.readAsDataURL(f3);
}
async function dl(name, data) {
  try {
    const d = window.claude && await claude.use("downloads");
    if (d) {
      await d.save({ filename: name, data });
      toast("Archivo listo");
      return;
    }
  } catch (e) {
    if (e && e.code == "declined") return;
  }
  const ty = name.endsWith(".pdf") ? "application/pdf" : name.endsWith(".json") ? "application/json" : name.endsWith(".csv") ? "text/csv" : "text/html", ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.standalone;
  if (ty == "application/pdf") {
    try {
      const u = URL.createObjectURL(new Blob([data], { type: ty })), w = window.open(u, "_blank");
      if (w) {
        setTimeout(() => URL.revokeObjectURL(u), 12e4);
        return;
      }
      URL.revokeObjectURL(u);
    } catch (e) {
    }
    fileSheet(name, data, ty);
    return;
  }
  if (ios) {
    fileSheet(name, data, ty);
    return;
  }
  try {
    const u = URL.createObjectURL(new Blob([data], { type: ty })), a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4e3);
    toast("Archivo descargado");
  } catch (e) {
    toast("Descarga no disponible: usa Compartir");
  }
}
async function shRep() {
  const t = repTxt();
  try {
    if (navigator.share) {
      await navigator.share({ text: t });
      return;
    }
  } catch (e) {
    if (e && e.name == "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(t);
    toast("Texto copiado. Pégalo en un mensaje");
    return;
  } catch (e) {
  }
  const a = $("rt");
  a.hidden = false;
  a.value = t;
  a.select();
  toast("Copia el texto del cuadro");
}
const rgb = (h) => {
  h = String(h);
  if (h.startsWith("var")) h = getComputedStyle(document.documentElement).getPropertyValue("--acc2").trim() || "#1f6f5c";
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
};
function pdfGo(m, b) {
  const s = b.closest(".fsh");
  try {
    pdfRep(m);
  } finally {
    setTimeout(() => {
      if (s && s.isConnected) s.remove();
    }, 0);
  }
}
function pdfAsk() {
  const old = document.querySelector(".fsh");
  if (old) old.remove();
  const mn = (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" }), d = document.createElement("div");
  d.className = "fsh";
  d.innerHTML = `<div class="fsc"><h3>${ic("download", 18)} PDF de ${mn}</h3><button class="b" onclick="pdfGo(1,this)">Todos los gastos<small style="display:block;font-weight:400;opacity:.9;margin-top:2px">Lo gastado, lo que te han devuelto, Bizums y lo pendiente</small></button><button class="b" onclick="pdfGo(2,this)">Solo gastos<small style="display:block;font-weight:400;opacity:.9;margin-top:2px">Solo lo gastado en ${mn}, por categorías, sin devoluciones ni Bizums</small></button><button class="chip" onclick="this.closest('.fsh').remove()">Cancelar</button></div>`;
  d.addEventListener("click", (e) => {
    if (e.target === d) d.remove();
  });
  document.body.appendChild(d);
}
function pdfRep(all) {
  const J = window.jspdf && window.jspdf.jsPDF, D = (() => {
    try {
      return repD(all);
    } catch (e) {
      toast("No se pudo preparar el PDF (" + e.message + ")");
      return null;
    }
  })(), nm2 = (all == 2 ? "solo-gastos-" : all ? "gastos-del-mes-" : "gastos-a-devolver-") + mo;
  if (!D) return;
  try {
    if (!J) throw 0;
    const doc = new J({ unit: "mm", format: "a4" }), W2 = 210, M = 15, ac = [31, 111, 92], am = [201, 138, 18], tx = [29, 42, 38], mu = [107, 119, 114];
    let y;
    doc.setFillColor(...ac);
    doc.rect(0, 0, W2, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text((all == 2 ? "Solo gastos de " : all ? "Todos los gastos de " : "Gastos a devolver de ") + D.mn, M, 17);
    if (S.uname) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(S.uname, M, 26);
    }
    y = 46;
    const bw = (W2 - 2 * M - 8) / 3, bx = [["TOTAL", D.tot, ac]].concat(all == 1 ? [[UI().work ? "DE MI SUELDO" : "DE MI PAGA", D.own, ac], ["ME LO DEVUELVEN", D.rv, rgb("#7b62b3")]] : [], D.gr.map((g) => [g.c, g.a, rgb(col(g.c))]));
    bx.forEach((b, i) => {
      const x = M + i % 3 * (bw + 4), z = y + Math.floor(i / 3) * 24;
      doc.setFillColor(240, 244, 242);
      doc.roundedRect(x, z, bw, 20, 2, 2, "F");
      doc.setFillColor(...b[2]);
      doc.rect(x, z, 1.6, 20, "F");
      doc.setTextColor(...mu);
      doc.setFontSize(8.5);
      doc.text(b[0], x + 5, z + 7);
      doc.setTextColor(...tx);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(fp(b[1]), x + 5, z + 15);
      doc.setFont("helvetica", "normal");
    });
    y += Math.ceil(bx.length / 3) * 24 + 4;
    if (D.tot > 0) {
      let bp = M;
      D.gr.filter((g) => !g.x).forEach((g) => {
        const w = (W2 - 2 * M) * g.a / D.tot;
        doc.setFillColor(...rgb(col(g.c)));
        doc.rect(bp, y, w, 4, "F");
        bp += w;
      });
      y += 12;
    }
    (D.gr.length ? D.gr : [{ c: "Gastos", l: [], a: 0 }]).map((g) => [g.c.toUpperCase(), g.l, g.a, rgb(col(g.c))]).forEach(([ti, l, sub, co]) => {
      if (y > 245) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(...co);
      doc.rect(M, y - 4, 3, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...tx);
      doc.text(ti, M + 6, y);
      doc.text(fp(sub), W2 - M, y, { align: "right" });
      y += 6;
      doc.setFontSize(8.5);
      doc.setTextColor(...mu);
      doc.text("FECHA", M, y);
      doc.text("QUÉ ES", M + 28, y);
      doc.text("IMPORTE", W2 - M, y, { align: "right" });
      y += 2;
      doc.setDrawColor(220, 224, 220);
      doc.line(M, y, W2 - M, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...tx);
      if (!l.length) {
        doc.setTextColor(...mu);
        doc.text("Nada este mes", M, y);
        y += 8;
      }
      l.forEach((t) => {
        const ln = doc.splitTextToSize(lb(t) + (all && t.r ? t.dv ? " (devuelto)" : " (pendiente de que me lo devuelvan)" : ""), W2 - 2 * M - 28 - 34);
        if (y + ln.length * 5 > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(fd(t.d), M, y);
        doc.text(ln, M + 28, y);
        if (t.r && !t.dv && t.d.slice(0, 7) < mo) {
          const mt = (new Date(t.d + "T12:00")).toLocaleDateString("es-ES", { month: "short" }).replace(".", ""), lw = doc.getTextWidth(ln[ln.length - 1]), x0 = M + 28 + lw + 2, ty = y + (ln.length - 1) * 5;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          const tw = doc.getTextWidth(mt) + 3;
          doc.setFillColor(248, 228, 226);
          doc.roundedRect(x0, ty - 3.3, tw, 4.6, 1, 1, "F");
          doc.setTextColor(194, 65, 59);
          doc.text(mt, x0 + 1.5, ty);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(...tx);
        }
        doc.text(fp(t.a), W2 - M, y, { align: "right" });
        y += ln.length * 5 + 2;
        doc.setDrawColor(235, 237, 235);
        doc.line(M, y - 3.5, W2 - M, y - 3.5);
      });
      y += 6;
    });
    if (y > 262) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(...ac);
    doc.roundedRect(M, y, W2 - 2 * M, 16, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL", M + 6, y + 10);
    doc.text(fp(D.tot), W2 - M - 6, y + 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...mu);
    doc.text("Generado con Mi paga el " + fd(today()), M, 290);
    dl(nm2 + ".pdf", doc.output("arraybuffer"));
  } catch (e) {
    const h = '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gastos del mes</title><style>' + document.querySelector("style").textContent + "</style><body><main>" + (all ? '<div class="card"><h2>' + (all == 2 ? "Solo gastos de " : "Todos los gastos de ") + D.mn + "</h2>" + D.gr.map((g) => "<h3>" + g.c + " · " + f(g.a) + "</h3><table>" + g.l.map((t) => "<tr><td>" + fd(t.d) + "</td><td>" + esc(lb(t)) + (t.r ? " (me lo devuelven)" : "") + "</td><td>" + f(t.a) + "</td></tr>").join("") + "</table>").join("") + "<h3>TOTAL " + f(D.tot) + "</h3></div>" : $("rep").outerHTML) + "</main></body></html>";
    dl(nm2 + ".html", h);
  }
}
function ymd(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function addD(s, n) {
  const d = new Date(s + "T12:00");
  d.setDate(d.getDate() + n);
  return ymd(d);
}
function mon(s) {
  const d = new Date(s + "T12:00");
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return ymd(d);
}
let wk = mon(today());
function nw(d) {
  wk = addD(wk, 7 * d);
  sd = null;
  R();
}
function wl() {
  const h = (d) => (new Date(d + "T12:00")).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return h(wk) + " – " + h(addD(wk, 6));
}
function mvList(l) {
  l = l.slice().sort((a, b) => b.d.localeCompare(a.d));
  return l.length ? l.map((t) => `<div class="li"><div class="g" role="button" tabindex="0" onclick="${t.bz ? `bzEd('${t.bz}')` : t.ow ? `oweEd('${t.ow}')` : `edit('${t.id}')`}" title="Tocar para editar">${t.bz ? esc(t.k == "i" ? t.n : t.what) + (t.ot ? " · " + esc(t.ot) : "") : t.k == "i" ? "Dinero extra" : (t.r ? "Te lo devuelven · " : "") + esc(t.c) + (t.ot ? " · " + esc(t.ot) : "") + (t.what ? " · " + esc(t.what) : "") + mTag(t)}<small>${fd(t.d)}${t.ac ? " · " + esc(t.ac) : ""}${!t.bz && t.n ? " · " + esc(t.n) : ""}${t.oc ? " · " + String(t.oa).replace(".", ",") + " " + t.oc : ""}${t.full ? " · tu parte de los " + f(t.full) + " que pagaste" : ""}${t.k == "d" ? " · no cuenta como extra" : ""}</small></div><strong class="${t.k == "i" || t.k == "d" ? "pos" : t.r ? "mut" : "neg"}" style="text-align:right">${t.k == "i" || t.k == "d" ? "+" : "−"}${f0(t.a)}${f2(t.a) ? `<small style="display:block;font-weight:500;color:var(--mut);font-size:12px">${t.k == "i" || t.k == "d" ? "+" : "−"}${f2(t.a)}</small>` : ""}</strong>${t.r ? `<button class="chip" style="padding:4px 10px;font-size:12px;flex:none;${t.dv ? "background:var(--line);color:var(--mut);border-color:var(--line)" : "background:var(--acc);color:#fff;border-color:var(--acc)"}" onclick="tgD('${t.id}')" title="${t.dv ? "Devuelto el " + fd(t.dv) + (t.dac ? " a " + esc(t.dac) : "") : "Toca para marcar como devuelto"}">${t.dv ? "✓ Devuelto" : "Pendiente"}</button>` : ""}${t.bz ? `<button class="x" onclick="go('biz')" aria-label="Ver en Bizum">${ic("pencil", 17)}</button><button class="x" onclick="delB('${t.bz}')" aria-label="Eliminar">${ic("x", 16)}</button>` : `<button class="x" onclick="${t.ow ? `oweEd('${t.ow}')` : `edit('${t.id}')`}" aria-label="Editar">${ic("pencil", 17)}</button><button class="x" onclick="del('${t.id}')" aria-label="Eliminar">${ic("x", 16)}</button>`}</div>`).join("") : '<p class="mut">Nada apuntado.<span class="hint"> Usa el botón + para añadir.</span></p>';
}
function hero(o) {
  const p = o.bud > 0 ? o.spent / o.bud : o.spent > 0 ? 1.01 : 0, cls = o.left < 0 ? "over" : p >= 0.8 ? "warn" : "ok";
  return `<div class="hero ${cls}"><div class="l">${o.lab}</div><div class="n">${f0(o.show != null ? o.show : o.left)}</div>${f2(o.left) ? `<div style="margin:-10px 0 12px;font-weight:600;opacity:.85">≈ ${f2(o.show != null ? o.show : o.left)}</div>` : ""}<div class="hb" role="img" aria-label="${Math.round(p * 100)}% gastado"><i style="width:${Math.min(100, Math.max(0, p * 100))}%"></i></div><div class="hr" style="grid-template-columns:repeat(${o.tiles.length},1fr)">${o.tiles.map((t) => `<div><small>${t[0]}</small><b>${t[1]}</b></div>`).join("")}</div>${o.msg ? `<div class="m">${o.msg}</div>` : ""}</div>`;
}
function stats(exl, a, b, rv) {
  const bz = bzV().filter((x) => x.t != "deb" && x.d >= a && x.d <= b), be = sum(bz.filter((x) => x.t == "env"), (x) => x.a), br = sum(bz.filter((x) => x.t == "rec" && !x.cp), (x) => x.a), xe = rnd(sum(exl, (t) => t.a));
  return boxRow(a, b, be, br, xe) + owedCard(a, b, 1);
}
// Fila de recuadros común a Día, Semana y Mes: mismo orden en todas las vistas
function boxRow(from, to, be, br, xe, st) {
  const bt = bzTot(to), bd = bt.d, bo = bt.o;
  return `<div class="stats bzbox"><p class="lab">Bizums</p><div class="stats s3 b4" style="margin:0;grid-template-columns:repeat(4,1fr)"><div class="stat"${tabOk("biz") ? ` role="button" onclick="go('biz')"` : ""}><small>Me deben</small><b style="${bd ? "color:var(--rem)" : ""}">${f(bd)}</b></div><div class="stat"${tabOk("biz") ? ` role="button" onclick="go('biz')"` : ""}><small>Debo</small><b class="${bo ? "neg" : ""}">${f(bo)}</b></div><div class="stat"><small>Hechos</small><b class="${be ? "neg" : ""}">${f(-be)}</b></div><div class="stat"><small>Recibidos</small><b class="${br ? "pos" : ""}">${br ? "+" : ""}${f(br)}</b></div></div></div><div class="stats xtr"${st ? ` style="${st}"` : ""}><div class="stat"><small>Dinero extra</small><b class="${xe ? "pos" : ""}">${xe ? "+" : ""}${f(xe)}</b></div></div>`;
}
function owedCard(a, b, nb) {
  const l = S.tx.filter((t) => t.r && t.d >= a && t.d <= b), pn = sum(l.filter((t) => !t.dv), (t) => t.a), dv = sum(l.filter((t) => t.dv), (t) => t.a), bd = bzTot(b).d, at = rnd(sum(S.tx.filter((t) => t.r && !t.dv && t.d < a), (t) => t.a)), lk = tabOk("inf"), lb2 = tabOk("biz");
  return `<div class="card owe"><p class="lab">Dinero que te deben</p><div class="stats s3" style="margin:0"><div class="stat"${lk ? ` role="button" onclick="go('inf')"` : ""}><small>Devolver pendiente</small><b style="${pn ? "color:var(--rem)" : ""}">${f(pn)}</b></div><div class="stat"${lk ? ` role="button" onclick="go('inf')"` : ""}><small>Devuelto</small><b class="${dv ? "pos" : ""}">${f(dv)}</b></div><div class="stat atb"${lk ? ` role="button" onclick="go('inf')"` : ""}><small>Atrasado sin pagar</small><b style="${at ? "color:var(--red)" : ""}">${f(at)}</b></div>${nb ? "" : `<div class="stat"${lb2 ? ` role="button" onclick="go('biz')"` : ""}><small>Bizums que me deben</small><b style="${bd ? "color:var(--rem)" : ""}">${f(bd)}</b></div>`}</div></div>`;
}
// Mes actual con cuentas puestas: «Te queda», «Por devolver» y «Realmente» salen de Cuentas (mismas cifras en toda la app)
const acM = (m) => m == cm() && Object.keys(S.acc || {}).length > 0;
function mHero(m) {
  if (m < first()) return `<div class="card"><p class="mut" style="margin:0">Todavía no usabas la app en ${(new Date(m + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" })}, así que este mes no cuenta ni la paga ni el ahorro.</p></div>`;
  const i = inc(m), g = exp(m), sv = S.meta || 0, bud = rnd(i - sv), left = rnd(bud - g), mn = (new Date(m + "-01T12:00")).toLocaleDateString("es-ES", { month: "long" });
  if (!i) return `<div class="card"><div class="k">Gastado en ${mn}</div><div class="big neg">${f(-g)}</div><div class="tip hint">Indica tu ${W("sueldo", "paga")} en Ajustes para ver cuánto te queda.</div></div>`;
  if (acM(m)) {
    const tot = sum(AC, bal), od = sum(AC, owed), oe = sum(AC, owe), rl2 = rnd(tot + od - oe), neg = (v) => v < 0 ? `<span style="color:var(--red)">${f(v)}</span>` : f(v);
    const w2 = od + oe > 0 && rl2 < 0 ? "<div>\u26A0 Aunque te devuelvan lo pendiente, te pasas " + f0(-rl2) + ".</div>" : od > 0 && tot < 0 ? "<div>Ahora estás en negativo, pero cuando te devuelvan lo pendiente te quedarán " + f0(rl2) + ".</div>" : "";
    return hero({ lab: "Gastado en " + mn, left, show: g, spent: g, bud, tiles: [["Te queda", neg(tot)]].concat(od + oe > 0 ? [["Por devolver", f(od)], ["Realmente", neg(rl2)]] : [], sv ? [["Puedes gastar", f(bud)]] : []), msg: (sv ? "<div>Tu " + W("sueldo", "paga") + " " + f0(i) + " − " + f0(sv) + " para ahorrar = <b>" + f0(bud) + "</b> para gastar.</div>" : "") + (oe > 0 ? "<div>En «Realmente» ya está restado lo que debes: " + f0(oe) + ".</div>" : "") + w2 });
  }
  const pn = m == mo ? pend() : 0, real = rnd(left + pn), warn = pn > 0 && real < 0 ? "<div>\u26A0 Aunque te devuelvan lo pendiente, te pasas " + f0(-real) + ".</div>" : pn > 0 && left < 0 ? "<div>Ahora estás pasado, pero cuando te devuelvan lo pendiente te quedarán " + f0(real) + ".</div>" : "";
  return hero({ lab: "Gastado en " + mn, left, show: g, spent: g, bud, tiles: [[left < 0 ? "Te has pasado" : "Te queda", f(Math.abs(left))]].concat(pn > 0 ? [["Por devolver", f(pn)], ["Realmente", real < 0 ? `<span style="color:var(--red)">${f(real)}</span>` : f(real)]] : [], sv ? [["Puedes gastar", f(bud)]] : []), msg: (sv ? "<div>Tu " + W("sueldo", "paga") + " " + f0(i) + " − " + f0(sv) + " para ahorrar = <b>" + f0(bud) + "</b> para gastar.</div>" : "") + warn });
}
function perCard(title, from, to, extra) {
  const l = ALL().filter((t) => t.d >= from && t.d <= to), sp = spend(l), g = sp.g, bz = bzV().filter((x) => x.t != "deb" && x.d >= from && x.d <= to), be = sum(bz.filter((x) => x.t == "env"), (x) => x.a), br = sum(bz.filter((x) => x.t == "rec" && !x.cp), (x) => x.a), xe = rnd(sum(l.filter((t) => t.k == "i" && !t.bz), (t) => t.a));
  return `<div class="card"><h2>${title}</h2>${boxRow(from, to, be, br, xe, "margin:0")}${extra || ""}</div>`;
}
let sd = null;
function dayDetail(d, close) {
  const td = today(), w = (new Date(d + "T12:00")).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return `<div id="dday" style="scroll-margin-top:70px">` + perCard(`<span style="display:flex;justify-content:space-between;align-items:center;gap:8px">${d == td ? "Hoy · " : ""}${w}${close || d != td ? `<button class="chip" style="padding:6px 12px;font-size:13px" onclick="sd=null;R()">${close ? "Cerrar" : "Volver a hoy"}</button>` : ""}</span>`, d, d, `<p class="lab" style="margin-top:12px">Movimientos</p>${mvList(ALL().filter((t) => t.d == d))}`) + `</div>`;
}
let ivx = null;
const INVT = ["Fondo indexado", "Acciones", "ETF", "Cripto", "Plan de pensiones", "Depósito o letras", "Otro"];
const invV = (x) => {
  const h = (x.h || []).slice().sort((a, b) => a.d.localeCompare(b.d));
  return h.length ? h[h.length - 1].v : 0;
}, invA = (x) => sum(x.ap || [], (y) => y.a);
function invAt(x, d) {
  let v = null;
  (x.h || []).slice().sort((a, b) => a.d.localeCompare(b.d)).forEach((y) => {
    if (y.d <= d) v = y.v;
  });
  return v == null ? 0 : v;
}
function invAdd() {
  const n = clean($("ivn").value), a = rnd(parseFloat($("iva").value)), v0 = parseFloat($("ivv").value), d = $("ivd").value || today();
  if (!n) {
    toast("Escribe un nombre");
    $("ivn").focus();
    return;
  }
  if (!(a > 0)) {
    toast("Pon cuánto has invertido");
    $("iva").focus();
    return;
  }
  const v = v0 >= 0 ? rnd(v0) : a;
  S.inv = S.inv || [];
  S.inv.push({ id: uid(), n, t: $("ivt").value, ap: [{ d, a }], h: [{ d, v }] });
  save();
  R();
  toast("Inversión añadida");
}
function invUpd(id) {
  const x = (S.inv || []).find((y) => y.id == id), v = parseFloat($("ivu" + id).value);
  if (!x || !(v >= 0)) {
    toast("Escribe cuánto vale ahora");
    return;
  }
  const d = today();
  x.h = (x.h || []).filter((y) => y.d != d);
  x.h.push({ d, v: rnd(v) });
  save();
  R();
  toast("Valor actualizado");
}
function invAp(id) {
  const x = (S.inv || []).find((y) => y.id == id), a = rnd(parseFloat($("ivp" + id).value));
  if (!x || !(a > 0)) {
    toast("Escribe cuánto has añadido");
    return;
  }
  const d = today(), cur = invV(x);
  x.ap.push({ d, a });
  x.h = (x.h || []).filter((y) => y.d != d);
  x.h.push({ d, v: rnd(cur + a) });
  save();
  R();
  toast("Aportación guardada");
}
function invDel(id) {
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  S.inv = (S.inv || []).filter((y) => y.id != id);
  ivx = null;
  save();
  R();
  toast("Inversión borrada", 1);
}
function invChart(list) {
  const ds = [...new Set(list.flatMap((x) => (x.h || []).map((y) => y.d).concat((x.ap || []).map((y) => y.d))))].sort();
  if (ds.length < 2) return '<p class="mut hint" style="font-size:13px">Cuando actualices el valor otro día verás aquí cómo evoluciona.</p>';
  const vs = ds.map((d) => sum(list, (x) => invAt(x, d))), as = ds.map((d) => sum(list, (x) => sum((x.ap || []).filter((y) => y.d <= d), (y) => y.a))), mn = Math.min(...vs, ...as) * 0.97, mx = Math.max(...vs, ...as) * 1.03 || 1, t0 = new Date(ds[0]).getTime(), t1 = new Date(ds[ds.length - 1]).getTime() || t0 + 1, X = (d) => 8 + (new Date(d).getTime() - t0) / (t1 - t0 || 1) * 284, Y = (v) => 108 - (v - mn) / (mx - mn || 1) * 96, pv = ds.map((d, i) => `${X(d)},${Y(vs[i])}`).join(" "), pa = ds.map((d, i) => `${X(d)},${Y(as[i])}`).join(" "), up = vs[vs.length - 1] >= as[as.length - 1], lc = up ? "var(--grn)" : "var(--red)";
  return `<svg viewBox="0 0 300 125" width="100%" role="img" aria-label="Evolución del valor"><polygon points="${X(ds[0])},110 ${pv} ${X(ds[ds.length - 1])},110" fill="${lc}" opacity=".12"/><polyline points="${pa}" fill="none" stroke="var(--mut)" stroke-width="1.5" stroke-dasharray="4 3"/><polyline points="${pv}" fill="none" stroke="${lc}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="${X(ds[ds.length - 1])}" cy="${Y(vs[vs.length - 1])}" r="3.5" fill="${lc}"/><text x="8" y="122" font-size="9" fill="var(--mut)">${fd(ds[0])}</text><text x="292" y="122" font-size="9" text-anchor="end" fill="var(--mut)">${fd(ds[ds.length - 1])}</text></svg><div class="lg"><span style="--c:${lc}">Lo que vale</span><span style="--c:var(--mut)">Lo que has metido</span></div>`;
}
function vInv() {
  const L2 = S.inv || [], v = sum(L2, invV), a = sum(L2, invA), g = rnd(v - a), pc = a ? g / a * 100 : 0, gc = g >= 0 ? "pos" : "neg", sg = g >= 0 ? "+" : "";
  return `<div class="card"><div class="k">Valor de tus inversiones</div><div class="big">${f(v)}</div><div class="k" style="margin-top:4px">Has metido ${f(a)} · <b class="${gc}">${sg}${f(g)} (${sg}${pc.toFixed(1).replace(".", ",")} %)</b></div>${L2.length ? `<div style="margin-top:12px">${invChart(L2)}</div>` : ""}</div>
${L2.length ? `<div class="card"><h2>Tus inversiones</h2>${L2.map((x) => {
    const xv = invV(x), xa = invA(x), xg = rnd(xv - xa), xp = xa ? xg / xa * 100 : 0, o = ivx == x.id, s2 = xg >= 0 ? "+" : "";
    return `<div class="li" style="cursor:pointer" onclick="ivx=ivx=='${x.id}'?null:'${x.id}';R()"><div class="g">${esc(x.n)}<small>${esc(x.t)} · metido ${f(xa)}</small></div><div style="text-align:right"><strong>${f(xv)}</strong><small class="${xg >= 0 ? "pos" : "neg"}" style="display:block;font-weight:700">${s2}${xp.toFixed(1).replace(".", ",")} %</small></div></div>${o ? `<div style="padding:4px 0 14px">${invChart([x])}<div class="grid" style="margin-top:10px"><div><p class="lab">¿Cuánto vale hoy?</p><div style="display:flex;gap:6px"><input id="ivu${x.id}" type="number" inputmode="decimal" step="0.01" min="0" placeholder="${xv}" style="min-width:0"><button class="chip on" onclick="invUpd('${x.id}')">Guardar</button></div></div><div><p class="lab">He metido más</p><div style="display:flex;gap:6px"><input id="ivp${x.id}" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0" style="min-width:0"><button class="chip on" onclick="invAp('${x.id}')">Añadir</button></div></div></div><button class="chip" style="width:100%;margin-top:10px;color:var(--red)" onclick="invDel('${x.id}')">Borrar esta inversión</button></div>` : ""}`;
  }).join("")}</div>` : ""}
<div class="card"><h2>Añadir inversión</h2><div class="grid"><input id="ivn" list="ivl" placeholder="Nombre (ej. MSCI World)"><datalist id="ivl">${["Fondo indexado MSCI World", "Fondo S&P 500", "Bitcoin", "Ethereum", "Plan de pensiones", "Letras del Tesoro", "Depósito"].map((n) => `<option value="${n}">`).join("")}</datalist><select id="ivt">${INVT.map((t) => `<option>${t}</option>`).join("")}</select><input id="iva" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Dinero metido"><input id="ivv" type="number" inputmode="decimal" step="0.01" min="0" placeholder="${hOn() ? "Vale ahora (opcional)" : "Vale ahora"}"></div><p class="lab" style="margin-top:10px">Fecha</p><input id="ivd" type="date" value="${today()}"><button class="b" style="margin-top:10px" onclick="invAdd()">Añadir inversión</button><p class="mut hint" style="font-size:13px;margin-top:8px">Los valores los pones tú. Actualízalos cuando quieras (por ejemplo, una vez al mes) para ver la evolución. No afecta a tu paga ni a tus cuentas.</p></div>`;
}
let dday = today();
function nd(n) {
  dday = addD(dday, n);
  R();
}
// Gastado de un día = cuánto sube el «Gastado» del mes ese día (misma cuenta que el mes, así los días suman siempre el mes)
function dSpent(d) {
  const m = d.slice(0, 7), l = ALL().filter((t) => t.d.startsWith(m) && t.d <= d);
  return rnd(spend(l).g - spend(l.filter((t) => t.d < d)).g);
}
function dStrip() {
  const m0 = mon(dday), td = today();
  return `<div class="dstrip" role="group" aria-label="Días de la semana">${[...Array(7)].map((_, i) => {
    const d = addD(m0, i), v = dSpent(d);
    return `<button class="${d == dday ? "on " : ""}${d == td ? "td " : ""}${d > td ? "fu" : ""}" onclick="dday='${d}';R()" aria-label="${(new Date(d + "T12:00")).toLocaleDateString("es-ES", { weekday: "long", day: "numeric" })}${v ? ", " + f(v) : ""}"><small>${"LMXJVSD"[i]}</small><b>${+d.slice(8)}</b><i class="${v > 0 ? "s" : ""}">${v > 0 ? Math.round(v) + " " + sym() : d > td ? "" : "—"}</i></button>`;
  }).join("")}</div>`;
}
function dayPie(d) {
  if (!UI().pie) return "";
  const c = spend(ALL().filter((t) => t.d == d)).c;
  return Object.keys(c).length ? `<div class="card"><h2>Gastos por categoría</h2>${pie(Object.entries(c), "Gastado este día")}</div>` : "";
}
function vDia() {
  const d = dday, td = today(), w = (new Date(d + "T12:00")).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }), mv = ALL().filter((t) => t.d == d);
  return dStrip() + mHero(d.slice(0, 7)) + perCard(`<span style="display:flex;justify-content:space-between;align-items:center;gap:8px">${d == td ? "Hoy · " : ""}${w}${d != td ? `<button class="chip" style="padding:6px 12px;font-size:13px" onclick="dday=today();R()">Ir a hoy</button>` : ""}</span>`, d, d, mv.length ? `<p class="lab" style="margin-top:12px">Movimientos</p>${mvList(mv)}` : `<div style="text-align:center;padding:16px 0 4px"><p class="mut" style="margin-bottom:12px">${d > td ? "Este día todavía no ha llegado." : "No hay nada apuntado este día."}</p><button class="b" onclick="fab()">Apuntar gasto de este día</button></div>`) + dayPie(d);
}
function pickD(x) {
  if (tab == "sem") {
    dday = x;
    setV("dia");
    return;
  }
  sd = x;
  R();
  const e = $("dday");
  if (e) e.scrollIntoView({ behavior: "smooth", block: "start" });
}
function vSem() {
  const days = [...Array(7)].map((_, i) => addD(wk, i)), ws = ALL().filter((t) => t.d >= days[0] && t.d <= days[6]), g = spend(ws).g, rv = sum(ws.filter((t) => t.r), (t) => t.a), ex = sum(ws.filter((t) => t.k == "i"), (t) => t.a), dd = days.map((d) => Math.max(0, dSpent(d))), rd2 = days.map((d) => sum(ws.filter((t) => t.r && t.d == d), (t) => t.a)), m0 = days[0], dim = new Date(+m0.slice(0, 4), +m0.slice(5, 7), 0).getDate(), ideal = S.paga ? Math.max(0, S.paga - (S.meta || 0)) / dim : 0, mx = Math.max(1, ideal, ...dd, ...rd2), td = today(), wb = ideal * 7, cs = {};
  Object.assign(cs, spend(ws).c);
  const cx = Math.max(1, ...Object.values(cs));
  return `${mHero((today() >= days[0] && today() <= days[6] ? today() : days[3]).slice(0, 7))}${perCard(days.includes(today()) ? "Esta semana" : "Semana del " + wl(), days[0], days[6])}${owedCard(days[0], days[6], 1)}
<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px"><button class="x" onclick="nw(-1)" aria-label="Semana anterior">${ic("left", 20)}</button><h2 style="margin:0;text-align:center">Día a día<small class="mut" style="display:block;font-size:13px;font-weight:400;margin-top:2px">${wl()}</small></h2><button class="x" onclick="nw(1)" aria-label="Semana siguiente">${ic("right", 20)}</button></div>${(() => {
    window.dS = sd && days.includes(sd) ? sd : td;
    return "";
  })()}<svg viewBox="0 0 300 138" width="100%" role="img" aria-label="Gasto por día de la semana">${dd.map((v, i) => {
    const h = v / mx * 85, x = i * 41 + 6;
    return `<rect x="${x}" y="${100 - h}" width="19" height="${h}" rx="3" fill="var(--acc)" opacity="${days[i] == dS ? 1 : 0.45}"/>${rd2[i] ? `<rect x="${x + 21}" y="${100 - rd2[i] / mx * 85}" width="12" height="${rd2[i] / mx * 85}" rx="3" fill="var(--rem)" opacity="${days[i] == dS ? 1 : 0.6}"/>` : ""}${v ? `<text x="${x + 9}" y="${95 - h}" font-size="9" text-anchor="middle" fill="var(--tx)">${Math.round(v)}</text>` : ""}<text x="${x + 16}" y="116" font-size="11" text-anchor="middle" font-weight="${days[i] == dS ? 700 : 400}" fill="${days[i] == dS ? "var(--acc)" : "var(--mut)"}">${"LMXJVSD"[i]}</text><text x="${x + 16}" y="131" font-size="11" text-anchor="middle" font-weight="${days[i] == dS ? 700 : 400}" fill="${days[i] == dS ? "var(--acc)" : "var(--tx)"}">${+days[i].slice(8)}</text><rect x="${x - 5}" y="0" width="41" height="136" fill="transparent" style="cursor:pointer" onclick="pickD('${days[i]}')"><title>Ver ${"LMXJVSD"[i]}</title></rect>`;
  }).join("")}</svg><p class="mut hint" style="font-size:13px;margin-top:4px">Toca un día para verlo en detalle.</p><div class="lg"><span style="--c:var(--acc)">${W("De tu sueldo", "De tu paga")}</span><span style="--c:var(--rem)">De eso, te lo devuelven</span></div></div>
${UI().pie && Object.keys(cs).length ? `<div class="card"><h2>Gastos por categoría</h2>${pie(Object.entries(cs), "Gastado esta semana")}</div>` : ""}<div class="card"><h2>En qué has gastado</h2>${Object.keys(cs).length ? CATS.filter((c) => cs[c]).map((c) => `<div class="m"><span>${c}</span><div class="bar"><i style="width:${cs[c] / cx * 100}%;background:${col(c)}"></i></div><span>${f(cs[c])}</span></div>`).join("") : '<p class="mut">Nada esta semana.</p>'}</div>
<div class="card"><h2>Movimientos de la semana</h2>${mvList(ws)}</div>`;
}
function rd() {
  ["a", "d", "n"].forEach((k) => {
    const e = $("q" + k);
    if (e) q[k] = e.value;
  });
  const qc = $("qcur");
  if (qc) q.cur = qc.value;
  const qx = $("qfx");
  if (qx) q.fx = qx.value;
  const w = $("qwh");
  if (w) q.what = w.value;
  const ot = $("qot");
  if (ot) q.ot = ot.value;
  const n = $("qsn");
  if (n) q.sn = n.value;
  const nm2 = $("qsnm");
  if (nm2) q.snm = nm2.value;
  if (q.rows) q.rows.forEach((r, i) => {
    const p = $("qrp" + i), a = $("qra" + i);
    if (p) r.p = p.value;
    if (a) r.a = a.value;
  });
}
function spForm() {
  const m = q.sm || "eq";
  return `<div class="chips"><button class="chip ${m == "eq" ? "on" : ""}" onclick="rd();q.sm='eq';R()">A partes iguales</button><button class="chip ${m == "df" ? "on" : ""}" onclick="rd();q.sm='df';q.rows=(q.rows||[]).filter(r=>r.p||r.a);R()">Cada uno una cantidad</button></div>
${m == "eq" ? `<div style="margin-bottom:8px"><p class="lab">Nombres de los demás<span class="req">*</span></p><div class="spn2"><input id="spq" class="srch" placeholder="Nombre" autocomplete="off" autocorrect="off" enterkeyhint="done" oninput="spQ(this.value)" onkeydown="if(event.key=='Enter'){event.preventDefault();spNew(this.value)}" aria-label="Buscar o escribir un nombre">${spMore()}</div></div><div id="spS">${spSug("")}</div>${spTags()}` : `<p class="lab">Quién te debe y cuánto<span class="req">*</span></p><div class="spn2 spdf"><input id="spq" class="srch" placeholder="Nombre" autocomplete="off" autocorrect="off" enterkeyhint="done" oninput="spQ(this.value)" onkeydown="if(event.key=='Enter'){event.preventDefault();spNew(this.value)}" aria-label="Buscar o escribir un nombre">${spMore()}</div><div id="spS">${spSug("")}</div>${(q.rows || []).map((r, i) => `<div class="spr">${r.p ? `<span class="spnm">${esc(r.p)}</span>` : `<input id="qrp${i}" placeholder="Nombre" value="" style="flex:1;min-width:0">`}<input id="qra${i}" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00 €" value="${esc(r.a)}" style="width:110px" oninput="rd();spInfo()" aria-label="Lo que debe ${esc(r.p)}"><button class="x" onclick="rd();q.rows.splice(${i},1);R()" aria-label="Quitar persona">${ic("x", 16)}</button></div>`).join("")}`}
<div id="spi" class="al" style="margin-bottom:10px">${spTxt()}</div>`;
}
function spCalc() {
  const a = rnd(parseFloat(q.a));
  if (!(a > 0)) return null;
  if ((q.sm || "eq") == "eq") {
    const nm2 = [...new Set((q.snm || "").split(",").map(clean).filter(Boolean))], n = nm2.length + 1;
    if (n < 2) return null;
    const each = rnd(a / n);
    return { a, mine: rnd(a - each * (n - 1)), list: nm2.map((p) => ({ p, a: each })) };
  }
  const list = (q.rows || []).map((r, i) => ({ p: clean(r.p) || "Persona " + (i + 2), a: rnd(parseFloat(r.a)) })).filter((r) => r.a > 0);
  if (!list.length) return null;
  const mine = rnd(a - sum(list, (r) => r.a));
  return mine < 0 ? { err: 1, a, list, mine } : { a, list, mine };
}
function spTxt() {
  const c = spCalc();
  if (!c) return (q.sm || "eq") == "eq" ? rnd(parseFloat(q.a)) > 0 ? "Añade los nombres de los demás." : "Escribe el importe total y añade los nombres de los demás." : "Escribe el importe total y lo que te debe cada persona.";
  if (c.err) return "Lo que te deben (" + f(sum(c.list, (r) => r.a)) + ") es más que el total. Revisa las cantidades.";
  const o = sum(c.list, (r) => r.a);
  return `${(q.sm || "eq") == "eq" ? "Sois <b>" + (c.list.length + 1) + "</b> contándote a ti. " : ""}Tu parte: <b>${f(c.mine)}</b>. Te deben <b>${f(o)}</b> entre ${c.list.length} ${c.list.length == 1 ? "persona" : "personas"}.`;
}
function spFromB() {
  const b = bzPt || "biz";
  fab0();
  pt = b;
  q.k = "g";
  q.w = "p";
  q.sp = true;
  q.spf = true;
  q.sm = q.sm || "eq";
  R();
  const e = $("qa");
  if (e) e.focus();
}
function spBack(k) {
  rd();
  q.spf = false;
  q.sp = false;
  bze = null;
  bq.t = k;
  tab = "bzf";
  R();
}
function vSpf() {
  return `<button class="chip" onclick="cancelE()" style="margin-bottom:10px">${ic("left", 16)} Volver</button><div class="card"><h2>Apuntar</h2><div class="chips">${[["env", "Hice un Bizum"], ["rec", "Me hicieron un Bizum"], ["deb", "Me deben"], ["owe", "Debo"], ["spl", "Pagué por varios"]].map(([k, v]) => `<button class="chip ${k == "spl" ? "on" : ""}" onclick="${k == "spl" ? "" : `spBack('${k}')`}">${v}</button>`).join("")}</div>
<p class="tip hint" style="margin:-2px 0 12px">Pagaste tú un gasto de varios: se resta entero de tu cuenta, cuenta solo tu parte como gasto y lo de los demás pasa a «Me deben».</p>
<p class="lab">Importe total que pagaste<span class="req">*</span></p><input id="qa" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${q.a}" style="font-size:22px;margin-bottom:10px" oninput="rd();spInfo()">
<p class="lab">Categoría</p>${catChips("c")}${subF(q.c)}
${needW() ? `<p class="lab">¿Qué es? (obligatorio)</p><input id="qwh" placeholder="Ej. cena de cumpleaños…" value="${esc(q.what)}" style="margin-bottom:10px">` : ""}
${spForm()}
<p class="lab">Desde qué cuenta</p><div class="chips">${AC.map((a) => `<button class="chip ${q.ac == a ? "on" : ""}" data-a="${esc(a)}" onclick="sq('ac',this.dataset.a)">${esc(a)}</button>`).join("")}</div>
<div class="grid" style="margin-bottom:12px"><div><p class="lab">Fecha</p><input id="qd" type="date" value="${q.d || today()}"></div><div><p class="lab">Nota<span class="hint opt"> (opcional)</span></p><input id="qn" placeholder="${hOn() ? "Opcional" : ""}" value="${esc(q.n)}"></div></div>
<button class="b" onclick="add()">Guardar</button></div>`;
}
function spInfo() {
  const e = $("spi");
  if (e) e.innerHTML = spTxt();
}
function sq(k, v) {
  rd();
  q[k] = v;
  R();
}
// Formulario corto de «Devolver»: pagas tú algo y luego te lo devuelven (no es un Bizum)
// Botones de categoría con el color de cada categoría (flojo sin elegir, fuerte elegido)
// Iconos de línea, mismo estilo que la barra de pestañas
const IP = { pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', eyeoff: '<path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c6.4 0 10 8 10 8a17.8 17.8 0 0 1-2.2 3.2M6.6 6.6C3.9 8.4 2 12 2 12s3.6 8 10 8a9.9 9.9 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="m2 2 20 20"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', cloud: '<path d="M17.5 19H7a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 11a4 4 0 0 1-1.5 8Z"/>', alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>', star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z"/>', bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/>', coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>', card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>', save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>', pin: '<path d="M12 17v5"/><path d="M9 3h6l-1 7 4 3v2H6v-2l4-3Z"/>', phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>', undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>', hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>', play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>', refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>' };
const ic = (n, s, f3) => `<svg class="ico" viewBox="0 0 24 24" width="${s || 16}" height="${s || 16}" fill="${f3 ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n]}</svg>`;
// «Otros» repetido: a la tercera vez se ofrece crear la categoría de forma fija
function otCount(v) {
  const n = nrm(String(v || "").trim());
  if (!n) return 0;
  return S.tx.filter((t) => t.id != q.id && t.c == "Otros" && nrm(t.ot || "") == n).length + (S.bz || []).filter((x) => x.id != bze && x.cat == "Otros" && nrm(x.ot || "") == n).length;
}
function otSugH(v, w) {
  v = String(v || "").trim();
  if (!v || EC.some((c) => nrm(c) == nrm(v))) return "";
  const k = otCount(v);
  return k >= 2 ? `<div class="otsg"><span>Ya has puesto «${esc(v)}» ${k} veces en Otros.</span><button class="chip on" onclick="otMake('${w}')">+ Crear la categoría «${esc(clean(v))}»</button></div>` : "";
}
function otS(w, v) {
  const e = $(w == "b" ? "otSb" : "otSq");
  if (e) e.innerHTML = otSugH(v, w);
}
function otMake(w) {
  if (w == "b") brd();
  else rd();
  const n = clean(w == "b" ? bq.ot : q.ot);
  if (!catOk(n)) return;
  const used = S.cats.map((x) => x.c), c = PAL.find((x) => !used.includes(x)) || PAL[S.cats.length % PAL.length], io = S.cats.findIndex((x) => x.n == "Otros");
  S.cats.splice(io < 0 ? S.cats.length : io, 0, { n, c });
  let m = 0;
  S.tx.forEach((t) => {
    if (t.c == "Otros" && nrm(t.ot || "") == nrm(n)) {
      t.c = n;
      t.ot = "";
      m++;
    }
  });
  (S.bz || []).forEach((x) => {
    if (x.cat == "Otros" && nrm(x.ot || "") == nrm(n)) {
      x.cat = n;
      delete x.ot;
      m++;
    }
  });
  catSync();
  if (w == "b") {
    bq.cat = n;
    bq.ot = "";
  } else {
    if (q.w == "d") q.rc = n;
    else q.c = n;
    q.ot = "";
  }
  save();
  R();
  toast("Categoría «" + n + "» creada" + (m ? ". " + m + (m == 1 ? " movimiento pasa" : " movimientos pasan") + " a ella" : ""));
}
// La categoría es obligatoria cuando el dinero que vuelve no está enlazado a ningún gasto: así sabemos de qué categoría restarlo
function bzNeedCat(p, a) {
  const ex = bze && S.bz.find((y) => y.id == bze);
  if (ex && (ex.g || ex.rr)) return false;
  if (bq.t == "deb") return !(bq.pg !== false && bq.lkt && (bq.lk || "").startsWith("g:"));
  if (bq.t != "rec" || bq.dv === false) return false;
  const lk = bq.lkt ? bq.lk || "" : autoLk(p || bq.p, a || bq.a);
  if (!lk) return true;
  if (lk.startsWith("d:")) {
    const d = S.bz.find((y) => y.id == lk.slice(2));
    return !!(d && !d.g && !d.cat);
  }
  return false;
}
// ---------- Buscador de movimientos ----------
let busV = "", busPt = "res";
// Búsqueda en la cabecera (se abre donde va el mes, con animación)
let srOn = false;
function srOpen() {
  srOn = true;
  if (tab == "pre") prOn = true;
  else {
    if (tab != "bus") busPt = tab;
    edOn = false;
    tab = "bus";
  }
  R();
  scrollTo(0, 0);
  const e = $("hsq");
  if (e) {
    e.value = tab == "pre" ? prQ : busV;
    e.focus();
    e.setSelectionRange(e.value.length, e.value.length);
  }
}
function srIn(v) {
  if (tab == "pre") prF(v);
  else busQ(v);
}
function srClose() {
  const h = $("hs");
  if (h) h.classList.add("out");
  setTimeout(() => {
    srOn = false;
    if (h) h.classList.remove("out");
    if (tab == "pre") {
      prOn = false;
      prQ = "";
      R();
    } else if (tab == "bus") busBack();
    else R();
    const n = $("hn");
    if (n) {
      n.classList.remove("hnin");
      void n.offsetWidth;
      n.classList.add("hnin");
    }
  }, 170);
}
function srSync() {
  if (tab == "bus") srOn = true;
  if (srOn && !(tab == "bus" || tab == "pre" && prOn)) srOn = false;
  const h = $("hs"), n = $("hn"), b = $("srb"), e = $("edb"), r0 = $("hr0");
  if (!h) return;
  const was = !h.hidden;
  h.hidden = !srOn;
  n.hidden = srOn;
  r0.classList.toggle("srch-on", srOn);
  if (srOn) {
    b.hidden = true;
    e.hidden = true;
    const q2 = $("hsq");
    q2.placeholder = tab == "pre" ? "Buscar ajuste: tema, paga, copia…" : "Mercadona, Ana, pizza, 12,50…";
    if (!was) {
      q2.value = tab == "pre" ? prQ : busV;
      h.classList.remove("in");
      void h.offsetWidth;
      h.classList.add("in");
    }
  }
}
function busGo() {
  srOpen();
}
function busGoOld() {
  if (tab != "bus") busPt = tab;
  edOn = false;
  tab = "bus";
  R();
  scrollTo(0, 0);
  const e = $("busq");
  if (e) {
    e.focus();
    e.setSelectionRange(e.value.length, e.value.length);
  }
}
function busBack() {
  tab = busPt || "res";
  R();
  scrollTo(0, 0);
}
function busTxt(t) {
  const x = t.bz && S.bz.find((y) => y.id == t.bz);
  return nrm([t.c, t.ot, t.what, t.n, t.ac, x && x.p, x && x.c, t.k == "i" ? "dinero extra" : "", t.r ? "me lo devuelven" : "", f0(t.a)].filter(Boolean).join(" "));
}
function busRes(v) {
  v = String(v || "").trim();
  if (v.length < 2) return `<p class="mut" style="text-align:center;margin:18px 0">Escribe al menos 2 letras<span class="hint">: un comercio, una persona, una categoría, una nota o un importe</span>.</p>`;
  const w = nrm(v).split(/\s+/).filter(Boolean), num = parseFloat(v.replace(",", ".")), l = ALL().filter((t) => {
    const s = busTxt(t);
    return w.every((x) => s.includes(x)) || num > 0 && Math.abs(t.a - num) < 5e-3;
  }).sort((a, b) => b.d.localeCompare(a.d));
  if (!l.length) return `<p class="mut" style="text-align:center;margin:18px 0">No hay movimientos con «${esc(v)}».</p>`;
  const g = sum(l.filter((t) => t.k == "g"), (t) => t.a), dv = sum(l.filter((t) => t.k == "g" && t.r && !t.dv), (t) => t.a), ent = sum(l.filter((t) => t.k == "i" || t.k == "d"), (t) => t.a), d0 = l[l.length - 1].d, d1 = l[0].d;
  return `<div class="stats" style="grid-template-columns:repeat(${dv ? 3 : 2},1fr)"><div class="stat"><small>Gastado</small><b class="${g ? "neg" : ""}">${f(-g)}</b></div>${dv ? `<div class="stat"><small>Por devolver (incluido)</small><b style="color:var(--rem)">${f(dv)}</b></div>` : ""}<div class="stat"><small>Te entró</small><b class="${ent ? "pos" : ""}">${ent ? "+" : ""}${f(ent)}</b></div></div>
<div class="card"><h2>${l.length} movimiento${l.length == 1 ? "" : "s"}<small class="mut" style="display:block;font-size:13px;font-weight:400;margin-top:2px">${d0 == d1 ? fd(d0) : "Del " + fd(d0) + " al " + fd(d1)}</small></h2>${mvList(l.slice(0, 300))}${l.length > 300 ? `<p class="tip">Se muestran los 300 más recientes.</p>` : ""}</div>`;
}
function busQ(v) {
  busV = v;
  const e = $("busR");
  if (e) e.innerHTML = busRes(v);
}
function vBus() {
  return `<div id="busR">${busRes(busV)}</div>`;
}
// ---------- Pagos repetidos del atajo: solo si coincide todo (importe exacto y comercio/persona) ----------
let pDupTxt = "";
function pDup(x) {
  if (!x) return "";
  const bz = isBz(x), ct = new Date(x.creado), near = (d) => !isNaN(ct) && Math.abs(new Date(d) - ct) < 3 * 864e5, hr = (d) => {
    const z = new Date(d);
    return isNaN(z) ? "" : " a las " + z.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };
  if (bz) {
    const b = bzP(x.importe), a2 = parseFloat(b.a) || 0, t2 = bzT(x), k = nrm(String(x.importe || "").trim());
    if (!(a2 > 0)) return "";
    const o2 = pq.find((y) => y.id !== x.id && isBz(y) && bzT(y) == t2 && nrm(String(y.importe || "").trim()) == k && new Date(y.creado) < ct);
    if (o2) return "Te ha llegado otro Bizum igual" + hr(o2.creado) + ": " + esc(b.p) + ", " + f(a2) + (b.c ? " (" + esc(b.c) + ")" : "") + ".";
    const z = (S.bz || []).find((y) => (y.t == t2 || t2 == "deb" && y.t == "rec") && nrm(y.p || "") == nrm(b.p) && Math.abs(y.a - a2) < 5e-3 && nrm(y.c || "") == nrm(b.c) && near(y.d + "T12:00"));
    return z ? "Ya apuntaste un Bizum igual el " + fd(z.d) + ": " + esc(z.p) + ", " + f(z.a) + (z.c ? " (" + esc(z.c) + ")" : "") + "." : "";
  }
  const a = pAmt(x.importe || ""), cm2 = nrm(String(x.comercio || "").trim());
  if (!(a > 0) || !cm2) return "";
  const o = pq.find((y) => y.id !== x.id && !isBz(y) && pAmt(y.importe || "") == a && nrm(String(y.comercio || "").trim()) == cm2 && new Date(y.creado) < ct);
  if (o) return "Te ha llegado otro pago igual" + hr(o.creado) + ": " + f(a) + " en " + esc(x.comercio) + ".";
  const t = S.tx.find((t2) => t2.k == "g" && Math.abs((t2.oa && t2.oc ? t2.oa : t2.a) - a) < 5e-3 && nrm(t2.what || "") == cm2 && near(t2.d + "T12:00"));
  return t ? "Ya apuntaste " + f(a) + " en " + esc(x.comercio) + " el " + fd(t.d) + "." : "";
}
function dupH(w) {
  return pDupTxt ? `<div class="dupq"><b>¿Es el mismo pago?</b><span>${pDupTxt} Si es el mismo, descártalo para no apuntarlo dos veces.</span><button onclick="${w == "b" ? "skipB()" : "skipP()"}">Sí, es el mismo: descartar</button><button class="sec" onclick="pDupTxt='';R()">No, son pagos distintos</button></div>` : "";
}
// ---------- Límites por categoría (como los gastos fijos: lista + formulario) ----------
let budE = null;
function budCard(s) {
  const L2 = EC.filter((c) => S.bud[c] > 0), fr = EC.filter((c) => budE ? c == budE : !(S.bud[c] > 0));
  return (L2.length ? L2.map((c) => {
    const b = S.bud[c], v = s[c] || 0, p = v / b, co = p > 1 ? "var(--red)" : p >= 0.8 ? "var(--amb)" : "var(--acc)";
    return `<div class="li bud"><div class="g"><span class="bdot" style="background:${col(c)}"></span>${esc(c)}<small>${f(v)} de ${f(b)}${p > 1 ? " · te has pasado " + f(v - b) : p >= 0.8 ? " · llevas el " + Math.round(p * 100) + "%" : ""}</small></div><strong>${f(b)}</strong><button class="x" data-c="${esc(c)}" onclick="budEd(this.dataset.c)" aria-label="Editar límite de ${esc(c)}">${ic("pencil", 17)}</button><button class="x" data-c="${esc(c)}" onclick="budDel(this.dataset.c)" aria-label="Quitar límite de ${esc(c)}">${ic("x", 16)}</button><div class="bar"><i style="width:${Math.min(100, p * 100)}%;background:${co}"></i></div></div>`;
  }).join("") : '<p class="mut hint">Pon un máximo al mes en las categorías que quieras. Te avisa al llegar al 80% y si te pasas.</p>') + (budE ? `<div class="al" style="margin-top:12px">Editando el límite de <b>${esc(budE)}</b>.</div>` : "") + (fr.length ? `<div class="grid" style="margin-top:10px;grid-template-columns:1.5fr 1fr"><select id="bdc" ${budE ? "disabled" : ""} aria-label="Categoría">${fr.map((c) => `<option>${esc(c)}</option>`).join("")}</select><input id="bda" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Límite al mes" value="${budE ? S.bud[budE] : ""}"></div><button class="b" style="margin-top:10px" onclick="budSave()">${budE ? "Guardar cambios" : "Añadir límite"}</button>${budE ? '<button class="chip" style="width:100%;margin-top:8px" onclick="budE=null;R()">Cancelar</button>' : ""}` : '<p class="mut hint" style="margin-top:10px">Todas tus categorías tienen límite.</p>');
}
function budEd(c) {
  budE = c;
  R();
  const e = $("bda");
  if (e) {
    e.focus();
    e.select();
  }
}
function budDel(c) {
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  delete S.bud[c];
  if (budE == c) budE = null;
  save();
  R();
  toast("Límite de " + c + " quitado", 1);
}
function budSave() {
  const c = budE || ($("bdc") || {}).value, v = rnd(parseFloat(($("bda") || {}).value));
  if (!c) return;
  if (!(v > 0)) {
    toast("Escribe el límite al mes");
    const e = $("bda");
    if (e) e.focus();
    return;
  }
  S.bud[c] = v;
  budE = null;
  save();
  R();
  toast("Límite guardado: " + c + " " + f(v));
}
// ---------- Ajustes → Subcategorías: renombrar o borrar las usadas ----------
let subE = null, subL = [];
function subAll() {
  const m = {}, add2 = (c, n, ty) => {
    n = String(n || "").trim();
    if (!n || !c) return;
    const k = ty + "|" + c + "|" + nrm(n);
    (m[k] = m[k] || { c, n, ty, k: 0 }).k++;
  };
  S.tx.forEach((t) => {
    if (t.k != "g") return;
    add2(t.c, t.what, "s");
    if (t.c == "Otros") add2("Otros", t.ot, "q");
  });
  (S.subs || []).forEach((x) => {
    const k = "s|" + x.c + "|" + nrm(x.n);
    if (!m[k]) m[k] = { c: x.c, n: x.n, ty: "s", k: 0 };
  });
  (S.bz || []).forEach((x) => {
    if (!x.cat) return;
    add2(x.cat, x.c, "s");
    if (x.cat == "Otros") add2("Otros", x.ot, "q");
  });
  const ord = (c) => {
    const i = EC.indexOf(c);
    return i < 0 ? 99 : i;
  };
  return Object.values(m).sort((a, b) => ord(a.c) - ord(b.c) || (a.ty > b.ty ? 1 : a.ty < b.ty ? -1 : 0) || a.n.localeCompare(b.n, "es"));
}
function subSec() {
  if (UI().sub === false) return "";
  subL = subAll();
  const add2 = `<p class="lab" style="margin-top:12px">Añadir subcategoría</p><select id="sbc" aria-label="Categoría de la nueva subcategoría" style="margin-bottom:8px">${EC.map((c) => `<option>${esc(c)}</option>`).join("")}</select><div style="display:flex;gap:8px"><input id="sbn" placeholder="Nueva subcategoría" style="flex:1;min-width:0" onkeydown="if(event.key=='Enter')subAdd()"><button class="chip on" onclick="subAdd()">Añadir</button></div>`;
  if (!subL.length) return `<p class="lab" style="margin-top:18px">Subcategorías</p><p class="mut hint" style="font-size:14px">Añade las que quieras (por ejemplo «Mercadona» en Comida) o se guardan solas cuando las escribes al apuntar.</p>${add2}`;
  let last = "";
  return `<p class="lab" style="margin-top:18px">Subcategorías</p>${subL.map((x, i) => {
    const g = x.c + "|" + x.ty, h = g != last ? `<p class="lab subh"><span class="bdot" style="background:${col(x.c)}"></span>${esc(x.c)}${x.ty == "q" ? " · ¿Qué es?" : ""}</p>` : "";
    last = g;
    return h + (subE === i ? `<div class="li"><input id="subn" value="${esc(x.n)}" style="flex:1;min-width:0" onkeydown="if(event.key=='Enter')subSave(${i})"><button class="chip on" onclick="subSave(${i})">Guardar</button><button class="x" onclick="subE=null;R()" aria-label="Cancelar">${ic("x", 16)}</button></div>` : `<div class="li"><div class="g">${esc(x.n)}<small>${x.k ? x.k + " movimiento" + (x.k == 1 ? "" : "s") : "Sin usar todavía"}</small></div><button class="x" onclick="subE=${i};R();const e=$('subn');if(e){e.focus();e.select()}" aria-label="Cambiar ${esc(x.n)}">${ic("pencil", 17)}</button><button class="x" onclick="subDel(${i})" aria-label="Borrar ${esc(x.n)}">${ic("x", 16)}</button></div>`);
  }).join("")}${add2}<p class="tip hint">Al cambiar el nombre se cambia en todos sus movimientos. Al borrarla, los movimientos se quedan, solo sin subcategoría.</p>`;
}
function vSubs() {
  return "";
}
// Casilla de subcategoría: al escribir o tocarla salen las guardadas; si es nueva, deja guardarla. Las opciones desaparecen al elegir.
function subBox(id, cat2, v, ph) {
  return `<div class="sbw"><input id="${id}" data-cat="${esc(cat2 || "")}" autocomplete="off" autocorrect="off" placeholder="${ph || "Ej. Mercadona…"}" value="${esc(v || "")}" oninput="subSug(this)" onfocus="subSug(this)" onblur="setTimeout(()=>subHide('${id}'),200)"><div id="${id}S" class="subs" hidden></div></div>`;
}
function subSug(el) {
  const box = $(el.id + "S");
  if (!box) return;
  const cat2 = el.dataset.cat, v = el.value.trim(), w = nrm(v);
  if (!cat2) {
    const l2 = subAll().filter((x) => x.ty == "s" && (!w || nrm(x.n).includes(w)) && nrm(x.n) != w).sort((a, b) => b.k - a.k || a.n.localeCompare(b.n, "es")).slice(0, 6);
    box.innerHTML = l2.map((x) => `<button type="button" class="chip" data-n="${esc(x.n)}" data-c="${esc(x.c)}" onpointerdown="event.preventDefault()" onclick="subPick('${el.id}',this.dataset.n,0,this.dataset.c)">${esc(x.n)} <span class="mut" style="font-size:11px">· ${esc(x.c)}</span></button>`).join("") + (v && !subAll().some((x) => x.ty == "s" && nrm(x.n) == w) ? `<span class="mut" style="font-size:12px;align-self:center">Elige una categoría para guardar «${esc(v)}»</span>` : "");
    box.hidden = !box.innerHTML;
    return;
  }
  const l = subAll().filter((x) => x.ty == "s" && x.c == cat2 && (!w || nrm(x.n).includes(w)) && nrm(x.n) != w).sort((a, b) => b.k - a.k || a.n.localeCompare(b.n, "es")).slice(0, 6), ex = !v || subAll().some((x) => x.ty == "s" && x.c == cat2 && nrm(x.n) == w);
  box.innerHTML = l.map((x) => `<button type="button" class="chip" data-n="${esc(x.n)}" onpointerdown="event.preventDefault()" onclick="subPick('${el.id}',this.dataset.n)">${esc(x.n)}</button>`).join("") + (ex ? "" : `<button type="button" class="chip spn" data-n="${esc(v)}" onpointerdown="event.preventDefault()" onclick="subPick('${el.id}',this.dataset.n,1)">+ Guardar «${esc(v)}»</button>`);
  box.hidden = !box.innerHTML;
}
function subPick(id, n, nw2, c) {
  const el = $(id);
  if (!el) return;
  if (c && !el.dataset.cat && id == "bc") {
    brd();
    bq.c = n;
    bq.cat = c;
    R();
    return;
  }
  if (nw2) n = subAdd(el.dataset.cat, n, 1) || n;
  el.value = n;
  if (id == "qwh") q.what = n;
  else bq.c = n;
  subHide(id);
  if (nw2) toast("«" + n + "» guardada en " + el.dataset.cat);
}
function subHide(id) {
  const b = $(id + "S");
  if (b) b.hidden = true;
}
function subClean(v, mx) {
  return String(v || "").replace(/[<>"`\x5c\x5c]/g, "").replace(/\s+/g, " ").trim().slice(0, mx || 60);
}
function subAdd(c, v, quiet) {
  c = c || ($("sbc") || {}).value;
  const n = subClean(v != null ? v : ($("sbn") || {}).value);
  if (!c || !n) {
    if (!quiet) toast("Escribe el nombre de la subcategoría");
    return "";
  }
  if (subAll().some((x) => x.ty == "s" && x.c == c && nrm(x.n) == nrm(n))) {
    if (!quiet) toast("«" + n + "» ya existe en " + c);
    return n;
  }
  S.subs = (S.subs || []).concat({ c, n });
  save();
  if (!quiet) {
    R();
    toast("Subcategoría «" + n + "» añadida a " + c);
  }
  return n;
}
function subEach(x, fn) {
  const o = nrm(x.n);
  if (x.ty == "s") (S.subs || []).forEach((z) => {
    if (z.c == x.c && nrm(z.n) == o) fn(z, "n");
  });
  S.tx.forEach((t) => {
    if (t.k != "g" || t.c != x.c) return;
    if (x.ty == "s" && nrm(t.what || "") == o) fn(t, "what");
    if (x.ty == "q" && nrm(t.ot || "") == o) fn(t, "ot");
  });
  (S.bz || []).forEach((b) => {
    if (b.cat != x.c) return;
    if (x.ty == "s" && nrm(b.c || "") == o) fn(b, "c");
    if (x.ty == "q" && nrm(b.ot || "") == o) fn(b, "ot");
  });
}
function subSave(i) {
  const x = subL[i], e = $("subn");
  if (!x || !e) return;
  const n = String(e.value || "").replace(/[<>"`\\]/g, "").replace(/\s+/g, " ").trim().slice(0, x.ty == "q" ? 40 : 60);
  if (!n) {
    toast("Escribe un nombre o usa la ✕ para borrarla");
    return;
  }
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  let k = 0;
  subEach(x, (o, f3) => {
    o[f3] = n;
    if (f3 != "n") k++;
  });
  {
    const seen = {};
    S.subs = (S.subs || []).filter((z) => {
      const kk = z.c + "|" + nrm(z.n);
      if (seen[kk]) return false;
      seen[kk] = 1;
      return true;
    });
  }
  subE = null;
  save();
  R();
  toast("«" + x.n + "» ahora es «" + n + "» en " + k + " movimiento" + (k == 1 ? "" : "s"), 1);
}
function subDel(i) {
  const x = subL[i];
  if (!x) return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  let k = 0;
  subEach(x, (o, f3) => {
    o[f3] = "";
    if (f3 != "n") k++;
  });
  S.subs = (S.subs || []).filter((z) => z.n);
  subE = null;
  save();
  R();
  toast("«" + x.n + "» borrada de " + k + " movimiento" + (k == 1 ? "" : "s"), 1);
}
// ---------- En Ajustes, la lupa busca ajustes ----------
let prOn = false, prQ = "";
const PRK = { "Tu paga": "moneda euro libra dolar ahorro meta dia cobro paga mensual otra moneda cambio", "Tu sueldo": "moneda ahorro dia cobro pagas extra", "Tu paga y sueldo": "moneda ahorro dia cobro sueldo paga", "Categorías y subcategorías": "categoria subcategoria color comercio tienda que es nueva añadir renombrar borrar", "Cuentas": "cuenta tarjeta efectivo banco ahorro hucha revolut nueva añadir renombrar borrar color", "Contactos": "contacto favorito persona nombre bizum", "Límite al mes por categoría": "limite presupuesto maximo aviso 80", "Gastos fijos automáticos": "gasto fijo suscripcion recibo netflix alquiler seguro recurrente", "Personalizar la app": "tema oscuro claro color letra grande barra pestañas orden inicio explicaciones subcategorias sueldo trabajo vista grafico", "Exportar a Excel": "excel csv hoja exportar descargar", "Avisos": "aviso notificacion recordatorio", "Pagos con Apple Pay": "apple pay atajo supabase clave direccion url bizum conectar prueba", "Copia de seguridad": "copia seguridad backup restaurar recuperar archivo automatica supabase" };
function prApply() {
  if (tab != "pre") {
    prOn = false;
    prQ = "";
    return;
  }
  const b = $("srb");
  if (b) {
    b.setAttribute("aria-label", prOn ? "Cerrar búsqueda" : "Buscar ajuste");
    b.classList.remove("on");
  }
  if (!prOn) return;
  const app = $("app"), c = document.createElement("p");
  c.id = "prn";
  c.className = "mut";
  c.style.cssText = "margin:0 4px 12px;font-size:13px";
  c.hidden = true;
  app.insertBefore(c, app.firstChild);
  prF(prQ, 1);
}
function prF(v, init) {
  prQ = v;
  const w = nrm(String(v || "")).split(/\s+/).filter((x) => x.length > 1), ds = [...document.querySelectorAll("#app>details.acc")], eb = document.querySelector("#app>.endb"), hit = [];
  ds.forEach((d) => {
    const t = d.querySelector("h2").textContent, txt = nrm(d.textContent + " " + (PRK[t] || "")), ok = !w.length || w.every((x) => txt.includes(x));
    d.hidden = !ok;
    if (ok && w.length) hit.push(d);
  });
  if (eb) eb.hidden = w.length && !w.every((x) => "ver tutorial paso a paso repetir bienvenida inicio guia ayuda".includes(x));
  const n = $("prn");
  if (n) {
    n.hidden = !w.length;
    n.textContent = !w.length ? "" : hit.length || eb && !eb.hidden ? "" : "No hay ningún ajuste con «" + String(v).trim() + "».";
  }
  if (!init && hit.length && w.join("").length >= 3 && !hit[0].open) {
    ds.forEach((d) => {
      if (d !== hit[0] && d.open) d.open = false;
    });
    hit[0].open = true;
  }
}
// Subcategoría de Bizum colocada igual que en Vista y Devolver (debajo de la categoría)
function bzSubF() {
  const cat2 = bq.cat || (bq.t == "env" ? "Otros" : ""), sb = UI().sub !== false, lb2 = `<p class="lab">${sb ? "Subcategoría" : "Concepto"}<span class="hint opt"> (opcional)</span></p>`, fld = sb ? subBox("bc", cat2, bq.c) : `<input id="bc" placeholder="Ej. cena, entradas…" value="${esc(bq.c)}">`;
  if (cat2 == "Otros") return `<div class="grid" style="margin-bottom:10px;align-items:end"><div><p class="lab">¿Qué es?<span class="hint opt"> (opcional)</span></p><input id="bot" autocomplete="off" placeholder="Ej. peluquería" value="${esc(bq.ot || "")}" oninput="otS('b',this.value)"></div><div>${lb2}${fld}</div></div><div id="otSb">${otSugH(bq.ot, "b")}</div>`;
  return `${lb2}<div style="margin-bottom:10px">${fld}</div>`;
}
let mvOpen = false;
function xfSync() {
  const f3 = $("xf"), t = $("xt");
  if (!f3 || !t) return;
  const keep = t.value, l = AC.filter((a) => a != f3.value);
  t.innerHTML = l.map((a) => `<option>${esc(a)}</option>`).join("");
  t.value = l.includes(keep) ? keep : l[0];
}
const mTag = (t) => t.r && t.d.slice(0, 7) < mo ? `<span class="mtag">${(new Date(t.d + "T12:00")).toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}</span>` : "";
function bzCat(c) {
  brd();
  bq.cat = bq.t != "env" && bq.cat == c ? "" : c;
  R();
}
// ---------- Modo edición: ordenar y ocultar apartados de cada pestaña ----------
const EDT = ["res", "sem", "dia", "ano", "inf", "biz", "cue", "inv", "gas", "bzf"];
let edOn = false;
const isMov = (el) => el.matches && el.matches(".card,.hero,.stats,.dstrip,.grid") && !el.classList.contains("apb") && !el.classList.contains("fix");
// Formularios del +: cada campo pasa a ser un apartado que se puede mover u ocultar en modo edición
function fgSplit() {
  const app = $("app"), card = [...app.children].find((c) => c.classList && c.classList.contains("card") && c.querySelector("#qa,#ba"));
  if (!card) return;
  const kids = [...card.children], gs = [];
  let head = [], cur = null, tail = [], inTail = false;
  kids.forEach((k) => {
    if (inTail || k.matches("button.b") || k.querySelector && k.querySelector("button.b")) {
      inTail = true;
      tail.push(k);
      return;
    }
    const st = k.matches("label.chk") || k.matches("div.grid") && !!k.querySelector("p.lab") || k.matches("p.lab") && !(cur && cur.chk && /^¿Qué te está pagando/i.test(k.textContent.trim()));
    if (st) {
      cur = { el: [k], chk: k.matches("label.chk"), k: (k.textContent || "").trim() };
      gs.push(cur);
    } else if (cur) cur.el.push(k);
    else head.push(k);
  });
  if (gs.length < 2) return;
  const mk = (cls, els) => {
    const d = document.createElement("div");
    d.className = "card fgc " + cls;
    els.forEach((e) => d.appendChild(e));
    return d;
  };
  let ref = card;
  gs.forEach((g) => {
    const d = mk("", g.el);
    d.dataset.fk = g.k.toLowerCase().replace(/[^a-záéíóúñü¿? ]/g, "").trim().slice(0, 40) || "x";
    ref.after(d);
    ref = d;
  });
  if (tail.length) {
    const t = mk("fix", tail);
    ref.after(t);
  }
  if (!head.length) card.remove();
  else card.classList.add("fix");
}
function secKey(el) {
  if (el.dataset.fk) return el.dataset.fk;
  if (el.classList.contains("bzbox")) return "bizums";
  if (el.classList.contains("xtr")) return "dinero extra";
  if (el.classList.contains("hero")) return "hero";
  if (el.classList.contains("dstrip")) return "dias";
  if (el.classList.contains("owe")) return "deben";
  if (el.querySelector(".s4")) return "periodo";
  if (el.classList.contains("stats")) return "recuadros";
  const h = el.querySelector("h2") || el.querySelector(".k"), own = h ? [...h.childNodes].filter((n) => n.nodeType == 3).map((n) => n.textContent).join(" ").trim() : "";
  let t = (own || (h ? h.textContent : el.textContent)).toLowerCase().slice(0, 60).replace(/\d+/g, " ").replace(/(^|[^a-záéíóúñü])(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|sept|octubre|noviembre|diciembre|lunes|martes|miércoles|jueves|viernes|sábado|domingo|hoy|de|del|el|la|en)(?=[^a-záéíóúñü]|$)/g, "$1").replace(/[^a-záéíóúñü ]/g, "").replace(/\s+/g, " ").trim();
  if (/devol/.test(t)) t = "devolver";
  return t || "x";
}
function layGet() {
  return ((S.ui || {}).lay || {})[tab] || { o: [], h: [] };
}
function layApply() {
  if (tab == "gas" || tab == "bzf") fgSplit();
  const app = $("app"), b = $("edb"), ok = EDT.includes(tab) && !obOn, sb = $("srb");
  if (sb) sb.hidden = obOn || ["gas", "bzf", "bus"].includes(tab);
  if (b) {
    b.hidden = !ok;
    b.classList.toggle("on", edOn && ok);
  }
  document.body.classList.toggle("edit", edOn && ok);
  if (!ok || !app) return;
  const L2 = layGet(), els = [...app.children].filter(isMov);
  if (!els.length) return;
  const seen = {};
  let last = -1;
  const rk = els.map((el, i) => {
    let k = secKey(el);
    seen[k] = (seen[k] || 0) + 1;
    if (seen[k] > 1) k += "#" + seen[k];
    el.dataset.sec = k;
    const j = L2.o.indexOf(k);
    let v;
    if (j >= 0) {
      last = j;
      v = j;
    } else v = last + 1e-3 * (i + 1);
    return L2.h.includes(k) ? 1e4 + v : v;
  });
  const sorted = els.map((el, i) => [el, rk[i], i]).sort((a, b2) => a[1] - b2[1] || a[2] - b2[2]).map((x) => x[0]), marks = els.map((el) => {
    const m = document.createComment("");
    app.insertBefore(m, el);
    return m;
  });
  sorted.forEach((el, i) => marks[i].replaceWith(el));
  sorted.forEach((el) => {
    const hid = L2.h.includes(el.dataset.sec);
    el.classList.toggle("sec-hid", hid);
    if (!edOn) return;
    el.classList.add("sec-ed");
    const t = document.createElement("div");
    t.className = "edt";
    t.innerHTML = `<button onclick="secMv(this,-1)" aria-label="Subir">${ic("up", 18)}</button><button onclick="secMv(this,1)" aria-label="Bajar">${ic("down", 18)}</button><button class="${hid ? "off" : ""}" onclick="secHid(this)" aria-label="${hid ? "Mostrar" : "Ocultar"}">${ic(hid ? "eyeoff" : "eye", 18)}</button>`;
    el.appendChild(t);
  });
  if (edOn) {
    const bar = document.createElement("div");
    bar.className = "edbar";
    bar.innerHTML = `<div><b>${ic("pencil", 16)} Modo edición</b><span class="hint">Usa las flechas ${ic("up", 14)}${ic("down", 14)} para cambiar el orden y el ojo ${ic("eye", 14)} para ocultar un apartado. Lo que ocultes se va al final.</span></div><div class="edbb"><button class="chip" onclick="secReset()">Restablecer</button><button class="chip on" onclick="edT()">Listo</button></div>`;
    app.insertBefore(bar, app.firstChild);
  }
}
function edT() {
  edOn = !edOn;
  R();
  if (edOn) scrollTo(0, 0);
}
function secs() {
  return [...$("app").children].filter((e) => e.dataset && e.dataset.sec);
}
function secSave() {
  const o = secs().map((e) => e.dataset.sec), p = layGet();
  S.ui = Object.assign(UI(), { lay: Object.assign({}, UI().lay, { [tab]: { o: o.concat(p.o.filter((k) => !o.includes(k))), h: p.h } }) });
  save();
}
function secMv(b, d) {
  const el = b.closest("[data-sec]"), l = secs(), i = l.indexOf(el), o = l[i + d];
  if (!o) return;
  d < 0 ? o.before(el) : o.after(el);
  secSave();
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
function secHid(b) {
  const k = b.closest("[data-sec]").dataset.sec;
  if (/importe|nombre|quién/.test(k)) {
    toast("Este campo no se puede ocultar");
    return;
  }
  const p = layGet(), h = p.h.includes(k) ? p.h.filter((x) => x != k) : p.h.concat(k);
  secSave();
  S.ui.lay[tab].h = h;
  save();
  R();
}
function secReset() {
  const l = Object.assign({}, UI().lay);
  delete l[tab];
  S.ui = Object.assign(UI(), { lay: l });
  save();
  R();
  toast("Orden original recuperado");
}
function secDrag(e) {
  e.preventDefault();
  const el = e.target.closest("[data-sec]"), app = $("app");
  el.classList.add("drag");
  const mv = (ev) => {
    const y = ev.clientY, l = secs().filter((x) => x !== el);
    let bf2 = null;
    for (const s of l) {
      const r = s.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        bf2 = s;
        break;
      }
    }
    if (bf2) {
      if (el.nextElementSibling !== bf2) app.insertBefore(el, bf2);
    } else if (l.length) {
      const z = l[l.length - 1];
      if (z.nextElementSibling !== el) z.after(el);
    }
    if (y < 70) scrollBy(0, -14);
    else if (y > innerHeight - 70) scrollBy(0, 14);
  };
  const up = () => {
    removeEventListener("pointermove", mv);
    removeEventListener("pointerup", up);
    removeEventListener("pointercancel", up);
    el.classList.remove("drag");
    secSave();
  };
  addEventListener("pointermove", mv);
  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);
}
// ---------- Paso a paso ----------
const navBtn = (k) => document.querySelector(`#nav button[onclick="go('${k}')"]`);
const TOUR = [
  { s: () => $("nav"), t: "Tus pestañas", d: "Aquí cambias de pantalla. En Ajustes eliges cuáles ves y en qué orden." },
  { s: () => document.querySelector(".vseg"), t: "Día, semana, mes y año", d: "Elige qué periodo quieres ver. Con las flechas de arriba pasas al anterior o al siguiente." },
  { s: () => $("fab"), t: "El botón +", d: "Con él apuntas todo. Cambia según la pestaña: en Vista apuntas gastos, en Devolver lo que te tienen que devolver y en Bizum tus Bizum. Veamos el de Vista." },
  { f: 1, s: () => document.querySelector("#app .seg"), t: "¿Qué apuntas?", d: "<b>Gasto</b> es lo normal. <b>Me deben</b> es cuando pagas tú algo y luego te lo devuelven. <b>Dinero extra</b> es dinero que te llega." },
  { f: 1, s: () => $("qa"), t: "Importe", d: 'Escribe cuánto ha sido. Lo que lleva <span class="req">*</span> es obligatorio; lo demás puedes dejarlo vacío.' },
  { f: 1, s: () => document.querySelector("#app .chip.cc") && document.querySelector("#app .chip.cc").parentNode, t: "Categoría", d: "Toca en qué lo has gastado. Debajo puedes poner una subcategoría, por ejemplo «Mercadona»." },
  { f: 1, s: () => document.querySelector("#app .card button.b"), t: "Guardar", d: "Elige la cuenta con la que pagas, la fecha y una nota si quieres, y pulsa aquí. Se resta solo de tu cuenta." },
  { s: () => document.querySelector("#app .li .g"), t: "Cambiar o borrar", d: "Toca cualquier movimiento para cambiarlo o borrarlo. Si te equivocas, pulsa «Deshacer»." },
  { s: () => $("edb"), t: "Modo edición", d: "Toca el lápiz para ordenar cada pantalla a tu gusto: con las flechas mueves un apartado (por ejemplo, el gráfico arriba del todo) y con el ojo lo ocultas." },
  { s: () => $("srb"), t: "Buscar", d: "Con la lupa encuentras cualquier movimiento: escribe un comercio, una persona, una nota o un importe y verás todos los que coinciden con su total." },
  { s: () => navBtn("biz"), t: "Bizum", d: "Apunta los Bizum que haces y los que te hacen, lo que te deben y los gastos que pagaste por varios." },
  { s: () => navBtn("pre"), t: "Ajustes", d: "Colores, categorías, cuentas, copias de seguridad y Apple Pay. Aquí puedes volver a ver este paso a paso." }
];
let tourI = -1;
function tourGo() {
  edOn = false;
  try {
    tsHide();
  } catch (e) {
    const t = $("ts");
    if (t) t.hidden = true;
  }
  if (!isV(tab)) {
    go("vis");
  } else R();
  tourI = 0;
  setTimeout(tourShow, 250);
}
function tourEnd() {
  tourI = -1;
  if (tab == "gas") cancelE();
  const o = document.querySelector(".tour");
  if (o) o.remove();
  S.tourDone = 1;
  save();
}
function tourStep(d) {
  tourI += d;
  if (tourI < 0) tourI = 0;
  if (tourI >= TOUR.length) {
    tourEnd();
    return;
  }
  tourShow(d);
}
function tourShow(d) {
  d = d || 1;
  const old = document.querySelector(".tour");
  if (old) old.remove();
  const st = TOUR[tourI];
  if (st.f && tab != "gas") {
    fab0();
    try {
      document.activeElement.blur();
    } catch (e) {
    }
  } else if (!st.f && tab == "gas") cancelE();
  let el = null;
  try {
    el = st.s();
  } catch (e) {
  }
  if (!el || el.hidden || !el.getClientRects().length) {
    if (tourI + d >= 0 && tourI + d < TOUR.length) {
      tourI += d;
      return tourShow(d);
    }
    if (tourI >= TOUR.length - 1) {
      tourEnd();
      return;
    }
  }
  const me = tourI, pos = getComputedStyle(el).position;
  if (el && pos != "fixed" && pos != "sticky") el.scrollIntoView({ block: "center" });
  setTimeout(() => {
    if (tourI !== me) return;
    const r = el.getBoundingClientRect(), o = document.createElement("div"), pad = 6, below = r.top + r.height / 2 < innerHeight / 2;
    o.className = "tour";
    o.innerHTML = `<div class="tour-sp" style="left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px"></div><div class="tour-c" style="${below ? "top:" + Math.min(innerHeight - 220, r.bottom + 14) + "px" : "bottom:" + Math.min(innerHeight - 220, innerHeight - r.top + 14) + "px"}"><div class="tour-n">${tourI + 1} de ${TOUR.length}</div><h3>${st.t}</h3><p>${st.d}</p><div class="tour-b"><button class="chip" onclick="tourEnd()">Saltar</button><span style="flex:1"></span>${tourI ? '<button class="chip" onclick="tourStep(-1)">Atrás</button>' : ""}<button class="chip on" onclick="tourStep(1)">${tourI == TOUR.length - 1 ? "Terminar" : "Siguiente"}</button></div></div>`;
    document.body.appendChild(o);
  }, pos == "fixed" || pos == "sticky" ? 0 : 300);
}
function catChips(k) {
  return `<div class="chips">${EC.map((c) => `<button class="chip cc ${q[k] == c ? "on" : ""}" style="--cc:${col(c)}" data-c="${esc(c)}" onclick="sq('${k}',this.dataset.c)" aria-pressed="${q[k] == c}">${esc(c)}</button>`).join("")}</div>`;
}
// Selector Gasto · Me deben · Dinero extra del + de Vista
function tSeg() {
  const m = q.k == "i" ? "i" : q.dvf && q.w == "d" ? "d" : "g";
  return `<div class="seg"><button class="${m == "g" ? "on" : ""}" onclick="tSet('g')">Gasto</button><button class="${m == "d" ? "on" : ""}" onclick="tSet('d')">Me deben</button><button class="${m == "i" ? "on" : ""}" onclick="tSet('i')">Dinero extra</button></div>`;
}
function tSet(m) {
  rd();
  if (m == "d") {
    if (q.w != "d" && q.k == "g" && q.c) q.rc = q.c;
    Object.assign(q, { k: "g", w: "d", dvf: true, sp: false, fxOn: false });
    if (!q.rac) q.rac = dAc();
  } else {
    if (q.w == "d" && q.rc) q.c = q.rc;
    Object.assign(q, { k: m, w: "p", dvf: false });
  }
  R();
}
function vDvf() {
  return `<button class="chip" onclick="cancelE()" style="margin-bottom:10px">${ic("left", 16)} Volver</button>${ap ? `<div class="apb"><div class="t">${ic("card", 18)} Pago con Apple Pay${ap != "Apple Pay" ? " en " + esc(ap) : ""}</div><div class="s">Elige a qué cuenta te lo devuelven y pulsa «Guardar».${pqi != null && pq.length > 1 ? pq.length == 2 ? " Después te queda 1 más." : " Después te quedan " + (pq.length - 1) + " más." : ""}</div>${dupH("p")}${pqi != null && !pDupTxt ? '<button class="sec" onclick="skipP()">Descartar este pago</button>' : ""}</div>` : ""}<div class="card">${pt != "inf" || ap ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><h2 style="margin:0">${q.id ? "Editar" : "Nuevo"}</h2>${tSeg()}</div>` : `<h2>${q.id ? "Editar gasto que te devuelven" : "Gasto que te devuelven"}</h2>`}<p class="tip hint" style="margin:-4px 0 12px">Pagas tú y luego te lo devuelven. Cuenta como gasto este mes y, cuando te lo devuelvan, como dinero que entra.</p>${q.id && (S.tx.find((x) => x.id == q.id) || {}).lkd ? `<label class="chk" style="margin-bottom:6px"><input type="checkbox" checked disabled><b>Es para devolverme algo que pagué yo</b></label><p class="lab">¿Qué te está pagando?</p><select disabled style="margin-bottom:10px"><option>${esc(S.tx.find((x) => x.id == q.id).lkd)}</option></select>` : ""}${!q.id && !ap ? `<label class="chk" style="margin-bottom:6px"><input type="checkbox" ${q.dpy !== false ? "checked" : ""} onchange="rd();q.dpy=this.checked;if(!this.checked)q.dlk='';R()"><b>Es para devolverme algo que pagué yo</b></label>${q.dpy !== false ? `<p class="lab">¿Qué te está pagando?</p><select onchange="rd();q.dlk=this.value;const o=S.tx.find(t=>t.id==q.dlk);if(o){q.a=String(o.a);q.rc=EC.includes(o.c)?o.c:'Otros';q.ac=o.ac}R()" style="margin-bottom:10px"><option value="">Nada en concreto</option>${S.tx.filter((t) => t.k == "g" && !t.r && t.sh == null && t.d >= addD(today(), -90)).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 40).map((t) => `<option value="${t.id}" ${q.dlk == t.id ? "selected" : ""}>${fd(t.d).slice(0, 5)} · ${esc(t.c)}${t.what ? " · " + esc(t.what) : ""} · ${f0(t.a)}</option>`).join("")}</select>` : ""}` : ""}
<p class="lab">Importe<span class="req">*</span></p><input id="qa" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${esc(q.a)}" style="margin-bottom:10px">
<p class="lab">Categoría</p>${catChips("rc")}${subF(q.rc)}
${ap ? "" : `<p class="lab">Pagado con</p>`}<select onchange="q.ac=this.value"${ap ? " hidden" : ""}>${AC.map((a) => `<option ${(q.ac || defAc()) == a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select><p class="lab"${ap ? "" : ' style="margin-top:10px"'}>Te lo devuelven en</p><select onchange="q.rac=this.value">${AC.map((a) => `<option ${(q.rac || dAc()) == a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select><div style="height:10px"></div>
<div class="grid" style="margin-bottom:14px"><div><p class="lab">Fecha</p><input id="qd" type="date" value="${q.d || today()}"></div><div><p class="lab">Nota<span class="hint opt"> (opcional)</span></p><input id="qn" placeholder="${hOn() ? "Opcional" : ""}" value="${esc(q.n)}"></div></div>
<button class="b" onclick="add()">${q.id ? "Guardar cambios" : "Guardar"}</button>${q.id ? `<button class="chip" style="width:100%;margin-top:8px;color:var(--red);border-color:var(--red)" onclick="delEd()">Borrar este gasto</button>` : ""}</div>`;
}
function vGas() {
  if (q.dvf && q.k == "g" && q.w == "d") return vDvf();
  if (q.spf && q.k == "g" && !q.id) return vSpf();
  const g = q.k == "g";
  return `<button class="chip" onclick="cancelE()" style="margin-bottom:10px">${ic("left", 16)} Volver</button>${ap ? `<div class="apb"><div class="t">${ic("card", 18)} Pago con Apple Pay${ap != "Apple Pay" ? " en " + esc(ap) : ""}</div><div class="s">Revisa el importe y la categoría y pulsa «Guardar gasto».${pqi != null && pq.length > 1 ? pq.length == 2 ? " Después te queda 1 más." : " Después te quedan " + (pq.length - 1) + " más." : ""}</div>${dupH("p")}${pqi != null && !pDupTxt ? '<button class="sec" onclick="skipP()">Descartar este pago</button>' : ""}</div>` : scH()}
<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><h2 style="margin:0">${q.id ? "Editar" : "Nuevo"}</h2>${tSeg()}</div>
<p class="lab">${g && q.sp ? "Importe total que pagaste" : "Importe"}<span class="req">*</span></p><input id="qa" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${q.a}" style="font-size:22px;margin-bottom:${q.fxOn ? 4 : 10}px" oninput="rd();if(q.sp)spInfo();fxInfo()">${q.fxOn ? `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px"><select id="qcur" onchange="rd();q.cur=this.value;q.fxMan=false;q.fx=S.rates&&S.rates[q.cur]||'';R();fxGet()" style="width:auto;flex:none">${CU.map((c) => `<option value="${c}" ${(q.cur || S.cur) == c ? "selected" : ""}>${curLbl(c)}</option>`).join("")}</select>${q.cur && q.cur != S.cur ? `<span class="mut" style="font-size:14px">1 ${q.cur} =</span><input id="qfx" type="number" inputmode="decimal" step="0.0001" min="0" value="${q.fx || ""}" placeholder="cambio" style="width:96px;flex:none" oninput="rd();q.fxMan=true;fxInfo()"><span class="mut" style="font-size:14px">${S.cur}</span>` : ""}</div><div id="fxi" class="mut" style="font-size:14px;margin-bottom:10px">${fxTxt()}</div>` : ""}
${g ? `<p class="lab">Categoría</p>${catChips(q.w == "d" ? "rc" : "c")}${subF(q.w == "d" ? q.rc : q.c)}
${needW() ? `<p class="lab">¿Qué es? (obligatorio)</p><input id="qwh" placeholder="Ej. cargador, regalo de cumpleaños…" value="${esc(q.what)}" style="margin-bottom:10px">` : ""}` : ""}
${g && sepMode() ? `<p class="lab">¿De tu paga o de tu sueldo?</p><div class="chips"><button class="chip ${(q.src || "p") == "p" ? "on" : ""}" onclick="rd();q.src='p';R()">Paga</button><button class="chip ${q.src == "s" ? "on" : ""}" onclick="rd();q.src='s';R()">Sueldo</button></div>` : ""}${g && q.id && S.tx.some((x) => x.id == q.id && x.sh != null) ? '<div class="al hint" style="margin-bottom:10px">Es un gasto dividido. Si cambias el importe, tu parte se ajusta sola; para cambiar cuántos sois, bórralo y apúntalo de nuevo.</div>' : ""}
${!g && sepMode() ? `<p class="lab">¿Es para tu paga o tu sueldo?</p><div class="chips"><button class="chip ${(q.src || "p") == "p" ? "on" : ""}" onclick="rd();q.src='p';R()">Paga</button><button class="chip ${q.src == "s" ? "on" : ""}" onclick="rd();q.src='s';R()">Sueldo</button></div>` : ""}<p class="lab">${g ? "Desde qué cuenta" : "A qué cuenta"}</p><div class="chips">${AC.map((a) => `<button class="chip ${q.ac == a ? "on" : ""}" onclick="sq('ac','${a}')">${a}</button>`).join("")}</div>
<div class="grid" style="margin-bottom:10px"><div><p class="lab">Fecha</p><input id="qd" type="date" value="${q.d || today()}"></div><div><p class="lab">Nota<span class="hint opt"> (opcional)</span></p><input id="qn" placeholder="${hOn() ? "Opcional" : ""}" value="${esc(q.n)}"></div></div>
${q.fxOn || !S.c2 ? "" : `<button class="chip" style="padding:6px 12px;font-size:13px;margin-bottom:6px" onclick="rd();q.fxOn=true;q.fxMan=false;q.cur=q.cur||S.cur;R();fxGet()">${ic("coins", 15)} Pagado en otra moneda</button>`}
<button class="b" style="margin-top:12px" onclick="add()">${q.id ? "Guardar cambios" : g ? "Guardar gasto" : "Guardar dinero extra"}</button>${q.id ? `<button class="chip" style="width:100%;margin-top:8px;color:var(--red);border-color:var(--red)" onclick="delEd()">Borrar este movimiento</button>` : ""}</div>`;
}
let gmO = false;
function gOpen() {
  if (gmO) return true;
  const t = q.id && S.tx.find((x) => x.id == q.id);
  return !!(q.sp || q.fxOn || q.w == "d" || q.ac && q.ac != defAc() || q.d && q.d != today() || t && t.n);
}
function gSum() {
  const g = q.k == "g", p = [q.ac || defAc(), !q.d || q.d == today() ? "hoy" : fd(q.d)];
  if (g && q.w == "d") p.push("me lo devuelven");
  if (g && q.sp) p.push("dividido");
  if (q.fxOn && q.cur && q.cur != S.cur) p.push(q.cur);
  return "· " + esc(p.join(" · "));
}
function delEd() {
  const id = q.id;
  if (!id) return;
  cancelE();
  del(id);
}
function tsHide() {
  const e = $("ts");
  clearTimeout(toast.t);
  e.hidden = true;
  e.style.transform = "";
  e.style.opacity = "";
}
function tsInit() {
  const e = $("ts");
  if (e.dataset.ok) return;
  e.dataset.ok = 1;
  let x0 = 0, y0 = 0, dx = 0, dy = 0, on = 0;
  e.addEventListener("click", (ev) => {
    if (!ev.target.closest("button")) tsHide();
  });
  e.addEventListener("touchstart", (ev) => {
    const t = ev.touches[0];
    x0 = t.clientX;
    y0 = t.clientY;
    dx = dy = 0;
    on = 1;
  }, { passive: true });
  e.addEventListener("touchmove", (ev) => {
    if (!on) return;
    const t = ev.touches[0];
    dx = t.clientX - x0;
    dy = Math.min(0, t.clientY - y0);
    e.style.transition = "none";
    e.style.transform = `translate(${dx}px,${dy}px)`;
    e.style.opacity = String(Math.max(0.2, 1 - (Math.abs(dx) + Math.abs(dy)) / 200));
  }, { passive: true });
  e.addEventListener("touchend", () => {
    on = 0;
    e.style.transition = "";
    if (Math.abs(dx) > 60 || dy < -25) tsHide();
    else {
      e.style.transform = "";
      e.style.opacity = "";
    }
  });
}
function toast(m, u) {
  const e = $("ts");
  tsInit();
  e.style.transform = "";
  e.style.opacity = "";
  e.hidden = false;
  e.innerHTML = `<span>${m}</span>${u ? '<button onclick="undo()">Deshacer</button>' : ""}<button class="tx" onclick="tsHide()" aria-label="Cerrar aviso">${ic("x", 16)}</button>`;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => {
    e.hidden = true;
  }, u ? 8e3 : 5e3);
}
let L = null;
function undo() {
  if (!L) return;
  if (L.k == "tx") {
    S.tx.push(L.v);
    S.rskip = S.rskip.filter((x) => x != L.sk);
  } else if (L.k == "all") S = L.v;
  L = null;
  catSync();
  save();
  $("ts").hidden = true;
  R();
}
function notify(m) {
  try {
    if (S.sn && "Notification" in window && Notification.permission == "granted") new Notification("Mi paga", { body: m });
  } catch (e) {
  }
}
function add() {
  rd();
  spFlush();
  let a = rnd(parseFloat(q.a));
  if (!(a > 0)) {
    $("qa").focus();
    return;
  }
  const frg = q.fxOn && q.cur && q.cur != S.cur, fx = parseFloat(q.fx), oa = a;
  if (frg && !(fx > 0)) {
    toast("Pon el cambio de " + q.cur);
    const e = $("qfx");
    if (e) e.focus();
    return;
  }
  if (frg) {
    a = rnd(oa * fx);
    S.rates = Object.assign({}, S.rates, { [q.cur]: fx });
  }
  S.tc = frg ? q.cur : "";
  const dlo = q.k == "g" && q.w == "d" && !q.id && q.dpy !== false && q.dlk && S.tx.find((t2) => t2.id == q.dlk && t2.k == "g" && !t2.r);
  if (dlo) {
    L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
    const rac = q.rac || dAc(), amt = Math.min(a, dlo.a), lkd = fd(dlo.d).slice(0, 5) + " · " + (dlo.what || dlo.n || dlo.c) + " · " + f(dlo.a);
    if (a >= dlo.a) {
      dlo.lkd = lkd;
      dlo.r = true;
      dlo.rac = rac;
      if (!EC.includes(dlo.c)) dlo.c = "Otros";
    } else {
      dlo.a = rnd(dlo.a - a);
      S.tx.push({ id: uid(), k: "g", a, c: dlo.c, r: true, ok: false, ac: dlo.ac, m: "", d: dlo.d, n: q.n.trim(), what: dlo.what || "", ot: dlo.ot || "", rac, lkd });
    }
    q.dlk = "";
    save();
    toast("Pasado a Devolver: " + f(amt) + " que te tienen que devolver", 1);
    cancelE();
    return;
  }
  if (needW() && !q.what.trim()) {
    toast("Escribe qué es");
    $("qwh").focus();
    return;
  }
  const g = q.k == "g", t = { id: q.id || uid(), k: q.k, a, c: g ? q.w == "d" ? q.rc : q.c : "Extra", r: g && q.w == "d", ok: false, ac: q.ac, m: "", d: q.d || today(), n: q.n.trim(), what: String(q.what || "").trim().slice(0, 60), ot: (q.w == "d" ? q.rc : q.c) == "Otros" && q.k == "g" ? String(q.ot || "").trim().slice(0, 40) : "" }, m = t.d.slice(0, 7), lim = S.bud[t.c];
  let msg = "", spl = null;
  if (frg) {
    t.oa = oa;
    t.oc = q.cur;
    t.fx = fx;
  }
  if (sepMode()) t.src = q.src || UI().view;
  if (t.r && q.rac) t.rac = q.rac;
  if (g && !t.r && q.sp && !q.id) {
    spl = spCalc();
    if (!spl || spl.err) {
      toast(spl ? "Lo que te deben es más que el total" : "Completa cómo se reparte el gasto");
      return;
    }
    t.sh = spl.mine;
  }
  if (q.id) {
    const o = S.tx.find((x) => x.id == q.id);
    if (o && o.sh != null && !t.r) {
      const owed2 = sum(S.bz.filter((x) => x.g == o.id), (x) => x.a);
      t.sh = rnd(Math.max(0, a - owed2));
    }
  }
  if (g && !t.r && lim > 0) {
    const old = q.id ? S.tx.find((x) => x.id == q.id) : null, b = (cat(m)[t.c] || 0) - (old && !old.r && old.c == t.c && old.d.startsWith(m) ? old.sh != null ? old.sh : old.a : 0), n = b + (t.sh != null ? t.sh : a);
    if (n > lim && b <= lim) msg = t.c + ": te has pasado de tu límite";
    else if (n >= lim * 0.8 && b < lim * 0.8) msg = t.c + ": ya llevas el 80% de tu límite";
  }
  if (q.id) {
    const i = S.tx.findIndex((x) => x.id == q.id), o = S.tx[i];
    if (o && o.rid) t.rid = o.rid;
    if (o && o.lkd && t.r) t.lkd = o.lkd;
    if (o && o.dv && t.r) {
      t.dv = o.dv;
      t.dac = o.dbz ? o.dac : t.rac || o.dac;
      if (o.dbz) t.dbz = o.dbz;
    }
    if (i >= 0) S.tx[i] = t;
    else S.tx.push(t);
  } else S.tx.push(t);
  if (spl) {
    for (const x of spl.list) S.bz.push({ id: uid(), t: "deb", p: x.p, a: x.a, c: "Parte de " + (t.what || t.n || t.c), d: t.d, ac: t.ac, g: t.id });
    if (!msg) msg = "Guardado · tu parte " + f(spl.mine) + " · te deben " + f(sum(spl.list, (x) => x.a));
  }
  save();
  gmO = false;
  q.dvf = false;
  q.spf = false;
  if (pqi != null) doneP();
  ap = "";
  q.a = "";
  q.n = "";
  q.what = "";
  q.id = null;
  q.sp = false;
  q.sn = "2";
  q.snm = "";
  q.sm = "eq";
  q.rows = [];
  q.ac = defAc();
  tab = pt || "res";
  R();
  scrollTo(0, 0);
  toast(msg || "Guardado");
  if (msg) notify(msg);
  if (pq.length) openP();
}
function edit(id) {
  const t = S.tx.find((x) => x.id == id);
  if (!t) return;
  if (tab != "gas") pt = tab;
  Object.assign(q, { fxOn: !!t.oc, cur: t.oc || "", fx: t.fx ? String(t.fx) : "" });
  Object.assign(q, { id, src: t.src || "p", k: t.k, a: String(t.a), d: t.d, n: t.n || "", ac: t.ac || defAc(), w: t.r ? "d" : "p", what: t.what || "", ot: t.ot || "", dvf: !!t.r && !t.oc, rac: t.rac || t.dac || (t.r ? dAc() : "") });
  if (t.r) q.rc = t.c;
  else if (t.k == "g") q.c = EC.includes(t.c) ? t.c : "Otros";
  if (t.oc) q.a = String(t.oa);
  tab = "gas";
  R();
  scrollTo(0, 0);
}
function cancelE() {
  gmO = false;
  q.dvf = false;
  q.spf = false;
  ap = "";
  pqi = null;
  q.sp = false;
  q.sn = "2";
  q.snm = "";
  q.sm = "eq";
  q.rows = [];
  q.id = null;
  q.a = "";
  q.n = "";
  q.what = "";
  tab = pt || "res";
  R();
  scrollTo(0, 0);
}
function del(id) {
  preDel();
  const t = S.tx.find((x) => x.id == id);
  if (!t) return;
  if (t.ow) {
    oweDel(t.ow);
    return;
  }
  const snap = JSON.parse(JSON.stringify(S)), sk = t.rid ? recKey((S.rec || []).find((x) => x.id == t.rid) || { id: t.rid }, t.d) : "";
  if (sk) S.rskip.push(sk);
  S.tx = S.tx.filter((x) => x.id != id);
  S.bz = S.bz.filter((x) => !(x.g == id && x.t == "deb"));
  L = { k: "all", v: snap };
  save();
  R();
  toast("Movimiento borrado", 1);
}
const RECS = [["Alquiler", "Otros"], ["Hipoteca", "Otros"], ["Comunidad", "Otros"], ["Luz", "Otros"], ["Agua", "Otros"], ["Gas", "Otros"], ["Internet y fibra", "Otros"], ["Móvil", "Otros"], ["Seguro del coche", "Otros"], ["Seguro de la moto", "Otros"], ["Seguro de salud", "Otros"], ["Seguro de hogar", "Otros"], ["Abono de transporte", "Otros"], ["Gasolina", "Gasolina"], ["Parking", "Otros"], ["Gimnasio", "Salidas y ocio"], ["Netflix", "Salidas y ocio"], ["Spotify", "Salidas y ocio"], ["HBO Max", "Salidas y ocio"], ["Disney+", "Salidas y ocio"], ["Amazon Prime", "Salidas y ocio"], ["YouTube Premium", "Salidas y ocio"], ["Apple iCloud", "Otros"], ["Videojuegos (suscripción)", "Salidas y ocio"], ["Academia o clases", "Otros"], ["Autoescuela", "Otros"], ["Universidad", "Otros"], ["Guardería o colegio", "Otros"], ["Comedor", "Comida"], ["Compra del súper", "Comida"], ["Mascota", "Otros"], ["Peluquería", "Otros"], ["Donación", "Regalos"], ["Cuota de la tarjeta", "Otros"], ["Préstamo", "Otros"], ["Ahorro a otra cuenta", "Otros"]];
function recCat(v) {
  const x = RECS.find((r) => r[0].toLowerCase() == String(v).trim().toLowerCase()), e = $("rc2");
  if (x && e) e.value = x[1];
}
let rEm = "n";
function rEnd(k) {
  rEm = k;
  $("rED").hidden = k != "d";
  $("rET").hidden = k != "t";
  document.querySelectorAll("#rEc .chip").forEach((b) => b.classList.toggle("on", b.dataset.k == k));
}
function recFirst(r) {
  return r.first || r.start + "-" + String(r.day || 1).padStart(2, "0");
}
function recDates(r, upto) {
  const fu = r.fu || "m", fn = r.fn || 1, first2 = recFirst(r), out = [];
  let i = 0;
  if (fu == "w" || fu == "d") {
    let d = first2;
    while (d <= upto && (!r.times || i < r.times) && (!r.until || d <= r.until) && i < 5e3) {
      out.push(d);
      d = addD(d, (fu == "w" ? 7 : 1) * fn);
      i++;
    }
    return out;
  }
  const day = +first2.slice(8, 10), b = new Date(first2.slice(0, 7) + "-01T12:00");
  for (; i < 600; ) {
    const y = b.getFullYear(), m = b.getMonth(), dim = new Date(y, m + 1, 0).getDate(), d = ymd(new Date(y, m, Math.min(day, dim), 12));
    if (d > upto || r.times && i >= r.times || r.until && d > r.until) break;
    out.push(d);
    i++;
    b.setMonth(b.getMonth() + fn);
  }
  return out;
}
function recKey(r, d) {
  return r.id + ((r.fu || "m") != "m" ? d : d.slice(0, 7));
}
function genRec() {
  let ch = 0;
  const td = today();
  (S.rec || []).forEach((r) => {
    const w = (r.fu || "m") != "m";
    recDates(r, td).forEach((d) => {
      if (!S.tx.some((t) => t.rid == r.id && (w ? t.d == d : t.d.startsWith(d.slice(0, 7)))) && !S.rskip.includes(recKey(r, d))) {
        S.tx.push(Object.assign({ id: uid(), k: "g", a: r.a, c: r.c, ac: r.ac, r: false, ok: false, d, n: r.n, what: r.c == "Otros" ? r.n : "", rid: r.id }, r.src ? { src: r.src } : {}));
        ch = 1;
      }
    });
  });
  if (ch) save();
  return ch;
}
function recTxt(r) {
  const fu = r.fu || "m", fn = r.fn || 1, fq = fu == "d" ? fn == 1 ? "cada día" : "cada " + fn + " días" : fu == "w" ? fn == 1 ? "cada semana" : "cada " + fn + " semanas" : fn == 1 ? "cada mes" : fn % 12 == 0 ? fn == 12 ? "cada año" : "cada " + fn / 12 + " años" : "cada " + fn + " meses", done = recDates(r, today()).length;
  return r.c + " · " + fq + " · desde el " + fd(recFirst(r)) + (r.times ? " · " + (done >= r.times ? "terminado" : done + " de " + r.times) : "") + (r.until ? " · " + (today() > r.until ? "terminó el " : "hasta el ") + fd(r.until) : "");
}
function addR() {
  const a = rnd(parseFloat($("ra").value)), n = clean($("rn").value);
  if (!(a > 0) || !n) {
    (n ? $("ra") : $("rn")).focus();
    return;
  }
  let fq = $("rfq").value;
  const em = rEm, tm = em == "t" ? parseInt($("rtm").value, 10) : 0, un = em == "d" ? $("red").value : "";
  if (em == "t" && !(tm > 0)) {
    toast("Pon cuántas veces");
    $("rtm").focus();
    return;
  }
  if (em == "d" && !un) {
    toast("Elige el último día");
    return;
  }
  if (un && un < ($("rfd").value || today())) {
    toast("El último día no puede ser antes del primer cobro");
    return;
  }
  if (fq == "c") {
    const n2 = parseInt($("rcn").value, 10), u = $("rcun").value;
    if (!(n2 > 0)) {
      toast("Pon cada cuánto se repite");
      $("rcn").focus();
      return;
    }
    fq = (u == "y" ? "m" : u) + (u == "y" ? n2 * 12 : n2);
  }
  const nr = Object.assign({ n, a, c: $("rc2").value, ac: $("rac").value, fu: fq[0], fn: +fq.slice(1), first: $("rfd").value || today(), times: tm > 0 ? tm : 0 }, un ? { until: un } : {});
  rEm = "n";
  const ed = recE && S.rec.find((x) => x.id == recE);
  if (ed) {
    delete ed.until;
    delete ed.day;
    delete ed.start;
    Object.assign(ed, nr);
    recE = null;
  } else S.rec.push(Object.assign({ id: uid() }, nr, sepMode() ? { src: UI().view } : {}));
  genRec();
  save();
  R();
  toast(ed ? "Gasto fijo actualizado" : "Gasto fijo añadido");
}
function recEd(id) {
  recE = id;
  accO.add("Gastos fijos automáticos");
  R();
  setTimeout(() => {
    const e = $("rn");
    if (e) e.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 60);
}
function delR(id) {
  preDel();
  S.rec = S.rec.filter((x) => x.id != id);
  save();
  R();
}
async function expB() {
  const data = JSON.stringify({ app: "mi-paga", v: 2, S }, null, 1), ok = () => {
    S.lb = today();
    save();
    R();
  };
  try {
    const d = window.claude && await claude.use("downloads");
    if (d) {
      await d.save({ filename: "mi-paga-" + today() + ".json", data });
      ok();
      toast("Copia guardada");
      return;
    }
  } catch (e) {
    if (e && e.code == "declined") return;
  }
  const name = "mi-paga-" + today() + ".json";
  try {
    const file = new File([data], name, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Copia de Mi paga" });
      ok();
      toast("Copia lista. Elige «Guardar en Archivos»");
      return;
    }
  } catch (e) {
    if (e && e.name == "AbortError") return;
  }
  try {
    const u = URL.createObjectURL(new Blob([data], { type: "application/json" })), a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4e3);
    ok();
    toast("Copia descargada");
    return;
  } catch (e) {
  }
  ok();
  $("bk").value = data;
  toast("Copia lista: cópiala del cuadro de texto");
}
function impF(el) {
  const x = el.files[0];
  if (!x) return;
  const rd2 = new FileReader();
  rd2.onload = () => impT(rd2.result);
  rd2.readAsText(x);
}
function impT(t) {
  try {
    const o = JSON.parse(t), n = o.S || o;
    if (!Array.isArray(n.tx)) throw 0;
    L = { k: "all", v: S };
    S = Object.assign({ cur: "EUR", paga: 0, meta: 0, tx: [], bud: {}, acc: {}, tr: [], since: "", pacc: "", lac: "", rec: [], rskip: [], rem: true, lb: "", bz: [], sbu: "", sbk: "", apd: [], ui: null }, n);
    mig();
    catSync();
    q.ac = defAc();
    save();
    R();
    toast("Copia restaurada", 1);
  } catch (e) {
    toast("Ese contenido no es una copia válida");
  }
}
async function sysN() {
  if (S.sn) {
    S.sn = false;
    save();
    R();
    return;
  }
  try {
    S.sn = await Notification.requestPermission() == "granted";
    save();
    R();
    toast(S.sn ? "Avisos activados" : "Permiso denegado");
  } catch (e) {
    toast("No disponible en este navegador");
  }
}
function nag() {
  let h = "";
  const nb = nbGet(), nbOk = nb && (Date.now() - new Date(nb)) / 864e5 < 3;
  if (S.rem && mo == cm() && !S.tx.some((t) => t.d == today())) h += '<div class="al">Hoy todavía no has apuntado nada. <strong onclick="fab()" style="cursor:pointer;text-decoration:underline">Apuntar</strong></div>';
  return h;
}
function W(a, b) {
  const u = UI();
  return u.work || u.both && !u.uni && u.view == "s" ? a : b;
}
function sepMode() {
  const u = UI();
  return u.both && !u.uni;
}
function bzV() {
  return (S.bz || []).filter((x) => !sepMode() || (x.src || "p") == UI().view);
}
function isV(t) {
  return t == "res" || t == "sem" || t == "dia" || t == "ano";
}
function lastV() {
  const m = UI().vmode;
  return isV(m) ? m : "res";
}
function tabOk(t) {
  const vt = visT();
  return vt.includes(t) || isV(t) && vt.includes("vis");
}
function firstTab() {
  const v = visT()[0];
  return v == "vis" ? lastV() : v;
}
function setV(m) {
  S.ui = Object.assign(UI(), { vmode: m });
  save();
  go(m);
  scrollTo(0, 0);
}
function vSeg() {
  return `<div class="vseg" role="tablist" aria-label="Cómo ver">${[["dia", "Día"], ["sem", "Semana"], ["res", "Mes"], ["ano", "Año"]].map(([k, l]) => `<button role="tab" aria-selected="${tab == k}" class="${tab == k ? "on" : ""}" onclick="setV('${k}')">${l}</button>`).join("")}</div>`;
}
function UI() {
  const D = { order: ["vis", "inf", "biz", "cue"], vmode: "res", hide: [], start: "res", nav: "t", theme: "auto", color: "verde", big: false, work: false, both: false, uni: false, view: "p", hints: "auto", sepDay: false, pie: true, pie2: true, xp: true, inv: false, autobk: true, sub: true }, u = Object.assign({}, D, S.ui || {});
  {
    const o = [];
    (u.order || []).filter((k) => TABS[k] && k != "pre").forEach((k) => {
      const kk = isV(k) ? "vis" : k;
      if (!o.includes(kk)) o.push(kk);
    });
    u.order = o;
  }
  Object.keys(TABS).forEach((k) => {
    if (k != "pre" && !isV(k) && !u.order.includes(k)) k == "vis" ? u.order.unshift(k) : u.order.push(k);
  });
  u.hide = (u.hide || []).filter((k) => TABS[k] && k != "pre" && !isV(k));
  if (u.start == "vis") u.start = u.vmode || "res";
  return u;
}
let hk = null;
const TABH = { vis: "Tu dinero por día, por semana, por mes o por año. Dentro eliges cómo verlo con los botones de arriba.", inf: "Para los gastos que pagas tú pero que otra persona te va a devolver (por ejemplo, tus padres). Cuentan como gasto el mes en que los pagas y, al devolvértelos, como dinero que entra. Aquí ves cuánto te deben cada mes, marcas lo que ya te han devuelto y puedes sacar un PDF para enviárselo.", biz: "Para apuntar los Bizum que haces, los que te hacen y lo que te deben tus amigos. Los que haces cuentan como gasto y los que te hacen como dinero que entra.", inv: "Para seguir tus inversiones (fondos, acciones, cripto…). Apuntas cuánto has metido y, de vez en cuando, cuánto vale ahora; la app te enseña lo que ganas o pierdes y un gráfico de cómo evoluciona. No afecta a tu paga ni a tus cuentas.", dia: "Si la marcas, el día tiene su propia pestaña. Si no, lo ves dentro de «Semana y día»." };
function tabN(k) {
  return TABS[k];
}
function visT() {
  const u = UI();
  return u.order.filter((k) => !u.hide.includes(k) && (k != "inv" || u.inv)).concat("pre");
}
function uiSet(k, v) {
  S.ui = Object.assign(UI(), { [k]: v });
  if (k == "work" && v) S.ui.both = false;
  if (k == "both" && v) S.ui.work = false;
  if (!tabOk(S.ui.start) || S.ui.start == "pre") S.ui.start = firstTab();
  save();
  applyUI();
  R();
}
function uiTog(k, on) {
  const u = UI();
  let h = u.hide.filter((x) => x != k);
  if (!on) {
    if (!u.order.some((x) => x != k && !h.includes(x))) {
      toast("Deja al menos una pestaña además de Ajustes");
      R();
      return;
    }
    h.push(k);
  }
  S.ui = Object.assign(u, { hide: h });
  if (!tabOk(S.ui.start)) S.ui.start = firstTab();
  save();
  R();
}
function uiMv(k, d) {
  const u = UI(), o = u.order, vis = o, a = vis.indexOf(k), b = vis[a + d];
  if (!b) return;
  const i = o.indexOf(k), j = o.indexOf(b);
  if (j < 0 || j >= o.length) return;
  [o[i], o[j]] = [o[j], o[i]];
  S.ui = Object.assign(u, { order: o });
  save();
  R();
}
function uiReset() {
  S.ui = null;
  save();
  applyUI();
  R();
  toast("La app vuelve a estar como venía");
}
const ACC = { verde: ["Verde", "#1f6f5c", "#4fb79d"], azul: ["Azul", "#2f5fa7", "#7fa8e6"], morado: ["Morado", "#6b4aa8", "#b39ae6"], rosa: ["Rosa", "#c2447a", "#f08cb6"], marron: ["Marrón", "#8a5a3b", "#d0a07c"], naranja: ["Naranja", "#c05a14", "#f0a060"], turquesa: ["Turquesa", "#0f7d86", "#5cc7cf"], grafito: ["Grafito", "#3d4550", "#aab3bd"] };
function applyUI() {
  const u = UI();
  if (!$("accs")) {
    const st = document.createElement("style");
    st.id = "accs";
    st.textContent = Object.entries(ACC).map(([k, [, l, d]]) => `:root[data-accent="${k}"]{--acc:${l};--acc2:${l}}@media (prefers-color-scheme:dark){:root[data-accent="${k}"]:not([data-theme="light"]){--acc:${d}}}:root[data-theme="dark"][data-accent="${k}"]{--acc:${d}}`).join("") + ':root[data-accent="morado"]{--rem:#0f7d86}';
    document.head.appendChild(st);
  }
  document.documentElement.dataset.accent = ACC[u.color] ? u.color : "verde";
  document.body.classList.toggle("nohints", u.hints == "off" || u.hints != "on" && S.tx.length + (S.bz || []).length >= 10);
  document.body.classList.toggle("navb", u.nav == "b");
  if (u.theme == "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = u.theme;
  document.body.style.zoom = u.big ? "1.12" : "";
}
function vUI() {
  const u = UI(), vt = visT();
  return `<div class="card"><h2>Personalizar la app</h2><p class="lab">Marca las pestañas que quieres ver y cámbialas de orden</p>${u.order.map((k, i, oo) => {
    const off = k == "dia" ? !u.sepDay : k == "inv" ? !u.inv : u.hide.includes(k);
    return `<div class="li"><input type="checkbox" ${off ? "" : "checked"} onchange="${k == "dia" ? `uiSet('sepDay',this.checked)` : k == "inv" ? `uiSet('inv',this.checked)` : `uiTog('${k}',this.checked)`}" style="width:22px;height:22px;flex:none" aria-label="Mostrar ${tabN(k)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;color:var(--mut)">${IC[k]}</svg><div class="g" style="${off ? "opacity:.5" : ""}">${tabN(k)}${TABH[k] ? `<button class="qh" onclick="hk=hk=='${k}'?null:'${k}';R()" aria-label="¿Qué es ${tabN(k)}?" aria-expanded="${hk == k}">?</button>` : ""}${hk == k && TABH[k] ? `<small style="display:block;margin-top:4px;color:var(--tx);opacity:.8">${TABH[k]}</small>` : ""}</div><button class="x" onclick="uiMv('${k}',-1)" aria-label="Subir ${TABS[k]}" ${i ? "" : 'disabled style="opacity:.25"'}>▲</button><button class="x" onclick="uiMv('${k}',1)" aria-label="Bajar ${TABS[k]}" ${i < oo.length - 1 ? "" : 'disabled style="opacity:.25"'}>▼</button></div>${k == "vis" && !off ? `<label style="display:flex;align-items:center;gap:8px;margin:-2px 0 8px 32px;font-size:14px;color:var(--mut);cursor:pointer"><input type="checkbox" ${u.pie ? "checked" : ""} onchange="uiSet('pie',this.checked)" style="width:18px;height:18px;flex:none;margin:0">Gráfico circular de categorías (Día, Semana y Mes)</label><label style="display:flex;align-items:center;gap:8px;margin:-2px 0 8px 32px;font-size:14px;color:var(--mut);cursor:pointer"><input type="checkbox" ${u.pie2 ? "checked" : ""} onchange="uiSet('pie2',this.checked)" style="width:18px;height:18px;flex:none;margin:0">Gráfico circular en Devolver y Bizum</label><label style="display:flex;align-items:center;gap:8px;margin:-2px 0 8px 32px;font-size:14px;color:var(--mut);cursor:pointer"><input type="checkbox" ${u.xp ? "checked" : ""} onchange="uiSet('xp',this.checked)" style="width:18px;height:18px;flex:none;margin:0">Tocar un número para ver de dónde sale</label>` : ""}`;
  }).join("")}<div class="li"><span style="width:22px;flex:none"></span><div class="g">Ajustes<small>Siempre visible, al final</small></div></div>
<p class="lab" style="margin-top:14px">Al abrir la app, empezar en</p><select onchange="uiSet('start',this.value)" style="margin-bottom:12px">${vt.filter((k) => k != "pre").flatMap((k) => k == "vis" ? [["res", "Vista · Mes"], ["sem", "Vista · Semana"], ["dia", "Vista · Día"], ["ano", "Vista · Año"]] : [[k, tabN(k)]]).map(([k, l]) => `<option value="${k}" ${u.start == k ? "selected" : ""}>${l}</option>`).join("")}</select>
<p class="lab">Barra de pestañas</p><div class="chips"><button class="chip ${u.nav != "b" ? "on" : ""}" onclick="uiSet('nav','t')">Arriba</button><button class="chip ${u.nav == "b" ? "on" : ""}" onclick="uiSet('nav','b')">Abajo</button></div>
<p class="lab">Color de la app</p><button onclick="colOpen=!colOpen;R()" aria-expanded="${colOpen}" aria-label="Elegir color de la app" style="display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);border-radius:99px;padding:5px 12px 5px 5px;cursor:pointer;font:inherit;color:var(--mut);margin-bottom:${colOpen ? 6 : 12}px"><span style="width:26px;height:26px;border-radius:50%;background:var(--acc)"></span>${colOpen ? "▴" : "▾"}</button>${colOpen ? `<div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 2px 14px">${Object.entries(ACC).map(([k, [n, l]]) => `<button onclick="colOpen=false;uiSet('color','${k}')" title="${n}" aria-label="${n}" aria-pressed="${u.color == k}" style="width:34px;height:34px;border-radius:50%;border:0;cursor:pointer;background:${l};${u.color == k ? "box-shadow:0 0 0 3px var(--card),0 0 0 5px var(--tx)" : ""}"></button>`).join("")}</div>` : ""}
<p class="lab">Tema</p><div class="chips">${[["auto", "Automático"], ["light", "Claro"], ["dark", "Oscuro"]].map(([k, v]) => `<button class="chip ${u.theme == k ? "on" : ""}" onclick="uiSet('theme','${k}')">${v}</button>`).join("")}</div>
<label class="chk" style="${u.both ? "opacity:.45" : ""}"><input type="checkbox" ${u.work ? "checked" : ""} ${u.both ? "disabled" : ""} onchange="uiSet('work',this.checked)"><b>Trabajo (tengo sueldo en vez de paga)</b></label>
<label class="chk" style="${u.work ? "opacity:.45" : ""}"><input type="checkbox" ${u.both ? "checked" : ""} ${u.work ? "disabled" : ""} onchange="uiSet('both',this.checked)"><b>Tengo paga y sueldo (botón Paga / Sueldo arriba)</b></label>
${u.both ? `<label class="chk" style="margin-left:32px"><input type="checkbox" ${u.uni ? "checked" : ""} onchange="uiSet('uni',this.checked)"><b>Unificar paga y sueldo en una sola vista</b></label>` : ""}
<p class="lab" style="margin-top:6px">Explicaciones de cómo se usa</p><div class="chips">${[["auto", "Quitar cuando ya sé usarla"], ["on", "Mostrar siempre"], ["off", "No mostrar"]].map(([k, v]) => `<button class="chip ${u.hints == k ? "on" : ""}" onclick="uiSet('hints','${k}')">${v}</button>`).join("")}</div><label class="chk" style="margin-top:12px"><input type="checkbox" ${u.sub !== false ? "checked" : ""} onchange="uiSet('sub',this.checked)"><b>Usar subcategorías</b></label>
<label class="chk"><input type="checkbox" ${u.big ? "checked" : ""} onchange="uiSet('big',this.checked)"><b>Letra más grande</b></label>
<button class="chip" style="width:100%" onclick="uiReset()">Volver a como venía</button></div>`;
}
let accO = new Set();
const ACCD = { "Categorías y subcategorías": "Nombres, colores y subcategorías", "Cuentas": "Tarjetas, cuentas y efectivo", "Contactos": "Favoritos y lista de contactos", "Exportar a Excel": "Tus movimientos en una hoja de cálculo", "Tu paga": "Paga, ahorro y moneda", "Tu paga y sueldo": "Paga, sueldo, día de cobro y ahorro", "Tu sueldo": "Sueldo, día de cobro, pagas extra y ahorro", "Límite al mes por categoría": "Te avisa si te pasas en una categoría", "Gastos fijos automáticos": "Suscripciones y pagos de cada mes", "Avisos": "Recordatorios", "Copia de seguridad": "Automática en Supabase y copia en archivo", "Pagos con Apple Pay": "Conexión con Supabase y atajos", "Personalizar la app": "Pestañas, orden, barra, tema y letra" };
function accSet() {
  [...$("app").children].forEach((c) => {
    if (!c.classList.contains("card")) return;
    const h = c.querySelector(":scope>h2");
    if (!h) return;
    const t = h.textContent, d = document.createElement("details");
    d.className = "card acc";
    if (accO.has(t)) d.open = true;
    const s = document.createElement("summary");
    s.innerHTML = `<span style="min-width:0"><h2>${esc(t)}</h2><span class="d">${ACCD[t] || ""}</span></span>`;
    h.remove();
    const b = document.createElement("div");
    b.className = "bd";
    while (c.firstChild) b.appendChild(c.firstChild);
    d.append(s, b);
    d.addEventListener("toggle", () => {
      if (!d.isConnected) return;
      if (d.open) {
        accO = new Set([t]);
        document.querySelectorAll("#app details.acc[open]").forEach((o) => {
          if (o !== d) o.open = false;
        });
      } else accO.delete(t);
    });
    c.replaceWith(d);
  });
  const ORD = ["Personalizar la app", "Tu paga", "Tu sueldo", "Tu paga y sueldo", "Categorías y subcategorías", "Cuentas", "Contactos", "Límite al mes por categoría", "Gastos fijos automáticos", "Exportar a Excel", "Avisos", "Pagos con Apple Pay", "Copia de seguridad"], app = $("app"), ds = [...app.querySelectorAll(":scope>details.acc")], pos = (d) => {
    const i = ORD.indexOf(d.querySelector("h2").textContent);
    return i < 0 ? 99 : i;
  };
  ds.sort((a, b) => pos(a) - pos(b)).forEach((d) => app.appendChild(d));
  app.querySelectorAll(":scope>p.tip").forEach((p) => app.appendChild(p));
}
let recE = null, ob = 0, obm = "p", obOn = false;
const PAL = ["acc", "#d98a2b", "#b5514a", "#4a78b5", "#8a6bb0", "#c2447a", "#0f7d86", "#8a5a3b", "#6b7a2e", "#2f5fa7", "#c05a14", "#8b8f8c"], PALN = { acc: "Color de la app", "#d98a2b": "Mostaza", "#b5514a": "Rojo teja", "#4a78b5": "Azul", "#8a6bb0": "Lila", "#c2447a": "Rosa", "#0f7d86": "Turquesa", "#8a5a3b": "Marrón", "#6b7a2e": "Verde oliva", "#2f5fa7": "Azul oscuro", "#c05a14": "Naranja", "#8b8f8c": "Gris" };
let cpk = null;
function defAc() {
  return AC.includes("Tarjeta de crédito") ? "Tarjeta de crédito" : AC[0];
}
function accSync() {
  if (!Array.isArray(S.accs) || !S.accs.length) S.accs = AC.map((n, i) => ({ n, c: CC[i] || PAL[(i + 3) % PAL.length] }));
  AC.splice(0, AC.length, ...S.accs.map((x) => x.n));
  CC.splice(0, CC.length, ...S.accs.map((x) => x.c == "acc" ? "var(--acc)" : x.c));
}
function accUsed(n) {
  return S.tx.some((t) => t.ac == n || t.dac == n) || (S.bz || []).some((x) => x.ac == n) || (S.rec || []).some((x) => x.ac == n) || (S.tr || []).some((x) => x.f == n || x.t == n) || Math.abs(bal(n)) > 4e-3;
}
function accOk(n, skip) {
  if (!n) {
    toast("Escribe un nombre");
    return false;
  }
  if (S.accs.some((x, i) => i !== skip && x.n.toLowerCase() == n.toLowerCase())) {
    toast("Ya hay una cuenta con ese nombre");
    return false;
  }
  return true;
}
function accAdd(id) {
  const e = $(id || "an"), n = clean(e && e.value);
  if (!accOk(n)) return;
  const used = S.accs.map((x) => x.c), c = PAL.find((x) => x != "acc" && !used.includes(x)) || PAL[1];
  S.accs.push({ n, c });
  accSync();
  save();
  R();
  toast("Cuenta «" + n + "» añadida");
}
function accRen(i, v) {
  const o = S.accs[i].n, n = clean(v);
  if (n == o) return;
  if (!accOk(n, i)) {
    R();
    return;
  }
  const sw = (x) => x == o ? n : x;
  S.tx.forEach((t) => {
    t.ac = sw(t.ac);
    if (t.dac) t.dac = sw(t.dac);
  });
  (S.bz || []).forEach((x) => x.ac = sw(x.ac));
  (S.rec || []).forEach((x) => x.ac = sw(x.ac));
  (S.tr || []).forEach((x) => {
    x.f = sw(x.f);
    x.t = sw(x.t);
  });
  if (S.acc && S.acc[o] != null) {
    S.acc[n] = S.acc[o];
    delete S.acc[o];
  }
  S.pacc = sw(S.pacc);
  S.sacc = sw(S.sacc);
  S.dac = sw(S.dac);
  if (ca == o) ca = n;
  S.accs[i].n = n;
  accSync();
  save();
  R();
  toast("Cuenta renombrada");
}
function accCol(i, v) {
  S.accs[i].c = v;
  accSync();
  save();
  R();
}
function accMv(i, d) {
  const j = i + d;
  if (j < 0 || j >= S.accs.length) return;
  [S.accs[i], S.accs[j]] = [S.accs[j], S.accs[i]];
  accSync();
  save();
  R();
}
function accDel(i) {
  const n = S.accs[i].n;
  if (S.accs.length < 2) {
    toast("Tiene que quedar al menos una cuenta");
    return;
  }
  if (accUsed(n)) {
    toast("«" + n + "» tiene movimientos o saldo. Cámbiale el nombre en vez de borrarla");
    return;
  }
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  S.accs.splice(i, 1);
  if (S.acc) delete S.acc[n];
  accSync();
  save();
  R();
  toast("Cuenta borrada", 1);
}
let apk = null;
function swatch(cur, fn, i, list) {
  return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:6px 0 12px">${(list || PAL).map((c) => `<button onclick="apk=null;cpk=null;${fn}(${i},'${c}')" style="display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;cursor:pointer;font:inherit;font-size:11px;color:var(--tx)"><span style="width:30px;height:30px;border-radius:50%;background:${c == "acc" ? "var(--acc)" : c};${c == cur ? "box-shadow:0 0 0 3px var(--card),0 0 0 5px var(--tx)" : ""}"></span>${list ? ACC[c][0] : PALN[c]}</button>`).join("")}</div>`;
}
function catSync() {
  if (!Array.isArray(S.cats) || !S.cats.length) S.cats = EC.map((n, i) => ({ n, c: P[i] || PAL[i % PAL.length] }));
  if (!S.cats.some((x) => x.n == "Otros")) S.cats.push({ n: "Otros", c: "#8b8f8c" });
  S.cats.forEach((x) => {
    if (x.c == "#1f6f5c") x.c = "acc";
  });
  EC.splice(0, EC.length, ...S.cats.map((x) => x.n));
  P.splice(0, P.length, ...S.cats.map((x) => x.c == "acc" ? "var(--acc)" : x.c));
  CATS.splice(0, CATS.length, ...EC, "Bizum");
  accSync();
}
function catOk(n, skip) {
  if (!n) {
    toast("Escribe un nombre");
    return false;
  }
  if (n.toLowerCase() == "bizum" || S.cats.some((x, i) => i !== skip && x.n.toLowerCase() == n.toLowerCase())) {
    toast("Ya hay una categoría con ese nombre");
    return false;
  }
  return true;
}
function catAdd() {
  const n = clean($("cn").value);
  if (!catOk(n)) return;
  const used = S.cats.map((x) => x.c), c = PAL.find((x) => !used.includes(x)) || PAL[S.cats.length % PAL.length], io = S.cats.findIndex((x) => x.n == "Otros");
  S.cats.splice(io < 0 ? S.cats.length : io, 0, { n, c });
  catSync();
  save();
  R();
  toast("Categoría añadida");
}
function catRen(i, v) {
  const o = S.cats[i].n, n = clean(v);
  if (n == o) return;
  if (o == "Otros" || !catOk(n, i)) {
    R();
    return;
  }
  S.tx.forEach((t) => {
    if (t.c == o) t.c = n;
  });
  (S.rec || []).forEach((r) => {
    if (r.c == o) r.c = n;
  });
  (S.bz || []).forEach((x) => {
    if (x.cat == o) x.cat = n;
  });
  (S.subs || []).forEach((x) => {
    if (x.c == o) x.c = n;
  });
  if (S.bud && S.bud[o] != null) {
    S.bud[n] = S.bud[o];
    delete S.bud[o];
  }
  S.cats[i].n = n;
  catSync();
  save();
  R();
  toast("Categoría renombrada");
}
function catCol(i, v) {
  S.cats[i].c = v;
  catSync();
  save();
  R();
}
function catMv(i, d) {
  const j = i + d;
  if (j < 0 || j >= S.cats.length) return;
  [S.cats[i], S.cats[j]] = [S.cats[j], S.cats[i]];
  catSync();
  save();
  R();
}
function catDel(i) {
  const o = S.cats[i].n;
  if (o == "Otros") return;
  L = { k: "all", v: JSON.parse(JSON.stringify(S)) };
  S.tx.forEach((t) => {
    if (t.c == o) t.c = "Otros";
  });
  (S.rec || []).forEach((r) => {
    if (r.c == o) r.c = "Otros";
  });
  (S.bz || []).forEach((x) => {
    if (x.cat == o) x.cat = "Otros";
  });
  (S.subs || []).forEach((x) => {
    if (x.c == o) x.c = "Otros";
  });
  if (S.bud) delete S.bud[o];
  S.cats.splice(i, 1);
  catSync();
  save();
  R();
  toast("«" + o + "» borrada. Sus gastos pasan a Otros", 1);
}
function vCats() {
  return `<div class="card"><h2>Categorías y subcategorías</h2><p class="lab" style="margin-top:4px">Categorías</p>${S.cats.map((x, i) => `<div class="li"><button onclick="cpk=cpk===${i}?null:${i};R()" aria-label="Cambiar color de ${esc(x.n)} (ahora ${PALN[x.c] || "personalizado"})" aria-expanded="${cpk === i}" style="width:30px;height:30px;flex:none;border-radius:50%;border:${cpk === i ? "3px solid var(--tx)" : "0"};background:${x.c == "acc" ? "var(--acc)" : x.c};cursor:pointer"></button><input value="${esc(x.n)}" ${x.n == "Otros" ? 'disabled title="Otros no se puede cambiar"' : ""} onchange="catRen(${i},this.value)" style="flex:1;min-width:0" aria-label="Nombre de la categoría"><button class="x" onclick="catMv(${i},-1)" aria-label="Subir" ${i ? "" : 'disabled style="opacity:.25"'}>▲</button><button class="x" onclick="catMv(${i},1)" aria-label="Bajar" ${i < S.cats.length - 1 ? "" : 'disabled style="opacity:.25"'}>▼</button>${x.n == "Otros" ? '<span style="width:30px;flex:none"></span>' : `<button class="x" onclick="catDel(${i})" aria-label="Borrar ${esc(x.n)}">${ic("x", 16)}</button>`}</div>${cpk === i ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:6px 0 12px">${PAL.map((c) => `<button onclick="cpk=null;catCol(${i},'${c}')" style="display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;cursor:pointer;font:inherit;font-size:11px;color:var(--tx)"><span style="width:30px;height:30px;border-radius:50%;background:${c == "acc" ? "var(--acc)" : c};${c == x.c ? "box-shadow:0 0 0 3px var(--card),0 0 0 5px var(--tx)" : ""}"></span>${PALN[c]}</button>`).join("")}</div>` : ""}`).join("")}<div style="display:flex;gap:8px;margin-top:10px"><input id="cn" placeholder="Nueva categoría (ej. Coche)" style="flex:1;min-width:0" onkeydown="if(event.key=='Enter')catAdd()"><button class="chip on" onclick="catAdd()">Añadir</button></div><p class="mut hint" style="margin-top:8px;font-size:13px">Toca el círculo para elegir otro color. Si borras una categoría, sus gastos pasan a «Otros».</p>${subSec()}</div><div class="card"><h2>Cuentas</h2>${S.accs.map((x, i) => `<div class="li"><button onclick="apk=apk===${i}?null:${i};R()" aria-label="Cambiar color de ${esc(x.n)}" aria-expanded="${apk === i}" style="width:30px;height:30px;flex:none;border-radius:50%;border:${apk === i ? "3px solid var(--tx)" : "0"};background:${x.c == "acc" ? "var(--acc)" : x.c};cursor:pointer"></button><input value="${esc(x.n)}" onchange="accRen(${i},this.value)" style="flex:1;min-width:0" aria-label="Nombre de la cuenta"><button class="x" onclick="accMv(${i},-1)" aria-label="Subir" ${i ? "" : 'disabled style="opacity:.25"'}>▲</button><button class="x" onclick="accMv(${i},1)" aria-label="Bajar" ${i < S.accs.length - 1 ? "" : 'disabled style="opacity:.25"'}>▼</button><button class="x" onclick="accDel(${i})" aria-label="Borrar ${esc(x.n)}">${ic("x", 16)}</button></div>${apk === i ? swatch(x.c, "accCol", i) : ""}`).join("")}<div style="display:flex;gap:8px;margin-top:10px"><input id="an" placeholder="Nueva cuenta (ej. Revolut, hucha…)" style="flex:1;min-width:0" onkeydown="if(event.key=='Enter')accAdd('an')"><button class="chip on" onclick="accAdd('an')">Añadir</button></div>
</div>`;
}
let ctq = "";
function vCont() {
  const fv = contAll().filter((c) => c.fav).sort((a, b) => a.n.localeCompare(b.n));
  return `<div class="card"><h2>Contactos</h2><p class="lab" style="margin-top:4px">${ic("star", 13, 1)} Favoritos</p>${fv.length ? `<div class="chips">${fv.map((c) => `<span class="chip" style="display:inline-flex;align-items:center;gap:6px;padding:6px 6px 6px 12px;background:var(--amb);border-color:var(--amb);color:#fff;font-weight:600">★ ${esc(c.n)}<button data-n="${esc(c.n)}" onclick="contFav(this.dataset.n)" aria-label="Quitar ${esc(c.n)} de favoritos" style="border:0;background:rgba(255,255,255,.3);color:#fff;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:12px;line-height:1">${ic("x", 16)}</button></span>`).join("")}</div>` : '<p class="mut" style="font-size:14px;margin-bottom:6px">Aún no tienes favoritos.<span class="hint"> Toca <b>' + ic("star", 13) + " Favorito</b> en alguien de la lista.</span></p>"}
<p class="lab" style="margin-top:14px">Todos tus contactos</p><input id="cts" class="srch" placeholder="Buscar o añadir contacto" autocomplete="off" autocorrect="off" value="${esc(ctq)}" oninput="ctSrch(this.value)" onkeydown="if(event.key=='Enter'&&this.value.trim()&&!contAll().some(c=>nrm(c.n)==nrm(this.value)))cAddS(this.value.trim())" style="margin-bottom:6px"><div id="ctL">${ctList(ctq)}</div><p class="mut hint" style="font-size:13px;margin-top:6px">Los favoritos salen siempre los primeros al apuntar un Bizum. Después, los últimos que has usado.</p></div>`;
}
function setBalQ(a, v) {
  const c = bal(a);
  S.acc[a] = (S.acc[a] || 0) + v - c;
  if (!S.since) S.since = today();
}
function obRd() {
  const v = (id) => {
    const e = $(id);
    return e ? e.value === "" ? null : parseFloat(e.value) || 0 : void 0;
  };
  if (ob == 0) {
    const p = v("obp"), s = v("obs");
    if (obm == "p") {
      if (p !== void 0) S.paga = p || 0;
    } else if (obm == "s") {
      if (s !== void 0) S.paga = s || 0;
    } else {
      if (p !== void 0) S.paga = p || 0;
      if (s !== void 0) S.sal = s || 0;
    }
  }
  if (ob == 1) {
    const m = v("obmt");
    if (m !== void 0) S.meta = m || 0;
  }
  if (ob == 2) AC.forEach((a, i) => {
    const x = v("oba" + i);
    if (x != null) setBalQ(a, x);
  });
}
function obSet(k) {
  obRd();
  obm = k;
  S.ui = Object.assign(UI(), { work: k == "s", both: k == "b" });
  R();
}
function obGo(d) {
  obRd();
  if (ob + d > 2) {
    obEnd();
    return;
  }
  ob = Math.max(0, ob + d);
  R();
  scrollTo(0, 0);
}
function obEnd() {
  obRd();
  obOn = false;
  ob = 0;
  S.onb = 1;
  save();
  tab = "res";
  R();
  toast("¡Listo! Ya puedes empezar a apuntar");
  if (!S.tourDone) setTimeout(tourGo, 900);
}
function vOnb() {
  const st = [
    `<h2 style="font-size:22px;margin-bottom:4px">¡Hola! ${ic("hand", 22)}</h2><p class="mut" style="margin-bottom:16px">Tres preguntas rápidas y empiezas.</p><p class="lab">¿Qué dinero te entra cada mes?</p><div class="chips">${[["p", "Paga"], ["s", "Sueldo"], ["b", "Paga y sueldo"]].map(([k, l]) => `<button class="chip ${obm == k ? "on" : ""}" onclick="obSet('${k}')">${l}</button>`).join("")}</div>${obm != "s" ? `<p class="lab">Paga al mes</p><input id="obp" type="number" inputmode="decimal" min="0" placeholder="0" value="${S.paga || ""}" style="margin-bottom:10px">` : ""}${obm != "p" ? `<p class="lab">Sueldo neto al mes</p><input id="obs" type="number" inputmode="decimal" min="0" placeholder="0" value="${(obm == "s" ? S.paga : S.sal) || ""}">` : ""}`,
    `<h2 style="font-size:22px;margin-bottom:4px">¿Quieres ahorrar cada mes?</h2><p class="mut" style="margin-bottom:16px">Esa cantidad no contará como dinero para gastar. Puedes dejarlo vacío.</p><p class="lab">Ahorro al mes</p><input id="obmt" type="number" inputmode="decimal" min="0" placeholder="0" value="${S.meta || ""}">`,
    `<h2 style="font-size:22px;margin-bottom:4px">¿Cuánto tienes ahora?</h2><p class="mut" style="margin-bottom:16px">Así la app lleva el saldo de tus cuentas. Si no lo sabes, déjalo vacío.</p>${AC.map((a, i) => `<p class="lab">${a}</p><input id="oba${i}" type="number" inputmode="decimal" step="0.01" placeholder="0" style="margin-bottom:10px">`).join("")}<div class="al" style="margin-top:8px">${ic("bulb", 16)} En <b>Ajustes</b> puedes dejar la app a tu gusto: colores, pestañas, categorías, cuentas y mucho más.</div>`
  ];
  return `<div class="card" style="padding:20px;margin-top:6px"><div style="display:flex;gap:6px;margin-bottom:18px" aria-label="Paso ${ob + 1} de 3">${st.map((_, i) => `<i style="flex:1;height:5px;border-radius:9px;background:${i <= ob ? "var(--acc)" : "var(--line)"}"></i>`).join("")}</div>${st[ob]}<div style="display:flex;gap:8px;margin-top:20px">${ob ? '<button class="chip" onclick="obGo(-1)">Atrás</button>' : ""}<button class="b" style="flex:1" onclick="obGo(1)">${ob < 2 ? "Siguiente" : "Empezar"}</button></div><button style="display:block;width:100%;margin-top:12px;border:0;background:none;color:var(--mut);font:inherit;cursor:pointer;padding:8px" onclick="obEnd()">Saltar por ahora</button></div>`;
}
async function saveFile(name, data, mime) {
  if (/iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.standalone) {
    fileSheet(name, data, mime || "text/csv");
    return true;
  }
  try {
    const file = new File([data], name, { type: mime });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      toast("Archivo listo");
      return true;
    }
  } catch (e) {
    if (e && e.name == "AbortError") return false;
  }
  try {
    const u = URL.createObjectURL(new Blob([data], { type: mime })), a = document.createElement("a");
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4e3);
    toast("Archivo descargado");
    return true;
  } catch (e) {
    toast("No se pudo crear el archivo");
    return false;
  }
}
function xls(sc) {
  const y = cm().slice(0, 4), inR = (d) => sc == "m" ? d.startsWith(mo) : sc == "y" ? d.startsWith(y) : true, rows = [];
  S.tx.filter((t) => inR(t.d)).forEach((t) => rows.push([t.d, t.k == "i" ? "Dinero extra" : t.k == "d" ? "Me lo devolvieron" : t.r ? "Me lo devuelven" : "Gasto", t.k == "i" ? "" : t.c, t.what || t.n || "", t.ac || "", t.k == "i" || t.k == "d" ? t.a : -t.a, t.sh != null ? -t.sh : "", t.r ? t.dv ? "Devuelto" : "Pendiente" : t.src == "s" ? "Sueldo" : ""]));
  (S.bz || []).filter((x) => inR(x.d)).forEach((x) => rows.push([x.d, x.t == "env" ? "Bizum enviado" : x.t == "rec" ? "Bizum recibido" : "Me deben (Bizum)", x.cat || "Bizum", (x.p || "") + (x.c ? " · " + x.c : ""), x.ac || "", x.t == "env" ? -x.a : x.a, "", x.t == "deb" ? "Pendiente" : ""]));
  if (!rows.length) {
    toast("No hay movimientos en ese periodo");
    return;
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  const cell = (v) => {
    if (typeof v == "number") return v.toFixed(2).replace(".", ",");
    v = String(v);
    if (/^\d{4}-\d\d-\d\d$/.test(v)) v = fd(v);
    return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  const csv = "\uFEFF" + [["Fecha", "Tipo", "Categoría", "Concepto", "Cuenta", "Importe (" + S.cur + ")", "Tu parte (" + S.cur + ")", "Estado"], ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  saveFile((sc == "m" ? "movimientos-" + mo : sc == "y" ? "movimientos-" + y : "movimientos-todo") + ".csv", csv, "text/csv");
}
function vExp() {
  const mn = (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return `<div class="card"><h2>Exportar a Excel</h2><button class="b" onclick="xls('m')">Movimientos de ${mn}</button><button class="chip" style="width:100%;margin-top:8px" onclick="xls('y')">Todo ${cm().slice(0, 4)}</button><button class="chip" style="width:100%;margin-top:8px" onclick="xls('a')">Todo desde el principio</button><p class="mut hint" style="margin-top:8px;font-size:13px">Se abre con Excel, Numbers o Google Sheets.</p></div>`;
}
function vPre() {
  const rr = recE && S.rec.find((x) => x.id == recE), rfu = rr ? rr.fu || "m" : "m", rfn = rr ? rr.fn || 1 : 1, rfv0 = rfu + rfn, rfv = rr ? ["m1", "m2", "m3", "m6", "m12", "w1", "w2"].includes(rfv0) ? rfv0 : "c" : "m1", rcv = rfu == "m" && rfn % 12 == 0 ? [rfn / 12, "y"] : [rfn, rfu];
  rEm = rr ? rr.until ? "d" : rr.times ? "t" : "n" : "n";
  const s = cat(mo);
  return `<div class="card"><h2>${UI().both ? "Tu paga y sueldo" : W("Tu sueldo", "Tu paga")}</h2>
<p class="lab">${UI().both ? "Paga mensual" : W("Sueldo neto al mes", "Paga mensual")}</p><input type="number" inputmode="decimal" min="0" value="${S.paga || ""}" placeholder="0" onchange="S.paga=parseFloat(this.value)||0;save();R()" style="margin-bottom:10px">
${UI().both ? `<p class="lab">Sueldo neto al mes</p><input type="number" inputmode="decimal" min="0" value="${S.sal || ""}" placeholder="0" onchange="S.sal=parseFloat(this.value)||0;save();R()" style="margin-bottom:10px">` : ""}${!UI().work ? `<p class="lab">${UI().both ? "Día en que te llega la paga" : "Día del mes en que te llega la paga"}</p><select onchange="S.pdayP=+this.value;save();R()" style="margin-bottom:10px">${[...Array(31)].map((_, i) => `<option value="${i + 1}" ${(S.pdayP || 1) == i + 1 ? "selected" : ""}>Día ${i + 1}</option>`).join("")}</select>` : ""}${UI().work || UI().both ? `<p class="lab">${UI().both ? "Día de cobro del sueldo" : "Día de cobro"}</p><select onchange="S.pday=+this.value;save();R()" style="margin-bottom:10px">${[...Array(31)].map((_, i) => `<option value="${i + 1}" ${(S.pday || 1) == i + 1 ? "selected" : ""}>Día ${i + 1}</option>`).join("")}</select><p class="lab">Paga extra (importe)</p><input type="number" inputmode="decimal" min="0" value="${S.pext || ""}" placeholder="0" onchange="S.pext=parseFloat(this.value)||0;save();R()" style="margin-bottom:8px"><p class="lab">Meses con paga extra</p><div class="chips">${["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((l, i) => `<button class="chip ${(S.pextm || [6, 12]).includes(i + 1) ? "on" : ""}" style="padding:7px 10px;font-size:14px" onclick="tgPx(${i + 1})">${l}</button>`).join("")}</div>` : ""}<p class="lab">Cuánto quieres ahorrar cada mes</p><input type="number" inputmode="decimal" min="0" value="${S.meta || ""}" placeholder="0" onchange="S.meta=parseFloat(this.value)||0;save();R()" style="margin-bottom:10px"><p class="lab">Contar el ahorro desde</p><input type="date" value="${S.ini || S.since || ""}" onchange="S.ini=this.value||'';save();R()" style="margin-bottom:4px"><p class="tip hint" style="margin:0 0 10px">Los meses anteriores no cuentan para «Ahorrado en total». No cambia los saldos de tus cuentas.</p>
<p class="lab">Moneda principal</p><input id="cur1" placeholder="Escribe: euros, libras, dólares…" value="${curLbl(S.cur)}" onfocus="this.select();curSrch('cur1','setCur')" oninput="curSrch('cur1','setCur')" autocomplete="off"><div id="cur1l" style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 4px"></div>
<label class="chk" style="margin-top:6px"><input type="checkbox" ${S.c2 ? "checked" : ""} onchange="tgC2(this.checked)"><b>Ver también en otra moneda</b></label>
${S.c2 ? `<p class="lab">Segunda moneda</p><input id="cur2" placeholder="Escribe: dólares, libras…" value="${curLbl(S.c2.cur)}" onfocus="this.select();curSrch('cur2','setCur2')" oninput="curSrch('cur2','setCur2')" autocomplete="off"><div id="cur2l" style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 4px"></div><p class="lab" style="margin-top:8px">Cambio</p><div class="chips" style="margin-bottom:8px"><button class="chip ${!S.c2.man ? "on" : ""}" onclick="S.c2.man=0;save();R();c2Get()">Automático</button><button class="chip ${S.c2.man ? "on" : ""}" onclick="S.c2.man=1;save();R()">Manual</button></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="mut">1 ${S.cur} =</span><input type="number" inputmode="decimal" step="0.0001" min="0" value="${S.c2.rate || ""}" placeholder="cambio" ${S.c2.man ? "" : 'readonly style="width:110px;opacity:.75"'} onchange="S.c2.rate=parseFloat(this.value)||0;S.c2.man=1;save();R()" ${S.c2.man ? 'style="width:110px"' : ""}><span class="mut">${S.c2.cur}</span></div>${S.c2.man ? "" : `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px"><span class="mut">Actualizar cada</span><select onchange="S.c2.ev=+this.value;save();R()" style="width:auto">${[[1, "hora"], [6, "6 horas"], [12, "12 horas"], [24, "día"], [168, "semana"]].map(([h, l]) => `<option value="${h}" ${(S.c2.ev || 24) == h ? "selected" : ""}>${l}</option>`).join("")}</select></div><p class="mut" style="font-size:13px;margin-top:6px">${S.c2.t ? "Actualizado: " + fd(ymd(new Date(S.c2.t))) + " a las " + new Date(S.c2.t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "Todavía sin actualizar"} · <a href="#" onclick="c2Get();return false">actualizar ahora</a></p>`}` : ""}</div>
<div class="card"><h2>Límite al mes por categoría</h2>${budCard(s)}</div>
<div class="card"><h2>Gastos fijos automáticos</h2>${S.rec.length ? S.rec.map((x) => `<div class="li"><div class="g">${esc(x.n)}<small>${recTxt(x)}</small></div><strong>${f(x.a)}</strong><button class="x" onclick="recEd('${x.id}')" aria-label="Editar ${esc(x.n)}">${ic("pencil", 17)}</button><button class="x" onclick="delR('${x.id}')" aria-label="Eliminar">${ic("x", 16)}</button></div>`).join("") : '<p class="mut hint">Suscripciones, seguros o pagos que se repiten.</p>'}${rr ? `<div class="al" style="margin-top:12px">Editando <b>${esc(rr.n)}</b>. Los cambios se aplican a los próximos cobros.</div>` : ""}
<div class="grid" style="margin-top:10px"><input id="rn" list="rnl" placeholder="Nombre (elige o escribe)" autocomplete="off" oninput="recCat(this.value)" value="${esc(rr ? rr.n : "")}"><datalist id="rnl">${RECS.map((x) => `<option value="${x[0]}">`).join("")}</datalist><input id="ra" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Importe" value="${rr ? rr.a : ""}"><select id="rc2">${EC.map((c) => `<option ${rr && rr.c == c ? "selected" : ""}>${c}</option>`).join("")}</select><select id="rac">${AC.map((a) => `<option ${rr && rr.ac == a ? "selected" : ""}>${a}</option>`).join("")}</select></div>
<div class="grid" style="margin-top:10px"><div><p class="lab">Primer cobro</p><input id="rfd" type="date" value="${rr ? recFirst(rr) : today()}"></div><div><p class="lab">Se repite</p><select id="rfq" onchange="$('rcu').hidden=this.value!='c'">${[["m1", "Cada mes"], ["m2", "Cada 2 meses"], ["m3", "Cada 3 meses"], ["m6", "Cada 6 meses"], ["m12", "Cada año"], ["w1", "Cada semana"], ["w2", "Cada 2 semanas"], ["c", "Personalizar…"]].map(([v, l]) => `<option value="${v}" ${rfv == v ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
<div id="rcu" ${rfv == "c" ? "" : "hidden"} style="margin-top:10px"><p class="lab">Cada</p><div style="display:flex;gap:8px"><input id="rcn" type="number" inputmode="numeric" min="1" step="1" value="${rcv[0]}" style="width:90px"><select id="rcun" style="flex:1">${[["d", "días"], ["w", "semanas"], ["m", "meses"], ["y", "años"]].map(([k, l]) => `<option value="${k}" ${rcv[1] == k ? "selected" : ""}>${l}</option>`).join("")}</select></div></div>
<p class="lab" style="margin-top:10px">Termina</p><div class="chips" id="rEc">${[["n", "Nunca"], ["d", "Un día concreto"], ["t", "Tras varias veces"]].map(([k, l]) => `<button class="chip ${k == rEm ? "on" : ""}" data-k="${k}" onclick="rEnd('${k}')">${l}</button>`).join("")}</div><div id="rED" ${rEm == "d" ? "" : "hidden"}><p class="lab">Último día</p><input id="red" type="date" value="${rr && rr.until || addD(today(), 365)}"></div><div id="rET" ${rEm == "t" ? "" : "hidden"}><p class="lab">Número de veces</p><input id="rtm" type="number" inputmode="numeric" min="1" step="1" value="${rr && rr.times || 12}"></div><button class="b" style="margin-top:10px" onclick="addR()">${rr ? "Guardar cambios" : "Añadir gasto fijo"}</button>${rr ? '<button class="chip" style="width:100%;margin-top:8px" onclick="recE=null;R()">Cancelar</button>' : ""}</div>
<div class="card"><h2>Avisos</h2><div class="li"><div class="g">Recordatorio diario<small>Al abrir la app, te avisa si hoy no has apuntado nada</small></div><input type="checkbox" ${S.rem ? "checked" : ""} onchange="S.rem=this.checked;save()" style="width:24px;height:24px" aria-label="Recordatorio diario"></div>
<div class="li"><div class="g">Avisos del sistema<small>${"Notification" in window ? "Límites de categoría, solo con la app abierta" : "Tu navegador no los admite"}</small></div>${"Notification" in window ? `<button class="chip ${S.sn ? "on" : ""}" onclick="sysN()">${S.sn ? "Activados" : "Activar"}</button>` : ""}</div>
<div class="tip hint">Para un aviso diario real en iPhone: app Atajos → Automatización → Hora del día → «Abrir URL» con el enlace de esta app.</div></div>
<div class="card"><h2>Copia de seguridad</h2><div class="apb" style="background:var(--acc);box-shadow:none;--apc:var(--acc2)"><div class="t">${ic("cloud", 18)} Copia en Supabase</div>${S.sbu && S.sbk ? `<div class="seg" style="margin:6px 0 8px;border-color:rgba(255,255,255,.5)"><button class="${UI().autobk !== false ? "on" : ""}" style="${UI().autobk !== false ? "background:#fff;color:var(--acc2)" : "background:transparent;color:#fff"}" onclick="uiSet('autobk',true);cloud()">Automática</button><button class="${UI().autobk === false ? "on" : ""}" style="${UI().autobk === false ? "background:#fff;color:var(--acc2)" : "background:transparent;color:#fff"}" onclick="uiSet('autobk',false)">Manual</button></div>` : ""}<div class="s">${nbInfo()}</div>${S.sbu && S.sbk ? '<button onclick="nbNow()">Hacer copia ahora</button><button class="sec" onclick="nbRest()">Ver copias para restaurar</button>' : ""}</div>${nbL ? `<div id="nbl" style="margin-bottom:12px"><p class="lab">Elige qué copia quieres recuperar</p>${nbL.map((x, i) => {
    const d = new Date(x.actualizado);
    return `<div class="li"><div class="g">${nbName(x)}<small>${fd(ymd(d))} a las ${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · ${nbDesc(x.datos)}</small></div><button class="chip on" onclick="nbPick(${i})">Restaurar</button></div>`;
  }).join("")}<button class="chip" style="width:100%;margin-top:8px" onclick="nbL=null;R()">Cerrar</button></div>` : ""}<div class="k">${S.lb ? "Última copia: " + S.lb : "Aún no has hecho ninguna copia"}</div><button class="b" style="margin:10px 0" onclick="expB()">Guardar copia</button><p class="lab">Restaurar desde un archivo</p><input type="file" accept=".json,application/json" onchange="impF(this)" style="margin-bottom:10px"><p class="lab">O pega aquí el texto de la copia</p><textarea id="bk" rows="4" style="width:100%;font:inherit;font-size:13px;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--tx)"></textarea><button class="chip" style="margin-top:8px" onclick="impT($('bk').value)">Restaurar</button><div class="tip hint">Guarda el archivo en iCloud Drive (app Archivos) para tenerlo a mano en todos tus dispositivos.</div></div>
<p class="tip hint">Tus datos se guardan en este dispositivo. En iPhone: Safari → Compartir → Añadir a pantalla de inicio, y usa siempre ese icono.</p>
<div class="card" style="margin-top:14px"><h2>Pagos con Apple Pay</h2><p class="mut hint">Cada vez que pagues con Apple Pay, un atajo del iPhone guarda el pago en tu base de datos de Supabase. Al abrir la app te aparece para que lo confirmes.</p>
<p class="lab" style="margin-top:10px">Dirección del proyecto (Project URL)</p><input id="sbu" placeholder="https://xxxx.supabase.co" value="${esc(S.sbu || "")}" autocapitalize="off" autocorrect="off" spellcheck="false">
<p class="lab" style="margin-top:10px">Clave pública (publishable o anon)</p><input id="sbk" placeholder="sb_publishable_…" value="${esc(S.sbk || "")}" autocapitalize="off" autocorrect="off" spellcheck="false">
<button class="b" style="margin-top:10px" onclick="sbSave()">Guardar y comprobar</button>
${S.sbu && S.sbk ? `<p class="lab" style="margin-top:12px">Dirección para el atajo</p><input readonly value="${esc(sbU())}" onclick="this.select()" style="font-size:13px"><button class="chip" style="width:100%;margin-top:8px" onclick="cpy(sbU())">Copiar dirección para el atajo</button><button class="chip" style="width:100%;margin-top:8px" onclick="cpy(S.sbk)">Copiar clave para el atajo</button><button class="chip" style="width:100%;margin-top:8px" onclick="sbTest()">Enviar un pago de prueba</button>` : ""}<div id="sbm" class="al" hidden style="margin-top:10px"></div></div>`;
}
let _all = null, _allOn = false;
// Mientras se pinta una pantalla, ALL() reutiliza el mismo resultado; fuera de ahí se recalcula siempre
function ALL() {
  if (!_allOn) return ALL0();
  return _all || (_all = ALL0());
}
function R() {
  _allOn = true;
  _all = null;
  try {
    R0();
  } finally {
    _allOn = false;
    _all = null;
  }
  try {
    cFit();
  } catch (e) {
  }
  try {
    layApply();
  } catch (e) {
  }
  try {
    srSync();
  } catch (e) {
  }
}
function R0() {
  if (tab != "gas" && tab != "bzf" && tab != "bus" && !tabOk(tab)) tab = firstTab();
  applyUI();
  {
    const u = UI(), sw = u.both && !u.uni, t = $("ttl"), h = $("hw");
    if (t) {
      t.textContent = W("Mi sueldo", "Mi paga");
      t.hidden = sw;
    }
    if (h) h.innerHTML = sw ? `<div class="seg" role="group" aria-label="Paga o sueldo"><button class="${u.view != "s" ? "on" : ""}" onclick="uiSet('view','p')">Paga</button><button class="${u.view == "s" ? "on" : ""}" onclick="uiSet('view','s')">Sueldo</button></div>` : "";
    document.title = W("Mi sueldo", "Mi paga");
  }
  if (obOn) {
    $("nav").style.display = "none";
    $("hn").innerHTML = "";
    $("app").innerHTML = vOnb();
    $("fab").hidden = true;
    return;
  }
  $("nav").style.display = "";
  $("nav").classList.toggle("many", visT().length > 7);
  const n = tab == "res" || tab == "inf" || tab == "biz" ? ["nm", (new Date(mo + "-01T12:00")).toLocaleDateString("es-ES", { month: "long", year: "numeric" })] : tab == "ano" ? ["ny", yr] : tab == "sem" ? ["nw", wl()] : tab == "dia" ? ["nd", (new Date(dday + "T12:00")).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })] : null;
  $("hn").innerHTML = n ? `<button class="x" onclick="${n[0]}(-1)" aria-label="Anterior">${ic("left", 20)}</button><strong style="text-align:center;font-size:15px">${n[1]}</strong><button class="x" onclick="${n[0]}(1)" aria-label="Siguiente">${ic("right", 20)}</button>` : "";
  $("nav").innerHTML = visT().map((k) => [k, k == "inv" ? "Invertir" : tabN(k)]).map(([k, v]) => `<button class="${k == tab || k == "vis" && isV(tab) || k == "biz" && tab == "bzf" ? "on" : ""}" onclick="go('${k}')"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg><span>${v}</span></button>`).join("");
  $("app").innerHTML = (navigator.onLine ? "" : `<div class="offl">${ic("cloud", 15)} Sin conexión. Lo que apuntes se guarda en el móvil y la copia se hace sola al volver internet.</div>`) + (isV(tab) ? vSeg() : "") + (sbDown && S.sbu && navigator.onLine && tab != "gas" && tab != "bzf" && tab != "bus" ? sbBan() : "") + (tab != "gas" && tab != "bzf" && tab != "bus" && tab != "pre" && !sbDown && bkDue() ? bkBan(bkDue()) : "") + (pq.length && tab != "gas" && !(tab == "bzf" && bpi != null) ? `<div class="apb"><div class="t">${qTit()}</div><div class="s">${esc(qDes(pq[0]))}${pq.length > 1 ? " y " + (pq.length - 1) + " más" : ""}</div><button onclick="openP()">Revisar y apuntar</button></div>` : "") + { sem: vSem, ano: vAno, res: vRes, gas: vGas, bzf: vBzF, bus: vBus, cue: vCue, pre: () => vPre() + `<div class="card" style="text-align:center"><p class="mut" style="font-size:13px;margin:0 0 8px">Versión de la app: <b>21 oct · 12:00</b> (cálculos revisados)</p><button class="chip" onclick="updApp()">Buscar actualización</button><p class="mut" style="font-size:12px;margin:8px 0 0">No borra tus datos. Si tienes internet, recarga la app con la última versión.</p></div>` + vCats() + vCont() + vUI() + vExp() + `<div class="endb"><button class="chip" onclick="tourGo()">${ic("play", 17)} Ver tutorial</button><button class="chip" onclick="obOn=true;ob=0;go('res')">${ic("refresh", 17)} Repetir bienvenida</button></div>`, inf: vInf, biz: vBiz, dia: vDia, inv: vInv }[tab]();
  $("fab").hidden = tab == "gas" || tab == "bzf" || tab == "cue" || tab == "bus";
  if (tab == "pre") {
    accSet();
    const eb = document.querySelector("#app>.endb");
    if (eb) $("app").appendChild(eb);
  }
  prApply();
}
const GUESS = [["Gasolina", /repsol|cepsa|\bbp\b|galp|shell|petronor|gasolin|ballenoil|plenoil|petroprix|esclatoil|carburante/], ["Comida fuera de casa", /restaurante|\bbar\b|caf[eé]|cafeter|mcdonald|burger|telepizza|domino|kfc|starbucks|glovo|just ?eat|uber ?eats|tgb|foster|vips|montaditos|goiko|rodilla|taberna|pizzer|kebab|sushi|brasa|cervecer/], ["Salidas y ocio", /cine|yelmo|kinepolis|teatro|discoteca|spotify|netflix|steam|bolera|concierto|ticketmaster/], ["Comida", /mercadona|carrefour|lidl|aldi|\bdia\b|eroski|alcampo|consum|hipercor|supermerc|bonpreu|condis|ahorramas|spar|froiz|gadis|masymas|caprabo|fruter|panader|carnicer/]];
function guessC(m) {
  m = m.toLowerCase();
  const g = GUESS.find((x) => x[1].test(m));
  return g && EC.includes(g[0]) ? g[0] : "Otros";
}
function pAmt(s) {
  s = String(s).replace(/[^\d,.]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (s.includes(",")) s = s.replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  return rnd(parseFloat(s));
}
let ap = "";
function fromURL() {
  const h = decodeURI(location.hash);
  if (!/^#gasto/.test(h)) return false;
  const p = new URLSearchParams(location.hash.slice(location.hash.indexOf("?") + 1)), a = pAmt(p.get("importe") || ""), m = (p.get("comercio") || "").trim();
  try {
    history.replaceState(null, "", location.pathname + location.search);
  } catch (e) {
  }
  if (tab != "gas") pt = tab;
  Object.assign(q, { id: null, spf: false, dvf: false, sp: false, k: "g", w: "p", a: a > 0 ? String(a) : "", n: m, what: m, d: "", ac: defAc(), c: learnC(m) || guessC(m), rc: learnC(m) || guessC(m) });
  ap = m || "Apple Pay";
  tab = "gas";
  return true;
}
window.addEventListener("hashchange", () => {
  if (fromURL()) {
    R();
    scrollTo(0, 0);
  }
});
let pq = [], pqi = null, bpi = null;
const isBz = (x) => /^\s*bizum/i.test(x.comercio || ""), bzT = (x) => /hicieron|recib/i.test(x.comercio) ? "rec" : /deben/i.test(x.comercio) ? "deb" : "env";
function bzP(t) {
  t = String(t || "").trim();
  const m = t.match(/(\d+(?:[.,]\d+)*)\s*(?:€|euros?)/i) || t.match(/(\d+(?:[.,]\d+)*)/);
  if (!m) return { p: t, a: "", c: "" };
  const a = pAmt(m[1]);
  return { p: t.slice(0, m.index).trim(), a: a > 0 ? String(a) : "", c: t.slice(m.index + m[0].length).trim() };
}
function qDes(x) {
  if (isBz(x)) {
    const b = bzP(x.importe);
    return { rec: "Bizum de ", env: "Bizum a ", deb: "Te debe " }[bzT(x)] + (b.p || "?") + (b.a ? " · " + f(+b.a) : "");
  }
  return (x.comercio || "Pago") + " · " + f(pAmt(x.importe || ""));
}
function qTit() {
  const b = pq.filter(isBz).length, a = pq.length - b, w = [];
  if (a) w.push(a == 1 ? "1 pago de Apple Pay" : a + " pagos de Apple Pay");
  if (b) w.push(b == 1 ? "1 Bizum" : b + " Bizums");
  return (b && !a ? ic("phone", 18) : ic("card", 18)) + " Tienes " + w.join(" y ") + " por revisar";
}
function doneQ(id) {
  pq = pq.filter((x) => x.id != id);
  S.apd = [...S.apd || [], id];
  save();
  badge();
  sbDel(id);
}
function openB(x) {
  const b = bzP(x.importe), dt = new Date(x.creado);
  if (tab != "gas") pt = tab;
  pqi = null;
  ap = "";
  Object.assign(bq, { t: bzT(x), p: b.p, a: b.a, c: b.c, d: isNaN(dt) ? "" : ymd(dt), ac: defAc(), dv: true, lk: "", lkt: 0 });
  bpi = x.id;
  pDupTxt = pDup(x);
  if (tab != "bzf" && tab != "gas") bzPt = tab;
  tab = "bzf";
  R();
  scrollTo(0, 0);
  if (!b.a) {
    const e = $("ba");
    if (e) e.focus();
  }
}
function skipB() {
  if (bpi == null) return;
  doneQ(bpi);
  bpi = null;
  bq.p = "";
  bq.a = "";
  bq.c = "";
  bq.d = "";
  toast("Bizum descartado");
  if (tab == "bzf") tab = bzPt || "biz";
  if (pq.length) openP();
  else R();
}
const sbH = () => {
  const h = { apikey: S.sbk, "Content-Type": "application/json" };
  if (/^eyJ/.test(S.sbk || "")) h.Authorization = "Bearer " + S.sbk;
  return h;
}, sbU = (p) => (S.sbu || "").replace(/\/+$/, "") + "/rest/v1/pagos_pendientes" + (p || "");
async function sbDel(id) {
  try {
    const r = await fetch(sbU("?id=eq." + id), { method: "DELETE", headers: sbH() });
    if (r.ok) {
      S.apd = (S.apd || []).filter((x) => x != id);
      save();
    }
  } catch (e) {
  }
}
async function pull() {
  if (!S.sbu || !S.sbk) return;
  try {
    const r = await sbF(sbU("?select=*&order=creado.asc"), { headers: sbH() });
    if (!r.ok) return;
    const l = await r.json(), dn = S.apd || [];
    l.filter((x) => dn.includes(x.id)).forEach((x) => sbDel(x.id));
    pq = l.filter((x) => !dn.includes(x.id));
    badge();
    if (tab != "gas") R();
  } catch (e) {
  }
}
function openP() {
  const x = pq[0];
  if (!x) return;
  if (isBz(x)) {
    openB(x);
    return;
  }
  bpi = null;
  if (tab != "gas") pt = tab;
  const m = (x.comercio || "").trim(), a = pAmt(x.importe || ""), dt = new Date(x.creado);
  Object.assign(q, { id: null, k: "g", w: "p", a: a > 0 ? String(a) : "", n: isNaN(dt) ? m : (m ? m + " · " : "") + dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), what: m, d: isNaN(dt) ? "" : ymd(dt), ac: defAc(), c: learnC(m) || guessC(m), rc: learnC(m) || guessC(m) });
  ap = m || "Apple Pay";
  pqi = x.id;
  pDupTxt = pDup(x);
  tab = "gas";
  R();
  scrollTo(0, 0);
}
function badge() {
  try {
    if (navigator.setAppBadge) pq.length ? navigator.setAppBadge(pq.length) : navigator.clearAppBadge();
  } catch (e) {
  }
}
function doneP() {
  if (pqi == null) return;
  const id = pqi;
  pqi = null;
  pq = pq.filter((x) => x.id != id);
  badge();
  S.apd = [...S.apd || [], id];
  save();
  sbDel(id);
}
function skipP() {
  doneP();
  toast("Pago descartado");
  if (pq.length) openP();
  else {
    ap = "";
    q.a = "";
    q.n = "";
    q.what = "";
    tab = pt || "res";
    R();
    scrollTo(0, 0);
  }
}
function cpy(t) {
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("Copiado"), () => toast("Cópialo del cuadro"));
}
// Detecta si Supabase no responde (normalmente porque el plan gratis lo ha pausado)
let sbDown = 0;
function sbMark(v) {
  if (sbDown != v) {
    sbDown = v;
    try {
      R();
    } catch (e) {
    }
  }
}
function sbF(u, o) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), 12e3), sb = /supabase\.co/.test(u);
  return fetch(u, Object.assign({}, o, { signal: c.signal })).then((r) => {
    if (sb) {
      if (r.status >= 500 || r.status == 540) sbMark(1);
      else if (r.status < 400) sbMark(0);
    }
    return r;
  }, (e) => {
    if (sb && navigator.onLine) sbMark(1);
    throw e;
  }).finally(() => clearTimeout(t));
}
function sbBan() {
  return `<div class="apb" style="background:#8a5a0a;box-shadow:none;--apc:#8a5a0a"><div class="t">${ic("alert", 18)} Supabase no responde</div><div class="s">Lo más probable es que el plan gratis lo haya <b>pausado</b> por no usarlo unos días. Mientras tanto no llegan los pagos de Apple Pay y Bizum ni se hacen las copias. Lo que apuntes se guarda en el móvil.<br><br><b>Cómo arreglarlo:</b> entra en <b>supabase.com</b>, abre tu proyecto y pulsa <b>«Restore project»</b>. Tarda un par de minutos.</div><button onclick="window.open('https://supabase.com/dashboard','_blank')">Abrir supabase.com</button><button class="sec" onclick="toast('Comprobando…');pull();cloud()">Ya lo he hecho: comprobar</button></div>`;
}
function sbMsg(m) {
  const e = $("sbm");
  if (e) {
    e.hidden = false;
    e.textContent = m;
  }
  toast(m);
}
async function sbErr(r) {
  if (r.status >= 500 || r.status == 540) return "Supabase no responde: puede que esté en pausa. Entra en supabase.com y pulsa «Restore project».";
  let d = "";
  try {
    const j = await r.json();
    d = j.message || j.msg || j.hint || "";
  } catch (e) {
  }
  return "Error " + r.status + (d ? ": " + d : "");
}
function sbCatch(e) {
  return e && e.name == "AbortError" ? "Supabase no responde. Prueba otra vez en un rato." : "No conecta. Revisa que la dirección empiece por https:// y tu conexión a internet.";
}
async function sbSave() {
  const u = $("sbu").value.trim().replace(/\/+$/, "");
  if (u && !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(u)) {
    sbMsg("La dirección tiene que ser como https://xxxx.supabase.co");
    return;
  }
  S.sbu = u;
  S.sbk = $("sbk").value.trim().replace(/[^\w.\-]/g, "");
  save();
  R();
  if (!S.sbu || !S.sbk) {
    sbMsg("Rellena la dirección y la clave");
    return;
  }
  sbMsg("Comprobando…");
  try {
    const r = await sbF(sbU("?select=id&limit=1"), { headers: sbH() });
    if (r.ok) {
      sbMsg("Conectado ✓");
      pull();
      if (!hasData(S)) nbRest();
    } else sbMsg("No conecta. " + await sbErr(r));
  } catch (e) {
    sbMsg(sbCatch(e));
  }
}
async function sbTest() {
  if (!S.sbu || !S.sbk) {
    sbMsg("Primero pega la dirección y la clave y pulsa «Guardar y comprobar»");
    return;
  }
  sbMsg("Enviando pago de prueba…");
  try {
    const r = await sbF(sbU(), { method: "POST", headers: sbH(), body: JSON.stringify({ importe: "4,50 €", comercio: "Cafetería de prueba" }) });
    if (!r.ok) {
      sbMsg("No se pudo enviar. " + await sbErr(r));
      return;
    }
    sbMsg("Pago de prueba enviado ✓ Mira arriba del todo");
    await pull();
    scrollTo(0, 0);
  } catch (e) {
    sbMsg(sbCatch(e));
  }
}
let nbT = null, nbE = "";
function nbGet() {
  try {
    return localStorage.getItem("fin1_nube") || "";
  } catch (e) {
    return "";
  }
}
let nbWait = 0;
function cloud() {
  try {
    if (!S.sbu || !S.sbk || UI().autobk === false) return;
    if (!navigator.onLine) {
      nbWait = 1;
      try {
        localStorage.setItem("fin1_bkpend", "1");
      } catch (e) {
      }
      return;
    }
    clearTimeout(nbT);
    nbT = setTimeout(nbUp, 4e3);
  } catch (e) {
  }
}
const hasData = (d) => !!d && (d.tx || []).length + (d.bz || []).length + (d.tr || []).length + Object.keys(d.acc || {}).length > 0;
async function nbUp() {
  clearTimeout(nbT);
  nbT = null;
  if (!S.sbu || !S.sbk) return false;
  if (!hasData(S)) {
    nbE = "La app está vacía: no se guarda copia para no borrar la anterior. Si acabas de instalarla, pulsa «Ver copias para restaurar».";
    return false;
  }
  try {
    const u = S.sbu.replace(/\/+$/, "") + "/rest/v1/copias", now = (new Date()).toISOString(), body = JSON.stringify(S);
    const r = await sbF(u, { method: "POST", headers: Object.assign(sbH(), { Prefer: "resolution=merge-duplicates" }), body: '{"id":"ultima","actualizado":"' + now + '","datos":' + body + "}" });
    if (r.ok) {
      await sbF(u, { method: "POST", headers: Object.assign(sbH(), { Prefer: "resolution=ignore-duplicates" }), body: '{"id":"' + today() + '","actualizado":"' + now + '","datos":' + body + "}" }).catch(() => {
      });
      nbE = "";
      try {
        localStorage.setItem("fin1_nube", (new Date()).toISOString());
        localStorage.removeItem("fin1_bkpend");
      } catch (e) {
      }
      return true;
    }
    nbE = r.status == 404 ? "Falta crear la tabla «copias» en Supabase." : "No se pudo guardar. " + await sbErr(r);
    return false;
  } catch (e) {
    nbE = "No se pudo guardar: sin conexión. Se reintentará.";
    return false;
  }
}
function nbInfo() {
  if (!S.sbu || !S.sbk) return "Conecta Supabase en «Pagos con Apple Pay» (más abajo) para guardar tus datos en internet.";
  if (UI().autobk === false) return "Modo manual: pulsa «Hacer copia ahora» cuando quieras. Si a final de mes no la has hecho, te lo recordaré." + (S.lb ? " Última copia: " + fd(S.lb) + "." : "");
  if (nbE) return nbE;
  const n = nbGet();
  if (!n) return "Se guardará sola en unos segundos.";
  const d = new Date(n);
  return "Se guarda sola cada vez que apuntas algo. Última copia: " + fd(ymd(d)) + " a las " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + ".";
}
async function nbNow() {
  if (!hasData(S)) {
    toast("La app está vacía: no hay nada que guardar");
    return;
  }
  toast("Guardando copia…");
  const ok = await nbUp();
  if (!ok) {
    toast(nbE);
    R();
    return;
  }
  try {
    const now = (new Date()).toISOString(), r = await sbF(S.sbu.replace(/\/+$/, "") + "/rest/v1/copias", { method: "POST", headers: sbH(), body: '{"id":"manual-' + now + '","actualizado":"' + now + '","datos":' + JSON.stringify(S) + "}" });
    if (r.ok) {
      S.lb = today();
      save();
    }
    toast(r.ok ? "Copia fija guardada ✓ Aunque borres cosas, esta no cambia" : "No se pudo guardar. " + await sbErr(r));
  } catch (e) {
    toast("No se pudo guardar: sin conexión");
  }
  R();
}
let nbL = null, pdT = 0;
const nbName = (x) => x.id.startsWith("manual-") ? ic("pin", 14) + " Copia que hiciste tú" : x.id == "ultima" ? "Última copia (cómo está ahora)" : x.id == "antes-de-borrar" ? "Justo antes de borrar" : "Al empezar el día " + fd(x.id), nbDesc = (d) => {
  const g = (d.tx || []).filter((t) => t.k == "g").length, b = (d.bz || []).length;
  return g + (g == 1 ? " gasto" : " gastos") + " · " + b + (b == 1 ? " Bizum" : " Bizums");
};
function preDel() {
  try {
    if (!S.sbu || !S.sbk || !hasData(S) || Date.now() - pdT < 6e5) return;
    pdT = Date.now();
    sbF(S.sbu.replace(/\/+$/, "") + "/rest/v1/copias", { method: "POST", headers: Object.assign(sbH(), { Prefer: "resolution=merge-duplicates" }), body: '{"id":"antes-de-borrar","actualizado":"' + (new Date()).toISOString() + '","datos":' + JSON.stringify(S) + "}" }).catch(() => {
    });
  } catch (e) {
  }
}
function nbPick(i) {
  const x = nbL && nbL[i];
  if (!x) return;
  const k = { sbu: S.sbu, sbk: S.sbk };
  nbL = null;
  impT(JSON.stringify(Object.assign(x.datos, k)));
  toast("Restaurada: " + nbName(x), 1);
}
async function nbRest() {
  toast("Buscando copias…");
  try {
    const r = await sbF(S.sbu.replace(/\/+$/, "") + "/rest/v1/copias?select=id,datos,actualizado&order=actualizado.desc&limit=60", { headers: sbH() });
    if (!r.ok) {
      toast(r.status == 404 ? "Falta crear la tabla «copias» en Supabase." : "No se pudo leer la copia. " + await sbErr(r));
      return;
    }
    const l = (await r.json()).filter((x) => hasData(x.datos));
    if (!l.length) {
      toast("Todavía no hay ninguna copia con datos en Supabase");
      return;
    }
    accO.add("Copia de seguridad");
    nbL = l.filter((x) => x.id.startsWith("manual-")).concat(l.filter((x) => !x.id.startsWith("manual-")));
    $("ts").hidden = true;
    R();
    const e = $("nbl");
    if (e) e.scrollIntoView({ block: "center" });
  } catch (e) {
    toast("No se pudo leer la copia: sin conexión");
  }
}
let hidAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hidAt = Date.now();
    if (nbT) nbUp();
    return;
  }
  pull();
  if (hidAt && Date.now() - hidAt > 15e3 && tab != "gas" && !obOn) {
    const st = UI().start;
    mo = cm();
    wk = mon(today());
    dday = today();
    sd = null;
    pSel = null;
    accO.clear();
    recE = null;
    tab = tabOk(st) && st != "pre" ? st : firstTab();
    R();
    scrollTo(0, 0);
  }
  hidAt = 0;
});
if (S.sbu && S.sbk) {
  const n = nbGet();
  let pend2 = 0;
  try {
    pend2 = localStorage.getItem("fin1_bkpend");
  } catch (e) {
  }
  if (!n || ymd(new Date(n)) != today() || pend2) cloud();
}
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t && t.matches && t.matches("input[type=date]") && t.showPicker) {
    try {
      t.showPicker();
    } catch (_) {
    }
  }
});
addEventListener("offline", () => R());
addEventListener("online", () => {
  nbE = "";
  pull();
  if (nbWait) {
    nbWait = 0;
    cloud();
  }
  R();
});
if ("serviceWorker" in navigator && (location.protocol == "https:" || location.hostname == "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {
});
fromURL();
pull();
if (S.onb && !S.tourDone && !obOn) setTimeout(() => {
  if (tab != "gas" && tab != "bzf") tourGo();
}, 1200);
if (c2Due()) setTimeout(c2Get, 800);
setInterval(() => {
  if (!document.hidden && c2Due()) c2Get();
}, 6e5);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && c2Due()) c2Get();
});
genRec();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && genRec()) R();
});
catSync();
obOn = !S.onb && !S.tx.length && !(S.bz || []).length && !S.paga;
obm = UI().both ? "b" : UI().work ? "s" : "p";
applyUI();
R();
// Tocar un número de un recuadro: explica de forma resumida de dónde sale (se puede quitar en Personalizar la app)
function xpTxt(lab) {
  const m = tab == "res" || tab == "dia" || tab == "sem" ? tab == "res" ? mo : (tab == "dia" ? dday : today() >= wk && today() <= addD(wk, 6) ? today() : addD(wk, 3)).slice(0, 7) : mo, i = inc(m), g = exp(m), sv = S.meta || 0, bud = rnd(i - sv), left = rnd(bud - g), br = sum(ALL().filter((t) => t.k == "g" && t.d.startsWith(m)), (t) => t.a), dv = rnd(br - g), l = lab.toLowerCase();
  if (/^gastado en/.test(l) || l == "gastado") return "<b>Gastado</b>: tus gastos " + f0(br) + (dv > 0 ? " − lo que te devolvieron " + f0(dv) : "") + " = " + f0(g) + ". Lo de Devolver cuenta como gastado el mes en que lo pagas; cuando te lo devuelven, suma como dinero que entra el mes en que lo marcas. De lo que te deben por Bizum solo cuenta tu parte.";
  if (acM(m) && /^te queda$/.test(l)) return "<b>Te queda</b>: el dinero que tienes ahora en tus cuentas, " + f0(sum(AC, bal)) + ". Es el mismo número que «Total en tus cuentas» en Cuentas.";
  if (acM(m) && /^por devolver$/.test(l)) return "<b>Por devolver</b>: lo que te deben, " + f0(sum(AC, owed)) + " = Devolver pendiente " + f0(sum(S.tx.filter((t) => t.r && !t.dv), (t) => t.a)) + " + Bizum que te deben " + f0(bzTot().d) + ". Es el «Te deben» de Cuentas.";
  if (acM(m) && /^realmente$/.test(l)) return "<b>Realmente</b>: lo que podrías gastar de verdad = lo que tienes en cuentas " + f0(sum(AC, bal)) + " + lo que te deben " + f0(sum(AC, owed)) + (sum(AC, owe) > 0 ? " − lo que debes " + f0(sum(AC, owe)) : "") + " = " + f0(rnd(sum(AC, bal) + sum(AC, owed) - sum(AC, owe))) + ". Es el «Podrías gastar» de Cuentas.";
  if (/^te queda( por gastar)?$|te has pasado/.test(l)) return "<b>" + lab + "</b>: puedes gastar " + f0(bud) + " − gastado " + f0(g) + " = " + f0(left) + ".";
  if (/puedes gastar/.test(l)) return "<b>Puedes gastar</b>: " + W("sueldo", "paga") + " y extras " + f0(i) + " − " + f0(sv) + " para ahorrar = " + f0(bud) + ".";
  if (/^realmente/.test(l)) return "<b>Realmente</b>: lo que te queda por gastar " + f0(left) + " + lo que te tienen que devolver " + f0(pend()) + " = " + f0(rnd(left + pend())) + ". Cuando te lo devuelvan, se mueve a Te queda por gastar.";
  if (/^extras$/.test(l)) return "<b>Extras</b>: dinero extra, Bizum recibidos y devoluciones de este mes (no incluye " + W("el sueldo", "la paga") + ", que ya está sumado en lo que te queda).";
  if (/paga|sueldo/.test(l) && /extras/.test(l)) return "<b>" + lab + "</b>: " + W("sueldo", "paga") + " " + f0(rnd(i - ext(m))) + " + dinero extra y Bizum recibidos " + f0(ext(m)) + " = " + f0(i) + ".";
  if (/^debo$/.test(l)) return "<b>Bizums · Debo</b>: lo que debes por Bizum y todavía no has pagado. Ya cuenta como gasto; al pagarlo solo sale el dinero de la cuenta.";
  if (/^(bizums que )?me deben$/.test(l)) return "<b>Bizums · Me deben</b>: lo que te deben por Bizum y aún no te han pagado, también de meses anteriores. Si es de un gasto tuyo, ese gasto cuenta solo tu parte desde que lo apuntas.";
  if (/^(bizums )?hechos( por m[ií])?$/.test(l)) return "<b>Bizums hechos</b>: Bizum que has enviado en este periodo. Cuentan como gasto en su categoría.";
  if (/^(bizums )?(recibidos|me hicieron)$/.test(l)) return "<b>Bizums recibidos</b>: Bizum que te han enviado. Si es una devolución baja el gasto de su categoría; si no, suma como dinero extra.";
  if (/dinero extra/.test(l)) return "<b>Dinero extra</b>: solo lo que has apuntado con la opción «Dinero extra» en este periodo.";
  if (/te entr/.test(l)) return "<b>Te entró</b>: dinero extra y Bizum recibidos de este periodo.";
  if (/por devolver|te lo devuelven|de mes/.test(l)) return "<b>" + lab + "</b>: gastos de Devolver pendientes. Cuentan como gastado el mes en que los pagas; al marcarlos como devueltos, suman como dinero que entra ese mes.";
  if (/^devuelto/.test(l)) return "<b>Devuelto</b>: gastos de Devolver ya devueltos. No cuentan como gasto y el dinero se suma a la cuenta elegida.";
  if (/atrasado/.test(l)) return "<b>" + lab + "</b>: lo que sigue pendiente de devolver de meses anteriores (solo Devolver). Lo que te deben por Bizum está en Bizums · Me deben.";
  if (/te deben en total/.test(l)) return "<b>Te deben en total</b>: lo pendiente de este mes + lo atrasado de meses anteriores.";
  if (/media al mes/.test(l)) return "<b>Media al mes</b>: lo gastado en el año dividido entre los meses que llevas usando la app.";
  if (/pagado por tus padres/.test(l)) return "<b>Pagado por tus padres</b>: gastos de Devolver de este año, estén ya devueltos o pendientes.";
  if (/gastado de tu/.test(l)) return "<b>Gastado</b>: tus gastos del año menos lo que te devolvieron. Lo de Devolver cuenta como gastado y suma como dinero que entra cuando te lo devuelven.";
  if (/total en tus cuentas/.test(l)) return "<b>Total en tus cuentas</b>: suma del saldo de tus tres cuentas. Se mueve con gastos, Bizum, devoluciones, transferencias y el día que te llega la paga.";
  if (/valor de tus inversiones/.test(l)) return "<b>Valor de tus inversiones</b>: lo que vale hoy cada inversión según la última vez que lo actualizaste. No toca tu paga ni tus cuentas.";
  if (/ahorrado/.test(l)) return "<b>Ahorrado</b>: suma de cada mes, desde el mes en que empezaste a usar la app, de " + W("sueldo", "paga") + " y extras − gastado.";
  return "";
}
document.addEventListener("click", (e) => {
  if (UI().xp === false) return;
  const el = e.target.closest(".stat,.hero .hr>div,.hero .n,.grid .card,.card:has(>.big)");
  if (!el || e.target.closest("button,input,select,a")) return;
  const lb0 = el.matches(".hero .n") ? el.parentNode.querySelector(".l") : el.querySelector("small,.k"), tx = lb0 && xpTxt(lb0.textContent.trim());
  if (!tx) return;
  setTimeout(() => {
    toast(tx);
    clearTimeout(toast.t);
    toast.t = setTimeout(tsHide, 9e3);
  }, 0);
  return;
  toast(tx);
  clearTimeout(toast.t);
  toast.t = setTimeout(tsHide, 9e3);
}, true);
// Si algo falla, la app lo dice en vez de quedarse parada (así se puede saber qué pasa)
{
  let ult = 0;
  const av = (m) => {
    const n = Date.now();
    if (n - ult < 4e3) return;
    ult = n;
    try {
      toast("Algo ha fallado: " + String(m).slice(0, 120));
    } catch (e) {
    }
  };
  window.addEventListener("error", (e) => av(e.message));
  window.addEventListener("unhandledrejection", (e) => av(e.reason && e.reason.message || e.reason));
}
