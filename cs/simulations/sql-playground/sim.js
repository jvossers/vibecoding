(function () {
  'use strict';

  /* ── Pre-loaded database ───────────────────────────────────────── */
  var COLUMNS = ['id', 'firstName', 'lastName', 'age', 'grade', 'house'];

  var STUDENTS = [
    { id: 1, firstName: 'Alice', lastName: 'Smith', age: 14, grade: 8, house: 'Red' },
    { id: 2, firstName: 'Bob', lastName: 'Johnson', age: 15, grade: 7, house: 'Blue' },
    { id: 3, firstName: 'Charlie', lastName: 'Williams', age: 14, grade: 9, house: 'Green' },
    { id: 4, firstName: 'Diana', lastName: 'Brown', age: 16, grade: 6, house: 'Red' },
    { id: 5, firstName: 'Eve', lastName: 'Jones', age: 15, grade: 8, house: 'Blue' },
    { id: 6, firstName: 'Frank', lastName: 'Davis', age: 14, grade: 7, house: 'Green' },
    { id: 7, firstName: 'Grace', lastName: 'Miller', age: 16, grade: 9, house: 'Red' },
    { id: 8, firstName: 'Henry', lastName: 'Wilson', age: 15, grade: 8, house: 'Blue' },
    { id: 9, firstName: 'Isla', lastName: 'Moore', age: 14, grade: 6, house: 'Green' },
    { id: 10, firstName: 'Jack', lastName: 'Taylor', age: 16, grade: 7, house: 'Red' },
    { id: 11, firstName: 'Katie', lastName: 'Anderson', age: 15, grade: 9, house: 'Blue' },
    { id: 12, firstName: 'Leo', lastName: 'Thomas', age: 14, grade: 8, house: 'Green' },
    { id: 13, firstName: 'Mia', lastName: 'Jackson', age: 16, grade: 7, house: 'Red' },
    { id: 14, firstName: 'Noah', lastName: 'White', age: 15, grade: 6, house: 'Blue' },
    { id: 15, firstName: 'Olivia', lastName: 'Harris', age: 14, grade: 9, house: 'Green' }
  ];

  /* ── Query templates ───────────────────────────────────────────── */
  var TEMPLATES = [
    { label: '-- Choose a template --', sql: '' },
    { label: 'SELECT * FROM Students', sql: 'SELECT * FROM Students' },
    { label: 'SELECT firstName, lastName FROM Students', sql: 'SELECT firstName, lastName FROM Students' },
    { label: 'SELECT * FROM Students WHERE age > 14', sql: 'SELECT * FROM Students WHERE age > 14' },
    { label: "SELECT * FROM Students WHERE house = 'Red'", sql: "SELECT * FROM Students WHERE house = 'Red'" },
    { label: 'SELECT * FROM Students ORDER BY grade DESC', sql: 'SELECT * FROM Students ORDER BY grade DESC' },
    { label: "SELECT * FROM Students WHERE age >= 15 AND house = 'Blue'", sql: "SELECT * FROM Students WHERE age >= 15 AND house = 'Blue'" },
    { label: 'SELECT COUNT(*) FROM Students', sql: 'SELECT COUNT(*) FROM Students' },
    { label: 'SELECT AVG(age) FROM Students', sql: 'SELECT AVG(age) FROM Students' },
    { label: 'SELECT house, COUNT(*) FROM Students GROUP BY house', sql: 'SELECT house, COUNT(*) FROM Students GROUP BY house' }
  ];

  /* ── DOM setup ─────────────────────────────────────────────────── */
  var controlsEl = document.getElementById('controls');
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  // Build the SQL interface above the control bar
  var sqlWrap = document.createElement('div');
  sqlWrap.className = 'sql-playground-wrap';
  controlsEl.parentNode.insertBefore(sqlWrap, controlsEl);

  // Schema strip
  var schemaStrip = document.createElement('div');
  schemaStrip.className = 'schema-strip';
  schemaStrip.innerHTML = '<strong>Students:</strong> ' +
    COLUMNS.map(function (c) { return '<span>' + c + '</span>'; }).join(' ');
  sqlWrap.appendChild(schemaStrip);

  // Template selector toolbar
  var toolbar = document.createElement('div');
  toolbar.className = 'sql-toolbar';
  var templateLabel = document.createElement('label');
  templateLabel.textContent = 'Template:';
  templateLabel.setAttribute('for', 'sql-template');
  var templateSelect = document.createElement('select');
  templateSelect.id = 'sql-template';
  TEMPLATES.forEach(function (t, i) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = t.label;
    templateSelect.appendChild(opt);
  });
  toolbar.appendChild(templateLabel);
  toolbar.appendChild(templateSelect);
  sqlWrap.appendChild(toolbar);

  // SQL textarea
  var sqlInput = document.createElement('textarea');
  sqlInput.id = 'sql-input';
  sqlInput.className = 'sql-input';
  sqlInput.rows = 4;
  sqlInput.placeholder = 'Type your SQL query here, e.g. SELECT * FROM Students';
  sqlInput.spellcheck = false;
  sqlInput.setAttribute('autocapitalize', 'off');
  sqlInput.setAttribute('autocomplete', 'off');
  sqlInput.setAttribute('autocorrect', 'off');
  sqlWrap.appendChild(sqlInput);

  // Actions row
  var actionsRow = document.createElement('div');
  actionsRow.className = 'sql-actions';
  var runBtn = document.createElement('button');
  runBtn.type = 'button';
  runBtn.className = 'run-btn';
  runBtn.textContent = 'Run Query';
  actionsRow.appendChild(runBtn);
  sqlWrap.appendChild(actionsRow);

  // Results area
  var resultsDiv = document.createElement('div');
  resultsDiv.className = 'sql-results';
  sqlWrap.appendChild(resultsDiv);

  /* ── Event handlers ────────────────────────────────────────────── */
  templateSelect.addEventListener('change', function () {
    var idx = parseInt(templateSelect.value, 10);
    if (idx > 0) {
      sqlInput.value = TEMPLATES[idx].sql;
    }
  });

  runBtn.addEventListener('click', function () {
    runQuery();
  });

  sqlInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
  });

  engine.onReset(function () {
    sqlInput.value = '';
    templateSelect.value = '0';
    resultsDiv.innerHTML = '';
  });

  /* ── SQL parser and executor ───────────────────────────────────── */
  function runQuery() {
    var sql = sqlInput.value.trim();
    if (!sql) {
      showError('Empty query', 'Please type a SQL query to run.');
      return;
    }

    try {
      var result = executeSQL(sql);
      showResults(result);
    } catch (e) {
      showError('Query Error', e.message);
    }
  }

  function executeSQL(sql) {
    // Normalise whitespace but preserve string literals
    var normalised = sql.replace(/\s+/g, ' ').trim();
    // Remove trailing semicolon
    normalised = normalised.replace(/;\s*$/, '');

    // Check for basic SELECT ... FROM structure
    var selectMatch = normalised.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(.*)/i);
    if (!selectMatch) {
      // Check if they wrote SELECT without FROM
      if (/^SELECT\s/i.test(normalised)) {
        throw new Error('Missing FROM clause. Syntax: SELECT columns FROM tableName');
      }
      throw new Error('Could not parse query. Check your SQL syntax. Queries must start with SELECT.');
    }

    var selectPart = selectMatch[1].trim();
    var tableName = selectMatch[2].trim();
    var remainder = selectMatch[3].trim();

    // Validate table name
    if (tableName.toLowerCase() !== 'students') {
      throw new Error("Unknown table '" + tableName + "'. Available table: Students");
    }

    // Parse the remainder for WHERE, ORDER BY, GROUP BY
    var wherePart = null;
    var orderPart = null;
    var groupPart = null;

    // Extract GROUP BY (must check before WHERE to handle order)
    var groupMatch = remainder.match(/\bGROUP\s+BY\s+(\w+)/i);
    if (groupMatch) {
      groupPart = groupMatch[1].trim();
      remainder = remainder.replace(/\bGROUP\s+BY\s+\w+/i, '').trim();
    }

    // Extract ORDER BY
    var orderMatch = remainder.match(/\bORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      orderPart = { column: orderMatch[1].trim(), dir: (orderMatch[2] || 'ASC').toUpperCase() };
      remainder = remainder.replace(/\bORDER\s+BY\s+\w+(?:\s+(?:ASC|DESC))?/i, '').trim();
    }

    // Extract WHERE
    var whereMatch = remainder.match(/\bWHERE\s+(.+)/i);
    if (whereMatch) {
      wherePart = whereMatch[1].trim();
    }

    // Detect aggregate functions
    var aggregates = parseAggregates(selectPart);

    // If GROUP BY is present, handle grouped aggregation
    if (groupPart) {
      return executeGroupBy(selectPart, groupPart, wherePart, aggregates);
    }

    // If there are aggregate functions without GROUP BY
    if (aggregates.length > 0 && !hasNonAggregateColumns(selectPart, aggregates)) {
      return executeAggregate(aggregates, wherePart);
    }

    // Regular SELECT
    var columns = parseColumns(selectPart);
    var rows = filterRows(STUDENTS, wherePart);

    if (orderPart) {
      rows = sortRows(rows, orderPart);
    }

    return { columns: columns, rows: projectRows(rows, columns) };
  }

  /* ── Column parsing ────────────────────────────────────────────── */
  function parseColumns(selectPart) {
    if (selectPart.trim() === '*') {
      return COLUMNS.slice();
    }
    var cols = selectPart.split(',').map(function (c) { return c.trim(); });
    cols.forEach(function (c) {
      if (COLUMNS.indexOf(c) === -1) {
        throw new Error("Unknown column '" + c + "'. Available columns: " + COLUMNS.join(', '));
      }
    });
    return cols;
  }

  function projectRows(rows, columns) {
    return rows.map(function (row) {
      var projected = {};
      columns.forEach(function (c) {
        projected[c] = row[c];
      });
      return projected;
    });
  }

  /* ── WHERE clause parsing ──────────────────────────────────────── */
  function filterRows(rows, wherePart) {
    if (!wherePart) return rows.slice();

    // Split on AND / OR while preserving the operator
    var parts = splitConditions(wherePart);
    return rows.filter(function (row) {
      return evaluateWhere(row, parts);
    });
  }

  function splitConditions(wherePart) {
    // Tokenise: split by AND/OR at word boundaries, keeping the operator
    var tokens = [];
    var remaining = wherePart;
    var currentCondition = '';

    // Regex to split on AND/OR but not inside quotes
    var parts = [];
    var re = /\b(AND|OR)\b/gi;
    var lastIndex = 0;
    var match;

    while ((match = re.exec(wherePart)) !== null) {
      parts.push({ type: 'condition', value: wherePart.substring(lastIndex, match.index).trim() });
      parts.push({ type: 'operator', value: match[1].toUpperCase() });
      lastIndex = re.lastIndex;
    }
    parts.push({ type: 'condition', value: wherePart.substring(lastIndex).trim() });

    // Filter out empty conditions
    return parts.filter(function (p) { return p.value !== ''; });
  }

  function evaluateWhere(row, parts) {
    if (parts.length === 0) return true;

    // Evaluate first condition
    var result = evaluateCondition(row, parts[0].value);

    for (var i = 1; i < parts.length; i += 2) {
      if (i + 1 >= parts.length) break;
      var operator = parts[i].value;
      var nextResult = evaluateCondition(row, parts[i + 1].value);

      if (operator === 'AND') {
        result = result && nextResult;
      } else if (operator === 'OR') {
        result = result || nextResult;
      }
    }

    return result;
  }

  function evaluateCondition(row, condition) {
    // Parse: column operator value
    // Support: =, !=, >, <, >=, <=, LIKE
    var likeMatch = condition.match(/^(\w+)\s+LIKE\s+(['"])(.*?)\2$/i);
    if (likeMatch) {
      var col = likeMatch[1];
      var pattern = likeMatch[3];
      validateColumn(col);
      var val = String(row[col]);
      // Convert SQL LIKE pattern to regex: % = .*, _ = .
      var regexStr = '^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$';
      return new RegExp(regexStr, 'i').test(val);
    }

    var compMatch = condition.match(/^(\w+)\s*(>=|<=|!=|>|<|=)\s*(.+)$/);
    if (!compMatch) {
      throw new Error("Could not parse condition: '" + condition + "'. Expected format: column operator value");
    }

    var colName = compMatch[1].trim();
    var op = compMatch[2];
    var rawVal = compMatch[3].trim();

    validateColumn(colName);

    var rowVal = row[colName];
    var compareVal = parseValue(rawVal);

    switch (op) {
      case '=':  return rowVal == compareVal;
      case '!=': return rowVal != compareVal;
      case '>':  return rowVal > compareVal;
      case '<':  return rowVal < compareVal;
      case '>=': return rowVal >= compareVal;
      case '<=': return rowVal <= compareVal;
      default:   return false;
    }
  }

  function parseValue(raw) {
    // String literal (single or double quotes)
    var strMatch = raw.match(/^(['"])(.*)\1$/);
    if (strMatch) return strMatch[2];
    // Number
    var num = Number(raw);
    if (!isNaN(num)) return num;
    // Treat as string
    return raw;
  }

  function validateColumn(col) {
    if (COLUMNS.indexOf(col) === -1) {
      throw new Error("Unknown column '" + col + "'. Available columns: " + COLUMNS.join(', '));
    }
  }

  /* ── ORDER BY ──────────────────────────────────────────────────── */
  function sortRows(rows, orderPart) {
    validateColumn(orderPart.column);
    var col = orderPart.column;
    var asc = orderPart.dir === 'ASC';
    return rows.slice().sort(function (a, b) {
      var va = a[col], vb = b[col];
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
  }

  /* ── Aggregate functions ───────────────────────────────────────── */
  function parseAggregates(selectPart) {
    var aggs = [];
    var re = /(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*(\*|\w+)\s*\)/gi;
    var m;
    while ((m = re.exec(selectPart)) !== null) {
      aggs.push({ fn: m[1].toUpperCase(), arg: m[2] });
    }
    return aggs;
  }

  function hasNonAggregateColumns(selectPart, aggregates) {
    // Remove aggregate expressions and see if there are remaining column names
    var cleaned = selectPart;
    aggregates.forEach(function () {
      cleaned = cleaned.replace(/(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*(\*|\w+)\s*\)/i, '').trim();
    });
    cleaned = cleaned.replace(/,/g, '').trim();
    return cleaned.length > 0;
  }

  function executeAggregate(aggregates, wherePart) {
    var rows = filterRows(STUDENTS, wherePart);
    var resultRow = {};
    var columns = [];

    aggregates.forEach(function (agg) {
      var label = agg.fn + '(' + agg.arg + ')';
      columns.push(label);

      switch (agg.fn) {
        case 'COUNT':
          resultRow[label] = rows.length;
          break;
        case 'SUM':
          validateColumn(agg.arg);
          resultRow[label] = rows.reduce(function (s, r) { return s + r[agg.arg]; }, 0);
          break;
        case 'AVG':
          validateColumn(agg.arg);
          var sum = rows.reduce(function (s, r) { return s + r[agg.arg]; }, 0);
          resultRow[label] = rows.length > 0 ? Math.round((sum / rows.length) * 100) / 100 : 0;
          break;
        case 'MAX':
          validateColumn(agg.arg);
          resultRow[label] = rows.reduce(function (mx, r) { return r[agg.arg] > mx ? r[agg.arg] : mx; }, -Infinity);
          break;
        case 'MIN':
          validateColumn(agg.arg);
          resultRow[label] = rows.reduce(function (mn, r) { return r[agg.arg] < mn ? r[agg.arg] : mn; }, Infinity);
          break;
      }
    });

    return { columns: columns, rows: [resultRow] };
  }

  /* ── GROUP BY ──────────────────────────────────────────────────── */
  function executeGroupBy(selectPart, groupCol, wherePart, aggregates) {
    validateColumn(groupCol);

    var rows = filterRows(STUDENTS, wherePart);

    // Group rows by the groupCol value
    var groups = {};
    rows.forEach(function (row) {
      var key = row[groupCol];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    // Build result columns from the SELECT part
    var selectTokens = selectPart.split(',').map(function (t) { return t.trim(); });
    var resultColumns = [];
    var resultRows = [];

    // Determine output columns
    selectTokens.forEach(function (token) {
      var aggMatch = token.match(/(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*(\*|\w+)\s*\)/i);
      if (aggMatch) {
        resultColumns.push(aggMatch[1].toUpperCase() + '(' + aggMatch[2] + ')');
      } else {
        // Plain column
        validateColumn(token);
        resultColumns.push(token);
      }
    });

    // Build rows for each group
    var groupKeys = Object.keys(groups);
    groupKeys.sort();

    groupKeys.forEach(function (key) {
      var groupRows = groups[key];
      var resultRow = {};

      selectTokens.forEach(function (token) {
        var aggMatch = token.match(/(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*(\*|\w+)\s*\)/i);
        if (aggMatch) {
          var fn = aggMatch[1].toUpperCase();
          var arg = aggMatch[2];
          var label = fn + '(' + arg + ')';

          switch (fn) {
            case 'COUNT':
              resultRow[label] = groupRows.length;
              break;
            case 'SUM':
              validateColumn(arg);
              resultRow[label] = groupRows.reduce(function (s, r) { return s + r[arg]; }, 0);
              break;
            case 'AVG':
              validateColumn(arg);
              var sum = groupRows.reduce(function (s, r) { return s + r[arg]; }, 0);
              resultRow[label] = groupRows.length > 0 ? Math.round((sum / groupRows.length) * 100) / 100 : 0;
              break;
            case 'MAX':
              validateColumn(arg);
              resultRow[label] = groupRows.reduce(function (mx, r) { return r[arg] > mx ? r[arg] : mx; }, -Infinity);
              break;
            case 'MIN':
              validateColumn(arg);
              resultRow[label] = groupRows.reduce(function (mn, r) { return r[arg] < mn ? r[arg] : mn; }, Infinity);
              break;
          }
        } else {
          // Plain column — use the group key
          resultRow[token] = groupRows[0][token];
        }
      });

      resultRows.push(resultRow);
    });

    return { columns: resultColumns, rows: resultRows };
  }

  /* ── Display results ───────────────────────────────────────────── */
  function showResults(result) {
    var html = '';

    // Status message
    html += '<div class="sql-results-header success">';
    html += result.rows.length + (result.rows.length === 1 ? ' row' : ' rows') + ' returned';
    html += '</div>';

    if (result.rows.length > 0) {
      html += '<div class="sql-table-wrap">';
      html += '<table class="comparison-table">';
      html += '<thead><tr>';
      result.columns.forEach(function (col) {
        html += '<th>' + escapeHtml(col) + '</th>';
      });
      html += '</tr></thead>';
      html += '<tbody>';
      result.rows.forEach(function (row) {
        html += '<tr>';
        result.columns.forEach(function (col) {
          var val = row[col];
          html += '<td>' + escapeHtml(String(val !== undefined ? val : '')) + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '</div>';
    }

    resultsDiv.innerHTML = html;
  }

  function showError(title, message) {
    var html = '<div class="sql-results-header error">Query failed</div>';
    html += '<div class="sql-error">';
    html += '<strong>' + escapeHtml(title) + '</strong>';
    html += escapeHtml(message);
    html += '</div>';
    resultsDiv.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ── Initial state ─────────────────────────────────────────────── */
  sqlInput.value = 'SELECT * FROM Students';
  runQuery();
})();
