/* lang-init.js — account language switch + first render (must load last) */

var langBtns = document.querySelectorAll('.lang-seg button');
function setLang(lang) {
  langBtns.forEach(function (b) { b.classList.toggle('is-on', b.dataset.lang === lang); });
  acct.querySelectorAll('[data-zh]').forEach(function (el) { el.textContent = el.dataset[lang]; });
  try { localStorage.setItem('wb-lang', lang); } catch (e) {}
}
langBtns.forEach(function (b) {
  b.addEventListener('click', function (e) { e.stopPropagation(); setLang(b.dataset.lang); });
});
setLang('en');

render('scenario');
