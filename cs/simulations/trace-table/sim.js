/**
 * Trace Table Stepper — simulation logic.
 *
 * Design: pre-compute all execution steps on reset, then play back by index.
 * Each step snapshot: { lineIndex, variables: {...}, output: [...] }
 *
 * Includes a simple pseudocode interpreter supporting:
 *   variables, arrays, arithmetic, comparisons, booleans,
 *   IF/ELSEIF/ELSE/ENDIF, WHILE/ENDWHILE, PRINT
 */
(function () {
  'use strict';

  /* ── Pre-loaded programs ──────────────────────────────────────── */
  var PROGRAMS = [
    {
      name: 'Linear Search',
      code: [
        'items = [5, 3, 8, 1, 9]',
        'target = 8',
        'found = false',
        'i = 0',
        'WHILE i < 5 AND found == false',
        '  IF items[i] == target THEN',
        '    found = true',
        '  ENDIF',
        '  i = i + 1',
        'ENDWHILE',
        'PRINT found'
      ]
    },
    {
      name: 'Running Total',
      code: [
        'total = 0',
        'numbers = [4, 7, 2, 9]',
        'i = 0',
        'WHILE i < 4',
        '  total = total + numbers[i]',
        '  i = i + 1',
        'ENDWHILE',
        'PRINT total'
      ]
    },
    {
      name: 'Maximum Finder',
      code: [
        'values = [3, 7, 2, 9, 4]',
        'max = values[0]',
        'i = 1',
        'WHILE i < 5',
        '  IF values[i] > max THEN',
        '    max = values[i]',
        '  ENDIF',
        '  i = i + 1',
        'ENDWHILE',
        'PRINT max'
      ]
    },
    {
      name: 'FizzBuzz Counter',
      code: [
        'i = 1',
        'WHILE i <= 15',
        '  IF i % 3 == 0 AND i % 5 == 0 THEN',
        '    PRINT "FizzBuzz"',
        '  ELSEIF i % 3 == 0 THEN',
        '    PRINT "Fizz"',
        '  ELSEIF i % 5 == 0 THEN',
        '    PRINT "Buzz"',
        '  ELSE',
        '    PRINT i',
        '  ENDIF',
        '  i = i + 1',
        'ENDWHILE'
      ]
    },
    {
      name: 'Swap Variables',
      code: [
        'a = 5',
        'b = 3',
        'temp = a',
        'a = b',
        'b = temp',
        'PRINT a',
        'PRINT b'
      ]
    },
    {
      name: 'Countdown',
      code: [
        'n = 5',
        'WHILE n > 0',
        '  PRINT n',
        '  n = n - 1',
        'ENDWHILE',
        'PRINT "Go!"'
      ]
    }
  ];

  var MAX_STEPS = 500;

  /* ── DOM refs ─────────────────────────────────────────────────── */
  var controlsEl    = document.getElementById('controls');
  var programSelect = document.getElementById('program-select');
  var codeDisplay   = document.getElementById('code-display');
  var traceHead     = document.getElementById('trace-head');
  var traceBody     = document.getElementById('trace-body');
  var outputDisplay = document.getElementById('output-display');
  var statStep      = document.getElementById('stat-step');
  var statLine      = document.getElementById('stat-line');

  /* ── State ────────────────────────────────────────────────────── */
  var currentProgram = 0;
  var codeLines = [];       // array of trimmed source lines
  var steps = [];           // pre-computed snapshots
  var stepIndex = 0;
  var varOrder = [];        // ordered list of variable names for table columns

  /* ── Engine ───────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      currentProgram = parseInt(programSelect.value, 10);
      codeLines = PROGRAMS[currentProgram].code.slice();
      buildCodeDisplay();
      runInterpreter();
      stepIndex = 0;
    })
    .onStep(function () {
      if (stepIndex >= steps.length - 1) return false;
      stepIndex++;
    })
    .onRender(function () {
      renderStep();
    });

  programSelect.addEventListener('change', function () { engine.reset(); });

  /* ══════════════════════════════════════════════════════════════════
   *  PSEUDOCODE INTERPRETER — pre-compute all steps
   * ════════════════════════════════════════════════════════════════ */

  function runInterpreter() {
    steps = [];
    varOrder = [];
    var vars = {};
    var output = [];
    var pc = 0;          // program counter (line index)
    var totalSteps = 0;

    // Track lines that findNextBranch explicitly jumped to, so we can
    // distinguish "jumped-to ELSEIF/ELSE" from "fallen-through ELSEIF/ELSE".
    var jumpTargets = {};

    // Record initial state before execution
    steps.push({ lineIndex: -1, variables: copyVars(vars), output: output.slice() });

    while (pc < codeLines.length && totalSteps < MAX_STEPS) {
      var raw = codeLines[pc];
      var line = raw.trim();
      totalSteps++;

      if (line === '' || line === 'ENDIF' || line === 'ENDWHILE') {
        // ENDWHILE: jump back to the WHILE line to re-evaluate
        if (line === 'ENDWHILE') {
          var whileLine = findMatchingWhile(pc);
          if (whileLine !== -1) {
            pc = whileLine;
            continue;
          }
        }
        // ENDIF or blank: just advance
        pc++;
        continue;
      }

      // WHILE condition
      if (startsWith(line, 'WHILE ')) {
        var condStr = line.substring(6);
        var condResult = evalExpr(condStr, vars);
        // Record step for the WHILE line evaluation
        steps.push({ lineIndex: pc, variables: copyVars(vars), output: output.slice() });
        if (isTruthy(condResult)) {
          pc++;
        } else {
          // Jump past ENDWHILE
          pc = findMatchingEndwhile(pc) + 1;
        }
        continue;
      }

      // IF condition
      if (startsWith(line, 'IF ') && endsWith(line, ' THEN')) {
        var ifCond = line.substring(3, line.length - 5).trim();
        var ifResult = evalExpr(ifCond, vars);
        steps.push({ lineIndex: pc, variables: copyVars(vars), output: output.slice() });
        if (isTruthy(ifResult)) {
          pc++;
        } else {
          var nextBranch = findNextBranch(pc);
          jumpTargets[nextBranch] = true;
          pc = nextBranch;
        }
        continue;
      }

      // ELSEIF: only evaluate if jumped to explicitly; otherwise skip to ENDIF
      if (startsWith(line, 'ELSEIF ') && endsWith(line, ' THEN')) {
        if (!jumpTargets[pc]) {
          // Fell through from a taken branch — skip to after ENDIF
          pc = findEndifFromBranch(pc) + 1;
          continue;
        }
        delete jumpTargets[pc];
        var eifCond = line.substring(7, line.length - 5).trim();
        var eifResult = evalExpr(eifCond, vars);
        steps.push({ lineIndex: pc, variables: copyVars(vars), output: output.slice() });
        if (isTruthy(eifResult)) {
          pc++;
        } else {
          var nextBranch2 = findNextBranch(pc);
          jumpTargets[nextBranch2] = true;
          pc = nextBranch2;
        }
        continue;
      }

      // ELSE: only enter if jumped to explicitly; otherwise skip to ENDIF
      if (line === 'ELSE') {
        if (!jumpTargets[pc]) {
          // Fell through from a taken branch — skip to after ENDIF
          pc = findEndifFromBranch(pc) + 1;
          continue;
        }
        delete jumpTargets[pc];
        steps.push({ lineIndex: pc, variables: copyVars(vars), output: output.slice() });
        pc++;
        continue;
      }

      // PRINT statement
      if (startsWith(line, 'PRINT ')) {
        var printExpr = line.substring(6).trim();
        var val = evalExpr(printExpr, vars);
        output.push(formatValue(val));
        steps.push({ lineIndex: pc, variables: copyVars(vars), output: output.slice() });
        pc++;
        continue;
      }

      // Assignment: varname = expr  OR  varname[expr] = expr
      var assignMatch = matchAssignment(line);
      if (assignMatch) {
        var value = evalExpr(assignMatch.expr, vars);
        if (assignMatch.index !== null) {
          var idx = evalExpr(assignMatch.index, vars);
          if (Array.isArray(vars[assignMatch.name])) {
            vars[assignMatch.name][idx] = value;
          }
        } else {
          vars[assignMatch.name] = value;
          trackVar(assignMatch.name);
        }
        steps.push({ lineIndex: pc, variables: copyVars(vars), output: output.slice() });
        pc++;
        continue;
      }

      // Fallthrough: skip unrecognized lines
      pc++;
    }
  }

  /* ── Variable ordering tracker ───────────────────────────────── */
  function trackVar(name) {
    if (varOrder.indexOf(name) === -1) {
      varOrder.push(name);
    }
  }

  /* ── Deep copy variables (handles arrays) ────────────────────── */
  function copyVars(vars) {
    var copy = {};
    for (var key in vars) {
      if (vars.hasOwnProperty(key)) {
        if (Array.isArray(vars[key])) {
          copy[key] = vars[key].slice();
        } else {
          copy[key] = vars[key];
        }
      }
    }
    return copy;
  }

  /* ── Format a value for display ──────────────────────────────── */
  function formatValue(val) {
    if (val === true) return 'true';
    if (val === false) return 'false';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return '[' + val.map(formatValue).join(', ') + ']';
    return String(val);
  }

  function formatCellValue(val) {
    if (val === undefined) return '';
    return formatValue(val);
  }

  /* ── String helpers ──────────────────────────────────────────── */
  function startsWith(str, prefix) {
    return str.substring(0, prefix.length) === prefix;
  }

  function endsWith(str, suffix) {
    return str.substring(str.length - suffix.length) === suffix;
  }

  function isTruthy(val) {
    if (val === false || val === 0 || val === '' || val === null || val === undefined) return false;
    return true;
  }

  /* ── Match assignment: name = expr  or  name[idx] = expr ─────── */
  function matchAssignment(line) {
    // Look for:  identifier[expr] = expr   OR   identifier = expr
    // Must NOT start with a keyword
    var keywords = ['IF', 'ELSEIF', 'ELSE', 'ENDIF', 'WHILE', 'ENDWHILE', 'PRINT', 'THEN', 'AND', 'OR', 'NOT'];
    var firstWord = line.split(/[\s\[=]/)[0];
    if (keywords.indexOf(firstWord) !== -1) return null;

    // Try array assignment:  name[index] = expr
    var arrMatch = line.match(/^([a-zA-Z_]\w*)\[(.+?)\]\s*=\s*(.+)$/);
    if (arrMatch) {
      return { name: arrMatch[1], index: arrMatch[2], expr: arrMatch[3] };
    }

    // Try simple assignment:  name = expr
    // Be careful: == is comparison, not assignment
    var eqPos = findAssignmentEquals(line);
    if (eqPos !== -1) {
      var name = line.substring(0, eqPos).trim();
      var expr = line.substring(eqPos + 1).trim();
      if (/^[a-zA-Z_]\w*$/.test(name)) {
        return { name: name, index: null, expr: expr };
      }
    }

    return null;
  }

  /** Find the position of a single '=' that is not '==' or '!=' or '>=' or '<=' */
  function findAssignmentEquals(line) {
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        // skip string literal
        i++;
        while (i < line.length && line[i] !== '"') i++;
        continue;
      }
      if (ch === '[') {
        // skip array literal/index — find matching ]
        var depth = 1;
        i++;
        while (i < line.length && depth > 0) {
          if (line[i] === '[') depth++;
          else if (line[i] === ']') depth--;
          if (depth > 0) i++;
        }
        continue;
      }
      if (ch === '=') {
        // Check it's not ==
        if (i + 1 < line.length && line[i + 1] === '=') {
          i++; // skip ==
          continue;
        }
        // Check it's not !=, >=, <=
        if (i > 0 && (line[i - 1] === '!' || line[i - 1] === '>' || line[i - 1] === '<')) {
          continue;
        }
        return i;
      }
    }
    return -1;
  }

  /* ══════════════════════════════════════════════════════════════════
   *  CONTROL FLOW HELPERS
   * ════════════════════════════════════════════════════════════════ */

  /** From an IF or ELSEIF line, find the next ELSEIF, ELSE, or ENDIF at the same nesting level. */
  function findNextBranch(fromLine) {
    var depth = 0;
    for (var i = fromLine + 1; i < codeLines.length; i++) {
      var t = codeLines[i].trim();
      if (startsWith(t, 'IF ') && endsWith(t, ' THEN')) {
        depth++;
      } else if (t === 'ENDIF') {
        if (depth === 0) return i + 1; // skip past ENDIF entirely
        depth--;
      } else if (depth === 0) {
        if ((startsWith(t, 'ELSEIF ') && endsWith(t, ' THEN')) || t === 'ELSE') {
          return i;
        }
      }
    }
    return codeLines.length; // safety
  }

  /** From an ELSEIF/ELSE line (that we're skipping past), find the matching ENDIF. */
  function findEndifFromBranch(fromLine) {
    var depth = 0;
    for (var i = fromLine + 1; i < codeLines.length; i++) {
      var t = codeLines[i].trim();
      if (startsWith(t, 'IF ') && endsWith(t, ' THEN')) {
        depth++;
      } else if (t === 'ENDIF') {
        if (depth === 0) return i;
        depth--;
      }
    }
    return codeLines.length - 1;
  }

  /** From an ENDWHILE, find the matching WHILE above. */
  function findMatchingWhile(endwhileLine) {
    var depth = 0;
    for (var i = endwhileLine - 1; i >= 0; i--) {
      var t = codeLines[i].trim();
      if (t === 'ENDWHILE') {
        depth++;
      } else if (startsWith(t, 'WHILE ')) {
        if (depth === 0) return i;
        depth--;
      }
    }
    return -1;
  }

  /** From a WHILE, find the matching ENDWHILE below. */
  function findMatchingEndwhile(whileLine) {
    var depth = 0;
    for (var i = whileLine + 1; i < codeLines.length; i++) {
      var t = codeLines[i].trim();
      if (startsWith(t, 'WHILE ')) {
        depth++;
      } else if (t === 'ENDWHILE') {
        if (depth === 0) return i;
        depth--;
      }
    }
    return codeLines.length - 1;
  }

  /* ══════════════════════════════════════════════════════════════════
   *  EXPRESSION EVALUATOR
   *
   *  Precedence (lowest to highest):
   *    OR
   *    AND
   *    NOT (unary)
   *    == != > < >= <=
   *    + -
   *    * / %
   *    Unary minus
   *    Atoms: number, string, boolean, variable, array literal, array access, ( )
   * ════════════════════════════════════════════════════════════════ */

  function evalExpr(exprStr, vars) {
    var tokens = tokenize(exprStr);
    var pos = { i: 0 };
    var result = parseOr(tokens, pos, vars);
    return result;
  }

  /* ── Tokenizer ───────────────────────────────────────────────── */
  function tokenize(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
      var ch = str[i];

      // Whitespace
      if (ch === ' ' || ch === '\t') { i++; continue; }

      // String literal
      if (ch === '"') {
        var s = '';
        i++; // skip opening "
        while (i < str.length && str[i] !== '"') {
          s += str[i];
          i++;
        }
        i++; // skip closing "
        tokens.push({ type: 'string', value: s });
        continue;
      }

      // Number
      if (ch >= '0' && ch <= '9') {
        var num = '';
        while (i < str.length && ((str[i] >= '0' && str[i] <= '9') || str[i] === '.')) {
          num += str[i];
          i++;
        }
        tokens.push({ type: 'number', value: parseFloat(num) });
        continue;
      }

      // Identifier or keyword
      if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
        var id = '';
        while (i < str.length && (/[a-zA-Z0-9_]/).test(str[i])) {
          id += str[i];
          i++;
        }
        // Keywords
        if (id === 'AND') { tokens.push({ type: 'op', value: 'AND' }); }
        else if (id === 'OR') { tokens.push({ type: 'op', value: 'OR' }); }
        else if (id === 'NOT') { tokens.push({ type: 'op', value: 'NOT' }); }
        else if (id === 'true') { tokens.push({ type: 'bool', value: true }); }
        else if (id === 'false') { tokens.push({ type: 'bool', value: false }); }
        else { tokens.push({ type: 'ident', value: id }); }
        continue;
      }

      // Two-character operators
      if (i + 1 < str.length) {
        var two = str[i] + str[i + 1];
        if (two === '==' || two === '!=' || two === '>=' || two === '<=') {
          tokens.push({ type: 'op', value: two });
          i += 2;
          continue;
        }
      }

      // Single-character operators and punctuation
      if ('+-*/%><='.indexOf(ch) !== -1) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }

      if (ch === '(' || ch === ')' || ch === '[' || ch === ']' || ch === ',') {
        tokens.push({ type: ch });
        i++;
        continue;
      }

      // Skip unknown
      i++;
    }
    return tokens;
  }

  /* ── Recursive descent parser ────────────────────────────────── */
  function peek(tokens, pos) {
    return pos.i < tokens.length ? tokens[pos.i] : null;
  }

  function consume(tokens, pos) {
    return tokens[pos.i++];
  }

  function parseOr(tokens, pos, vars) {
    var left = parseAnd(tokens, pos, vars);
    while (peek(tokens, pos) && peek(tokens, pos).type === 'op' && peek(tokens, pos).value === 'OR') {
      consume(tokens, pos);
      var right = parseAnd(tokens, pos, vars);
      left = isTruthy(left) || isTruthy(right);
    }
    return left;
  }

  function parseAnd(tokens, pos, vars) {
    var left = parseNot(tokens, pos, vars);
    while (peek(tokens, pos) && peek(tokens, pos).type === 'op' && peek(tokens, pos).value === 'AND') {
      consume(tokens, pos);
      var right = parseNot(tokens, pos, vars);
      left = isTruthy(left) && isTruthy(right);
    }
    return left;
  }

  function parseNot(tokens, pos, vars) {
    if (peek(tokens, pos) && peek(tokens, pos).type === 'op' && peek(tokens, pos).value === 'NOT') {
      consume(tokens, pos);
      var val = parseNot(tokens, pos, vars);
      return !isTruthy(val);
    }
    return parseComparison(tokens, pos, vars);
  }

  function parseComparison(tokens, pos, vars) {
    var left = parseAddSub(tokens, pos, vars);
    while (peek(tokens, pos) && peek(tokens, pos).type === 'op' &&
           ('== != > < >= <='.split(' ').indexOf(peek(tokens, pos).value) !== -1)) {
      var op = consume(tokens, pos).value;
      var right = parseAddSub(tokens, pos, vars);
      switch (op) {
        case '==': left = (left === right); break;
        case '!=': left = (left !== right); break;
        case '>':  left = (left > right);   break;
        case '<':  left = (left < right);   break;
        case '>=': left = (left >= right);  break;
        case '<=': left = (left <= right);  break;
      }
    }
    return left;
  }

  function parseAddSub(tokens, pos, vars) {
    var left = parseMulDivMod(tokens, pos, vars);
    while (peek(tokens, pos) && peek(tokens, pos).type === 'op' &&
           (peek(tokens, pos).value === '+' || peek(tokens, pos).value === '-')) {
      var op = consume(tokens, pos).value;
      var right = parseMulDivMod(tokens, pos, vars);
      if (op === '+') {
        // String concatenation if either side is a string
        if (typeof left === 'string' || typeof right === 'string') {
          left = String(left) + String(right);
        } else {
          left = left + right;
        }
      } else {
        left = left - right;
      }
    }
    return left;
  }

  function parseMulDivMod(tokens, pos, vars) {
    var left = parseUnary(tokens, pos, vars);
    while (peek(tokens, pos) && peek(tokens, pos).type === 'op' &&
           (peek(tokens, pos).value === '*' || peek(tokens, pos).value === '/' || peek(tokens, pos).value === '%')) {
      var op = consume(tokens, pos).value;
      var right = parseUnary(tokens, pos, vars);
      if (op === '*') left = left * right;
      else if (op === '/') left = left / right;
      else left = left % right;
    }
    return left;
  }

  function parseUnary(tokens, pos, vars) {
    // Unary minus
    if (peek(tokens, pos) && peek(tokens, pos).type === 'op' && peek(tokens, pos).value === '-') {
      consume(tokens, pos);
      var val = parseUnary(tokens, pos, vars);
      return -val;
    }
    return parseAtom(tokens, pos, vars);
  }

  function parseAtom(tokens, pos, vars) {
    var tok = peek(tokens, pos);
    if (!tok) return 0;

    // Number
    if (tok.type === 'number') {
      consume(tokens, pos);
      return tok.value;
    }

    // String
    if (tok.type === 'string') {
      consume(tokens, pos);
      return tok.value;
    }

    // Boolean
    if (tok.type === 'bool') {
      consume(tokens, pos);
      return tok.value;
    }

    // Parenthesized expression
    if (tok.type === '(') {
      consume(tokens, pos); // (
      var val = parseOr(tokens, pos, vars);
      if (peek(tokens, pos) && peek(tokens, pos).type === ')') {
        consume(tokens, pos); // )
      }
      return val;
    }

    // Array literal [expr, expr, ...]
    if (tok.type === '[') {
      consume(tokens, pos); // [
      var arr = [];
      while (peek(tokens, pos) && peek(tokens, pos).type !== ']') {
        arr.push(parseOr(tokens, pos, vars));
        if (peek(tokens, pos) && peek(tokens, pos).type === ',') {
          consume(tokens, pos); // ,
        }
      }
      if (peek(tokens, pos) && peek(tokens, pos).type === ']') {
        consume(tokens, pos); // ]
      }
      return arr;
    }

    // Identifier (variable or array access)
    if (tok.type === 'ident') {
      consume(tokens, pos);
      var name = tok.value;

      // Array access: name[expr]
      if (peek(tokens, pos) && peek(tokens, pos).type === '[') {
        consume(tokens, pos); // [
        var index = parseOr(tokens, pos, vars);
        if (peek(tokens, pos) && peek(tokens, pos).type === ']') {
          consume(tokens, pos); // ]
        }
        var arrVal = vars[name];
        if (Array.isArray(arrVal)) {
          return arrVal[index];
        }
        return 0;
      }

      // Simple variable
      if (vars.hasOwnProperty(name)) {
        return vars[name];
      }
      return 0; // undefined variable
    }

    // Fallback
    consume(tokens, pos);
    return 0;
  }

  /* ══════════════════════════════════════════════════════════════════
   *  DOM BUILDING & RENDERING
   * ════════════════════════════════════════════════════════════════ */

  function buildCodeDisplay() {
    codeDisplay.innerHTML = '';
    for (var i = 0; i < codeLines.length; i++) {
      var div = document.createElement('div');
      div.className = 'code-line';
      div.setAttribute('data-line', i);

      var numSpan = document.createElement('span');
      numSpan.className = 'line-num';
      numSpan.textContent = i + 1;

      var textSpan = document.createElement('span');
      textSpan.className = 'line-text';
      textSpan.textContent = codeLines[i];

      div.appendChild(numSpan);
      div.appendChild(textSpan);
      codeDisplay.appendChild(div);
    }
  }

  /** Determine which variables to show as columns (exclude arrays from the main columns). */
  function getDisplayVars() {
    var display = [];
    for (var i = 0; i < varOrder.length; i++) {
      var name = varOrder[i];
      // Check if this variable is ever a non-array value in any step
      var isArray = true;
      for (var j = 0; j < steps.length; j++) {
        var val = steps[j].variables[name];
        if (val !== undefined && !Array.isArray(val)) {
          isArray = false;
          break;
        }
      }
      if (!isArray) {
        display.push(name);
      }
    }
    return display;
  }

  function renderStep() {
    if (steps.length === 0) return;

    var snap = steps[stepIndex];
    var displayVars = getDisplayVars();

    // Highlight current line in code display
    var lineEls = codeDisplay.querySelectorAll('.code-line');
    for (var i = 0; i < lineEls.length; i++) {
      var lineIdx = parseInt(lineEls[i].getAttribute('data-line'), 10);
      lineEls[i].classList.remove('active', 'executed');

      if (lineIdx === snap.lineIndex) {
        lineEls[i].classList.add('active');
      }
      // Mark lines that have been executed in previous steps
      for (var s = 1; s < stepIndex; s++) {
        if (steps[s].lineIndex === lineIdx) {
          lineEls[i].classList.add('executed');
          break;
        }
      }
    }

    // Scroll active line into view in code panel
    var activeLine = codeDisplay.querySelector('.code-line.active');
    if (activeLine) {
      activeLine.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Build trace table header
    var headRow = traceHead.querySelector('tr');
    headRow.innerHTML = '';
    var stepTh = document.createElement('th');
    stepTh.textContent = 'Step';
    headRow.appendChild(stepTh);

    for (var v = 0; v < displayVars.length; v++) {
      var th = document.createElement('th');
      th.textContent = displayVars[v];
      headRow.appendChild(th);
    }

    var outTh = document.createElement('th');
    outTh.textContent = 'Output';
    headRow.appendChild(outTh);

    // Build trace table rows (from step 1 to current stepIndex)
    traceBody.innerHTML = '';
    var prevVars = {};

    for (var si = 1; si <= stepIndex; si++) {
      var step = steps[si];
      var tr = document.createElement('tr');

      if (si === stepIndex) {
        tr.className = 'step-current';
      }

      // Step number cell
      var stepTd = document.createElement('td');
      stepTd.className = 'col-step';
      stepTd.textContent = si;
      tr.appendChild(stepTd);

      // Variable cells
      var prevStep = si > 1 ? steps[si - 1] : steps[0];
      for (var vi = 0; vi < displayVars.length; vi++) {
        var varName = displayVars[vi];
        var td = document.createElement('td');
        var curVal = step.variables[varName];
        var prevVal = prevStep.variables[varName];
        td.textContent = formatCellValue(curVal);

        // Highlight changed values
        if (curVal !== undefined && formatCellValue(curVal) !== formatCellValue(prevVal)) {
          td.className = 'changed';
        }
        tr.appendChild(td);
      }

      // Output cell — show any new output produced at this step
      var outTd = document.createElement('td');
      outTd.className = 'col-output';
      var prevOutLen = si > 1 ? steps[si - 1].output.length : 0;
      var newOutputs = step.output.slice(prevOutLen);
      outTd.textContent = newOutputs.join(', ');
      tr.appendChild(outTd);

      traceBody.appendChild(tr);
    }

    // Auto-scroll the trace table to show the current row
    var tableScroll = traceBody.parentElement;
    if (tableScroll && traceBody.lastChild) {
      traceBody.lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Update output console
    outputDisplay.textContent = snap.output.join('\n');

    // Scroll output display to bottom
    outputDisplay.scrollTop = outputDisplay.scrollHeight;

    // Update stats
    statStep.textContent = stepIndex + ' / ' + (steps.length - 1);
    statLine.textContent = snap.lineIndex >= 0 ? (snap.lineIndex + 1) : '\u2014';
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  engine.reset();
})();
