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
    e.$line = 0; e.$depth = -1; e.$raised = false;
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
