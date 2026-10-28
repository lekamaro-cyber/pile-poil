// Vérifications des exercices HTML/CSS : elles lisent la page réellement rendue par le navigateur
// (structure du document et styles calculés). Partagé entre l'appli et l'outil de validation.
(function (root) {
  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

  function matchesStyle(value, expected) {
    var list = Array.isArray(expected) ? expected : [expected];
    var v = norm(value);
    return list.some(function (e) { return norm(e) === v; });
  }

  // checks : [{ label, sel?, none?, count?, min?, max?, attr?, attrs?, text?, style?, vw? }]
  // Renvoie [{ label, ok, detail }]
  function runHtmlChecks(doc, win, checks) {
    return checks.map(function (c) {
      var res = { label: c.label, ok: true, detail: '' };
      try {
        if (c.none) {
          var bad = doc.querySelectorAll(c.none);
          if (bad.length) { res.ok = false; res.detail = bad.length + ' élément(s) « ' + c.none + ' » trouvé(s).'; }
          return res;
        }
        var els = Array.prototype.slice.call(doc.querySelectorAll(c.sel));
        if (c.count != null && els.length !== c.count) {
          res.ok = false; res.detail = 'Attendu : ' + c.count + ' élément(s) « ' + c.sel + ' », trouvé : ' + els.length + '.';
          return res;
        }
        var min = c.min != null ? c.min : 1;
        if (c.count == null && els.length < min) {
          res.ok = false; res.detail = els.length ? 'Seulement ' + els.length + ' élément(s) « ' + c.sel + ' » (au moins ' + min + ' attendu(s)).' : 'Aucun élément « ' + c.sel + ' » trouvé.';
          return res;
        }
        if (c.max != null && els.length > c.max) {
          res.ok = false; res.detail = 'Trop d’éléments « ' + c.sel + ' » : ' + els.length + ' (maximum ' + c.max + ').';
          return res;
        }
        if (c.attr) {
          var missing = els.filter(function (el) { return !el.hasAttribute(c.attr); });
          if (missing.length) { res.ok = false; res.detail = missing.length + ' élément(s) « ' + c.sel + ' » sans attribut ' + c.attr + '.'; return res; }
        }
        if (c.attrs) {
          for (var name in c.attrs) {
            var want = c.attrs[name];
            var wrong = els.filter(function (el) { return norm(el.getAttribute(name)) !== norm(want); });
            if (wrong.length) { res.ok = false; res.detail = 'L’attribut ' + name + ' de « ' + c.sel + ' » doit valoir « ' + want + ' ».'; return res; }
          }
        }
        if (c.text != null) {
          var t = norm(c.text);
          if (!els.some(function (el) { return norm(el.textContent).indexOf(t) !== -1; })) {
            res.ok = false; res.detail = 'Le texte « ' + c.text + ' » est introuvable dans « ' + c.sel + ' ».'; return res;
          }
        }
        if (c.style) {
          for (var prop in c.style) {
            for (var i = 0; i < els.length; i++) {
              var val = win.getComputedStyle(els[i]).getPropertyValue(prop);
              if (!matchesStyle(val, c.style[prop])) {
                res.ok = false;
                res.detail = '« ' + c.sel + ' » : ' + prop + ' vaut « ' + (val || 'rien') + ' », attendu « ' + [].concat(c.style[prop]).join(' » ou « ') + ' ».';
                return res;
              }
            }
          }
        }
      } catch (e) {
        res.ok = false; res.detail = 'Vérification impossible : ' + e.message;
      }
      return res;
    });
  }

  // Largeurs d'affichage nécessaires pour une liste de vérifications (800 px par défaut).
  function checkWidths(checks) {
    var widths = [];
    checks.forEach(function (c) { var w = c.vw || 800; if (widths.indexOf(w) === -1) widths.push(w); });
    return widths;
  }

  // Page dans laquelle un fragment HTML est rendu : identique dans l'appli et dans l'outil de validation,
  // pour que les styles calculés (largeurs, marges) soient les mêmes.
  function wrapDoc(html) {
    return /<!doctype|<html[\s>]/i.test(html) ? html : '<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>' + html + '</body></html>';
  }

  root.CQHtmlChecks = { run: runHtmlChecks, widths: checkWidths, wrapDoc: wrapDoc };
})(typeof window !== 'undefined' ? window : globalThis);
