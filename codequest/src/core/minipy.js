/*
 * MiniPy : interpréteur d'un sous-ensemble de Python 3 écrit en JavaScript pur, pour CodeQuest.
 * Référence : CPython 3.13 (sorties et messages d'erreur).
 *
 * - Aucune dépendance, jamais d'eval, de new Function ni d'import dynamique.
 * - Tout le code est dans createMiniPy() : l'appli peut sérialiser createMiniPy.toString() pour la lancer
 *   dans un Worker. Aucune variable extérieure n'est utilisée.
 *
 * Organisation :
 *   1. État d'une exécution, utilitaires
 *   2. Analyse lexicale (tokenizer avec INDENT / DEDENT, f-strings)
 *   3. Analyse syntaxique (parseur descendant récursif -> arbre)
 *   4. Analyse des portées (locales, globales, cellules des fermetures)
 *   5. Modèle objet (types, instances, exceptions)
 *   6. Opérations (arithmétique, comparaisons, hachage, repr, format)
 *   7. Compilateur : l'arbre devient des fermetures JavaScript (rapide, sans eval)
 *   8. Fonctions natives et méthodes des types natifs
 *   9. Modules (math, random, string, collections, json, csv, time, statistics, functools, itertools, copy)
 *  10. API publique : run, runTests
 */
function createMiniPy() {
  'use strict';

  // =====================================================================================================
  // 1. État d'une exécution, utilitaires
  // =====================================================================================================
  var VERSION = '1.0.0';
  var LIMIT_MSG = "Le programme a dépassé la limite d'exécution (boucle infinie ?)";
  var RECURSION_LIMIT = 1000;

  var out = [];            // morceaux de texte écrits sur stdout
  var outLen = 0;
  var stdinLines = [];     // lignes renvoyées par input()
  var stdinPos = 0;
  var vfs = new Map();     // système de fichiers virtuel : nom -> contenu
  var steps = 0;           // compteur d'étapes (instructions exécutées)
  var maxSteps = 3000000;
  var nextCheck = 0;       // prochain contrôle des limites
  var deadline = 0;        // heure limite (Date.now())
  var depth = 0;           // profondeur d'appels Python (le module compte pour 1)
  var curLine = 0;         // ligne en cours d'exécution
  var modules = new Map(); // modules déjà importés pendant cette exécution
  var handledStack = [];   // exceptions en cours de traitement (pour « raise » sans argument)
  var openFiles = [];      // fichiers ouverts (vidés à la fin)
  var idCounter = 0;
  var runRandomSeed = 0;

  // Signal d'arrêt (boucle infinie, sortie trop grande) : jamais attrapé par le code Python.
  function LimitSignal(msg) { this.msg = msg; }

  function checkLimits() {
    if (steps > maxSteps || Date.now() > deadline) throw new LimitSignal(LIMIT_MSG);
    nextCheck = Math.min(steps + 2000, maxSteps);
  }

  function write(s) {
    if (s.length === 0) return;
    out.push(s);
    outLen += s.length;
    if (outLen > 5000000) throw new LimitSignal("Le programme a affiché trop de texte (boucle infinie ?)");
  }

  function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  // =====================================================================================================
  // 2. Analyse lexicale
  // =====================================================================================================
  function PySyntaxError(type, msg, line, col) {
    this.type = type; this.msg = msg; this.line = line; this.col = col || 0;
  }

  var KEYWORDS = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
    'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
    'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']);
  var OPS3 = new Set(['**=', '//=', '>>=', '<<=', '...']);
  var OPS2 = new Set(['!=', '%=', '&=', '**', '*=', '+=', '-=', '->', '//', '/=', ':=', '<<', '<=', '==', '>=',
    '>>', '@=', '^=', '|=']);
  var OPS1 = new Set('%&()*+,-./:;<=>@[]^{|}~!$?`'.split(''));
  var STR_PREFIXES = new Set(['r', 'u', 'f', 'b', 'br', 'rb', 'fr', 'rf']);
  var RE_ID_START = /[\p{L}\p{Nl}_℘℮゛゜]/u;
  var RE_ID_CONT = /[\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}\p{Pc}_··፩-፱᧚℘℮゛゜]/u;

  function isDigit(c) { return c >= '0' && c <= '9'; }
  function isIdStartChar(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || (ch > '\x7f' && RE_ID_START.test(ch));
  }
  function isIdContChar(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || (ch >= '0' && ch <= '9') ||
      (ch > '\x7f' && RE_ID_CONT.test(ch));
  }
  function hex4(cp) { var h = cp.toString(16).toUpperCase(); while (h.length < 4) h = '0' + h; return h; }

  // Décode les séquences d'échappement d'une chaîne non brute.
  function decodeEscapes(s, line) {
    if (s.indexOf('\\') < 0) return s;
    var r = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c !== '\\') { r += c; i++; continue; }
      var d = s[i + 1];
      i += 2;
      switch (d) {
        case '\n': break;
        case '\\': r += '\\'; break;
        case "'": r += "'"; break;
        case '"': r += '"'; break;
        case 'a': r += '\x07'; break;
        case 'b': r += '\b'; break;
        case 'f': r += '\f'; break;
        case 'n': r += '\n'; break;
        case 'r': r += '\r'; break;
        case 't': r += '\t'; break;
        case 'v': r += '\v'; break;
        case 'x': case 'u': case 'U': {
          var len = d === 'x' ? 2 : d === 'u' ? 4 : 8;
          var h = s.substr(i, len);
          if (h.length < len || !/^[0-9a-fA-F]+$/.test(h)) {
            var what = d === 'x' ? 'truncated \\xXX escape' : d === 'u' ? 'truncated \\uXXXX escape' : 'truncated \\UXXXXXXXX escape';
            throw new PySyntaxError('SyntaxError', "(unicode error) 'unicodeescape' codec can't decode bytes in position " +
              (i - 2) + '-' + (i - 1 + h.replace(/[^0-9a-fA-F].*$/, '').length) + ': ' + what, line);
          }
          var cp = parseInt(h, 16);
          if (cp > 0x10ffff) throw new PySyntaxError('SyntaxError', "(unicode error) 'unicodeescape' codec can't decode bytes in position " + (i - 2) + '-' + (i + len - 1) + ': illegal Unicode character', line);
          r += String.fromCodePoint(cp);
          i += len;
          break;
        }
        case 'N': {
          var m = /^\{([^}]*)\}/.exec(s.slice(i));
          var NAMES = { 'BULLET': '•', 'EM DASH': '—', 'EN DASH': '–', 'DEGREE SIGN': '°', 'NO-BREAK SPACE': ' ',
            'EURO SIGN': '€', 'COPYRIGHT SIGN': '©', 'HORIZONTAL ELLIPSIS': '…', 'GREEK SMALL LETTER PI': 'π',
            'CHECK MARK': '✓', 'MULTIPLICATION SIGN': '×', 'DIVISION SIGN': '÷', 'SPACE': ' ', 'LATIN SMALL LETTER E WITH ACUTE': 'é' };
          if (m && hasOwn(NAMES, m[1].toUpperCase())) { r += NAMES[m[1].toUpperCase()]; i += m[0].length; break; }
          throw new PySyntaxError('SyntaxError', "(unicode error) 'unicodeescape' codec can't decode bytes in position " + (i - 2) + '-' + (i - 1 + (m ? m[0].length : 0)) + ': ' + (m ? 'unknown Unicode character name' : 'malformed \\N character escape'), line);
        }
        default:
          if (d >= '0' && d <= '7') {
            var o = d, k = 0;
            while (k < 2 && s[i] >= '0' && s[i] <= '7') { o += s[i]; i++; k++; }
            r += String.fromCodePoint(parseInt(o, 8));
          } else if (d === undefined) {
            r += '\\';
          } else {
            r += '\\' + d; // séquence inconnue : gardée telle quelle (comme CPython)
          }
      }
    }
    return r;
  }

  // Découpe le source en tokens. Les erreurs du tokenizer deviennent un token « error » (le parseur la lève
  // quand il l'atteint). Les erreurs du tokenizer sont prioritaires sur celles du parseur (comme CPython).
  function tokenize(src, lineBase) {
    lineBase = lineBase || 0;
    var toks = [];
    var n = src.length, i = 0, line = 1 + lineBase, lineStart = 0;
    var indents = [0], alts = [0], parens = [];
    var bol = true, pending = false;
    var res = { toks: toks, err: null, parenErr: null };
    function add(t, v, l, c) { var o = { t: t, v: v, line: l, col: c }; toks.push(o); pending = true; return o; }
    function fail(type, msg, l, c) {
      res.err = new PySyntaxError(type, msg, l, c);
      toks.push({ t: 'error', err: res.err, line: l, col: c });
    }
    function eofLine() { return (n > 0 && src[n - 1] === '\n') ? line - 1 : line; }

    // Lit une chaîne (ou f-string) dont le guillemet ouvrant est en src[j]. Renvoie le token ou null (erreur).
    function readString(j, prefix, startCol) {
      var startLine = line;
      var q = src[j];
      var triple = src[j + 1] === q && src[j + 2] === q;
      var p = prefix.toLowerCase();
      var raw = p.indexOf('r') >= 0, isF = p.indexOf('f') >= 0, isB = p.indexOf('b') >= 0;
      j += triple ? 3 : 1;
      if (isF) {
        var st = { j: j, line: line };
        var parts = scanFString(st, q, triple, raw, startLine, startCol, 0);
        if (parts === null) return null;
        var tk = { t: 'str', v: null, f: parts, line: startLine, col: startCol, end: st.j };
        line = st.line;
        return tk;
      }
      var start = j;
      for (;;) {
        if (j >= n) {
          if (triple) fail('SyntaxError', 'unterminated triple-quoted string literal (detected at line ' + eofLine() + ')', startLine, startCol);
          else fail('SyntaxError', 'unterminated string literal (detected at line ' + line + ')', startLine, startCol);
          return null;
        }
        var ch = src[j];
        if (ch === '\\') {
          if (src[j + 1] === '\n') line++;
          j += 2; continue;
        }
        if (ch === '\n') {
          if (!triple) { fail('SyntaxError', 'unterminated string literal (detected at line ' + line + ')', startLine, startCol); return null; }
          line++;
        } else if (ch === q && (!triple || (src[j + 1] === q && src[j + 2] === q))) {
          break;
        }
        j++;
      }
      var body = src.slice(start, j);
      j += triple ? 3 : 1;
      if (isB) { fail('SyntaxError', 'bytes literals are not supported in CodeQuest', startLine, startCol); return null; }
      var v;
      try { v = raw ? body : decodeEscapes(body, startLine); } catch (e) { if (e instanceof PySyntaxError) { fail(e.type, e.msg, e.line, startCol); return null; } throw e; }
      return { t: 'str', v: v, f: null, line: startLine, col: startCol, end: j };
    }

    // Analyse le contenu d'une f-string. st.j : position courante. Renvoie la liste des morceaux :
    // chaînes littérales et champs { src, line, conv, spec, debug }.
    function scanFString(st, q, triple, raw, startLine, startCol, nest) {
      var parts = [], lit = '', j = st.j;
      function flush() { if (lit) { parts.push(raw ? lit : decodeEscapesSafe(lit)); lit = ''; } }
      function decodeEscapesSafe(x) { return decodeEscapes(x, startLine); }
      try {
        for (;;) {
          if (j >= n) {
            fail('SyntaxError', 'unterminated ' + (triple ? 'triple-quoted ' : '') + 'f-string literal (detected at line ' + (triple ? eofLine() : line) + ')', startLine, startCol);
            return null;
          }
          var ch = src[j];
          if (nest === 0 && ch === q && (!triple || (src[j + 1] === q && src[j + 2] === q))) { j += triple ? 3 : 1; break; }
          if (nest > 0 && ch === '}') break; // fin d'une spécification de format imbriquée
          if (ch === '\n') {
            if (!triple) { fail('SyntaxError', 'unterminated f-string literal (detected at line ' + line + ')', startLine, startCol); return null; }
            line++; lit += ch; j++; continue;
          }
          if (ch === '\\') {
            if (raw) { lit += ch; j++; if (j < n) { if (src[j] === '\n') line++; lit += src[j]; j++; } continue; }
            if (src[j + 1] === 'N' && src[j + 2] === '{') {
              var close = src.indexOf('}', j);
              lit += src.slice(j, close + 1); j = close + 1; continue;
            }
            if (src[j + 1] === '\n') line++;
            lit += ch + (src[j + 1] || ''); j += 2; continue;
          }
          if (ch === '{') {
            if (nest === 0 && src[j + 1] === '{') { lit += '{'; j += 2; continue; }
            flush();
            st.j = j + 1;
            var fld = scanField(st, q, triple, raw, startLine, startCol, nest);
            if (fld === null) return null;
            parts.push(fld);
            j = st.j;
            continue;
          }
          if (ch === '}') {
            if (src[j + 1] === '}' && nest === 0) { lit += '}'; j += 2; continue; }
            fail('SyntaxError', "f-string: single '}' is not allowed", line, j - lineStart);
            return null;
          }
          lit += ch; j++;
        }
        flush();
      } catch (e) {
        if (e instanceof PySyntaxError) { fail(e.type, e.msg, e.line, startCol); return null; }
        throw e;
      }
      st.j = j;
      return parts;
    }

    // Un champ { expr [=] [!conv] [:spec] }. st.j pointe juste après « { ».
    function scanField(st, q, triple, raw, startLine, startCol, nest) {
      var j = st.j, depthP = 0, exprStart = j, exprLine = line, exprEnd = -1, debug = null;
      for (;;) {
        if (j >= n) { fail('SyntaxError', "f-string: expecting '}'", line, j - lineStart); return null; }
        var ch = src[j];
        if (ch === q && !triple && depthP === 0 && src.slice(exprStart, j).trim() !== '' && false) break;
        if (ch === '\n') {
          if (!triple) { fail('SyntaxError', "f-string: expecting '}'", line, j - lineStart); return null; }
          line++; j++; continue;
        }
        if (ch === "'" || ch === '"') {
          // chaîne imbriquée dans l'expression
          var tq = src[j + 1] === ch && src[j + 2] === ch;
          if (ch === q && !triple && !tq) {
            // même guillemet que la f-string (autorisé depuis 3.12) : on lit une chaîne simple
          }
          var k = j + (tq ? 3 : 1);
          for (;;) {
            if (k >= n) { fail('SyntaxError', "f-string: expecting '}'", line, j - lineStart); return null; }
            if (src[k] === '\\') { k += 2; continue; }
            if (src[k] === '\n') { if (!tq) { fail('SyntaxError', "f-string: expecting '}'", line, j - lineStart); return null; } line++; }
            if (src[k] === ch && (!tq || (src[k + 1] === ch && src[k + 2] === ch))) { k += tq ? 3 : 1; break; }
            k++;
          }
          j = k; continue;
        }
        if (ch === '(' || ch === '[' || ch === '{') { depthP++; j++; continue; }
        if ((ch === ')' || ch === ']') && depthP > 0) { depthP--; j++; continue; }
        if (ch === '}') {
          if (depthP > 0) { depthP--; j++; continue; }
          exprEnd = j; break;
        }
        if (depthP === 0) {
          if (ch === '!' && src[j + 1] !== '=') { exprEnd = j; break; }
          if (ch === ':') { exprEnd = j; break; }
          if (ch === '=' && src[j + 1] !== '=' && '=!<>'.indexOf(src[j - 1]) < 0) {
            // « = » de débogage ?
            var k2 = j + 1;
            while (src[k2] === ' ') k2++;
            if (src[k2] === '}' || src[k2] === '!' || src[k2] === ':') {
              debug = src.slice(exprStart, k2);
              exprEnd = j; j = k2;
              break;
            }
          }
        }
        j++;
      }
      var exprSrc = src.slice(exprStart, exprEnd);
      if (exprSrc.trim() === '') {
        fail('SyntaxError', "f-string: valid expression required before '" + src[j] + "'", line, j - lineStart);
        return null;
      }
      var conv = null, spec = null;
      if (src[j] === '!') {
        conv = src[j + 1];
        if (conv !== 's' && conv !== 'r' && conv !== 'a') {
          fail('SyntaxError', conv === '}' || conv === undefined ? "f-string: missing conversion character" :
            "f-string: invalid conversion character '" + conv + "': expected 's', 'r', or 'a'", line, j - lineStart);
          return null;
        }
        j += 2;
      }
      if (src[j] === ':') {
        st.j = j + 1;
        spec = scanFString(st, q, triple, raw, startLine, startCol, nest + 1);
        if (spec === null) return null;
        j = st.j;
      }
      if (src[j] !== '}') { fail('SyntaxError', "f-string: expecting '}'", line, j - lineStart); return null; }
      st.j = j + 1;
      return { src: exprSrc, line: exprLine, conv: conv, spec: spec, debug: debug };
    }

    function readNumber(j) {
      var start = j, col = j - lineStart, isFloat = false;
      var c = src[j];
      function digits(test) {
        // chiffres avec « _ » simples entre deux chiffres
        var k = j, ok = false;
        while (k < n) {
          if (test(src[k])) { ok = true; k++; }
          else if (src[k] === '_' && ok && k + 1 < n && test(src[k + 1])) { k++; }
          else break;
        }
        var r = ok ? k : -1;
        return r;
      }
      if (c === '0' && /[xXoObB]/.test(src[j + 1] || '')) {
        var kind = src[j + 1].toLowerCase();
        var test = kind === 'x' ? function (x) { return /[0-9a-fA-F]/.test(x); } : kind === 'o' ? function (x) { return x >= '0' && x <= '7'; } : function (x) { return x === '0' || x === '1'; };
        j += 2;
        if (src[j] === '_') j++;
        var e = digits(test);
        var name = kind === 'x' ? 'hexadecimal' : kind === 'o' ? 'octal' : 'binary';
        if (e < 0) {
          if (kind !== 'x' && isDigit(src[j])) { fail('SyntaxError', "invalid digit '" + src[j] + "' in " + name + ' literal', line, col); return null; }
          fail('SyntaxError', 'invalid ' + name + ' literal', line, col); return null;
        }
        if (kind !== 'x' && isDigit(src[e])) { fail('SyntaxError', "invalid digit '" + src[e] + "' in " + name + ' literal', line, col); return null; }
        if (e < n && isIdContChar(src[e])) { fail('SyntaxError', 'invalid ' + name + ' literal', line, col); return null; }
        var txt = src.slice(start + 2, e).replace(/_/g, '');
        return { tok: { t: 'num', v: BigInt('0' + kind + txt), line: line, col: col }, end: e };
      }
      var e2 = j;
      if (c !== '.') {
        e2 = digits(isDigit);
        if (e2 < 0) { fail('SyntaxError', 'invalid decimal literal', line, col); return null; }
        j = e2;
        if (src[j] === '_') { fail('SyntaxError', 'invalid decimal literal', line, col); return null; }
      }
      if (src[j] === '.') {
        isFloat = true; j++;
        if (isDigit(src[j])) { var e3 = digits(isDigit); j = e3; if (src[j] === '_') { fail('SyntaxError', 'invalid decimal literal', line, col); return null; } }
      }
      if (src[j] === 'e' || src[j] === 'E') {
        var k = j + 1;
        if (src[k] === '+' || src[k] === '-') k++;
        if (isDigit(src[k])) {
          j = k; var e4 = digits(isDigit); j = e4; isFloat = true;
          if (src[j] === '_') { fail('SyntaxError', 'invalid decimal literal', line, col); return null; }
        } else {
          fail('SyntaxError', 'invalid decimal literal', line, col); return null;
        }
      }
      if (src[j] === 'j' || src[j] === 'J') { fail('SyntaxError', 'complex numbers are not supported in CodeQuest', line, col); return null; }
      if (j < n && isIdContChar(src[j])) {
        // « 1if x else y » est accepté par CPython (avec un avertissement)
        var w = /^[a-z]+/.exec(src.slice(j, j + 10));
        if (!(w && /^(if|else|and|or|in|is|not|for)$/.test(w[0]))) {
          fail('SyntaxError', 'invalid decimal literal', line, col); return null;
        }
      }
      var text = src.slice(start, j).replace(/_/g, '');
      if (isFloat) return { tok: { t: 'num', v: Number(text), line: line, col: col }, end: j };
      if (text.length > 1 && text[0] === '0' && /[1-9]/.test(text)) {
        fail('SyntaxError', 'leading zeros in decimal integer literals are not permitted; use an 0o prefix for octal integers', line, col);
        return null;
      }
      return { tok: { t: 'num', v: BigInt(text), line: line, col: col }, end: j };
    }

    for (;;) {
      if (bol && parens.length === 0) {
        // Début de ligne logique : mesure de l'indentation
        var col = 0, alt = 0, j = i;
        while (j < n) {
          var ch0 = src[j];
          if (ch0 === ' ') { col++; alt++; }
          else if (ch0 === '\t') { col = (Math.floor(col / 8) + 1) * 8; alt++; }
          else if (ch0 === '\f') { col = 0; alt = 0; }
          else break;
          j++;
        }
        if (j >= n) { i = j; break; }
        var c0 = src[j];
        if (c0 === '\n' || c0 === '#') {
          while (j < n && src[j] !== '\n') j++;
          if (j >= n) { i = j; break; }
          i = j + 1; line++; lineStart = i;
          continue;
        }
        if (c0 === '\\' && src[j + 1] === '\n') {
          // ligne qui commence par une continuation : on garde l'indentation calculée
        }
        var top = indents[indents.length - 1], atop = alts[alts.length - 1];
        if (col === top) {
          if (alt !== atop) { fail('TabError', 'inconsistent use of tabs and spaces in indentation', line, j - lineStart); return res; }
        } else if (col > top) {
          if (alt <= atop) { fail('TabError', 'inconsistent use of tabs and spaces in indentation', line, j - lineStart); return res; }
          indents.push(col); alts.push(alt);
          add('indent', null, line, 0);
        } else {
          while (indents.length > 1 && col < indents[indents.length - 1]) {
            indents.pop(); alts.pop();
            add('dedent', null, line, col);
          }
          if (col !== indents[indents.length - 1]) {
            fail('IndentationError', 'unindent does not match any outer indentation level', line, j - lineStart);
            return res;
          }
          if (alt !== alts[alts.length - 1]) { fail('TabError', 'inconsistent use of tabs and spaces in indentation', line, j - lineStart); return res; }
        }
        i = j; bol = false; pending = false;
      }
      if (i >= n) break;
      var c = src[i];
      if (c === ' ' || c === '\t' || c === '\f' || c === '\r') { i++; continue; }
      if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '\n') {
        if (parens.length === 0) {
          if (pending) add('newline', null, line, i - lineStart);
          bol = true; pending = false;
        }
        i++; line++; lineStart = i;
        continue;
      }
      if (c === '\\') {
        if (src[i + 1] === '\n') { i += 2; line++; lineStart = i; continue; }
        if (i + 1 >= n) { fail('SyntaxError', 'unexpected EOF while parsing', line, i - lineStart); return res; }
        if (src[i + 1] === '\r' && src[i + 2] === '\n') { i += 3; line++; lineStart = i; continue; }
        fail('SyntaxError', 'unexpected character after line continuation character', line, i - lineStart);
        return res;
      }
      var colNow = i - lineStart;
      // Nombres
      if (isDigit(c) || (c === '.' && isDigit(src[i + 1]))) {
        var nr = readNumber(i);
        if (nr === null) return res;
        toks.push(nr.tok); pending = true;
        i = nr.end;
        continue;
      }
      // Identifiants, mots-clés, préfixes de chaînes
      var cp = src.codePointAt(i);
      var chs = String.fromCodePoint(cp);
      if (isIdStartChar(chs)) {
        var k = i + chs.length;
        while (k < n) {
          var cp2 = src.codePointAt(k);
          var ch2 = String.fromCodePoint(cp2);
          if (!isIdContChar(ch2)) break;
          k += ch2.length;
        }
        var word = src.slice(i, k);
        if ((src[k] === "'" || src[k] === '"') && STR_PREFIXES.has(word.toLowerCase())) {
          var st = readString(k, word, colNow);
          if (st === null) return res;
          toks.push(st); pending = true;
          i = st.end;
          // ajuste le début de ligne si la chaîne est sur plusieurs lignes
          var lastNl = src.lastIndexOf('\n', i - 1);
          if (lastNl >= lineStart) lineStart = lastNl + 1;
          continue;
        }
        if (word.charCodeAt(0) > 127 || /[^\x00-\x7f]/.test(word)) word = word.normalize('NFKC');
        add(KEYWORDS.has(word) ? 'kw' : 'name', word, line, colNow);
        i = k;
        continue;
      }
      // Chaînes
      if (c === "'" || c === '"') {
        var st2 = readString(i, '', colNow);
        if (st2 === null) return res;
        toks.push(st2); pending = true;
        i = st2.end;
        var lastNl2 = src.lastIndexOf('\n', i - 1);
        if (lastNl2 >= lineStart) lineStart = lastNl2 + 1;
        continue;
      }
      // Opérateurs
      var three = src.substr(i, 3), two = src.substr(i, 2), op = null;
      if (OPS3.has(three)) op = three;
      else if (OPS2.has(two)) op = two;
      else if (OPS1.has(c)) op = c;
      if (op !== null) {
        if (op === '(' || op === '[' || op === '{') parens.push({ ch: op, line: line, col: colNow });
        else if (op === ')' || op === ']' || op === '}') {
          if (parens.length === 0) { fail('SyntaxError', "unmatched '" + op + "'", line, colNow); return res; }
          var open = parens.pop();
          var expected = open.ch === '(' ? ')' : open.ch === '[' ? ']' : '}';
          if (op !== expected) {
            fail('SyntaxError', "closing parenthesis '" + op + "' does not match opening parenthesis '" + open.ch + "'" +
              (open.line !== line ? ' on line ' + open.line : ''), line, colNow);
            return res;
          }
        }
        add('op', op, line, colNow);
        i += op.length;
        continue;
      }
      // Caractère invalide
      fail('SyntaxError', "invalid character '" + chs + "' (U+" + hex4(cp) + ')', line, colNow);
      return res;
    }
    // Fin du fichier
    if (parens.length) {
      var p = parens[parens.length - 1];
      res.parenErr = new PySyntaxError('SyntaxError', "'" + p.ch + "' was never closed", p.line, p.col);
      toks.push({ t: 'error', err: res.parenErr, line: eofLine() + 1, col: 0 });
      return res;
    }
    if (pending) add('newline', null, line, i - lineStart);
    var el = eofLine();
    while (indents.length > 1) { indents.pop(); add('dedent', null, el, 0); }
    add('eof', null, el, 0);
    return res;
  }

  // =====================================================================================================
  // 3. Analyse syntaxique : arbre de syntaxe (objets { k: 'Genre', line, ... })
  // =====================================================================================================
  var EXPR_NAMES = {
    Attr: 'attribute', Sub: 'subscript', Starred: 'starred', Name: 'name', List: 'list', Tuple: 'tuple',
    Lambda: 'lambda', Call: 'function call', BoolOp: 'expression', BinOp: 'expression', UnaryOp: 'expression',
    GenExp: 'generator expression', ListComp: 'list comprehension', SetComp: 'set comprehension',
    DictComp: 'dict comprehension', Dict: 'dict literal', Set: 'set display', JoinedStr: 'f-string expression',
    Compare: 'comparison', IfExp: 'conditional expression', Yield: 'yield expression'
  };
  function exprName(e) {
    if (e.k === 'Const') {
      if (e.v === null) return 'None';
      if (e.v === true) return 'True';
      if (e.v === false) return 'False';
      if (e.ellipsis) return 'ellipsis';
      return 'literal';
    }
    return EXPR_NAMES[e.k] || 'expression';
  }

  function parse(src, lineBase, mode) {
    var T = tokenize(src, lineBase || 0);
    var toks = T.toks, p = 0;
    var parenLevel = 0;
    try {
      var r = mode === 'expr' ? parseFExpr() : parseFile();
      return r;
    } catch (e) {
      if (e instanceof PySyntaxError) {
        if (T.err && e !== T.err) throw T.err;
        if (T.parenErr && e !== T.parenErr && e.line > T.parenErr.line) throw T.parenErr;
      }
      throw e;
    }

    // --- outils ---
    function peek() { var t = toks[p]; if (t.t === 'error') throw t.err; return t; }
    function peekAt(k) { var t = toks[p + k]; if (!t) return toks[toks.length - 1]; return t; }
    function next() { var t = peek(); p++; return t; }
    function prevTok() { return toks[p - 1] || toks[0]; }
    function isOp(v) { var t = peek(); return t.t === 'op' && t.v === v; }
    function isKw(v) { var t = peek(); return t.t === 'kw' && t.v === v; }
    function acceptOp(v) { if (isOp(v)) { p++; return true; } return false; }
    function acceptKw(v) { if (isKw(v)) { p++; return true; } return false; }
    function err(msg, tok, type) {
      tok = tok || peek();
      throw new PySyntaxError(type || 'SyntaxError', msg, tok.line, tok.col);
    }
    function invalid(tok) { tok = tok || peek(); err('invalid syntax', tok); }
    function expectOp(v) { if (!acceptOp(v)) invalid(); }
    function expectColon() {
      if (isOp(':')) { p++; return; }
      err("expected ':'", prevTok());
    }
    function expectName() { var t = peek(); if (t.t !== 'name') invalid(t); p++; return t.v; }
    function startsExpr(t) {
      if (t.t === 'name' || t.t === 'num' || t.t === 'str') return true;
      if (t.t === 'kw') return t.v === 'True' || t.v === 'False' || t.v === 'None' || t.v === 'not' || t.v === 'lambda' || t.v === 'await';
      if (t.t === 'op') return t.v === '(' || t.v === '[' || t.v === '{' || t.v === '-' || t.v === '+' || t.v === '~' || t.v === '...';
      return false;
    }

    function parseFExpr() {
      var e = starExpressions();
      if (peek().t !== 'newline' && peek().t !== 'eof') invalid();
      return e;
    }

    // --- fichier et instructions ---
    function parseFile() {
      var body = [];
      for (;;) {
        var t = peek();
        if (t.t === 'eof') break;
        if (t.t === 'newline') { p++; continue; }
        pushStmts(body, statement());
      }
      return body;
    }
    function pushStmts(arr, s) { if (Array.isArray(s)) { for (var i = 0; i < s.length; i++) arr.push(s[i]); } else arr.push(s); }

    function statement() {
      var t = peek();
      if (t.t === 'indent') err('unexpected indent', t, 'IndentationError');
      if (t.t === 'dedent') invalid(t);
      if (t.t === 'kw') {
        switch (t.v) {
          case 'if': return ifStmt();
          case 'while': return whileStmt();
          case 'for': return forStmt();
          case 'try': return tryStmt();
          case 'with': return withStmt();
          case 'def': return funcDef([]);
          case 'class': return classDef([]);
          case 'async': err("'async' is not supported in CodeQuest", t);
        }
      }
      if (t.t === 'op' && t.v === '@') return decorated();
      if (t.t === 'name' && t.v === 'match') {
        // « match x: » (instruction match) : non prise en charge. « match = 5 » reste une affectation.
        var q = p + 1, lvl = 0, ok = false;
        var t1 = toks[q];
        if (t1 && t1.t !== 'error' && !(t1.t === 'op' && /^(=|\.|\(|\[|,|\)|:|[-+*/%&|^<>!]=?|\*\*=?|\/\/=?|==|<<=?|>>=?)$/.test(t1.v) && !(t1.v === '(' || t1.v === '[' ))) {
          for (; q < toks.length; q++) {
            var tq = toks[q];
            if (tq.t === 'error' || tq.t === 'newline' || tq.t === 'eof') break;
            if (tq.t === 'op' && (tq.v === '(' || tq.v === '[' || tq.v === '{')) lvl++;
            else if (tq.t === 'op' && (tq.v === ')' || tq.v === ']' || tq.v === '}')) lvl--;
            else if (tq.t === 'op' && tq.v === ':' && lvl === 0) { ok = toks[q + 1] && toks[q + 1].t === 'newline'; break; }
            else if (tq.t === 'op' && tq.v === '=' && lvl === 0) break;
          }
        }
        if (ok) err("the 'match' statement is not supported in CodeQuest", t);
      }
      return simpleStmts();
    }

    function simpleStmts() {
      var list = [];
      for (;;) {
        list.push(simpleStmt());
        if (acceptOp(';')) {
          if (peek().t === 'newline' || peek().t === 'eof') break;
          continue;
        }
        break;
      }
      var t = peek();
      if (t.t === 'newline') { p++; }
      else if (t.t !== 'eof') {
        var last = list[list.length - 1];
        if (last.k === 'Expr' && last.e.k === 'Name' && (last.e.id === 'print' || last.e.id === 'exec') && startsExpr(t)) {
          err("Missing parentheses in call to '" + last.e.id + "'. Did you mean " + last.e.id + '(...)?', { line: last.line, col: last.e.col });
        }
        if (t.t === 'op' && t.v === ':=') err("the ':=' operator is not supported in CodeQuest", t);
        invalid(t);
      }
      return list.length === 1 ? list[0] : list;
    }

    function simpleStmt() {
      var t = peek(), line = t.line;
      if (t.t === 'kw') {
        switch (t.v) {
          case 'pass': p++; return { k: 'Pass', line: line };
          case 'break': p++; return { k: 'Break', line: line };
          case 'continue': p++; return { k: 'Continue', line: line };
          case 'return': {
            p++;
            var v = null;
            if (!atStmtEnd()) v = starExpressions();
            return { k: 'Return', v: v, line: line };
          }
          case 'raise': {
            p++;
            var exc = null, cause = null;
            if (!atStmtEnd()) {
              exc = expression();
              if (acceptKw('from')) cause = expression();
            }
            return { k: 'Raise', exc: exc, cause: cause, line: line };
          }
          case 'global': case 'nonlocal': {
            p++;
            var names = [expectName()];
            while (acceptOp(',')) names.push(expectName());
            return { k: t.v === 'global' ? 'Global' : 'Nonlocal', names: names, line: line };
          }
          case 'del': {
            p++;
            var targets = [];
            for (;;) {
              var e = bitwiseOr();
              checkTarget(e, 'del');
              targets.push(e);
              if (!acceptOp(',')) break;
              if (atStmtEnd()) break;
            }
            return { k: 'Del', targets: targets, line: line };
          }
          case 'assert': {
            p++;
            var test = expression(), msg = null;
            if (acceptOp(',')) msg = expression();
            return { k: 'Assert', test: test, msg: msg, line: line };
          }
          case 'import': return importStmt();
          case 'from': return fromImport();
          case 'yield': err("'yield' is not supported in CodeQuest", t);
        }
      }
      // expression, affectation
      var first = starExpressions();
      var nt = peek();
      if (nt.t === 'op') {
        if (nt.v === '=') {
          var targets2 = [first];
          var value;
          for (;;) {
            p++;
            if (isKw('yield')) err("'yield' is not supported in CodeQuest");
            if (atStmtEnd()) invalid();
            value = starExpressions();
            if (isOp('=')) { targets2.push(value); continue; }
            break;
          }
          for (var i = 0; i < targets2.length; i++) checkTarget(targets2[i], 'assign', true);
          if (value.k === 'Starred') err("can't use starred expression here", { line: value.line, col: value.col });
          return { k: 'Assign', targets: targets2, v: value, line: line };
        }
        if (nt.v.length >= 2 && nt.v[nt.v.length - 1] === '=' && /^(\+|-|\*|\/|\/\/|%|\*\*|>>|<<|&|\^|\||@)=$/.test(nt.v)) {
          if (first.k !== 'Name' && first.k !== 'Attr' && first.k !== 'Sub') {
            err("'" + exprName(first) + "' is an illegal expression for augmented assignment", { line: first.line, col: first.col });
          }
          p++;
          if (isKw('yield')) err("'yield' is not supported in CodeQuest");
          var v2 = starExpressions();
          return { k: 'AugAssign', t: first, op: nt.v.slice(0, -1), v: v2, line: line };
        }
        if (nt.v === ':') {
          if (first.k === 'Tuple') err('only single target (not tuple) can be annotated', { line: first.line, col: first.col });
          if (first.k === 'List') err('only single target (not list) can be annotated', { line: first.line, col: first.col });
          if (first.k !== 'Name' && first.k !== 'Attr' && first.k !== 'Sub') err('illegal target for annotation', { line: first.line, col: first.col });
          p++;
          var ann = expression();
          var v3 = null;
          if (acceptOp('=')) v3 = starExpressions();
          return { k: 'AnnAssign', t: first, ann: ann, v: v3, line: line };
        }
      }
      if (first.k === 'Starred') err("can't use starred expression here", { line: first.line, col: first.col });
      return { k: 'Expr', e: first, line: line };
    }

    function atStmtEnd() {
      var t = peek();
      return t.t === 'newline' || t.t === 'eof' || (t.t === 'op' && t.v === ';');
    }

    // Vérifie qu'une expression peut être une cible (affectation, for, del, with ... as).
    function checkTarget(e, ctx, top) {
      switch (e.k) {
        case 'Name': return;
        case 'Attr': case 'Sub': return;
        case 'Starred':
          if (ctx === 'del') err('cannot delete starred', e);
          if (top) err('starred assignment target must be in a list or tuple', e);
          checkTarget(e.e, ctx, false);
          return;
        case 'Tuple': case 'List': {
          var stars = 0;
          for (var i = 0; i < e.elts.length; i++) {
            if (e.elts[i].k === 'Starred') stars++;
            checkTarget(e.elts[i], ctx, false);
          }
          if (stars > 1) err('multiple starred expressions in assignment', e);
          return;
        }
      }
      var what = exprName(e);
      if (ctx === 'del') err('cannot delete ' + what, e);
      if (e.k === 'Const' && (e.v === true || e.v === false || e.v === null)) err('cannot assign to ' + what, e);
      if (top && ctx === 'assign') err('cannot assign to ' + what + " here. Maybe you meant '==' instead of '='?", e);
      err('cannot assign to ' + what, e);
    }

    function importStmt() {
      var line = next().line;
      if (atStmtEnd()) err("Expected one or more names after 'import'", peek());
      var names = [];
      do {
        var name = dottedName(), as = null;
        if (acceptKw('as')) as = expectName();
        names.push({ name: name, as: as });
      } while (acceptOp(','));
      return { k: 'Import', names: names, line: line };
    }
    function dottedName() {
      var n = expectName();
      while (acceptOp('.')) n += '.' + expectName();
      return n;
    }
    function fromImport() {
      var line = next().line, level = 0;
      while (isOp('.') || isOp('...')) { level += next().v.length; }
      var mod = null;
      if (!isKw('import')) mod = dottedName();
      if (!acceptKw('import')) invalid();
      var names = [];
      if (acceptOp('*')) return { k: 'ImportFrom', mod: mod, names: [{ name: '*', as: null }], level: level, line: line };
      var paren = acceptOp('(');
      do {
        if (paren && isOp(')')) break;
        var nm = expectName(), as = null;
        if (acceptKw('as')) as = expectName();
        names.push({ name: nm, as: as });
      } while (acceptOp(','));
      if (paren) expectOp(')');
      if (!names.length) invalid();
      return { k: 'ImportFrom', mod: mod, names: names, level: level, line: line };
    }

    // Bloc après « : » : soit des instructions simples sur la même ligne, soit NEWLINE INDENT ... DEDENT.
    function block(what, headerLine) {
      var t = peek();
      if (t.t === 'newline') {
        p++;
        var t2 = peek();
        if (t2.t !== 'indent') {
          err('expected an indented block after ' + what + ' on line ' + headerLine, t2, 'IndentationError');
        }
        p++;
        var body = [];
        for (;;) {
          var t3 = peek();
          if (t3.t === 'dedent') { p++; break; }
          if (t3.t === 'eof') break;
          pushStmts(body, statement());
        }
        return body;
      }
      if (t.t === 'eof') err('expected an indented block after ' + what + ' on line ' + headerLine, t, 'IndentationError');
      var s = simpleStmts();
      return Array.isArray(s) ? s : [s];
    }

    // Condition d'un if/elif/while : détecte « if x = 5: »
    function condition() {
      var e = namedExpression();
      if (isOp('=')) {
        if (e.k === 'Name') err("invalid syntax. Maybe you meant '==' or ':=' instead of '='?", { line: e.line, col: e.col });
        if (e.k !== 'Tuple' && e.k !== 'List' && !(e.k === 'Const' && (e.v === true || e.v === false || e.v === null)))
          err('cannot assign to ' + exprName(e) + " here. Maybe you meant '==' instead of '='?", { line: e.line, col: e.col });
      }
      return e;
    }

    function ifStmt() {
      var t = next(), line = t.line;
      var test = condition();
      expectColon();
      var body = block("'" + t.v + "' statement", line);
      var orelse = [];
      var t2 = peek();
      if (t2.t === 'kw' && t2.v === 'elif') {
        orelse = [ifStmt()];
      } else if (t2.t === 'kw' && t2.v === 'else') {
        p++;
        expectColon();
        orelse = block("'else' statement", t2.line);
      }
      return { k: 'If', test: test, body: body, orelse: orelse, line: line };
    }
    function whileStmt() {
      var line = next().line;
      var test = condition();
      expectColon();
      var body = block("'while' statement", line);
      var orelse = [];
      if (isKw('else')) { var te = next(); expectColon(); orelse = block("'else' statement", te.line); }
      return { k: 'While', test: test, body: body, orelse: orelse, line: line };
    }
    function forStmt() {
      var line = next().line;
      var target = targetList();
      if (!acceptKw('in')) invalid();
      var iter = starExpressions();
      expectColon();
      var body = block("'for' statement", line);
      var orelse = [];
      if (isKw('else')) { var te = next(); expectColon(); orelse = block("'else' statement", te.line); }
      return { k: 'For', target: target, iter: iter, body: body, orelse: orelse, line: line };
    }
    // Liste de cibles (for, compréhensions) : n'avale pas « in ».
    function targetList() {
      var t0 = peek();
      var elts = [], comma = false;
      for (;;) {
        var e;
        if (isOp('*')) { var st = next(); e = { k: 'Starred', e: bitwiseOr(), line: st.line, col: st.col }; }
        else e = bitwiseOr();
        elts.push(e);
        if (isOp(',')) { p++; comma = true; if (isKw('in') || isOp('=')) break; continue; }
        break;
      }
      var r = (elts.length === 1 && !comma) ? elts[0] : { k: 'Tuple', elts: elts, line: t0.line, col: t0.col };
      checkTarget(r, 'for', false);
      if (r.k === 'Starred') err('starred assignment target must be in a list or tuple', r);
      return r;
    }
    function tryStmt() {
      var line = next().line;
      expectColon();
      var body = block("'try' statement", line);
      var handlers = [], orelse = [], finalbody = [];
      while (isKw('except')) {
        var ht = next();
        var type = null, name = null;
        if (isOp('*')) err("'except*' is not supported in CodeQuest");
        if (!isOp(':')) {
          type = expression();
          if (isOp(',')) {
            err('multiple exception types must be parenthesized', { line: type.line, col: type.col });
          }
          if (acceptKw('as')) name = expectName();
        }
        expectColon();
        var hb = block("'except' statement", ht.line);
        handlers.push({ type: type, name: name, body: hb, line: ht.line });
      }
      if (handlers.length && isKw('else')) { var te = next(); expectColon(); orelse = block("'else' statement", te.line); }
      if (isKw('finally')) { var tf = next(); expectColon(); finalbody = block("'finally' statement", tf.line); }
      if (!handlers.length && !finalbody.length) err("expected 'except' or 'finally' block");
      return { k: 'Try', body: body, handlers: handlers, orelse: orelse, finalbody: finalbody, line: line };
    }
    function withStmt() {
      var line = next().line;
      var items = [];
      var paren = false;
      // « with (a as b, c as d): » (parenthèses autour de plusieurs éléments)
      if (isOp('(')) {
        var save = p, depth2 = 0, q = p, hasAs = false;
        for (; q < toks.length; q++) {
          var tq = toks[q];
          if (tq.t === 'error' || tq.t === 'eof') break;
          if (tq.t === 'op' && /^[([{]$/.test(tq.v)) depth2++;
          else if (tq.t === 'op' && /^[)\]}]$/.test(tq.v)) { depth2--; if (depth2 === 0) break; }
          else if (depth2 === 1 && tq.t === 'kw' && tq.v === 'as') hasAs = true;
        }
        var after = toks[q + 1];
        if (hasAs && after && after.t === 'op' && after.v === ':') { paren = true; p++; }
        else p = save;
      }
      do {
        if (paren && isOp(')')) break;
        var e = expression(), vars = null;
        if (acceptKw('as')) { vars = targetOne(); }
        items.push({ e: e, vars: vars });
      } while (acceptOp(','));
      if (paren) expectOp(')');
      expectColon();
      var body = block("'with' statement", line);
      return { k: 'With', items: items, body: body, line: line };
    }
    function targetOne() {
      var e = bitwiseOr();
      if (isOp(',')) {
        var elts = [e];
        while (acceptOp(',')) { if (isOp(':')) break; elts.push(bitwiseOr()); }
        e = { k: 'Tuple', elts: elts, line: e.line, col: e.col };
      }
      checkTarget(e, 'with', false);
      return e;
    }
    function decorated() {
      var decos = [];
      while (isOp('@')) {
        var t = next();
        var d = namedExpression();
        decos.push(d);
        if (peek().t !== 'newline') invalid();
        p++;
      }
      if (isKw('def')) return funcDef(decos);
      if (isKw('class')) return classDef(decos);
      if (isKw('async')) err("'async' is not supported in CodeQuest");
      invalid();
    }
    function funcDef(decos) {
      var t = next(), line = t.line;
      var nameTok = peek();
      if (nameTok.t !== 'name') invalid(nameTok);
      p++;
      if (!isOp('(')) err("expected '('");
      p++;
      parenLevel++;
      var args = parameters(')', true);
      parenLevel--;
      expectOp(')');
      var returns = null;
      if (acceptOp('->')) returns = expression();
      expectColon();
      var body = block('function definition', line);
      return { k: 'FunctionDef', name: nameTok.v, args: args, body: body, decos: decos, returns: returns, line: line, col: t.col };
    }
    function classDef(decos) {
      var t = next(), line = t.line;
      var name = expectName();
      var bases = [], kws = [];
      if (isOp('(')) {
        var c = callArgs();
        bases = c.args; kws = c.kws;
      }
      expectColon();
      var body = block('class definition', line);
      return { k: 'ClassDef', name: name, bases: bases, kws: kws, body: body, decos: decos, line: line };
    }

    // Paramètres d'une fonction (def ou lambda)
    function parameters(endOp, annotations) {
      var a = { args: [], defaults: [], vararg: null, kwonly: [], kwdefaults: [], kwarg: null, posonly: 0 };
      var seen = new Set();
      var sawDefault = false, star = false;
      function addName(tok) {
        if (seen.has(tok.v)) err("duplicate argument '" + tok.v + "' in function definition", tok);
        seen.add(tok.v);
      }
      while (!isOp(endOp)) {
        var t = peek();
        if (t.t === 'op' && t.v === '/') {
          p++;
          if (star || a.args.length === 0) invalid(t);
          a.posonly = a.args.length;
        } else if (t.t === 'op' && t.v === '*') {
          p++;
          if (star) err('* argument may appear only once', t);
          star = true;
          if (peek().t === 'name') {
            var nt = next(); addName(nt);
            a.vararg = nt.v;
            if (annotations && acceptOp(':')) expression();
            if (isOp('=')) err('var-positional argument cannot have default value');
          } else {
            if (isOp(endOp) || (isOp(',') && (peekAt(1).t === 'op' && (peekAt(1).v === endOp || peekAt(1).v === '**')))) err('named arguments must follow bare *', t);
          }
        } else if (t.t === 'op' && t.v === '**') {
          p++;
          var kt = peek();
          if (kt.t !== 'name') invalid(kt);
          p++; addName(kt);
          a.kwarg = kt.v;
          if (annotations && acceptOp(':')) expression();
          if (isOp('=')) err('var-keyword argument cannot have default value');
          acceptOp(',');
          if (!isOp(endOp)) err('arguments cannot follow var-keyword argument');
          break;
        } else if (t.t === 'name') {
          p++; addName(t);
          if (annotations && acceptOp(':')) expression();
          var def = null;
          if (acceptOp('=')) def = expression();
          if (star) {
            a.kwonly.push(t.v); a.kwdefaults.push(def);
          } else {
            if (def) sawDefault = true;
            else if (sawDefault) err('parameter without a default follows parameter with a default', t);
            a.args.push(t.v);
            if (def) a.defaults.push(def);
          }
        } else {
          invalid(t);
        }
        if (!acceptOp(',')) break;
      }
      return a;
    }

    // --- expressions ---
    function starExpressions() {
      var t0 = peek();
      var e = starExpression();
      if (!isOp(',')) return e;
      var elts = [e];
      while (acceptOp(',')) {
        if (!startsExprOrStar(peek())) break;
        elts.push(starExpression());
      }
      return { k: 'Tuple', elts: elts, line: t0.line, col: t0.col };
    }
    function startsExprOrStar(t) { return startsExpr(t) || (t.t === 'op' && t.v === '*') || (t.t === 'kw' && t.v === 'yield'); }
    function starExpression() {
      if (isOp('*')) { var t = next(); return { k: 'Starred', e: bitwiseOr(), line: t.line, col: t.col }; }
      return namedExpression();
    }
    function namedExpression() {
      var t = peek();
      if (t.t === 'name' && peekAt(1).t === 'op' && peekAt(1).v === ':=') err("the ':=' operator is not supported in CodeQuest", peekAt(1));
      if (t.t === 'kw' && t.v === 'yield') err("'yield' is not supported in CodeQuest", t);
      return expression();
    }
    function expression() {
      var t = peek();
      if (t.t === 'kw' && t.v === 'lambda') return lambdef();
      var e = disjunction();
      if (isKw('if')) {
        var save = p;
        p++;
        var test = disjunction();
        if (!acceptKw('else')) {
          if (isOp(':') || isKw('else')) { p = save; return e; }
          err("expected 'else' after 'if' expression", { line: e.line, col: e.col });
        }
        var orelse = expression();
        return { k: 'IfExp', test: test, body: e, orelse: orelse, line: e.line, col: e.col };
      }
      return e;
    }
    function lambdef() {
      var t = next();
      var args = parameters(':', false);
      expectColon();
      var body = expression();
      return { k: 'Lambda', args: args, body: body, line: t.line, col: t.col };
    }
    function disjunction() {
      var e = conjunction();
      if (!isKw('or')) return e;
      var vals = [e];
      while (acceptKw('or')) vals.push(conjunction());
      return { k: 'BoolOp', op: 'or', vals: vals, line: e.line, col: e.col };
    }
    function conjunction() {
      var e = inversion();
      if (!isKw('and')) return e;
      var vals = [e];
      while (acceptKw('and')) vals.push(inversion());
      return { k: 'BoolOp', op: 'and', vals: vals, line: e.line, col: e.col };
    }
    function inversion() {
      if (isKw('not')) { var t = next(); return { k: 'UnaryOp', op: 'not', e: inversion(), line: t.line, col: t.col }; }
      return comparison();
    }
    function compOp() {
      var t = peek();
      if (t.t === 'op') {
        if (t.v === '==' || t.v === '!=' || t.v === '<' || t.v === '>' || t.v === '<=' || t.v === '>=') { p++; return t.v; }
        return null;
      }
      if (t.t === 'kw') {
        if (t.v === 'in') { p++; return 'in'; }
        if (t.v === 'not' && peekAt(1).t === 'kw' && peekAt(1).v === 'in') { p += 2; return 'not in'; }
        if (t.v === 'is') { p++; if (acceptKw('not')) return 'is not'; return 'is'; }
      }
      return null;
    }
    function comparison() {
      var e = bitwiseOr();
      var op = compOp();
      if (op === null) return e;
      var ops = [], rs = [];
      while (op !== null) {
        ops.push(op); rs.push(bitwiseOr());
        op = compOp();
      }
      return { k: 'Compare', l: e, ops: ops, rs: rs, line: e.line, col: e.col };
    }
    function binLevel(sub, opsList) {
      return function () {
        var e = sub();
        for (;;) {
          var t = peek();
          if (t.t === 'op' && opsList.indexOf(t.v) >= 0) {
            p++;
            var r = sub();
            e = { k: 'BinOp', op: t.v, l: e, r: r, line: e.line, col: e.col, opLine: t.line };
          } else return e;
        }
      };
    }
    var term = binLevel(factor, ['*', '/', '//', '%', '@']);
    var sum = binLevel(term, ['+', '-']);
    var shiftExpr = binLevel(sum, ['<<', '>>']);
    var bitAnd = binLevel(shiftExpr, ['&']);
    var bitXor = binLevel(bitAnd, ['^']);
    var bitwiseOr = binLevel(bitXor, ['|']);
    function factor() {
      var t = peek();
      if (t.t === 'op' && (t.v === '-' || t.v === '+' || t.v === '~')) {
        p++;
        var e = factor();
        // constante négative directement (pour -5, repr exact)
        return { k: 'UnaryOp', op: t.v, e: e, line: t.line, col: t.col };
      }
      return power();
    }
    function power() {
      var e = primary();
      if (isOp('**')) {
        p++;
        var r = factor();
        return { k: 'BinOp', op: '**', l: e, r: r, line: e.line, col: e.col };
      }
      return e;
    }
    function primary() {
      var t = peek();
      if (t.t === 'kw' && t.v === 'await') err("'await' is not supported in CodeQuest", t);
      var e = atom();
      for (;;) {
        var t2 = peek();
        if (t2.t !== 'op') return e;
        if (t2.v === '.') {
          p++;
          var nt = peek();
          if (nt.t !== 'name') invalid(nt);
          p++;
          e = { k: 'Attr', e: e, name: nt.v, line: e.line, col: e.col, nameLine: nt.line };
        } else if (t2.v === '(') {
          var c = callArgs();
          e = { k: 'Call', f: e, args: c.args, kws: c.kws, line: e.line, col: e.col, endLine: prevTok().line };
        } else if (t2.v === '[') {
          p++; parenLevel++;
          var idx = slices();
          parenLevel--;
          expectOp(']');
          e = { k: 'Sub', e: e, idx: idx, line: e.line, col: e.col };
        } else return e;
      }
    }
    function slices() {
      var t0 = peek();
      var first = sliceItem();
      if (!isOp(',')) {
        if (!isOp(']')) commaCheck(first);
        return first;
      }
      var elts = [first];
      while (acceptOp(',')) {
        if (isOp(']')) break;
        elts.push(sliceItem());
      }
      if (!isOp(']')) commaCheck(elts[elts.length - 1]);
      return { k: 'Tuple', elts: elts, line: t0.line, col: t0.col };
    }
    function sliceItem() {
      var t = peek();
      var lo = null, hi = null, st = null;
      if (!isOp(':')) {
        if (isOp('*')) { var s = next(); return { k: 'Starred', e: bitwiseOr(), line: s.line, col: s.col }; }
        lo = namedExpression();
        if (!isOp(':')) return lo;
      }
      p++;
      if (!isOp(':') && !isOp(']') && !isOp(',')) hi = expression();
      if (acceptOp(':')) {
        if (!isOp(']') && !isOp(',')) st = expression();
      }
      return { k: 'Slice', lo: lo, hi: hi, st: st, line: t.line, col: t.col };
    }
    // Arguments d'un appel : f(a, *b, c=1, **d)
    function callArgs() {
      var open = next(); // '('
      parenLevel++;
      var args = [], kws = [], sawKw = false, sawDstar = false, seen = new Set();
      while (!isOp(')')) {
        var t = peek();
        if (t.t === 'op' && t.v === '*') {
          p++;
          if (sawDstar) err('iterable argument unpacking follows keyword argument unpacking', t);
          args.push({ k: 'Starred', e: expression(), line: t.line, col: t.col });
        } else if (t.t === 'op' && t.v === '**') {
          p++;
          kws.push({ name: null, v: expression(), line: t.line });
          sawDstar = true;
        } else if (t.t === 'name' && peekAt(1).t === 'op' && peekAt(1).v === '=') {
          p += 2;
          if (isOp(')') || isOp(',')) err('expected argument value expression', t);
          if (seen.has(t.v)) err('keyword argument repeated: ' + t.v, t);
          seen.add(t.v);
          kws.push({ name: t.v, v: expression(), line: t.line });
          sawKw = true;
        } else {
          var e = namedExpression();
          if (isOp('=')) {
            err('expression cannot contain assignment, perhaps you meant "=="?', { line: e.line, col: e.col });
          }
          if (isKw('for')) {
            var gen = comprehension(e, 'GenExp');
            if (args.length || kws.length || !isOp(')')) err('Generator expression must be parenthesized', { line: e.line, col: e.col });
            e = gen;
          }
          if (sawDstar) err('positional argument follows keyword argument unpacking', { line: e.line, col: e.col });
          if (sawKw) err('positional argument follows keyword argument', { line: e.line, col: e.col });
          args.push(e);
          if (!isOp(',') && !isOp(')')) commaCheck(e);
        }
        if (!acceptOp(',')) break;
      }
      parenLevel--;
      if (!isOp(')')) invalid();
      p++;
      return { args: args, kws: kws, line: open.line };
    }
    // « invalid syntax. Perhaps you forgot a comma? » entre parenthèses
    function commaCheck(prev) {
      var t = peek();
      if (startsExpr(t) && !(prev.k === 'Name' && (prev.id === 'print' || prev.id === 'exec'))) {
        if (!(t.t === 'name' && /^(match|case|type|_)$/.test(t.v) && false)) {
          err('invalid syntax. Perhaps you forgot a comma?', { line: prev.line, col: prev.col });
        }
      }
      invalid(t);
    }
    function comprehension(elt, kind, val) {
      var gens = [];
      while (isKw('for')) {
        p++;
        var target = targetList();
        if (!acceptKw('in')) invalid();
        var iter = disjunction();
        var ifs = [];
        while (isKw('if')) { p++; ifs.push(disjunction()); }
        gens.push({ target: target, iter: iter, ifs: ifs });
      }
      if (kind === 'DictComp') return { k: kind, key: elt, val: val, gens: gens, line: elt.line, col: elt.col };
      return { k: kind, elt: elt, gens: gens, line: elt.line, col: elt.col };
    }
    function strings() {
      var t = peek();
      var parts = [], isF = false, line = t.line;
      while (peek().t === 'str') {
        var s = next();
        if (s.f) {
          isF = true;
          for (var i = 0; i < s.f.length; i++) parts.push(convertFPart(s.f[i]));
        } else parts.push(s.v);
      }
      if (!isF) return { k: 'Const', v: parts.join(''), line: line, col: t.col };
      // fusion des morceaux littéraux voisins
      var merged = [];
      for (var j = 0; j < parts.length; j++) {
        if (typeof parts[j] === 'string' && typeof merged[merged.length - 1] === 'string') merged[merged.length - 1] += parts[j];
        else if (parts[j] !== '') merged.push(parts[j]);
      }
      return { k: 'JoinedStr', parts: merged, line: line, col: t.col };
    }
    function convertFPart(fp) {
      if (typeof fp === 'string') return fp;
      var e = parse('(' + fp.src + '\n)', fp.line - 1, 'expr');
      var spec = null;
      if (fp.spec) {
        var sp = [];
        for (var i = 0; i < fp.spec.length; i++) sp.push(convertFPart(fp.spec[i]));
        spec = sp;
      }
      return { k: 'FV', e: e, conv: fp.conv, spec: spec, debug: fp.debug };
    }
    function atom() {
      var t = peek();
      switch (t.t) {
        case 'name': p++; return { k: 'Name', id: t.v, line: t.line, col: t.col };
        case 'num': p++; return { k: 'Const', v: t.v, line: t.line, col: t.col };
        case 'str': return strings();
        case 'kw':
          if (t.v === 'True') { p++; return { k: 'Const', v: true, line: t.line, col: t.col }; }
          if (t.v === 'False') { p++; return { k: 'Const', v: false, line: t.line, col: t.col }; }
          if (t.v === 'None') { p++; return { k: 'Const', v: null, line: t.line, col: t.col }; }
          if (t.v === 'yield') err("'yield' is not supported in CodeQuest", t);
          invalid(t);
          break;
        case 'op':
          if (t.v === '(') return parenAtom();
          if (t.v === '[') return listAtom();
          if (t.v === '{') return dictAtom();
          if (t.v === '...') { p++; return { k: 'Const', v: undefined, ellipsis: true, line: t.line, col: t.col }; }
          invalid(t);
          break;
        default:
          invalid(t);
      }
    }
    function parenAtom() {
      var t = next();
      parenLevel++;
      if (isOp(')')) { p++; parenLevel--; return { k: 'Tuple', elts: [], line: t.line, col: t.col, paren: true }; }
      if (isKw('yield')) err("'yield' is not supported in CodeQuest");
      var first = starExpression();
      if (isKw('for')) {
        var g = comprehension(first, 'GenExp');
        parenLevel--;
        expectOp(')');
        g.line = t.line; g.col = t.col;
        return g;
      }
      if (isOp(')')) {
        p++; parenLevel--;
        if (first.k === 'Starred') err("cannot use starred expression here", first);
        first.paren = true;
        return first;
      }
      if (!isOp(',')) commaCheck(first);
      var elts = [first];
      while (acceptOp(',')) {
        if (isOp(')')) break;
        elts.push(starExpression());
        if (!isOp(',') && !isOp(')')) commaCheck(elts[elts.length - 1]);
      }
      parenLevel--;
      expectOp(')');
      return { k: 'Tuple', elts: elts, line: t.line, col: t.col, paren: true };
    }
    function listAtom() {
      var t = next();
      parenLevel++;
      if (isOp(']')) { p++; parenLevel--; return { k: 'List', elts: [], line: t.line, col: t.col }; }
      var first = starExpression();
      if (isKw('for')) {
        var c = comprehension(first, 'ListComp');
        parenLevel--;
        if (!isOp(']')) invalid();
        p++;
        c.line = t.line; c.col = t.col;
        return c;
      }
      var elts = [first];
      if (!isOp(',') && !isOp(']')) commaCheck(first);
      while (acceptOp(',')) {
        if (isOp(']')) break;
        elts.push(starExpression());
        if (!isOp(',') && !isOp(']')) commaCheck(elts[elts.length - 1]);
      }
      parenLevel--;
      expectOp(']');
      return { k: 'List', elts: elts, line: t.line, col: t.col };
    }
    function dictAtom() {
      var t = next();
      parenLevel++;
      if (isOp('}')) { p++; parenLevel--; return { k: 'Dict', keys: [], vals: [], line: t.line, col: t.col }; }
      var keys = [], vals = [];
      var first;
      if (isOp('**')) {
        p++;
        keys.push(null); vals.push(bitwiseOr());
      } else {
        first = starExpression();
        if (isOp(':') && first.k !== 'Starred') {
          p++;
          var v = expression();
          if (isKw('for')) {
            var dc = comprehension(first, 'DictComp', v);
            parenLevel--;
            expectOp('}');
            dc.line = t.line; dc.col = t.col;
            return dc;
          }
          keys.push(first); vals.push(v);
        } else {
          // ensemble
          if (isKw('for')) {
            var sc = comprehension(first, 'SetComp');
            parenLevel--;
            expectOp('}');
            sc.line = t.line; sc.col = t.col;
            return sc;
          }
          var elts = [first];
          if (!isOp(',') && !isOp('}')) commaCheck(first);
          while (acceptOp(',')) {
            if (isOp('}')) break;
            elts.push(starExpression());
            if (isOp(':')) invalid();
            if (!isOp(',') && !isOp('}')) commaCheck(elts[elts.length - 1]);
          }
          parenLevel--;
          expectOp('}');
          return { k: 'Set', elts: elts, line: t.line, col: t.col };
        }
      }
      while (acceptOp(',')) {
        if (isOp('}')) break;
        if (acceptOp('**')) { keys.push(null); vals.push(bitwiseOr()); continue; }
        var k = expression();
        if (!isOp(':')) {
          if (isOp(',') || isOp('}')) err("':' expected after dictionary key", { line: k.line, col: k.col });
          commaCheck(k);
        }
        p++;
        keys.push(k); vals.push(expression());
        if (!isOp(',') && !isOp('}')) commaCheck(vals[vals.length - 1]);
      }
      parenLevel--;
      expectOp('}');
      return { k: 'Dict', keys: keys, vals: vals, line: t.line, col: t.col };
    }
  }

  // =====================================================================================================
  // 4. Analyse des portées : pour chaque fonction, quelles variables sont locales, globales, libres
  //    (fermetures) ou « cellules » (locales capturées par une fonction interne).
  // =====================================================================================================
  function Scope(kind, name, parent, node) {
    this.kind = kind;           // 'module' | 'function' | 'class' | 'comp'
    this.name = name;
    this.parent = parent;
    this.node = node;
    this.assigned = new Set();
    this.used = new Set();
    this.globals = new Set();
    this.nonlocals = new Set();
    this.params = [];
    this.children = [];
    this.slots = new Map();     // nom -> index de case locale
    this.nslots = 0;
    this.cells = new Set();     // locales capturées
    this.free = [];             // noms libres (dans l'ordre de la fermeture)
    this.freeIdx = new Map();
    this.classCell = false;     // la classe fournit __class__ (pour super())
    this.qualname = name;
  }
  Scope.prototype.isFunc = function () { return this.kind === 'function' || this.kind === 'comp'; };
  Scope.prototype.addFree = function (name) {
    if (!this.freeIdx.has(name)) { this.freeIdx.set(name, this.free.length); this.free.push(name); }
  };
  Scope.prototype.slot = function (name) {
    var i = this.slots.get(name);
    if (i === undefined) { i = this.nslots++; this.slots.set(name, i); }
    return i;
  };
  // Est-ce que ce nom est lié localement dans cette portée de fonction ?
  Scope.prototype.bindsLocal = function (name) {
    return (this.assigned.has(name) || this.params.indexOf(name) >= 0) && !this.globals.has(name) && !this.nonlocals.has(name);
  };

  function synErr(msg, line, type) { return new PySyntaxError(type || 'SyntaxError', msg, line); }

  // Premier passage : crée les portées et note les noms liés / utilisés.
  function buildScopes(body) {
    var mod = new Scope('module', '<module>', null, null);
    function visitBody(stmts, sc) { for (var i = 0; i < stmts.length; i++) visitStmt(stmts[i], sc); }
    function bind(sc, name, line) {
      sc.assigned.add(name);
    }
    function use(sc, name) { sc.used.add(name); }
    function declare(sc, kind, names, line) {
      for (var i = 0; i < names.length; i++) {
        var nm = names[i];
        if (kind === 'global') {
          if (sc.params.indexOf(nm) >= 0) throw synErr("name '" + nm + "' is parameter and global", line);
          if (sc.nonlocals.has(nm)) throw synErr("name '" + nm + "' is nonlocal and global", line);
          if (sc.assigned.has(nm) && !sc.globals.has(nm)) throw synErr("name '" + nm + "' is assigned to before global declaration", line);
          if (sc.used.has(nm) && !sc.globals.has(nm)) throw synErr("name '" + nm + "' is used prior to global declaration", line);
          sc.globals.add(nm);
        } else {
          if (sc.kind === 'module') throw synErr('nonlocal declaration not allowed at module level', line);
          if (sc.params.indexOf(nm) >= 0) throw synErr("name '" + nm + "' is parameter and nonlocal", line);
          if (sc.globals.has(nm)) throw synErr("name '" + nm + "' is nonlocal and global", line);
          if (sc.assigned.has(nm) && !sc.nonlocals.has(nm)) throw synErr("name '" + nm + "' is assigned to before nonlocal declaration", line);
          if (sc.used.has(nm) && !sc.nonlocals.has(nm)) throw synErr("name '" + nm + "' is used prior to nonlocal declaration", line);
          sc.nonlocals.add(nm);
        }
      }
    }
    function visitTarget(t, sc) {
      switch (t.k) {
        case 'Name': bind(sc, t.id, t.line); break;
        case 'Tuple': case 'List': for (var i = 0; i < t.elts.length; i++) visitTarget(t.elts[i], sc); break;
        case 'Starred': visitTarget(t.e, sc); break;
        default: visitExpr(t, sc);
      }
    }
    function newScope(kind, name, sc, node) {
      var s = new Scope(kind, name, sc, node);
      sc.children.push(s);
      node.scope = s;
      // nom qualifié (pour les messages d'erreur : « Point.__init__() missing ... »)
      if (sc.kind === 'module') s.qualname = name;
      else if (sc.kind === 'class') s.qualname = sc.qualname + '.' + name;
      else s.qualname = sc.qualname + '.<locals>.' + name;
      return s;
    }
    function visitArgs(a, sc) {
      for (var i = 0; i < a.defaults.length; i++) visitExpr(a.defaults[i], sc);
      for (var j = 0; j < a.kwdefaults.length; j++) if (a.kwdefaults[j]) visitExpr(a.kwdefaults[j], sc);
    }
    function paramList(a) {
      // même ordre que CPython : positionnels, keyword-only, *args, **kwargs
      var ps = a.args.slice();
      for (var i = 0; i < a.kwonly.length; i++) ps.push(a.kwonly[i]);
      if (a.vararg) ps.push(a.vararg);
      if (a.kwarg) ps.push(a.kwarg);
      return ps;
    }
    function visitStmt(s, sc) {
      switch (s.k) {
        case 'Expr': visitExpr(s.e, sc); break;
        case 'Assign':
          visitExpr(s.v, sc);
          for (var i = 0; i < s.targets.length; i++) visitTarget(s.targets[i], sc);
          break;
        case 'AugAssign':
          visitExpr(s.v, sc);
          if (s.t.k === 'Name') { use(sc, s.t.id); bind(sc, s.t.id, s.line); } else visitExpr(s.t, sc);
          break;
        case 'AnnAssign':
          if (s.v) visitExpr(s.v, sc);
          if (s.t.k === 'Name') { if (s.v || sc.isFunc()) bind(sc, s.t.id, s.line); } else visitExpr(s.t, sc);
          break;
        case 'Return':
          if (s.v) visitExpr(s.v, sc);
          break;
        case 'Raise': if (s.exc) visitExpr(s.exc, sc); if (s.cause) visitExpr(s.cause, sc); break;
        case 'Global': declare(sc, 'global', s.names, s.line); break;
        case 'Nonlocal': declare(sc, 'nonlocal', s.names, s.line); break;
        case 'Del': for (var d = 0; d < s.targets.length; d++) visitTarget(s.targets[d], sc); break;
        case 'Assert': visitExpr(s.test, sc); if (s.msg) visitExpr(s.msg, sc); break;
        case 'Import':
          for (var m = 0; m < s.names.length; m++) bind(sc, s.names[m].as || s.names[m].name.split('.')[0], s.line);
          break;
        case 'ImportFrom':
          for (var m2 = 0; m2 < s.names.length; m2++) {
            if (s.names[m2].name === '*') { if (sc.kind !== 'module') throw synErr('import * only allowed at module level', s.line); continue; }
            bind(sc, s.names[m2].as || s.names[m2].name, s.line);
          }
          break;
        case 'If': visitExpr(s.test, sc); visitBody(s.body, sc); visitBody(s.orelse, sc); break;
        case 'While': visitExpr(s.test, sc); visitBody(s.body, sc); visitBody(s.orelse, sc); break;
        case 'For': visitExpr(s.iter, sc); visitTarget(s.target, sc); visitBody(s.body, sc); visitBody(s.orelse, sc); break;
        case 'Try':
          visitBody(s.body, sc);
          for (var h = 0; h < s.handlers.length; h++) {
            var hd = s.handlers[h];
            if (hd.type) visitExpr(hd.type, sc);
            if (hd.name) bind(sc, hd.name, hd.line);
            visitBody(hd.body, sc);
          }
          visitBody(s.orelse, sc); visitBody(s.finalbody, sc);
          break;
        case 'With':
          for (var w = 0; w < s.items.length; w++) { visitExpr(s.items[w].e, sc); if (s.items[w].vars) visitTarget(s.items[w].vars, sc); }
          visitBody(s.body, sc);
          break;
        case 'FunctionDef': {
          for (var dd = 0; dd < s.decos.length; dd++) visitExpr(s.decos[dd], sc);
          visitArgs(s.args, sc);
          bind(sc, s.name, s.line);
          var fs = newScope('function', s.name, sc, s);
          fs.params = paramList(s.args);
          visitBody(s.body, fs);
          break;
        }
        case 'ClassDef': {
          for (var dc = 0; dc < s.decos.length; dc++) visitExpr(s.decos[dc], sc);
          for (var b = 0; b < s.bases.length; b++) visitExpr(s.bases[b], sc);
          for (var kk = 0; kk < s.kws.length; kk++) visitExpr(s.kws[kk].v, sc);
          bind(sc, s.name, s.line);
          var cs = newScope('class', s.name, sc, s);
          visitBody(s.body, cs);
          break;
        }
      }
    }
    function visitComp(e, sc, name) {
      // le premier itérable est évalué dans la portée englobante
      visitExpr(e.gens[0].iter, sc);
      var cs = newScope('comp', name, sc, e);
      cs.params = ['.0'];
      for (var g = 0; g < e.gens.length; g++) {
        var gen = e.gens[g];
        if (g > 0) visitExpr(gen.iter, cs);
        visitTarget(gen.target, cs);
        for (var i = 0; i < gen.ifs.length; i++) visitExpr(gen.ifs[i], cs);
      }
      if (e.k === 'DictComp') { visitExpr(e.key, cs); visitExpr(e.val, cs); }
      else visitExpr(e.elt, cs);
    }
    function visitExpr(e, sc) {
      if (!e) return;
      switch (e.k) {
        case 'Name':
          use(sc, e.id);
          if (e.id === 'super' && sc.kind !== 'module') use(sc, '__class__');
          break;
        case 'Const': break;
        case 'JoinedStr':
          for (var i = 0; i < e.parts.length; i++) {
            var pt = e.parts[i];
            if (typeof pt !== 'string') {
              visitExpr(pt.e, sc);
              if (pt.spec) for (var j = 0; j < pt.spec.length; j++) if (typeof pt.spec[j] !== 'string') visitExpr(pt.spec[j].e, sc);
            }
          }
          break;
        case 'BinOp': visitExpr(e.l, sc); visitExpr(e.r, sc); break;
        case 'UnaryOp': visitExpr(e.e, sc); break;
        case 'BoolOp': for (var b = 0; b < e.vals.length; b++) visitExpr(e.vals[b], sc); break;
        case 'Compare': visitExpr(e.l, sc); for (var c = 0; c < e.rs.length; c++) visitExpr(e.rs[c], sc); break;
        case 'IfExp': visitExpr(e.test, sc); visitExpr(e.body, sc); visitExpr(e.orelse, sc); break;
        case 'Lambda': {
          visitArgs(e.args, sc);
          var ls = newScope('function', '<lambda>', sc, e);
          ls.params = paramList(e.args);
          visitExpr(e.body, ls);
          break;
        }
        case 'Call':
          visitExpr(e.f, sc);
          for (var a = 0; a < e.args.length; a++) visitExpr(e.args[a], sc);
          for (var k = 0; k < e.kws.length; k++) visitExpr(e.kws[k].v, sc);
          break;
        case 'Attr': visitExpr(e.e, sc); break;
        case 'Sub': visitExpr(e.e, sc); visitExpr(e.idx, sc); break;
        case 'Slice': visitExpr(e.lo, sc); visitExpr(e.hi, sc); visitExpr(e.st, sc); break;
        case 'Starred': visitExpr(e.e, sc); break;
        case 'List': case 'Tuple': case 'Set': for (var l = 0; l < e.elts.length; l++) visitExpr(e.elts[l], sc); break;
        case 'Dict':
          for (var d = 0; d < e.keys.length; d++) { if (e.keys[d]) visitExpr(e.keys[d], sc); visitExpr(e.vals[d], sc); }
          break;
        case 'ListComp': visitComp(e, sc, '<listcomp>'); break;
        case 'SetComp': visitComp(e, sc, '<setcomp>'); break;
        case 'DictComp': visitComp(e, sc, '<dictcomp>'); break;
        case 'GenExp': visitComp(e, sc, '<genexpr>'); break;
      }
    }
    visitBody(body, mod);
    resolveScope(mod);
    return mod;
  }

  // Deuxième passage : décide où vit chaque nom.
  function resolveScope(sc) {
    if (sc.isFunc()) {
      for (var i = 0; i < sc.params.length; i++) sc.slot(sc.params[i]);
      sc.assigned.forEach(function (n) { if (!sc.globals.has(n) && !sc.nonlocals.has(n)) sc.slot(n); });
    }
    if (sc.kind === 'class' && sc.used.has('__class__') && !sc.assigned.has('__class__')) {
      // __class__ utilisé directement dans le corps de classe : global
    }
    // noms nonlocal : doivent exister dans une fonction englobante
    sc.nonlocals.forEach(function (n) {
      if (!findFree(sc, n)) throw synErr("no binding for nonlocal '" + n + "' found", nonlocalLine(sc, n));
    });
    // noms utilisés mais pas liés ici : libres ?
    var names = [];
    sc.used.forEach(function (n) { names.push(n); });
    for (var j = 0; j < names.length; j++) {
      var n = names[j];
      if (sc.globals.has(n) || sc.nonlocals.has(n)) continue;
      if (sc.isFunc() && sc.slots.has(n)) continue;
      if (sc.kind === 'module') continue;
      findFree(sc, n);
    }
    for (var c = 0; c < sc.children.length; c++) resolveScope(sc.children[c]);
  }
  function nonlocalLine(sc, n) {
    var line = 0;
    (function walk(stmts) {
      for (var i = 0; i < stmts.length && !line; i++) {
        var s = stmts[i];
        if (s.k === 'Nonlocal' && s.names.indexOf(n) >= 0) { line = s.line; return; }
        if (s.body && s.k !== 'FunctionDef' && s.k !== 'ClassDef') walk(s.body);
        if (s.orelse) walk(s.orelse);
        if (s.handlers) for (var h = 0; h < s.handlers.length; h++) walk(s.handlers[h].body);
        if (s.finalbody) walk(s.finalbody);
      }
    })(sc.node && sc.node.body ? sc.node.body : []);
    return line;
  }
  // Cherche une liaison pour « name » dans les portées de fonctions englobantes. Si trouvée, la marque comme
  // cellule et ajoute le nom comme variable libre dans toutes les portées intermédiaires.
  function findFree(sc, name) {
    var chain = [];
    var p = sc.parent;
    while (p) {
      if (p.kind === 'module') return false;
      if (p.kind === 'class') {
        if (name === '__class__') { p.classCell = true; break; }
        chain.push(p);   // une classe intermédiaire transmet la cellule
        p = p.parent;
        continue;
      }
      if (p.globals.has(name)) return false;
      if (p.bindsLocal(name)) { p.cells.add(name); break; }
      if (p.nonlocals.has(name)) { chain.push(p); p = p.parent; continue; }
      chain.push(p);
      p = p.parent;
    }
    if (!p) return false;
    sc.addFree(name);
    for (var i = 0; i < chain.length; i++) chain[i].addFree(name);
    return true;
  }

  // =====================================================================================================
  // 5. Modèle objet
  //    int -> BigInt, float -> number, bool -> boolean, str -> string ; tout le reste : objets ci-dessous,
  //    chacun avec une propriété « cls » (son type Python), le plus souvent portée par le prototype.
  // =====================================================================================================
  function PyNoneT() {}
  function PyNotImplT() {}
  function PyEllipsisT() {}
  var None = new PyNoneT();
  var NotImplemented = new PyNotImplT();
  var Ellipsis = new PyEllipsisT();

  function PyList(a) { this.a = a; }
  function PyTuple(a) { this.a = a; }
  function PyDict() { this.m = new Map(); }           // m : clé interne -> [clé, valeur]
  function PyRange(start, stop, step) { this.start = start; this.stop = stop; this.step = step; }
  function PySlice(start, stop, step) { this.start = start; this.stop = stop; this.step = step; }
  function PyCell(v) { this.v = v; }
  function PyModule(name) { this.name = name; this.d = new Map(); }
  function PyInst(cls) { this.cls = cls; this.d = new Map(); }
  // Fonction écrite en Python
  function PyFunc(code, globals, defaults, kwdefaults, closure) {
    this.code = code; this.globals = globals; this.defaults = defaults; this.kwdefaults = kwdefaults;
    this.closure = closure; this.name = code.name; this.qualname = code.qualname; this.d = null; this.doc = None;
  }
  // Méthode liée (fonction Python + objet)
  function PyMethod(func, self) { this.func = func; this.self = self; }
  // Fonction native : fn(args, kw) ; self optionnel (méthode native liée)
  function PyBuiltin(name, fn, self, qual) { this.name = name; this.fn = fn; this.self = self; this.qual = qual || null; }
  // Méthode native d'un type (descripteur) : fn(self, args, kw)
  function PyMethodDescr(type, name, fn) { this.type = type; this.name = name; this.fn = fn; }
  function PyProperty(fget, fset, fdel, doc) { this.fget = fget; this.fset = fset; this.fdel = fdel; this.doc = doc; }
  function PyStaticMethod(f) { this.f = f; }
  function PyClassMethod(f) { this.f = f; }
  function PySuper(type, obj) { this.type = type; this.obj = obj; }
  function PyType(name, bases, d) {
    this.name = name; this.qualname = name; this.module = 'builtins';
    this.bases = bases; this.d = d || new Map();
    this.mro = null; this.native = true; this.call = null; this.isExc = false; this.layout = null;
    this.doc = None; this.attrs = null; this.userAttrs = null;
  }

  var T_object, T_type, T_int, T_float, T_bool, T_str, T_list, T_tuple, T_dict, T_set, T_frozenset, T_range,
    T_slice, T_NoneType, T_NotImplementedType, T_ellipsis, T_function, T_builtin, T_method, T_method_descr,
    T_module, T_property, T_staticmethod, T_classmethod, T_super, T_cell, T_generator, T_iterator;

  function computeMro(cls) {
    // linéarisation C3
    var seqs = [];
    for (var i = 0; i < cls.bases.length; i++) seqs.push(cls.bases[i].mro.slice());
    seqs.push(cls.bases.slice());
    var res = [cls];
    for (;;) {
      seqs = seqs.filter(function (s) { return s.length; });
      if (!seqs.length) return res;
      var cand = null;
      for (var j = 0; j < seqs.length; j++) {
        var c = seqs[j][0];
        var ok = true;
        for (var k = 0; k < seqs.length; k++) if (seqs[k].indexOf(c, 1) > 0) { ok = false; break; }
        if (ok) { cand = c; break; }
      }
      if (!cand) {
        throw pyErr(T_TypeError, 'Cannot create a consistent method resolution order (MRO) for bases ' +
          cls.bases.map(function (b) { return b.name; }).join(', '));
      }
      res.push(cand);
      for (var m = 0; m < seqs.length; m++) if (seqs[m][0] === cand) seqs[m].shift();
    }
  }

  function makeType(name, bases, layout) {
    var t = new PyType(name, bases);
    t.mro = bases.length ? null : [t];
    if (bases.length) t.mro = computeMro(t);
    t.layout = layout || (bases.length ? bases[0].layout : 'object');
    return t;
  }

  // Recherche d'un attribut dans le MRO d'un type
  function lookup(cls, name) {
    var mro = cls.mro;
    for (var i = 0; i < mro.length; i++) {
      var v = mro[i].d.get(name);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  function isSubtype(a, b) { return a === b || a.mro.indexOf(b) >= 0; }

  function typeOf(v) {
    switch (typeof v) {
      case 'bigint': return T_int;
      case 'number': return T_float;
      case 'string': return T_str;
      case 'boolean': return T_bool;
      case 'object': return v.cls;
    }
    return T_object;
  }
  function tname(v) { return typeOf(v).name; }
  function isinst(v, cls) { var t = typeOf(v); return t === cls || t.mro.indexOf(cls) >= 0; }

  // ---- Exceptions ----
  var T_BaseException, T_Exception, T_TypeError, T_ValueError, T_NameError, T_UnboundLocalError, T_AttributeError,
    T_IndexError, T_KeyError, T_LookupError, T_ZeroDivisionError, T_ArithmeticError, T_OverflowError,
    T_RecursionError, T_RuntimeError, T_StopIteration, T_AssertionError, T_ImportError, T_ModuleNotFoundError,
    T_NotImplementedError, T_EOFError, T_OSError, T_FileNotFoundError, T_FileExistsError, T_SyntaxError,
    T_IndentationError, T_TabError, T_MemoryError, T_SystemExit, T_KeyboardInterrupt, T_UnicodeError,
    T_UnsupportedOperation, T_IsADirectoryError, T_PermissionError, T_GeneratorExit, T_FloatingPointError,
    T_SystemError, T_JSONDecodeError, T_StatisticsError, T_CsvError;

  function newExc(cls, args) {
    var e = new PyInst(cls);
    e.args = args;           // tableau JS des arguments
    // ligne et profondeur au moment de la création (= levée, pour les erreurs natives)
    e.$line = curLine; e.$depth = depth; e.$raised = true; e.$claimed = false;
    return e;
  }
  // Crée une exception Python native (message texte)
  function pyErr(cls, msg) {
    return newExc(cls, msg === undefined ? [] : [msg]);
  }
  function typeErr(msg) { return pyErr(T_TypeError, msg); }
  function valueErr(msg) { return pyErr(T_ValueError, msg); }
  function excStr(e) {
    var s = lookup(e.cls, '__str__');
    if (s && !(s instanceof PyMethodDescr && s.type === T_BaseException)) return pyStr(callAny(s, [e]));
    return baseExcStr(e);
  }
  function baseExcStr(e) {
    var a = e.args;
    if (isinst(e, T_KeyError) && a.length === 1) return pyRepr(a[0]);
    if (isinst(e, T_OSError) && e.d.has('errno') && e.d.get('strerror') !== None && e.d.get('errno') !== None) {
      var fn = e.d.get('filename');
      return '[Errno ' + pyStr(e.d.get('errno')) + '] ' + pyStr(e.d.get('strerror')) + (fn !== None && fn !== undefined ? ': ' + pyRepr(fn) : '');
    }
    if (isinst(e, T_SyntaxError) && e.d.has('msg')) {
      return pyStr(e.d.get('msg'));
    }
    if (a.length === 0) return '';
    if (a.length === 1) return pyStr(a[0]);
    return pyRepr(new PyTuple(a));
  }

  // ---- Identité (id()) ----
  var idMap = new WeakMap();
  function objId(o) {
    var i = idMap.get(o);
    if (i === undefined) { i = 140000000000000 + (++idCounter) * 16 + Math.floor(runRandomSeed * 4096) * 16 * 65536; idMap.set(o, i); }
    return i;
  }
  function addr(o) { return '0x' + objId(o).toString(16).padStart(12, '0'); }

  // ---- Clés de dictionnaire et hachage ----
  var keyTokens = new Map();     // tuples / frozensets -> jeton unique
  var customHash = new Map();    // objets avec __hash__ et __eq__ personnalisés
  function hkey(k) {
    switch (typeof k) {
      case 'string': return k;
      case 'bigint': return k;
      case 'boolean': return k ? 1n : 0n;
      case 'number': return Number.isInteger(k) ? BigInt(k) : (k === 0 ? 0n : k);
      case 'object': return k.$hkey();
    }
    throw typeErr('unhashable value');
  }
  function keyStr(k) {
    switch (typeof k) {
      case 'string': return 's' + k.length + ':' + k;
      case 'bigint': return 'i' + k;
      case 'boolean': return k ? 'i1' : 'i0';
      case 'number': return Number.isInteger(k) ? 'i' + BigInt(k) : 'f' + k;
      case 'object': {
        var h = k.$hkey();
        if (typeof h === 'object' && h !== null) {
          if (h.$tok) return h.$tok;
          return 'o' + objId(h);
        }
        return keyStr(h);
      }
    }
    return '?';
  }
  function token(s) {
    var t = keyTokens.get(s);
    if (!t) { t = { $tok: s }; keyTokens.set(s, t); }
    return t;
  }
  function unhashable(o) { return typeErr("unhashable type: '" + tname(o) + "'"); }

  // Hachage compatible CPython (sert à l'ordre des ensembles et à hash())
  var HASH_MOD = (1n << 61n) - 1n;
  var M64 = (1n << 64n) - 1n;
  function toSigned64(x) { return BigInt.asIntN(64, x); }
  function normHash(h) { // représentation canonique : number si sûr, sinon BigInt
    if (typeof h === 'bigint' && h >= -9007199254740991n && h <= 9007199254740991n) return Number(h);
    return h;
  }
  function hashInt(n) {
    var r;
    if (n >= 0n) r = n % HASH_MOD; else r = -((-n) % HASH_MOD);
    if (r === -1n) r = -2n;
    return normHash(r);
  }
  function hashFloat(v) {
    if (!isFinite(v)) {
      if (v === Infinity) return 314159;
      if (v === -Infinity) return -314159;
      return 0;
    }
    if (Number.isInteger(v)) return hashInt(BigInt(v));
    // _Py_HashDouble
    var e = 0, m = Math.abs(v);
    // frexp
    var fr = frexp(m); m = fr[0]; e = fr[1];
    var sign = v < 0 ? -1n : 1n;
    var x = 0n;
    var BITS = 61n;
    while (m) {
      x = ((x << 28n) & HASH_MOD) | (x >> (BITS - 28n));
      m *= 268435456.0;
      e -= 28;
      var y = Math.floor(m);
      m -= y;
      x += BigInt(y);
      if (x >= HASH_MOD) x -= HASH_MOD;
    }
    e = e >= 0 ? e % 61 : 61 - 1 - ((-1 - e) % 61);
    var eb = BigInt(e);
    x = ((x << eb) & HASH_MOD) | (x >> (BITS - eb));
    x = x * sign;
    if (x === -1n) x = -2n;
    return normHash(x);
  }
  function frexp(x) {
    if (x === 0 || !isFinite(x)) return [x, 0];
    var ax = Math.abs(x);
    var e = Math.max(-1023, Math.floor(Math.log2(ax)) + 1);
    var m = ax * Math.pow(2, -e);
    while (m < 0.5) { m *= 2; e--; }
    while (m >= 1) { m /= 2; e++; }
    // gestion des sous-normaux
    if (!isFinite(m) || m === 0) { m = ax; e = 0; while (m >= 1) { m /= 2; e++; } while (m < 0.5) { m *= 2; e--; } }
    return [x < 0 ? -m : m, e];
  }
  function hashStr(s) {
    if (s.length === 0) return 0;
    // FNV-1a 32 bits (CPython utilise un hachage aléatoire : n'importe quel ordre est valable)
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }
  var XXPRIME_1 = 11400714785074694791n, XXPRIME_2 = 14029467366897019727n, XXPRIME_5 = 2870177450012600261n;
  function hashTuple(items) {
    var acc = XXPRIME_5;
    for (var i = 0; i < items.length; i++) {
      var lane = BigInt.asUintN(64, BigInt(pyHash(items[i])));
      acc = (acc + lane * XXPRIME_2) & M64;
      acc = ((acc << 31n) | (acc >> 33n)) & M64;
      acc = (acc * XXPRIME_1) & M64;
    }
    acc = (acc + (BigInt(items.length) ^ (XXPRIME_5 ^ 3527539n))) & M64;
    if (acc === M64) return 1546275796;
    return normHash(toSigned64(acc));
  }
  function pyHash(v) {
    switch (typeof v) {
      case 'bigint': return (v >= -2147483648n && v <= 2147483647n) ? (v === -1n ? -2 : Number(v)) : hashInt(v);
      case 'boolean': return v ? 1 : 0;
      case 'number': return hashFloat(v);
      case 'string': return hashStr(v);
      case 'object': return v.$hash();
    }
    return 0;
  }

  // ---- Fabrication d'objets courants ----
  function newList(a) { return new PyList(a); }
  function newTuple(a) { return new PyTuple(a); }
  var EMPTY_TUPLE = new PyTuple([]);
  function newDict() { return new PyDict(); }
  function dictFromPairs(pairs) { var d = new PyDict(); for (var i = 0; i < pairs.length; i++) dictSet(d, pairs[i][0], pairs[i][1]); return d; }

  // ---- Dictionnaires ----
  function dictGet(d, k) { var e = d.m.get(hkey(k)); return e === undefined ? undefined : e[1]; }
  function dictSet(d, k, v) {
    var h = hkey(k);
    var e = d.m.get(h);
    if (e !== undefined) e[1] = v; else d.m.set(h, [k, v]);
  }
  function dictDel(d, k) { return d.m.delete(hkey(k)); }
  function dictHas(d, k) { return d.m.has(hkey(k)); }
  function strDict(obj) { // objet JS {nom: valeur} -> dict Python
    var d = new PyDict();
    for (var k in obj) if (hasOwn(obj, k)) dictSet(d, k, obj[k]);
    return d;
  }

  // ---- Ensembles : table de hachage ouverte identique à CPython (même ordre d'itération) ----
  // keys[i] : undefined = case vide, DUMMY = case supprimée. index : clé interne -> case (recherche rapide).
  var DUMMY = { dummy: true };
  function PySet() {
    this.keys = new Array(8); this.hashes = new Array(8); this.hks = new Array(8);
    this.mask = 7; this.fill = 0; this.used = 0; this.finger = 0; this.index = new Map();
  }
  function PyFrozenSet() { PySet.call(this); this.$h = undefined; }
  PyFrozenSet.prototype = Object.create(PySet.prototype);
  PyFrozenSet.prototype.constructor = PyFrozenSet;

  var probeReuse = false;
  // Trouve la case où insérer une clé absente (set_add_entry de CPython)
  function setProbe(s, h) {
    var keys = s.keys, mask = s.mask, freeslot = -1, j, probes, kk;
    probeReuse = false;
    if (typeof h === 'number' && h >= 0) {
      var i = h & mask, perturb = h;
      for (;;) {
        probes = (i + 9 <= mask) ? 9 : 0;
        j = i;
        do {
          kk = keys[j];
          if (kk === undefined) { if (freeslot >= 0) { probeReuse = true; return freeslot; } return j; }
          if (kk === DUMMY) freeslot = j;
          j++;
        } while (probes--);
        perturb = Math.floor(perturb / 32);
        i = ((i * 5 + 1) + (perturb % 4294967296)) & mask;
      }
    }
    var hu = BigInt.asUintN(64, BigInt(h)), bm = BigInt(mask);
    var ib = hu & bm, pb = hu;
    for (;;) {
      var ii = Number(ib);
      probes = (ii + 9 <= mask) ? 9 : 0;
      j = ii;
      do {
        kk = keys[j];
        if (kk === undefined) { if (freeslot >= 0) { probeReuse = true; return freeslot; } return j; }
        if (kk === DUMMY) freeslot = j;
        j++;
      } while (probes--);
      pb >>= 5n;
      ib = (ib * 5n + 1n + pb) & bm;
    }
  }
  // set_insert_clean : première case vide
  function setInsertClean(keys, mask, h) {
    var j, probes;
    if (typeof h === 'number' && h >= 0) {
      var i = h & mask, perturb = h;
      for (;;) {
        if (keys[i] === undefined) return i;
        if (i + 9 <= mask) {
          for (j = 1; j <= 9; j++) if (keys[i + j] === undefined) return i + j;
        }
        perturb = Math.floor(perturb / 32);
        i = ((i * 5 + 1) + (perturb % 4294967296)) & mask;
      }
    }
    var hu = BigInt.asUintN(64, BigInt(h)), bm = BigInt(mask);
    var ib = hu & bm, pb = hu;
    for (;;) {
      var ii = Number(ib);
      if (keys[ii] === undefined) return ii;
      if (ii + 9 <= mask) {
        for (j = 1; j <= 9; j++) if (keys[ii + j] === undefined) return ii + j;
      }
      pb >>= 5n;
      ib = (ib * 5n + 1n + pb) & bm;
    }
  }
  function setResize(s, minused) {
    var newsize = 8;
    while (newsize <= minused) newsize *= 2;
    if (newsize === 8 && s.mask === 7 && s.fill === s.used) return;
    var ok = s.keys, oh = s.hashes, ohk = s.hks, om = s.mask;
    var nk = new Array(newsize), nh = new Array(newsize), nhk = new Array(newsize), idx = new Map();
    var mask = newsize - 1;
    for (var i = 0; i <= om; i++) {
      var k = ok[i];
      if (k !== undefined && k !== DUMMY) {
        var j = setInsertClean(nk, mask, oh[i]);
        nk[j] = k; nh[j] = oh[i]; nhk[j] = ohk[i]; idx.set(ohk[i], j);
      }
    }
    s.keys = nk; s.hashes = nh; s.hks = nhk; s.mask = mask; s.fill = s.used; s.index = idx;
  }
  function setAddKey(s, k, h, hk) {
    if (hk === undefined) hk = hkey(k);
    if (s.index.has(hk)) return false;
    if (h === undefined) h = pyHash(k);
    var j = setProbe(s, h);
    s.used++;
    if (!probeReuse) s.fill++;
    s.keys[j] = k; s.hashes[j] = h; s.hks[j] = hk; s.index.set(hk, j);
    if (!probeReuse && s.fill * 5 >= s.mask * 3) setResize(s, s.used > 50000 ? s.used * 2 : s.used * 4);
    return true;
  }
  function setHas(s, k) { return s.index.has(hkey(k)); }
  function setDiscardHk(s, hk) {
    var j = s.index.get(hk);
    if (j === undefined) return false;
    s.keys[j] = DUMMY; s.hashes[j] = -1; s.hks[j] = undefined;
    s.index.delete(hk);
    s.used--;
    return true;
  }
  function setDiscard(s, k) { return setDiscardHk(s, hkey(k)); }
  function setClear(s) {
    s.keys = new Array(8); s.hashes = new Array(8); s.hks = new Array(8);
    s.mask = 7; s.fill = 0; s.used = 0; s.index = new Map();
  }
  function setItems(s) { // éléments dans l'ordre de la table
    var r = [], keys = s.keys;
    for (var i = 0; i <= s.mask; i++) { var k = keys[i]; if (k !== undefined && k !== DUMMY) r.push(k); }
    return r;
  }
  function newSetLike(s) { return (s instanceof PyFrozenSet) ? new PyFrozenSet() : new PySet(); }
  function setMerge(s, o) {
    if (o === s || o.used === 0) return;
    if ((s.fill + o.used) * 5 >= s.mask * 3) setResize(s, (s.used + o.used) * 2);
    var i, k;
    if (s.fill === 0 && s.mask === o.mask && o.fill === o.used) {
      for (i = 0; i <= o.mask; i++) {
        k = o.keys[i];
        if (k !== undefined) { s.keys[i] = k; s.hashes[i] = o.hashes[i]; s.hks[i] = o.hks[i]; s.index.set(o.hks[i], i); }
      }
      s.fill = o.fill; s.used = o.used;
      return;
    }
    if (s.fill === 0) {
      s.fill = o.used; s.used = o.used;
      for (i = 0; i <= o.mask; i++) {
        k = o.keys[i];
        if (k !== undefined && k !== DUMMY) {
          var j = setInsertClean(s.keys, s.mask, o.hashes[i]);
          s.keys[j] = k; s.hashes[j] = o.hashes[i]; s.hks[j] = o.hks[i]; s.index.set(o.hks[i], j);
        }
      }
      return;
    }
    for (i = 0; i <= o.mask; i++) {
      k = o.keys[i];
      if (k !== undefined && k !== DUMMY) setAddKey(s, k, o.hashes[i], o.hks[i]);
    }
  }
  function isExactDict(o) { return o instanceof PyDict && o.cls === T_dict; }
  function setUpdate(s, other) {
    if (other instanceof PySet) { setMerge(s, other); return; }
    if (isExactDict(other)) {
      var n = other.m.size;
      if ((s.fill + n) * 5 >= s.mask * 3) setResize(s, (s.used + n) * 2);
      other.m.forEach(function (e) { setAddKey(s, e[0]); });
      return;
    }
    iterate(other, function (k) { setAddKey(s, k); });
  }
  function setCopy(s) { var r = newSetLike(s); setMerge(r, s); return r; }
  function setFrom(iterable, frozen) {
    var s = frozen ? new PyFrozenSet() : new PySet();
    if (iterable !== undefined) setUpdate(s, iterable);
    return s;
  }
  function setIntersection(s, o) {
    if (s === o) return setCopy(s);
    var res = newSetLike(s);
    if (o instanceof PySet) {
      var big = s, small = o;
      if (o.used > s.used) { big = o; small = s; }
      for (var i = 0; i <= small.mask; i++) {
        var k = small.keys[i];
        if (k !== undefined && k !== DUMMY && big.index.has(small.hks[i])) setAddKey(res, k, small.hashes[i], small.hks[i]);
      }
      return res;
    }
    var it = getIter(o), v;
    while ((v = it.nx()) !== undefined) {
      var hk = hkey(v);
      if (s.index.has(hk)) {
        setAddKey(res, v, undefined, hk);
        if (res.used >= s.used) break;
      }
    }
    return res;
  }
  function setDifferenceUpdate(s, other) {
    if (s === other) { setClear(s); return; }
    if (other instanceof PySet) {
      var o = other;
      if ((o.used >> 3) > s.used) o = setIntersection(s, o);
      for (var i = 0; i <= o.mask; i++) {
        var k = o.keys[i];
        if (k !== undefined && k !== DUMMY) setDiscardHk(s, o.hks[i]);
      }
    } else {
      iterate(other, function (v) { setDiscard(s, v); });
    }
    if ((s.fill - s.used) <= Math.floor(s.mask / 4)) return;
    setResize(s, s.used > 50000 ? s.used * 2 : s.used * 4);
  }
  function setDifference(s, other) {
    var osize;
    if (other instanceof PySet) osize = other.used;
    else if (isExactDict(other)) osize = other.m.size;
    else { var c = setCopy(s); setDifferenceUpdate(c, other); return c; }
    if ((s.used >> 2) > osize) { var c2 = setCopy(s); setDifferenceUpdate(c2, other); return c2; }
    var res = newSetLike(s);
    var isD = !(other instanceof PySet);
    for (var i = 0; i <= s.mask; i++) {
      var k = s.keys[i];
      if (k === undefined || k === DUMMY) continue;
      var present = isD ? other.m.has(s.hks[i]) : other.index.has(s.hks[i]);
      if (!present) setAddKey(res, k, s.hashes[i], s.hks[i]);
    }
    return res;
  }
  function setSymDiffUpdateSet(s, o) {
    for (var i = 0; i <= o.mask; i++) {
      var k = o.keys[i];
      if (k === undefined || k === DUMMY) continue;
      var hk = o.hks[i], h = o.hashes[i];
      if (!setDiscardHk(s, hk)) setAddKey(s, k, h, hk);
    }
  }
  function setSymDiffUpdate(s, other) {
    if (s === other) { setClear(s); return; }
    if (isExactDict(other)) {
      other.m.forEach(function (e) { var hk = hkey(e[0]); if (!setDiscardHk(s, hk)) setAddKey(s, e[0], undefined, hk); });
    } else if (other instanceof PySet) setSymDiffUpdateSet(s, other);
    else setSymDiffUpdateSet(s, setFrom(other, s instanceof PyFrozenSet));
  }
  function setSymDiff(s, other) {
    var res = newSetLike(s);
    setUpdate(res, other);
    setSymDiffUpdateSet(res, s);
    return res;
  }
  function setSwapBodies(a, b) {
    var f = ['keys', 'hashes', 'hks', 'mask', 'fill', 'used', 'index'];
    for (var i = 0; i < f.length; i++) { var t = a[f[i]]; a[f[i]] = b[f[i]]; b[f[i]] = t; }
  }
  function setIsSubset(s, o) { // o : ensemble
    if (s.used > o.used) return false;
    for (var i = 0; i <= s.mask; i++) {
      var k = s.keys[i];
      if (k !== undefined && k !== DUMMY && !o.index.has(s.hks[i])) return false;
    }
    return true;
  }
  function frozensetHash(s) {
    if (s.$h !== undefined) return s.$h;
    function shuffle(h) { h = BigInt.asUintN(64, BigInt(h)); return (((h ^ 89869747n) ^ (h << 16n)) * 3644798167n) & M64; }
    var hash = 0n;
    for (var i = 0; i <= s.mask; i++) {
      var k = s.keys[i];
      hash ^= shuffle(k === undefined ? 0 : (k === DUMMY ? -1 : s.hashes[i]));
    }
    if (((s.mask + 1 - s.fill) & 1) !== 0) hash ^= shuffle(0);
    if (((s.fill - s.used) & 1) !== 0) hash ^= shuffle(-1);
    hash ^= ((BigInt(s.used) + 1n) * 1927868237n) & M64;
    hash ^= (hash >> 11n) ^ (hash >> 25n);
    hash = (hash * 69069n + 907133923n) & M64;
    if (hash === M64) hash = 590923713n;
    s.$h = normHash(toSigned64(hash));
    return s.$h;
  }

  // =====================================================================================================
  // 6. Opérations : nombres, chaînes, repr, format, comparaisons, arithmétique
  // =====================================================================================================

  // ---- Entiers ----
  var INT_STR_LIMIT = 10n ** 4300n;
  function intToStr(n) {
    if ((n > 9007199254740991n || n < -9007199254740991n) && (n >= INT_STR_LIMIT || -n >= INT_STR_LIMIT)) {
      throw valueErr('Exceeds the limit (4300 digits) for integer string conversion; use sys.set_int_max_str_digits() to increase the limit');
    }
    return n.toString();
  }
  function floorDivInt(a, b) {
    if (b === 0n) throw pyErr(T_ZeroDivisionError, 'integer division or modulo by zero');
    var q = a / b;
    if ((a % b !== 0n) && ((a < 0n) !== (b < 0n))) q -= 1n;
    return q;
  }
  function modInt(a, b) {
    if (b === 0n) throw pyErr(T_ZeroDivisionError, 'integer modulo by zero');
    var r = a % b;
    if (r !== 0n && ((r < 0n) !== (b < 0n))) r += b;
    return r;
  }
  function bitLength(n) { if (n < 0n) n = -n; return n === 0n ? 0 : n.toString(2).length; }
  function intToFloat(n) {
    if (n <= 9007199254740992n && n >= -9007199254740992n) return Number(n);
    var x = Number(n);
    if (!isFinite(x)) throw pyErr(T_OverflowError, 'int too large to convert to float');
    return x;
  }
  // division vraie entre entiers, correctement arrondie
  function trueDivInt(a, b) {
    if (b === 0n) throw pyErr(T_ZeroDivisionError, 'division by zero');
    var M = 9007199254740992n;
    if (a <= M && a >= -M && b <= M && b >= -M) return Number(a) / Number(b);
    var neg = (a < 0n) !== (b < 0n);
    if (a < 0n) a = -a;
    if (b < 0n) b = -b;
    var shift = 64 - (bitLength(a) - bitLength(b));
    var q, r;
    if (shift > 0) { q = (a << BigInt(shift)) / b; r = (a << BigInt(shift)) % b; }
    else { q = a / (b << BigInt(-shift)); r = a % (b << BigInt(-shift)); }
    if (r !== 0n) q |= 1n;
    var x = Number(q);
    var res = x * Math.pow(2, -shift);
    if (!isFinite(res)) {
      // décalage en deux fois pour éviter les débordements intermédiaires
      res = x * Math.pow(2, -Math.floor(shift / 2)) * Math.pow(2, -Math.ceil(shift / 2));
    }
    if (!isFinite(res)) throw pyErr(T_OverflowError, 'integer division result too large for a float');
    return neg ? -res : res;
  }
  function powInt(a, b) {
    if (b < 0n) {
      if (a === 0n) throw pyErr(T_ZeroDivisionError, '0.0 cannot be raised to a negative power');
      return floatPow(intToFloat(a), intToFloat(b));
    }
    if (a === 0n || a === 1n) return b === 0n ? 1n : a;
    if (a === -1n) return (b % 2n === 0n) ? 1n : -1n;
    var bits = bitLength(a) * Number(b);
    if (bits > 40000000) throw pyErr(T_MemoryError);
    return a ** b;
  }
  function modPow(base, exp, mod) {
    if (mod === 0n) throw valueErr('pow() 3rd argument cannot be 0');
    var neg = mod < 0n;
    var m = neg ? -mod : mod;
    if (exp < 0n) {
      base = modInverse(base, m);
      exp = -exp;
    }
    var r = 1n % m, b = ((base % m) + m) % m;
    while (exp > 0n) {
      if (exp & 1n) r = (r * b) % m;
      b = (b * b) % m;
      exp >>= 1n;
    }
    if (neg && r !== 0n) r += mod;
    return r;
  }
  function modInverse(a, m) {
    var g = egcd(((a % m) + m) % m, m);
    if (g[0] !== 1n) throw valueErr('base is not invertible for the given modulus');
    return ((g[1] % m) + m) % m;
  }
  function egcd(a, b) {
    var x0 = 1n, x1 = 0n;
    while (b !== 0n) { var q = a / b; var t = a - q * b; a = b; b = t; t = x0 - q * x1; x0 = x1; x1 = t; }
    return [a, x0];
  }
  function gcdBig(a, b) { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function isqrtBig(n) {
    if (n < 0n) throw valueErr('isqrt() argument must be nonnegative');
    if (n < 2n) return n;
    if (n < 9007199254740992n) {
      var r = BigInt(Math.floor(Math.sqrt(Number(n))));
      while (r * r > n) r--;
      while ((r + 1n) * (r + 1n) <= n) r++;
      return r;
    }
    var x = 1n << BigInt(Math.ceil(bitLength(n) / 2));
    for (;;) { var y = (x + n / x) >> 1n; if (y >= x) return x; x = y; }
  }

  // ---- Flottants ----
  function floatFloorDiv(a, b) {
    if (b === 0) throw pyErr(T_ZeroDivisionError, 'float floor division by zero');
    return floatDivmod(a, b)[0];
  }
  function floatMod(a, b) {
    if (b === 0) throw pyErr(T_ZeroDivisionError, 'float modulo by zero');
    var mod = a % b;
    if (mod) { if ((b < 0) !== (mod < 0)) mod += b; }
    else mod = (b < 0) ? -0 : 0;
    return mod;
  }
  function floatDivmod(vx, wx) {
    var mod = vx % wx, div = (vx - mod) / wx, floordiv;
    if (mod) {
      if ((wx < 0) !== (mod < 0)) { mod += wx; div -= 1.0; }
    } else mod = (wx < 0) ? -0 : 0;
    if (div) {
      floordiv = Math.floor(div);
      if (div - floordiv > 0.5) floordiv += 1.0;
    } else {
      floordiv = (vx / wx < 0 || Object.is(vx / wx, -0)) ? -0 : 0;
    }
    return [floordiv, mod];
  }
  function floatPow(iv, iw) {
    // cas particuliers de float_pow (CPython)
    if (iw === 0) return 1.0;
    if (iv !== iv) return iw === 0 ? 1.0 : iv;
    if (iw !== iw) return iv === 1.0 ? 1.0 : iw;
    if (!isFinite(iw)) {
      var av = Math.abs(iv);
      if (av === 1.0) return 1.0;
      if ((iw > 0) === (av > 1.0)) return Math.abs(iw);
      return 0.0;
    }
    if (!isFinite(iv)) {
      var oddInt = Number.isInteger(iw) && Math.abs(iw % 2) === 1;
      if (iw > 0) return oddInt ? iv : Math.abs(iv);
      return oddInt ? (iv < 0 ? -0 : 0) : 0.0;
    }
    if (iv === 0.0) {
      if (iw < 0) throw pyErr(T_ZeroDivisionError, '0.0 cannot be raised to a negative power');
      var odd = Number.isInteger(iw) && Math.abs(iw % 2) === 1;
      return odd ? iv : 0.0;
    }
    if (iv < 0 && !Number.isInteger(iw)) {
      throw pyErr(T_NotImplementedError, 'complex numbers are not supported in CodeQuest');
    }
    if (iv === 1.0) return 1.0;
    var r = Math.pow(iv, iw);
    if (!isFinite(r)) throw newExc(T_OverflowError, [34n, 'Numerical result out of range']);
    return r;
  }
  // Décomposition exacte d'un double : |x| = m * 2^e
  var f64buf = new DataView(new ArrayBuffer(8));
  function floatParts(x) {
    f64buf.setFloat64(0, x);
    var hi = f64buf.getUint32(0), lo = f64buf.getUint32(4);
    var ex = (hi >>> 20) & 0x7ff;
    var mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
    if (ex === 0) ex = 1; else mant |= 1n << 52n;
    return { m: mant, e: ex - 1075 };
  }
  // round(|x| * 10^p) avec arrondi au pair le plus proche, sur la valeur exacte
  function scaledRound(ax, p) {
    var fp = floatParts(ax);
    var num = fp.m, den = 1n;
    if (fp.e >= 0) num <<= BigInt(fp.e); else den <<= BigInt(-fp.e);
    if (p >= 0) num *= 10n ** BigInt(p); else den *= 10n ** BigInt(-p);
    var q = num / den, r = num % den, twice = r * 2n;
    if (twice > den || (twice === den && (q & 1n) === 1n)) q += 1n;
    return q;
  }
  function digitsFixed(ax, prec) { // chaîne « ddd.ddd » (sans signe) avec prec décimales
    var s = scaledRound(ax, prec).toString();
    if (prec === 0) return s;
    while (s.length <= prec) s = '0' + s;
    return s.slice(0, s.length - prec) + '.' + s.slice(s.length - prec);
  }
  // mantisse de (prec+1) chiffres et exposant décimal, arrondis exactement
  function digitsExp(ax, prec) {
    if (ax === 0) return { d: '0'.repeat(prec + 1), e: 0 };
    var e = Math.floor(Math.log10(ax));
    var q = scaledRound(ax, prec - e);
    var lim = 10n ** BigInt(prec + 1);
    if (q >= lim) { e++; q = scaledRound(ax, prec - e); }
    else if (q < lim / 10n) { e--; q = scaledRound(ax, prec - e); if (q >= lim) { e++; q = scaledRound(ax, prec - e); } }
    return { d: q.toString(), e: e };
  }
  function expSuffix(e) { var a = Math.abs(e); return (e < 0 ? '-' : '+') + (a < 10 ? '0' + a : '' + a); }
  function floatRepr(x) {
    if (x !== x) return 'nan';
    if (x === Infinity) return 'inf';
    if (x === -Infinity) return '-inf';
    if (x === 0) return (1 / x < 0) ? '-0.0' : '0.0';
    var s = x.toExponential();
    var m = /^(-?)(\d)(?:\.(\d+))?e([+-]\d+)$/.exec(s);
    var sign = m[1], digits = m[2] + (m[3] || ''), exp = parseInt(m[4], 10);
    if (exp >= -4 && exp < 16) {
      if (exp >= digits.length - 1) return sign + digits + '0'.repeat(exp - digits.length + 1) + '.0';
      if (exp >= 0) return sign + digits.slice(0, exp + 1) + '.' + digits.slice(exp + 1);
      return sign + '0.' + '0'.repeat(-exp - 1) + digits;
    }
    return sign + digits[0] + (digits.length > 1 ? '.' + digits.slice(1) : '') + 'e' + expSuffix(exp);
  }
  // Équivalent de PyOS_double_to_string : type in e E f F g G r ; flags : alt, addDot0, noNeg0
  function dtoa(x, type, prec, alt, addDot0, noNeg0) {
    var upper = type === 'E' || type === 'F' || type === 'G';
    var neg = x < 0 || (x === 0 && 1 / x < 0);
    if (x !== x) return upper ? 'NAN' : 'nan';
    if (!isFinite(x)) return (neg ? '-' : '') + (upper ? 'INF' : 'inf');
    var ax = Math.abs(x), body;
    var t = type.toLowerCase();
    if (t === 'r') {
      body = floatRepr(ax);
    } else if (t === 'f') {
      body = digitsFixed(ax, prec);
      if (alt && prec === 0) body += '.';
    } else if (t === 'e') {
      var de = digitsExp(ax, prec);
      body = de.d[0] + (prec > 0 ? '.' + de.d.slice(1) : (alt ? '.' : '')) + (upper ? 'E' : 'e') + expSuffix(de.e);
    } else { // g
      var p = prec === 0 ? 1 : prec;
      var dg = digitsExp(ax, p - 1);
      var X = ax === 0 ? 0 : dg.e;
      if (X >= -4 && X < p) {
        body = digitsFixed(ax, p - 1 - X);
        if (!alt && body.indexOf('.') >= 0) body = body.replace(/0+$/, '').replace(/\.$/, '');
        if (alt && body.indexOf('.') < 0) body += '.';
        if (addDot0 && body.indexOf('.') < 0) body += '.0';
      } else {
        var mant = dg.d[0] + (p > 1 ? '.' + dg.d.slice(1) : '');
        if (!alt && mant.indexOf('.') >= 0) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
        if (alt && mant.indexOf('.') < 0) mant += '.';
        body = mant + (upper ? 'E' : 'e') + expSuffix(dg.e);
      }
    }
    if (neg && noNeg0 && /^[0.]*$/.test(body.replace(/e.*$/i, ''))) neg = false;
    return (neg ? '-' : '') + body;
  }
  function roundFloat(x, nd) { // round(x, nd) pour un flottant
    if (!isFinite(x) || x === 0) return x;
    if (nd > 330) return x;
    if (nd < -330) return 0.0 * x;
    var ax = Math.abs(x);
    var q = scaledRound(ax, nd);
    var s;
    if (nd >= 0) {
      s = q.toString();
      if (nd > 0) { while (s.length <= nd) s = '0' + s; s = s.slice(0, s.length - nd) + '.' + s.slice(s.length - nd); }
    } else {
      s = q.toString() + '0'.repeat(-nd);
    }
    var r = Number(s);
    if (!isFinite(r)) throw pyErr(T_OverflowError, 'rounded value too large to represent');
    return x < 0 ? -r : r;
  }
  function roundIntNd(n, nd) { // round(entier, nd négatif) : arrondi au pair
    if (nd >= 0) return n;
    var p = 10n ** BigInt(-nd);
    var q = floorDivInt(n, p), r = n - q * p;
    var twice = 2n * r;
    if (twice > p || (twice === p && (q & 1n) === 1n)) q += 1n;
    return q * p;
  }
  function floatToInt(x) {
    if (x !== x) throw valueErr('cannot convert float NaN to integer');
    if (!isFinite(x)) throw pyErr(T_OverflowError, 'cannot convert float infinity to integer');
    return BigInt(Math.trunc(x));
  }
  function roundHalfEvenToInt(x) {
    if (x !== x) throw valueErr('cannot convert float NaN to integer');
    if (!isFinite(x)) throw pyErr(T_OverflowError, 'cannot convert float infinity to integer');
    var f = Math.floor(x), d = x - f;
    if (d > 0.5 || (d === 0.5 && f % 2 !== 0)) f += 1;
    return BigInt(f);
  }

  // ---- Conversion str -> nombre ----
  function parseIntStr(s0, base) {
    var s = s0.replace(/^[\s  -​　]+|[\s  -​　]+$/g, '');
    var bad = function () {
      return valueErr('invalid literal for int() with base ' + base + ': ' + pyRepr(s0));
    };
    var neg = false, i = 0;
    if (s[0] === '+' || s[0] === '-') { neg = s[0] === '-'; s = s.slice(1); }
    s = s.replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x660); })
      .replace(/[０-９]/g, function (c) { return String(c.charCodeAt(0) - 0xff10); });
    var b = base;
    var low = s.toLowerCase();
    if (b === 0) {
      if (/^0[xob]/.test(low)) { b = low[1] === 'x' ? 16 : low[1] === 'o' ? 8 : 2; s = s.slice(2); if (s[0] === '_') s = s.slice(1); }
      else { b = 10; if (/^0+[_0]*[1-9]/.test(s)) throw bad(); }
    } else if ((b === 16 && /^0x/.test(low)) || (b === 8 && /^0o/.test(low)) || (b === 2 && /^0b/.test(low))) {
      s = s.slice(2); if (s[0] === '_') s = s.slice(1);
    }
    if (!s.length || s[0] === '_' || s[s.length - 1] === '_' || s.indexOf('__') >= 0) throw bad();
    s = s.replace(/_/g, '');
    var digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, b);
    var lower = s.toLowerCase();
    for (i = 0; i < lower.length; i++) if (digits.indexOf(lower[i]) < 0) throw bad();
    if (b === 10 && s.length > 4300) {
      throw valueErr('Exceeds the limit (4300 digits) for integer string conversion: value has ' + s.length + ' digits; use sys.set_int_max_str_digits() to increase the limit');
    }
    var v;
    if (b === 10) v = BigInt(s);
    else if (b === 16) v = BigInt('0x' + s);
    else if (b === 8) v = BigInt('0o' + s);
    else if (b === 2) v = BigInt('0b' + s);
    else { v = 0n; var bb = BigInt(b); for (i = 0; i < lower.length; i++) v = v * bb + BigInt(digits.indexOf(lower[i])); }
    return neg ? -v : v;
  }
  function parseFloatStr(s0) {
    var s = s0.trim();
    var m = /^[+-]?((\d(_?\d)*)?\.?(\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?)$/.exec(s);
    var low = s.toLowerCase();
    if (/^[+-]?(inf|infinity)$/.test(low)) return low[0] === '-' ? -Infinity : Infinity;
    if (/^[+-]?nan$/.test(low)) return NaN;
    if (!m || !/\d/.test(m[1].replace(/[eE].*$/, '')) || /^[+-]?\.?[eE]/.test(s)) {
      throw valueErr('could not convert string to float: ' + pyRepr(s0));
    }
    return Number(s.replace(/_/g, ''));
  }

  // ---- Chaînes (indices en points de code, comme Python) ----
  var RE_ASTRAL = /[\uD800-\uDFFF]/;
  var lastAstralStr = '', lastAstral = false;
  function isAstral(s) {
    if (s.length < 2) return false;
    if (s === lastAstralStr) return lastAstral;
    lastAstralStr = s; lastAstral = RE_ASTRAL.test(s);
    return lastAstral;
  }
  function strLen(s) {
    if (!isAstral(s)) return s.length;
    var n = 0;
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c < 0xDC00 || c > 0xDFFF || i === 0 || s.charCodeAt(i - 1) < 0xD800 || s.charCodeAt(i - 1) > 0xDBFF) n++; }
    return n;
  }
  function strChars(s) { return isAstral(s) ? Array.from(s) : s.split(''); }
  function cmpStr(a, b) { // ordre des points de code
    if (a === b) return 0;
    if (!isAstral(a) && !isAstral(b)) return a < b ? -1 : 1;
    var ca = Array.from(a), cb = Array.from(b), n = Math.min(ca.length, cb.length);
    for (var i = 0; i < n; i++) {
      if (ca[i] !== cb[i]) return ca[i].codePointAt(0) < cb[i].codePointAt(0) ? -1 : 1;
    }
    return ca.length - cb.length < 0 ? -1 : (ca.length === cb.length ? 0 : 1);
  }
  var RE_NONPRINT = /[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}\p{Zl}\p{Zp}\p{Zs}]/u;
  function isPrintableChar(ch) { return ch === ' ' || !RE_NONPRINT.test(ch); }
  function hexPad(c, n) { var h = c.toString(16); while (h.length < n) h = '0' + h; return h; }
  function strRepr(s) {
    var q = "'";
    if (s.indexOf("'") >= 0 && s.indexOf('"') < 0) q = '"';
    if (/^[\x20-\x7e]*$/.test(s) && s.indexOf('\\') < 0 && s.indexOf(q) < 0) return q + s + q;
    var r = q;
    for (var ch of s) {
      var c = ch.codePointAt(0);
      if (ch === q || ch === '\\') r += '\\' + ch;
      else if (ch === '\n') r += '\\n';
      else if (ch === '\r') r += '\\r';
      else if (ch === '\t') r += '\\t';
      else if (c < 0x20 || c === 0x7f) r += '\\x' + hexPad(c, 2);
      else if (c < 0x7f) r += ch;
      else if (isPrintableChar(ch)) r += ch;
      else if (c <= 0xff) r += '\\x' + hexPad(c, 2);
      else if (c <= 0xffff) r += '\\u' + hexPad(c, 4);
      else r += '\\U' + hexPad(c, 8);
    }
    return r + q;
  }
  function asciiRepr(s) { // ascii()
    var r = pyRepr(s), o = '';
    for (var ch of r) {
      var c = ch.codePointAt(0);
      if (c < 0x80) o += ch;
      else if (c <= 0xff) o += '\\x' + hexPad(c, 2);
      else if (c <= 0xffff) o += '\\u' + hexPad(c, 4);
      else o += '\\U' + hexPad(c, 8);
    }
    return o;
  }

  // ---- repr / str ----
  var reprActive = new Set();     // protection contre les structures récursives
  function pyRepr(v) {
    switch (typeof v) {
      case 'string': return strRepr(v);
      case 'bigint': return intToStr(v);
      case 'number': return floatRepr(v);
      case 'boolean': return v ? 'True' : 'False';
      case 'object': return v.$repr();
    }
    return '<?>';
  }
  function pyStr(v) {
    switch (typeof v) {
      case 'string': return v;
      case 'bigint': return intToStr(v);
      case 'number': return floatRepr(v);
      case 'boolean': return v ? 'True' : 'False';
      case 'object': return v.$str();
    }
    return '<?>';
  }
  function reprSeq(o, open, close, items, single) {
    if (reprActive.has(o)) return open + '...' + close;
    reprActive.add(o);
    try {
      var parts = new Array(items.length);
      for (var i = 0; i < items.length; i++) parts[i] = pyRepr(items[i]);
      return open + parts.join(', ') + (single && items.length === 1 ? ',' : '') + close;
    } finally { reprActive.delete(o); }
  }
  function reprDictBody(o) {
    if (reprActive.has(o)) return '{...}';
    reprActive.add(o);
    try {
      var parts = [];
      o.m.forEach(function (e) { parts.push(pyRepr(e[0]) + ': ' + pyRepr(e[1])); });
      return '{' + parts.join(', ') + '}';
    } finally { reprActive.delete(o); }
  }

  // ---- Vérité ----
  function truthy(v) {
    switch (typeof v) {
      case 'boolean': return v;
      case 'bigint': return v !== 0n;
      case 'number': return v !== 0;
      case 'string': return v.length > 0;
      case 'object': return v.$bool();
    }
    return true;
  }

  // ---- Longueur ----
  function pyLen(v) {
    if (typeof v === 'string') return strLen(v);
    if (typeof v === 'object') { var n = v.$len(); if (n !== undefined) return n; }
    throw typeErr("object of type '" + tname(v) + "' has no len()");
  }

  // ---- Index entiers ----
  function asIndex(v, what) { // __index__ : int, bool
    if (typeof v === 'bigint') return v;
    if (typeof v === 'boolean') return v ? 1n : 0n;
    if (v instanceof PyInst) {
      var f = lookup(v.cls, '__index__');
      if (f) { var r = callAny(f, [v]); if (typeof r === 'bigint') return r; throw typeErr('__index__ returned non-int (type ' + tname(r) + ')'); }
    }
    throw typeErr(what ? what : "'" + tname(v) + "' object cannot be interpreted as an integer");
  }
  function toInt(v, what) { var b = asIndex(v, what); return Number(b); } // petit entier JS
  function isIntLike(v) { return typeof v === 'bigint' || typeof v === 'boolean'; }
  function numKind(v) {
    var t = typeof v;
    if (t === 'bigint' || t === 'boolean') return 1;
    if (t === 'number') return 2;
    return 0;
  }
  function toBig(v) { return typeof v === 'bigint' ? v : (v ? 1n : 0n); }
  function toFloat(v) { return typeof v === 'number' ? v : (typeof v === 'bigint' ? intToFloat(v) : (v ? 1 : 0)); }

  // ---- Égalité et comparaisons ----
  var SWAP = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '==': '==', '!=': '!=' };
  var CMP_DUNDER = { '<': '__lt__', '>': '__gt__', '<=': '__le__', '>=': '__ge__', '==': '__eq__', '!=': '__ne__' };
  function cmpPrim(op, c) {
    switch (op) {
      case '<': return c < 0; case '<=': return c <= 0; case '>': return c > 0; case '>=': return c >= 0;
      case '==': return c === 0; case '!=': return c !== 0;
    }
  }
  // Comparaison native entre valeurs de types natifs ; NotImplemented si non pris en charge
  function nativeCmp(a, b, op) {
    var ka = numKind(a), kb = numKind(b);
    if (ka && kb) {
      switch (op) {
        case '<': return a < b; case '<=': return a <= b; case '>': return a > b; case '>=': return a >= b;
        // eslint-disable-next-line eqeqeq
        case '==': return a == b; case '!=': return a != b;
      }
    }
    if (typeof a === 'string') {
      if (typeof b !== 'string') return NotImplemented;
      return cmpPrim(op, cmpStr(a, b));
    }
    if (typeof a === 'object' && a.$cmp) return a.$cmp(b, op);
    if (op === '==') return a === b ? true : NotImplemented;
    if (op === '!=') return a === b ? false : NotImplemented;
    return NotImplemented;
  }
  function isUserObj(v) { return v instanceof PyInst; }
  function richCmp(a, b, op) {
    if (!(a instanceof PyInst) && !(b instanceof PyInst)) {
      var r0 = nativeCmp(a, b, op);
      if (r0 !== NotImplemented) return r0;
      var r1 = nativeCmp(b, a, SWAP[op]);
      if (r1 !== NotImplemented) return r1;
    } else {
      var ta = typeOf(a), tb = typeOf(b), sw = SWAP[op], r, checked = false;
      if (ta !== tb && isSubtype(tb, ta) && b instanceof PyInst) {
        var fb = lookup(tb, CMP_DUNDER[sw]);
        if (fb !== undefined && fb !== lookup(ta, CMP_DUNDER[sw])) {
          checked = true;
          r = cmpCall(b, a, sw);
          if (r !== NotImplemented) return r;
        }
      }
      r = cmpCall(a, b, op);
      if (r !== NotImplemented) return r;
      if (!checked) { r = cmpCall(b, a, sw); if (r !== NotImplemented) return r; }
    }
    if (op === '==') return a === b;
    if (op === '!=') return a !== b;
    throw typeErr("'" + op + "' not supported between instances of '" + tname(a) + "' and '" + tname(b) + "'");
  }
  function cmpCall(x, y, op) {
    if (!(x instanceof PyInst)) return nativeCmp(x, y, op);
    var f = lookup(x.cls, CMP_DUNDER[op]);
    if (f === undefined || f instanceof PyMethodDescr) {
      // comportement par défaut d'object
      if (op === '==') return x === y ? true : NotImplemented;
      if (op === '!=') {
        var eq = lookup(x.cls, '__eq__');
        if (eq !== undefined && !(eq instanceof PyMethodDescr)) {
          var r = callAny(eq, [x, y]);
          if (r === NotImplemented) return r;
          return !truthy(r);
        }
        return x === y ? false : NotImplemented;
      }
      return NotImplemented;
    }
    if (f === None) return NotImplemented;
    return callAny(f, [x, y]);
  }
  function pyEq(a, b) { // opérateur ==
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    if (typeof a === 'bigint' && typeof b === 'bigint') return a === b;
    return richCmp(a, b, '==');
  }
  function eqBool(a, b) { // PyObject_RichCompareBool(a, b, Py_EQ) : identité d'abord
    if (a === b) return true;
    var ta = typeof a;
    if (ta === 'string' || ta === 'bigint') { if (typeof b === ta) return false; }
    var r = richCmp(a, b, '==');
    return r === true ? true : r === false ? false : truthy(r);
  }
  function ltBool(a, b) {
    var ta = typeof a;
    if (ta === typeof b) {
      if (ta === 'bigint' || ta === 'number') return a < b;
      if (ta === 'string') return cmpStr(a, b) < 0;
    }
    var r = richCmp(a, b, '<');
    return r === true ? true : r === false ? false : truthy(r);
  }
  // comparaison lexicographique de deux séquences (listes, tuples)
  function seqCmp(x, y, op) {
    var n = Math.min(x.length, y.length), i;
    for (i = 0; i < n; i++) if (!eqBool(x[i], y[i])) break;
    if (i >= x.length || i >= y.length) return cmpPrim(op, x.length - y.length);
    if (op === '==') return false;
    if (op === '!=') return true;
    return richCmp(x[i], y[i], op);
  }

  // ---- format() : mini-langage de spécification de format (port de formatter_unicode.c) ----
  function unknownCode(type, typeName) {
    var c = type.codePointAt(0);
    if (c > 32 && c < 128) return valueErr("Unknown format code '" + type + "' for object of type '" + typeName + "'");
    return valueErr("Unknown format code '\\x" + c.toString(16) + "' for object of type '" + typeName + "'");
  }
  function parseSpec(spec, defType, defAlign, obj) {
    var cs = Array.from(spec), n = cs.length, pos = 0;
    var f = { fill: ' ', align: defAlign, alt: false, noNeg0: false, sign: '', width: -1, sep: '', prec: -1, type: defType, glen: 3 };
    var alignSpec = false, fillSpec = false;
    var isAlign = function (c) { return c === '<' || c === '>' || c === '=' || c === '^'; };
    if (n - pos >= 2 && isAlign(cs[pos + 1])) { f.align = cs[pos + 1]; f.fill = cs[pos]; fillSpec = alignSpec = true; pos += 2; }
    else if (n - pos >= 1 && isAlign(cs[pos])) { f.align = cs[pos]; alignSpec = true; pos++; }
    if (pos < n && (cs[pos] === '+' || cs[pos] === '-' || cs[pos] === ' ')) { f.sign = cs[pos]; pos++; }
    if (pos < n && cs[pos] === 'z') { f.noNeg0 = true; pos++; }
    if (pos < n && cs[pos] === '#') { f.alt = true; pos++; }
    if (!fillSpec && pos < n && cs[pos] === '0') { f.fill = '0'; if (!alignSpec && defAlign === '>') f.align = '='; pos++; }
    var st = pos;
    while (pos < n && isDigit(cs[pos])) pos++;
    if (pos > st) f.width = parseInt(cs.slice(st, pos).join(''), 10);
    if (pos < n && cs[pos] === ',') { f.sep = ','; pos++; }
    if (pos < n && cs[pos] === '_') {
      if (f.sep) throw valueErr("Cannot specify both ',' and '_'.");
      f.sep = '_'; pos++;
    }
    if (pos < n && cs[pos] === ',' && f.sep === '_') throw valueErr("Cannot specify both ',' and '_'.");
    if (pos < n && cs[pos] === '.') {
      pos++; st = pos;
      while (pos < n && isDigit(cs[pos])) pos++;
      if (pos === st) throw valueErr('Format specifier missing precision');
      f.prec = parseInt(cs.slice(st, pos).join(''), 10);
    }
    if (n - pos > 1) throw valueErr("Invalid format specifier '" + spec + "' for object of type '" + tname(obj) + "'");
    if (n - pos === 1) f.type = cs[pos];
    if (f.sep) {
      switch (f.type) {
        case 'd': case 'e': case 'f': case 'g': case 'E': case 'G': case '%': case 'F': case '': break;
        case 'b': case 'o': case 'x': case 'X':
          if (f.sep === '_') { f.glen = 4; break; }
          throw valueErr("Cannot specify '" + f.sep + "' with '" + f.type + "'.");
        default: {
          var c = f.type.codePointAt(0);
          if (c > 32 && c < 128) throw valueErr("Cannot specify '" + f.sep + "' with '" + f.type + "'.");
          throw valueErr("Cannot specify '" + f.sep + "' with '\\x" + c.toString(16) + "'.");
        }
      }
    }
    return f;
  }
  function groupDigits(digits, sep, glen, minWidth) {
    var remaining = digits.length, pos = digits.length, parts = [], useSep = false, broken = false, l, nz, nc;
    if (sep) {
      for (;;) {
        l = Math.min(glen, Math.max(remaining, minWidth, 1));
        nz = Math.max(0, l - remaining); nc = Math.max(0, Math.min(remaining, l));
        parts.push('0'.repeat(nz) + digits.slice(pos - nc, pos) + (useSep ? sep : ''));
        pos -= nc; useSep = true; remaining -= nc; minWidth -= l;
        if (remaining <= 0 && minWidth <= 0) { broken = true; break; }
        minWidth -= sep.length;
      }
    }
    if (!broken) {
      l = Math.max(remaining, minWidth, 1);
      nz = Math.max(0, l - remaining); nc = Math.max(0, Math.min(remaining, l));
      parts.push('0'.repeat(nz) + digits.slice(pos - nc, pos) + (useSep ? sep : ''));
    }
    return parts.reverse().join('');
  }
  function fillNumber(f, signChar, prefix, digits, dec, rem) {
    var sign = '';
    if (f.sign === '+') sign = signChar === '-' ? '-' : '+';
    else if (f.sign === ' ') sign = signChar === '-' ? '-' : ' ';
    else if (signChar === '-') sign = '-';
    var nonDigit = sign.length + prefix.length + dec.length + strLen(rem);
    var minWidth = (f.fill === '0' && f.align === '=') ? f.width - nonDigit : 0;
    var grouped = digits.length === 0 ? '' : groupDigits(digits, f.sep, f.glen, minWidth);
    var pad = f.width - (nonDigit + grouped.length);
    if (pad > 0) {
      var fc = f.fill;
      switch (f.align) {
        case '<': return sign + prefix + grouped + dec + rem + fc.repeat(pad);
        case '^': { var l = Math.floor(pad / 2); return fc.repeat(l) + sign + prefix + grouped + dec + rem + fc.repeat(pad - l); }
        case '=': return sign + prefix + fc.repeat(pad) + grouped + dec + rem;
        default: return fc.repeat(pad) + sign + prefix + grouped + dec + rem;
      }
    }
    return sign + prefix + grouped + dec + rem;
  }
  function formatIntSpec(n, f, orig) {
    if (f.prec !== -1) throw valueErr('Precision not allowed in integer format specifier');
    if (f.noNeg0) throw valueErr('Negative zero coercion (z) not allowed in integer format specifier');
    var digits = '', prefix = '', signChar = '', rem = '';
    if (f.type === 'c') {
      if (f.sign) throw valueErr("Sign not allowed with integer format specifier 'c'");
      if (f.alt) throw valueErr("Alternate form (#) not allowed with integer format specifier 'c'");
      if (n < 0n || n > 0x10ffffn) throw pyErr(T_OverflowError, '%c arg not in range(0x110000)');
      rem = String.fromCodePoint(Number(n));
    } else {
      var base = f.type === 'b' ? 2 : f.type === 'o' ? 8 : (f.type === 'x' || f.type === 'X') ? 16 : 10;
      if (n < 0n) { signChar = '-'; n = -n; }
      digits = base === 10 ? intToStr(n) : n.toString(base);
      if (f.alt && base !== 10) prefix = base === 2 ? '0b' : base === 8 ? '0o' : '0x';
      if (f.type === 'X') { digits = digits.toUpperCase(); prefix = prefix.toUpperCase(); }
    }
    return fillNumber(f, signChar, prefix, digits, '', rem);
  }
  function formatFloatSpec(x, f) {
    var type = f.type, prec = f.prec, defPrec = 6, addDot0 = false, pct = false;
    if (type === '') { addDot0 = true; type = 'r'; defPrec = 0; }
    if (type === 'n') type = 'g';
    if (type === '%') { type = 'f'; x = x * 100; pct = true; }
    if (prec < 0) prec = defPrec; else if (type === 'r') type = 'g';
    var s = dtoa(x, type, prec, f.alt, addDot0, f.noNeg0);
    if (pct) s += '%';
    var signChar = '';
    if (s[0] === '-') { signChar = '-'; s = s.slice(1); }
    var m = /^\d*/.exec(s)[0], rest = s.slice(m.length), dec = '', rem = rest;
    if (rest[0] === '.') { dec = '.'; rem = rest.slice(1); }
    return fillNumber(f, signChar, '', m, dec, rem);
  }
  function formatStrSpec(s, spec, obj) {
    var f = parseSpec(spec, 's', '<', obj);
    if (f.type !== 's') throw unknownCode(f.type, tname(obj));
    if (f.sign) throw valueErr(f.sign === ' ' ? 'Space not allowed in string format specifier' : 'Sign not allowed in string format specifier');
    if (f.noNeg0) throw valueErr('Negative zero coercion (z) not allowed in string format specifier');
    if (f.alt) throw valueErr('Alternate form (#) not allowed in string format specifier');
    if (f.align === '=') throw valueErr("'=' alignment not allowed in string format specifier");
    var len = strLen(s);
    if (f.prec >= 0 && len > f.prec) { s = isAstral(s) ? Array.from(s).slice(0, f.prec).join('') : s.slice(0, f.prec); len = f.prec; }
    var pad = f.width - len;
    if (pad <= 0) return s;
    if (f.align === '>') return f.fill.repeat(pad) + s;
    if (f.align === '^') { var l = Math.floor(pad / 2); return f.fill.repeat(l) + s + f.fill.repeat(pad - l); }
    return s + f.fill.repeat(pad);
  }
  function pyFormat(v, spec) {
    switch (typeof v) {
      case 'string': return spec === '' ? v : formatStrSpec(v, spec, v);
      case 'bigint': case 'boolean': {
        if (spec === '') return pyStr(v);
        var n = toBig(v);
        var f = parseSpec(spec, 'd', '>', v);
        switch (f.type) {
          case 'b': case 'c': case 'd': case 'o': case 'x': case 'X': case 'n': return formatIntSpec(n, f, v);
          case 'e': case 'E': case 'f': case 'F': case 'g': case 'G': case '%': return formatFloatSpec(intToFloat(n), f);
          default: throw unknownCode(f.type, tname(v));
        }
      }
      case 'number': {
        if (spec === '') return floatRepr(v);
        var ff = parseSpec(spec, '', '>', v);
        switch (ff.type) {
          case '': case 'e': case 'E': case 'f': case 'F': case 'g': case 'G': case 'n': case '%': return formatFloatSpec(v, ff);
          default: throw unknownCode(ff.type, 'float');
        }
      }
    }
    if (v instanceof PyInst) {
      var fm = lookup(v.cls, '__format__');
      if (fm !== undefined && !(fm instanceof PyMethodDescr)) {
        var r = callAny(fm, [v, spec]);
        if (typeof r !== 'string') throw typeErr('__format__ must return a str, not ' + tname(r));
        return r;
      }
    }
    if (v && v.$format) return v.$format(spec);
    if (spec !== '') throw typeErr('unsupported format string passed to ' + tname(v) + '.__format__');
    return pyStr(v);
  }

  // ---- Formatage avec % ----
  function percentFormat(fmt, args) {
    var argList, dict = null;
    if (args instanceof PyTuple) argList = args.a;
    else {
      argList = [args];
      if (typeof args === 'object' && !(args instanceof PyTuple) && (args instanceof PyDict || (args instanceof PyInst && lookup(args.cls, '__getitem__')))) dict = args;
    }
    var ai = 0, out = '', i = 0, n = fmt.length;
    function nextArg() {
      if (ai >= argList.length) throw typeErr('not enough arguments for format string');
      return argList[ai++];
    }
    while (i < n) {
      var c = fmt[i];
      if (c !== '%') {
        var j = fmt.indexOf('%', i);
        if (j < 0) j = n;
        out += fmt.slice(i, j); i = j; continue;
      }
      var start = i;
      i++;
      if (i >= n) throw valueErr('incomplete format');
      var arg, usedKey = false;
      if (fmt[i] === '(') {
        if (!dict) throw typeErr('format requires a mapping');
        var depthK = 1, ks = i + 1;
        i++;
        while (i < n && depthK > 0) { if (fmt[i] === '(') depthK++; else if (fmt[i] === ')') depthK--; i++; }
        if (depthK > 0) throw valueErr('incomplete format key');
        var key = fmt.slice(ks, i - 1);
        arg = getItem(dict, key);
        usedKey = true;
      }
      var flags = { minus: false, plus: false, space: false, alt: false, zero: false };
      while (i < n) {
        var fc = fmt[i];
        if (fc === '-') flags.minus = true; else if (fc === '+') flags.plus = true; else if (fc === ' ') flags.space = true;
        else if (fc === '#') flags.alt = true; else if (fc === '0') flags.zero = true; else break;
        i++;
      }
      var width = -1, prec = -1;
      if (fmt[i] === '*') {
        var wv = nextArg();
        if (!isIntLike(wv)) throw typeErr('* wants int');
        width = Number(toBig(wv));
        if (width < 0) { flags.minus = true; width = -width; }
        i++;
      } else {
        var ws = i; while (i < n && isDigit(fmt[i])) i++;
        if (i > ws) width = parseInt(fmt.slice(ws, i), 10);
      }
      if (fmt[i] === '.') {
        i++;
        if (fmt[i] === '*') {
          var pv = nextArg();
          if (!isIntLike(pv)) throw typeErr('* wants int');
          prec = Math.max(0, Number(toBig(pv)));
          i++;
        } else {
          var ps = i; while (i < n && isDigit(fmt[i])) i++;
          prec = i > ps ? parseInt(fmt.slice(ps, i), 10) : 0;
        }
      }
      while (i < n && (fmt[i] === 'h' || fmt[i] === 'l' || fmt[i] === 'L')) i++;
      if (i >= n) throw valueErr('incomplete format');
      var conv = fmt[i];
      i++;
      if (conv === '%') { out += '%'; continue; }
      if (!usedKey) arg = nextArg();
      var s, isNum = false, sign = '';
      switch (conv) {
        case 's': s = pyStr(arg); if (prec >= 0) s = Array.from(s).slice(0, prec).join(''); break;
        case 'r': s = pyRepr(arg); if (prec >= 0) s = Array.from(s).slice(0, prec).join(''); break;
        case 'a': s = asciiRepr(arg); if (prec >= 0) s = s.slice(0, prec); break;
        case 'd': case 'i': case 'u': case 'x': case 'X': case 'o': {
          var iv;
          if (isIntLike(arg)) iv = toBig(arg);
          else if (typeof arg === 'number') {
            if (conv === 'x' || conv === 'X' || conv === 'o') throw typeErr('%' + conv + ' format: an integer is required, not float');
            iv = floatToInt(arg);
          } else if (arg instanceof PyInst && lookup(arg.cls, '__int__')) iv = toBig(callAny(lookup(arg.cls, '__int__'), [arg]));
          else if (conv === 'x' || conv === 'X' || conv === 'o') throw typeErr('%' + conv + ' format: an integer is required, not ' + tname(arg));
          else throw typeErr('%' + conv + ' format: a real number is required, not ' + tname(arg));
          isNum = true;
          if (iv < 0n) { sign = '-'; iv = -iv; } else if (flags.plus) sign = '+'; else if (flags.space) sign = ' ';
          var base = (conv === 'x' || conv === 'X') ? 16 : conv === 'o' ? 8 : 10;
          s = base === 10 ? intToStr(iv) : iv.toString(base);
          if (prec >= 0 && s.length < prec) s = '0'.repeat(prec - s.length) + s;
          if (flags.alt && base !== 10) s = (base === 16 ? '0x' : '0o') + s;
          if (conv === 'X') s = s.toUpperCase();
          break;
        }
        case 'e': case 'E': case 'f': case 'F': case 'g': case 'G': {
          var fv;
          if (typeof arg === 'number') fv = arg;
          else if (isIntLike(arg)) fv = intToFloat(toBig(arg));
          else if (arg instanceof PyInst && lookup(arg.cls, '__float__')) fv = callAny(lookup(arg.cls, '__float__'), [arg]);
          else throw typeErr('must be real number, not ' + tname(arg));
          isNum = true;
          s = dtoa(fv, conv, prec < 0 ? 6 : prec, flags.alt, false, false);
          if (s[0] === '-') { sign = '-'; s = s.slice(1); } else if (flags.plus) sign = '+'; else if (flags.space) sign = ' ';
          if (!isFinite(fv)) flags.zero = false;
          break;
        }
        case 'c': {
          if (typeof arg === 'string') {
            if (strLen(arg) !== 1) throw typeErr('%c requires an int or a unicode character, not a string of length ' + strLen(arg));
            s = arg;
          } else if (isIntLike(arg)) {
            var cv = toBig(arg);
            if (cv < 0n || cv > 0x10ffffn) throw pyErr(T_OverflowError, '%c arg not in range(0x110000)');
            s = String.fromCodePoint(Number(cv));
          } else throw typeErr('%c requires an int or a unicode character, not ' + tname(arg));
          break;
        }
        default: {
          var code = conv.codePointAt(0);
          throw valueErr("unsupported format character '" + conv + "' (0x" + code.toString(16) + ') at index ' + (i - 1));
        }
      }
      var body = sign + s;
      var len = strLen(body);
      if (width > len) {
        if (flags.minus) body = body + ' '.repeat(width - len);
        else if (flags.zero && isNum) {
          var pre = sign;
          var rest = s;
          if (flags.alt && /^0[xXo]/.test(rest)) { pre += rest.slice(0, 2); rest = rest.slice(2); }
          body = pre + '0'.repeat(width - len) + rest;
        } else body = ' '.repeat(width - len) + body;
      }
      out += body;
    }
    if (ai < argList.length && !dict) throw typeErr('not all arguments converted during string formatting');
    return out;
  }

  // ---- str.format ----
  function strFormat(fmt, args, kw, depthF) {
    depthF = depthF || 0;
    if (depthF > 1) throw valueErr('Max string recursion exceeded');
    var out = '', i = 0, n = fmt.length, auto = 0, mode = 0; // mode : 0 inconnu, 1 auto, 2 manuel
    while (i < n) {
      var c = fmt[i];
      if (c === '{') {
        if (fmt[i + 1] === '{') { out += '{'; i += 2; continue; }
        // champ
        var j = i + 1, depthB = 1;
        while (j < n && depthB > 0) {
          if (fmt[j] === '{') depthB++;
          else if (fmt[j] === '}') { depthB--; if (depthB === 0) break; }
          else if (fmt[j] === '[') { var k = fmt.indexOf(']', j); if (k < 0) break; j = k; }
          j++;
        }
        if (j >= n) throw valueErr(depthB > 0 && fmt.slice(i + 1).indexOf('}') < 0 ? "expected '}' before end of string" : "expected '}' before end of string");
        var field = fmt.slice(i + 1, j);
        i = j + 1;
        // séparation nom ! conversion : spec
        var nameEnd = 0, bracket = false;
        while (nameEnd < field.length) {
          var ch = field[nameEnd];
          if (ch === '[') bracket = true; else if (ch === ']') bracket = false;
          else if (!bracket && (ch === '!' || ch === ':')) break;
          nameEnd++;
        }
        var name = field.slice(0, nameEnd), conv = null, spec = '';
        var rest = field.slice(nameEnd);
        if (rest[0] === '!') {
          if (rest.length < 2) throw valueErr('end of string while looking for conversion specifier');
          conv = rest[1];
          if (rest.length > 2 && rest[2] !== ':') throw valueErr('expected \':\' after conversion specifier');
          rest = rest.slice(2);
        }
        if (rest[0] === ':') spec = rest.slice(1);
        // valeur
        var m = /^[^.[]*/.exec(name)[0], obj;
        if (m === '') {
          if (mode === 2) throw valueErr('cannot switch from manual field specification to automatic field numbering');
          mode = 1;
          if (auto >= args.length) throw pyErr(T_IndexError, 'Replacement index ' + auto + ' out of range for positional args tuple');
          obj = args[auto++];
        } else if (/^\d+$/.test(m)) {
          if (mode === 1) throw valueErr('cannot switch from automatic field numbering to manual field specification');
          mode = 2;
          var idx = parseInt(m, 10);
          if (idx >= args.length) throw pyErr(T_IndexError, 'Replacement index ' + idx + ' out of range for positional args tuple');
          obj = args[idx];
        } else {
          var vkw = kw ? (kw instanceof PyDict ? dictGet(kw, m) : kw.get(m)) : undefined;
          if (vkw === undefined) throw newExc(T_KeyError, [m]);
          obj = vkw;
        }
        var rest2 = name.slice(m.length), re = /^(?:\.([^.[]+)|\[([^\]]*)\])/, mm;
        while (rest2.length) {
          mm = re.exec(rest2);
          if (!mm) throw valueErr('Only \'.\' or \'[\' may follow \']\' in format field specifier');
          if (mm[1] !== undefined) obj = getAttr(obj, mm[1]);
          else obj = getItem(obj, /^\d+$/.test(mm[2]) ? BigInt(mm[2]) : mm[2]);
          rest2 = rest2.slice(mm[0].length);
        }
        if (conv === 'r') obj = pyRepr(obj);
        else if (conv === 's') obj = pyStr(obj);
        else if (conv === 'a') obj = asciiRepr(obj);
        else if (conv !== null) throw valueErr('Unknown conversion specifier ' + conv);
        if (spec.indexOf('{') >= 0) {
          var sub = strFormatCounting(spec, args, kw, depthF + 1, auto, mode);
          spec = sub.s; auto = sub.auto; mode = sub.mode;
        }
        out += pyFormat(obj, spec);
        continue;
      }
      if (c === '}') {
        if (fmt[i + 1] === '}') { out += '}'; i += 2; continue; }
        throw valueErr("Single '}' encountered in format string");
      }
      var nx = n;
      for (var q = i; q < n; q++) if (fmt[q] === '{' || fmt[q] === '}') { nx = q; break; }
      out += fmt.slice(i, nx); i = nx;
    }
    return out;
  }
  function strFormatCounting(spec, args, kw, depthF, auto, mode) {
    // spécification imbriquée : la numérotation automatique continue
    var pre = [];
    for (var i = 0; i < auto; i++) pre.push(null);
    var out = '', k = 0;
    var parts = spec.split(/(\{[^{}]*\})/);
    for (var j = 0; j < parts.length; j++) {
      var pt = parts[j];
      if (/^\{[^{}]*\}$/.test(pt)) {
        var inner = pt.slice(1, -1);
        if (inner === '' || /^[:!]/.test(inner)) {
          if (mode === 2) throw valueErr('cannot switch from manual field specification to automatic field numbering');
          mode = 1;
          if (auto >= args.length) throw pyErr(T_IndexError, 'Replacement index ' + auto + ' out of range for positional args tuple');
          out += pyFormat(args[auto++], '');
        } else {
          if (/^\d/.test(inner)) { if (mode === 1) throw valueErr('cannot switch from automatic field numbering to manual field specification'); mode = 2; }
          out += strFormat(pt, args, kw, depthF);
        }
      } else out += pt;
    }
    return { s: out, auto: auto, mode: mode };
  }

  // ---- Suggestions « Did you mean » (port de Python/suggestions.c, sur les octets UTF-8) ----
  function utf8Bytes(str) {
    var r = [];
    for (var ch of str) {
      var c = ch.codePointAt(0);
      if (c < 0x80) r.push(c);
      else if (c < 0x800) r.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) r.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else r.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return r;
  }
  function substCost(a, b) {
    if ((a & 31) !== (b & 31)) return 2;
    if (a === b) return 0;
    if (a >= 65 && a <= 90) a += 32;
    if (b >= 65 && b <= 90) b += 32;
    return a === b ? 1 : 2;
  }
  function levenshtein(a, b, maxCost) {
    var as = 0, ae = a.length, bs = 0, be = b.length;
    while (ae > as && be > bs && a[as] === b[bs]) { as++; bs++; }
    while (ae > as && be > bs && a[ae - 1] === b[be - 1]) { ae--; be--; }
    a = a.slice(as, ae); b = b.slice(bs, be);
    if (!a.length || !b.length) return (a.length + b.length) * 2;
    if (a.length > 40 || b.length > 40) return maxCost + 1;
    if (b.length < a.length) { var t = a; a = b; b = t; }
    if ((b.length - a.length) * 2 > maxCost) return maxCost + 1;
    var buf = [];
    for (var i = 0; i < a.length; i++) buf.push((i + 1) * 2);
    var result = 0;
    for (var bi = 0; bi < b.length; bi++) {
      var code = b[bi], distance = bi * 2, minimum = Infinity;
      result = distance;
      for (var ai = 0; ai < a.length; ai++) {
        var sub = distance + substCost(code, a[ai]);
        distance = buf[ai];
        var insdel = Math.min(result, distance) + 2;
        result = Math.min(insdel, sub);
        buf[ai] = result;
        if (result < minimum) minimum = result;
      }
      if (minimum > maxCost) return maxCost + 1;
    }
    return result;
  }
  function calcSuggestion(cands, wrong) {
    if (cands.length >= 750) return null;
    var wb = utf8Bytes(wrong), best = Infinity, sugg = null;
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (typeof c !== 'string' || c === wrong) continue;
      var cb = utf8Bytes(c);
      var maxD = Math.floor((wb.length + cb.length + 3) * 2 / 6);
      maxD = Math.min(maxD, best - 1);
      var d = levenshtein(wb, cb, maxD);
      if (d > maxD) continue;
      if (sugg === null || d < best) { sugg = c; best = d; }
    }
    return sugg;
  }

  // ---- Opérateurs binaires ----
  function mkOp(sym, name, rname, iname, intFn, fltFn, other) {
    return { sym: sym, name: name, rname: rname, iname: iname, int: intFn, flt: fltFn, other: other };
  }
  function seqTimes(seq, n) {
    var k = n < 0n ? 0n : n;
    if (typeof seq === 'string') {
      if (k * BigInt(seq.length) > 200000000n) throw pyErr(T_MemoryError);
      return seq.repeat(Number(k));
    }
    var a = seq.a;
    if (k * BigInt(a.length) > 50000000n) throw pyErr(T_MemoryError);
    var r = [], kk = Number(k);
    for (var i = 0; i < kk; i++) for (var j = 0; j < a.length; j++) r.push(a[j]);
    return seq instanceof PyList ? new PyList(r) : new PyTuple(r);
  }
  function isSeqForMul(v) { return typeof v === 'string' || v instanceof PyList || v instanceof PyTuple; }
  function repCount(v) { // entier pour la répétition (int, bool, __index__) ou undefined
    if (typeof v === 'bigint') return v;
    if (typeof v === 'boolean') return v ? 1n : 0n;
    if (v instanceof PyInst && lookup(v.cls, '__index__')) return asIndex(v);
    return undefined;
  }
  var OP_ADD = mkOp('+', '__add__', '__radd__', '__iadd__', function (a, b) { return a + b; }, function (a, b) { return a + b; },
    function (a, b) {
      if (typeof a === 'string' && typeof b === 'string') return a + b;
      if (a instanceof PyList && b instanceof PyList) return new PyList(a.a.concat(b.a));
      if (a instanceof PyTuple && b instanceof PyTuple) return new PyTuple(a.a.concat(b.a));
      if (a && a.$add) return a.$add(b);
      return NotImplemented;
    });
  var OP_SUB = mkOp('-', '__sub__', '__rsub__', '__isub__', function (a, b) { return a - b; }, function (a, b) { return a - b; },
    function (a, b) {
      if (a instanceof PySet && b instanceof PySet) return setDifference(a, b);
      if (a && a.$sub) return a.$sub(b);
      return NotImplemented;
    });
  var OP_MUL = mkOp('*', '__mul__', '__rmul__', '__imul__', function (a, b) { return a * b; }, function (a, b) { return a * b; },
    function (a, b) {
      var n;
      if (isSeqForMul(a)) { n = repCount(b); if (n !== undefined) return seqTimes(a, n); return NotImplemented; }
      if (isSeqForMul(b)) { n = repCount(a); if (n !== undefined) return seqTimes(b, n); return NotImplemented; }
      if (a && a.$mul) return a.$mul(b);
      if (b && b.$mul) return b.$mul(a);
      return NotImplemented;
    });
  var OP_TRUEDIV = mkOp('/', '__truediv__', '__rtruediv__', '__itruediv__', trueDivInt,
    function (a, b) { if (b === 0) throw pyErr(T_ZeroDivisionError, 'float division by zero'); return a / b; }, null);
  var OP_FLOORDIV = mkOp('//', '__floordiv__', '__rfloordiv__', '__ifloordiv__', floorDivInt, floatFloorDiv, null);
  var OP_MOD = mkOp('%', '__mod__', '__rmod__', '__imod__', modInt, floatMod,
    function (a, b) { if (typeof a === 'string') return percentFormat(a, b); return NotImplemented; });
  var OP_POW = mkOp('**', '__pow__', '__rpow__', '__ipow__', powInt, floatPow, null);
  var OP_MATMUL = mkOp('@', '__matmul__', '__rmatmul__', '__imatmul__', null, null, null);
  var OP_LSHIFT = mkOp('<<', '__lshift__', '__rlshift__', '__ilshift__', function (a, b) {
    if (b < 0n) throw valueErr('negative shift count');
    if (a !== 0n && b > 100000000n) throw pyErr(T_MemoryError);
    return a << b;
  }, null, null);
  var OP_RSHIFT = mkOp('>>', '__rshift__', '__rrshift__', '__irshift__', function (a, b) {
    if (b < 0n) throw valueErr('negative shift count');
    if (b > 100000000n) return a < 0n ? -1n : 0n;
    return a >> b;
  }, null, null);
  var OP_AND = mkOp('&', '__and__', '__rand__', '__iand__', function (a, b) { return a & b; }, null,
    function (a, b) { if (a instanceof PySet && b instanceof PySet) return setIntersection(a, b); if (a && a.$and) return a.$and(b); if (b && b.$rand) return b.$rand(a); return NotImplemented; });
  var OP_OR = mkOp('|', '__or__', '__ror__', '__ior__', function (a, b) { return a | b; }, null,
    function (a, b) {
      if (a instanceof PySet && b instanceof PySet) { var r = setCopy(a); if (a !== b) setUpdate(r, b); return r; }
      if (a && a.$or) return a.$or(b);
      if (b && b.$ror) return b.$ror(a);
      return NotImplemented;
    });
  var OP_XOR = mkOp('^', '__xor__', '__rxor__', '__ixor__', function (a, b) { return a ^ b; }, null,
    function (a, b) { if (a instanceof PySet && b instanceof PySet) return setSymDiff(a, b); if (a && a.$xor) return a.$xor(b); if (b && b.$rxor) return b.$rxor(a); return NotImplemented; });
  var BINOPS = { '+': OP_ADD, '-': OP_SUB, '*': OP_MUL, '/': OP_TRUEDIV, '//': OP_FLOORDIV, '%': OP_MOD, '**': OP_POW,
    '@': OP_MATMUL, '<<': OP_LSHIFT, '>>': OP_RSHIFT, '&': OP_AND, '|': OP_OR, '^': OP_XOR };

  function nativeBinop(op, a, b) {
    var ka = numKind(a), kb = numKind(b);
    if (ka && kb) {
      if (typeof a === 'boolean' && typeof b === 'boolean' && (op === OP_AND || op === OP_OR || op === OP_XOR)) {
        return op === OP_AND ? (a && b) : op === OP_OR ? (a || b) : (a !== b);
      }
      if (ka === 2 || kb === 2) {
        if (!op.flt) return NotImplemented;
        return op.flt(toFloat(a), toFloat(b));
      }
      if (!op.int) return NotImplemented;
      return op.int(toBig(a), toBig(b));
    }
    if (op.other) return op.other(a, b);
    return NotImplemented;
  }
  function binopError(op, a, b, inplace) {
    if (op === OP_ADD && (typeof a === 'string' || a instanceof PyList || a instanceof PyTuple)) {
      var tn = tname(a);
      return typeErr('can only concatenate ' + tn + ' (not "' + tname(b) + '") to ' + tn);
    }
    if (op === OP_MUL && ((isSeqForMul(a) && repCount(b) === undefined) || (isSeqForMul(b) && repCount(a) === undefined))) {
      return typeErr("can't multiply sequence by non-int of type '" + tname(isSeqForMul(a) ? b : a) + "'");
    }
    var sym = op.sym + (inplace ? '=' : '');
    if (op === OP_POW && !inplace) sym = '** or pow()';
    return typeErr('unsupported operand type(s) for ' + sym + ": '" + tname(a) + "' and '" + tname(b) + "'");
  }
  function binop(op, a, b) {
    if (!(a instanceof PyInst) && !(b instanceof PyInst)) {
      var r0 = nativeBinop(op, a, b);
      if (r0 !== NotImplemented) return r0;
      throw binopError(op, a, b);
    }
    var r = userBinop(op, a, b);
    if (r !== NotImplemented) return r;
    throw binopError(op, a, b);
  }
  function userBinop(op, a, b) {
    var ta = typeOf(a), tb = typeOf(b), r;
    var fa = a instanceof PyInst ? lookup(ta, op.name) : undefined;
    var fb = (b instanceof PyInst && ta !== tb) ? lookup(tb, op.rname) : undefined;
    if (fb !== undefined && isSubtype(tb, ta) && fb !== lookup(ta, op.rname)) {
      r = callAny(fb, [b, a]);
      if (r !== NotImplemented) return r;
      fb = undefined;
    }
    if (fa !== undefined) { r = callAny(fa, [a, b]); if (r !== NotImplemented) return r; }
    else if (!(a instanceof PyInst)) { r = nativeBinop(op, a, b); if (r !== NotImplemented) return r; }
    if (fb !== undefined) { r = callAny(fb, [b, a]); if (r !== NotImplemented) return r; }
    return NotImplemented;
  }
  // Opérateurs « en place » (+= ...)
  function inplaceOp(op, a, b) {
    if (a instanceof PyList) {
      if (op === OP_ADD) { if (b instanceof PyList || b instanceof PyTuple) { var ba = b.a.slice(); for (var i = 0; i < ba.length; i++) a.a.push(ba[i]); } else { var arr = toArray(b); for (var j = 0; j < arr.length; j++) a.a.push(arr[j]); } return a; }
      if (op === OP_MUL) {
        var n = repCount(b);
        if (n === undefined) throw binopError(op, a, b, true);
        var src = a.a.slice(), k = n < 0n ? 0 : Number(n);
        if (src.length * k > 50000000) throw pyErr(T_MemoryError);
        a.a.length = 0;
        for (var q = 0; q < k; q++) for (var w = 0; w < src.length; w++) a.a.push(src[w]);
        return a;
      }
    }
    if (a instanceof PySet && !(a instanceof PyFrozenSet) && (op === OP_OR || op === OP_AND || op === OP_SUB || op === OP_XOR)) {
      if (!(b instanceof PySet)) throw binopError(op, a, b, true);
      if (op === OP_OR) setUpdate(a, b);
      else if (op === OP_AND) setSwapBodies(a, setIntersection(a, b));
      else if (op === OP_SUB) setDifferenceUpdate(a, b);
      else setSymDiffUpdate(a, b);
      return a;
    }
    if (a && a.$iop) { var ri = a.$iop(op, b); if (ri !== NotImplemented) return ri; }
    if (a instanceof PyInst) {
      var f = lookup(a.cls, op.iname);
      if (f !== undefined) { var r = callAny(f, [a, b]); if (r !== NotImplemented) return r; }
    }
    if (!(a instanceof PyInst) && !(b instanceof PyInst)) {
      var r0 = nativeBinop(op, a, b);
      if (r0 !== NotImplemented) return r0;
      throw binopError(op, a, b, true);
    }
    var r2 = userBinop(op, a, b);
    if (r2 !== NotImplemented) return r2;
    throw binopError(op, a, b, true);
  }
  // raccourcis rapides
  function add(a, b) {
    var t = typeof a;
    if (t === typeof b && (t === 'bigint' || t === 'number' || t === 'string')) return a + b;
    return binop(OP_ADD, a, b);
  }
  function sub(a, b) {
    var t = typeof a;
    if (t === typeof b && (t === 'bigint' || t === 'number')) return a - b;
    return binop(OP_SUB, a, b);
  }
  function mul(a, b) {
    var t = typeof a;
    if (t === typeof b && (t === 'bigint' || t === 'number')) return a * b;
    return binop(OP_MUL, a, b);
  }

  // ---- Opérateurs unaires ----
  function unaryOp(op, v) {
    var t = typeof v;
    if (t === 'bigint') return op === '-' ? -v : op === '+' ? v : ~v;
    if (t === 'boolean') { var b = v ? 1n : 0n; return op === '-' ? -b : op === '+' ? b : ~b; }
    if (t === 'number') { if (op === '~') throw typeErr("bad operand type for unary ~: 'float'"); return op === '-' ? -v : v; }
    var name = op === '-' ? '__neg__' : op === '+' ? '__pos__' : '__invert__';
    if (v instanceof PyInst) { var f = lookup(v.cls, name); if (f !== undefined) return callAny(f, [v]); }
    if (v && v.$unary) { var r = v.$unary(op); if (r !== NotImplemented) return r; }
    throw typeErr('bad operand type for unary ' + op + ": '" + tname(v) + "'");
  }
  function pyAbs(v) {
    var t = typeof v;
    if (t === 'bigint') return v < 0n ? -v : v;
    if (t === 'boolean') return v ? 1n : 0n;
    if (t === 'number') return Math.abs(v);
    if (v instanceof PyInst) { var f = lookup(v.cls, '__abs__'); if (f !== undefined) return callAny(f, [v]); }
    throw typeErr("bad operand type for abs(): '" + tname(v) + "'");
  }

  // ---- Appartenance (in) ----
  function pyContains(c, x) {
    if (typeof c === 'string') {
      if (typeof x !== 'string') throw typeErr("'in <string>' requires string as left operand, not " + tname(x));
      return c.indexOf(x) >= 0;
    }
    if (typeof c === 'object') return c.$contains(x);
    throw typeErr("argument of type '" + tname(c) + "' is not iterable");
  }
  function containsByIter(c, x) {
    var it = getIter(c), v;
    while ((v = it.nx()) !== undefined) if (eqBool(v, x)) return true;
    return false;
  }

  // ---- Indices et tranches ----
  function sliceIndexVal(v) {
    if (v === None) return null;
    if (typeof v === 'bigint') return v > 9007199254740991n ? 9007199254740991 : v < -9007199254740991n ? -9007199254740991 : Number(v);
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v instanceof PyInst && lookup(v.cls, '__index__')) return Number(asIndex(v));
    throw typeErr('slice indices must be integers or None or have an __index__ method');
  }
  function sliceIndices(sl, len) {
    var step = sliceIndexVal(sl.step);
    if (step === null) step = 1;
    if (step === 0) throw valueErr('slice step cannot be zero');
    var start = sliceIndexVal(sl.start), stop = sliceIndexVal(sl.stop);
    if (start === null) start = step < 0 ? len - 1 : 0;
    else if (start < 0) { start += len; if (start < 0) start = step < 0 ? -1 : 0; }
    else if (start >= len) start = step < 0 ? len - 1 : len;
    if (stop === null) stop = step < 0 ? -1 : len;
    else if (stop < 0) { stop += len; if (stop < 0) stop = step < 0 ? -1 : 0; }
    else if (stop >= len) stop = step < 0 ? len - 1 : len;
    var count;
    if (step < 0) count = stop < start ? Math.floor((start - stop - 1) / (-step)) + 1 : 0;
    else count = start < stop ? Math.floor((stop - start - 1) / step) + 1 : 0;
    return [start, stop, step, count];
  }
  function sliceArray(a, sl) {
    var si = sliceIndices(sl, a.length);
    if (si[2] === 1) return a.slice(si[0], si[0] + si[3]);
    var r = new Array(si[3]);
    for (var i = 0, j = si[0]; i < si[3]; i++, j += si[2]) r[i] = a[j];
    return r;
  }
  function seqIndex(k, len, what) {
    var i;
    if (typeof k === 'bigint') i = (k > 9007199254740991n || k < -9007199254740991n) ? Infinity : Number(k);
    else if (typeof k === 'boolean') i = k ? 1 : 0;
    else if (k instanceof PyInst && lookup(k.cls, '__index__')) i = Number(asIndex(k));
    else return undefined;
    if (i < 0) i += len;
    if (i < 0 || i >= len) throw pyErr(T_IndexError, what + ' index out of range');
    return i;
  }
  function strGetItem(s, k) {
    var astral = isAstral(s);
    if (k instanceof PySlice) {
      if (!astral) {
        var si = sliceIndices(k, s.length);
        if (si[2] === 1) return s.substr(si[0], si[3]);
        var r = '';
        for (var i = 0, j = si[0]; i < si[3]; i++, j += si[2]) r += s[j];
        return r;
      }
      return sliceArray(Array.from(s), k).join('');
    }
    if (!astral) {
      var idx = seqIndex(k, s.length, 'string');
      if (idx === undefined) throw typeErr("string indices must be integers, not '" + tname(k) + "'");
      return s[idx];
    }
    var cs = Array.from(s);
    var idx2 = seqIndex(k, cs.length, 'string');
    if (idx2 === undefined) throw typeErr("string indices must be integers, not '" + tname(k) + "'");
    return cs[idx2];
  }
  function getItem(o, k) {
    if (typeof o === 'string') return strGetItem(o, k);
    if (typeof o === 'object') return o.$getitem(k);
    throw typeErr("'" + tname(o) + "' object is not subscriptable");
  }
  function setItem(o, k, v) {
    if (typeof o === 'object') return o.$setitem(k, v);
    throw typeErr("'" + tname(o) + "' object does not support item assignment");
  }
  function delItem(o, k) {
    if (typeof o === 'object') return o.$delitem(k);
    throw typeErr("'" + tname(o) + "' object does not support item deletion");
  }

  // ---- Attributs ----
  function attrErr(o, name, msg) {
    var e = pyErr(T_AttributeError, msg || ("'" + tname(o) + "' object has no attribute '" + name + "'"));
    e.d.set('name', name); e.d.set('obj', o);
    return e;
  }
  // lie un attribut de classe à une instance
  function bindAttr(v, obj, cls) {
    if (v instanceof PyFunc) return new PyMethod(v, obj);
    if (v instanceof PyMethodDescr) return new PyBuiltin(v.name, v.fn, obj, v.type);
    if (v instanceof PyStaticMethod) return v.f;
    if (v instanceof PyClassMethod) return new PyMethod(v.f, cls);
    if (v instanceof PyProperty) {
      if (v.fget === None) throw attrErr(obj, '', "property '" + propName(v) + "' of '" + cls.name + "' object has no getter");
      return callAny(v.fget, [obj]);
    }
    if (v && v.$get) return v.$get(obj, cls);
    return v;
  }
  function propName(p) { return p.fget !== None && p.fget.name ? p.fget.name : (p.fset !== None && p.fset.name ? p.fset.name : '?'); }
  function getAttr(o, name) {
    if (typeof o === 'object') return o.$getattr(name);
    var t = typeOf(o);
    var v = lookup(t, name);
    if (v !== undefined) return bindAttr(v, o, t);
    if (t.getters && hasOwn(t.getters, name)) return t.getters[name](o);
    if (name === '__class__') return t;
    if (name === '__doc__') return None;
    throw attrErr(o, name);
  }
  function getAttrOr(o, name, dflt) {
    try { return getAttr(o, name); } catch (e) { if (e instanceof PyInst && isinst(e, T_AttributeError)) return dflt; throw e; }
  }
  function setAttr(o, name, v) {
    if (typeof o === 'object' && o.$setattr) return o.$setattr(name, v);
    if (typeof o === 'object' && o.cls && !o.cls.native) return o.$setattr(name, v);
    var t = typeOf(o);
    if (lookup(t, name) !== undefined) throw attrErr(o, name, "'" + t.name + "' object attribute '" + name + "' is read-only");
    throw attrErr(o, name, "'" + t.name + "' object has no attribute '" + name + "' and no __dict__ for setting new attributes");
  }
  function delAttr(o, name) {
    if (typeof o === 'object' && o.$delattr) return o.$delattr(name);
    throw attrErr(o, name);
  }

  // ---- Appels ----
  function callAny(f, args, kw) {
    if (typeof f === 'object' && f.$call) return f.$call(args, kw || null);
    throw typeErr("'" + tname(f) + "' object is not callable");
  }
  function kwEmpty(kw) { return kw === null || kw === undefined || kw.size === 0; }
  // vérifie le nombre d'arguments d'une fonction native (messages de CPython)
  function noKw(name, kw) { if (!kwEmpty(kw)) throw typeErr(name + '() takes no keyword arguments'); }
  function argCount(name, args, min, max, kw) {
    if (kw !== undefined) noKw(name, kw);
    var n = args.length;
    if (n >= min && n <= max) return;
    if (min === max) {
      if (min === 0) throw typeErr(name + '() takes no arguments (' + n + ' given)');
      if (min === 1) throw typeErr(name + '() takes exactly one argument (' + n + ' given)');
      throw typeErr(name + ' expected ' + min + ' arguments, got ' + n);
    }
    if (n < min) throw typeErr(name + ' expected at least ' + min + ' argument' + (min === 1 ? '' : 's') + ', got ' + n);
    throw typeErr(name + ' expected at most ' + max + ' argument' + (max === 1 ? '' : 's') + ', got ' + n);
  }
  // Récupère les arguments d'une fonction native décrite par une liste de noms (« nom=défaut »).
  function parseArgs(fname, args, kw, names, minPos) {
    var res = new Array(names.length);
    var n = args.length;
    if (n > names.length) {
      throw typeErr(fname + '() takes at most ' + names.length + ' argument' + (names.length === 1 ? '' : 's') + ' (' + n + ' given)');
    }
    for (var i = 0; i < n; i++) res[i] = args[i];
    if (kw) kw.forEach(function (v, k) {
      var idx = names.indexOf(k);
      if (idx < 0) throw typeErr(fname + "() got an unexpected keyword argument '" + k + "'");
      if (idx < n) throw typeErr("argument for " + fname + "() given by name ('" + k + "') and position (" + (idx + 1) + ')');
      res[idx] = v;
    });
    if (minPos !== undefined) {
      for (var j = 0; j < minPos; j++) if (res[j] === undefined) {
        throw typeErr(fname + "() missing required argument '" + names[j] + "' (pos " + (j + 1) + ')');
      }
    }
    return res;
  }

  // ---- Itération ----
  // Les itérateurs natifs ont une méthode nx() qui renvoie la valeur suivante, ou undefined à la fin.
  function getIter(o) {
    if (typeof o === 'string') return new StrIter(o);
    if (typeof o === 'object') return o.$iter();
    throw typeErr("'" + tname(o) + "' object is not iterable");
  }
  function iterate(o, cb) {
    if (o instanceof PyList || o instanceof PyTuple) {
      var a = o.a;
      for (var i = 0; i < a.length; i++) cb(a[i]);
      return;
    }
    var it = getIter(o), v;
    while ((v = it.nx()) !== undefined) {
      if (++steps > nextCheck) checkLimits();
      cb(v);
    }
  }
  function toArray(o) {
    if (o instanceof PyList || o instanceof PyTuple) return o.a.slice();
    if (typeof o === 'string') return strChars(o);
    var r = [], it = getIter(o), v;
    while ((v = it.nx()) !== undefined) {
      if (++steps > nextCheck) checkLimits();
      r.push(v);
    }
    return r;
  }
  function pyNext(it, dflt) {
    if (it && typeof it.nx === 'function') {
      var v = it.nx();
      if (v === undefined) { if (dflt !== undefined) return dflt; throw newExc(T_StopIteration, []); }
      return v;
    }
    if (it instanceof PyInst) {
      var f = lookup(it.cls, '__next__');
      if (f === undefined) throw typeErr("'" + tname(it) + "' object is not an iterator");
      if (dflt === undefined) return callAny(f, [it]);
      try { return callAny(f, [it]); } catch (e) { if (e instanceof PyInst && isinst(e, T_StopIteration)) return dflt; throw e; }
    }
    throw typeErr("'" + tname(it) + "' object is not an iterator");
  }

  // =====================================================================================================
  // 7. Compilateur : chaque nœud de l'arbre devient une fermeture JavaScript (f) => valeur.
  //    Les instructions renvoient undefined (suite normale) ou BREAK / CONTINUE / RETURN.
  // =====================================================================================================
  var BREAK = 1, CONTINUE = 2, RETURN = 3;

  function Frame(n, closure, globals) {
    this.l = n ? new Array(n) : [];  // variables locales (ou cellules)
    this.c = closure;                // cellules de la fermeture
    this.g = globals;                // variables globales (Map)
    this.rv = None;                  // valeur de retour
    this.ns = null;                  // espace de noms d'un corps de classe
    this.fn = null;                  // fonction en cours
    this.sc = null;                  // portée (pour les suggestions)
  }

  var BUILTINS = new Map();

  function unboundLocal(name) {
    var e = pyErr(T_UnboundLocalError, "cannot access local variable '" + name + "' where it is not associated with a value");
    e.d.set('name', name);
    return e;
  }
  function nameError(name, f) {
    var e = pyErr(T_NameError, "name '" + name + "' is not defined");
    e.d.set('name', name);
    e.$frame = f;
    return e;
  }
  function freeUnbound(name) {
    var e = pyErr(T_NameError, "cannot access free variable '" + name + "' where it is not associated with a value in enclosing scope");
    e.d.set('name', name);
    return e;
  }

  // Contexte de compilation
  function Cx(scope, parent) {
    this.scope = scope;
    this.loop = 0;          // profondeur de boucles (pour break / continue)
    this.inFunc = scope.isFunc() && scope.kind === 'function';
    this.stmtLine = 0;
    this.parent = parent;
  }

  function nameRef(cx, id) {
    var sc = cx.scope;
    if (sc.kind === 'module') return { k: 'G' };
    if (sc.kind === 'class') {
      if (sc.globals.has(id)) return { k: 'GX' };
      if (sc.nonlocals.has(id)) return { k: 'F', i: sc.freeIdx.get(id) };
      if (!sc.assigned.has(id) && sc.freeIdx.has(id)) return { k: 'CF', i: sc.freeIdx.get(id) };
      return { k: 'N' };
    }
    if (sc.globals.has(id)) return { k: 'GX' };
    if (sc.slots.has(id)) return sc.cells.has(id) ? { k: 'C', i: sc.slots.get(id) } : { k: 'L', i: sc.slots.get(id) };
    if (sc.freeIdx.has(id)) return { k: 'F', i: sc.freeIdx.get(id) };
    return { k: 'G' };
  }
  function compileLoad(cx, id) {
    var r = nameRef(cx, id), i = r.i;
    switch (r.k) {
      case 'L': return function (f) { var v = f.l[i]; if (v === undefined) throw unboundLocal(id); return v; };
      case 'C': return function (f) { var v = f.l[i].v; if (v === undefined) throw unboundLocal(id); return v; };
      case 'F': return function (f) { var v = f.c[i].v; if (v === undefined) throw freeUnbound(id); return v; };
      case 'N': return function (f) {
        var v = f.ns.get(id);
        if (v === undefined) { v = f.g.get(id); if (v === undefined) { v = BUILTINS.get(id); if (v === undefined) throw nameError(id, f); } }
        return v;
      };
      case 'CF': return function (f) {
        var v = f.ns.get(id);
        if (v === undefined) { v = f.c[i].v; if (v === undefined) throw freeUnbound(id); }
        return v;
      };
      default: return function (f) {
        var v = f.g.get(id);
        if (v === undefined) { v = BUILTINS.get(id); if (v === undefined) throw nameError(id, f); }
        return v;
      };
    }
  }
  function compileStoreName(cx, id) {
    var r = nameRef(cx, id), i = r.i;
    switch (r.k) {
      case 'L': return function (f, v) { f.l[i] = v; };
      case 'C': return function (f, v) { f.l[i].v = v; };
      case 'F': return function (f, v) { f.c[i].v = v; };
      case 'N': return function (f, v) { f.ns.set(id, v); };
      default: return function (f, v) { f.g.set(id, v); };
    }
  }
  function compileDelName(cx, id) {
    var r = nameRef(cx, id), i = r.i;
    switch (r.k) {
      case 'L': return function (f) { if (f.l[i] === undefined) throw unboundLocal(id); f.l[i] = undefined; };
      case 'C': return function (f) { if (f.l[i].v === undefined) throw unboundLocal(id); f.l[i].v = undefined; };
      case 'F': return function (f) { if (f.c[i].v === undefined) throw freeUnbound(id); f.c[i].v = undefined; };
      case 'N': return function (f) { if (!f.ns.delete(id)) throw nameError(id, f); };
      default: return function (f) { if (!f.g.delete(id)) throw nameError(id, f); };
    }
  }
  // Référence à la cellule d'une variable (pour construire une fermeture)
  function cellRef(cx, name) {
    var sc = cx.scope;
    if (sc.kind === 'class' && name === '__class__' && sc.classCell) {
      var ci = sc.slots.get('__class__');
      return function (f) { return f.l[ci]; };
    }
    if (sc.isFunc() && sc.cells.has(name)) {
      var si = sc.slots.get(name);
      return function (f) { return f.l[si]; };
    }
    var fi = sc.freeIdx.get(name);
    if (fi === undefined) throw new Error('MiniPy: cellule introuvable ' + name);
    return function (f) { return f.c[fi]; };
  }

  // Si une exception levée dans ce cadre n'a pas encore de ligne précise, lui donne la ligne de ce nœud.
  function lineWrap(fn, line) {
    return function (f) {
      try { return fn(f); } catch (e) {
        if (e instanceof PyInst && e.$depth === depth && !e.$claimed) { e.$line = line; e.$claimed = true; }
        throw e;
      }
    };
  }

  function compileExpr(e, cx) {
    var fn = compileExpr0(e, cx);
    if (e.line && e.line !== cx.stmtLine && (e.k === 'Call' || e.k === 'Name' || e.k === 'BinOp' || e.k === 'Sub' || e.k === 'Attr' || e.k === 'Compare' || e.k === 'UnaryOp')) {
      return lineWrap(fn, e.line);
    }
    return fn;
  }

  function constValue(e) { // valeur constante (pour { … } constants, comme le compilateur de CPython)
    if (e.k === 'Const') return { v: e.ellipsis ? Ellipsis : (e.v === null ? None : e.v) };
    if (e.k === 'UnaryOp' && (e.op === '-' || e.op === '+') && e.e.k === 'Const' && (typeof e.e.v === 'bigint' || typeof e.e.v === 'number')) {
      return { v: e.op === '-' ? -e.e.v : e.e.v };
    }
    if (e.k === 'Tuple') {
      var vals = [];
      for (var i = 0; i < e.elts.length; i++) { var c = constValue(e.elts[i]); if (!c) return null; vals.push(c.v); }
      return { v: new PyTuple(vals) };
    }
    return null;
  }

  function compileExpr0(e, cx) {
    switch (e.k) {
      case 'Const': {
        var cv = e.ellipsis ? Ellipsis : (e.v === null ? None : e.v);
        return function () { return cv; };
      }
      case 'Name': {
        if (e.id === '__debug__') return function () { return true; };
        return compileLoad(cx, e.id);
      }
      case 'JoinedStr': return compileJoinedStr(e, cx);
      case 'BinOp': return compileBinOp(e, cx);
      case 'UnaryOp': {
        var a = compileExpr(e.e, cx);
        if (e.op === 'not') return function (f) { return !truthy(a(f)); };
        if (e.op === '-') {
          if (e.e.k === 'Const' && (typeof e.e.v === 'bigint' || typeof e.e.v === 'number')) { var nv = -e.e.v; return function () { return nv; }; }
          return function (f) { var v = a(f); var t = typeof v; if (t === 'bigint' || t === 'number') return -v; return unaryOp('-', v); };
        }
        var op = e.op;
        return function (f) { return unaryOp(op, a(f)); };
      }
      case 'BoolOp': {
        var vals = e.vals.map(function (x) { return compileExpr(x, cx); });
        var n = vals.length;
        if (e.op === 'and') return function (f) { var v; for (var i = 0; i < n; i++) { v = vals[i](f); if (i < n - 1 && !truthy(v)) return v; } return v; };
        return function (f) { var v; for (var i = 0; i < n; i++) { v = vals[i](f); if (i < n - 1 && truthy(v)) return v; } return v; };
      }
      case 'Compare': return compileCompare(e, cx);
      case 'IfExp': {
        var t = compileExpr(e.test, cx), b = compileExpr(e.body, cx), o = compileExpr(e.orelse, cx);
        return function (f) { return truthy(t(f)) ? b(f) : o(f); };
      }
      case 'Lambda': return compileFunction(e, cx, true);
      case 'Call': return compileCall(e, cx);
      case 'Attr': {
        var obj = compileExpr(e.e, cx), name = e.name;
        return function (f) { var o = obj(f); return typeof o === 'object' ? o.$getattr(name) : getAttr(o, name); };
      }
      case 'Sub': {
        var so = compileExpr(e.e, cx), si = compileSubscript(e.idx, cx);
        return function (f) {
          var o = so(f), k = si(f);
          if (o instanceof PyList && typeof k === 'bigint') {
            var a = o.a, i = Number(k);
            if (i < 0) i += a.length;
            if (i >= 0 && i < a.length) return a[i];
            throw pyErr(T_IndexError, 'list index out of range');
          }
          return getItem(o, k);
        };
      }
      case 'Slice': return compileSubscript(e, cx);
      case 'Starred': throw new PySyntaxError('SyntaxError', "can't use starred expression here", e.line);
      case 'List': {
        var lf = compileElts(e.elts, cx);
        return function (f) { return new PyList(lf(f)); };
      }
      case 'Tuple': {
        var tf = compileElts(e.elts, cx);
        return function (f) { return new PyTuple(tf(f)); };
      }
      case 'Set': {
        // plus de 2 constantes : CPython construit d'abord un frozenset (l'ordre en dépend)
        var allConst = e.elts.length > 2 && e.elts.every(function (x) { return constValue(x) !== null; });
        var sf = compileElts(e.elts, cx, true);
        if (allConst) {
          return function (f) {
            var items = sf(f), fz = new PyFrozenSet();
            for (var i = 0; i < items.length; i++) setAddKey(fz, items[i]);
            var s = new PySet(); setMerge(s, fz); return s;
          };
        }
        var hasStar = e.elts.some(function (x) { return x.k === 'Starred'; });
        if (hasStar) {
          var parts = e.elts.map(function (x) { return x.k === 'Starred' ? { star: true, f: compileExpr(x.e, cx) } : { star: false, f: compileExpr(x, cx) }; });
          return function (f) {
            var s = new PySet();
            for (var i = 0; i < parts.length; i++) { var v = parts[i].f(f); if (parts[i].star) setUpdate(s, v); else setAddKey(s, v); }
            return s;
          };
        }
        return function (f) { var items = sf(f), s = new PySet(); for (var i = 0; i < items.length; i++) setAddKey(s, items[i]); return s; };
      }
      case 'Dict': {
        var ks = e.keys.map(function (k) { return k ? compileExpr(k, cx) : null; });
        var vs = e.vals.map(function (v) { return compileExpr(v, cx); });
        return function (f) {
          var d = new PyDict();
          for (var i = 0; i < ks.length; i++) {
            if (ks[i] === null) {
              var m = vs[i](f);
              dictUpdateFrom(d, m, true);
            } else {
              var k = ks[i](f);
              dictSet(d, k, vs[i](f));
            }
          }
          return d;
        };
      }
      case 'ListComp': case 'SetComp': case 'DictComp': case 'GenExp': return compileComp(e, cx);
    }
    throw new PySyntaxError('SyntaxError', 'invalid syntax', e.line);
  }

  // Éléments d'une liste / tuple / appel, avec *x éventuels
  function compileElts(elts, cx) {
    var hasStar = false;
    var fns = elts.map(function (x) {
      if (x.k === 'Starred') { hasStar = true; return { star: true, f: compileExpr(x.e, cx) }; }
      return { star: false, f: compileExpr(x, cx) };
    });
    var n = fns.length;
    if (!hasStar) {
      var plain = fns.map(function (x) { return x.f; });
      if (n === 0) return function () { return []; };
      if (n === 1) { var p0 = plain[0]; return function (f) { return [p0(f)]; }; }
      if (n === 2) { var q0 = plain[0], q1 = plain[1]; return function (f) { var a = q0(f); return [a, q1(f)]; }; }
      return function (f) { var r = new Array(n); for (var i = 0; i < n; i++) r[i] = plain[i](f); return r; };
    }
    return function (f) {
      var r = [];
      for (var i = 0; i < n; i++) {
        var v = fns[i].f(f);
        if (fns[i].star) {
          if (v instanceof PyList || v instanceof PyTuple) { for (var j = 0; j < v.a.length; j++) r.push(v.a[j]); }
          else {
            var arr;
            try { arr = toArray(v); } catch (err) {
              if (err instanceof PyInst && isinst(err, T_TypeError) && !iterableish(v)) throw typeErr('Value after * must be an iterable, not ' + tname(v));
              throw err;
            }
            for (var k = 0; k < arr.length; k++) r.push(arr[k]);
          }
        } else r.push(v);
      }
      return r;
    };
  }
  function iterableish(v) {
    if (typeof v === 'string') return true;
    if (typeof v !== 'object') return false;
    if (v instanceof PyInst) return lookup(v.cls, '__iter__') !== undefined || lookup(v.cls, '__getitem__') !== undefined;
    return v.$iter !== PyObjBase.prototype.$iter;
  }

  function compileSubscript(idx, cx) {
    if (idx.k === 'Slice') {
      var lo = idx.lo ? compileExpr(idx.lo, cx) : null, hi = idx.hi ? compileExpr(idx.hi, cx) : null, st = idx.st ? compileExpr(idx.st, cx) : null;
      return function (f) { return new PySlice(lo ? lo(f) : None, hi ? hi(f) : None, st ? st(f) : None); };
    }
    if (idx.k === 'Tuple' && !idx.paren) {
      var parts = idx.elts.map(function (x) { return compileSubscript(x, cx); });
      return function (f) { return new PyTuple(parts.map(function (p) { return p(f); })); };
    }
    return compileExpr(idx, cx);
  }

  function compileBinOp(e, cx) {
    var l = compileExpr(e.l, cx), r = compileExpr(e.r, cx);
    var op = BINOPS[e.op];
    switch (e.op) {
      case '+': return function (f) { var a = l(f), b = r(f), t = typeof a; if (t === typeof b && (t === 'bigint' || t === 'number' || t === 'string')) return a + b; return binop(OP_ADD, a, b); };
      case '-': return function (f) { var a = l(f), b = r(f), t = typeof a; if (t === typeof b && (t === 'bigint' || t === 'number')) return a - b; return binop(OP_SUB, a, b); };
      case '*': return function (f) { var a = l(f), b = r(f), t = typeof a; if (t === typeof b && (t === 'bigint' || t === 'number')) return a * b; return binop(OP_MUL, a, b); };
      case '%': return function (f) {
        var a = l(f), b = r(f);
        if (typeof a === 'bigint' && typeof b === 'bigint' && b > 0n && a >= 0n) return a % b;
        return binop(OP_MOD, a, b);
      };
      case '//': return function (f) {
        var a = l(f), b = r(f);
        if (typeof a === 'bigint' && typeof b === 'bigint' && b > 0n && a >= 0n) return a / b;
        return binop(OP_FLOORDIV, a, b);
      };
      case '/': return function (f) {
        var a = l(f), b = r(f);
        if (typeof a === 'number' && typeof b === 'number' && b !== 0) return a / b;
        return binop(OP_TRUEDIV, a, b);
      };
      default: return function (f) { var a = l(f); return binop(op, a, r(f)); };
    }
  }

  function cmpOp(op, a, b) {
    switch (op) {
      case 'in': return pyContains(b, a);
      case 'not in': return !pyContains(b, a);
      case 'is': return a === b;
      case 'is not': return a !== b;
    }
    var ta = typeof a;
    if (ta === typeof b && (ta === 'bigint' || ta === 'number')) {
      switch (op) {
        case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
        case '==': return a === b; case '!=': return a !== b;
      }
    }
    if (ta === 'string' && typeof b === 'string') {
      if (op === '==') return a === b;
      if (op === '!=') return a !== b;
      return cmpPrim(op, cmpStr(a, b));
    }
    return richCmp(a, b, op);
  }
  function compileCompare(e, cx) {
    var l = compileExpr(e.l, cx);
    var rs = e.rs.map(function (x) { return compileExpr(x, cx); });
    var ops = e.ops;
    if (ops.length === 1) {
      var r0 = rs[0], op0 = ops[0];
      switch (op0) {
        case '<': return function (f) { var a = l(f), b = r0(f), t = typeof a; if (t === typeof b && (t === 'bigint' || t === 'number')) return a < b; return cmpOp('<', a, b); };
        case '==': return function (f) { var a = l(f), b = r0(f), t = typeof a; if (t === typeof b && t !== 'object') return t === 'number' ? a === b : a === b; return cmpOp('==', a, b); };
        default: return function (f) { var a = l(f); return cmpOp(op0, a, r0(f)); };
      }
    }
    return function (f) {
      var a = l(f), res;
      for (var i = 0; i < ops.length; i++) {
        var b = rs[i](f);
        res = cmpOp(ops[i], a, b);
        if (i < ops.length - 1 && !truthy(res)) return res;
        a = b;
      }
      return res;
    };
  }

  function compileJoinedStr(e, cx) {
    var parts = e.parts.map(function (p) { return typeof p === 'string' ? p : compileFV(p, cx); });
    if (parts.length === 1 && typeof parts[0] !== 'string') return parts[0];
    return function (f) {
      var s = '';
      for (var i = 0; i < parts.length; i++) { var p = parts[i]; s += typeof p === 'string' ? p : p(f); }
      return s;
    };
  }
  function compileFV(p, cx) {
    var ev = compileExpr(p.e, cx);
    var conv = p.conv, debug = p.debug;
    var spec = p.spec ? p.spec.map(function (q) { return typeof q === 'string' ? q : compileFV(q, cx); }) : null;
    if (debug !== null && conv === null && spec === null) conv = 'r';
    return function (f) {
      var v = ev(f);
      if (conv === 'r') v = pyRepr(v);
      else if (conv === 's') v = pyStr(v);
      else if (conv === 'a') v = asciiRepr(v);
      var sp = '';
      if (spec !== null) for (var i = 0; i < spec.length; i++) sp += typeof spec[i] === 'string' ? spec[i] : spec[i](f);
      var s = (typeof v === 'string' && sp === '') ? v : pyFormat(v, sp);
      return debug !== null ? debug + s : s;
    };
  }

  // ---- Appels ----
  function compileArgs(args, kws, cx) {
    var pos = compileElts(args, cx);
    if (!kws.length) return { pos: pos, kw: null };
    var kfs = kws.map(function (k) { return { name: k.name, f: compileExpr(k.v, cx) }; });
    var kw = function (f, fname) {
      var m = new Map();
      for (var i = 0; i < kfs.length; i++) {
        var k = kfs[i];
        var v = k.f(f);
        if (k.name !== null) {
          if (m.has(k.name)) throw typeErr(fname() + " got multiple values for keyword argument '" + k.name + "'");
          m.set(k.name, v);
        } else {
          if (!(v instanceof PyDict) && !(v instanceof PyInst && lookup(v.cls, 'keys'))) {
            throw typeErr(fname() + ' argument after ** must be a mapping, not ' + tname(v));
          }
          var items = mappingItems(v);
          for (var j = 0; j < items.length; j++) {
            var key = items[j][0];
            if (typeof key !== 'string') throw typeErr('keywords must be strings');
            if (m.has(key)) throw typeErr(fname() + " got multiple values for keyword argument '" + key + "'");
            m.set(key, items[j][1]);
          }
        }
      }
      return m;
    };
    return { pos: pos, kw: kw };
  }
  function funcDisplayName(fv) {
    if (fv instanceof PyFunc) return fv.qualname + '()';
    if (fv instanceof PyMethod) return funcDisplayName(fv.func);
    if (fv instanceof PyBuiltin) return (fv.qual && fv.self !== undefined ? fv.qual.name + '.' : '') + fv.name + '()';
    if (fv instanceof PyType) return fv.name + '()';
    return tname(fv) + ' object';
  }
  var mSelf;   // second résultat de lookupMethod
  function lookupMethod(o, name) {
    if (o instanceof PyInst) {
      var v = lookup(o.cls, name);
      if (v instanceof PyFunc && !o.d.has(name)) { mSelf = o; return v; }
      mSelf = undefined;
      return o.$getattr(name);
    }
    if (typeof o !== 'object' || o.cls.native) {
      var m = lookup(typeOf(o), name);
      if (m instanceof PyMethodDescr) { mSelf = o; return m; }
    }
    mSelf = undefined;
    return getAttr(o, name);
  }
  function compileCall(e, cx) {
    var hasStar = e.args.some(function (a) { return a.k === 'Starred'; });
    var A = compileArgs(e.args, e.kws, cx);
    var pos = A.pos, kwf = A.kw;
    // super() sans argument
    if (e.f.k === 'Name' && e.f.id === 'super' && !e.args.length && !e.kws.length && nameRef(cx, 'super').k === 'G') {
      var sc = cx.scope;
      var clsIdx = sc.freeIdx.get('__class__');
      var firstSlot = sc.isFunc() && sc.params.length ? 0 : -1;
      var isCell = firstSlot === 0 && sc.cells.has(sc.params[0]);
      return function (f) {
        if (BUILTINS.get('super') !== T_super || f.g.has('super')) return callAny(f.g.get('super') || BUILTINS.get('super'), []);
        if (clsIdx === undefined) throw pyErr(T_RuntimeError, 'super(): __class__ cell not found');
        if (firstSlot < 0) throw pyErr(T_RuntimeError, 'super(): no arguments');
        var cls = f.c[clsIdx].v;
        if (cls === undefined) throw pyErr(T_RuntimeError, 'super(): empty __class__ cell');
        var self = isCell ? f.l[0].v : f.l[0];
        if (self === undefined) throw pyErr(T_RuntimeError, 'super(): arg[0] deleted');
        return makeSuper(cls, self);
      };
    }
    // appel de méthode : obj.nom(...)
    if (e.f.k === 'Attr') {
      var objf = compileExpr(e.f.e, cx), mname = e.f.name;
      var tempFile = e.f.e.k === 'Call';
      if (kwf === null) {
        var callM = function (f) {
          var o = objf(f);
          var m = lookupMethod(o, mname), s = mSelf;
          var args = pos(f);
          var r;
          if (s !== undefined) r = (m instanceof PyFunc) ? callFunc(m, args, null, s) : m.fn(s, args, null);
          else r = callAny(m, args, null);
          if (tempFile && o instanceof PyFile) o.tempUse();
          return r;
        };
        return callM;
      }
      return function (f) {
        var o = objf(f);
        var m = lookupMethod(o, mname), s = mSelf;
        var args = pos(f);
        var kw = kwf(f, function () { return funcDisplayName(s !== undefined ? m : m); });
        if (s !== undefined) return (m instanceof PyFunc) ? callFunc(m, args, kw, s) : m.fn(s, args, kw);
        return callAny(m, args, kw);
      };
    }
    var ff = compileExpr(e.f, cx);
    if (kwf === null) {
      return function (f) {
        var fv = ff(f);
        var args = pos(f);
        if (fv instanceof PyFunc) return callFunc(fv, args, null, undefined);
        if (typeof fv === 'object' && fv.$call) return fv.$call(args, null);
        throw typeErr("'" + tname(fv) + "' object is not callable");
      };
    }
    return function (f) {
      var fv = ff(f);
      var args = pos(f);
      var kw = kwf(f, function () { return funcDisplayName(fv); });
      if (typeof fv === 'object' && fv.$call) return fv.$call(args, kw);
      throw typeErr("'" + tname(fv) + "' object is not callable");
    };
  }

  // ---- Fonctions ----
  function Code(sc, args, name) {
    this.name = name;
    this.qualname = sc.qualname;
    this.scope = sc;
    this.nargs = args.args.length;
    this.nposonly = args.posonly || 0;
    this.nkwonly = args.kwonly.length;
    this.names = sc.params.slice();
    this.varargSlot = args.vararg ? sc.slots.get(args.vararg) : -1;
    this.kwargSlot = args.kwarg ? sc.slots.get(args.kwarg) : -1;
    this.nlocals = sc.nslots;
    this.simple = !args.vararg && !args.kwarg && !args.kwonly.length;
    var cs = [];
    sc.cells.forEach(function (n) { cs.push(sc.slots.get(n)); });
    this.cellSlots = cs;
    this.body = null;
    this.argIndex = new Map();
    for (var i = this.nposonly; i < this.nargs + this.nkwonly; i++) this.argIndex.set(sc.params[i], i);
  }

  function compileFunction(node, cx, isLambda) {
    var sc = node.scope;
    var code = new Code(sc, node.args, isLambda ? '<lambda>' : node.name);
    var fcx = new Cx(sc, cx);
    if (isLambda) {
      var bodyExpr = compileExprStmtCtx(node.body, fcx, node.line);
      code.body = function (f) { f.rv = bodyExpr(f); return RETURN; };
    } else {
      code.body = compileBlock(node.body, fcx);
      if (node.body.length && node.body[0].k === 'Expr' && node.body[0].e.k === 'Const' && typeof node.body[0].e.v === 'string') code.doc = node.body[0].e.v;
    }
    var defs = node.args.defaults.map(function (d) { return compileExpr(d, cx); });
    var kwdefs = node.args.kwdefaults.map(function (d) { return d ? compileExpr(d, cx) : null; });
    var clo = sc.free.map(function (n) { return cellRef(cx, n); });
    var ndefs = defs.length, nkw = kwdefs.length, nclo = clo.length;
    return function (f) {
      var dv = new Array(ndefs);
      for (var i = 0; i < ndefs; i++) dv[i] = defs[i](f);
      var kv = new Array(nkw);
      for (var j = 0; j < nkw; j++) kv[j] = kwdefs[j] ? kwdefs[j](f) : undefined;
      var cl = new Array(nclo);
      for (var k = 0; k < nclo; k++) cl[k] = clo[k](f);
      var fn = new PyFunc(code, f.g, dv, kv, cl);
      if (code.doc !== undefined) fn.doc = code.doc;
      return fn;
    };
  }
  function compileExprStmtCtx(e, cx, line) { cx.stmtLine = line; return compileExpr(e, cx); }

  function tooManyPositional(fn, given, l) {
    var code = fn.code, defcount = fn.defaults.length, sig, plural, kwonlyGiven = 0;
    for (var i = code.nargs; i < code.nargs + code.nkwonly; i++) if (l[i] !== undefined) kwonlyGiven++;
    if (defcount) { sig = 'from ' + (code.nargs - defcount) + ' to ' + code.nargs; plural = true; }
    else { sig = '' + code.nargs; plural = code.nargs !== 1; }
    var kws = kwonlyGiven ? ' positional argument' + (given !== 1 ? 's' : '') + ' (and ' + kwonlyGiven + ' keyword-only argument' + (kwonlyGiven !== 1 ? 's' : '') + ')' : '';
    return typeErr(fn.qualname + '() takes ' + sig + ' positional argument' + (plural ? 's' : '') + ' but ' + given + kws + ' ' + (given === 1 && !kwonlyGiven ? 'was' : 'were') + ' given');
  }
  function missingArgs(fn, kind, names) {
    var q = names.map(function (n) { return "'" + n + "'"; }), s;
    if (q.length === 1) s = q[0];
    else if (q.length === 2) s = q[0] + ' and ' + q[1];
    else s = q.slice(0, -2).join(', ') + ', ' + q[q.length - 2] + ', and ' + q[q.length - 1];
    return typeErr(fn.qualname + '() missing ' + q.length + ' required ' + kind + ' argument' + (q.length === 1 ? '' : 's') + ': ' + s);
  }
  function bindArgs(fn, l, args, kw) {
    var code = fn.code, nargs = code.nargs, total = nargs + code.nkwonly, argcount = args.length, i;
    var kwdict = null;
    if (code.kwargSlot >= 0) { kwdict = new PyDict(); l[code.kwargSlot] = kwdict; }
    var n = Math.min(argcount, nargs);
    for (i = 0; i < n; i++) l[i] = args[i];
    if (code.varargSlot >= 0) l[code.varargSlot] = new PyTuple(argcount > n ? args.slice(n) : []);
    if (kw !== null) {
      for (var ent of kw) {
        var key = ent[0], value = ent[1];
        var idx = code.argIndex.get(key);
        if (idx === undefined) {
          if (kwdict === null) {
            var posonly = [];
            for (i = 0; i < code.nposonly; i++) if (code.names[i] === key) posonly.push(key);
            if (posonly.length) throw typeErr(fn.qualname + '() got some positional-only arguments passed as keyword arguments: \'' + posonly.join(', ') + "'");
            var sugg = total > code.nposonly ? calcSuggestion(code.names.slice(code.nposonly, total), key) : null;
            throw typeErr(fn.qualname + "() got an unexpected keyword argument '" + key + "'" + (sugg ? ". Did you mean '" + sugg + "'?" : ''));
          }
          dictSet(kwdict, key, value);
          continue;
        }
        if (l[idx] !== undefined) throw typeErr(fn.qualname + "() got multiple values for argument '" + key + "'");
        l[idx] = value;
      }
    }
    if (argcount > nargs && code.varargSlot < 0) throw tooManyPositional(fn, argcount, l);
    if (argcount < nargs) {
      var defs = fn.defaults, defcount = defs.length, m = nargs - defcount, missing = [];
      for (i = argcount; i < m; i++) if (l[i] === undefined) missing.push(code.names[i]);
      if (missing.length) throw missingArgs(fn, 'positional', missing);
      for (i = n > m ? n - m : 0; i < defcount; i++) if (l[m + i] === undefined) l[m + i] = defs[i];
    }
    if (code.nkwonly) {
      var miss2 = [];
      for (i = nargs; i < total; i++) {
        if (l[i] !== undefined) continue;
        var d = fn.kwdefaults[i - nargs];
        if (d !== undefined) { l[i] = d; continue; }
        miss2.push(code.names[i]);
      }
      if (miss2.length) throw missingArgs(fn, 'keyword-only', miss2);
    }
  }
  function recursionError() { return pyErr(T_RecursionError, 'maximum recursion depth exceeded'); }
  function callFunc(fn, args, kw, self) {
    var code = fn.code;
    var f = new Frame(code.nlocals, fn.closure, fn.globals);
    f.fn = fn;
    var l = f.l, na = args.length, i;
    if (self !== undefined) {
      if (kw === null && code.simple && na + 1 === code.nargs) {
        l[0] = self;
        for (i = 0; i < na; i++) l[i + 1] = args[i];
      } else {
        var all = [self];
        for (i = 0; i < na; i++) all.push(args[i]);
        bindArgs(fn, l, all, kw);
      }
    } else if (kw === null && code.simple && na === code.nargs) {
      for (i = 0; i < na; i++) l[i] = args[i];
    } else bindArgs(fn, l, args, kw);
    var cs = code.cellSlots;
    for (i = 0; i < cs.length; i++) l[cs[i]] = new PyCell(l[cs[i]]);
    if (depth >= RECURSION_LIMIT) throw recursionError();
    depth++;
    var saved = curLine;
    try {
      code.body(f);
      return f.rv;
    } finally {
      depth--;
      curLine = saved;
    }
  }

  // ---- Compréhensions et expressions génératrices ----
  function compileComp(e, cx) {
    var sc = e.scope;
    var ccx = new Cx(sc, cx);
    ccx.stmtLine = cx.stmtLine;
    var first = compileExpr(e.gens[0].iter, cx);
    var gens = e.gens.map(function (g, i) {
      return {
        iter: i === 0 ? null : compileExpr(g.iter, ccx),
        store: compileTarget(g.target, ccx),
        ifs: g.ifs.map(function (x) { return compileExpr(x, ccx); })
      };
    });
    var clo = sc.free.map(function (n) { return cellRef(cx, n); });
    var nclo = clo.length, nl = sc.nslots;
    var cs = [];
    sc.cells.forEach(function (n) { if (n !== '.0') cs.push(sc.slots.get(n)); });
    var kind = e.k;
    var elt = kind === 'DictComp' ? null : compileExpr(e.elt, ccx);
    var key = kind === 'DictComp' ? compileExpr(e.key, ccx) : null;
    var val = kind === 'DictComp' ? compileExpr(e.val, ccx) : null;
    var ng = gens.length;
    var line = e.line;
    function makeFrame(f) {
      var cl = new Array(nclo);
      for (var k = 0; k < nclo; k++) cl[k] = clo[k](f);
      var cf = new Frame(nl, cl, f.g);
      for (var c = 0; c < cs.length; c++) cf.l[cs[c]] = new PyCell(undefined);
      return cf;
    }
    if (kind === 'GenExp') {
      return function (f) {
        var it0 = getIter(first(f));
        var cf = makeFrame(f);
        return new GenExpIter(cf, it0, gens, elt, line);
      };
    }
    return function (f) {
      var it0 = getIter(first(f));
      var cf = makeFrame(f);
      var res = kind === 'ListComp' ? [] : kind === 'SetComp' ? new PySet() : new PyDict();
      var its = new Array(ng);
      its[0] = it0;
      var lvl = 0, v;
      for (;;) {
        v = its[lvl].nx();
        if (v === undefined) { if (lvl === 0) break; lvl--; continue; }
        if (++steps > nextCheck) checkLimits();
        var g = gens[lvl];
        g.store(cf, v);
        var ok = true;
        for (var q = 0; q < g.ifs.length; q++) if (!truthy(g.ifs[q](cf))) { ok = false; break; }
        if (!ok) continue;
        if (lvl < ng - 1) { lvl++; its[lvl] = getIter(gens[lvl].iter(cf)); continue; }
        if (kind === 'ListComp') res.push(elt(cf));
        else if (kind === 'SetComp') setAddKey(res, elt(cf));
        else { var kk = key(cf); dictSet(res, kk, val(cf)); }
      }
      return kind === 'ListComp' ? new PyList(res) : res;
    };
  }
  // Expression génératrice : itérateur paresseux
  function GenExpIter(cf, it0, gens, elt, line) {
    this.cf = cf; this.its = [it0]; this.gens = gens; this.elt = elt; this.lvl = 0; this.done = false; this.line = line; this.running = false;
  }

  // ---- Cibles d'affectation ----
  function compileTarget(t, cx) {
    switch (t.k) {
      case 'Name': return compileStoreName(cx, t.id);
      case 'Attr': {
        var o = compileExpr(t.e, cx), name = t.name;
        return function (f, v) { setAttr(o(f), name, v); };
      }
      case 'Sub': {
        var so = compileExpr(t.e, cx), si = compileSubscript(t.idx, cx);
        return function (f, v) {
          var obj = so(f), k = si(f);
          if (obj instanceof PyList && typeof k === 'bigint') {
            var a = obj.a, i = Number(k);
            if (i < 0) i += a.length;
            if (i >= 0 && i < a.length) { a[i] = v; return; }
            throw pyErr(T_IndexError, 'list assignment index out of range');
          }
          setItem(obj, k, v);
        };
      }
      case 'Tuple': case 'List': {
        var starAt = -1;
        var subs = t.elts.map(function (x, i) {
          if (x.k === 'Starred') { starAt = i; return compileTarget(x.e, cx); }
          return compileTarget(x, cx);
        });
        var n = subs.length;
        return function (f, v) {
          var arr = unpackValues(v, n, starAt);
          for (var i = 0; i < n; i++) subs[i](f, arr[i]);
        };
      }
      case 'Starred': return compileTarget(t.e, cx);
    }
    throw new PySyntaxError('SyntaxError', 'cannot assign to ' + exprName(t), t.line);
  }
  function unpackValues(v, n, starAt) {
    var arr;
    if (v instanceof PyList || v instanceof PyTuple) arr = v.a;
    else if (typeof v === 'string') arr = strChars(v);
    else {
      if (!iterableish(v) && !(typeof v === 'object' && v.nx)) throw typeErr('cannot unpack non-iterable ' + tname(v) + ' object');
      var it = getIter(v), x;
      arr = [];
      if (starAt < 0) {
        while (arr.length <= n && (x = it.nx()) !== undefined) arr.push(x);
      } else {
        while ((x = it.nx()) !== undefined) arr.push(x);
      }
    }
    if (starAt < 0) {
      if (arr.length > n) throw valueErr('too many values to unpack (expected ' + n + ')');
      if (arr.length < n) throw valueErr('not enough values to unpack (expected ' + n + ', got ' + arr.length + ')');
      return arr;
    }
    var need = n - 1;
    if (arr.length < need) throw valueErr('not enough values to unpack (expected at least ' + need + ', got ' + arr.length + ')');
    var res = arr.slice(0, starAt);
    var after = n - starAt - 1;
    res.push(new PyList(arr.slice(starAt, arr.length - after)));
    for (var i = arr.length - after; i < arr.length; i++) res.push(arr[i]);
    return res;
  }
  function compileDelTarget(t, cx) {
    switch (t.k) {
      case 'Name': return compileDelName(cx, t.id);
      case 'Attr': { var o = compileExpr(t.e, cx), name = t.name; return function (f) { delAttr(o(f), name); }; }
      case 'Sub': { var so = compileExpr(t.e, cx), si = compileSubscript(t.idx, cx); return function (f) { var obj = so(f); delItem(obj, si(f)); }; }
      case 'Tuple': case 'List': {
        var subs = t.elts.map(function (x) { return compileDelTarget(x, cx); });
        return function (f) { for (var i = 0; i < subs.length; i++) subs[i](f); };
      }
    }
    throw new PySyntaxError('SyntaxError', 'cannot delete ' + exprName(t), t.line);
  }

  // ---- Instructions ----
  function compileBlock(stmts, cx) {
    var fns = [];
    for (var i = 0; i < stmts.length; i++) fns.push(compileStmt(stmts[i], cx));
    var n = fns.length;
    if (n === 0) return function () { return undefined; };
    if (n === 1) return fns[0];
    if (n === 2) { var a = fns[0], b = fns[1]; return function (f) { var r = a(f); if (r !== undefined) return r; return b(f); }; }
    return function (f) {
      for (var i = 0; i < n; i++) { var r = fns[i](f); if (r !== undefined) return r; }
      return undefined;
    };
  }

  // Convertit une erreur JavaScript en exception Python (ou relance les signaux d'arrêt)
  function toPyExc(e) {
    if (e instanceof PyInst) return e;
    if (e instanceof LimitSignal) throw e;
    if (e instanceof RangeError) {
      var x = /call stack/i.test(e.message) ? recursionError() : pyErr(T_MemoryError);
      return x;
    }
    if (e instanceof PySyntaxError) return syntaxExc(e);
    throw e;
  }
  function syntaxExc(se) {
    var cls = se.type === 'IndentationError' ? T_IndentationError : se.type === 'TabError' ? T_TabError : T_SyntaxError;
    var x = newExc(cls, [se.msg]);
    x.d.set('msg', se.msg); x.d.set('lineno', BigInt(se.line || 0)); x.d.set('filename', '<string>');
    x.$line = se.line;
    return x;
  }
  function excMatches(exc, t) {
    if (t instanceof PyType) {
      if (!t.isExc) throw typeErr('catching classes that do not inherit from BaseException is not allowed');
      return isinst(exc, t);
    }
    if (t instanceof PyTuple) {
      for (var i = 0; i < t.a.length; i++) if (excMatches(exc, t.a[i])) return true;
      return false;
    }
    throw typeErr('catching classes that do not inherit from BaseException is not allowed');
  }

  function compileStmt(s, cx) {
    cx.stmtLine = s.line;
    var line = s.line;
    switch (s.k) {
      case 'Expr': {
        var ef = compileExpr(s.e, cx);
        return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); ef(f); };
      }
      case 'Pass': return function () { curLine = line; if (++steps > nextCheck) checkLimits(); };
      case 'Assign': {
        var vf = compileExpr(s.v, cx);
        if (s.targets.length === 1 && s.targets[0].k === 'Name') {
          var r = nameRef(cx, s.targets[0].id);
          if (r.k === 'L') {
            var li = r.i;
            return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); f.l[li] = vf(f); };
          }
          var st0 = compileStoreName(cx, s.targets[0].id);
          return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); st0(f, vf(f)); };
        }
        var tfs = s.targets.map(function (t) { return compileTarget(t, cx); });
        var nt = tfs.length;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          var v = vf(f);
          for (var i = 0; i < nt; i++) tfs[i](f, v);
        };
      }
      case 'AnnAssign': {
        if (!s.v) return function () { curLine = line; if (++steps > nextCheck) checkLimits(); };
        var av = compileExpr(s.v, cx), at = compileTarget(s.t, cx);
        return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); at(f, av(f)); };
      }
      case 'AugAssign': return compileAugAssign(s, cx);
      case 'Return': {
        if (!cx.inFunc) throw new PySyntaxError('SyntaxError', "'return' outside function", line);
        if (!s.v) return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); f.rv = None; return RETURN; };
        var rf = compileExpr(s.v, cx);
        return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); f.rv = rf(f); return RETURN; };
      }
      case 'Break':
        if (!cx.loop) throw new PySyntaxError('SyntaxError', "'break' outside loop", line);
        return function () { curLine = line; if (++steps > nextCheck) checkLimits(); return BREAK; };
      case 'Continue':
        if (!cx.loop) throw new PySyntaxError('SyntaxError', "'continue' not properly in loop", line);
        return function () { curLine = line; if (++steps > nextCheck) checkLimits(); return CONTINUE; };
      case 'If': {
        var tf = compileExpr(s.test, cx);
        var bf = compileBlock(s.body, cx);
        var of = s.orelse.length ? compileBlock(s.orelse, cx) : null;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          var t = tf(f);
          if (t === true || (t !== false && truthy(t))) return bf(f);
          if (of !== null) return of(f);
        };
      }
      case 'While': {
        var wt = compileExpr(s.test, cx);
        cx.loop++;
        var wb = compileBlock(s.body, cx);
        cx.loop--;
        var wo = s.orelse.length ? compileBlock(s.orelse, cx) : null;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          for (;;) {
            curLine = line;
            var t = wt(f);
            if (!(t === true || (t !== false && truthy(t)))) break;
            var r = wb(f);
            if (r !== undefined) {
              if (r === BREAK) return undefined;
              if (r === CONTINUE) continue;
              return r;
            }
            if (++steps > nextCheck) checkLimits();
          }
          if (wo !== null) return wo(f);
        };
      }
      case 'For': return compileFor(s, cx);
      case 'Try': return compileTry(s, cx);
      case 'With': return compileWith(s, cx);
      case 'Raise': {
        var xf = s.exc ? compileExpr(s.exc, cx) : null, cf = s.cause ? compileExpr(s.cause, cx) : null;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          if (xf === null) {
            var cur = handledStack[handledStack.length - 1];
            if (!cur) throw pyErr(T_RuntimeError, 'No active exception to reraise');
            throw cur;
          }
          var exc = makeExcToRaise(xf(f));
          if (cf !== null) {
            var c = cf(f);
            if (c instanceof PyType && c.isExc) c = callAny(c, []);
            if (c !== None && !(c instanceof PyInst && c.cls.isExc)) throw typeErr('exception causes must derive from BaseException');
            exc.d.set('__cause__', c);
          }
          if (!exc.$raised) { exc.$raised = true; exc.$line = curLine; exc.$depth = depth; exc.$claimed = false; }
          throw exc;
        };
      }
      case 'Global': case 'Nonlocal': return function () { curLine = line; if (++steps > nextCheck) checkLimits(); };
      case 'Del': {
        var dfs = s.targets.map(function (t) { return compileDelTarget(t, cx); });
        return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); for (var i = 0; i < dfs.length; i++) dfs[i](f); };
      }
      case 'Assert': {
        var atf = compileExpr(s.test, cx), amf = s.msg ? compileExpr(s.msg, cx) : null;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          if (!truthy(atf(f))) throw amf ? newExc(T_AssertionError, [amf(f)]) : newExc(T_AssertionError, []);
        };
      }
      case 'Import': {
        var items = s.names.map(function (nm) {
          var top = nm.name.split('.')[0];
          return { name: nm.name, store: compileStoreName(cx, nm.as || top), as: nm.as };
        });
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var mod = importModule(it.name);
            if (it.as || it.name.indexOf('.') < 0) it.store(f, mod);
            else it.store(f, importModule(it.name.split('.')[0]));
          }
        };
      }
      case 'ImportFrom': {
        if (s.level > 0) return function () { curLine = line; throw pyErr(T_ImportError, 'attempted relative import with no known parent package'); };
        var star = s.names.length === 1 && s.names[0].name === '*';
        var nms = star ? [] : s.names.map(function (nm) { return { name: nm.name, store: compileStoreName(cx, nm.as || nm.name) }; });
        var modName = s.mod;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          var mod = importModule(modName);
          if (star) {
            mod.d.forEach(function (v, k) { if (k[0] !== '_') f.g.set(k, v); });
            return;
          }
          for (var i = 0; i < nms.length; i++) {
            var v = mod.d.get(nms[i].name);
            if (v === undefined && modules.has(modName + '.' + nms[i].name)) v = modules.get(modName + '.' + nms[i].name);
            if (v === undefined) {
              var e = pyErr(T_ImportError, "cannot import name '" + nms[i].name + "' from '" + modName + "' (unknown location)");
              e.d.set('name', modName); e.d.set('name_from', nms[i].name); e.$module = mod;
              throw e;
            }
            nms[i].store(f, v);
          }
        };
      }
      case 'FunctionDef': {
        var mk = compileFunction(s, cx, false);
        var decos = s.decos.map(function (d) { return compileExpr(d, cx); });
        var fst = compileStoreName(cx, s.name);
        cx.stmtLine = line;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          var dv = [];
          for (var i = 0; i < decos.length; i++) dv.push(decos[i](f));
          var fn = mk(f);
          for (var j = dv.length - 1; j >= 0; j--) { curLine = s.decos[j].line; fn = callAny(dv[j], [fn]); }
          fst(f, fn);
        };
      }
      case 'ClassDef': return compileClass(s, cx);
    }
    throw new PySyntaxError('SyntaxError', 'invalid syntax', line);
  }
  function makeExcToRaise(v) {
    if (v instanceof PyType && v.isExc) {
      var e = callAny(v, []);
      if (!(e instanceof PyInst && e.cls.isExc)) throw typeErr('calling ' + pyRepr(v) + ' should have returned an instance of BaseException, not ' + tname(e));
      return e;
    }
    if (v instanceof PyInst && v.cls.isExc) return v;
    throw typeErr('exceptions must derive from BaseException');
  }

  function compileAugAssign(s, cx) {
    var line = s.line, op = BINOPS[s.op], vf = compileExpr(s.v, cx), t = s.t;
    function apply(a, b) {
      var ta = typeof a;
      if (ta === typeof b) {
        if (ta === 'bigint') {
          if (op === OP_ADD) return a + b;
          if (op === OP_SUB) return a - b;
          if (op === OP_MUL) return a * b;
        } else if (ta === 'number') {
          if (op === OP_ADD) return a + b;
          if (op === OP_SUB) return a - b;
          if (op === OP_MUL) return a * b;
        } else if (ta === 'string' && op === OP_ADD) return a + b;
      }
      return inplaceOp(op, a, b);
    }
    if (t.k === 'Name') {
      var r = nameRef(cx, t.id);
      if (r.k === 'L') {
        var li = r.i, id = t.id;
        return function (f) {
          curLine = line; if (++steps > nextCheck) checkLimits();
          var a = f.l[li];
          if (a === undefined) throw unboundLocal(id);
          f.l[li] = apply(a, vf(f));
        };
      }
      var ld = compileLoad(cx, t.id), stn = compileStoreName(cx, t.id);
      return function (f) { curLine = line; if (++steps > nextCheck) checkLimits(); var a = ld(f); stn(f, apply(a, vf(f))); };
    }
    if (t.k === 'Attr') {
      var of = compileExpr(t.e, cx), name = t.name;
      return function (f) {
        curLine = line; if (++steps > nextCheck) checkLimits();
        var o = of(f), a = getAttr(o, name);
        setAttr(o, name, apply(a, vf(f)));
      };
    }
    var sf = compileExpr(t.e, cx), kf = compileSubscript(t.idx, cx);
    return function (f) {
      curLine = line; if (++steps > nextCheck) checkLimits();
      var o = sf(f), k = kf(f), a = getItem(o, k);
      setItem(o, k, apply(a, vf(f)));
    };
  }

  function compileFor(s, cx) {
    var line = s.line;
    var itf = compileExpr(s.iter, cx);
    var tgt = compileTarget(s.target, cx);
    var fastSlot = -1;
    if (s.target.k === 'Name') { var r = nameRef(cx, s.target.id); if (r.k === 'L') fastSlot = r.i; }
    cx.loop++;
    var body = compileBlock(s.body, cx);
    cx.loop--;
    var orelse = s.orelse.length ? compileBlock(s.orelse, cx) : null;
    return function (f) {
      curLine = line; if (++steps > nextCheck) checkLimits();
      var it = itf(f), r;
      if (it instanceof PyRange && fastSlot >= 0) {
        var st = it.step, stop = it.stop, l = f.l;
        for (var v = it.start; st > 0n ? v < stop : v > stop; v += st) {
          l[fastSlot] = v;
          r = body(f);
          if (r !== undefined) {
            if (r === BREAK) return undefined;
            if (r === CONTINUE) continue;
            return r;
          }
        }
      } else if (it instanceof PyList || it instanceof PyTuple) {
        var a = it.a;
        for (var i = 0; i < a.length; i++) {
          if (fastSlot >= 0) f.l[fastSlot] = a[i]; else { curLine = line; tgt(f, a[i]); }
          r = body(f);
          if (r !== undefined) {
            if (r === BREAK) return undefined;
            if (r === CONTINUE) continue;
            return r;
          }
        }
      } else {
        var iter = getIter(it), x;
        for (;;) {
          curLine = line;
          x = iter.nx();
          if (x === undefined) break;
          tgt(f, x);
          r = body(f);
          if (r !== undefined) {
            if (r === BREAK) return undefined;
            if (r === CONTINUE) continue;
            return r;
          }
        }
      }
      if (orelse !== null) return orelse(f);
    };
  }

  function compileTry(s, cx) {
    var line = s.line;
    var body = compileBlock(s.body, cx);
    var handlers = s.handlers.map(function (h) {
      return {
        type: h.type ? compileExpr(h.type, cx) : null,
        store: h.name ? compileStoreName(cx, h.name) : null,
        unbind: h.name ? compileDelName(cx, h.name) : null,
        body: compileBlock(h.body, cx),
        line: h.line
      };
    });
    var orelse = s.orelse.length ? compileBlock(s.orelse, cx) : null;
    var fin = s.finalbody.length ? compileBlock(s.finalbody, cx) : null;
    var nh = handlers.length;
    function handle(f, e) {
      var exc = toPyExc(e);
      for (var i = 0; i < nh; i++) {
        var h = handlers[i];
        curLine = h.line;
        if (h.type === null || excMatches(exc, h.type(f))) {
          if (h.store) h.store(f, exc);
          handledStack.push(exc);
          try {
            return h.body(f);
          } finally {
            handledStack.pop();
            if (h.store) { try { h.unbind(f); } catch (ignore) { /* déjà supprimée */ } }
          }
        }
      }
      throw exc;
    }
    return function (f) {
      curLine = line; if (++steps > nextCheck) checkLimits();
      if (fin === null) {
        var st, ok = false;
        try { st = body(f); ok = true; } catch (e) {
          if (e instanceof LimitSignal) throw e;
          return handle(f, e);
        }
        if (ok && st === undefined && orelse !== null) return orelse(f);
        return st;
      }
      var st2, err = null, failed = false;
      try {
        var ok2 = false;
        try { st2 = body(f); ok2 = true; } catch (e1) {
          if (e1 instanceof LimitSignal || nh === 0) throw e1;
          st2 = handle(f, e1);
        }
        if (ok2 && st2 === undefined && orelse !== null) st2 = orelse(f);
      } catch (e2) {
        if (e2 instanceof LimitSignal) throw e2;
        err = e2; failed = true;
      }
      if (failed && !(err instanceof PyInst)) {
        try { err = toPyExc(err); } catch (e3) { throw e3; }
      }
      if (failed) handledStack.push(err);
      var fs;
      try { fs = fin(f); } finally { if (failed) handledStack.pop(); }
      if (fs !== undefined) return fs;
      if (failed) throw err;
      return st2;
    };
  }

  function compileWith(s, cx) {
    var line = s.line;
    var items = s.items.map(function (it) { return { e: compileExpr(it.e, cx), store: it.vars ? compileTarget(it.vars, cx) : null }; });
    var body = compileBlock(s.body, cx);
    function run(f, k) {
      if (k >= items.length) return body(f);
      var mgr = items[k].e(f);
      var t = typeOf(mgr);
      var enter = lookup(t, '__enter__'), exit = lookup(t, '__exit__');
      if (enter === undefined) throw typeErr("'" + t.name + "' object does not support the context manager protocol");
      if (exit === undefined) throw typeErr("'" + t.name + "' object does not support the context manager protocol (missed __exit__ method)");
      var val = callAny(bindAttr(enter, mgr, t), []);
      var exitB = bindAttr(exit, mgr, t);
      if (items[k].store) items[k].store(f, val);
      var st;
      try {
        st = run(f, k + 1);
      } catch (e) {
        if (e instanceof LimitSignal) throw e;
        var exc = toPyExc(e);
        handledStack.push(exc);
        var r;
        try { r = callAny(exitB, [exc.cls, exc, None]); } finally { handledStack.pop(); }
        if (truthy(r)) return undefined;
        throw exc;
      }
      callAny(exitB, [None, None, None]);
      return st;
    }
    return function (f) {
      curLine = line; if (++steps > nextCheck) checkLimits();
      return run(f, 0);
    };
  }

  function compileClass(s, cx) {
    var line = s.line, sc = s.scope;
    if (sc.classCell) sc.slot('__class__');
    var ccx = new Cx(sc, cx);
    var body = compileBlock(s.body, ccx);
    cx.stmtLine = line;
    var bases = s.bases.map(function (b) { return compileExpr(b, cx); });
    var kws = s.kws.map(function (k) { return { name: k.name, f: compileExpr(k.v, cx) }; });
    var decos = s.decos.map(function (d) { return compileExpr(d, cx); });
    var clo = sc.free.map(function (n) { return cellRef(cx, n); });
    var store = compileStoreName(cx, s.name);
    var cellSlot = sc.classCell ? sc.slots.get('__class__') : -1;
    var doc = (s.body.length && s.body[0].k === 'Expr' && s.body[0].e.k === 'Const' && typeof s.body[0].e.v === 'string') ? s.body[0].e.v : undefined;
    return function (f) {
      curLine = line; if (++steps > nextCheck) checkLimits();
      var dv = decos.map(function (d) { return d(f); });
      var bv = bases.map(function (b) { return b(f); });
      for (var q = 0; q < kws.length; q++) {
        var kv = kws[q].f(f);
        if (kws[q].name !== 'metaclass') throw typeErr(s.name + '.__init_subclass__() takes no keyword arguments');
        void kv;
      }
      var cf = new Frame(sc.nslots, clo.map(function (c) { return c(f); }), f.g);
      cf.ns = new Map();
      cf.ns.set('__module__', '__main__');
      cf.ns.set('__qualname__', sc.qualname);
      if (doc !== undefined) cf.ns.set('__doc__', doc);
      if (cellSlot >= 0) cf.l[cellSlot] = new PyCell(undefined);
      if (depth >= RECURSION_LIMIT) throw recursionError();
      depth++;
      try { body(cf); } finally { depth--; curLine = line; }
      var cls = makeClass(s.name, bv, cf.ns, sc.qualname);
      if (cellSlot >= 0) cf.l[cellSlot].v = cls;
      var res = cls;
      for (var i = dv.length - 1; i >= 0; i--) res = callAny(dv[i], [res]);
      store(f, res);
    };
  }

  // Compile un module (ou du code de test) : renvoie la fonction à exécuter
  function compileModule(src) {
    var ast = parse(src, 0);
    var mod = buildScopes(ast);
    var cx = new Cx(mod, null);
    var body = compileBlock(ast, cx);
    return { body: body, scope: mod };
  }

  // =====================================================================================================
  // 8. Comportement des objets, types natifs et leurs méthodes
  // =====================================================================================================
  function PyObjBase() {}
  var OB = PyObjBase.prototype;
  OB.$repr = function () { return '<' + this.cls.name + ' object at ' + addr(this) + '>'; };
  OB.$str = function () { return this.$repr(); };
  OB.$bool = function () { return true; };
  OB.$len = function () { return undefined; };
  OB.$iter = function () { throw typeErr("'" + this.cls.name + "' object is not iterable"); };
  OB.$contains = function (x) {
    if (this.$iter !== OB.$iter) return containsByIter(this, x);
    throw typeErr("argument of type '" + this.cls.name + "' is not iterable");
  };
  OB.$getitem = function () { throw typeErr("'" + this.cls.name + "' object is not subscriptable"); };
  OB.$setitem = function () { throw typeErr("'" + this.cls.name + "' object does not support item assignment"); };
  OB.$delitem = function () { throw typeErr("'" + this.cls.name + "' object doesn't support item deletion"); };
  OB.$getattr = function (name) {
    var t = this.cls;
    var v = lookup(t, name);
    if (v !== undefined) return bindAttr(v, this, t);
    if (t.getters) { for (var i = 0; i < t.mro.length; i++) { var g = t.mro[i].getters; if (g && hasOwn(g, name)) return g[name](this); } }
    if (name === '__class__') return t;
    if (name === '__doc__') return None;
    throw attrErr(this, name);
  };
  OB.$setattr = function (name) {
    var t = this.cls;
    throw attrErr(this, name, "'" + t.name + "' object has no attribute '" + name + "' and no __dict__ for setting new attributes");
  };
  OB.$delattr = function (name) { return this.$setattr(name); };
  OB.$hkey = function () { return this; };
  OB.$hash = function () { return Math.floor(objId(this) / 16); };
  OB.$call = null;
  OB.$cmp = null;

  var protoList = [PyNoneT, PyNotImplT, PyEllipsisT, PyList, PyTuple, PyDict, PyRange, PySlice, PyCell, PyModule, PyInst,
    PyFunc, PyMethod, PyBuiltin, PyMethodDescr, PyProperty, PyStaticMethod, PyClassMethod, PySuper, PyType, PySet, GenExpIter];
  for (var pi = 0; pi < protoList.length; pi++) Object.setPrototypeOf(protoList[pi].prototype, OB);

  // Itérateurs natifs
  function ListIter(seq, cls) { this.s = seq; this.i = 0; this.cls = cls; }
  ListIter.prototype.nx = function () {
    var s = this.s;
    if (s !== null) { var a = s.a; if (this.i < a.length) return a[this.i++]; this.s = null; }
    return undefined;
  };
  function RevListIter(seq) { this.s = seq; this.i = seq.a.length - 1; }
  RevListIter.prototype.nx = function () {
    var s = this.s;
    if (s !== null) { var a = s.a; if (this.i >= 0 && this.i < a.length) return a[this.i--]; this.s = null; }
    return undefined;
  };
  function StrIter(s) { this.s = s; this.i = 0; this.astral = isAstral(s); }
  StrIter.prototype.nx = function () {
    var s = this.s;
    if (this.i >= s.length) return undefined;
    if (!this.astral) return s[this.i++];
    var cp = s.codePointAt(this.i), ch = String.fromCodePoint(cp);
    this.i += ch.length;
    return ch;
  };
  function RangeIter(start, stop, step) { this.v = start; this.stop = stop; this.step = step; }
  RangeIter.prototype.nx = function () {
    var v = this.v;
    if (this.step > 0n ? v < this.stop : v > this.stop) { this.v = v + this.step; return v; }
    return undefined;
  };
  function DictIter(d, kind) { this.d = d; this.it = d.m.values(); this.size = d.m.size; this.kind = kind; this.done = false; }
  DictIter.prototype.nx = function () {
    if (this.done) return undefined;
    if (this.d.m.size !== this.size) { this.done = true; throw pyErr(T_RuntimeError, 'dictionary changed size during iteration'); }
    var r = this.it.next();
    if (r.done) { this.done = true; return undefined; }
    var e = r.value;
    return this.kind === 0 ? e[0] : this.kind === 1 ? e[1] : new PyTuple([e[0], e[1]]);
  };
  function SetIter(s) { this.s = s; this.i = 0; this.used = s.used; }
  SetIter.prototype.nx = function () {
    var s = this.s;
    if (s === null) return undefined;
    if (s.used !== this.used) { this.s = null; throw pyErr(T_RuntimeError, 'Set changed size during iteration'); }
    var keys = s.keys;
    while (this.i <= s.mask) {
      var k = keys[this.i++];
      if (k !== undefined && k !== DUMMY) return k;
    }
    this.s = null;
    return undefined;
  };
  // itérateur générique : fonction nx fournie
  function FnIter(cls, nx) { this.cls = cls; this.nx = nx; }
  // adaptateur pour un itérateur écrit en Python (__next__)
  function UserIter(obj, nextFn) { this.o = obj; this.f = nextFn; this.cls = obj.cls; }
  UserIter.prototype.nx = function () {
    try {
      return callDunder(this.o, this.f, []);
    } catch (e) {
      if (e instanceof PyInst && isinst(e, T_StopIteration)) return undefined;
      throw e;
    }
  };
  // protocole de séquence (__getitem__ avec 0, 1, 2…)
  function SeqIter(obj, gi) { this.o = obj; this.f = gi; this.i = 0; this.done = false; this.cls = T_iterator; }
  SeqIter.prototype.nx = function () {
    if (this.done) return undefined;
    try {
      return callDunder(this.o, this.f, [BigInt(this.i++)]);
    } catch (e) {
      if (e instanceof PyInst && (isinst(e, T_IndexError) || isinst(e, T_StopIteration))) { this.done = true; return undefined; }
      throw e;
    }
  };
  var iterProtos = [ListIter, RevListIter, StrIter, RangeIter, DictIter, SetIter, FnIter, UserIter, SeqIter];
  for (var ii = 0; ii < iterProtos.length; ii++) {
    Object.setPrototypeOf(iterProtos[ii].prototype, OB);
    iterProtos[ii].prototype.$iter = function () { return this; };
  }
  GenExpIter.prototype.$iter = function () { return this; };
  GenExpIter.prototype.nx = function () {
    if (this.done) return undefined;
    if (this.running) throw valueErr('generator already executing');
    if (depth >= RECURSION_LIMIT) throw recursionError();
    this.running = true;
    depth++;
    var saved = curLine;
    try {
      var its = this.its, gens = this.gens, cf = this.cf, ng = gens.length;
      for (;;) {
        curLine = this.line;
        var v = its[this.lvl].nx();
        if (v === undefined) {
          if (this.lvl === 0) { this.done = true; return undefined; }
          this.lvl--; continue;
        }
        if (++steps > nextCheck) checkLimits();
        var g = gens[this.lvl];
        g.store(cf, v);
        var ok = true;
        for (var q = 0; q < g.ifs.length; q++) if (!truthy(g.ifs[q](cf))) { ok = false; break; }
        if (!ok) continue;
        if (this.lvl < ng - 1) { this.lvl++; its[this.lvl] = getIter(gens[this.lvl].iter(cf)); continue; }
        return this.elt(cf);
      }
    } catch (e) {
      this.done = true;
      throw e;
    } finally {
      this.running = false; depth--; curLine = saved;
    }
  };
  GenExpIter.prototype.$repr = function () { return '<generator object <genexpr> at ' + addr(this) + '>'; };

  function callDunder(obj, m, args) {
    if (m instanceof PyFunc) return callFunc(m, args, null, obj);
    if (m instanceof PyMethodDescr) return m.fn(obj, args, null);
    return callAny(bindAttr(m, obj, typeOf(obj)), args);
  }
  function dunder(obj, name) { return lookup(obj.cls, name); }

  // ---- None, NotImplemented, Ellipsis ----
  PyNoneT.prototype.$repr = function () { return 'None'; };
  PyNoneT.prototype.$bool = function () { return false; };
  PyNoneT.prototype.$hash = function () { return 4238894112; };
  PyNotImplT.prototype.$repr = function () { return 'NotImplemented'; };
  PyEllipsisT.prototype.$repr = function () { return 'Ellipsis'; };

  // ---- Listes ----
  var LP = PyList.prototype;
  LP.$repr = function () { return reprSeq(this, '[', ']', this.a, false); };
  LP.$bool = function () { return this.a.length > 0; };
  LP.$len = function () { return this.a.length; };
  LP.$iter = function () { return new ListIter(this, T_list_iterator); };
  LP.$contains = function (x) { var a = this.a; for (var i = 0; i < a.length; i++) if (eqBool(a[i], x)) return true; return false; };
  LP.$hkey = function () { throw unhashable(this); };
  LP.$hash = LP.$hkey;
  LP.$getitem = function (k) {
    if (k instanceof PySlice) return new PyList(sliceArray(this.a, k));
    var i = seqIndex(k, this.a.length, 'list');
    if (i === undefined) throw typeErr('list indices must be integers or slices, not ' + tname(k));
    return this.a[i];
  };
  LP.$setitem = function (k, v) {
    var a = this.a;
    if (k instanceof PySlice) {
      var items = (v === this) ? a.slice() : toArrayForSlice(v);
      var si = sliceIndices(k, a.length);
      if (si[2] === 1) {
        var stop = Math.max(si[0], si[1]);
        a.splice.apply(a, [si[0], stop - si[0]].concat(items));
        return;
      }
      if (items.length !== si[3]) throw valueErr('attempt to assign sequence of size ' + items.length + ' to extended slice of size ' + si[3]);
      for (var i = 0, j = si[0]; i < si[3]; i++, j += si[2]) a[j] = items[i];
      return;
    }
    var idx;
    try { idx = seqIndex(k, a.length, 'list assignment'); } catch (e) { throw e; }
    if (idx === undefined) throw typeErr('list indices must be integers or slices, not ' + tname(k));
    a[idx] = v;
  };
  LP.$delitem = function (k) {
    var a = this.a;
    if (k instanceof PySlice) {
      var si = sliceIndices(k, a.length);
      if (si[2] === 1) { if (si[3] > 0) a.splice(si[0], si[3]); return; }
      var del = new Set();
      for (var i = 0, j = si[0]; i < si[3]; i++, j += si[2]) del.add(j);
      var keep = a.filter(function (x, n) { return !del.has(n); });
      a.length = 0;
      for (var q = 0; q < keep.length; q++) a.push(keep[q]);
      return;
    }
    var idx = seqIndex(k, a.length, 'list assignment');
    if (idx === undefined) throw typeErr('list indices must be integers or slices, not ' + tname(k));
    a.splice(idx, 1);
  };
  LP.$cmp = function (b, op) {
    if (!(b instanceof PyList)) return (op === '==' ? NotImplemented : op === '!=' ? NotImplemented : NotImplemented);
    return seqCmp(this.a, b.a, op);
  };
  function toArrayForSlice(v) {
    if (v instanceof PyList || v instanceof PyTuple) return v.a.slice();
    try { return toArray(v); } catch (e) {
      if (e instanceof PyInst && isinst(e, T_TypeError) && !iterableish(v)) throw typeErr('must assign iterable to extended slice');
      throw e;
    }
  }

  // ---- Tuples ----
  var TP = PyTuple.prototype;
  TP.$repr = function () { return reprSeq(this, '(', ')', this.a, true); };
  TP.$bool = function () { return this.a.length > 0; };
  TP.$len = function () { return this.a.length; };
  TP.$iter = function () { return new ListIter(this, T_tuple_iterator); };
  TP.$contains = LP.$contains;
  TP.$getitem = function (k) {
    if (k instanceof PySlice) return new PyTuple(sliceArray(this.a, k));
    var i = seqIndex(k, this.a.length, 'tuple');
    if (i === undefined) throw typeErr('tuple indices must be integers or slices, not ' + tname(k));
    return this.a[i];
  };
  TP.$cmp = function (b, op) {
    if (!(b instanceof PyTuple)) return NotImplemented;
    return seqCmp(this.a, b.a, op);
  };
  TP.$hkey = function () {
    var a = this.a, s = 't(';
    for (var i = 0; i < a.length; i++) s += keyStr(a[i]) + ',';
    return token(s + ')');
  };
  TP.$hash = function () { return hashTuple(this.a); };

  // ---- Dictionnaires ----
  var DP = PyDict.prototype;
  DP.$repr = function () {
    if (this.cls !== T_dict && this.cls.$reprDict) return this.cls.$reprDict(this);
    return reprDictBody(this);
  };
  DP.$bool = function () { return this.m.size > 0; };
  DP.$len = function () { return this.m.size; };
  DP.$iter = function () { return new FnIterDict(this, 0); };
  DP.$contains = function (k) { return this.m.has(hkey(k)); };
  DP.$hkey = function () { throw unhashable(this); };
  DP.$hash = DP.$hkey;
  DP.$getitem = function (k) {
    var e = this.m.get(hkey(k));
    if (e !== undefined) return e[1];
    if (this.cls !== T_dict) {
      var miss = this.missing ? this.missing(k) : undefined;
      if (miss !== undefined) return miss;
    }
    throw newExc(T_KeyError, [k]);
  };
  DP.$setitem = function (k, v) { dictSet(this, k, v); };
  DP.$delitem = function (k) { if (!this.m.delete(hkey(k))) throw newExc(T_KeyError, [k]); };
  DP.$cmp = function (b, op) {
    if (!(b instanceof PyDict) || (op !== '==' && op !== '!=')) return NotImplemented;
    var eq = dictEquals(this, b);
    return op === '==' ? eq : !eq;
  };
  function dictEquals(a, b) {
    if (a.m.size !== b.m.size) return false;
    for (var ent of a.m) {
      var e2 = b.m.get(ent[0]);
      if (e2 === undefined || !eqBool(ent[1][1], e2[1])) return false;
    }
    return true;
  }
  function FnIterDict(d, kind) { DictIter.call(this, d, kind); this.cls = kind === 0 ? T_dict_keyiterator : kind === 1 ? T_dict_valueiterator : T_dict_itemiterator; }
  FnIterDict.prototype = Object.create(DictIter.prototype);
  // mise à jour d'un dict depuis un autre dict, un objet « mapping » ou une suite de paires
  function mappingItems(m) {
    if (m instanceof PyDict) { var r = []; m.m.forEach(function (e) { r.push([e[0], e[1]]); }); return r; }
    var keys = toArray(callAny(getAttr(m, 'keys'), []));
    return keys.map(function (k) { return [k, getItem(m, k)]; });
  }
  function dictUpdateFrom(d, src, mappingOnly) {
    if (src instanceof PyDict) { var it = Array.from(src.m.values()); for (var i = 0; i < it.length; i++) dictSet(d, it[i][0], it[i][1]); return; }
    if (src instanceof PyInst && lookup(src.cls, 'keys')) { mappingItems(src).forEach(function (p) { dictSet(d, p[0], p[1]); }); return; }
    if (mappingOnly) throw typeErr("'" + tname(src) + "' object is not a mapping");
    var n = 0;
    iterate(src, function (item) {
      var pair;
      if (item instanceof PyList || item instanceof PyTuple) pair = item.a;
      else if (typeof item === 'string') pair = strChars(item);
      else {
        try { pair = toArray(item); } catch (e) {
          if (e instanceof PyInst && isinst(e, T_TypeError)) throw typeErr('cannot convert dictionary update sequence element #' + n + ' to a sequence');
          throw e;
        }
      }
      if (pair.length !== 2) throw valueErr('dictionary update sequence element #' + n + ' has length ' + pair.length + '; 2 is required');
      dictSet(d, pair[0], pair[1]);
      n++;
    });
  }

  // ---- Ensembles ----
  var SP = PySet.prototype;
  SP.$repr = function () {
    var fz = this instanceof PyFrozenSet;
    var name = this.cls.name;
    if (this.used === 0) return name + '()';
    if (reprActive.has(this)) return name + '(...)';
    reprActive.add(this);
    try {
      var items = setItems(this).map(pyRepr).join(', ');
      if (fz || this.cls !== T_set) return name + '({' + items + '})';
      return '{' + items + '}';
    } finally { reprActive.delete(this); }
  };
  SP.$bool = function () { return this.used > 0; };
  SP.$len = function () { return this.used; };
  SP.$iter = function () { var it = new SetIter(this); it.cls = T_set_iterator; return it; };
  SP.$contains = function (k) {
    if (k instanceof PySet && !(k instanceof PyFrozenSet)) { var fz = new PyFrozenSet(); setMerge(fz, k); k = fz; }
    return this.index.has(hkey(k));
  };
  SP.$hkey = function () {
    if (!(this instanceof PyFrozenSet)) throw unhashable(this);
    var ks = [];
    for (var i = 0; i <= this.mask; i++) { var k = this.keys[i]; if (k !== undefined && k !== DUMMY) ks.push(keyStr(k)); }
    ks.sort();
    return token('fz{' + ks.join(',') + '}');
  };
  SP.$hash = function () { if (!(this instanceof PyFrozenSet)) throw unhashable(this); return frozensetHash(this); };
  SP.$cmp = function (b, op) {
    if (!(b instanceof PySet)) return NotImplemented;
    switch (op) {
      case '==': return this.used === b.used && setIsSubset(this, b);
      case '!=': return !(this.used === b.used && setIsSubset(this, b));
      case '<=': return setIsSubset(this, b);
      case '<': return this.used < b.used && setIsSubset(this, b);
      case '>=': return setIsSubset(b, this);
      case '>': return this.used > b.used && setIsSubset(b, this);
    }
  };

  // ---- range ----
  var RP = PyRange.prototype;
  function rangeLen(r) {
    var st = r.step, n;
    if (st > 0n) n = r.start < r.stop ? (r.stop - r.start - 1n) / st + 1n : 0n;
    else n = r.start > r.stop ? (r.start - r.stop - 1n) / (-st) + 1n : 0n;
    return n;
  }
  RP.$repr = function () { return 'range(' + intToStr(this.start) + ', ' + intToStr(this.stop) + (this.step !== 1n ? ', ' + intToStr(this.step) : '') + ')'; };
  RP.$bool = function () { return rangeLen(this) > 0n; };
  RP.$len = function () {
    var n = rangeLen(this);
    if (n > 9223372036854775807n) throw pyErr(T_OverflowError, 'Python int too large to convert to C ssize_t');
    return Number(n);
  };
  RP.$iter = function () { var it = new RangeIter(this.start, this.stop, this.step); it.cls = T_range_iterator; return it; };
  RP.$contains = function (x) {
    if (typeof x === 'bigint' || typeof x === 'boolean') {
      var v = toBig(x);
      if (this.step > 0n ? (v < this.start || v >= this.stop) : (v > this.start || v <= this.stop)) return false;
      return (v - this.start) % this.step === 0n;
    }
    return containsByIter(this, x);
  };
  RP.$getitem = function (k) {
    var n = rangeLen(this);
    if (k instanceof PySlice) {
      var si = sliceIndices(k, Number(n));
      var st = this.start + BigInt(si[0]) * this.step;
      var stepN = this.step * BigInt(si[2]);
      return new PyRange(st, st + BigInt(si[3]) * stepN, stepN);
    }
    if (!(typeof k === 'bigint' || typeof k === 'boolean' || (k instanceof PyInst && lookup(k.cls, '__index__')))) {
      throw typeErr('range indices must be integers or slices, not ' + tname(k));
    }
    var i = asIndex(k);
    if (i < 0n) i += n;
    if (i < 0n || i >= n) throw pyErr(T_IndexError, 'range object index out of range');
    return this.start + i * this.step;
  };
  RP.$cmp = function (b, op) {
    if (!(b instanceof PyRange) || (op !== '==' && op !== '!=')) return NotImplemented;
    var na = rangeLen(this), nb = rangeLen(b), eq;
    if (na !== nb) eq = false;
    else if (na === 0n) eq = true;
    else if (this.start !== b.start) eq = false;
    else if (na === 1n) eq = true;
    else eq = this.step === b.step;
    return op === '==' ? eq : !eq;
  };
  RP.$hkey = function () { return token('r(' + this.start + ',' + this.stop + ',' + this.step + ')'); };
  RP.$hash = function () { return hashTuple([this.start, this.stop, this.step]); };

  // ---- slice ----
  PySlice.prototype.$repr = function () { return 'slice(' + pyRepr(this.start) + ', ' + pyRepr(this.stop) + ', ' + pyRepr(this.step) + ')'; };
  PySlice.prototype.$cmp = function (b, op) {
    if (!(b instanceof PySlice)) return NotImplemented;
    return seqCmp([this.start, this.stop, this.step], [b.start, b.stop, b.step], op);
  };

  // ---- Modules ----
  PyModule.prototype.$repr = function () { return "<module '" + this.name + "' (built-in)>"; };
  PyModule.prototype.$getattr = function (name) {
    var v = this.d.get(name);
    if (v !== undefined) return v;
    if (name === '__name__') return this.name;
    if (name === '__dict__') { var dd = new PyDict(); this.d.forEach(function (val, k) { dictSet(dd, k, val); }); return dd; }
    var e = attrErr(this, name, "module '" + this.name + "' has no attribute '" + name + "'");
    throw e;
  };
  PyModule.prototype.$setattr = function (name, v) { this.d.set(name, v); };
  PyModule.prototype.$delattr = function (name) { if (!this.d.delete(name)) throw attrErr(this, name, "module '" + this.name + "' has no attribute '" + name + "'"); };

  // ---- Fonctions et méthodes ----
  var FP = PyFunc.prototype;
  FP.$repr = function () { return '<function ' + this.qualname + ' at ' + addr(this) + '>'; };
  FP.$call = function (args, kw) { return callFunc(this, args, kw, undefined); };
  FP.$getattr = function (name) {
    switch (name) {
      case '__name__': return this.name;
      case '__qualname__': return this.qualname;
      case '__doc__': return this.doc;
      case '__module__': return '__main__';
      case '__defaults__': return this.defaults.length ? new PyTuple(this.defaults.slice()) : None;
      case '__dict__': { var dd = new PyDict(); if (this.d) this.d.forEach(function (v, k) { dictSet(dd, k, v); }); return dd; }
      case '__class__': return T_function;
      case '__code__': return None;
      case '__wrapped__': if (this.d && this.d.has(name)) return this.d.get(name); break;
    }
    if (this.d && this.d.has(name)) return this.d.get(name);
    var v = lookup(T_function, name);
    if (v !== undefined) return bindAttr(v, this, T_function);
    throw attrErr(this, name);
  };
  FP.$setattr = function (name, v) {
    if (name === '__name__') { this.name = v; return; }
    if (name === '__qualname__') { this.qualname = v; return; }
    if (name === '__doc__') { this.doc = v; return; }
    if (name === '__defaults__') { this.defaults = v === None ? [] : v.a.slice(); return; }
    if (!this.d) this.d = new Map();
    this.d.set(name, v);
  };
  var MP = PyMethod.prototype;
  MP.$repr = function () { return '<bound method ' + (this.func.qualname || this.func.name) + ' of ' + pyRepr(this.self) + '>'; };
  MP.$call = function (args, kw) {
    if (this.func instanceof PyFunc) return callFunc(this.func, args, kw, this.self);
    return callAny(this.func, [this.self].concat(args), kw);
  };
  MP.$getattr = function (name) {
    if (name === '__self__') return this.self;
    if (name === '__func__') return this.func;
    if (name === '__name__' || name === '__qualname__' || name === '__doc__') return getAttr(this.func, name);
    if (name === '__class__') return T_method;
    return getAttr(this.func, name);
  };
  MP.$cmp = function (b, op) {
    if (!(b instanceof PyMethod) || (op !== '==' && op !== '!=')) return NotImplemented;
    var eq = this.func === b.func && this.self === b.self;
    return op === '==' ? eq : !eq;
  };
  MP.$hkey = function () { return token('m' + objId(this.func) + ':' + keyStr(this.self)); };
  var BP = PyBuiltin.prototype;
  BP.$repr = function () {
    if (this.self !== undefined && this.self !== null) {
      if (this.self instanceof PyModule) return '<built-in function ' + this.name + '>';
      return '<built-in method ' + this.name + ' of ' + tname(this.self) + ' object at ' + addr(this.self) + '>';
    }
    return '<built-in function ' + this.name + '>';
  };
  BP.$call = function (args, kw) {
    if (this.self !== undefined) return this.fn(this.self, args, kw);
    return this.fn(args, kw);
  };
  BP.$getattr = function (name) {
    if (name === '__name__' || name === '__qualname__') return this.name;
    if (name === '__self__') return this.self === undefined ? None : this.self;
    if (name === '__doc__') return None;
    if (name === '__class__') return T_builtin;
    if (name === '__module__') return 'builtins';
    throw attrErr(this, name);
  };
  BP.$hkey = function () { return this.self === undefined ? this : token('b' + this.name + ':' + keyStr(this.self)); };
  var MDP = PyMethodDescr.prototype;
  MDP.$repr = function () { return "<method '" + this.name + "' of '" + this.type.name + "' objects>"; };
  MDP.$call = function (args, kw) {
    if (!args.length) throw typeErr("unbound method " + this.type.name + '.' + this.name + '() needs an argument');
    var self = args[0];
    if (!isinst(self, this.type)) throw typeErr("descriptor '" + this.name + "' for '" + this.type.name + "' objects doesn't apply to a '" + tname(self) + "' object");
    return this.fn(self, args.slice(1), kw);
  };
  MDP.$getattr = function (name) {
    if (name === '__name__') return this.name;
    if (name === '__qualname__') return this.type.name + '.' + this.name;
    if (name === '__objclass__') return this.type;
    return OB.$getattr.call(this, name);
  };
  PyProperty.prototype.$getattr = function (name) {
    var p = this;
    switch (name) {
      case 'fget': return p.fget;
      case 'fset': return p.fset;
      case 'fdel': return p.fdel;
      case '__doc__': return p.doc;
      case 'setter': return new PyBuiltin('setter', function (args) { return new PyProperty(p.fget, args[0], p.fdel, p.doc); });
      case 'getter': return new PyBuiltin('getter', function (args) { return new PyProperty(args[0], p.fset, p.fdel, p.doc); });
      case 'deleter': return new PyBuiltin('deleter', function (args) { return new PyProperty(p.fget, p.fset, args[0], p.doc); });
    }
    return OB.$getattr.call(this, name);
  };
  PyStaticMethod.prototype.$call = function (args, kw) { return callAny(this.f, args, kw); };
  PyStaticMethod.prototype.$getattr = function (name) { if (name === '__func__') return this.f; return getAttr(this.f, name); };
  PyClassMethod.prototype.$getattr = function (name) { if (name === '__func__') return this.f; return getAttr(this.f, name); };
  PyCell.prototype.$repr = function () { return '<cell at ' + addr(this) + '>'; };

  // ---- super() ----
  function makeSuper(cls, obj) {
    if (!(cls instanceof PyType)) throw typeErr('super() argument 1 must be a type, not ' + tname(cls));
    var ok = obj instanceof PyType ? isSubtype(obj, cls) : isinst(obj, cls);
    if (!ok) throw typeErr('super(type, obj): obj must be an instance or subtype of type');
    return new PySuper(cls, obj);
  }
  PySuper.prototype.$repr = function () { return "<super: <class '" + this.type.name + "'>, <" + tname(this.obj) + ' object>>'; };
  PySuper.prototype.$getattr = function (name) {
    var objType = this.obj instanceof PyType ? this.obj : typeOf(this.obj);
    var mro = objType.mro;
    var i = mro.indexOf(this.type);
    for (var j = i + 1; j < mro.length; j++) {
      var v = mro[j].d.get(name);
      if (v !== undefined) {
        if (this.obj instanceof PyType) {
          if (v instanceof PyClassMethod) return new PyMethod(v.f, this.obj);
          if (v instanceof PyStaticMethod) return v.f;
          if (v instanceof PyMethodDescr && name === '__new__') return new PyBuiltin(v.name, v.fn, this.obj, v.type);
          return v;
        }
        return bindAttr(v, this.obj, objType);
      }
    }
    if (name === '__class__') return T_super;
    throw attrErr(this, name, "'super' object has no attribute '" + name + "'");
  };

  // ---- Types (classes) ----
  var TYP = PyType.prototype;
  TYP.$repr = function () {
    if (this.native && this.module === 'builtins') return "<class '" + this.name + "'>";
    return "<class '" + this.module + '.' + this.qualname + "'>";
  };
  TYP.$call = function (args, kw) {
    if (this.call) return this.call(args, kw, this);
    return newUserInstance(this, args, kw);
  };
  TYP.$getattr = function (name) {
    switch (name) {
      case '__name__': return this.name;
      case '__qualname__': return this.qualname;
      case '__module__': { var mm = this.d.get('__module__'); return mm !== undefined ? mm : this.module; }
      case '__bases__': return new PyTuple(this.bases.slice());
      case '__base__': return this.bases.length ? this.bases[0] : None;
      case '__mro__': return new PyTuple(this.mro.slice());
      case '__class__': return T_type;
      case '__dict__': { var dd = new PyDict(); this.d.forEach(function (v, k) { dictSet(dd, k, v); }); return dd; }
      case '__doc__': { var doc = this.d.get('__doc__'); return doc === undefined ? None : doc; }
    }
    var v = lookup(this, name);
    if (v !== undefined) {
      if (v instanceof PyStaticMethod) return v.f;
      if (v instanceof PyClassMethod) return new PyMethod(v.f, this);
      if (v && v.$get && !(v instanceof PyProperty)) return v.$get(None, this);
      return v;
    }
    var mv = lookup(T_type, name);
    if (mv !== undefined) return bindAttr(mv, this, T_type);
    throw attrErr(this, name, "type object '" + this.name + "' has no attribute '" + name + "'");
  };
  TYP.$setattr = function (name, v) {
    if (this.native) throw typeErr("cannot set '" + name + "' attribute of immutable type '" + this.name + "'");
    if (name === '__name__') { this.name = v; return; }
    if (name === '__qualname__') { this.qualname = v; return; }
    this.d.set(name, v);
  };
  TYP.$delattr = function (name) {
    if (this.native) throw typeErr("cannot set '" + name + "' attribute of immutable type '" + this.name + "'");
    if (!this.d.delete(name)) throw attrErr(this, name, "type object '" + this.name + "' has no attribute '" + name + "'");
  };
  TYP.$getitem = function (k) {
    // list[int], dict[str, int] … : alias génériques (pour les annotations)
    if (this.native && (this === T_list || this === T_dict || this === T_tuple || this === T_set || this === T_frozenset || this === T_type)) return new PyGenericAlias(this, k);
    var cg = lookup(this, '__class_getitem__');
    if (cg !== undefined) return callAny(cg instanceof PyClassMethod ? new PyMethod(cg.f, this) : cg, [k]);
    throw typeErr("type '" + this.name + "' is not subscriptable");
  };
  TYP.$cmp = function (b, op) {
    if (op === '==') return this === b;
    if (op === '!=') return this !== b;
    return NotImplemented;
  };
  TYP.$hash = function () { return Math.floor(objId(this) / 16); };
  TYP.$or = function (b) { return new PyGenericAlias(T_type, new PyTuple([this, b]), true); };
  function PyGenericAlias(origin, args, union) { this.origin = origin; this.args = args; this.union = !!union; }
  Object.setPrototypeOf(PyGenericAlias.prototype, OB);
  PyGenericAlias.prototype.$repr = function () {
    if (this.union) return this.args.a.map(function (t) { return t instanceof PyType ? t.name : pyRepr(t); }).join(' | ');
    var a = this.args instanceof PyTuple ? this.args.a : [this.args];
    return this.origin.name + '[' + a.map(function (t) { return t instanceof PyType ? t.name : pyRepr(t); }).join(', ') + ']';
  };
  PyGenericAlias.prototype.$call = function (args, kw) { return callAny(this.origin, args, kw); };

  // ---- Instances de classes définies en Python ----
  var IP = PyInst.prototype;
  IP.$repr = function () {
    var f = lookup(this.cls, '__repr__');
    var r = callDunder(this, f, []);
    if (typeof r !== 'string') throw typeErr('__repr__ returned non-string (type ' + tname(r) + ')');
    return r;
  };
  IP.$str = function () {
    var f = lookup(this.cls, '__str__');
    var r = callDunder(this, f, []);
    if (typeof r !== 'string') throw typeErr('__str__ returned non-string (type ' + tname(r) + ')');
    return r;
  };
  IP.$bool = function () {
    var f = lookup(this.cls, '__bool__');
    if (f !== undefined) {
      var r = callDunder(this, f, []);
      if (typeof r !== 'boolean') throw typeErr('__bool__ should return bool, returned ' + tname(r));
      return r;
    }
    var l = lookup(this.cls, '__len__');
    if (l !== undefined) return this.$len() > 0;
    return true;
  };
  IP.$len = function () {
    var f = lookup(this.cls, '__len__');
    if (f === undefined) return undefined;
    var r = callDunder(this, f, []);
    if (typeof r !== 'bigint' && typeof r !== 'boolean') throw typeErr("'" + tname(r) + "' object cannot be interpreted as an integer");
    r = toBig(r);
    if (r < 0n) throw valueErr('__len__() should return >= 0');
    return Number(r);
  };
  IP.$iter = function () {
    var f = lookup(this.cls, '__iter__');
    if (f === undefined || f === None) {
      var gi = lookup(this.cls, '__getitem__');
      if (gi !== undefined && f !== None) return new SeqIter(this, gi);
      throw typeErr("'" + this.cls.name + "' object is not iterable");
    }
    var it = callDunder(this, f, []);
    if (it && typeof it.nx === 'function') return it;
    if (it instanceof PyInst) {
      var nf = lookup(it.cls, '__next__');
      if (nf !== undefined) return new UserIter(it, nf);
    }
    throw typeErr('iter() returned non-iterator of type \'' + tname(it) + "'");
  };
  IP.$contains = function (x) {
    var f = lookup(this.cls, '__contains__');
    if (f !== undefined) return truthy(callDunder(this, f, [x]));
    if (lookup(this.cls, '__iter__') !== undefined || lookup(this.cls, '__getitem__') !== undefined) return containsByIter(this, x);
    throw typeErr("argument of type '" + this.cls.name + "' is not iterable");
  };
  IP.$getitem = function (k) {
    var f = lookup(this.cls, '__getitem__');
    if (f === undefined) {
      if (lookup(this.cls, '__class_getitem__')) {}
      throw typeErr("'" + this.cls.name + "' object is not subscriptable");
    }
    return callDunder(this, f, [k]);
  };
  IP.$setitem = function (k, v) {
    var f = lookup(this.cls, '__setitem__');
    if (f === undefined) throw typeErr("'" + this.cls.name + "' object does not support item assignment");
    callDunder(this, f, [k, v]);
  };
  IP.$delitem = function (k) {
    var f = lookup(this.cls, '__delitem__');
    if (f === undefined) throw typeErr("'" + this.cls.name + "' object doesn't support item deletion");
    callDunder(this, f, [k]);
  };
  IP.$call = function (args, kw) {
    var f = lookup(this.cls, '__call__');
    if (f === undefined) throw typeErr("'" + this.cls.name + "' object is not callable");
    if (f instanceof PyFunc) return callFunc(f, args, kw, this);
    return callAny(bindAttr(f, this, this.cls), args, kw);
  };
  IP.$hkey = function () {
    var h = lookup(this.cls, '__hash__');
    if (h === None) throw unhashable(this);
    if (h === undefined || h instanceof PyMethodDescr) return this;
    var hv = callDunder(this, h, []);
    if (typeof hv !== 'bigint' && typeof hv !== 'boolean') throw typeErr('__hash__ method should return an integer');
    var key = 'h' + toBig(hv);
    var bucket = customHash.get(key);
    if (!bucket) { bucket = []; customHash.set(key, bucket); }
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i].o === this || eqBool(bucket[i].o, this)) return bucket[i].t;
    }
    var t = { $tok: 'u' + key + ':' + bucket.length };
    bucket.push({ o: this, t: t });
    return t;
  };
  IP.$hash = function () {
    var h = lookup(this.cls, '__hash__');
    if (h === None) throw unhashable(this);
    if (h === undefined || h instanceof PyMethodDescr) return Math.floor(objId(this) / 16);
    var hv = callDunder(this, h, []);
    if (typeof hv !== 'bigint' && typeof hv !== 'boolean') throw typeErr('__hash__ method should return an integer');
    return hashInt(toBig(hv));
  };
  IP.$getattr = function (name) {
    var cls = this.cls;
    var ga = cls.hasGetattribute ? lookup(cls, '__getattribute__') : undefined;
    if (ga !== undefined && !(ga instanceof PyMethodDescr)) return callDunder(this, ga, [name]);
    return instGetAttr(this, name);
  };
  function instGetAttr(o, name) {
    var cls = o.cls;
    var ca = lookup(cls, name);
    if (ca instanceof PyProperty) return bindAttr(ca, o, cls);
    var v = o.d.get(name);
    if (v !== undefined) return v;
    if (ca !== undefined) return bindAttr(ca, o, cls);
    for (var i = 0; i < cls.mro.length; i++) {
      var g = cls.mro[i].getters;
      if (g && hasOwn(g, name)) return g[name](o);
    }
    if (name === '__class__') return cls;
    if (name === '__dict__') return instDict(o);
    if (name === '__doc__') return None;
    if (name === '__module__') return cls.module;
    var gf = lookup(cls, '__getattr__');
    if (gf !== undefined) return callDunder(o, gf, [name]);
    throw attrErr(o, name);
  }
  function instDict(o) {
    // vue vivante du dictionnaire d'attributs
    var d = new PyDict();
    o.d.forEach(function (v, k) { dictSet(d, k, v); });
    d.$owner = o;
    return d;
  }
  IP.$setattr = function (name, v) {
    var cls = this.cls;
    if (cls.hasSetattr) {
      var sa = lookup(cls, '__setattr__');
      if (sa !== undefined && !(sa instanceof PyMethodDescr)) { callDunder(this, sa, [name, v]); return; }
    }
    instSetAttr(this, name, v);
  };
  function instSetAttr(o, name, v) {
    var ca = lookup(o.cls, name);
    if (ca instanceof PyProperty) {
      if (ca.fset === None) throw attrErr(o, name, "property '" + name + "' of '" + o.cls.name + "' object has no setter");
      callAny(ca.fset, [o, v]);
      return;
    }
    if (name === '__class__') { if (v instanceof PyType && !v.native) { o.cls = v; return; } throw typeErr('__class__ assignment only supported for mutable types or ModuleType subclasses'); }
    if (o.cls.isExc && name === 'args') { o.args = toArray(v); return; }
    if (o.cls.slots && o.cls.slots.indexOf(name) < 0) throw attrErr(o, name, "'" + o.cls.name + "' object has no attribute '" + name + "' and no __dict__ for setting new attributes");
    o.d.set(name, v);
  }
  IP.$delattr = function (name) {
    var cls = this.cls;
    var da = lookup(cls, '__delattr__');
    if (da !== undefined && !(da instanceof PyMethodDescr)) { callDunder(this, da, [name]); return; }
    var ca = lookup(cls, name);
    if (ca instanceof PyProperty) {
      if (ca.fdel === None) throw attrErr(this, name, "property '" + name + "' of '" + cls.name + "' object has no deleter");
      callAny(ca.fdel, [this]);
      return;
    }
    if (!this.d.delete(name)) throw attrErr(this, name);
  };
  IP.$format = null;

  // ---- Tri (algorithme de CPython : même ordre de comparaisons pour les petites listes) ----
  function reverseRange(a, lo, hi) { hi--; while (lo < hi) { var t = a[lo]; a[lo] = a[hi]; a[hi] = t; lo++; hi--; } }
  function countRun(k, v, lo, nrem, lt) {
    var n;
    function rev(a, b) { reverseRange(k, a, b); if (v) reverseRange(v, a, b); }
    for (n = 1; n < nrem; ++n) if (lt(k[lo + n], k[lo + n - 1])) break;
    if (n === nrem) return n;
    if (n > 1) {
      if (lt(k[lo], k[lo + n - 1])) return n;
      rev(lo, lo + n);
    }
    ++n;
    var neq = 0;
    for (; n < nrem; ++n) {
      if (lt(k[lo + n], k[lo + n - 1])) {
        if (neq) { ++neq; rev(lo + n - neq, lo + n); neq = 0; }
      } else {
        if (lt(k[lo + n - 1], k[lo + n])) break;
        ++neq;
      }
    }
    if (neq) { ++neq; rev(lo + n - neq, lo + n); neq = 0; }
    rev(lo, lo + n);
    for (; n < nrem; ++n) if (lt(k[lo + n], k[lo + n - 1])) break;
    return n;
  }
  function binarySort(k, v, lo, hi, start, lt) {
    if (start === lo) ++start;
    for (; start < hi; ++start) {
      var L = lo, R = start, pivot = k[start], M;
      do { M = (L + R) >> 1; if (lt(pivot, k[M])) R = M; else L = M + 1; } while (L < R);
      for (M = start; M > L; --M) k[M] = k[M - 1];
      k[L] = pivot;
      if (v) { var pv = v[start]; for (M = start; M > L; --M) v[M] = v[M - 1]; v[L] = pv; }
    }
  }
  function mergeRuns(k, v, lo, mid, hi, lt) {
    var lk = k.slice(lo, mid), lv = v ? v.slice(lo, mid) : null;
    var i = 0, j = mid, d = lo;
    while (i < lk.length && j < hi) {
      if (lt(k[j], lk[i])) { k[d] = k[j]; if (v) v[d] = v[j]; j++; }
      else { k[d] = lk[i]; if (v) v[d] = lv[i]; i++; }
      d++;
    }
    while (i < lk.length) { k[d] = lk[i]; if (v) v[d] = lv[i]; i++; d++; }
  }
  // trie k (clés) et v (valeurs associées, ou null) en place, de façon stable, avec lt(a, b)
  function timsort(k, v, lt) {
    var n = k.length;
    if (n < 2) return;
    var nn = n, r = 0;
    while (nn >= 64) { r |= nn & 1; nn >>= 1; }
    var minrun = nn + r;
    var runs = [], lo = 0, nrem = n;
    while (nrem > 0) {
      var len = countRun(k, v, lo, nrem, lt);
      if (len < minrun) {
        var force = nrem <= minrun ? nrem : minrun;
        binarySort(k, v, lo, lo + force, lo + len, lt);
        len = force;
      }
      runs.push([lo, len]);
      lo += len; nrem -= len;
    }
    while (runs.length > 1) {
      var merged = [];
      for (var i = 0; i < runs.length; i += 2) {
        if (i + 1 < runs.length) {
          var a = runs[i], b = runs[i + 1];
          mergeRuns(k, v, a[0], b[0], b[0] + b[1], lt);
          merged.push([a[0], a[1] + b[1]]);
        } else merged.push(runs[i]);
      }
      runs = merged;
    }
  }
  function listSort(list, keyFn, reverse) {
    var a = list.a;
    var items = a.slice();
    a.length = 0;
    try {
      var keys = null;
      if (keyFn !== None && keyFn !== undefined) {
        keys = new Array(items.length);
        for (var i = 0; i < items.length; i++) keys[i] = callAny(keyFn, [items[i]]);
      }
      if (reverse) { reverseRange(items, 0, items.length); if (keys) reverseRange(keys, 0, keys.length); }
      if (keys) timsort(keys, items, ltBool);
      else timsort(items, null, ltBool);
      if (reverse) reverseRange(items, 0, items.length);
    } finally {
      var modified = a.length !== 0;
      a.length = 0;
      for (var j = 0; j < items.length; j++) a.push(items[j]);
      if (modified) throw valueErr('list modified during sort');
    }
  }

  // ---- Création des types natifs ----
  function nativeType(name, bases, layout) {
    var t = makeType(name, bases || [T_object], layout);
    return t;
  }
  function defMethods(t, methods) {
    for (var k in methods) if (hasOwn(methods, k)) t.d.set(k, new PyMethodDescr(t, k, methods[k]));
  }
  function chkO(q, args, kw) {
    if (!kwEmpty(kw)) throw typeErr(q + '() takes no keyword arguments');
    if (args.length !== 1) throw typeErr(q + '() takes exactly one argument (' + args.length + ' given)');
  }
  function chkNo(q, args, kw) {
    if (!kwEmpty(kw)) throw typeErr(q + '() takes no keyword arguments');
    if (args.length) throw typeErr(q + '() takes no arguments (' + args.length + ' given)');
  }
  function chkR(n, args, min, max, kw, kwName) {
    if (!kwEmpty(kw)) throw typeErr((kwName || n) + '() takes no keyword arguments');
    var c = args.length;
    if (c >= min && c <= max) return;
    if (min === max) throw typeErr(n + ' expected ' + min + ' argument' + (min === 1 ? '' : 's') + ', got ' + c);
    if (c < min) throw typeErr(n + ' expected at least ' + min + ' argument' + (min === 1 ? '' : 's') + ', got ' + c);
    throw typeErr(n + ' expected at most ' + max + ' argument' + (max === 1 ? '' : 's') + ', got ' + c);
  }

  T_object = new PyType('object', []);
  T_object.mro = [T_object];
  T_object.layout = 'object';
  T_type = nativeType('type');
  PyType.prototype.cls = T_type;
  T_int = nativeType('int', [T_object], 'int');
  T_bool = nativeType('bool', [T_int], 'int');
  T_float = nativeType('float', [T_object], 'float');
  T_str = nativeType('str', [T_object], 'str');
  T_list = nativeType('list', [T_object], 'list');
  T_tuple = nativeType('tuple', [T_object], 'tuple');
  T_dict = nativeType('dict', [T_object], 'dict');
  T_set = nativeType('set', [T_object], 'set');
  T_frozenset = nativeType('frozenset', [T_object], 'set');
  T_range = nativeType('range');
  T_slice = nativeType('slice');
  T_NoneType = nativeType('NoneType');
  T_NotImplementedType = nativeType('NotImplementedType');
  T_ellipsis = nativeType('ellipsis');
  T_function = nativeType('function');
  T_builtin = nativeType('builtin_function_or_method');
  T_method = nativeType('method');
  T_method_descr = nativeType('method_descriptor');
  T_module = nativeType('module');
  T_property = nativeType('property');
  T_staticmethod = nativeType('staticmethod');
  T_classmethod = nativeType('classmethod');
  T_super = nativeType('super');
  T_cell = nativeType('cell');
  T_generator = nativeType('generator');
  T_iterator = nativeType('iterator');
  var T_list_iterator = nativeType('list_iterator'), T_tuple_iterator = nativeType('tuple_iterator'),
    T_list_reverseiterator = nativeType('list_reverseiterator'), T_str_iterator = nativeType('str_ascii_iterator'),
    T_range_iterator = nativeType('range_iterator'), T_dict_keyiterator = nativeType('dict_keyiterator'),
    T_dict_valueiterator = nativeType('dict_valueiterator'), T_dict_itemiterator = nativeType('dict_itemiterator'),
    T_set_iterator = nativeType('set_iterator'), T_enumerate = nativeType('enumerate'), T_zip = nativeType('zip'),
    T_map = nativeType('map'), T_filter = nativeType('filter'), T_reversed = nativeType('reversed'),
    T_callable_iterator = nativeType('callable_iterator'), T_dict_keys = nativeType('dict_keys'),
    T_dict_values = nativeType('dict_values'), T_dict_items = nativeType('dict_items'),
    T_dict_reverseiterator = nativeType('dict_reversekeyiterator'), T_generic_alias = nativeType('types.GenericAlias');

  PyNoneT.prototype.cls = T_NoneType;
  PyNotImplT.prototype.cls = T_NotImplementedType;
  PyEllipsisT.prototype.cls = T_ellipsis;
  PyList.prototype.cls = T_list;
  PyTuple.prototype.cls = T_tuple;
  PyDict.prototype.cls = T_dict;
  PySet.prototype.cls = T_set;
  PyFrozenSet.prototype.cls = T_frozenset;
  PyRange.prototype.cls = T_range;
  PySlice.prototype.cls = T_slice;
  PyCell.prototype.cls = T_cell;
  PyModule.prototype.cls = T_module;
  PyFunc.prototype.cls = T_function;
  PyMethod.prototype.cls = T_method;
  PyBuiltin.prototype.cls = T_builtin;
  PyMethodDescr.prototype.cls = T_method_descr;
  PyProperty.prototype.cls = T_property;
  PyStaticMethod.prototype.cls = T_staticmethod;
  PyClassMethod.prototype.cls = T_classmethod;
  PySuper.prototype.cls = T_super;
  GenExpIter.prototype.cls = T_generator;
  PyGenericAlias.prototype.cls = T_generic_alias;
  ListIter.prototype.cls = T_list_iterator;
  RevListIter.prototype.cls = T_list_reverseiterator;
  StrIter.prototype.cls = T_str_iterator;
  RangeIter.prototype.cls = T_range_iterator;
  SetIter.prototype.cls = T_set_iterator;

  // Méthodes communes aux itérateurs
  var ITER_METHODS = {
    __iter__: function (self) { return self; },
    __next__: function (self) { var v = self.nx(); if (v === undefined) throw newExc(T_StopIteration, []); return v; }
  };
  [T_iterator, T_list_iterator, T_tuple_iterator, T_list_reverseiterator, T_str_iterator, T_range_iterator, T_dict_keyiterator,
    T_dict_valueiterator, T_dict_itemiterator, T_set_iterator, T_enumerate, T_zip, T_map, T_filter, T_reversed, T_generator,
    T_callable_iterator, T_dict_reverseiterator].forEach(function (t) { defMethods(t, ITER_METHODS); });
  defMethods(T_generator, {
    close: function (self) { self.done = true; return None; },
    send: function (self, args) { if (args[0] !== None && self.lvl === 0 && !self.started) throw typeErr("can't send non-None value to a just-started generator"); var v = self.nx(); if (v === undefined) throw newExc(T_StopIteration, []); return v; }
  });

  // ---- object ----
  var OBJECT_INIT, OBJECT_NEW;
  defMethods(T_object, {
    __init__: function (self, args, kw) {
      if (args.length || !kwEmpty(kw)) {
        var t = typeOf(self);
        if (lookup(t, '__init__') === OBJECT_INIT) throw typeErr(t.name + '() takes no arguments');
        throw typeErr('object.__init__() takes exactly one argument (the instance to initialize)');
      }
      return None;
    },
    __new__: function (cls, args) {
      if (!(cls instanceof PyType)) throw typeErr('object.__new__(X): X is not a type object (' + tname(cls) + ')');
      if (cls.isExc) { var e = newExc(cls, args.slice(0)); e.$raised = false; return e; }
      if (cls.native && cls !== T_object) throw typeErr('object.__new__(' + cls.name + ') is not safe, use ' + cls.name + '.__new__()');
      return cls.native ? new PyInst(T_object) : new PyInst(cls);
    },
    __repr__: function (self) {
      var t = typeOf(self);
      return '<' + (t.module === 'builtins' ? '' : t.module + '.') + t.qualname + ' object at ' + addr(self) + '>';
    },
    __str__: function (self) { return pyRepr(self); },
    __eq__: function (self, args) { return self === args[0] ? true : NotImplemented; },
    __ne__: function (self, args) { var r = richCmp(self, args[0], '=='); return r === NotImplemented ? r : !truthy(r); },
    __lt__: function () { return NotImplemented; },
    __le__: function () { return NotImplemented; },
    __gt__: function () { return NotImplemented; },
    __ge__: function () { return NotImplemented; },
    __hash__: function (self) { return BigInt(pyHash(self)); },
    __format__: function (self, args) {
      var spec = args[0];
      if (typeof spec !== 'string') throw typeErr('__format__() argument must be str, not ' + tname(spec));
      if (spec !== '') throw typeErr('unsupported format string passed to ' + tname(self) + '.__format__');
      return pyStr(self);
    },
    __setattr__: function (self, args) { if (self instanceof PyInst) instSetAttr(self, args[0], args[1]); else setAttr(self, args[0], args[1]); return None; },
    __getattribute__: function (self, args) { return self instanceof PyInst ? instGetAttr(self, args[0]) : getAttr(self, args[0]); },
    __delattr__: function (self, args) { delAttr(self, args[0]); return None; },
    __dir__: function (self) { return new PyList(dirOf(self)); },
    __init_subclass__: function () { return None; },
    __reduce__: function () { throw typeErr('cannot pickle'); },
    __sizeof__: function () { return 56n; }
  });
  OBJECT_INIT = T_object.d.get('__init__');
  OBJECT_NEW = T_object.d.get('__new__');
  T_object.call = function (args, kw) {
    if (args.length || !kwEmpty(kw)) throw typeErr('object() takes no arguments');
    return new PyInst(T_object);
  };
  T_object.getters = {
    __class__: function (o) { return typeOf(o); }
  };

  // ---- type ----
  defMethods(T_type, {
    mro: function (self) { return new PyList(self.mro.slice()); },
    __subclasses__: function () { return new PyList([]); },
    __instancecheck__: function (self, args) { return isinst(args[0], self); },
    __subclasscheck__: function (self, args) { return args[0] instanceof PyType && isSubtype(args[0], self); }
  });
  T_type.call = function (args, kw) {
    if (args.length === 1 && kwEmpty(kw)) return typeOf(args[0]);
    if (args.length === 3) {
      var name = args[0], bases = args[1], ns = args[2];
      var m = new Map();
      ns.m.forEach(function (e) { m.set(e[0], e[1]); });
      return makeClass(name, bases.a.slice(), m, name);
    }
    throw typeErr('type() takes 1 or 3 arguments');
  };
  T_type.getters = {};

  // ---- Classes définies en Python ----
  function makeClass(name, bases, ns, qualname) {
    if (!bases.length) bases = [T_object];
    for (var i = 0; i < bases.length; i++) {
      var b = bases[i];
      if (!(b instanceof PyType)) throw typeErr('bases must be types');
      if (b === T_bool || b === T_range || b === T_slice || b === T_function || b === T_NoneType || b === T_generator) {
        throw typeErr("type '" + b.name + "' is not an acceptable base type");
      }
      if (b.native && !b.isExc && b !== T_object && !b.subclassable) {
        throw pyErr(T_NotImplementedError, "subclassing the built-in type '" + b.name + "' is not supported in CodeQuest");
      }
    }
    var cls = new PyType(name, bases, ns);
    cls.native = false;
    cls.module = '__main__';
    cls.qualname = qualname || name;
    ns.delete('__qualname__');
    cls.mro = computeMro(cls);
    cls.isExc = cls.mro.indexOf(T_BaseException) >= 0;
    var layout = 'object';
    for (var j = 0; j < cls.mro.length; j++) { var l = cls.mro[j].layout; if (l && l !== 'object') { layout = l; break; } }
    cls.layout = cls.isExc ? 'exception' : layout;
    // __eq__ sans __hash__ : instances non hachables
    if (ns.has('__eq__') && !ns.has('__hash__')) ns.set('__hash__', None);
    // __new__ est implicitement une méthode statique ; __init_subclass__ et __class_getitem__ des méthodes de classe
    var nw = ns.get('__new__');
    if (nw instanceof PyFunc) ns.set('__new__', new PyStaticMethod(nw));
    var cg = ns.get('__class_getitem__');
    if (cg instanceof PyFunc) ns.set('__class_getitem__', new PyClassMethod(cg));
    var sl = ns.get('__slots__');
    if (sl !== undefined) cls.slots = typeof sl === 'string' ? [sl] : toArray(sl);
    for (var q = 0; q < cls.mro.length; q++) {
      var c = cls.mro[q];
      if (c.native) continue;
      var ga = c.d.get('__getattribute__'); if (ga instanceof PyFunc) cls.hasGetattribute = true;
      var sa = c.d.get('__setattr__'); if (sa instanceof PyFunc) cls.hasSetattr = true;
    }
    // __init_subclass__ des bases
    var isub = lookup(cls.mro[1] || T_object, '__init_subclass__');
    if (isub instanceof PyClassMethod) callAny(new PyMethod(isub.f, cls), []);
    else if (isub instanceof PyFunc) callFunc(isub, [], null, cls);
    // __set_name__
    ns.forEach(function (v, k) {
      if (v instanceof PyInst) { var sn = lookup(v.cls, '__set_name__'); if (sn !== undefined) callDunder(v, sn, [cls, k]); }
    });
    return cls;
  }
  function newUserInstance(cls, args, kw) {
    var newF = lookup(cls, '__new__'), inst;
    if (newF !== undefined && newF !== OBJECT_NEW && !(newF instanceof PyMethodDescr)) {
      var nf = newF instanceof PyStaticMethod ? newF.f : newF;
      inst = callAny(nf, [cls].concat(args), kw);
      if (!isinst(inst, cls)) return inst;
    } else if (newF instanceof PyMethodDescr && newF !== OBJECT_NEW) {
      inst = newF.fn(cls, args, kw);
    } else if (cls.layout === 'exception') {
      inst = newExc(cls, args.slice(0)); inst.$raised = false;
    } else {
      inst = new PyInst(cls);
    }
    var init = lookup(cls, '__init__');
    if (init === OBJECT_INIT) {
      if ((args.length || !kwEmpty(kw)) && (newF === undefined || newF === OBJECT_NEW)) throw typeErr(cls.name + '() takes no arguments');
    } else if (init instanceof PyMethodDescr) {
      init.fn(inst, args, kw);
    } else if (init !== undefined) {
      var r = init instanceof PyFunc ? callFunc(init, args, kw, inst) : callAny(bindAttr(init, inst, cls), args, kw);
      if (r !== None) throw typeErr("__init__() should return None, not '" + tname(r) + "'");
    }
    return inst;
  }

  // dir() d'un objet
  function dirOf(o) {
    var names = new Set();
    if (o instanceof PyModule) { o.d.forEach(function (v, k) { names.add(k); }); return Array.from(names).sort(); }
    if (o instanceof PyInst) o.d.forEach(function (v, k) { names.add(k); });
    var t = o instanceof PyType ? o : typeOf(o);
    var list = o instanceof PyType ? t.mro : t.mro;
    for (var i = 0; i < list.length; i++) {
      list[i].d.forEach(function (v, k) { names.add(k); });
      if (list[i].getters) for (var g in list[i].getters) if (hasOwn(list[i].getters, g)) names.add(g);
      if (DIR_EXTRA[list[i].name] && list[i].native) DIR_EXTRA[list[i].name].split(' ').forEach(function (n) { if (n) names.add(n); });
    }
    if (o instanceof PyInst || (o instanceof PyType && !o.native)) { names.add('__dict__'); names.add('__module__'); names.add('__weakref__'); names.add('__doc__'); }
    names.add('__class__');
    return Array.from(names).sort(function (a, b) { return cmpStr(a, b); });
  }
  // noms publics des types natifs (pour les suggestions « Did you mean »)
  var DIR_EXTRA = {
    int: 'as_integer_ratio bit_count bit_length conjugate denominator from_bytes imag is_integer numerator real to_bytes',
    float: 'as_integer_ratio conjugate fromhex hex imag is_integer real',
    str: 'capitalize casefold center count encode endswith expandtabs find format format_map index isalnum isalpha isascii isdecimal isdigit isidentifier islower isnumeric isprintable isspace istitle isupper join ljust lower lstrip maketrans partition removeprefix removesuffix replace rfind rindex rjust rpartition rsplit rstrip split splitlines startswith strip swapcase title translate upper zfill',
    list: 'append clear copy count extend index insert pop remove reverse sort',
    dict: 'clear copy fromkeys get items keys pop popitem setdefault update values',
    tuple: 'count index',
    set: 'add clear copy difference difference_update discard intersection intersection_update isdisjoint issubset issuperset pop remove symmetric_difference symmetric_difference_update union update',
    frozenset: 'copy difference intersection isdisjoint issubset issuperset symmetric_difference union',
    range: 'count index start step stop'
  };

  // ---- Exceptions ----
  function excType(name, base) {
    var t = makeType(name, [base], 'exception');
    t.isExc = true;
    t.call = function (args, kw, cls) {
      if (!kwEmpty(kw)) throw typeErr(cls.name + '() takes no keyword arguments');
      var e = newExc(cls, args.slice(0));
      e.$raised = false;
      if (cls === T_OSError || isSubtype(cls, T_OSError)) initOSError(e, args);
      if (isSubtype(cls, T_StopIteration)) e.d.set('value', args.length ? args[0] : None);
      if (isSubtype(cls, T_SystemExit)) e.d.set('code', args.length === 0 ? None : args.length === 1 ? args[0] : new PyTuple(args.slice(0)));
      return e;
    };
    BUILTINS.set(name, t);
    return t;
  }
  function initOSError(e, args) {
    if (args.length >= 2) {
      e.d.set('errno', args[0]); e.d.set('strerror', args[1]);
      e.d.set('filename', args.length >= 3 ? args[2] : None);
    }
  }
  T_BaseException = makeType('BaseException', [T_object], 'exception');
  T_BaseException.isExc = true;
  T_BaseException.call = function (args, kw, cls) { if (!kwEmpty(kw)) throw typeErr('BaseException() takes no keyword arguments'); var e = newExc(cls, args.slice(0)); e.$raised = false; return e; };
  BUILTINS.set('BaseException', T_BaseException);
  defMethods(T_BaseException, {
    __init__: function (self, args) { self.args = args.slice(0); if (isinst(self, T_OSError)) initOSError(self, args); return None; },
    __str__: function (self) { return baseExcStr(self); },
    __repr__: function (self) {
      var a = self.args, n = self.cls.name;
      if (a.length === 1) return n + '(' + pyRepr(a[0]) + ')';
      return n + reprSeq(self, '(', ')', a, false);
    },
    with_traceback: function (self) { return self; },
    add_note: function (self, args) { var notes = self.d.get('__notes__'); if (!notes) { notes = new PyList([]); self.d.set('__notes__', notes); } notes.a.push(args[0]); return None; }
  });
  T_BaseException.getters = {
    args: function (e) { return new PyTuple(e.args.slice(0)); },
    __cause__: function (e) { var c = e.d.get('__cause__'); return c === undefined ? None : c; },
    __context__: function () { return None; },
    __traceback__: function () { return None; },
    __suppress_context__: function () { return false; }
  };
  T_SystemExit = excType('SystemExit', T_BaseException);
  T_KeyboardInterrupt = excType('KeyboardInterrupt', T_BaseException);
  T_GeneratorExit = excType('GeneratorExit', T_BaseException);
  T_Exception = excType('Exception', T_BaseException);
  T_ArithmeticError = excType('ArithmeticError', T_Exception);
  T_FloatingPointError = excType('FloatingPointError', T_ArithmeticError);
  T_OverflowError = excType('OverflowError', T_ArithmeticError);
  T_ZeroDivisionError = excType('ZeroDivisionError', T_ArithmeticError);
  T_AssertionError = excType('AssertionError', T_Exception);
  T_AttributeError = excType('AttributeError', T_Exception);
  excType('BufferError', T_Exception);
  T_EOFError = excType('EOFError', T_Exception);
  T_ImportError = excType('ImportError', T_Exception);
  T_ModuleNotFoundError = excType('ModuleNotFoundError', T_ImportError);
  T_LookupError = excType('LookupError', T_Exception);
  T_IndexError = excType('IndexError', T_LookupError);
  T_KeyError = excType('KeyError', T_LookupError);
  T_MemoryError = excType('MemoryError', T_Exception);
  T_NameError = excType('NameError', T_Exception);
  T_UnboundLocalError = excType('UnboundLocalError', T_NameError);
  T_OSError = excType('OSError', T_Exception);
  BUILTINS.set('EnvironmentError', T_OSError);
  BUILTINS.set('IOError', T_OSError);
  T_FileExistsError = excType('FileExistsError', T_OSError);
  T_FileNotFoundError = excType('FileNotFoundError', T_OSError);
  T_IsADirectoryError = excType('IsADirectoryError', T_OSError);
  excType('NotADirectoryError', T_OSError);
  T_PermissionError = excType('PermissionError', T_OSError);
  excType('TimeoutError', T_OSError);
  var T_ConnectionError = excType('ConnectionError', T_OSError);
  excType('ConnectionRefusedError', T_ConnectionError);
  excType('ConnectionResetError', T_ConnectionError);
  excType('BlockingIOError', T_OSError);
  excType('InterruptedError', T_OSError);
  excType('ReferenceError', T_Exception);
  T_RuntimeError = excType('RuntimeError', T_Exception);
  T_NotImplementedError = excType('NotImplementedError', T_RuntimeError);
  T_RecursionError = excType('RecursionError', T_RuntimeError);
  excType('StopAsyncIteration', T_Exception);
  T_StopIteration = excType('StopIteration', T_Exception);
  T_SyntaxError = excType('SyntaxError', T_Exception);
  T_IndentationError = excType('IndentationError', T_SyntaxError);
  T_TabError = excType('TabError', T_IndentationError);
  T_SystemError = excType('SystemError', T_Exception);
  T_TypeError = excType('TypeError', T_Exception);
  T_ValueError = excType('ValueError', T_Exception);
  T_UnicodeError = excType('UnicodeError', T_ValueError);
  excType('UnicodeDecodeError', T_UnicodeError);
  excType('UnicodeEncodeError', T_UnicodeError);
  var T_Warning = excType('Warning', T_Exception);
  ['UserWarning', 'DeprecationWarning', 'PendingDeprecationWarning', 'SyntaxWarning', 'RuntimeWarning', 'FutureWarning',
    'ImportWarning', 'UnicodeWarning', 'BytesWarning', 'ResourceWarning', 'EncodingWarning'].forEach(function (n) { excType(n, T_Warning); });
  T_UnsupportedOperation = makeType('UnsupportedOperation', [T_OSError, T_ValueError], 'exception');
  T_UnsupportedOperation.isExc = true;
  T_UnsupportedOperation.module = 'io';
  T_UnsupportedOperation.call = T_OSError.call;
  T_StopIteration.getters = { value: function (e) { var v = e.d.get('value'); return v === undefined ? (e.args.length ? e.args[0] : None) : v; } };
  T_KeyError.d.set('__str__', new PyMethodDescr(T_KeyError, '__str__', function (self) { return baseExcStr(self); }));
  ['errno', 'strerror', 'filename'].forEach(function (n) { if (!T_OSError.getters) T_OSError.getters = {}; T_OSError.getters[n] = function (e) { var v = e.d.get(n); return v === undefined ? None : v; }; });
  T_AttributeError.getters = { name: function (e) { var v = e.d.get('name'); return v === undefined ? None : v; }, obj: function (e) { var v = e.d.get('obj'); return v === undefined ? None : v; } };
  T_NameError.getters = { name: function (e) { var v = e.d.get('name'); return v === undefined ? None : v; } };
  T_ImportError.getters = { name: function (e) { var v = e.d.get('name'); return v === undefined ? None : v; }, msg: function (e) { return e.args.length ? e.args[0] : None; } };
  T_SyntaxError.getters = {
    msg: function (e) { var v = e.d.get('msg'); return v === undefined ? (e.args.length ? e.args[0] : None) : v; },
    lineno: function (e) { var v = e.d.get('lineno'); return v === undefined ? None : v; },
    offset: function () { return None; }, text: function () { return None; }, filename: function (e) { var v = e.d.get('filename'); return v === undefined ? None : v; }
  };
  T_SystemExit.getters = { code: function (e) { var v = e.d.get('code'); return v === undefined ? None : v; } };
  function oserror(cls, errno, strerror, filename) {
    var e = newExc(cls, [BigInt(errno), strerror]);
    e.d.set('errno', BigInt(errno)); e.d.set('strerror', strerror); e.d.set('filename', filename === undefined ? None : filename);
    return e;
  }

  // ---- Méthodes « dunder » génériques pour les types natifs ----
  var DUNDER_BIN = { __add__: OP_ADD, __sub__: OP_SUB, __mul__: OP_MUL, __truediv__: OP_TRUEDIV, __floordiv__: OP_FLOORDIV,
    __mod__: OP_MOD, __pow__: OP_POW, __lshift__: OP_LSHIFT, __rshift__: OP_RSHIFT, __and__: OP_AND, __or__: OP_OR, __xor__: OP_XOR };
  function addDunders(t, names) {
    var m = {};
    names.forEach(function (n) {
      if (DUNDER_BIN[n]) { var op = DUNDER_BIN[n]; m[n] = function (self, args) { chkO(t.name + '.' + n, args); return nativeBinop(op, self, args[0]); }; return; }
      var rn = /^__r(add|sub|mul|truediv|floordiv|mod|pow|lshift|rshift|and|or|xor)__$/.exec(n);
      if (rn) { var rop = DUNDER_BIN['__' + rn[1] + '__']; m[n] = function (self, args) { chkO(t.name + '.' + n, args); return nativeBinop(rop, args[0], self); }; return; }
      switch (n) {
        case '__eq__': case '__ne__': case '__lt__': case '__le__': case '__gt__': case '__ge__': {
          var op2 = { __eq__: '==', __ne__: '!=', __lt__: '<', __le__: '<=', __gt__: '>', __ge__: '>=' }[n];
          m[n] = function (self, args) { chkO(t.name + '.' + n, args); return nativeCmp(self, args[0], op2); };
          return;
        }
        case '__repr__': m[n] = function (self) { return pyRepr(self); }; return;
        case '__str__': m[n] = function (self) { return pyStr(self); }; return;
        case '__hash__': m[n] = function (self) { return BigInt(pyHash(self)); }; return;
        case '__bool__': m[n] = function (self) { return truthy(self); }; return;
        case '__len__': m[n] = function (self) { return BigInt(pyLen(self)); }; return;
        case '__iter__': m[n] = function (self) { return getIter(self); }; return;
        case '__contains__': m[n] = function (self, args) { return pyContains(self, args[0]); }; return;
        case '__getitem__': m[n] = function (self, args) { chkO(t.name + '.' + n, args); return getItem(self, args[0]); }; return;
        case '__setitem__': m[n] = function (self, args) { setItem(self, args[0], args[1]); return None; }; return;
        case '__delitem__': m[n] = function (self, args) { delItem(self, args[0]); return None; }; return;
        case '__neg__': m[n] = function (self) { return unaryOp('-', self); }; return;
        case '__pos__': m[n] = function (self) { return unaryOp('+', self); }; return;
        case '__invert__': m[n] = function (self) { return unaryOp('~', self); }; return;
        case '__abs__': m[n] = function (self) { return pyAbs(self); }; return;
        case '__int__': m[n] = function (self) { return typeof self === 'number' ? floatToInt(self) : toBig(self); }; return;
        case '__index__': m[n] = function (self) { return toBig(self); }; return;
        case '__float__': m[n] = function (self) { return toFloat(self); }; return;
        case '__format__': m[n] = function (self, args) { return pyFormat(self, args[0]); }; return;
        case '__round__': m[n] = function (self, args) { return builtinRound(args.length ? [self, args[0]] : [self], null); }; return;
        case '__reversed__': m[n] = function (self) { return builtinReversed([self], null); }; return;
      }
    });
    defMethods(t, m);
  }
  var NUM_DUNDERS = ['__add__', '__radd__', '__sub__', '__rsub__', '__mul__', '__rmul__', '__truediv__', '__rtruediv__',
    '__floordiv__', '__rfloordiv__', '__mod__', '__rmod__', '__pow__', '__rpow__', '__eq__', '__ne__', '__lt__', '__le__',
    '__gt__', '__ge__', '__repr__', '__str__', '__hash__', '__bool__', '__neg__', '__pos__', '__abs__', '__int__', '__float__',
    '__format__', '__round__'];
  addDunders(T_int, NUM_DUNDERS.concat(['__index__', '__invert__', '__lshift__', '__rlshift__', '__rshift__', '__rrshift__',
    '__and__', '__rand__', '__or__', '__ror__', '__xor__', '__rxor__']));
  addDunders(T_float, NUM_DUNDERS);
  addDunders(T_str, ['__add__', '__mul__', '__rmul__', '__mod__', '__eq__', '__ne__', '__lt__', '__le__', '__gt__', '__ge__',
    '__repr__', '__str__', '__hash__', '__len__', '__iter__', '__contains__', '__getitem__', '__format__']);
  addDunders(T_list, ['__add__', '__mul__', '__rmul__', '__eq__', '__ne__', '__lt__', '__le__', '__gt__', '__ge__', '__repr__',
    '__len__', '__iter__', '__contains__', '__getitem__', '__setitem__', '__delitem__', '__reversed__']);
  addDunders(T_tuple, ['__add__', '__mul__', '__rmul__', '__eq__', '__ne__', '__lt__', '__le__', '__gt__', '__ge__', '__repr__',
    '__hash__', '__len__', '__iter__', '__contains__', '__getitem__']);
  addDunders(T_dict, ['__eq__', '__ne__', '__repr__', '__len__', '__iter__', '__contains__', '__getitem__', '__setitem__', '__delitem__', '__or__', '__reversed__']);
  addDunders(T_set, ['__eq__', '__ne__', '__lt__', '__le__', '__gt__', '__ge__', '__repr__', '__len__', '__iter__', '__contains__',
    '__or__', '__and__', '__sub__', '__xor__']);
  addDunders(T_frozenset, ['__eq__', '__ne__', '__lt__', '__le__', '__gt__', '__ge__', '__repr__', '__hash__', '__len__', '__iter__',
    '__contains__', '__or__', '__and__', '__sub__', '__xor__']);
  addDunders(T_range, ['__eq__', '__ne__', '__repr__', '__hash__', '__len__', '__iter__', '__contains__', '__getitem__', '__reversed__']);
  addDunders(T_bool, ['__repr__', '__str__']);

  // ---- int ----
  T_int.call = function (args, kw, cls) {
    var a = parseArgs('int', args, kw, ['x', 'base']);
    var x = a[0], base = a[1], r;
    if (x === undefined) {
      if (base !== undefined) throw typeErr("int() missing string argument");
      r = 0n;
    } else if (base !== undefined) {
      var b = Number(asIndex(base));
      if (b !== 0 && (b < 2 || b > 36)) throw valueErr('int() base must be >= 2 and <= 36, or 0');
      if (typeof x !== 'string') throw typeErr("int() can't convert non-string with explicit base");
      r = parseIntStr(x, b);
    } else r = toIntValue(x);
    if (cls !== T_int) throw pyErr(T_NotImplementedError, 'subclassing int is not supported in CodeQuest');
    return r;
  };
  function toIntValue(x) {
    switch (typeof x) {
      case 'bigint': return x;
      case 'boolean': return x ? 1n : 0n;
      case 'number': return floatToInt(x);
      case 'string': return parseIntStr(x, 10);
    }
    if (x instanceof PyInst) {
      var f = lookup(x.cls, '__int__') || lookup(x.cls, '__index__');
      if (f !== undefined) {
        var r = callDunder(x, f, []);
        if (typeof r !== 'bigint' && typeof r !== 'boolean') throw typeErr('__int__ returned non-int (type ' + tname(r) + ')');
        return toBig(r);
      }
      var tr = lookup(x.cls, '__trunc__');
      if (tr !== undefined) return toIntValue(callDunder(x, tr, []));
    }
    throw typeErr("int() argument must be a string, a bytes-like object or a real number, not '" + tname(x) + "'");
  }
  defMethods(T_int, {
    bit_length: function (self, args) { chkNo('int.bit_length', args); return BigInt(bitLength(toBig(self))); },
    bit_count: function (self, args) { chkNo('int.bit_count', args); var n = toBig(self); if (n < 0n) n = -n; var c = 0n; while (n) { c += n & 1n; n >>= 1n; } return c; },
    as_integer_ratio: function (self) { return new PyTuple([toBig(self), 1n]); },
    is_integer: function () { return true; },
    conjugate: function (self) { return toBig(self); },
    to_bytes: function () { throw pyErr(T_NotImplementedError, 'bytes are not supported in CodeQuest'); }
  });
  T_int.getters = {
    real: function (v) { return toBig(v); }, imag: function () { return 0n; },
    numerator: function (v) { return toBig(v); }, denominator: function () { return 1n; }
  };
  T_bool.call = function (args, kw) {
    chkR('bool', args, 0, 1, kw);
    return args.length ? truthy(args[0]) : false;
  };

  // ---- float ----
  T_float.call = function (args, kw, cls) {
    chkR('float', args, 0, 1, kw, 'float');
    if (!args.length) return 0.0;
    return toFloatValue(args[0]);
  };
  function toFloatValue(x) {
    switch (typeof x) {
      case 'number': return x;
      case 'bigint': return intToFloat(x);
      case 'boolean': return x ? 1.0 : 0.0;
      case 'string': return parseFloatStr(x);
    }
    if (x instanceof PyInst) {
      var f = lookup(x.cls, '__float__');
      if (f !== undefined) {
        var r = callDunder(x, f, []);
        if (typeof r !== 'number') throw typeErr(x.cls.name + '.__float__ returned non-float (type ' + tname(r) + ')');
        return r;
      }
      var ix = lookup(x.cls, '__index__');
      if (ix !== undefined) return intToFloat(toBig(callDunder(x, ix, [])));
    }
    throw typeErr("float() argument must be a string or a real number, not '" + tname(x) + "'");
  }
  defMethods(T_float, {
    is_integer: function (self) { return Number.isInteger(self); },
    as_integer_ratio: function (self) {
      if (!isFinite(self)) throw (self !== self ? valueErr('cannot convert NaN to integer ratio') : pyErr(T_OverflowError, 'cannot convert Infinity to integer ratio'));
      var fp = floatParts(Math.abs(self)), num = fp.m, den = 1n;
      if (fp.e >= 0) num <<= BigInt(fp.e); else den <<= BigInt(-fp.e);
      var g = gcdBig(num, den);
      if (g > 1n) { num /= g; den /= g; }
      return new PyTuple([self < 0 ? -num : num, den]);
    },
    conjugate: function (self) { return self; },
    hex: function (self) {
      if (!isFinite(self)) return floatRepr(self);
      if (self === 0) return (1 / self < 0 ? '-' : '') + '0x0.0p+0';
      var fp = floatParts(Math.abs(self)), m = fp.m, e = fp.e + 52;
      while (m < (1n << 52n)) { m <<= 1n; e--; }
      var frac = (m - (1n << 52n)).toString(16).padStart(13, '0').replace(/0+$/, '');
      return (self < 0 ? '-' : '') + '0x1.' + (frac || '0') + 'p' + (e >= 0 ? '+' : '') + e;
    }
  });
  T_float.getters = { real: function (v) { return v; }, imag: function () { return 0.0; } };
  T_float.d.set('fromhex', new PyClassMethod(new PyBuiltin('fromhex', function (args) {
    var s = pyStr(args[1]).trim().toLowerCase();
    var m = /^([+-])?(0x)?([0-9a-f]*)(?:\.([0-9a-f]*))?(?:p([+-]?\d+))?$/.exec(s);
    if (!m) throw valueErr('invalid hexadecimal floating-point string');
    var mant = parseInt((m[3] || '0') + (m[4] || ''), 16), e = parseInt(m[5] || '0', 10) - 4 * (m[4] || '').length;
    var v = mant * Math.pow(2, e);
    return m[1] === '-' ? -v : v;
  })));

  // ---- str ----
  var PY_WS = '\\t\\n\\v\\f\\r\\x1c-\\x1f \\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000';
  var RE_WS_RUN = new RegExp('[' + PY_WS + ']+', 'g');
  var RE_WS_LEFT = new RegExp('^[' + PY_WS + ']+');
  var RE_WS_RIGHT = new RegExp('[' + PY_WS + ']+$');
  var RE_IS_WS = new RegExp('^[' + PY_WS + ']+$');
  T_str.call = function (args, kw) {
    var a = parseArgs('str', args, kw, ['object', 'encoding', 'errors']);
    if (a[1] !== undefined || a[2] !== undefined) {
      if (a[1] !== undefined && typeof a[1] !== 'string') throw typeErr("str() argument 'encoding' must be str, not " + tname(a[1]));
      throw typeErr('decoding str is not supported');
    }
    return a[0] === undefined ? '' : pyStr(a[0]);
  };
  function strArg(fn, v, what) {
    if (typeof v !== 'string') throw typeErr(what || ('must be str, not ' + tname(v)));
    return v;
  }
  function cpIndexArgs(s, args, from) { // start, end en points de code (avec la sémantique des tranches)
    var len = strLen(s);
    var sl = new PySlice(args[from] === undefined ? None : args[from], args[from + 1] === undefined ? None : args[from + 1], None);
    var st = sl.start === None ? 0 : sliceIndexVal(sl.start), en = sl.stop === None ? len : sliceIndexVal(sl.stop);
    if (st < 0) { st += len; if (st < 0) st = 0; }
    if (en < 0) { en += len; if (en < 0) en = 0; }
    if (en > len) en = len;
    return [st, en, len];
  }
  function cpToUnit(s, i) { // indice en points de code -> indice JS
    if (!isAstral(s)) return i;
    var u = 0;
    for (var k = 0; k < i && u < s.length; k++) { var c = s.charCodeAt(u); u += (c >= 0xD800 && c <= 0xDBFF) ? 2 : 1; }
    return u;
  }
  function unitToCp(s, u) { if (!isAstral(s)) return u; return strLen(s.slice(0, u)); }
  function strFind(s, args, rev, fname) {
    chkR(fname, args, 1, 3);
    var sub = args[0];
    if (typeof sub !== 'string') throw typeErr('must be str, not ' + tname(sub));
    var r = cpIndexArgs(s, args, 1), st = r[0], en = r[1];
    if (st > r[2]) return -1;
    if (en - st < strLen(sub)) return (sub === '' && st <= en) ? (rev ? en : st) : -1;
    var us = cpToUnit(s, st), ue = cpToUnit(s, en);
    var hay = s.slice(us, ue);
    var pos = rev ? hay.lastIndexOf(sub) : hay.indexOf(sub);
    if (pos < 0) return -1;
    return unitToCp(s, us + pos);
  }
  function splitWhitespace(s, maxsplit) {
    var res = [], i = 0, n = s.length;
    var isWs = function (c) { return RE_IS_WS.test(c); };
    while (i < n) {
      while (i < n && isWs(s[i])) i++;
      if (i >= n) break;
      if (maxsplit >= 0 && res.length >= maxsplit) { res.push(s.slice(i).replace(RE_WS_RIGHT, '')); return res; }
      var j = i;
      while (j < n && !isWs(s[j])) j++;
      res.push(s.slice(i, j));
      i = j;
    }
    return res;
  }
  function rsplitWhitespace(s, maxsplit) {
    var res = [], i = s.length - 1;
    var isWs = function (c) { return RE_IS_WS.test(c); };
    while (i >= 0) {
      while (i >= 0 && isWs(s[i])) i--;
      if (i < 0) break;
      if (maxsplit >= 0 && res.length >= maxsplit) { res.push(s.slice(0, i + 1).replace(RE_WS_LEFT, '')); break; }
      var j = i;
      while (j >= 0 && !isWs(s[j])) j--;
      res.push(s.slice(j + 1, i + 1));
      i = j;
    }
    return res.reverse();
  }
  var RE_CASED_UP = /\p{Lu}|\p{Lt}/u, RE_LOWER = /\p{Ll}/u, RE_CASED = /[\p{Lu}\p{Ll}\p{Lt}]/u;
  function titleCase(s) {
    var r = '', prevCased = false;
    for (var ch of s) {
      if (RE_CASED.test(ch)) { r += prevCased ? ch.toLowerCase() : ch.toUpperCase(); prevCased = true; }
      else { r += ch; prevCased = false; }
    }
    return r;
  }
  function padStr(s, width, fill, mode) {
    var len = strLen(s);
    if (width <= len) return s;
    var marg = width - len;
    if (mode === 'l') return s + fill.repeat(marg);
    if (mode === 'r') return fill.repeat(marg) + s;
    var left = Math.floor(marg / 2) + (marg & width & 1);
    return fill.repeat(left) + s + fill.repeat(marg - left);
  }
  function fillArg(name, v) {
    if (v === undefined) return ' ';
    if (typeof v !== 'string') throw typeErr(name + '() argument 2 must be str, not ' + tname(v));
    if (strLen(v) !== 1) throw typeErr('The fill character must be exactly one character long');
    return v;
  }
  function stripChars(name, v) {
    if (v === undefined || v === None) return null;
    if (typeof v !== 'string') throw typeErr(name + ' arg must be None or str');
    return v;
  }
  function stripStr(s, chars, left, right) {
    if (chars === null) {
      if (left) s = s.replace(RE_WS_LEFT, '');
      if (right) s = s.replace(RE_WS_RIGHT, '');
      return s;
    }
    var set = new Set(Array.from(chars)), cs = Array.from(s), a = 0, b = cs.length;
    if (left) while (a < b && set.has(cs[a])) a++;
    if (right) while (b > a && set.has(cs[b - 1])) b--;
    return cs.slice(a, b).join('');
  }
  function startsEnds(s, args, ends, name) {
    chkR(name, args, 1, 3);
    var pre = args[0];
    var r = cpIndexArgs(s, args, 1), st = r[0], en = r[1];
    var cands;
    if (typeof pre === 'string') cands = [pre];
    else if (pre instanceof PyTuple) {
      cands = pre.a;
      for (var i = 0; i < cands.length; i++) if (typeof cands[i] !== 'string') throw typeErr('tuple for ' + name + ' must only contain str, not ' + tname(cands[i]));
    } else throw typeErr(name + ' first arg must be str or a tuple of str, not ' + tname(pre));
    if (st > r[2]) return false;
    var sub = isAstral(s) ? Array.from(s).slice(st, Math.max(st, en)).join('') : s.slice(st, Math.max(st, en));
    for (var j = 0; j < cands.length; j++) {
      if (en - st < 0 && cands[j] !== '') continue;
      if (ends ? sub.endsWith(cands[j]) : sub.startsWith(cands[j])) return true;
    }
    return false;
  }
  function splitLines(s, keep) {
    var res = [], i = 0, n = s.length, start = 0;
    while (i < n) {
      var c = s[i], eol = 0;
      if (c === '\r') eol = s[i + 1] === '\n' ? 2 : 1;
      else if (c === '\n' || c === '\v' || c === '\f' || c === '\x1c' || c === '\x1d' || c === '\x1e' || c === '\x85' || c === ' ' || c === ' ') eol = 1;
      if (eol) { res.push(s.slice(start, keep ? i + eol : i)); i += eol; start = i; }
      else i++;
    }
    if (start < n) res.push(s.slice(start));
    return res;
  }
  function strIsTest(re) { return function (self, args) { chkNo('str', args); return self.length > 0 && re.test(self); }; }
  defMethods(T_str, {
    upper: function (self, args) { chkNo('str.upper', args); return self.toUpperCase(); },
    lower: function (self, args) { chkNo('str.lower', args); return self.toLowerCase(); },
    casefold: function (self, args) { chkNo('str.casefold', args); return self.toLowerCase().replace(/ß/g, 'ss'); },
    capitalize: function (self, args) {
      chkNo('str.capitalize', args);
      if (!self) return self;
      var cs = Array.from(self);
      return cs[0].toUpperCase() + cs.slice(1).join('').toLowerCase();
    },
    title: function (self, args) { chkNo('str.title', args); return titleCase(self); },
    swapcase: function (self, args) {
      chkNo('str.swapcase', args);
      var r = '';
      for (var ch of self) r += RE_LOWER.test(ch) ? ch.toUpperCase() : (RE_CASED_UP.test(ch) ? ch.toLowerCase() : ch);
      return r;
    },
    strip: function (self, args) { chkR('strip', args, 0, 1); return stripStr(self, stripChars('strip', args[0]), true, true); },
    lstrip: function (self, args) { chkR('lstrip', args, 0, 1); return stripStr(self, stripChars('lstrip', args[0]), true, false); },
    rstrip: function (self, args) { chkR('rstrip', args, 0, 1); return stripStr(self, stripChars('rstrip', args[0]), false, true); },
    split: function (self, args, kw) {
      var a = parseArgs('split', args, kw, ['sep', 'maxsplit']);
      var sep = a[0] === undefined ? None : a[0], max = a[1] === undefined ? -1 : Number(asIndex(a[1]));
      if (sep === None) return new PyList(splitWhitespace(self, max));
      if (typeof sep !== 'string') throw typeErr('must be str or None, not ' + tname(sep));
      if (sep === '') throw valueErr('empty separator');
      var parts = self.split(sep);
      if (max >= 0 && parts.length > max + 1) parts = parts.slice(0, max).concat([parts.slice(max).join(sep)]);
      return new PyList(parts);
    },
    rsplit: function (self, args, kw) {
      var a = parseArgs('rsplit', args, kw, ['sep', 'maxsplit']);
      var sep = a[0] === undefined ? None : a[0], max = a[1] === undefined ? -1 : Number(asIndex(a[1]));
      if (sep === None) return new PyList(rsplitWhitespace(self, max));
      if (typeof sep !== 'string') throw typeErr('must be str or None, not ' + tname(sep));
      if (sep === '') throw valueErr('empty separator');
      var parts = self.split(sep);
      if (max >= 0 && parts.length > max + 1) parts = [parts.slice(0, parts.length - max).join(sep)].concat(parts.slice(parts.length - max));
      return new PyList(parts);
    },
    splitlines: function (self, args, kw) {
      var a = parseArgs('splitlines', args, kw, ['keepends']);
      return new PyList(splitLines(self, a[0] !== undefined && truthy(a[0])));
    },
    join: function (self, args) {
      chkO('str.join', args);
      var it = args[0], items;
      if (it instanceof PyList || it instanceof PyTuple) items = it.a;
      else {
        try { items = toArray(it); } catch (e) {
          if (e instanceof PyInst && isinst(e, T_TypeError) && !iterableish(it) && !(it && it.nx)) throw typeErr('can only join an iterable');
          throw e;
        }
      }
      for (var i = 0; i < items.length; i++) if (typeof items[i] !== 'string') throw typeErr('sequence item ' + i + ': expected str instance, ' + tname(items[i]) + ' found');
      return items.join(self);
    },
    replace: function (self, args, kw) {
      var a = parseArgs('replace', args, kw, ['old', 'new', 'count']);
      if (args.length < 2 && (a[0] === undefined || a[1] === undefined)) throw typeErr('replace() takes at least 2 positional arguments (' + args.length + ' given)');
      var old = a[0], nw = a[1], count = a[2] === undefined ? -1 : Number(asIndex(a[2]));
      if (typeof old !== 'string') throw typeErr('replace() argument 1 must be str, not ' + tname(old));
      if (typeof nw !== 'string') throw typeErr('replace() argument 2 must be str, not ' + tname(nw));
      if (count < 0) {
        if (old === '') { return nw + Array.from(self).join(nw) + (self.length ? nw : ''); }
        return self.split(old).join(nw);
      }
      if (old === '') {
        var cs = Array.from(self), r = '', k = 0;
        for (var i = 0; i <= cs.length; i++) { if (k < count) { r += nw; k++; } if (i < cs.length) r += cs[i]; }
        return r;
      }
      var res = '', pos = 0, done = 0;
      while (done < count) {
        var j = self.indexOf(old, pos);
        if (j < 0) break;
        res += self.slice(pos, j) + nw; pos = j + old.length; done++;
      }
      return res + self.slice(pos);
    },
    find: function (self, args) { return BigInt(strFind(self, args, false, 'find')); },
    rfind: function (self, args) { return BigInt(strFind(self, args, true, 'rfind')); },
    index: function (self, args) { var r = strFind(self, args, false, 'index'); if (r < 0) throw valueErr('substring not found'); return BigInt(r); },
    rindex: function (self, args) { var r = strFind(self, args, true, 'rindex'); if (r < 0) throw valueErr('substring not found'); return BigInt(r); },
    count: function (self, args) {
      chkR('count', args, 1, 3);
      var sub = args[0];
      if (typeof sub !== 'string') throw typeErr('must be str, not ' + tname(sub));
      var r = cpIndexArgs(self, args, 1), st = r[0], en = r[1];
      if (st > r[2] || en < st) return 0n;
      var part = isAstral(self) ? Array.from(self).slice(st, en).join('') : self.slice(st, en);
      if (sub === '') return BigInt(strLen(part) + 1);
      var c = 0, p = 0;
      for (;;) { var j = part.indexOf(sub, p); if (j < 0) break; c++; p = j + sub.length; }
      return BigInt(c);
    },
    startswith: function (self, args) { return startsEnds(self, args, false, 'startswith'); },
    endswith: function (self, args) { return startsEnds(self, args, true, 'endswith'); },
    isdigit: strIsTest(/^[\p{Nd}²³¹⁰⁴-⁹₀-₉①-⑨⑴-⑼⒈-⒐⓪⓵-⓽⓿❶-❾➀-➈➊-➒]+$/u),
    isdecimal: strIsTest(/^\p{Nd}+$/u),
    isnumeric: strIsTest(/^[\p{N}〇一二三四五六七八九十百千万億兆]+$/u),
    isalpha: strIsTest(/^[\p{L}\p{Nl}]+$/u),
    isalnum: strIsTest(/^[\p{L}\p{N}]+$/u),
    isspace: function (self, args) { chkNo('str.isspace', args); return self.length > 0 && RE_IS_WS.test(self); },
    isascii: function (self) { return /^[\x00-\x7f]*$/.test(self); },
    isidentifier: function (self) { return /^[\p{L}\p{Nl}_][\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}\p{Pc}_]*$/u.test(self); },
    isprintable: function (self) { for (var ch of self) if (!isPrintableChar(ch)) return false; return true; },
    isupper: function (self) {
      var cased = false;
      for (var ch of self) { if (RE_LOWER.test(ch) || /\p{Lt}/u.test(ch)) return false; if (/\p{Lu}/u.test(ch)) cased = true; }
      return cased;
    },
    islower: function (self) {
      var cased = false;
      for (var ch of self) { if (RE_CASED_UP.test(ch)) return false; if (RE_LOWER.test(ch)) cased = true; }
      return cased;
    },
    istitle: function (self) {
      var cased = false, prev = false;
      for (var ch of self) {
        if (RE_CASED_UP.test(ch)) { if (prev) return false; prev = true; cased = true; }
        else if (RE_LOWER.test(ch)) { if (!prev) return false; prev = true; cased = true; }
        else prev = false;
      }
      return cased;
    },
    zfill: function (self, args) {
      chkO('str.zfill', args);
      var w = Number(asIndex(args[0])), len = strLen(self);
      if (w <= len) return self;
      var sign = (self[0] === '+' || self[0] === '-') ? self[0] : '';
      return sign + '0'.repeat(w - len) + self.slice(sign.length);
    },
    center: function (self, args) { chkR('center', args, 1, 2); return padStr(self, Number(asIndex(args[0])), fillArg('center', args[1]), 'c'); },
    ljust: function (self, args) { chkR('ljust', args, 1, 2); return padStr(self, Number(asIndex(args[0])), fillArg('ljust', args[1]), 'l'); },
    rjust: function (self, args) { chkR('rjust', args, 1, 2); return padStr(self, Number(asIndex(args[0])), fillArg('rjust', args[1]), 'r'); },
    format: function (self, args, kw) { return strFormat(self, args, kw); },
    format_map: function (self, args) { chkO('str.format_map', args); return strFormat(self, [], args[0]); },
    partition: function (self, args) {
      chkO('str.partition', args);
      var sep = strArg('partition', args[0]);
      if (sep === '') throw valueErr('empty separator');
      var i = self.indexOf(sep);
      if (i < 0) return new PyTuple([self, '', '']);
      return new PyTuple([self.slice(0, i), sep, self.slice(i + sep.length)]);
    },
    rpartition: function (self, args) {
      chkO('str.rpartition', args);
      var sep = strArg('rpartition', args[0]);
      if (sep === '') throw valueErr('empty separator');
      var i = self.lastIndexOf(sep);
      if (i < 0) return new PyTuple(['', '', self]);
      return new PyTuple([self.slice(0, i), sep, self.slice(i + sep.length)]);
    },
    expandtabs: function (self, args, kw) {
      var a = parseArgs('expandtabs', args, kw, ['tabsize']);
      var ts = a[0] === undefined ? 8 : Number(asIndex(a[0])), r = '', col = 0;
      for (var ch of self) {
        if (ch === '\t') { if (ts > 0) { var sp = ts - (col % ts); r += ' '.repeat(sp); col += sp; } }
        else if (ch === '\n' || ch === '\r') { r += ch; col = 0; }
        else { r += ch; col++; }
      }
      return r;
    },
    removeprefix: function (self, args) { chkO('str.removeprefix', args); var p = strArg('removeprefix', args[0]); return p && self.startsWith(p) ? self.slice(p.length) : self; },
    removesuffix: function (self, args) { chkO('str.removesuffix', args); var p = strArg('removesuffix', args[0]); return p && self.endsWith(p) ? self.slice(0, self.length - p.length) : self; },
    encode: function () { throw pyErr(T_NotImplementedError, 'bytes are not supported in CodeQuest'); },
    translate: function (self, args) {
      chkO('str.translate', args);
      var table = args[0], r = '';
      for (var ch of self) {
        var v;
        try { v = getItem(table, BigInt(ch.codePointAt(0))); } catch (e) {
          if (e instanceof PyInst && isinst(e, T_LookupError)) { r += ch; continue; }
          throw e;
        }
        if (v === None) continue;
        if (typeof v === 'bigint') r += String.fromCodePoint(Number(v));
        else if (typeof v === 'string') r += v;
        else throw typeErr('character mapping must return integer, None or str');
      }
      return r;
    }
  });
  T_str.d.set('maketrans', new PyStaticMethod(new PyBuiltin('maketrans', function (args) {
    var d = new PyDict();
    if (args.length === 1) {
      var src = args[0];
      if (!(src instanceof PyDict)) throw typeErr('if you give only one argument to maketrans it must be a dict');
      src.m.forEach(function (e) {
        var k = e[0];
        if (typeof k === 'string') { if (strLen(k) !== 1) throw valueErr('string keys in translate table must be of length 1'); k = BigInt(k.codePointAt(0)); }
        dictSet(d, k, e[1]);
      });
      return d;
    }
    var x = Array.from(args[0]), y = Array.from(args[1]);
    if (x.length !== y.length) throw valueErr('the first two maketrans arguments must have equal length');
    for (var i = 0; i < x.length; i++) dictSet(d, BigInt(x[i].codePointAt(0)), BigInt(y[i].codePointAt(0)));
    if (args.length > 2) for (var z of args[2]) dictSet(d, BigInt(z.codePointAt(0)), None);
    return d;
  })));

  // ---- list ----
  T_list.call = function (args, kw, cls) {
    chkR('list', args, 0, 1, kw, 'list');
    var l = new PyList(args.length ? toArray(args[0]) : []);
    return l;
  };
  function listIndexArgs(a, args, from) {
    var len = a.length;
    var st = args[from] === undefined ? 0 : Number(asIndex(args[from])), en = args[from + 1] === undefined ? len : Number(asIndex(args[from + 1]));
    if (st < 0) { st += len; if (st < 0) st = 0; }
    if (en < 0) { en += len; if (en < 0) en = 0; }
    return [st, Math.min(en, len)];
  }
  defMethods(T_list, {
    append: function (self, args, kw) { chkO('list.append', args, kw); self.a.push(args[0]); return None; },
    extend: function (self, args, kw) {
      chkO('list.extend', args, kw);
      var src = args[0];
      var items = (src instanceof PyList || src instanceof PyTuple) ? src.a.slice() : toArray(src);
      for (var i = 0; i < items.length; i++) self.a.push(items[i]);
      return None;
    },
    insert: function (self, args, kw) {
      chkR('insert', args, 2, 2, kw);
      var n = self.a.length, i = asIndex(args[0]);
      var idx = i < 0n ? Math.max(0, Number(i) + n) : Math.min(n, Number(i > 9007199254740991n ? 9007199254740991n : i));
      self.a.splice(idx, 0, args[1]);
      return None;
    },
    pop: function (self, args, kw) {
      chkR('pop', args, 0, 1, kw);
      var a = self.a;
      if (!a.length) throw pyErr(T_IndexError, 'pop from empty list');
      if (!args.length) return a.pop();
      var i = Number(asIndex(args[0]));
      if (i < 0) i += a.length;
      if (i < 0 || i >= a.length) throw pyErr(T_IndexError, 'pop index out of range');
      return a.splice(i, 1)[0];
    },
    remove: function (self, args, kw) {
      chkO('list.remove', args, kw);
      var a = self.a;
      for (var i = 0; i < a.length; i++) if (eqBool(a[i], args[0])) { a.splice(i, 1); return None; }
      throw valueErr('list.remove(x): x not in list');
    },
    index: function (self, args, kw) {
      chkR('index', args, 1, 3, kw);
      var a = self.a, r = listIndexArgs(a, args, 1);
      for (var i = r[0]; i < r[1] && i < a.length; i++) if (eqBool(a[i], args[0])) return BigInt(i);
      throw valueErr(pyRepr(args[0]) + ' is not in list');
    },
    count: function (self, args, kw) {
      chkO('list.count', args, kw);
      var c = 0, a = self.a;
      for (var i = 0; i < a.length; i++) if (eqBool(a[i], args[0])) c++;
      return BigInt(c);
    },
    sort: function (self, args, kw) {
      if (args.length) throw typeErr('sort() takes no positional arguments');
      var key = None, rev = false;
      if (kw) kw.forEach(function (v, k) {
        if (k === 'key') key = v; else if (k === 'reverse') rev = truthy(v);
        else throw typeErr("sort() got an unexpected keyword argument '" + k + "'");
      });
      listSort(self, key, rev);
      return None;
    },
    reverse: function (self, args, kw) { chkNo('list.reverse', args, kw); self.a.reverse(); return None; },
    copy: function (self, args, kw) { chkNo('list.copy', args, kw); return new PyList(self.a.slice()); },
    clear: function (self, args, kw) { chkNo('list.clear', args, kw); self.a.length = 0; return None; },
    __iadd__: function (self, args) { return inplaceOp(OP_ADD, self, args[0]); },
    __imul__: function (self, args) { return inplaceOp(OP_MUL, self, args[0]); }
  });

  // ---- tuple ----
  T_tuple.call = function (args, kw) {
    chkR('tuple', args, 0, 1, kw, 'tuple');
    if (!args.length) return EMPTY_TUPLE;
    if (args[0] instanceof PyTuple) return args[0];
    return new PyTuple(toArray(args[0]));
  };
  defMethods(T_tuple, {
    count: function (self, args, kw) {
      chkO('tuple.count', args, kw);
      var c = 0;
      for (var i = 0; i < self.a.length; i++) if (eqBool(self.a[i], args[0])) c++;
      return BigInt(c);
    },
    index: function (self, args, kw) {
      chkR('index', args, 1, 3, kw);
      var a = self.a, r = listIndexArgs(a, args, 1);
      for (var i = r[0]; i < r[1]; i++) if (eqBool(a[i], args[0])) return BigInt(i);
      throw valueErr('tuple.index(x): x not in tuple');
    }
  });

  // ---- dict ----
  T_dict.call = function (args, kw, cls) {
    chkR('dict', args, 0, 1, null);
    var d = new PyDict();
    if (cls !== T_dict) d.cls = cls;
    if (args.length) dictUpdateFrom(d, args[0], false);
    if (kw) kw.forEach(function (v, k) { dictSet(d, k, v); });
    return d;
  };
  function DictView(d, kind) { this.d = d; this.kind = kind; }
  Object.setPrototypeOf(DictView.prototype, OB);
  var DVP = DictView.prototype;
  Object.defineProperty(DVP, 'cls', { get: function () { return this.kind === 0 ? T_dict_keys : this.kind === 1 ? T_dict_values : T_dict_items; } });
  DVP.items = function () {
    var r = [], kind = this.kind;
    this.d.m.forEach(function (e) { r.push(kind === 0 ? e[0] : kind === 1 ? e[1] : new PyTuple([e[0], e[1]])); });
    return r;
  };
  DVP.$repr = function () { return this.cls.name + '(' + reprSeq(this, '[', ']', this.items(), false) + ')'; };
  DVP.$len = function () { return this.d.m.size; };
  DVP.$bool = function () { return this.d.m.size > 0; };
  DVP.$iter = function () { return new FnIterDict(this.d, this.kind); };
  DVP.$contains = function (x) {
    if (this.kind === 0) return this.d.m.has(hkey(x));
    if (this.kind === 2) {
      if (!(x instanceof PyTuple) || x.a.length !== 2) return false;
      var e = this.d.m.get(hkey(x.a[0]));
      return e !== undefined && eqBool(e[1], x.a[1]);
    }
    return containsByIter(this, x);
  };
  DVP.$hkey = function () { throw unhashable(this); };
  DVP.asSet = function () { var s = new PySet(); var it = this.items(); for (var i = 0; i < it.length; i++) setAddKey(s, it[i]); return s; };
  DVP.$cmp = function (b, op) {
    if (this.kind === 1) return NotImplemented;
    var other = b instanceof DictView && b.kind !== 1 ? b.asSet() : (b instanceof PySet ? b : null);
    if (other === null) return NotImplemented;
    return SP.$cmp.call(this.asSet(), other, op);
  };
  function viewSetOp(fn) { return function (b) { if (this.kind === 1) return NotImplemented; var o = b instanceof DictView ? b.asSet() : setFrom(b); return fn(this.asSet(), o); }; }
  DVP.$and = viewSetOp(setIntersection);
  DVP.$or = viewSetOp(function (a, b) { setUpdate(a, b); return a; });
  DVP.$sub = viewSetOp(setDifference);
  DVP.$xor = viewSetOp(setSymDiff);
  DVP.$rand = DVP.$and; DVP.$ror = DVP.$or; DVP.$rxor = DVP.$xor;
  defMethods(T_dict_keys, { isdisjoint: function (self, args) { var o = setFrom(args[0]); return setIntersection(self.asSet(), o).used === 0; } });
  T_dict_keys.getters = T_dict_values.getters = T_dict_items.getters = { mapping: function (v) { return v.d; } };
  defMethods(T_dict, {
    get: function (self, args, kw) {
      chkR('get', args, 1, 2, kw);
      var e = self.m.get(hkey(args[0]));
      return e !== undefined ? e[1] : (args.length > 1 ? args[1] : None);
    },
    keys: function (self, args, kw) { chkNo('dict.keys', args, kw); return new DictView(self, 0); },
    values: function (self, args, kw) { chkNo('dict.values', args, kw); return new DictView(self, 1); },
    items: function (self, args, kw) { chkNo('dict.items', args, kw); return new DictView(self, 2); },
    pop: function (self, args, kw) {
      chkR('pop', args, 1, 2, kw);
      var h = hkey(args[0]), e = self.m.get(h);
      if (e !== undefined) { self.m.delete(h); return e[1]; }
      if (args.length > 1) return args[1];
      throw newExc(T_KeyError, [args[0]]);
    },
    popitem: function (self, args, kw) {
      chkNo('dict.popitem', args, kw);
      if (!self.m.size) throw newExc(T_KeyError, ['popitem(): dictionary is empty']);
      var last = null;
      self.m.forEach(function (e, h) { last = [h, e]; });
      self.m.delete(last[0]);
      return new PyTuple([last[1][0], last[1][1]]);
    },
    update: function (self, args, kw) {
      chkR('update', args, 0, 1, null);
      if (args.length) dictUpdateFrom(self, args[0], false);
      if (kw) kw.forEach(function (v, k) { dictSet(self, k, v); });
      return None;
    },
    setdefault: function (self, args, kw) {
      chkR('setdefault', args, 1, 2, kw);
      var h = hkey(args[0]), e = self.m.get(h);
      if (e !== undefined) return e[1];
      var v = args.length > 1 ? args[1] : None;
      self.m.set(h, [args[0], v]);
      return v;
    },
    copy: function (self, args, kw) {
      chkNo('dict.copy', args, kw);
      var d = new PyDict();
      if (self.cls !== T_dict && self.copyExtra) self.copyExtra(d);
      self.m.forEach(function (e, h) { d.m.set(h, [e[0], e[1]]); });
      return d;
    },
    clear: function (self, args, kw) { chkNo('dict.clear', args, kw); self.m.clear(); return None; },
    __ior__: function (self, args) { dictUpdateFrom(self, args[0], false); return self; }
  });
  T_dict.d.set('fromkeys', new PyClassMethod(new PyBuiltin('fromkeys', function (args) {
    var cls = args[0];
    chkR('fromkeys', args.slice(1), 1, 2, null);
    var v = args.length > 2 ? args[2] : None;
    var d = callAny(cls, []);
    iterate(args[1], function (k) { setItem(d, k, v); });
    return d;
  })));
  DP.$or = function (b) {
    if (!(b instanceof PyDict)) return NotImplemented;
    var d = new PyDict();
    if (this.cls !== T_dict) { d.cls = this.cls; if (this.copyExtra) this.copyExtra(d); }
    this.m.forEach(function (e, h) { d.m.set(h, [e[0], e[1]]); });
    b.m.forEach(function (e) { dictSet(d, e[0], e[1]); });
    return d;
  };
  DP.$iop = function (op, b) {
    if (op === OP_OR) { dictUpdateFrom(this, b, false); return this; }
    return NotImplemented;
  };

  // ---- set / frozenset ----
  T_set.call = function (args, kw) {
    chkR('set', args, 0, 1, kw, 'set');
    return setFrom(args.length ? args[0] : undefined, false);
  };
  T_frozenset.call = function (args, kw) {
    chkR('frozenset', args, 0, 1, kw, 'frozenset');
    if (args.length && args[0] instanceof PyFrozenSet) return args[0];
    return setFrom(args.length ? args[0] : undefined, true);
  };
  var SET_COMMON = {
    copy: function (self, args) { chkNo(self.cls.name + '.copy', args); if (self instanceof PyFrozenSet) return self; return setCopy(self); },
    union: function (self, args) {
      var r = newSetLike(self); setMerge(r, self);
      for (var i = 0; i < args.length; i++) { if (args[i] === self) continue; setUpdate(r, args[i]); }
      return r;
    },
    intersection: function (self, args) {
      if (!args.length) return setCopy(self);
      var r = self;
      for (var i = 0; i < args.length; i++) r = setIntersection(r, args[i]);
      return r === self ? setCopy(self) : r;
    },
    difference: function (self, args) {
      if (!args.length) return setCopy(self);
      var r = setDifference(self, args[0]);
      for (var i = 1; i < args.length; i++) setDifferenceUpdate(r, args[i]);
      return r;
    },
    symmetric_difference: function (self, args) { chkO(self.cls.name + '.symmetric_difference', args); return setSymDiff(self, args[0]); },
    issubset: function (self, args) {
      chkO(self.cls.name + '.issubset', args);
      var o = args[0] instanceof PySet ? args[0] : setFrom(args[0]);
      return setIsSubset(self, o);
    },
    issuperset: function (self, args) {
      chkO(self.cls.name + '.issuperset', args);
      if (args[0] instanceof PySet) return setIsSubset(args[0], self);
      var ok = true;
      iterate(args[0], function (v) { if (ok && !setHas(self, v)) ok = false; });
      return ok;
    },
    isdisjoint: function (self, args) {
      chkO(self.cls.name + '.isdisjoint', args);
      var ok = true;
      iterate(args[0], function (v) { if (ok && setHas(self, v)) ok = false; });
      return ok;
    }
  };
  defMethods(T_frozenset, SET_COMMON);
  defMethods(T_set, SET_COMMON);
  defMethods(T_set, {
    add: function (self, args, kw) { chkO('set.add', args, kw); setAddKey(self, args[0]); return None; },
    remove: function (self, args, kw) {
      chkO('set.remove', args, kw);
      var k = args[0];
      if (k instanceof PySet && !(k instanceof PyFrozenSet)) { var fz = new PyFrozenSet(); setMerge(fz, k); k = fz; }
      if (!setDiscard(self, k)) throw newExc(T_KeyError, [args[0]]);
      return None;
    },
    discard: function (self, args, kw) { chkO('set.discard', args, kw); setDiscard(self, args[0]); return None; },
    pop: function (self, args, kw) {
      chkNo('set.pop', args, kw);
      if (self.used === 0) throw newExc(T_KeyError, ['pop from an empty set']);
      var i = self.finger & self.mask;
      while (self.keys[i] === undefined || self.keys[i] === DUMMY) { i++; if (i > self.mask) i = 0; }
      var k = self.keys[i];
      setDiscardHk(self, self.hks[i]);
      self.finger = i + 1;
      return k;
    },
    clear: function (self, args, kw) { chkNo('set.clear', args, kw); setClear(self); return None; },
    update: function (self, args) { for (var i = 0; i < args.length; i++) setUpdate(self, args[i]); return None; },
    intersection_update: function (self, args) {
      var r = self;
      for (var i = 0; i < args.length; i++) r = setIntersection(r, args[i]);
      if (r === self) r = setCopy(self);
      setSwapBodies(self, r);
      return None;
    },
    difference_update: function (self, args) { for (var i = 0; i < args.length; i++) setDifferenceUpdate(self, args[i]); return None; },
    symmetric_difference_update: function (self, args) { chkO('set.symmetric_difference_update', args); setSymDiffUpdate(self, args[0]); return None; }
  });

  // ---- range ----
  T_range.call = function (args, kw) {
    if (!kwEmpty(kw)) throw typeErr('range() takes no keyword arguments');
    chkR('range', args, 1, 3, null);
    var a = args.map(function (x) { return asIndex(x); });
    if (a.length === 1) return new PyRange(0n, a[0], 1n);
    var step = a.length === 3 ? a[2] : 1n;
    if (step === 0n) throw valueErr('range() arg 3 must not be zero');
    return new PyRange(a[0], a[1], step);
  };
  defMethods(T_range, {
    count: function (self, args) { chkO('range.count', args); return RP.$contains.call(self, args[0]) ? 1n : 0n; },
    index: function (self, args) {
      chkO('range.index', args);
      var x = args[0];
      if ((typeof x === 'bigint' || typeof x === 'boolean') && RP.$contains.call(self, x)) return (toBig(x) - self.start) / self.step;
      if (!(typeof x === 'bigint' || typeof x === 'boolean')) {
        var n = rangeLen(self);
        for (var i = 0n; i < n; i++) if (eqBool(self.start + i * self.step, x)) return i;
      }
      throw valueErr(pyRepr(x) + ' is not in range');
    }
  });
  T_range.getters = { start: function (r) { return r.start; }, stop: function (r) { return r.stop; }, step: function (r) { return r.step; } };
  T_slice.call = function (args, kw) {
    chkR('slice', args, 1, 3, kw);
    if (args.length === 1) return new PySlice(None, args[0], None);
    return new PySlice(args[0], args[1], args.length > 2 ? args[2] : None);
  };
  T_slice.getters = { start: function (s) { return s.start; }, stop: function (s) { return s.stop; }, step: function (s) { return s.step; } };
  defMethods(T_slice, {
    indices: function (self, args) { var si = sliceIndices(self, Number(asIndex(args[0]))); return new PyTuple([BigInt(si[0]), BigInt(si[1]), BigInt(si[2])]); }
  });

  // ---- property, staticmethod, classmethod, super ----
  T_property.call = function (args, kw) {
    var a = parseArgs('property', args, kw, ['fget', 'fset', 'fdel', 'doc']);
    var fget = a[0] === undefined ? None : a[0];
    var doc = a[3] === undefined ? (fget instanceof PyFunc ? fget.doc : None) : a[3];
    return new PyProperty(fget, a[1] === undefined ? None : a[1], a[2] === undefined ? None : a[2], doc);
  };
  T_staticmethod.call = function (args, kw) { chkR('staticmethod', args, 1, 1, kw); return new PyStaticMethod(args[0]); };
  T_classmethod.call = function (args, kw) { chkR('classmethod', args, 1, 1, kw); return new PyClassMethod(args[0]); };
  T_super.call = function (args, kw) {
    if (args.length === 0) throw pyErr(T_RuntimeError, 'super(): no arguments');
    if (args.length === 1) return new PySuper(args[0], None);
    return makeSuper(args[0], args[1]);
  };

  // ---- Fichiers virtuels ----
  var T_file = nativeType('TextIOWrapper');
  T_file.module = '_io';
  function PyFile(name, mode, newline, encoding) {
    this.name = name; this.mode = mode; this.newline = newline; this.encoding = encoding;
    this.closed = false; this.pos = 0; this.data = ''; this.pending = '';
    var m = mode.replace('t', '');
    this.kind = m[0];
    this.plus = m.indexOf('+') >= 0;
    this.readable = this.kind === 'r' || this.plus;
    this.writable = this.kind !== 'r' || this.plus;
  }
  Object.setPrototypeOf(PyFile.prototype, OB);
  PyFile.prototype.cls = T_file;
  var FIP = PyFile.prototype;
  FIP.$repr = function () { return "<_io.TextIOWrapper name=" + pyRepr(this.name) + " mode=" + pyRepr(this.mode) + " encoding='" + (this.encoding || 'UTF-8') + "'>"; };
  FIP.$iter = function () { this.check(); return this; };
  FIP.nx = function () {
    this.check();
    if (!this.readable) throw pyErr(T_UnsupportedOperation, 'not readable');
    var l = this.readLine(-1);
    return l === '' ? undefined : l;
  };
  FIP.check = function () { if (this.closed) throw valueErr('I/O operation on closed file.'); };
  FIP.flushNow = function () {
    if (!this.writable) return;
    if (this.kind === 'a') { if (this.pending) { vfs.set(this.name, (vfs.get(this.name) || '') + this.pending); this.pending = ''; } }
    else vfs.set(this.name, this.data);
  };
  FIP.close = function () {
    if (this.closed) return;
    this.flushNow();
    this.closed = true;
    var i = openFiles.indexOf(this);
    if (i >= 0) openFiles.splice(i, 1);
  };
  FIP.tempUse = function () { if (!this.closed) this.close(); };
  FIP.readLine = function (limit) {
    var d = this.data, p = this.pos;
    if (p >= d.length) return '';
    var end;
    if (this.newline === '') {
      var i = p;
      while (i < d.length && d[i] !== '\n' && d[i] !== '\r') i++;
      end = i < d.length ? (d[i] === '\r' && d[i + 1] === '\n' ? i + 2 : i + 1) : i;
    } else {
      var j = d.indexOf('\n', p);
      end = j < 0 ? d.length : j + 1;
    }
    if (limit >= 0 && end - p > limit) end = p + limit;
    this.pos = end;
    return d.slice(p, end);
  };
  FIP.write = function (s) {
    if (this.kind === 'a') { this.pending += s; this.data += s; return; }
    if (this.pos >= this.data.length) this.data += s;
    else this.data = this.data.slice(0, this.pos) + s + this.data.slice(this.pos + s.length);
    this.pos += s.length;
  };
  function translateNewlines(s, newline) {
    if (newline === None || newline === undefined) return s.replace(/\r\n?/g, '\n');
    return s;
  }
  function openFile(args, kw) {
    var a = parseArgs('open', args, kw, ['file', 'mode', 'buffering', 'encoding', 'errors', 'newline', 'closefd', 'opener'], 1);
    var name = a[0], mode = a[1] === undefined ? 'r' : a[1];
    if (typeof name !== 'string') {
      if (typeof name === 'bigint') throw pyErr(T_OSError, 'file descriptors are not supported in CodeQuest');
      throw typeErr('expected str, bytes or os.PathLike object, not ' + tname(name));
    }
    if (typeof mode !== 'string') throw typeErr("open() argument 'mode' must be str, not " + tname(mode));
    if (!/^(?=.*[rwax])[rwaxbt+]+$/.test(mode) || (mode.match(/[rwax]/g) || []).length !== 1 || /(.).*\1/.test(mode)) throw valueErr('invalid mode: ' + pyRepr(mode));
    if (mode.indexOf('b') >= 0) throw pyErr(T_NotImplementedError, 'binary mode is not supported in CodeQuest');
    var enc = a[3] === undefined || a[3] === None ? null : a[3];
    if (enc !== null && typeof enc !== 'string') throw typeErr("open() argument 'encoding' must be str or None, not " + tname(enc));
    var newline = a[5] === undefined ? None : a[5];
    if (newline !== None && newline !== '' && newline !== '\n' && newline !== '\r' && newline !== '\r\n') throw valueErr('illegal newline value: ' + pyStr(newline));
    if (name === '') throw oserror(T_FileNotFoundError, 2, 'No such file or directory', name);
    var f = new PyFile(name, mode, newline, enc);
    var exists = vfs.has(name);
    if (f.kind === 'r') {
      if (!exists) throw oserror(T_FileNotFoundError, 2, 'No such file or directory', name);
      f.data = translateNewlines(vfs.get(name), newline);
    } else if (f.kind === 'w') {
      vfs.set(name, ''); f.data = '';
    } else if (f.kind === 'x') {
      if (exists) throw oserror(T_FileExistsError, 17, 'File exists', name);
      vfs.set(name, ''); f.data = ''; f.kind = 'w';
    } else if (f.kind === 'a') {
      if (!exists) vfs.set(name, '');
      f.data = translateNewlines(vfs.get(name), newline); f.pos = f.data.length;
    }
    openFiles.push(f);
    return f;
  }
  defMethods(T_file, {
    read: function (self, args) {
      chkR('read', args, 0, 1);
      self.check();
      if (!self.readable) throw pyErr(T_UnsupportedOperation, 'not readable');
      var n = args.length && args[0] !== None ? Number(asIndex(args[0])) : -1;
      var d = self.data, p = self.pos;
      var end = n < 0 ? d.length : Math.min(d.length, p + n);
      self.pos = end;
      return d.slice(p, end);
    },
    readline: function (self, args) {
      chkR('readline', args, 0, 1);
      self.check();
      if (!self.readable) throw pyErr(T_UnsupportedOperation, 'not readable');
      return self.readLine(args.length && args[0] !== None ? Number(asIndex(args[0])) : -1);
    },
    readlines: function (self, args) {
      self.check();
      if (!self.readable) throw pyErr(T_UnsupportedOperation, 'not readable');
      var r = [], l;
      while ((l = self.readLine(-1)) !== '') r.push(l);
      return new PyList(r);
    },
    write: function (self, args) {
      chkO('write', args);
      self.check();
      if (!self.writable) throw pyErr(T_UnsupportedOperation, 'not writable');
      var s = args[0];
      if (typeof s !== 'string') throw typeErr('write() argument must be str, not ' + tname(s));
      self.write(s);
      return BigInt(strLen(s));
    },
    writelines: function (self, args) {
      chkO('writelines', args);
      self.check();
      if (!self.writable) throw pyErr(T_UnsupportedOperation, 'not writable');
      iterate(args[0], function (s) {
        if (typeof s !== 'string') throw typeErr('write() argument must be str, not ' + tname(s));
        self.write(s);
      });
      return None;
    },
    close: function (self) { self.close(); return None; },
    flush: function (self) { self.check(); self.flushNow(); return None; },
    seek: function (self, args) {
      chkR('seek', args, 1, 2);
      self.check();
      var off = Number(asIndex(args[0])), wh = args.length > 1 ? Number(asIndex(args[1])) : 0;
      if (wh === 0) self.pos = off; else if (wh === 2) self.pos = self.data.length + off; else self.pos += off;
      if (self.pos < 0) self.pos = 0;
      return BigInt(self.pos);
    },
    tell: function (self) { self.check(); return BigInt(self.pos); },
    readable: function (self) { self.check(); return self.readable; },
    writable: function (self) { self.check(); return self.writable; },
    __enter__: function (self) { self.check(); return self; },
    __exit__: function (self) { self.close(); return None; },
    __iter__: function (self) { self.check(); return self; },
    __next__: function (self) { var v = self.nx(); if (v === undefined) throw newExc(T_StopIteration, []); return v; }
  });
  T_file.getters = {
    closed: function (f) { return f.closed; }, name: function (f) { return f.name; }, mode: function (f) { return f.mode; },
    encoding: function (f) { return f.encoding || 'UTF-8'; }
  };

  // ---- Fonctions natives (builtins) ----
  function defBuiltin(name, fn) { var b = new PyBuiltin(name, fn); BUILTINS.set(name, b); return b; }
  function iterTypeCall(t, fn) { t.call = function (args, kw) { return fn(args, kw); }; BUILTINS.set(t.name, t); }

  defBuiltin('print', function (args, kw) {
    var sep = ' ', end = '\n', file = None;
    if (kw) kw.forEach(function (v, k) {
      if (k === 'sep') { if (v !== None && typeof v !== 'string') throw typeErr('sep must be None or a string, not ' + tname(v)); sep = v === None ? ' ' : v; }
      else if (k === 'end') { if (v !== None && typeof v !== 'string') throw typeErr('end must be None or a string, not ' + tname(v)); end = v === None ? '\n' : v; }
      else if (k === 'file') file = v;
      else if (k === 'flush') { /* rien */ }
      else throw typeErr("print() got an unexpected keyword argument '" + k + "'");
    });
    var parts = new Array(args.length);
    for (var i = 0; i < args.length; i++) { var a = args[i]; parts[i] = typeof a === 'string' ? a : pyStr(a); }
    var s = parts.join(sep) + end;
    if (file === None || file === STDOUT) write(s);
    else if (file === STDERR) { /* stderr : ignoré */ }
    else callAny(getAttr(file, 'write'), [s]);
    return None;
  });
  defBuiltin('input', function (args, kw) {
    chkR('input', args, 0, 1, kw);
    if (args.length) write(pyStr(args[0]));
    if (stdinPos >= stdinLines.length) throw newExc(T_EOFError, ['EOF when reading a line']);
    return stdinLines[stdinPos++];
  });
  defBuiltin('len', function (args, kw) { chkO('len', args, kw); return BigInt(pyLen(args[0])); });
  defBuiltin('repr', function (args, kw) { chkO('repr', args, kw); return pyRepr(args[0]); });
  defBuiltin('ascii', function (args, kw) { chkO('ascii', args, kw); return asciiRepr(args[0]); });
  defBuiltin('abs', function (args, kw) { chkO('abs', args, kw); return pyAbs(args[0]); });
  defBuiltin('callable', function (args, kw) {
    chkO('callable', args, kw);
    var o = args[0];
    if (typeof o !== 'object') return false;
    if (o instanceof PyInst) return lookup(o.cls, '__call__') !== undefined;
    return !!o.$call;
  });
  var primIds = new Map();
  defBuiltin('id', function (args, kw) {
    chkO('id', args, kw);
    var o = args[0];
    if (typeof o === 'object') return BigInt(objId(o));
    var k = typeof o + ':' + String(o);
    if (!primIds.has(k)) primIds.set(k, 139000000000000 + primIds.size * 32);
    return BigInt(primIds.get(k));
  });
  defBuiltin('hash', function (args, kw) { chkO('hash', args, kw); hkey(args[0]); return BigInt(pyHash(args[0])); });
  defBuiltin('ord', function (args, kw) {
    chkO('ord', args, kw);
    var c = args[0];
    if (typeof c !== 'string') throw typeErr('ord() expected string of length 1, but ' + tname(c) + ' found');
    var n = strLen(c);
    if (n !== 1) throw typeErr('ord() expected a character, but string of length ' + n + ' found');
    return BigInt(c.codePointAt(0));
  });
  defBuiltin('chr', function (args, kw) {
    chkO('chr', args, kw);
    var i = asIndex(args[0]);
    if (i < 0n || i > 0x10ffffn) throw valueErr('chr() arg not in range(0x110000)');
    return String.fromCodePoint(Number(i));
  });
  function baseRepr(v, base, prefix) {
    var n = asIndex(v);
    var neg = n < 0n;
    return (neg ? '-' : '') + prefix + (neg ? -n : n).toString(base);
  }
  defBuiltin('hex', function (args, kw) { chkO('hex', args, kw); return baseRepr(args[0], 16, '0x'); });
  defBuiltin('bin', function (args, kw) { chkO('bin', args, kw); return baseRepr(args[0], 2, '0b'); });
  defBuiltin('oct', function (args, kw) { chkO('oct', args, kw); return baseRepr(args[0], 8, '0o'); });
  defBuiltin('format', function (args, kw) {
    chkR('format', args, 1, 2, kw);
    var spec = args.length > 1 ? args[1] : '';
    if (typeof spec !== 'string') throw typeErr('format() argument 2 must be str, not ' + tname(spec));
    return pyFormat(args[0], spec);
  });
  defBuiltin('isinstance', function (args, kw) {
    chkR('isinstance', args, 2, 2, kw);
    return isinstanceCheck(args[0], args[1]);
  });
  function isinstanceCheck(o, ci) {
    if (ci instanceof PyType) {
      if (!ci.native) { var ic = lookup(typeOf(ci), '__instancecheck__'); void ic; }
      return isinst(o, ci);
    }
    if (ci instanceof PyTuple) { for (var i = 0; i < ci.a.length; i++) if (isinstanceCheck(o, ci.a[i])) return true; return false; }
    if (ci instanceof PyGenericAlias && ci.union) return isinstanceCheck(o, ci.args);
    if (ci instanceof PyGenericAlias) throw typeErr('isinstance() argument 2 cannot be a parameterized generic');
    throw typeErr('isinstance() arg 2 must be a type, a tuple of types, or a union');
  }
  defBuiltin('issubclass', function (args, kw) {
    chkR('issubclass', args, 2, 2, kw);
    var c = args[0];
    if (!(c instanceof PyType)) throw typeErr('issubclass() arg 1 must be a class');
    function chk(ci) {
      if (ci instanceof PyType) return isSubtype(c, ci);
      if (ci instanceof PyTuple) { for (var i = 0; i < ci.a.length; i++) if (chk(ci.a[i])) return true; return false; }
      if (ci instanceof PyGenericAlias && ci.union) return chk(ci.args);
      throw typeErr('issubclass() arg 2 must be a class, a tuple of classes, or a union');
    }
    return chk(args[1]);
  });
  defBuiltin('hasattr', function (args, kw) {
    chkR('hasattr', args, 2, 2, kw);
    if (typeof args[1] !== 'string') throw typeErr("attribute name must be string, not '" + tname(args[1]) + "'");
    try { getAttr(args[0], args[1]); return true; } catch (e) { if (e instanceof PyInst && isinst(e, T_AttributeError)) return false; throw e; }
  });
  defBuiltin('getattr', function (args, kw) {
    chkR('getattr', args, 2, 3, kw);
    if (typeof args[1] !== 'string') throw typeErr("attribute name must be string, not '" + tname(args[1]) + "'");
    if (args.length === 3) return getAttrOr(args[0], args[1], args[2]);
    return getAttr(args[0], args[1]);
  });
  defBuiltin('setattr', function (args, kw) {
    chkR('setattr', args, 3, 3, kw);
    if (typeof args[1] !== 'string') throw typeErr("attribute name must be string, not '" + tname(args[1]) + "'");
    setAttr(args[0], args[1], args[2]);
    return None;
  });
  defBuiltin('delattr', function (args, kw) {
    chkR('delattr', args, 2, 2, kw);
    if (typeof args[1] !== 'string') throw typeErr("attribute name must be string, not '" + tname(args[1]) + "'");
    delAttr(args[0], args[1]);
    return None;
  });
  defBuiltin('iter', function (args, kw) {
    chkR('iter', args, 1, 2, kw);
    if (args.length === 2) {
      var fn = args[0], sentinel = args[1];
      if (!(typeof fn === 'object' && fn.$call)) throw typeErr('iter(v, w): v must be callable');
      var done = false;
      return new FnIter(T_callable_iterator, function () {
        if (done) return undefined;
        var v = callAny(fn, []);
        if (eqBool(v, sentinel)) { done = true; return undefined; }
        return v;
      });
    }
    return getIter(args[0]);
  });
  defBuiltin('next', function (args, kw) {
    chkR('next', args, 1, 2, kw);
    return pyNext(args[0], args.length > 1 ? args[1] : undefined);
  });
  defBuiltin('any', function (args, kw) {
    chkO('any', args, kw);
    var it = getIter(args[0]), v;
    while ((v = it.nx()) !== undefined) { if (++steps > nextCheck) checkLimits(); if (truthy(v)) return true; }
    return false;
  });
  defBuiltin('all', function (args, kw) {
    chkO('all', args, kw);
    var it = getIter(args[0]), v;
    while ((v = it.nx()) !== undefined) { if (++steps > nextCheck) checkLimits(); if (!truthy(v)) return false; }
    return true;
  });
  function minMax(name, args, kw, isMax) {
    var key = None, dflt;
    if (kw) kw.forEach(function (v, k) {
      if (k === 'key') key = v; else if (k === 'default') dflt = v;
      else throw typeErr(name + "() got an unexpected keyword argument '" + k + "'");
    });
    if (!args.length) throw typeErr(name + ' expected at least 1 argument, got 0');
    var items;
    if (args.length === 1) items = getIter(args[0]);
    else {
      if (dflt !== undefined) throw typeErr('Cannot specify a default for ' + name + '() with multiple positional arguments');
      items = new ListIter(new PyTuple(args), T_tuple_iterator);
    }
    var best, bestKey, v, op = isMax ? '>' : '<';
    while ((v = items.nx()) !== undefined) {
      if (++steps > nextCheck) checkLimits();
      var k = key === None ? v : callAny(key, [v]);
      if (best === undefined) { best = v; bestKey = k; continue; }
      var c;
      if (typeof k === typeof bestKey && (typeof k === 'bigint' || typeof k === 'number')) c = isMax ? k > bestKey : k < bestKey;
      else { var r = richCmp(k, bestKey, op); c = r === true || (r !== false && truthy(r)); }
      if (c) { best = v; bestKey = k; }
    }
    if (best === undefined) {
      if (dflt !== undefined) return dflt;
      throw valueErr(name + '() iterable argument is empty');
    }
    return best;
  }
  defBuiltin('max', function (args, kw) { return minMax('max', args, kw, true); });
  defBuiltin('min', function (args, kw) { return minMax('min', args, kw, false); });
  defBuiltin('sum', function (args, kw) {
    var start = 0n;
    if (kw) kw.forEach(function (v, k) { if (k === 'start') start = v; else throw typeErr("sum() got an unexpected keyword argument '" + k + "'"); });
    if (!args.length) throw typeErr('sum() takes at least 1 positional argument (0 given)');
    if (args.length > 2) throw typeErr('sum() takes at most 2 arguments (' + args.length + ' given)');
    if (args.length === 2) start = args[1];
    if (typeof start === 'string') throw typeErr("sum() can't sum strings [use ''.join(seq) instead]");
    var it = getIter(args[0]), v, result = start;
    // entiers
    if (typeof result === 'bigint' || typeof result === 'boolean') {
      var ir = toBig(result);
      for (;;) {
        v = it.nx();
        if (v === undefined) return ir;
        if (++steps > nextCheck) checkLimits();
        if (typeof v === 'bigint') { ir += v; continue; }
        if (typeof v === 'boolean') { ir += v ? 1n : 0n; continue; }
        result = binop(OP_ADD, ir, v);
        break;
      }
    }
    // flottants : sommation compensée de Neumaier (CPython 3.12+)
    if (typeof result === 'number') {
      var fr = result, c = 0.0;
      for (;;) {
        v = it.nx();
        if (v === undefined) { if (c && isFinite(c)) fr += c; return fr; }
        if (++steps > nextCheck) checkLimits();
        if (typeof v === 'number') {
          var t = fr + v;
          if (Math.abs(fr) >= Math.abs(v)) c += (fr - t) + v; else c += (v - t) + fr;
          fr = t;
          continue;
        }
        if ((typeof v === 'bigint' && v >= -9223372036854775808n && v <= 9223372036854775807n) || typeof v === 'boolean') { fr += toFloat(v); continue; }
        if (c && isFinite(c)) fr += c;
        result = binop(OP_ADD, fr, v);
        break;
      }
    }
    while ((v = it.nx()) !== undefined) {
      if (++steps > nextCheck) checkLimits();
      result = binop(OP_ADD, result, v);
    }
    return result;
  });
  defBuiltin('sorted', function (args, kw) {
    if (args.length !== 1) throw typeErr('sorted expected 1 argument, got ' + args.length);
    var key = None, rev = false;
    if (kw) kw.forEach(function (v, k) {
      if (k === 'key') key = v; else if (k === 'reverse') rev = truthy(v);
      else throw typeErr("sort() got an unexpected keyword argument '" + k + "'");
    });
    var l = new PyList(toArray(args[0]));
    listSort(l, key, rev);
    return l;
  });
  function builtinReversed(args, kw) {
    chkR('reversed', args, 1, 1, kw);
    var s = args[0];
    if (s instanceof PyList) return new RevListIter(s);
    if (s instanceof PyInst) {
      var rv = lookup(s.cls, '__reversed__');
      if (rv !== undefined) return callDunder(s, rv, []);
    }
    if (s instanceof PyDict) { var keys = []; s.m.forEach(function (e) { keys.push(e[0]); }); var i0 = keys.length; return new FnIter(T_dict_reverseiterator, function () { return i0 > 0 ? keys[--i0] : undefined; }); }
    if (s instanceof DictView) { var its = s.items(), j0 = its.length; return new FnIter(T_dict_reverseiterator, function () { return j0 > 0 ? its[--j0] : undefined; }); }
    var n;
    try { n = (typeof s === 'string' || s instanceof PyTuple || s instanceof PyRange || (s instanceof PyInst && lookup(s.cls, '__getitem__') && lookup(s.cls, '__len__'))) ? pyLen(s) : undefined; } catch (e) { throw e; }
    if (n === undefined || (s && s.$reversible === false)) throw typeErr("'" + tname(s) + "' object is not reversible");
    var i = n;
    if (s instanceof PyRange) { var r = s; var cnt = rangeLen(r), k = cnt; return new FnIter(T_range_iterator, function () { if (k <= 0n) return undefined; k--; return r.start + k * r.step; }); }
    var chars = typeof s === 'string' ? strChars(s) : null;
    return new FnIter(T_reversed, function () {
      if (i <= 0) return undefined;
      i--;
      if (chars) return chars[i];
      return getItem(s, BigInt(i));
    });
  }
  iterTypeCall(T_reversed, builtinReversed);
  iterTypeCall(T_enumerate, function (args, kw) {
    var a = parseArgs('enumerate', args, kw, ['iterable', 'start']);
    if (a[0] === undefined) throw typeErr("enumerate() missing required argument 'iterable'");
    var it = getIter(a[0]), n = a[1] === undefined ? 0n : asIndex(a[1]);
    return new FnIter(T_enumerate, function () {
      var v = it.nx();
      if (v === undefined) return undefined;
      var r = new PyTuple([n, v]); n++;
      return r;
    });
  });
  iterTypeCall(T_zip, function (args, kw) {
    var strict = false;
    if (kw) kw.forEach(function (v, k) { if (k === 'strict') strict = truthy(v); else throw typeErr("zip() got an unexpected keyword argument '" + k + "'"); });
    var its = args.map(getIter), done = false;
    return new FnIter(T_zip, function () {
      if (done || !its.length) return undefined;
      var r = new Array(its.length);
      for (var i = 0; i < its.length; i++) {
        var v = its[i].nx();
        if (v === undefined) {
          done = true;
          if (strict) {
            if (i > 0) throw valueErr('zip() argument ' + (i + 1) + ' is shorter than argument' + (i > 1 ? 's 1-' + i : ' 1'));
            for (var j = 1; j < its.length; j++) if (its[j].nx() !== undefined) throw valueErr('zip() argument ' + (j + 1) + ' is longer than argument' + (j > 1 ? 's 1-' + j : ' 1'));
          }
          return undefined;
        }
        r[i] = v;
      }
      return new PyTuple(r);
    });
  });
  iterTypeCall(T_map, function (args, kw) {
    if (!kwEmpty(kw)) throw typeErr('map() takes no keyword arguments');
    if (args.length < 2) throw typeErr('map() must have at least two arguments.');
    var fn = args[0], its = args.slice(1).map(getIter), done = false;
    return new FnIter(T_map, function () {
      if (done) return undefined;
      var vals = new Array(its.length);
      for (var i = 0; i < its.length; i++) { var v = its[i].nx(); if (v === undefined) { done = true; return undefined; } vals[i] = v; }
      return callAny(fn, vals);
    });
  });
  iterTypeCall(T_filter, function (args, kw) {
    if (!kwEmpty(kw)) throw typeErr('filter() takes no keyword arguments');
    chkR('filter', args, 2, 2, null);
    var fn = args[0], it = getIter(args[1]);
    return new FnIter(T_filter, function () {
      var v;
      while ((v = it.nx()) !== undefined) {
        if (++steps > nextCheck) checkLimits();
        if (fn === None ? truthy(v) : truthy(callAny(fn, [v]))) return v;
      }
      return undefined;
    });
  });
  function builtinRound(args, kw) {
    var a = parseArgs('round', args, kw, ['number', 'ndigits'], 1);
    var x = a[0], nd = a[1] === undefined ? None : a[1];
    if (typeof x === 'bigint' || typeof x === 'boolean') {
      var n = toBig(x);
      if (nd === None) return n;
      return roundIntNd(n, Number(asIndex(nd)));
    }
    if (typeof x === 'number') {
      if (nd === None) return roundHalfEvenToInt(x);
      return roundFloat(x, Number(asIndex(nd)));
    }
    if (x instanceof PyInst) {
      var f = lookup(x.cls, '__round__');
      if (f !== undefined) return callDunder(x, f, nd === None ? [] : [nd]);
    }
    throw typeErr('type ' + tname(x) + " doesn't define __round__ method");
  }
  defBuiltin('round', builtinRound);
  defBuiltin('pow', function (args, kw) {
    var a = parseArgs('pow', args, kw, ['base', 'exp', 'mod'], 2);
    if (a[2] !== undefined && a[2] !== None) {
      if (!isIntLike(a[0]) || !isIntLike(a[1]) || !isIntLike(a[2])) {
        if (a[0] instanceof PyInst) { var f = lookup(a[0].cls, '__pow__'); if (f) return callDunder(a[0], f, [a[1], a[2]]); }
        throw typeErr('pow() 3rd argument not allowed unless all arguments are integers');
      }
      return modPow(toBig(a[0]), toBig(a[1]), toBig(a[2]));
    }
    return binop(OP_POW, a[0], a[1]);
  });
  defBuiltin('divmod', function (args, kw) {
    if (args.length !== 2) throw typeErr('divmod expected 2 arguments, got ' + args.length);
    var a = args[0], b = args[1], ka = numKind(a), kb = numKind(b);
    if (ka && kb) {
      if (ka === 2 || kb === 2) {
        var x = toFloat(a), y = toFloat(b);
        if (y === 0) throw pyErr(T_ZeroDivisionError, 'float divmod()');
        var r = floatDivmod(x, y);
        return new PyTuple([r[0], r[1]]);
      }
      var bi = toBig(a), bj = toBig(b);
      if (bj === 0n) throw pyErr(T_ZeroDivisionError, 'integer division or modulo by zero');
      return new PyTuple([floorDivInt(bi, bj), modInt(bi, bj)]);
    }
    if (a instanceof PyInst) { var f = lookup(a.cls, '__divmod__'); if (f) { var rr = callDunder(a, f, [b]); if (rr !== NotImplemented) return rr; } }
    if (b instanceof PyInst) { var g = lookup(b.cls, '__rdivmod__'); if (g) { var r2 = callDunder(b, g, [a]); if (r2 !== NotImplemented) return r2; } }
    throw typeErr("unsupported operand type(s) for divmod(): '" + tname(a) + "' and '" + tname(b) + "'");
  });
  defBuiltin('vars', function (args, kw) {
    chkR('vars', args, 0, 1, kw);
    if (!args.length) throw pyErr(T_NotImplementedError, 'vars() without argument is not supported in CodeQuest');
    var o = args[0];
    if (o instanceof PyInst) return instDict(o);
    if (o instanceof PyModule || o instanceof PyType) return getAttr(o, '__dict__');
    throw typeErr('vars() argument must have __dict__ attribute');
  });
  defBuiltin('dir', function (args, kw) {
    chkR('dir', args, 0, 1, kw);
    if (!args.length) { var names = []; currentGlobals.forEach(function (v, k) { names.push(k); }); return new PyList(names.sort()); }
    return new PyList(dirOf(args[0]));
  });
  var currentGlobals = new Map();
  defBuiltin('globals', function (args, kw) {
    chkNo('globals', args, kw);
    var d = new PyDict();
    currentGlobals.forEach(function (v, k) { dictSet(d, k, v); });
    return d;
  });
  defBuiltin('locals', function () { return BUILTINS.get('globals').fn([], null); });
  defBuiltin('open', openFile);
  function exitFn(args) {
    var e = newExc(T_SystemExit, args.slice(0, 1));
    e.d.set('code', args.length ? args[0] : None);
    throw e;
  }
  defBuiltin('exit', exitFn);
  defBuiltin('quit', exitFn);
  ['eval', 'exec', 'compile', 'breakpoint', 'help', 'memoryview', 'bytes', 'bytearray', 'complex', '__import__', 'aiter', 'anext'].forEach(function (n) {
    defBuiltin(n, function () { throw pyErr(T_NotImplementedError, n + '() is not supported in CodeQuest'); });
  });
  [T_object, T_type, T_int, T_float, T_bool, T_str, T_list, T_tuple, T_dict, T_set, T_frozenset, T_range, T_slice,
    T_property, T_staticmethod, T_classmethod, T_super].forEach(function (t) { BUILTINS.set(t.name, t); });
  BUILTINS.set('None', None);
  BUILTINS.set('NotImplemented', NotImplemented);
  BUILTINS.set('Ellipsis', Ellipsis);
  BUILTINS.set('True', true);
  BUILTINS.set('False', false);
  BUILTINS.set('__name__', 'builtins');
  BUILTINS.set('__build_class__', new PyBuiltin('__build_class__', function () { throw pyErr(T_NotImplementedError, '__build_class__'); }));
  var BUILTIN_ORDER = ['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__build_class__', '__import__', 'abs', 'all', 'any', 'ascii', 'bin', 'breakpoint', 'callable', 'chr', 'compile', 'delattr', 'dir', 'divmod', 'eval', 'exec', 'format', 'getattr', 'globals', 'hasattr', 'hash', 'hex', 'id', 'input', 'isinstance', 'issubclass', 'iter', 'aiter', 'len', 'locals', 'max', 'min', 'next', 'anext', 'oct', 'ord', 'pow', 'print', 'repr', 'round', 'setattr', 'sorted', 'sum', 'vars', 'None', 'Ellipsis', 'NotImplemented', 'False', 'True', 'bool', 'memoryview', 'bytearray', 'bytes', 'classmethod', 'complex', 'dict', 'enumerate', 'filter', 'float', 'frozenset', 'property', 'int', 'list', 'map', 'object', 'range', 'reversed', 'set', 'slice', 'staticmethod', 'str', 'super', 'tuple', 'type', 'zip', '__debug__', 'BaseException', 'BaseExceptionGroup', 'Exception', 'GeneratorExit', 'KeyboardInterrupt', 'SystemExit', 'ArithmeticError', 'AssertionError', 'AttributeError', 'BufferError', 'EOFError', 'ImportError', 'LookupError', 'MemoryError', 'NameError', 'OSError', 'ReferenceError', 'RuntimeError', 'StopAsyncIteration', 'StopIteration', 'SyntaxError', 'SystemError', 'TypeError', 'ValueError', 'Warning', 'FloatingPointError', 'OverflowError', 'ZeroDivisionError', 'BytesWarning', 'DeprecationWarning', 'EncodingWarning', 'FutureWarning', 'ImportWarning', 'PendingDeprecationWarning', 'ResourceWarning', 'RuntimeWarning', 'SyntaxWarning', 'UnicodeWarning', 'UserWarning', 'BlockingIOError', 'ChildProcessError', 'ConnectionError', 'FileExistsError', 'FileNotFoundError', 'InterruptedError', 'IsADirectoryError', 'NotADirectoryError', 'PermissionError', 'ProcessLookupError', 'TimeoutError', 'IndentationError', '_IncompleteInputError', 'IndexError', 'KeyError', 'ModuleNotFoundError', 'NotImplementedError', 'PythonFinalizationError', 'RecursionError', 'UnboundLocalError', 'UnicodeError', 'BrokenPipeError', 'ConnectionAbortedError', 'ConnectionRefusedError', 'ConnectionResetError', 'TabError', 'UnicodeDecodeError', 'UnicodeEncodeError', 'UnicodeTranslateError', 'ExceptionGroup', 'EnvironmentError', 'IOError', 'open', 'quit', 'exit', 'copyright', 'credits', 'license', 'help'];
  var STDLIB_NAMES = new Set(('__future__ abc antigravity argparse array ast asyncio atexit base64 bdb binascii bisect builtins bz2 cProfile calendar cmath cmd code codecs codeop collections colorsys compileall concurrent configparser contextlib contextvars copy copyreg csv ctypes curses dataclasses datetime dbm decimal difflib dis doctest email encodings ensurepip enum errno faulthandler fcntl filecmp fileinput fnmatch fractions ftplib functools gc genericpath getopt getpass gettext glob graphlib grp gzip hashlib heapq hmac html http idlelib imaplib importlib inspect io ipaddress itertools json keyword linecache locale logging lzma mailbox marshal math mimetypes mmap modulefinder msvcrt multiprocessing netrc nt ntpath nturl2path numbers opcode operator optparse os pathlib pdb pickle pickletools pkgutil platform plistlib poplib posix posixpath pprint profile pstats pty pwd py_compile pyclbr pydoc pydoc_data pyexpat queue quopri random re readline reprlib resource rlcompleter runpy sched secrets select selectors shelve shlex shutil signal site smtplib socket socketserver sqlite3 sre_compile sre_constants sre_parse ssl stat statistics string stringprep struct subprocess symtable sys sysconfig syslog tabnanny tarfile tempfile termios textwrap this threading time timeit tkinter token tokenize tomllib trace traceback tracemalloc tty turtle turtledemo types typing unicodedata unittest urllib uuid venv warnings wave weakref webbrowser winreg winsound wsgiref xml xmlrpc zipapp zipfile zipimport zlib zoneinfo').split(' '));
