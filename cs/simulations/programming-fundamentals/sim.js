/**
 * Programming Fundamentals Playground — simulation logic.
 *
 * Three tabs: Variables & Constants, Operators, Selection & Iteration.
 * DOM-only simulation with reset-only engine.
 */
(function () {
  'use strict';

  /* ── DOM refs ──────────────────────────────────────────────────── */
  var controlsEl  = document.getElementById('controls');
  var tabContent   = document.getElementById('tab-content');
  var tabBtns      = document.querySelectorAll('[data-tab]');

  /* ── Engine (reset-only) ───────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, { controls: { play: false, speed: false, step: false } });

  /* ── Active tab state ──────────────────────────────────────────── */
  var activeTab = 'variables';

  /* ══════════════════════════════════════════════════════════════════
   *  TAB SWITCHING
   * ════════════════════════════════════════════════════════════════ */
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeTab = btn.getAttribute('data-tab');
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      buildActiveTab();
    });
  });

  function buildActiveTab() {
    tabContent.innerHTML = '';
    if (activeTab === 'variables') buildVariablesTab();
    else if (activeTab === 'operators') buildOperatorsTab();
    else if (activeTab === 'flow') buildFlowTab();
  }

  engine.onReset(function () {
    buildActiveTab();
  });

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 1: VARIABLES & CONSTANTS
   * ════════════════════════════════════════════════════════════════ */

  var VAR_PROGRAMS = [
    {
      name: 'Basic Arithmetic',
      lines: [
        { code: 'x = 5', comment: '' },
        { code: 'y = 10', comment: '' },
        { code: 'z = x + y', comment: '' },
        { code: 'x = x + 1', comment: '' },
        { code: 'CONST pi = 3.14', comment: '' },
        { code: 'area = pi * x * x', comment: '' },
        { code: 'pi = 99', comment: '// ERROR: Cannot modify a constant!' }
      ]
    },
    {
      name: 'String Operations',
      lines: [
        { code: 'name = "Alice"', comment: '' },
        { code: 'greeting = "Hello " + name', comment: '' },
        { code: 'length = LEN(greeting)', comment: '' },
        { code: 'upper = UPPER(name)', comment: '' },
        { code: 'first = SUBSTRING(name, 0, 1)', comment: '' }
      ]
    },
    {
      name: 'Swapping Variables',
      lines: [
        { code: 'a = 7', comment: '' },
        { code: 'b = 3', comment: '' },
        { code: 'temp = a', comment: '' },
        { code: 'a = b', comment: '' },
        { code: 'b = temp', comment: '' }
      ]
    }
  ];

  var varState = {
    programIndex: 0,
    pc: -1,
    variables: {},
    constants: {},
    log: [],
    finished: false
  };

  function buildVariablesTab() {
    var html = '';

    // Program selector bar
    html += '<div class="var-program-bar">';
    html += '<label for="var-prog-select">Program:</label>';
    html += '<select id="var-prog-select">';
    for (var i = 0; i < VAR_PROGRAMS.length; i++) {
      html += '<option value="' + i + '"' + (i === varState.programIndex ? ' selected' : '') + '>' + VAR_PROGRAMS[i].name + '</option>';
    }
    html += '</select>';
    html += '<button class="ctrl-btn" id="var-next-btn" type="button">Next Line</button>';
    html += '<button class="ctrl-btn" id="var-reset-btn" type="button">Reset</button>';
    html += '</div>';

    // Two-column layout
    html += '<div class="var-layout">';

    // Left: code display
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">Pseudocode</h3>';
    html += '<div class="var-code-display" id="var-code-display"></div>';
    html += '</div>';

    // Right: variable boxes
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">Variable Boxes</h3>';
    html += '<div class="var-boxes-grid" id="var-boxes-grid"></div>';
    html += '</div>';

    html += '</div>'; // end layout

    // Operation log
    html += '<div class="pf-panel" style="margin-top:var(--sp-4)">';
    html += '<h3 class="pf-panel-heading">Operation Log</h3>';
    html += '<div class="var-log" id="var-log"></div>';
    html += '</div>';

    tabContent.innerHTML = html;

    // Bind events
    document.getElementById('var-prog-select').addEventListener('change', function () {
      varState.programIndex = parseInt(this.value, 10);
      resetVarState();
      renderVariables();
    });
    document.getElementById('var-next-btn').addEventListener('click', function () {
      stepVariable();
    });
    document.getElementById('var-reset-btn').addEventListener('click', function () {
      resetVarState();
      renderVariables();
    });

    resetVarState();
    renderVariables();
  }

  function resetVarState() {
    varState.pc = -1;
    varState.variables = {};
    varState.constants = {};
    varState.log = [];
    varState.finished = false;
  }

  function stepVariable() {
    if (varState.finished) return;

    var prog = VAR_PROGRAMS[varState.programIndex];
    varState.pc++;

    if (varState.pc >= prog.lines.length) {
      varState.finished = true;
      varState.pc = prog.lines.length - 1;
      renderVariables();
      return;
    }

    var line = prog.lines[varState.pc];
    var result = executeVarLine(line.code);

    varState.log.push({
      step: varState.pc + 1,
      text: result.logText,
      error: result.error
    });

    renderVariables(result.updatedVar);
  }

  function executeVarLine(code) {
    var trimmed = code.trim();
    var result = { logText: '', error: false, updatedVar: null };

    // CONST assignment
    if (trimmed.indexOf('CONST ') === 0) {
      var constPart = trimmed.substring(6);
      var eqPos = constPart.indexOf('=');
      if (eqPos !== -1) {
        var cName = constPart.substring(0, eqPos).trim();
        var cExpr = constPart.substring(eqPos + 1).trim();
        var cVal = evalVarExpr(cExpr);
        varState.variables[cName] = cVal;
        varState.constants[cName] = true;
        result.logText = 'Declared constant ' + cName + ' = ' + formatVal(cVal);
        result.updatedVar = cName;
      }
      return result;
    }

    // Regular assignment
    var eqIdx = findSingleEquals(trimmed);
    if (eqIdx !== -1) {
      var varName = trimmed.substring(0, eqIdx).trim();
      var expr = trimmed.substring(eqIdx + 1).trim();

      // Check if trying to modify a constant
      if (varState.constants[varName]) {
        result.error = true;
        result.logText = 'ERROR: Cannot modify constant "' + varName + '"!';
        result.updatedVar = varName;
        return result;
      }

      var val = evalVarExpr(expr);
      varState.variables[varName] = val;
      result.logText = varName + ' = ' + formatVal(val);
      result.updatedVar = varName;
    }

    return result;
  }

  function findSingleEquals(str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] === '"') {
        i++;
        while (i < str.length && str[i] !== '"') i++;
        continue;
      }
      if (str[i] === '=' && (i + 1 >= str.length || str[i + 1] !== '=') &&
          (i === 0 || (str[i - 1] !== '!' && str[i - 1] !== '<' && str[i - 1] !== '>'))) {
        return i;
      }
    }
    return -1;
  }

  function evalVarExpr(expr) {
    expr = expr.trim();

    // String literal
    if (expr[0] === '"' && expr[expr.length - 1] === '"') {
      return expr.substring(1, expr.length - 1);
    }

    // LEN function
    if (expr.indexOf('LEN(') === 0) {
      var inner = expr.substring(4, expr.length - 1);
      var innerVal = evalVarExpr(inner);
      return typeof innerVal === 'string' ? innerVal.length : 0;
    }

    // UPPER function
    if (expr.indexOf('UPPER(') === 0) {
      var innerU = expr.substring(6, expr.length - 1);
      var innerUVal = evalVarExpr(innerU);
      return typeof innerUVal === 'string' ? innerUVal.toUpperCase() : innerUVal;
    }

    // SUBSTRING function
    if (expr.indexOf('SUBSTRING(') === 0) {
      var innerS = expr.substring(10, expr.length - 1);
      var parts = splitArgs(innerS);
      if (parts.length >= 3) {
        var sVal = evalVarExpr(parts[0]);
        var sStart = evalVarExpr(parts[1]);
        var sLen = evalVarExpr(parts[2]);
        if (typeof sVal === 'string') {
          return sVal.substring(sStart, sStart + sLen);
        }
      }
      return '';
    }

    // Number literal
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }

    // Simple variable reference
    if (/^[a-zA-Z_]\w*$/.test(expr) && varState.variables.hasOwnProperty(expr)) {
      return varState.variables[expr];
    }

    // String concatenation: "..." + var
    if (expr.indexOf('+') !== -1) {
      var concatParts = splitPlus(expr);
      // Check if any part is a string
      var hasString = false;
      var evaluatedParts = [];
      for (var p = 0; p < concatParts.length; p++) {
        var v = evalVarExpr(concatParts[p].trim());
        evaluatedParts.push(v);
        if (typeof v === 'string') hasString = true;
      }
      if (hasString) {
        var strResult = '';
        for (var r = 0; r < evaluatedParts.length; r++) {
          strResult += String(evaluatedParts[r]);
        }
        return strResult;
      }
      // Numeric addition
      var numResult = 0;
      for (var n = 0; n < evaluatedParts.length; n++) {
        numResult += Number(evaluatedParts[n]);
      }
      return numResult;
    }

    // Arithmetic with * / -
    if (expr.indexOf('*') !== -1) {
      var mulParts = expr.split('*');
      var mulResult = 1;
      for (var m = 0; m < mulParts.length; m++) {
        mulResult *= Number(evalVarExpr(mulParts[m].trim()));
      }
      return Math.round(mulResult * 10000) / 10000;
    }

    if (expr.indexOf('-') !== -1 && expr.indexOf('-') > 0) {
      var subParts = expr.split('-');
      var subResult = Number(evalVarExpr(subParts[0].trim()));
      for (var s = 1; s < subParts.length; s++) {
        subResult -= Number(evalVarExpr(subParts[s].trim()));
      }
      return subResult;
    }

    // Fallback: return the expression as-is if it's a variable name
    if (varState.variables.hasOwnProperty(expr)) {
      return varState.variables[expr];
    }

    return expr;
  }

  function splitPlus(expr) {
    var parts = [];
    var depth = 0;
    var current = '';
    var inString = false;

    for (var i = 0; i < expr.length; i++) {
      var ch = expr[i];
      if (ch === '"') {
        inString = !inString;
        current += ch;
        continue;
      }
      if (inString) {
        current += ch;
        continue;
      }
      if (ch === '(') { depth++; current += ch; continue; }
      if (ch === ')') { depth--; current += ch; continue; }
      if (ch === '+' && depth === 0) {
        parts.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    if (current) parts.push(current);
    return parts;
  }

  function splitArgs(str) {
    var parts = [];
    var depth = 0;
    var current = '';
    var inString = false;

    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '"') { inString = !inString; current += ch; continue; }
      if (inString) { current += ch; continue; }
      if (ch === '(') { depth++; current += ch; continue; }
      if (ch === ')') { depth--; current += ch; continue; }
      if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current) parts.push(current.trim());
    return parts;
  }

  function formatVal(val) {
    if (typeof val === 'string') return '"' + val + '"';
    return String(val);
  }

  function getVarType(val) {
    if (typeof val === 'number') {
      return Number.isInteger(val) ? 'Integer' : 'Real';
    }
    if (typeof val === 'string') return 'String';
    if (typeof val === 'boolean') return 'Boolean';
    return 'Unknown';
  }

  function renderVariables(updatedVar) {
    var prog = VAR_PROGRAMS[varState.programIndex];

    // Render code lines
    var codeEl = document.getElementById('var-code-display');
    if (codeEl) {
      var codeHtml = '';
      for (var i = 0; i < prog.lines.length; i++) {
        var cls = 'var-code-line';
        if (i === varState.pc) {
          // Check if this line had an error
          var lastLog = varState.log.length > 0 ? varState.log[varState.log.length - 1] : null;
          if (lastLog && lastLog.error) {
            cls += ' error';
          } else {
            cls += ' active';
          }
        }
        if (i < varState.pc) cls += ' executed';
        codeHtml += '<div class="' + cls + '">';
        codeHtml += '<span class="var-line-num">' + (i + 1) + '</span>';
        codeHtml += '<span class="var-line-text">' + escHtml(prog.lines[i].code) + '</span>';
        if (prog.lines[i].comment) {
          codeHtml += '<span class="var-line-comment">' + escHtml(prog.lines[i].comment) + '</span>';
        }
        codeHtml += '</div>';
      }
      codeEl.innerHTML = codeHtml;
    }

    // Render variable boxes
    var boxesEl = document.getElementById('var-boxes-grid');
    if (boxesEl) {
      var boxHtml = '';
      var varNames = Object.keys(varState.variables);
      if (varNames.length === 0) {
        boxHtml = '<div style="padding:var(--sp-4);color:var(--clr-text-muted);font-size:var(--fs-sm);text-align:center;">Click "Next Line" to start executing the program.</div>';
      }
      for (var v = 0; v < varNames.length; v++) {
        var vn = varNames[v];
        var vv = varState.variables[vn];
        var isConst = varState.constants[vn];
        var isUpdated = (vn === updatedVar);
        var isError = isUpdated && varState.log.length > 0 && varState.log[varState.log.length - 1].error;

        var boxCls = 'var-box';
        if (isConst) boxCls += ' const-box';
        if (isUpdated && !isError) boxCls += ' updated';
        if (isError) boxCls += ' error-flash';

        boxHtml += '<div class="' + boxCls + '">';
        if (isConst) {
          boxHtml += '<span class="var-box-lock">&#128274;</span>';
        }
        boxHtml += '<div class="var-box-name">' + escHtml(vn) + '</div>';
        boxHtml += '<div class="var-box-value">' + escHtml(formatVal(vv)) + '</div>';
        boxHtml += '<div class="var-box-type">' + getVarType(vv) + (isConst ? ' (const)' : '') + '</div>';
        boxHtml += '</div>';
      }
      boxesEl.innerHTML = boxHtml;
    }

    // Render log
    var logEl = document.getElementById('var-log');
    if (logEl) {
      var logHtml = '';
      if (varState.log.length === 0) {
        logHtml = '<div style="color:var(--clr-text-muted);padding:var(--sp-2);">No operations yet.</div>';
      }
      for (var l = 0; l < varState.log.length; l++) {
        var entry = varState.log[l];
        var entryCls = 'var-log-entry';
        if (entry.error) entryCls += ' log-error';
        logHtml += '<div class="' + entryCls + '">';
        logHtml += '<span class="log-step">[' + entry.step + ']</span>';
        logHtml += escHtml(entry.text);
        logHtml += '</div>';
      }
      logEl.innerHTML = logHtml;
      logEl.scrollTop = logEl.scrollHeight;
    }

    // Update Next Line button state
    var nextBtn = document.getElementById('var-next-btn');
    if (nextBtn) {
      nextBtn.disabled = varState.finished;
    }
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 2: OPERATORS
   * ════════════════════════════════════════════════════════════════ */

  function buildOperatorsTab() {
    var html = '';

    // Expression builder
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">Expression Builder</h3>';
    html += '<div class="op-builder">';
    html += '<input type="text" id="op-val1" value="7" placeholder="Value 1">';
    html += '<select id="op-operator">';
    html += '<option value="+">+</option>';
    html += '<option value="-">-</option>';
    html += '<option value="*">*</option>';
    html += '<option value="/">/</option>';
    html += '<option value="DIV">DIV</option>';
    html += '<option value="MOD">MOD</option>';
    html += '<option value="==">==</option>';
    html += '<option value="!=">!=</option>';
    html += '<option value="<">&lt;</option>';
    html += '<option value=">">></option>';
    html += '<option value="<=">&lt;=</option>';
    html += '<option value=">=">>=</option>';
    html += '<option value="AND">AND</option>';
    html += '<option value="OR">OR</option>';
    html += '<option value="NOT">NOT</option>';
    html += '</select>';
    html += '<input type="text" id="op-val2" value="2" placeholder="Value 2">';
    html += '<span class="op-equals">=</span>';
    html += '<span class="op-result" id="op-result">3.5</span>';
    html += '</div>';
    html += '<div class="op-explanation" id="op-explanation"></div>';
    html += '</div>';

    // Reference table
    html += '<div class="pf-panel op-ref-table" style="margin-top:var(--sp-4)">';
    html += '<h3 class="pf-panel-heading">Operator Reference</h3>';
    html += '<div class="pf-panel-body">';
    html += '<table class="comparison-table">';
    html += '<thead><tr><th>Operator</th><th>Name</th><th>Example</th><th>Result</th></tr></thead>';
    html += '<tbody>';

    // Arithmetic
    html += '<tr><td colspan="4" class="op-category">Arithmetic</td></tr>';
    html += '<tr><td>+</td><td>Addition</td><td>5 + 3</td><td>8</td></tr>';
    html += '<tr><td>-</td><td>Subtraction</td><td>10 - 4</td><td>6</td></tr>';
    html += '<tr><td>*</td><td>Multiplication</td><td>3 * 4</td><td>12</td></tr>';
    html += '<tr><td>/</td><td>Real Division</td><td>7 / 2</td><td>3.5</td></tr>';
    html += '<tr><td>DIV</td><td>Integer Division</td><td>7 DIV 2</td><td>3</td></tr>';
    html += '<tr><td>MOD</td><td>Modulus (remainder)</td><td>7 MOD 2</td><td>1</td></tr>';

    // Comparison
    html += '<tr><td colspan="4" class="op-category">Comparison</td></tr>';
    html += '<tr><td>==</td><td>Equal to</td><td>5 == 5</td><td>TRUE</td></tr>';
    html += '<tr><td>!=</td><td>Not equal to</td><td>5 != 3</td><td>TRUE</td></tr>';
    html += '<tr><td>&lt;</td><td>Less than</td><td>3 &lt; 5</td><td>TRUE</td></tr>';
    html += '<tr><td>&gt;</td><td>Greater than</td><td>5 &gt; 3</td><td>TRUE</td></tr>';
    html += '<tr><td>&lt;=</td><td>Less than or equal</td><td>5 &lt;= 5</td><td>TRUE</td></tr>';
    html += '<tr><td>&gt;=</td><td>Greater than or equal</td><td>3 &gt;= 5</td><td>FALSE</td></tr>';

    // Boolean
    html += '<tr><td colspan="4" class="op-category">Boolean / Logical</td></tr>';
    html += '<tr><td>AND</td><td>Logical AND</td><td>TRUE AND FALSE</td><td>FALSE</td></tr>';
    html += '<tr><td>OR</td><td>Logical OR</td><td>TRUE OR FALSE</td><td>TRUE</td></tr>';
    html += '<tr><td>NOT</td><td>Logical NOT</td><td>NOT TRUE</td><td>FALSE</td></tr>';

    html += '</tbody></table>';
    html += '</div>';
    html += '</div>';

    tabContent.innerHTML = html;

    // Bind events
    var val1El = document.getElementById('op-val1');
    var val2El = document.getElementById('op-val2');
    var opEl   = document.getElementById('op-operator');

    function onOpChange() {
      // Hide val2 for NOT
      val2El.style.display = opEl.value === 'NOT' ? 'none' : '';
      evaluateOperator();
    }

    val1El.addEventListener('input', evaluateOperator);
    val2El.addEventListener('input', evaluateOperator);
    opEl.addEventListener('change', onOpChange);

    onOpChange();
  }

  function evaluateOperator() {
    var val1Raw = document.getElementById('op-val1').value.trim();
    var val2Raw = document.getElementById('op-val2').value.trim();
    var op      = document.getElementById('op-operator').value;
    var resultEl = document.getElementById('op-result');
    var explEl   = document.getElementById('op-explanation');

    var v1 = parseOpValue(val1Raw);
    var v2 = parseOpValue(val2Raw);
    var result;
    var explanation = '';
    var isError = false;
    var isBool = false;

    try {
      switch (op) {
        case '+':
          if (typeof v1 === 'string' || typeof v2 === 'string') {
            result = String(v1) + String(v2);
            explanation = 'String concatenation: joins two strings together.';
          } else {
            result = v1 + v2;
            explanation = 'Addition: adds two numbers.';
          }
          break;
        case '-':
          result = Number(v1) - Number(v2);
          explanation = 'Subtraction: subtracts the second number from the first.';
          break;
        case '*':
          result = Number(v1) * Number(v2);
          explanation = 'Multiplication: multiplies two numbers.';
          break;
        case '/':
          if (Number(v2) === 0) { result = 'Error: division by zero'; isError = true; }
          else {
            result = Number(v1) / Number(v2);
            explanation = 'Real division: gives a decimal result. ' + v1 + ' / ' + v2 + ' = ' + result;
          }
          break;
        case 'DIV':
          if (Number(v2) === 0) { result = 'Error: division by zero'; isError = true; }
          else {
            result = Math.floor(Number(v1) / Number(v2));
            explanation = 'Integer division (DIV): gives only the whole number part. ' + v1 + ' / ' + v2 + ' = ' + (Number(v1) / Number(v2)) + ', so DIV gives ' + result + '.';
          }
          break;
        case 'MOD':
          if (Number(v2) === 0) { result = 'Error: division by zero'; isError = true; }
          else {
            result = Number(v1) % Number(v2);
            explanation = 'Modulus (MOD): gives the remainder after division. ' + v1 + ' / ' + v2 + ' = ' + Math.floor(Number(v1) / Number(v2)) + ' remainder ' + result + '.';
          }
          break;
        case '==':
          result = v1 == v2; isBool = true;
          explanation = 'Equal to: checks if both values are the same.';
          break;
        case '!=':
          result = v1 != v2; isBool = true;
          explanation = 'Not equal to: checks if values are different.';
          break;
        case '<':
          result = Number(v1) < Number(v2); isBool = true;
          explanation = 'Less than: checks if the first value is smaller.';
          break;
        case '>':
          result = Number(v1) > Number(v2); isBool = true;
          explanation = 'Greater than: checks if the first value is larger.';
          break;
        case '<=':
          result = Number(v1) <= Number(v2); isBool = true;
          explanation = 'Less than or equal: checks if the first value is smaller or the same.';
          break;
        case '>=':
          result = Number(v1) >= Number(v2); isBool = true;
          explanation = 'Greater than or equal: checks if the first value is larger or the same.';
          break;
        case 'AND':
          var b1 = toBool(v1), b2 = toBool(v2);
          result = b1 && b2; isBool = true;
          explanation = 'AND: returns TRUE only if BOTH values are TRUE. ' + b1 + ' AND ' + b2 + ' = ' + result + '.';
          break;
        case 'OR':
          var o1 = toBool(v1), o2 = toBool(v2);
          result = o1 || o2; isBool = true;
          explanation = 'OR: returns TRUE if at LEAST ONE value is TRUE. ' + o1 + ' OR ' + o2 + ' = ' + result + '.';
          break;
        case 'NOT':
          var n1 = toBool(v1);
          result = !n1; isBool = true;
          explanation = 'NOT: inverts the boolean value. NOT ' + n1 + ' = ' + result + '.';
          break;
      }
    } catch (e) {
      result = 'Error';
      isError = true;
    }

    // Display result
    var displayText;
    if (isError) {
      displayText = result;
    } else if (isBool) {
      displayText = result ? 'TRUE' : 'FALSE';
    } else if (typeof result === 'string') {
      displayText = '"' + result + '"';
    } else if (typeof result === 'number') {
      displayText = Number.isInteger(result) ? String(result) : result.toFixed(4).replace(/\.?0+$/, '');
    } else {
      displayText = String(result);
    }

    resultEl.textContent = displayText;
    resultEl.className = 'op-result';
    if (isError) resultEl.className += ' result-error';
    else if (isBool && result) resultEl.className += ' result-bool-true';
    else if (isBool && !result) resultEl.className += ' result-bool-false';

    explEl.textContent = explanation;
    explEl.style.display = explanation ? '' : 'none';
  }

  function parseOpValue(raw) {
    if (raw === '') return 0;
    if (raw.toLowerCase() === 'true') return true;
    if (raw.toLowerCase() === 'false') return false;
    if (raw[0] === '"' && raw[raw.length - 1] === '"') return raw.substring(1, raw.length - 1);
    var num = Number(raw);
    if (!isNaN(num)) return num;
    return raw; // treat as string
  }

  function toBool(val) {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return Boolean(val);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 3: SELECTION & ITERATION
   * ════════════════════════════════════════════════════════════════ */

  var flowSubTab = 'ifelse';

  function buildFlowTab() {
    var html = '';

    // Sub-tabs
    html += '<div class="flow-sub-tabs">';
    html += '<button class="flow-sub-btn' + (flowSubTab === 'ifelse' ? ' active' : '') + '" data-flow="ifelse">IF / ELSE</button>';
    html += '<button class="flow-sub-btn' + (flowSubTab === 'forloop' ? ' active' : '') + '" data-flow="forloop">FOR Loop</button>';
    html += '<button class="flow-sub-btn' + (flowSubTab === 'whileloop' ? ' active' : '') + '" data-flow="whileloop">WHILE Loop</button>';
    html += '</div>';

    html += '<div id="flow-content"></div>';

    tabContent.innerHTML = html;

    // Bind sub-tab buttons
    var subBtns = tabContent.querySelectorAll('[data-flow]');
    subBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        flowSubTab = btn.getAttribute('data-flow');
        subBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        buildFlowContent();
      });
    });

    buildFlowContent();
  }

  function buildFlowContent() {
    var el = document.getElementById('flow-content');
    if (flowSubTab === 'ifelse') buildIfElse(el);
    else if (flowSubTab === 'forloop') buildForLoop(el);
    else if (flowSubTab === 'whileloop') buildWhileLoop(el);
  }

  /* ── IF/ELSE ──────────────────────────────────────────────────── */
  function buildIfElse(container) {
    var html = '';
    html += '<div class="if-layout">';

    // Sliders panel
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">Controls</h3>';
    html += '<div class="if-sliders">';
    html += '<div class="if-slider-row">';
    html += '<label for="if-score">score</label>';
    html += '<input type="range" id="if-score" min="0" max="100" value="65">';
    html += '<span class="slider-val" id="if-score-val">65</span>';
    html += '</div>';
    html += '<div class="if-slider-row">';
    html += '<label for="if-threshold">threshold</label>';
    html += '<input type="range" id="if-threshold" min="0" max="100" value="50">';
    html += '<span class="slider-val" id="if-threshold-val">50</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="if-result-display" id="if-result-display"></div>';
    html += '</div>';

    // Code display
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">Pseudocode</h3>';
    html += '<div class="if-code-block" id="if-code-block"></div>';
    html += '</div>';

    html += '</div>'; // end layout

    container.innerHTML = html;

    // Bind
    var scoreSlider = document.getElementById('if-score');
    var threshSlider = document.getElementById('if-threshold');

    function updateIfElse() {
      var score = parseInt(scoreSlider.value, 10);
      var threshold = parseInt(threshSlider.value, 10);
      document.getElementById('if-score-val').textContent = score;
      document.getElementById('if-threshold-val').textContent = threshold;

      var passes = score >= threshold;
      var resultStr = passes ? 'Pass' : 'Fail';

      // Render code with highlighting
      var codeBlock = document.getElementById('if-code-block');
      var lines = [
        { text: 'IF score >= threshold THEN', cls: '' },
        { text: '    result = "Pass"', cls: passes ? 'active-branch' : 'inactive-branch' },
        { text: 'ELSE', cls: '' },
        { text: '    result = "Fail"', cls: passes ? 'inactive-branch' : 'active-branch' },
        { text: 'ENDIF', cls: '' }
      ];

      var codeHtml = '';
      for (var i = 0; i < lines.length; i++) {
        codeHtml += '<div class="if-code-line ' + lines[i].cls + '">' + escHtml(lines[i].text) + '</div>';
      }
      codeBlock.innerHTML = codeHtml;

      // Result
      var resultEl = document.getElementById('if-result-display');
      resultEl.innerHTML = 'score = <strong>' + score + '</strong>, threshold = <strong>' + threshold + '</strong><br>' +
        'Condition: ' + score + ' >= ' + threshold + ' is <strong>' + (passes ? 'TRUE' : 'FALSE') + '</strong><br>' +
        'result = <span class="result-val" style="color:' + (passes ? '#10b981' : '#ef4444') + '">"' + resultStr + '"</span>';
    }

    scoreSlider.addEventListener('input', updateIfElse);
    threshSlider.addEventListener('input', updateIfElse);
    updateIfElse();
  }

  /* ── FOR LOOP ─────────────────────────────────────────────────── */
  var forState = { rows: [], currentRow: -1, running: false };

  function buildForLoop(container) {
    var html = '';

    // Controls
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">FOR Loop Controls</h3>';
    html += '<div class="for-controls">';
    html += '<label>Start:</label><input type="number" id="for-start" value="1">';
    html += '<label>End:</label><input type="number" id="for-end" value="5">';
    html += '<label>Step:</label><input type="number" id="for-step" value="1">';
    html += '<button class="ctrl-btn" id="for-step-btn" type="button">Step</button>';
    html += '<button class="ctrl-btn" id="for-run-btn" type="button">Run All</button>';
    html += '<button class="ctrl-btn" id="for-reset-btn" type="button">Reset</button>';
    html += '</div>';
    html += '</div>';

    // Code display
    html += '<div class="pf-panel" style="margin-top:var(--sp-3)">';
    html += '<h3 class="pf-panel-heading">Pseudocode</h3>';
    html += '<div class="for-code-block" id="for-code-block"></div>';
    html += '</div>';

    // Table
    html += '<div class="pf-panel" style="margin-top:var(--sp-3)">';
    html += '<h3 class="pf-panel-heading">Iteration Table</h3>';
    html += '<div class="for-table-scroll">';
    html += '<table class="comparison-table for-table" id="for-table">';
    html += '<thead><tr><th>Iteration</th><th>i</th><th>total (before)</th><th>total (after)</th></tr></thead>';
    html += '<tbody id="for-tbody"></tbody>';
    html += '</table>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // Reset state
    forState.rows = [];
    forState.currentRow = -1;
    forState.running = false;

    // Bind
    document.getElementById('for-step-btn').addEventListener('click', forStep);
    document.getElementById('for-run-btn').addEventListener('click', forRunAll);
    document.getElementById('for-reset-btn').addEventListener('click', function () {
      forState.rows = [];
      forState.currentRow = -1;
      forState.running = false;
      renderForLoop();
    });

    // Recompute on input changes
    var inputs = container.querySelectorAll('.for-controls input');
    inputs.forEach(function (inp) {
      inp.addEventListener('change', function () {
        forState.rows = [];
        forState.currentRow = -1;
        forState.running = false;
        renderForLoop();
      });
    });

    renderForLoop();
  }

  function computeForRows() {
    var start = parseInt(document.getElementById('for-start').value, 10) || 0;
    var end   = parseInt(document.getElementById('for-end').value, 10) || 0;
    var step  = parseInt(document.getElementById('for-step').value, 10) || 1;

    if (step === 0) step = 1;

    var rows = [];
    var total = 0;
    var iteration = 0;

    if (step > 0) {
      for (var i = start; i <= end; i += step) {
        iteration++;
        var before = total;
        total += i;
        rows.push({ iteration: iteration, i: i, before: before, after: total });
        if (iteration > 100) break;
      }
    } else {
      for (var j = start; j >= end; j += step) {
        iteration++;
        var beforeJ = total;
        total += j;
        rows.push({ iteration: iteration, i: j, before: beforeJ, after: total });
        if (iteration > 100) break;
      }
    }
    return rows;
  }

  function forStep() {
    if (forState.rows.length === 0) {
      forState.rows = computeForRows();
      forState.currentRow = -1;
    }
    if (forState.currentRow < forState.rows.length - 1) {
      forState.currentRow++;
    }
    renderForLoop();
  }

  function forRunAll() {
    forState.rows = computeForRows();
    forState.currentRow = forState.rows.length - 1;
    renderForLoop();
  }

  function renderForLoop() {
    // Code display
    var codeBlock = document.getElementById('for-code-block');
    if (codeBlock) {
      var start = document.getElementById('for-start').value;
      var end   = document.getElementById('for-end').value;
      var step  = document.getElementById('for-step').value;
      var codeHtml = '';
      codeHtml += '<div class="if-code-line">total = 0</div>';
      codeHtml += '<div class="if-code-line">FOR i = ' + escHtml(start) + ' TO ' + escHtml(end) + ' STEP ' + escHtml(step) + '</div>';
      codeHtml += '<div class="if-code-line">    total = total + i</div>';
      codeHtml += '<div class="if-code-line">NEXT i</div>';
      codeBlock.innerHTML = codeHtml;
    }

    // Table
    var tbody = document.getElementById('for-tbody');
    if (tbody) {
      var tbodyHtml = '';
      for (var r = 0; r < forState.rows.length; r++) {
        if (r > forState.currentRow && forState.currentRow >= 0) break;
        var row = forState.rows[r];
        var cls = (r === forState.currentRow) ? ' class="row-current"' : '';
        tbodyHtml += '<tr' + cls + '>';
        tbodyHtml += '<td>' + row.iteration + '</td>';
        tbodyHtml += '<td>' + row.i + '</td>';
        tbodyHtml += '<td>' + row.before + '</td>';
        tbodyHtml += '<td class="changed">' + row.after + '</td>';
        tbodyHtml += '</tr>';
      }
      if (forState.rows.length === 0 && forState.currentRow === -1) {
        tbodyHtml = '<tr><td colspan="4" style="color:var(--clr-text-muted);text-align:center;padding:var(--sp-4);">Click "Step" or "Run All" to begin.</td></tr>';
      }
      tbody.innerHTML = tbodyHtml;
    }
  }

  /* ── WHILE LOOP ───────────────────────────────────────────────── */
  var whileState = { rows: [], currentRow: -1, infinite: false };

  function buildWhileLoop(container) {
    var html = '';

    // Controls
    html += '<div class="pf-panel">';
    html += '<h3 class="pf-panel-heading">WHILE Loop Controls</h3>';
    html += '<div class="while-controls">';
    html += '<label>x =</label><input type="number" id="while-init" value="1">';
    html += '<label>WHILE x</label>';
    html += '<select id="while-cond">';
    html += '<option value="<">&lt;</option>';
    html += '<option value=">">&gt;</option>';
    html += '<option value="<=">&lt;=</option>';
    html += '<option value=">=">&gt;=</option>';
    html += '</select>';
    html += '<input type="number" id="while-target" value="10">';
    html += '<label>x = x</label>';
    html += '<select id="while-op">';
    html += '<option value="+">+</option>';
    html += '<option value="-">-</option>';
    html += '<option value="*">*</option>';
    html += '<option value="/">/</option>';
    html += '</select>';
    html += '<input type="number" id="while-operand" value="2">';
    html += '</div>';
    html += '<div class="while-controls">';
    html += '<button class="ctrl-btn" id="while-step-btn" type="button">Step</button>';
    html += '<button class="ctrl-btn" id="while-run-btn" type="button">Run All</button>';
    html += '<button class="ctrl-btn" id="while-reset-btn" type="button">Reset</button>';
    html += '</div>';
    html += '</div>';

    // Code display
    html += '<div class="pf-panel" style="margin-top:var(--sp-3)">';
    html += '<h3 class="pf-panel-heading">Pseudocode</h3>';
    html += '<div class="while-code-block" id="while-code-block"></div>';
    html += '</div>';

    // Table
    html += '<div class="pf-panel" style="margin-top:var(--sp-3)">';
    html += '<h3 class="pf-panel-heading">Iteration Table</h3>';
    html += '<div class="while-table-scroll">';
    html += '<table class="comparison-table while-table" id="while-table">';
    html += '<thead><tr><th>Iteration</th><th>x (before)</th><th>Condition</th><th>x (after)</th></tr></thead>';
    html += '<tbody id="while-tbody"></tbody>';
    html += '</table>';
    html += '</div>';
    html += '<div id="while-warning"></div>';
    html += '</div>';

    container.innerHTML = html;

    // Reset state
    whileState.rows = [];
    whileState.currentRow = -1;
    whileState.infinite = false;

    // Bind
    document.getElementById('while-step-btn').addEventListener('click', whileStep);
    document.getElementById('while-run-btn').addEventListener('click', whileRunAll);
    document.getElementById('while-reset-btn').addEventListener('click', function () {
      whileState.rows = [];
      whileState.currentRow = -1;
      whileState.infinite = false;
      renderWhileLoop();
    });

    // Recompute on input changes
    var inputs = container.querySelectorAll('.while-controls input, .while-controls select');
    inputs.forEach(function (inp) {
      inp.addEventListener('change', function () {
        whileState.rows = [];
        whileState.currentRow = -1;
        whileState.infinite = false;
        renderWhileLoop();
      });
    });

    renderWhileLoop();
  }

  function computeWhileRows() {
    var x       = parseFloat(document.getElementById('while-init').value) || 0;
    var cond    = document.getElementById('while-cond').value;
    var target  = parseFloat(document.getElementById('while-target').value) || 0;
    var op      = document.getElementById('while-op').value;
    var operand = parseFloat(document.getElementById('while-operand').value) || 0;

    var rows = [];
    var iteration = 0;
    var infinite = false;
    var MAX_ITER = 1000;

    while (iteration < MAX_ITER) {
      var condResult = evalCondition(x, cond, target);
      if (!condResult) break;

      iteration++;
      var before = x;
      switch (op) {
        case '+': x = x + operand; break;
        case '-': x = x - operand; break;
        case '*': x = x * operand; break;
        case '/':
          if (operand === 0) { infinite = true; x = Infinity; }
          else x = x / operand;
          break;
      }
      // Round to avoid floating point issues
      x = Math.round(x * 10000) / 10000;

      var condStr = before + ' ' + cond + ' ' + target + ' = ' + (condResult ? 'TRUE' : 'FALSE');
      rows.push({ iteration: iteration, before: before, cond: condStr, after: x });

      if (iteration >= MAX_ITER) {
        infinite = true;
        break;
      }
    }

    return { rows: rows, infinite: infinite };
  }

  function evalCondition(x, cond, target) {
    switch (cond) {
      case '<':  return x < target;
      case '>':  return x > target;
      case '<=': return x <= target;
      case '>=': return x >= target;
    }
    return false;
  }

  function whileStep() {
    if (whileState.rows.length === 0) {
      var result = computeWhileRows();
      whileState.rows = result.rows;
      whileState.infinite = result.infinite;
      whileState.currentRow = -1;
    }
    if (whileState.currentRow < whileState.rows.length - 1) {
      whileState.currentRow++;
    }
    renderWhileLoop();
  }

  function whileRunAll() {
    var result = computeWhileRows();
    whileState.rows = result.rows;
    whileState.infinite = result.infinite;
    whileState.currentRow = whileState.rows.length - 1;
    renderWhileLoop();
  }

  function renderWhileLoop() {
    // Code display
    var codeBlock = document.getElementById('while-code-block');
    if (codeBlock) {
      var initVal = document.getElementById('while-init').value;
      var condVal = document.getElementById('while-cond').value;
      var targetVal = document.getElementById('while-target').value;
      var opVal = document.getElementById('while-op').value;
      var operandVal = document.getElementById('while-operand').value;

      var condDisplay = condVal.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      var codeHtml = '';
      codeHtml += '<div class="if-code-line">x = ' + escHtml(initVal) + '</div>';
      codeHtml += '<div class="if-code-line">WHILE x ' + condDisplay + ' ' + escHtml(targetVal) + '</div>';
      codeHtml += '<div class="if-code-line">    x = x ' + escHtml(opVal) + ' ' + escHtml(operandVal) + '</div>';
      codeHtml += '<div class="if-code-line">ENDWHILE</div>';
      codeBlock.innerHTML = codeHtml;
    }

    // Table
    var tbody = document.getElementById('while-tbody');
    if (tbody) {
      var tbodyHtml = '';
      for (var r = 0; r < whileState.rows.length; r++) {
        if (r > whileState.currentRow && whileState.currentRow >= 0) break;
        var row = whileState.rows[r];
        var cls = (r === whileState.currentRow) ? ' class="row-current"' : '';
        tbodyHtml += '<tr' + cls + '>';
        tbodyHtml += '<td>' + row.iteration + '</td>';
        tbodyHtml += '<td>' + row.before + '</td>';
        tbodyHtml += '<td style="font-size:var(--fs-xs)">' + escHtml(row.cond) + '</td>';
        tbodyHtml += '<td class="changed">' + row.after + '</td>';
        tbodyHtml += '</tr>';
      }
      if (whileState.rows.length === 0 && whileState.currentRow === -1) {
        tbodyHtml = '<tr><td colspan="4" style="color:var(--clr-text-muted);text-align:center;padding:var(--sp-4);">Click "Step" or "Run All" to begin.</td></tr>';
      }
      tbody.innerHTML = tbodyHtml;

      // Auto-scroll
      var scrollWrap = tbody.parentElement;
      if (scrollWrap && tbody.lastChild) {
        tbody.lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }

    // Warning
    var warningEl = document.getElementById('while-warning');
    if (warningEl) {
      if (whileState.infinite && whileState.currentRow >= whileState.rows.length - 1) {
        warningEl.innerHTML = '<div class="while-warning">Infinite loop detected! The loop exceeded 1,000 iterations and was stopped. Check your condition and operation to ensure the loop will terminate.</div>';
      } else {
        warningEl.innerHTML = '';
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════════
   *  UTILITIES
   * ════════════════════════════════════════════════════════════════ */

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  buildActiveTab();
  engine.reset();

})();
