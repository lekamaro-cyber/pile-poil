// Coloration syntaxique légère (Python, JavaScript, TypeScript, HTML, CSS, SQL, Bash, C, C++, Java, C#, PHP, Dart, JSON).
// Elle découpe le code en jetons puis produit une ligne HTML par ligne de code.
(function (root) {
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function words(s) { var o = {}; s.split(/\s+/).forEach(function (w) { if (w) o[w] = true; }); return o; }

  var KW = {
    python: words('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self'),
    javascript: words('var let const function return if else for while do break continue switch case default new delete typeof instanceof in of class extends super this null undefined true false try catch finally throw async await yield import export from as static get set void'),
    typescript: words('var let const function return if else for while do break continue switch case default new delete typeof instanceof in of class extends super this null undefined true false try catch finally throw async await import export from as static get set void interface type enum implements public private protected readonly abstract keyof namespace declare string number boolean any unknown never'),
    c: words('auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while NULL bool true false size_t'),
    cpp: words('auto break case char const continue default do double else enum extern float for goto if int long return short signed sizeof static struct switch typedef union unsigned void volatile while bool true false class public private protected virtual override new delete this namespace using template typename nullptr const_cast std include try catch throw'),
    java: words('abstract boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws try void while true false var record'),
    csharp: words('abstract bool break byte case catch char class const continue decimal default do double else enum false finally float for foreach if in int interface internal is long namespace new null object out override private protected public readonly return static string struct switch this throw true try using var void while async await get set record'),
    dart: words('abstract as async await break case catch class const continue default do dynamic else enum extends false final finally for if import in is late new null required return static super switch this throw true try var void while with int double String bool List Map Set Widget build override'),
    php: words('abstract and array as break case catch class clone const continue declare default do echo else elseif empty extends final finally fn for foreach function global if implements include instanceof interface isset list match namespace new null or print private protected public require return static switch throw true false try unset use var while'),
    sql: words('select from where and or not in is null as order by asc desc limit offset insert into values update set delete create table primary key foreign references join inner left right outer on group having distinct count sum avg min max between like exists union all case when then else end integer text real int varchar default unique index drop alter add constraint with check autoincrement'),
    bash: words('if then else elif fi for while do done case esac in function return local export echo read exit cd ls cat grep mkdir rm cp mv touch pwd git chmod sudo source test true false')
  };
  var BI = {
    python: words('print input len range int float str bool list dict set tuple type isinstance abs min max sum sorted reversed enumerate zip map filter round open any all repr super object Exception ValueError TypeError KeyError IndexError ZeroDivisionError'),
    javascript: words('console document window Math JSON Array Object String Number Boolean Promise Map Set Date Error fetch parseInt parseFloat setTimeout localStorage'),
  };
  BI.typescript = BI.javascript;

  function rx(src, flags) { return new RegExp(src, 'y' + (flags || '')); }
  var R = {
    ws: rx('\\s+'),
    hashCom: rx('#.*'),
    slashCom: rx('//.*'),
    blockCom: rx('/\\*[\\s\\S]*?(\\*/|$)'),
    dashCom: rx('--.*'),
    pyStr3: rx('[rRbBfFuU]{0,2}("""[\\s\\S]*?("""|$)|\'\'\'[\\s\\S]*?(\'\'\'|$))'),
    pyStr: rx('[rRbBfFuU]{0,2}("(\\\\.|[^"\\\\\\n])*"?|\'(\\\\.|[^\'\\\\\\n])*\'?)'),
    str: rx('"(\\\\.|[^"\\\\\\n])*"?|\'(\\\\.|[^\'\\\\\\n])*\'?'),
    tpl: rx('`(\\\\.|[^`\\\\])*`?'),
    num: rx('(0[xXbBoO][\\da-fA-F_]+|\\d[\\d_]*(\\.\\d[\\d_]*)?([eE][+-]?\\d+)?[jJfFLlnu]*|\\.\\d+)'),
    ident: rx('[A-Za-z_$][\\w$]*'),
    deco: rx('@[A-Za-z_][\\w.]*'),
    phpVar: rx('\\$[A-Za-z_]\\w*'),
    shVar: rx('\\$(\\{[^}]*\\}|[A-Za-z_]\\w*|[0-9#@?$*])'),
    pre: rx('#\\s*\\w+.*'),
    op: rx('[+\\-*/%=<>!&|^~?:.,;]+'),
    any: rx('[\\s\\S]')
  };

  function lex(code, rules) {
    var toks = [], i = 0;
    while (i < code.length) {
      var matched = false;
      for (var r = 0; r < rules.length; r++) {
        var re = rules[r][0];
        re.lastIndex = i;
        var m = re.exec(code);
        if (m && m[0].length) {
          var cls = typeof rules[r][1] === 'function' ? rules[r][1](m[0], code, i + m[0].length) : rules[r][1];
          toks.push([m[0], cls]);
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) { toks.push([code[i], '']); i++; }
    }
    return toks;
  }

  function identClass(lang) {
    var kw = KW[lang] || {}, bi = BI[lang] || {};
    var ci = lang === 'sql';
    return function (w, code, end) {
      var key = ci ? w.toLowerCase() : w;
      if (kw[key]) return 'kw';
      if (bi[w]) return 'bi';
      var rest = code.slice(end, end + 3);
      if (/^\s*\(/.test(rest)) return 'fn';
      return '';
    };
  }

  function rulesFor(lang) {
    var id = [R.ident, identClass(lang)];
    switch (lang) {
      case 'python': return [[R.ws, ''], [R.hashCom, 'com'], [R.pyStr3, 'str'], [R.pyStr, 'str'], [R.deco, 'bi'], [R.num, 'num'], id, [R.op, 'op']];
      case 'javascript': case 'typescript': return [[R.ws, ''], [R.slashCom, 'com'], [R.blockCom, 'com'], [R.tpl, 'str'], [R.str, 'str'], [R.num, 'num'], id, [R.op, 'op']];
      case 'c': case 'cpp': return [[R.ws, ''], [R.slashCom, 'com'], [R.blockCom, 'com'], [R.pre, 'kw'], [R.str, 'str'], [R.num, 'num'], id, [R.op, 'op']];
      case 'java': case 'csharp': case 'dart': return [[R.ws, ''], [R.slashCom, 'com'], [R.blockCom, 'com'], [R.str, 'str'], [R.deco, 'bi'], [R.num, 'num'], id, [R.op, 'op']];
      case 'php': return [[R.ws, ''], [R.slashCom, 'com'], [R.blockCom, 'com'], [rx('<\\?php|\\?>'), 'tag'], [R.hashCom, 'com'], [R.str, 'str'], [R.phpVar, 'attr'], [R.num, 'num'], id, [R.op, 'op']];
      case 'sql': return [[R.ws, ''], [R.dashCom, 'com'], [R.blockCom, 'com'], [R.str, 'str'], [R.num, 'num'], id, [R.op, 'op']];
      case 'bash': case 'shell': case 'git': return [[R.ws, ''], [rx('#(?![{!])[^\\n]*'), 'com'], [R.str, 'str'], [R.shVar, 'attr'], [R.num, 'num'], id, [R.op, 'op']];
      case 'json': return [[R.ws, ''], [R.str, 'str'], [R.num, 'num'], [rx('true|false|null'), 'kw'], [R.op, 'op']];
      default: return null;
    }
  }

  function lexCss(code) {
    var toks = [], i = 0, depth = 0;
    var com = R.blockCom, str = R.str;
    while (i < code.length) {
      var c = code[i], m;
      com.lastIndex = i; if ((m = com.exec(code))) { toks.push([m[0], 'com']); i += m[0].length; continue; }
      str.lastIndex = i; if ((c === '"' || c === "'") && (m = str.exec(code))) { toks.push([m[0], 'str']); i += m[0].length; continue; }
      if (c === '{') { depth++; toks.push([c, 'op']); i++; continue; }
      if (c === '}') { depth = Math.max(0, depth - 1); toks.push([c, 'op']); i++; continue; }
      var at = /^@[\w-]+/.exec(code.slice(i));
      if (at) { toks.push([at[0], 'kw']); i += at[0].length; continue; }
      if (depth > 0) {
        var prop = /^[\w-]+(?=\s*:)/.exec(code.slice(i));
        var lastNonWs = toks.length ? toks[toks.length - 1][0] : '';
        if (prop && (/[{;]\s*$/.test(lastNonWs) || /^\s+$/.test(lastNonWs))) { toks.push([prop[0], 'attr']); i += prop[0].length; continue; }
        var num = /^(#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(px|rem|em|%|vh|vw|s|ms|fr|deg|ch)?)/.exec(code.slice(i));
        if (num && num[0].length) { toks.push([num[0], 'num']); i += num[0].length; continue; }
        var fn = /^[\w-]+(?=\()/.exec(code.slice(i));
        if (fn) { toks.push([fn[0], 'fn']); i += fn[0].length; continue; }
      } else {
        var sel = /^[^{}\s/@][^{},]*?(?=\s*[{,]|$)/.exec(code.slice(i));
        if (sel && sel[0].trim()) { toks.push([sel[0], 'tag']); i += sel[0].length; continue; }
      }
      toks.push([c, /[:;,()]/.test(c) ? 'op' : '']); i++;
    }
    return toks;
  }

  function lexHtml(code) {
    var toks = [], i = 0;
    while (i < code.length) {
      var rest = code.slice(i), m;
      if ((m = /^<!--[\s\S]*?(-->|$)/.exec(rest))) { toks.push([m[0], 'com']); i += m[0].length; continue; }
      if ((m = /^<!doctype[^>]*>/i.exec(rest))) { toks.push([m[0], 'kw']); i += m[0].length; continue; }
      if ((m = /^<\/?([a-zA-Z][\w-]*)/.exec(rest))) {
        var name = m[1].toLowerCase(), closing = rest[1] === '/';
        toks.push([m[0], 'tag']); i += m[0].length;
        while (i < code.length) {
          var r2 = code.slice(i), a;
          if ((a = /^\s+/.exec(r2))) { toks.push([a[0], '']); i += a[0].length; continue; }
          if ((a = /^\/?>/.exec(r2))) { toks.push([a[0], 'tag']); i += a[0].length; break; }
          if ((a = /^[^\s=>"'\/]+/.exec(r2))) { toks.push([a[0], 'attr']); i += a[0].length; continue; }
          if ((a = /^=/.exec(r2))) { toks.push(['=', 'op']); i++; continue; }
          if ((a = /^("[^"]*"?|'[^']*'?)/.exec(r2))) { toks.push([a[0], 'str']); i += a[0].length; continue; }
          toks.push([r2[0], '']); i++;
        }
        if (!closing && (name === 'style' || name === 'script')) {
          var endIdx = code.toLowerCase().indexOf('</' + name, i);
          if (endIdx === -1) endIdx = code.length;
          var inner = code.slice(i, endIdx);
          toks = toks.concat(name === 'style' ? lexCss(inner) : lex(inner, rulesFor('javascript')));
          i = endIdx;
        }
        continue;
      }
      if ((m = /^&[#\w]+;/.exec(rest))) { toks.push([m[0], 'num']); i += m[0].length; continue; }
      if ((m = /^[^<&]+/.exec(rest))) { toks.push([m[0], '']); i += m[0].length; continue; }
      toks.push([rest[0], '']); i++;
    }
    return toks;
  }

  function tokens(code, lang) {
    if (lang === 'html' || lang === 'xml' || lang === 'svg') return lexHtml(code);
    if (lang === 'css') return lexCss(code);
    var rules = rulesFor(lang);
    return rules ? lex(code, rules) : [[code, '']];
  }

  // Renvoie un tableau : une chaîne HTML par ligne.
  function lines(code, lang) {
    var out = [''];
    tokens(String(code == null ? '' : code), lang).forEach(function (t) {
      var parts = t[0].split('\n');
      parts.forEach(function (p, k) {
        if (k > 0) out.push('');
        if (p) out[out.length - 1] += t[1] ? '<span class="tok-' + t[1] + '">' + esc(p) + '</span>' : esc(p);
      });
    });
    return out;
  }

  function html(code, lang) { return lines(code, lang).join('\n'); }

  root.CQHighlight = { lines: lines, html: html, escape: esc };
})(typeof window !== 'undefined' ? window : globalThis);
