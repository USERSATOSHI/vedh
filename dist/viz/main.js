(function () {
  'use strict';

  const $ = function (selector) {
    return document.querySelector(selector);
  };
  const $$ = function (selector) {
    return Array.from(document.querySelectorAll(selector));
  };
  const app = $('#app');
  const stage = $('#stage');
  const canvas = $('#graph');
  const ctx = canvas.getContext('2d');
  const minimap = $('#minimap');
  const miniCtx = minimap.getContext('2d');
  const search = $('#search');
  const results = $('#results');
  const detail = $('#detail');
  const tooltip = $('#tooltip');

  const palette = [
    '#8b8df8',
    '#58a6d6',
    '#5dbb91',
    '#d39a58',
    '#cf7288',
    '#8c78c9',
    '#55aaa6',
    '#b1a05e',
    '#6f8ed0',
    '#bd7cac',
    '#7da265',
    '#b87862',
  ];
  const edgePalette = {
    calls: '#6ca6e8',
    constructor: '#6ca6e8',
    import: '#9b84d8',
    imports: '#9b84d8',
    contains: '#535966',
    fires_hook: '#d7779f',
    dispatches: '#d7779f',
    hook: '#d7779f',
    path: '#e4b65e',
  };
  const callTypes = new Set([
    'calls',
    'constructor',
    'fires_hook',
    'dispatches',
  ]);
  const state = {
    data: { nodes: [], edges: [] },
    nodesById: new Map(),
    adjacency: new Map(),
    groups: new Map(),
    hyperbolic: { innerRadius: 110, outerRadius: 900 },
    packageEntries: new Map(),
    graphPositions: new Map(),
    viewPositions: new Map(),
    visibleNodes: [],
    visibleEdges: [],
    selectedId: null,
    hoveredId: null,
    mode: 'graph',
    focusIds: null,
    pathStart: null,
    pathIds: new Set(),
    pathPairs: new Set(),
    callGraph: null,
    camera: { x: 0, y: 0, scale: 1 },
    edgeLabels: true,
    activeTab: 'info',
    detailCache: new Map(),
    labelCache: new Map(),
    drawQueued: false,
    miniBounds: null,
    lastMiniDraw: 0,
    motionUntil: 0,
    motionTimer: null,
    frame: {
      moving: false,
      nodeLabels: 0,
      edgeLabels: 0,
      labelCells: new Set(),
      viewport: null,
      width: 0,
      height: 0,
    },
    loading: true,
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(
      /[&<>"']/g,
      function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[char];
      },
    );
  }

  function icon(name) {
    return '<svg><use href="#i-' + name + '"/></svg>';
  }

  function hash(value) {
    let result = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1)
      result = (result * 31 + text.charCodeAt(i)) | 0;
    return Math.abs(result);
  }

  function kindOf(node) {
    const kind = String((node && node.kind) || '').toLowerCase();
    if (kind.indexOf('interface') >= 0) return 'interface';
    if (kind.indexOf('constructor') >= 0 || kind.indexOf('method') >= 0)
      return 'method';
    if (kind.indexOf('class') >= 0) return 'class';
    if (kind.indexOf('function') >= 0 || kind === 'arrow_function')
      return 'function';
    if (kind.indexOf('event') >= 0 || kind.indexOf('hook') >= 0) return 'event';
    if (
      kind.indexOf('variable') >= 0 ||
      kind.indexOf('property') >= 0 ||
      kind.indexOf('field') >= 0 ||
      kind.indexOf('declarator') >= 0
    )
      return 'variable';
    if (kind.indexOf('module') >= 0 || kind.indexOf('namespace') >= 0)
      return 'module';
    if (
      kind.indexOf('type') >= 0 ||
      kind.indexOf('enum') >= 0 ||
      kind.indexOf('struct') >= 0 ||
      kind.indexOf('trait') >= 0
    )
      return 'type';
    return 'other';
  }

  function groupId(node) {
    const metadata = (node && node.metadata) || {};
    if (metadata.community_id != null) return String(metadata.community_id);
    return 'area:' + sourceArea(node);
  }

  function groupName(node) {
    const id = groupId(node);
    const area = sourceArea(node);
    return /^area:/.test(id) ? area : area + ' · community ' + id;
  }

  function sourceArea(node) {
    const metadata = (node && node.metadata) || {};
    if (metadata.community_area)
      return String(metadata.community_area).replace(/^pkg\//, '');
    const path = String((node && node.file_path) || '').replaceAll('\\', '/');
    const packageMatch = path.match(/\/packages\/([^/]+)(?:\/([^/]+))?/);
    if (packageMatch)
      return packageMatch[1] === 'extensions' && packageMatch[2]
        ? 'extensions/' + packageMatch[2]
        : packageMatch[1];
    if (metadata.domain) return String(metadata.domain);
    const sourceMatch = path.match(/\/src\/([^/]+)/);
    return sourceMatch ? sourceMatch[1] : 'project';
  }

  function shortPath(path) {
    const clean = String(path || '').replaceAll('\\', '/');
    const marker = clean.lastIndexOf('/packages/');
    if (marker >= 0) return clean.slice(marker + 1);
    const parts = clean.split('/');
    return parts.slice(-4).join('/');
  }

  function groupColor(node) {
    const group = state.groups.get(groupId(node));
    return group ? group.color : palette[hash(groupId(node)) % palette.length];
  }

  function edgeColor(type) {
    const key = String(type || '').toLowerCase();
    if (edgePalette[key]) return edgePalette[key];
    if (key.indexOf('call') >= 0) return edgePalette.calls;
    if (key.indexOf('import') >= 0) return edgePalette.import;
    if (key.indexOf('hook') >= 0 || key.indexOf('event') >= 0)
      return edgePalette.hook;
    return '#63aa8e';
  }

  function setMessage(message, isError) {
    $('#message').textContent = message;
    $('#statusDot').classList.toggle('error', Boolean(isError));
  }

  function buildIndexes() {
    state.nodesById = new Map();
    state.adjacency = new Map();
    state.groups = new Map();
    state.packageEntries = new Map();
    state.data.nodes.forEach(function (node) {
      state.nodesById.set(node.id, node);
      state.adjacency.set(node.id, []);
      const id = groupId(node);
      let group = state.groups.get(id);
      if (!group) {
        group = {
          id: id,
          name: groupName(node),
          area: sourceArea(node),
          nodes: [],
          color: palette[hash(id) % palette.length],
          sector: null,
          maxDepth: 0,
          treeEdges: [],
        };
        state.groups.set(id, group);
      }
      group.nodes.push(node);
    });
    state.data.edges.forEach(function (edge) {
      if (state.adjacency.has(edge.source))
        state.adjacency
          .get(edge.source)
          .push({ id: edge.target, edge: edge, outgoing: true });
      if (state.adjacency.has(edge.target))
        state.adjacency
          .get(edge.target)
          .push({ id: edge.source, edge: edge, outgoing: false });
    });
    buildPackageEntries();
    layoutGraph();
    populateFilters();
    renderLegend();
    renderEntryPaths();
  }

  function buildPackageEntries() {
    const packages = new Map();
    state.data.nodes.forEach(function (node) {
      const area = sourceArea(node);
      if (!packages.has(area)) packages.set(area, []);
      packages.get(area).push(node);
    });
    packages.forEach(function (nodes, name) {
      const entry = nodes.slice().sort(function (a, b) {
        return (
          entryScore(b, name) - entryScore(a, name) ||
          degree(b.id) - degree(a.id)
        );
      })[0];
      if (entry) state.packageEntries.set(name, entry.id);
    });
  }

  function renderEntryPaths() {
    const container = $('#entryPaths');
    if (!container) return;
    const count = $('#packageStartCount');
    if (count) count.textContent = state.packageEntries.size;
    container.innerHTML = Array.from(state.packageEntries.entries())
      .sort(function (a, b) {
        return a[0].localeCompare(b[0]);
      })
      .map(function (entry) {
        return (
          '<button data-entry="' +
          esc(entry[1]) +
          '" title="Start a dependency path from ' +
          esc(entry[0]) +
          '">' +
          esc(entry[0]) +
          ' · start path</button>'
        );
      })
      .join('');
    container.querySelectorAll('button').forEach(function (button) {
      button.onclick = function () {
        if (state.pathStart) {
          state.pathStart = null;
          state.pathIds.clear();
          state.pathPairs.clear();
        }
        selectNode(button.dataset.entry, true);
        pathAction();
      };
    });
  }

  function renderLegend() {
    const content = $('#legendContent');
    if (!content) return;
    const groups = Array.from(state.groups.values()).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    content.innerHTML =
      '<section class="legend-section"><strong>Symbol shapes</strong><div class="legend-grid">' +
      shapeKey('class', 'class') +
      shapeKey('function', 'function') +
      shapeKey('method', 'method') +
      shapeKey('variable', 'variable') +
      shapeKey('module', 'module') +
      shapeKey('interface', 'interface') +
      shapeKey('type', 'type / enum') +
      shapeKey('event', 'event / hook') +
      '</div></section>' +
      '<section class="legend-section"><strong>Directed edges</strong><div class="legend-grid">' +
      edgeKey('calls', 'calls') +
      edgeKey('imports', 'imports') +
      edgeKey('types', 'types') +
      edgeKey('events', 'events') +
      edgeKey('', 'ownership') +
      '<div class="legend-row"><i class="legend-line" style="background:#e4b65e"></i>selected path</div>' +
      '</div></section>' +
      '<details class="legend-section legend-disclosure"><summary>Communities (' +
      groups.length +
      ')</summary>' +
      '<div class="community-keys">' +
      groups
        .map(function (group) {
          return (
            '<div class="community-key" style="--community:' +
            group.color +
            '"><i></i><span>' +
            esc(group.name) +
            '</span><small>' +
            group.nodes.length +
            '</small></div>'
          );
        })
        .join('') +
      '</div></details>';
  }

  function shapeKey(kind, label) {
    return (
      '<div class="legend-row"><i class="legend-shape ' +
      kind +
      '"></i>' +
      label +
      '</div>'
    );
  }

  function edgeKey(kind, label) {
    return (
      '<div class="legend-row"><i class="legend-line ' +
      kind +
      '"></i>' +
      label +
      '</div>'
    );
  }

  function layoutGraph() {
    state.graphPositions = new Map();
    const groups = Array.from(state.groups.values()).sort(function (a, b) {
      return b.nodes.length - a.nodes.length || a.id.localeCompare(b.id);
    });
    state.hyperbolic.innerRadius = Math.max(
      96,
      Math.min(155, 72 + groups.length * 4),
    );
    const weights = groups.map(function (group) {
      return Math.max(2.4, Math.sqrt(group.nodes.length));
    });
    const totalWeight = weights.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    const gap = Math.min(0.045, (Math.PI * 0.36) / Math.max(1, groups.length));
    const usableAngle = Math.max(Math.PI, Math.PI * 2 - gap * groups.length);
    const baseOuterRadius = Math.max(
      720,
      Math.min(1480, 330 + Math.sqrt(state.data.nodes.length) * 26),
    );
    state.hyperbolic.outerRadius = Math.min(
      1800,
      baseOuterRadius * Math.min(1.28, (Math.PI * 2) / usableAngle),
    );
    let cursor = -Math.PI / 2;
    groups.forEach(function (group, index) {
      const span = (usableAngle * weights[index]) / Math.max(1, totalWeight);
      group.sector = { start: cursor + gap / 2, end: cursor + gap / 2 + span };
      cursor += span + gap;
    });
    groups.forEach(function (group) {
      layoutCommunityTree(group);
    });
  }

  function layoutCommunityTree(group) {
    const ids = new Set(
      group.nodes.map(function (node) {
        return node.id;
      }),
    );
    const parent = new Map();
    group.nodes.forEach(function (node) {
      if (node.parent_id && ids.has(node.parent_id))
        parent.set(node.id, node.parent_id);
    });
    state.data.edges.forEach(function (edge) {
      if (
        edge.type === 'contains' &&
        ids.has(edge.source) &&
        ids.has(edge.target) &&
        !parent.has(edge.target)
      )
        parent.set(edge.target, edge.source);
    });
    const children = new Map();
    group.nodes.forEach(function (node) {
      children.set(node.id, []);
    });
    parent.forEach(function (parentId, childId) {
      children.get(parentId).push(childId);
    });
    group.treeEdges = Array.from(parent.entries()).map(function (entry) {
      return { source: entry[1], target: entry[0] };
    });
    children.forEach(function (items) {
      items.sort(function (a, b) {
        return degree(b) - degree(a) || a.localeCompare(b);
      });
    });
    const roots = group.nodes
      .filter(function (node) {
        return !parent.has(node.id);
      })
      .sort(function (a, b) {
        return degree(b.id) - degree(a.id) || a.id.localeCompare(b.id);
      });
    const weight = new Map();
    function subtree(id, visiting) {
      if (weight.has(id)) return weight.get(id);
      if (visiting.has(id)) return 1;
      visiting.add(id);
      const value =
        1 +
        (children.get(id) || []).reduce(function (sum, child) {
          return sum + subtree(child, visiting);
        }, 0);
      visiting.delete(id);
      weight.set(id, value);
      return value;
    }
    roots.forEach(function (node) {
      subtree(node.id, new Set());
    });
    let maxDepth = 0;
    function place(id, depth, start, end) {
      maxDepth = Math.max(maxDepth, depth);
      const angle = (start + end) / 2;
      const inner = state.hyperbolic.innerRadius;
      const outer = state.hyperbolic.outerRadius;
      const hyperbolicDepth = depth + 0.18;
      const radial =
        inner + (outer - inner) * 0.965 * Math.tanh(hyperbolicDepth * 0.54);
      state.graphPositions.set(id, {
        x: Math.cos(angle) * radial,
        y: Math.sin(angle) * radial,
        depth: depth,
      });
      const items = children.get(id) || [];
      const total = items.reduce(function (sum, child) {
        return sum + (weight.get(child) || 1);
      }, 0);
      let cursor = start;
      items.forEach(function (child) {
        const span =
          ((end - start) * (weight.get(child) || 1)) / Math.max(1, total);
        place(child, depth + 1, cursor, cursor + span);
        cursor += span;
      });
    }
    const totalRoots = roots.reduce(function (sum, node) {
      return sum + (weight.get(node.id) || 1);
    }, 0);
    let cursor = group.sector.start;
    roots.forEach(function (root) {
      const span =
        ((group.sector.end - group.sector.start) * (weight.get(root.id) || 1)) /
        Math.max(1, totalRoots);
      place(root.id, 0, cursor, cursor + span);
      cursor += span;
    });
    group.maxDepth = maxDepth;
    group.entryId = roots[0] && roots[0].id;
  }

  function entryScore(node, packageName) {
    const path = String((node && node.file_path) || '')
      .replaceAll('\\', '/')
      .toLowerCase();
    let score = node && node.kind === 'module' ? 40 : 0;
    if (/\/(index|main|mod|lib)\.[a-z0-9]+$/.test(path)) score += 80;
    if (path.indexOf('/packages/' + packageName.toLowerCase() + '/src/') >= 0)
      score += 25;
    if (node && node.hierarchy_level === 'god') score += 30;
    return score;
  }

  function updateGroupBounds() {
    state.groups.forEach(function (group) {
      const xs = [];
      const ys = [];
      group.nodes.forEach(function (node) {
        const point = state.graphPositions.get(node.id);
        if (point) {
          xs.push(point.x);
          ys.push(point.y);
        }
      });
      if (!xs.length) return;
      group.bounds = {
        minX: Math.min.apply(null, xs) - 50,
        maxX: Math.max.apply(null, xs) + 50,
        minY: Math.min.apply(null, ys) - 58,
        maxY: Math.max.apply(null, ys) + 50,
      };
    });
  }

  function degree(id) {
    return (state.adjacency.get(id) || []).filter(function (item) {
      return item.edge.type !== 'contains';
    }).length;
  }

  function populateFilters() {
    fillSelect(
      '#kind',
      Array.from(new Set(state.data.nodes.map(kindOf))).sort(),
      'Any kind',
    );
    fillSelect(
      '#edge',
      Array.from(
        new Set(
          state.data.edges.map(function (edge) {
            return edge.type;
          }),
        ),
      ).sort(),
      'Any relationship',
    );
    const groupSelect = $('#group');
    groupSelect.innerHTML =
      '<option value="">Any group</option>' +
      Array.from(state.groups.values())
        .sort(function (a, b) {
          return a.name.localeCompare(b.name);
        })
        .map(function (group) {
          return (
            '<option value="' +
            esc(group.id) +
            '">' +
            esc(group.name) +
            ' (' +
            group.nodes.length +
            ')</option>'
          );
        })
        .join('');
  }

  function fillSelect(selector, values, label) {
    const select = $(selector);
    select.innerHTML =
      '<option value="">' +
      esc(label) +
      '</option>' +
      values
        .map(function (value) {
          return (
            '<option value="' + esc(value) + '">' + esc(value) + '</option>'
          );
        })
        .join('');
  }

  function applyFilters(shouldFit) {
    const query = search.value.trim().toLowerCase();
    const kind = $('#kind').value;
    const group = $('#group').value;
    const edgeType = $('#edge').value;
    let sourceNodes;
    let sourceEdges;

    if (state.mode === 'calls' && state.callGraph) {
      sourceNodes = state.callGraph.nodes;
      sourceEdges = state.callGraph.edges;
    } else {
      sourceNodes = state.data.nodes;
      sourceEdges = state.data.edges;
    }

    state.visibleNodes = sourceNodes.filter(function (node) {
      if (state.focusIds && !state.focusIds.has(node.id)) return false;
      if (kind && kindOf(node) !== kind) return false;
      if (group && groupId(node) !== group) return false;
      if (
        query &&
        String(
          node.name +
            ' ' +
            node.file_path +
            ' ' +
            node.kind +
            ' ' +
            kindOf(node),
        )
          .toLowerCase()
          .indexOf(query) < 0
      )
        return false;
      return true;
    });
    const visibleIds = new Set(
      state.visibleNodes.map(function (node) {
        return node.id;
      }),
    );
    const edgeMap = new Map();
    sourceEdges.forEach(function (edge) {
      if (!visibleIds.has(edge.source) || !visibleIds.has(edge.target)) return;
      if (
        state.mode === 'path' &&
        !state.pathPairs.has(pairKey(edge.source, edge.target))
      )
        return;
      if (edgeType && edge.type !== edgeType) return;
      if (!edgeType && state.mode === 'graph' && edge.type === 'contains')
        return;
      const key = edge.source + '\0' + edge.target + '\0' + edge.type;
      const existing = edgeMap.get(key);
      if (existing) {
        existing.count += 1;
        existing.weight += Number(edge.weight) || 1;
      } else {
        edgeMap.set(key, {
          source: edge.source,
          target: edge.target,
          type: edge.type,
          weight: Number(edge.weight) || 1,
          count: 1,
        });
      }
    });
    state.visibleEdges = Array.from(edgeMap.values());
    renderResults();
    updateStats();
    scheduleDraw();
    if (shouldFit) requestAnimationFrame(fitGraph);
  }

  function matchingNodes() {
    const query = search.value.trim().toLowerCase();
    const kind = $('#kind').value;
    const group = $('#group').value;
    return state.data.nodes.filter(function (node) {
      if (kind && kindOf(node) !== kind) return false;
      if (group && groupId(node) !== group) return false;
      return (
        !query ||
        String(
          node.name +
            ' ' +
            node.file_path +
            ' ' +
            node.kind +
            ' ' +
            kindOf(node),
        )
          .toLowerCase()
          .indexOf(query) >= 0
      );
    });
  }

  function renderResults() {
    const matching = matchingNodes();
    $('#resultCount').textContent =
      matching.length + (matching.length === 1 ? ' symbol' : ' symbols');
    $('#resultEmpty').hidden = matching.length > 0;
    results.innerHTML = matching
      .slice(0, 240)
      .map(function (node) {
        return (
          '<button class="result' +
          (node.id === state.selectedId ? ' selected' : '') +
          '" data-id="' +
          esc(node.id) +
          '" role="option">' +
          '<span class="result-shape"><span style="background:' +
          groupColor(node) +
          '"></span></span>' +
          '<span class="result-copy"><strong class="result-name">' +
          esc(node.name) +
          '</strong><small class="result-meta">' +
          esc(kindOf(node) + ' · ' + shortPath(node.file_path)) +
          '</small></span></button>'
        );
      })
      .join('');
    $$('.result').forEach(function (button) {
      button.addEventListener('click', function () {
        const node = state.nodesById.get(button.dataset.id);
        if (!node) return;
        if (state.mode !== 'graph') exitSpecialView(false);
        selectNode(node.id, true);
      });
    });
    const activeFilters = [
      $('#kind').value,
      $('#group').value,
      $('#edge').value,
    ].filter(Boolean).length;
    $('#filterCount').textContent = activeFilters
      ? activeFilters + ' active'
      : 'All';
  }

  function positions() {
    return state.mode === 'calls' ? state.viewPositions : state.graphPositions;
  }

  function worldToScreen(point) {
    return {
      x:
        (point.x - state.camera.x) * state.camera.scale +
        canvas.clientWidth / 2,
      y:
        (point.y - state.camera.y) * state.camera.scale +
        canvas.clientHeight / 2,
    };
  }

  function screenToWorld(x, y) {
    return {
      x: (x - canvas.clientWidth / 2) / state.camera.scale + state.camera.x,
      y: (y - canvas.clientHeight / 2) / state.camera.scale + state.camera.y,
    };
  }

  function resizeCanvas(element, context) {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const rect = element.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (element.width !== width || element.height !== height) {
      element.width = width;
      element.height = height;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function resize() {
    resizeCanvas(canvas, ctx);
    resizeCanvas(minimap, miniCtx);
    scheduleDraw();
  }

  function scheduleDraw() {
    if (state.drawQueued) return;
    state.drawQueued = true;
    requestAnimationFrame(function () {
      state.drawQueued = false;
      draw();
    });
  }

  function markMotion() {
    state.motionUntil = performance.now() + 110;
    if (state.motionTimer) clearTimeout(state.motionTimer);
    state.motionTimer = setTimeout(function () {
      state.motionTimer = null;
      scheduleDraw();
    }, 125);
  }

  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    state.frame.moving = performance.now() < state.motionUntil;
    state.frame.nodeLabels = 0;
    state.frame.edgeLabels = 0;
    state.frame.labelCells = new Set();
    state.frame.width = width;
    state.frame.height = height;
    state.frame.viewport = {
      minX: state.camera.x - width / (2 * state.camera.scale),
      maxX: state.camera.x + width / (2 * state.camera.scale),
      minY: state.camera.y - height / (2 * state.camera.scale),
      maxY: state.camera.y + height / (2 * state.camera.scale),
    };
    ctx.clearRect(0, 0, width, height);
    drawGrid(width, height);
    if (state.mode !== 'calls') {
      drawGroups();
    }
    const related = directlyRelated();
    state.visibleEdges.forEach(function (edge) {
      drawEdge(edge, width, height);
    });
    state.visibleNodes.forEach(function (node) {
      drawNode(node, width, height, related);
    });
    drawMinimap();
    $('#zoomStat').textContent = Math.round(state.camera.scale * 100) + '%';
  }

  function drawGrid(width, height) {
    ctx.fillStyle = '#0b0c0f';
    ctx.fillRect(0, 0, width, height);
    const spacing = Math.max(18, 34 * state.camera.scale);
    const origin = worldToScreen({ x: 0, y: 0 });
    ctx.fillStyle = '#2b2e351f';
    for (let x = origin.x % spacing; x < width; x += spacing) {
      for (let y = origin.y % spacing; y < height; y += spacing)
        ctx.fillRect(x, y, 1, 1);
    }
  }

  function drawGroups() {
    const origin = worldToScreen({ x: 0, y: 0 });
    const inner = state.hyperbolic.innerRadius - 42;
    const outer = state.hyperbolic.outerRadius + 24;
    const visibleGroups = new Set(
      state.visibleNodes.map(function (node) {
        return groupId(node);
      }),
    );
    state.groups.forEach(function (group) {
      if (!group.sector) return;
      if (!visibleGroups.has(group.id)) return;
      sectorPath(origin, group.sector.start, group.sector.end, inner, outer);
      ctx.fillStyle = hexAlpha(group.color, 0.032);
      ctx.fill();
      ctx.strokeStyle = hexAlpha(group.color, 0.28);
      ctx.lineWidth = 1;
      ctx.stroke();
      if (state.camera.scale > 0.22) {
        for (let depth = 1; depth <= group.maxDepth; depth += 1) {
          const ring =
            state.hyperbolic.innerRadius +
            (state.hyperbolic.outerRadius - state.hyperbolic.innerRadius) *
              0.965 *
              Math.tanh((depth + 0.18) * 0.54);
          ctx.beginPath();
          ctx.arc(
            origin.x,
            origin.y,
            ring * state.camera.scale,
            group.sector.start,
            group.sector.end,
          );
          ctx.strokeStyle = hexAlpha(group.color, 0.075);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      ctx.strokeStyle = hexAlpha(group.color, 0.3);
      ctx.lineWidth = Math.max(0.6, Math.min(1.25, state.camera.scale));
      group.treeEdges.forEach(function (edge) {
        const source = state.graphPositions.get(edge.source);
        const target = state.graphPositions.get(edge.target);
        if (!source || !target) return;
        drawHyperbolicBranch(group, source, target);
      });
      if (state.camera.scale > 0.12 && !state.frame.moving) {
        const labelAngle = (group.sector.start + group.sector.end) / 2;
        const labelRadius =
          state.hyperbolic.innerRadius +
          (state.hyperbolic.outerRadius - state.hyperbolic.innerRadius) * 0.3;
        const labelArc =
          (group.sector.end - group.sector.start) *
          labelRadius *
          state.camera.scale;
        if (labelArc < 46 && state.camera.scale < 0.58) return;
        const label = worldToScreen({
          x: Math.cos(labelAngle) * labelRadius,
          y: Math.sin(labelAngle) * labelRadius,
        });
        ctx.fillStyle = hexAlpha(group.color, 0.9);
        ctx.font = '600 9px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(group.name, label.x, label.y - 3);
        ctx.fillStyle = '#646975';
        ctx.font = '8px Inter, system-ui';
        ctx.fillText(group.nodes.length + ' symbols', label.x, label.y + 9);
        ctx.textAlign = 'left';
      }
    });
    ctx.beginPath();
    ctx.arc(
      origin.x,
      origin.y,
      state.hyperbolic.outerRadius * state.camera.scale,
      0,
      Math.PI * 2,
    );
    ctx.strokeStyle = '#858b992e';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function sectorPath(origin, start, end, inner, outer) {
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, outer * state.camera.scale, start, end);
    ctx.arc(origin.x, origin.y, inner * state.camera.scale, end, start, true);
    ctx.closePath();
  }

  function drawHyperbolicBranch(group, source, target) {
    const diskRadius = state.hyperbolic.outerRadius;
    const px = source.x / diskRadius;
    const py = source.y / diskRadius;
    const qx = target.x / diskRadius;
    const qy = target.y / diskRadius;
    const determinant = px * qy - py * qx;
    const a = worldToScreen(source);
    const b = worldToScreen(target);
    if (Math.abs(determinant) < 0.0008) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      return;
    }
    const pRight = (px * px + py * py + 1) / 2;
    const qRight = (qx * qx + qy * qy + 1) / 2;
    const cx = (pRight * qy - py * qRight) / determinant;
    const cy = (px * qRight - pRight * qx) / determinant;
    const radiusSquared = cx * cx + cy * cy - 1;
    if (radiusSquared <= 0 || !Number.isFinite(radiusSquared)) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      return;
    }
    const radius = Math.sqrt(radiusSquared);
    const start = Math.atan2(py - cy, px - cx);
    const end = Math.atan2(qy - cy, qx - cx);
    let delta = end - start;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    const mid = start + delta / 2;
    const midX = cx + Math.cos(mid) * radius;
    const midY = cy + Math.sin(mid) * radius;
    if (midX * midX + midY * midY > 1)
      delta += delta > 0 ? -Math.PI * 2 : Math.PI * 2;
    const circleCenter = worldToScreen({
      x: cx * diskRadius,
      y: cy * diskRadius,
    });
    ctx.beginPath();
    ctx.arc(
      circleCenter.x,
      circleCenter.y,
      radius * diskRadius * state.camera.scale,
      start,
      start + delta,
      delta < 0,
    );
    ctx.stroke();
  }

  function directlyRelated() {
    const set = new Set();
    if (!state.selectedId) return set;
    set.add(state.selectedId);
    state.visibleEdges.forEach(function (edge) {
      if (edge.source === state.selectedId) set.add(edge.target);
      if (edge.target === state.selectedId) set.add(edge.source);
    });
    return set;
  }

  function drawEdge(edge, width, height) {
    const map = positions();
    const source = map.get(edge.source);
    const target = map.get(edge.target);
    if (!source || !target) return;
    const a = worldToScreen(source);
    const b = worldToScreen(target);
    if (
      (a.x < -60 && b.x < -60) ||
      (a.y < -60 && b.y < -60) ||
      (a.x > width + 60 && b.x > width + 60) ||
      (a.y > height + 60 && b.y > height + 60)
    )
      return;
    const incident =
      state.selectedId &&
      (edge.source === state.selectedId || edge.target === state.selectedId);
    const onPath = state.pathPairs.has(pairKey(edge.source, edge.target));
    const dimmed = state.selectedId && !incident && !onPath;
    const sourceNode = state.nodesById.get(edge.source);
    const targetNode = state.nodesById.get(edge.target);
    const crossCommunity =
      sourceNode && targetNode && groupId(sourceNode) !== groupId(targetNode);
    const color = onPath ? edgePalette.path : edgeColor(edge.type);
    const curve =
      Math.min(32, Math.hypot(b.x - a.x, b.y - a.y) * 0.08) *
      (hash(edge.source + edge.target + edge.type) % 2 ? 1 : -1);
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const length = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const control = {
      x: midX - ((b.y - a.y) / length) * curve,
      y: midY + ((b.x - a.x) / length) * curve,
    };
    ctx.globalAlpha = dimmed
      ? 0.025
      : onPath
        ? 0.95
        : incident
          ? 0.88
          : state.mode === 'calls'
            ? 0.56
            : crossCommunity
              ? state.camera.scale < 0.45
                ? 0.035
                : 0.075
              : 0.13;
    ctx.strokeStyle = color;
    ctx.lineWidth = onPath
      ? 2.6
      : incident
        ? 2
        : Math.min(1.7, 0.75 + Math.log2(edge.weight + 1) * 0.18);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(control.x, control.y, b.x, b.y);
    ctx.stroke();
    if (
      !dimmed &&
      (incident || state.mode === 'calls' || state.camera.scale > 0.42)
    )
      drawArrowOnCurve(a, control, b, color, incident || onPath);
    const labelsAllowed =
      state.edgeLabels &&
      (incident ||
        onPath ||
        (state.mode === 'calls'
          ? state.camera.scale > 0.52
          : state.visibleEdges.length < 220 || state.camera.scale > 0.72));
    if (labelsAllowed && !dimmed)
      drawEdgeLabel(edge, control, color, incident || onPath);
    ctx.globalAlpha = 1;
  }

  function drawArrowOnCurve(a, control, b, color, strong) {
    const t = 0.72;
    const x =
      (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * control.x + t * t * b.x;
    const y =
      (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * control.y + t * t * b.y;
    const dx = 2 * (1 - t) * (control.x - a.x) + 2 * t * (b.x - control.x);
    const dy = 2 * (1 - t) * (control.y - a.y) + 2 * t * (b.y - control.y);
    const angle = Math.atan2(dy, dx);
    const size = strong ? 6 : 4.5;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
    ctx.lineTo(
      x + Math.cos(angle + 2.55) * size,
      y + Math.sin(angle + 2.55) * size,
    );
    ctx.lineTo(
      x + Math.cos(angle - 2.55) * size,
      y + Math.sin(angle - 2.55) * size,
    );
    ctx.closePath();
    ctx.fill();
  }

  function drawEdgeLabel(edge, point, color, strong) {
    if (
      state.frame.moving ||
      point.x < -40 ||
      point.y < -20 ||
      point.x > state.frame.width + 40 ||
      point.y > state.frame.height + 20
    )
      return;
    const budget = state.mode === 'calls' ? 90 : 60;
    if (
      (!strong && state.frame.edgeLabels >= budget) ||
      state.frame.edgeLabels >= 110
    )
      return;
    const text = edge.type + (edge.count > 1 ? ' ×' + edge.count : '');
    const estimatedWidth = text.length * 5 + 10;
    if (
      !claimLabel(
        point.x - estimatedWidth / 2,
        point.y - 7,
        estimatedWidth,
        14,
        strong,
      )
    )
      return;
    state.frame.edgeLabels += 1;
    const bitmap = labelBitmap(
      'edge|' + strong + '|' + color + '|' + text,
      function (context, ratio) {
        const font = (strong ? '600 ' : '500 ') + '8px Inter, system-ui';
        context.font = font;
        const width = Math.ceil(context.measureText(text).width + 10);
        const height = 14;
        context.canvas.width = width * ratio;
        context.canvas.height = height * ratio;
        context.scale(ratio, ratio);
        context.font = font;
        roundedRect(context, 0.5, 0.5, width - 1, height - 1, 4);
        context.fillStyle = '#101116';
        context.fill();
        context.strokeStyle = hexAlpha(color, 0.28);
        context.lineWidth = 1;
        context.stroke();
        context.fillStyle = strong ? '#f2f3f6' : '#aeb2bb';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, width / 2, height / 2 + 0.5);
        return { width: width, height: height };
      },
    );
    ctx.globalAlpha = strong ? 1 : state.mode === 'calls' ? 0.9 : 0.72;
    ctx.drawImage(
      bitmap.canvas,
      point.x - bitmap.width / 2,
      point.y - bitmap.height / 2,
      bitmap.width,
      bitmap.height,
    );
    ctx.globalAlpha = 1;
  }

  function claimLabel(x, y, width, height, force) {
    const cellWidth = 72;
    const cellHeight = 20;
    const minX = Math.floor(x / cellWidth);
    const maxX = Math.floor((x + width) / cellWidth);
    const minY = Math.floor(y / cellHeight);
    const maxY = Math.floor((y + height) / cellHeight);
    if (!force) {
      for (let gx = minX; gx <= maxX; gx += 1)
        for (let gy = minY; gy <= maxY; gy += 1) {
          if (state.frame.labelCells.has(gx + ':' + gy)) return false;
        }
    }
    for (let ix = minX; ix <= maxX; ix += 1)
      for (let iy = minY; iy <= maxY; iy += 1)
        state.frame.labelCells.add(ix + ':' + iy);
    return true;
  }

  function labelBitmap(key, render) {
    let cached = state.labelCache.get(key);
    if (cached) {
      state.labelCache.delete(key);
      state.labelCache.set(key, cached);
      return cached;
    }
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const labelCanvas = document.createElement('canvas');
    const context = labelCanvas.getContext('2d');
    const size = render(context, ratio);
    cached = { canvas: labelCanvas, width: size.width, height: size.height };
    state.labelCache.set(key, cached);
    if (state.labelCache.size > 600)
      state.labelCache.delete(state.labelCache.keys().next().value);
    return cached;
  }

  function nodeSize(node) {
    if (state.mode === 'calls') {
      const cardScale = Math.min(1, Math.max(0.18, state.camera.scale / 0.75));
      return {
        width: 158 * cardScale,
        height: 36 * cardScale,
        radius: 8 * cardScale,
        cardScale: cardScale,
      };
    }
    const radius = isPackageEntry(node)
      ? 9
      : node.hierarchy_level === 'god'
        ? 8
        : node.hierarchy_level === 'high'
          ? 6.5
          : 5;
    return { width: radius * 2, height: radius * 2, radius: radius };
  }

  function isPackageEntry(node) {
    return Array.from(state.packageEntries.values()).indexOf(node.id) >= 0;
  }

  function drawNode(node, width, height, related) {
    const point = positions().get(node.id);
    if (!point) return;
    if (!pointInViewport(point, state.mode === 'calls' ? 100 : 50)) return;
    const screen = worldToScreen(point);
    const size = nodeSize(node);
    const selected = node.id === state.selectedId;
    const neighbor = related.has(node.id) && !selected;
    const dimmed =
      state.selectedId && !selected && !neighbor && !state.pathIds.has(node.id);
    const margin = state.mode === 'calls' ? 100 : 50;
    if (
      screen.x < -margin ||
      screen.x > width + margin ||
      screen.y < -margin ||
      screen.y > height + margin
    )
      return;
    ctx.globalAlpha = dimmed ? 0.09 : 1;
    if (state.mode === 'calls')
      drawCallCard(node, screen, size, selected, neighbor);
    else
      drawSymbol(
        node,
        screen,
        size.radius * (selected ? 1.35 : neighbor ? 1.15 : 1),
        selected,
        neighbor,
      );
    ctx.globalAlpha = 1;
  }

  function pointInViewport(point, paddingPixels) {
    const viewport = state.frame.viewport;
    if (!viewport) return true;
    const padding = paddingPixels / state.camera.scale;
    return (
      point.x >= viewport.minX - padding &&
      point.x <= viewport.maxX + padding &&
      point.y >= viewport.minY - padding &&
      point.y <= viewport.maxY + padding
    );
  }

  function drawSymbol(node, point, radius, selected, neighbor) {
    const kind = kindOf(node);
    const color = groupColor(node);
    ctx.fillStyle = color;
    ctx.strokeStyle = selected
      ? '#ffffff'
      : neighbor
        ? '#c9cbff'
        : node.id === state.hoveredId
          ? '#e5e6ea'
          : '#0b0c0f';
    ctx.lineWidth = selected
      ? 2.5
      : neighbor
        ? 2
        : kind === 'interface'
          ? 1.8
          : 1.2;
    symbolPath(kind, point.x, point.y, radius);
    if (kind === 'interface') ctx.stroke();
    else {
      ctx.fill();
      ctx.stroke();
    }
    if (node.hierarchy_level === 'god') {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#e4b65e88';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (isPackageEntry(node)) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#e4b65e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    const showLabel = shouldLabelNode(node, selected, neighbor);
    if (showLabel) {
      const labelX = point.x + radius + 6;
      const estimatedWidth = Math.min(240, node.name.length * 5.5 + 7);
      if (
        !claimLabel(
          labelX - 3,
          point.y - 8,
          estimatedWidth,
          16,
          selected || neighbor,
        )
      )
        return;
      state.frame.nodeLabels += 1;
      const bitmap = labelBitmap(
        'node|' + selected + '|' + node.name,
        function (context, ratio) {
          const font = (selected ? '600 ' : '500 ') + '9px Inter, system-ui';
          context.font = font;
          const labelWidth = Math.ceil(
            context.measureText(node.name).width + 7,
          );
          const labelHeight = 16;
          context.canvas.width = labelWidth * ratio;
          context.canvas.height = labelHeight * ratio;
          context.scale(ratio, ratio);
          context.font = font;
          roundedRect(context, 0, 0, labelWidth, labelHeight, 4);
          context.fillStyle = selected ? '#15161bf2' : '#101116d9';
          context.fill();
          context.fillStyle = selected ? '#ffffff' : '#c3c6cc';
          context.textBaseline = 'middle';
          context.fillText(node.name, 3, labelHeight / 2 + 0.5);
          return { width: labelWidth, height: labelHeight };
        },
      );
      ctx.drawImage(
        bitmap.canvas,
        labelX - 3,
        point.y - bitmap.height / 2,
        bitmap.width,
        bitmap.height,
      );
    }
  }

  function shouldLabelNode(node, selected, neighbor) {
    if (state.frame.moving) return false;
    if (selected || neighbor) return true;
    if (state.frame.nodeLabels >= 100) return false;
    const zoom = state.camera.scale;
    const connections = degree(node.id);
    if (zoom < 0.3) return isPackageEntry(node);
    if (zoom < 0.5)
      return (
        isPackageEntry(node) ||
        node.hierarchy_level === 'god' ||
        connections >= 20
      );
    if (zoom < 0.78)
      return (
        isPackageEntry(node) ||
        node.hierarchy_level === 'god' ||
        (node.hierarchy_level === 'high' && connections >= 8)
      );
    if (zoom < 1.08)
      return (
        node.hierarchy_level === 'god' ||
        node.hierarchy_level === 'high' ||
        connections >= 7
      );
    return true;
  }

  function drawCallCard(node, point, size, selected, neighbor) {
    const cardScale = size.cardScale || 1;
    const color = groupColor(node);
    roundedRect(
      ctx,
      point.x - size.width / 2,
      point.y - size.height / 2,
      size.width,
      size.height,
      size.radius,
    );
    ctx.fillStyle = selected ? '#20212b' : '#15171c';
    ctx.fill();
    ctx.strokeStyle = selected ? '#dfe0ff' : neighbor ? '#777a9b' : '#32353d';
    ctx.lineWidth = selected ? 1.7 : 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      point.x - size.width / 2 + 17 * cardScale,
      point.y,
      Math.max(1.5, 4 * cardScale),
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.fill();
    if (state.frame.moving || cardScale < 0.74) return;
    const name =
      node.name.length > 22 ? node.name.slice(0, 21) + '…' : node.name;
    const bitmap = labelBitmap(
      'call|' + selected + '|' + name + '|' + kindOf(node),
      function (context, ratio) {
        const width = 124;
        const height = 26;
        context.canvas.width = width * ratio;
        context.canvas.height = height * ratio;
        context.scale(ratio, ratio);
        context.fillStyle = selected ? '#f4f4f6' : '#d2d4d9';
        context.font = (selected ? '600 ' : '520 ') + '10px Inter, system-ui';
        context.fillText(name, 0, 10);
        context.fillStyle = '#6f737c';
        context.font = '8px Inter, system-ui';
        context.fillText(kindOf(node), 0, 22);
        return { width: width, height: height };
      },
    );
    ctx.drawImage(
      bitmap.canvas,
      point.x - size.width / 2 + 29 * cardScale,
      point.y - 12 * cardScale,
      bitmap.width * cardScale,
      bitmap.height * cardScale,
    );
  }

  function symbolPath(kind, x, y, radius) {
    ctx.beginPath();
    if (kind === 'class') {
      roundedRect(ctx, x - radius, y - radius, radius * 2, radius * 2, 2);
      return;
    }
    if (kind === 'method') {
      ctx.moveTo(x, y - radius * 1.25);
      ctx.lineTo(x + radius * 1.25, y);
      ctx.lineTo(x, y + radius * 1.25);
      ctx.lineTo(x - radius * 1.25, y);
      ctx.closePath();
      return;
    }
    if (kind === 'variable') {
      ctx.moveTo(x, y - radius * 1.25);
      ctx.lineTo(x + radius * 1.15, y + radius);
      ctx.lineTo(x - radius * 1.15, y + radius);
      ctx.closePath();
      return;
    }
    if (kind === 'module') {
      polygon(x, y, radius * 1.2, 6, 0);
      return;
    }
    if (kind === 'type') {
      polygon(x, y, radius * 1.2, 5, -Math.PI / 2);
      return;
    }
    if (kind === 'event') {
      for (let i = 0; i < 16; i += 1) {
        const angle = -Math.PI / 2 + (Math.PI / 8) * i;
        const distance = i % 2 ? radius * 0.55 : radius * 1.3;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
      ctx.closePath();
      return;
    }
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  }

  function polygon(x, y, radius, sides, start) {
    for (let i = 0; i < sides; i += 1) {
      const angle = start + ((Math.PI * 2) / sides) * i;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.max(
      0,
      Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2),
    );
    context.beginPath();
    context.roundRect(x, y, width, height, r);
  }

  function hexAlpha(color, alpha) {
    if (/^#[0-9a-f]{6}$/i.test(color))
      return (
        color +
        Math.round(alpha * 255)
          .toString(16)
          .padStart(2, '0')
      );
    return color;
  }

  function drawMinimap() {
    const now = performance.now();
    if (state.frame.moving && now - state.lastMiniDraw < 100) return;
    state.lastMiniDraw = now;
    const width = minimap.clientWidth;
    const height = minimap.clientHeight;
    miniCtx.clearRect(0, 0, width, height);
    if (!state.visibleNodes.length || $('#minimapWrap').hidden) return;
    const map = positions();
    const points = state.visibleNodes
      .map(function (node) {
        return map.get(node.id);
      })
      .filter(Boolean);
    const xs = points.map(function (point) {
      return point.x;
    });
    const ys = points.map(function (point) {
      return point.y;
    });
    const minX = Math.min.apply(null, xs) - 60;
    const maxX = Math.max.apply(null, xs) + 60;
    const minY = Math.min.apply(null, ys) - 60;
    const maxY = Math.max.apply(null, ys) + 60;
    const scale = Math.min(
      (width - 8) / Math.max(1, maxX - minX),
      (height - 8) / Math.max(1, maxY - minY),
    );
    const padX = (width - (maxX - minX) * scale) / 2;
    const padY = (height - (maxY - minY) * scale) / 2;
    state.miniBounds = {
      minX: minX,
      minY: minY,
      scale: scale,
      padX: padX,
      padY: padY,
    };
    function miniPoint(point) {
      return {
        x: padX + (point.x - minX) * scale,
        y: padY + (point.y - minY) * scale,
      };
    }
    miniCtx.strokeStyle = '#696d7838';
    miniCtx.lineWidth = 0.5;
    state.visibleEdges.forEach(function (edge) {
      let a = map.get(edge.source);
      let b = map.get(edge.target);
      if (!a || !b) return;
      a = miniPoint(a);
      b = miniPoint(b);
      miniCtx.beginPath();
      miniCtx.moveTo(a.x, a.y);
      miniCtx.lineTo(b.x, b.y);
      miniCtx.stroke();
    });
    state.visibleNodes.forEach(function (node) {
      let point = map.get(node.id);
      if (!point) return;
      point = miniPoint(point);
      miniCtx.fillStyle = groupColor(node);
      miniCtx.fillRect(point.x - 1, point.y - 1, 2, 2);
    });
    const left = state.camera.x - canvas.clientWidth / (2 * state.camera.scale);
    const top = state.camera.y - canvas.clientHeight / (2 * state.camera.scale);
    const viewport = miniPoint({ x: left, y: top });
    miniCtx.strokeStyle = '#e7e8ed';
    miniCtx.lineWidth = 1;
    miniCtx.strokeRect(
      viewport.x,
      viewport.y,
      (canvas.clientWidth / state.camera.scale) * scale,
      (canvas.clientHeight / state.camera.scale) * scale,
    );
  }

  function hitNode(x, y) {
    const map = positions();
    let best = null;
    let distance = Infinity;
    for (let i = state.visibleNodes.length - 1; i >= 0; i -= 1) {
      const node = state.visibleNodes[i];
      const point = map.get(node.id);
      if (!point) continue;
      const screen = worldToScreen(point);
      if (state.mode === 'calls') {
        const size = nodeSize(node);
        if (
          Math.abs(x - screen.x) <= size.width / 2 &&
          Math.abs(y - screen.y) <= size.height / 2
        )
          return node;
      } else {
        const current = Math.hypot(x - screen.x, y - screen.y);
        if (
          current <
            Math.max(10, nodeSize(node).radius * state.camera.scale + 6) &&
          current < distance
        ) {
          best = node;
          distance = current;
        }
      }
    }
    return best;
  }

  function fitGraph() {
    if (!state.visibleNodes.length) return;
    const map = positions();
    const xs = [];
    const ys = [];
    state.visibleNodes.forEach(function (node) {
      const point = map.get(node.id);
      if (point) {
        xs.push(point.x);
        ys.push(point.y);
      }
    });
    if (state.mode !== 'calls' && !state.focusIds) {
      xs.push(-state.hyperbolic.outerRadius, state.hyperbolic.outerRadius);
      ys.push(-state.hyperbolic.outerRadius, state.hyperbolic.outerRadius);
    }
    const minX = Math.min.apply(null, xs);
    const maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys);
    const maxY = Math.max.apply(null, ys);
    const horizontalPad = state.mode === 'calls' ? 210 : 130;
    const verticalPad = state.mode === 'calls' ? 220 : 130;
    state.camera.x = (minX + maxX) / 2;
    state.camera.y = (minY + maxY) / 2;
    state.camera.scale = Math.max(
      0.08,
      Math.min(
        1.8,
        Math.min(
          (canvas.clientWidth - horizontalPad) / Math.max(150, maxX - minX),
          (canvas.clientHeight - verticalPad) / Math.max(150, maxY - minY),
        ),
      ),
    );
    scheduleDraw();
  }

  function centerNode(id) {
    const point = positions().get(id);
    if (!point) return;
    state.camera.x = point.x;
    state.camera.y = point.y;
    state.camera.scale = Math.max(
      state.camera.scale,
      state.mode === 'calls' ? 0.9 : 1.05,
    );
    scheduleDraw();
  }

  function zoom(factor, x, y) {
    markMotion();
    const before = screenToWorld(x, y);
    state.camera.scale = Math.max(
      0.06,
      Math.min(6, state.camera.scale * factor),
    );
    const after = screenToWorld(x, y);
    state.camera.x += before.x - after.x;
    state.camera.y += before.y - after.y;
    scheduleDraw();
  }

  function selectNode(id, center) {
    if (!state.nodesById.has(id)) {
      const fromCall =
        state.callGraph &&
        state.callGraph.nodes.find(function (node) {
          return node.id === id;
        });
      if (fromCall) state.nodesById.set(id, fromCall);
    }
    state.selectedId = id;
    $('#focus').disabled = false;
    $('#path').disabled = false;
    $('#calls').disabled = false;
    $('#clear').disabled = false;
    app.classList.remove('right-closed');
    $('#rightToggle').classList.add('active');
    if (state.pathStart && state.pathStart !== id) finishPath(id);
    renderResults();
    renderDetailHeader();
    loadDetail(id);
    if (center) centerNode(id);
    scheduleDraw();
  }

  function renderDetailHeader() {
    const node = state.nodesById.get(state.selectedId);
    if (!node) return;
    $('#detailName').textContent = node.name;
    $('#detailKind').textContent = kindOf(node);
    $('#detailDot').style.borderColor = groupColor(node);
    $('#detailDot').style.background = hexAlpha(groupColor(node), 0.22);
  }

  async function loadDetail(id) {
    const node = state.nodesById.get(id);
    if (!node) return;
    if (state.detailCache.has(id)) {
      renderDetail(state.detailCache.get(id));
      return;
    }
    detail.innerHTML =
      '<div class="detail-placeholder"><span class="spinner"></span><p>Loading details…</p></div>';
    try {
      const response = await fetch('/api/node/' + encodeURIComponent(id));
      const value = await response.json();
      if (!response.ok || value.error)
        throw new Error(value.error || 'Details unavailable');
      state.detailCache.set(id, value);
      if (state.selectedId === id) renderDetail(value);
    } catch {
      if (state.selectedId === id)
        detail.innerHTML =
          '<div class="empty-copy">Could not load this symbol.</div>';
    }
  }

  function renderDetail(value) {
    const node = value.node || state.nodesById.get(state.selectedId);
    if (!node) return;
    if (state.activeTab === 'code') {
      detail.innerHTML =
        '<div class="detail-path">' +
        esc(shortPath(node.file_path)) +
        ' · lines ' +
        node.line_start +
        '–' +
        node.line_end +
        '</div>' +
        (value.source
          ? '<pre class="code-block">' + esc(value.source) + '</pre>'
          : '<div class="empty-copy">No extracted source is available.</div>');
      return;
    }
    if (state.activeTab === 'calls') {
      renderCalls(value, node);
      return;
    }
    const metadata = node.metadata || {};
    detail.innerHTML =
      '<div class="detail-path">' +
      esc(shortPath(node.file_path)) +
      '</div>' +
      '<div class="action-row">' +
      '<button id="detailCenter">' +
      icon('focus') +
      'Center</button>' +
      '<button id="detailNearby">' +
      icon('flow') +
      'Nearby</button>' +
      '<button id="detailCalls">' +
      icon('call') +
      'Call flow</button>' +
      '</div>' +
      '<section class="detail-section"><h3 class="section-label">At a glance</h3><dl class="fact-list">' +
      fact('Kind', kindOf(node) + ' · ' + node.kind) +
      fact('Location', 'Lines ' + node.line_start + '–' + node.line_end) +
      fact('Group', groupName(node)) +
      fact('Links', degree(node.id) + ' relationships') +
      '</dl></section>' +
      '<details class="more-details"><summary>Technical details</summary><dl class="fact-list">' +
      fact('Importance', node.hierarchy_level || '—') +
      fact('Domain', metadata.domain || '—') +
      fact('Node ID', node.id) +
      fact(
        'Offsets',
        node.offset_start != null
          ? node.offset_start + '–' + node.offset_end
          : '—',
      ) +
      '</dl></details>';
    $('#detailCenter').onclick = function () {
      centerNode(node.id);
    };
    $('#detailNearby').onclick = focusNearby;
    $('#detailCalls').onclick = showCallFlow;
  }

  function fact(label, value) {
    return (
      '<div class="fact"><dt>' +
      esc(label) +
      '</dt><dd>' +
      esc(value) +
      '</dd></div>'
    );
  }

  function renderCalls(value, node) {
    const edges = value.edges || [];
    const calls = edges.filter(function (edge) {
      return callTypes.has(edge.type);
    });
    detail.innerHTML =
      '<div class="action-row"><button id="showCallGraph">' +
      icon('flow') +
      'Show on canvas</button></div>' +
      (calls.length
        ? '<div class="relation-list">' +
          calls
            .map(function (edge) {
              const outgoing = edge.source === node.id;
              const otherId = outgoing ? edge.target : edge.source;
              const other = state.nodesById.get(otherId);
              return (
                '<div class="relation" data-id="' +
                esc(otherId) +
                '"><span class="relation-arrow">' +
                (outgoing ? '→' : '←') +
                '</span><span><strong>' +
                esc(other ? other.name : otherId) +
                '</strong><small>' +
                (outgoing ? 'Called by this symbol' : 'Calls this symbol') +
                '</small></span><span class="relation-type">' +
                esc(edge.type) +
                '</span></div>'
              );
            })
            .join('') +
          '</div>'
        : '<div class="empty-copy">No call relationships found for this symbol.</div>');
    $('#showCallGraph').onclick = showCallFlow;
    $$('.relation').forEach(function (row) {
      row.onclick = function () {
        selectNode(row.dataset.id, true);
      };
    });
  }

  function setTab(tab) {
    state.activeTab = tab;
    $$('.tab').forEach(function (button) {
      button.classList.toggle('active', button.dataset.tab === tab);
    });
    const cached = state.detailCache.get(state.selectedId);
    if (cached) renderDetail(cached);
  }

  function focusNearby() {
    if (!state.selectedId) return;
    if (state.mode === 'calls') exitSpecialView(false);
    const ids = new Set([state.selectedId]);
    let frontier = [state.selectedId];
    for (let depth = 0; depth < 2; depth += 1) {
      const next = [];
      frontier.forEach(function (id) {
        (state.adjacency.get(id) || []).forEach(function (link) {
          if (link.edge.type === 'contains' || ids.has(link.id)) return;
          ids.add(link.id);
          next.push(link.id);
        });
      });
      frontier = next;
    }
    state.mode = 'focus';
    state.focusIds = ids;
    showViewTitle('Nearby · ' + ids.size + ' symbols');
    applyFilters(true);
    setMessage(
      'Showing two steps around ' + state.nodesById.get(state.selectedId).name,
    );
  }

  function pathAction() {
    if (!state.selectedId) return;
    if (state.pathStart) {
      state.pathStart = null;
      state.pathIds.clear();
      state.pathPairs.clear();
      $('#path').classList.remove('active');
      setMessage('Path cancelled');
      scheduleDraw();
      return;
    }
    if (state.mode !== 'graph') exitSpecialView(false);
    state.pathStart = state.selectedId;
    state.pathIds = new Set([state.selectedId]);
    state.pathPairs.clear();
    $('#path').classList.add('active');
    setMessage('Select the destination symbol');
    scheduleDraw();
  }

  function finishPath(targetId) {
    const start = state.pathStart;
    state.pathStart = null;
    $('#path').classList.remove('active');
    const path = shortestPath(start, targetId);
    if (!path.length) {
      state.pathIds = new Set([start, targetId]);
      state.pathPairs.clear();
      state.focusIds = new Set([start, targetId]);
      state.mode = 'path';
      showViewTitle('No directed path');
      applyFilters(true);
      setMessage('No directed path from the start node to this node', true);
      return;
    }
    state.pathIds = new Set(path);
    state.pathPairs = new Set();
    for (let index = 1; index < path.length; index += 1)
      state.pathPairs.add(pairKey(path[index - 1], path[index]));
    state.focusIds = new Set(path);
    state.mode = 'path';
    showViewTitle('Path · ' + path.length + ' symbols');
    applyFilters(true);
    setMessage('Directed dependency path found');
  }

  function pairKey(left, right) {
    return left < right ? left + '\0' + right : right + '\0' + left;
  }

  function shortestPath(start, target) {
    if (start === target) return [start];
    const queue = [start];
    const seen = new Set([start]);
    const parent = new Map();
    for (let head = 0; head < queue.length; head += 1) {
      const current = queue[head];
      const links = state.adjacency.get(current) || [];
      for (let i = 0; i < links.length; i += 1) {
        const link = links[i];
        if (
          !link.outgoing ||
          link.edge.type === 'contains' ||
          seen.has(link.id)
        )
          continue;
        seen.add(link.id);
        parent.set(link.id, current);
        if (link.id === target) {
          const path = [target];
          let cursor = target;
          while (cursor !== start) {
            cursor = parent.get(cursor);
            path.unshift(cursor);
          }
          return path;
        }
        queue.push(link.id);
      }
    }
    return [];
  }

  async function showCallFlow() {
    if (!state.selectedId) return;
    $('#repoCalls').classList.remove('active');
    const rootId = state.selectedId;
    setMessage('Building call flow…');
    $('#calls').disabled = true;
    try {
      const response = await fetch(
        '/api/call-chain/' + encodeURIComponent(rootId) + '?depth=3',
      );
      const chain = await response.json();
      if (!response.ok || chain.error)
        throw new Error(chain.error || 'Call flow unavailable');
      const nodeMap = new Map();
      if (chain.root) nodeMap.set(chain.root.id, chain.root);
      (chain.callers || []).forEach(function (item) {
        nodeMap.set(item.node.id, item.node);
      });
      (chain.callees || []).forEach(function (item) {
        nodeMap.set(item.node.id, item.node);
      });
      if (!nodeMap.size) throw new Error('No call flow found');
      state.callGraph = {
        nodes: Array.from(nodeMap.values()),
        edges: chain.edges || [],
        chain: chain,
      };
      state.mode = 'calls';
      state.focusIds = null;
      layoutCallGraph(chain);
      showViewTitle(
        'Call flow · ' + (chain.root ? chain.root.name : 'selected symbol'),
      );
      applyFilters(true);
      setMessage(state.callGraph.nodes.length + ' symbols in call flow');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Call flow unavailable',
        true,
      );
    } finally {
      $('#calls').disabled = false;
    }
  }

  async function showExecutionFlow() {
    const button = $('#repoCalls');
    button.disabled = true;
    setMessage('Building monorepo call flow…');
    try {
      const response = await fetch('/api/execution/flow?depth=5');
      const execution = await response.json();
      if (!response.ok || execution.error)
        throw new Error(execution.error || 'Monorepo call flow unavailable');
      const nodeMap = new Map();
      (execution.entries || []).forEach(function (entry) {
        if (entry.node) nodeMap.set(entry.node.id, entry.node);
      });
      (execution.flow || []).forEach(function (item) {
        if (item.node) nodeMap.set(item.node.id, item.node);
      });
      if (!nodeMap.size) throw new Error('No monorepo entry points found');
      state.callGraph = {
        nodes: Array.from(nodeMap.values()),
        edges: execution.edges || [],
        execution: execution,
      };
      state.mode = 'calls';
      state.focusIds = null;
      state.pathStart = null;
      state.pathIds.clear();
      state.pathPairs.clear();
      state.selectedId = null;
      $('#path').classList.remove('active');
      $('#focus').disabled = true;
      $('#path').disabled = true;
      $('#calls').disabled = true;
      $('#clear').disabled = false;
      layoutExecutionFlow(execution);
      showViewTitle(
        'Monorepo call flow · ' + (execution.entries || []).length + ' entries',
      );
      applyFilters(true);
      button.classList.add('active');
      setMessage(
        state.callGraph.nodes.length + ' symbols across monorepo call flow',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Monorepo call flow unavailable',
        true,
      );
    } finally {
      button.disabled = false;
    }
  }

  function layoutExecutionFlow(execution) {
    state.viewPositions = new Map();
    const items = execution.flow || [];
    const byId = new Map();
    items.forEach(function (item) {
      if (item.node) byId.set(item.node.id, item);
    });
    (execution.entries || []).forEach(function (entry) {
      if (entry.node && !byId.has(entry.node.id))
        byId.set(entry.node.id, { node: entry.node, depth: 0, callSites: [] });
    });
    const rootById = new Map();
    function rootOf(item) {
      if (rootById.has(item.node.id)) return rootById.get(item.node.id);
      let cursor = item;
      const seen = new Set([item.node.id]);
      while (
        cursor.parentId &&
        byId.has(cursor.parentId) &&
        !seen.has(cursor.parentId)
      ) {
        seen.add(cursor.parentId);
        cursor = byId.get(cursor.parentId);
      }
      rootById.set(item.node.id, cursor.node.id);
      return cursor.node.id;
    }
    const roots = new Map();
    byId.forEach(function (item) {
      const rootId = rootOf(item);
      if (!roots.has(rootId)) roots.set(rootId, []);
      roots.get(rootId).push(item);
    });
    const rootGroups = Array.from(roots.entries()).sort(function (a, b) {
      const aNode = byId.get(a[0]);
      const bNode = byId.get(b[0]);
      return String((aNode && aNode.node.file_path) || a[0]).localeCompare(
        String((bNode && bNode.node.file_path) || b[0]),
      );
    });
    let cursorY = 0;
    rootGroups.forEach(function (entry) {
      const rows = entry[1];
      const levels = new Map();
      rows.forEach(function (item) {
        const depth = Math.max(0, Number(item.depth) || 0);
        if (!levels.has(depth)) levels.set(depth, []);
        levels.get(depth).push(item.node);
      });
      const height =
        Math.max(
          1,
          Math.max.apply(
            null,
            Array.from(levels.values()).map(function (nodes) {
              return nodes.length;
            }),
          ),
        ) * 58;
      levels.forEach(function (nodes, depth) {
        nodes.sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
        nodes.forEach(function (node, index) {
          state.viewPositions.set(node.id, {
            x: depth * 245,
            y: cursorY + (index - (nodes.length - 1) / 2) * 58,
          });
        });
      });
      cursorY += height + 76;
    });
    const ys = Array.from(state.viewPositions.values()).map(function (point) {
      return point.y;
    });
    const offset = ys.length
      ? (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2
      : 0;
    state.viewPositions.forEach(function (point) {
      point.y -= offset;
    });
  }

  function layoutCallGraph(chain) {
    state.viewPositions = new Map();
    if (chain.root) state.viewPositions.set(chain.root.id, { x: 0, y: 0 });
    const lanes = new Map();
    function place(items, direction) {
      items.forEach(function (item) {
        const depth = Math.max(1, Number(item.depth) || 1);
        const key = direction + ':' + depth;
        const lane = lanes.get(key) || [];
        lane.push(item.node);
        lanes.set(key, lane);
      });
    }
    place(chain.callers || [], -1);
    place(chain.callees || [], 1);
    lanes.forEach(function (nodes, key) {
      const parts = key.split(':');
      const direction = Number(parts[0]);
      const depth = Number(parts[1]);
      nodes.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(function (node, index) {
        state.viewPositions.set(node.id, {
          x: direction * depth * 245,
          y: (index - (nodes.length - 1) / 2) * 58,
        });
      });
    });
  }

  function showViewTitle(text) {
    $('#viewTitleText').textContent = text;
    $('#viewTitle').hidden = false;
  }

  function exitSpecialView(shouldFit) {
    state.mode = 'graph';
    state.focusIds = null;
    state.pathIds.clear();
    state.pathPairs.clear();
    state.pathStart = null;
    state.callGraph = null;
    $('#path').classList.remove('active');
    $('#repoCalls').classList.remove('active');
    $('#viewTitle').hidden = true;
    applyFilters(Boolean(shouldFit));
    setMessage('Full graph');
  }

  function clearSelection() {
    if (state.mode !== 'graph' || state.focusIds) {
      exitSpecialView(true);
      return;
    }
    state.selectedId = null;
    state.pathStart = null;
    state.pathIds.clear();
    state.pathPairs.clear();
    $('#focus').disabled = true;
    $('#path').disabled = true;
    $('#calls').disabled = true;
    $('#clear').disabled = true;
    app.classList.add('right-closed');
    $('#rightToggle').classList.remove('active');
    $('#detailName').textContent = 'Details';
    $('#detailKind').textContent = 'Symbol';
    detail.innerHTML =
      '<div class="detail-placeholder">' +
      icon('focus') +
      '<p>Select a symbol to see the essentials.</p></div>';
    renderResults();
    scheduleDraw();
    setMessage('Selection cleared');
  }

  function updateStats() {
    $('#nodeStat').textContent =
      state.visibleNodes.length +
      (state.visibleNodes.length === 1 ? ' symbol' : ' symbols');
    $('#edgeStat').textContent =
      state.visibleEdges.length +
      (state.visibleEdges.length === 1 ? ' relationship' : ' relationships');
  }

  async function load() {
    state.loading = true;
    $('#loadingState').hidden = false;
    $('#loadingState').classList.remove('error');
    setMessage('Loading graph…');
    try {
      const response = await fetch('/api/graph');
      const data = await response.json();
      if (!response.ok || data.error)
        throw new Error(data.error || 'Graph unavailable');
      state.data = {
        nodes: Array.isArray(data.nodes) ? data.nodes : [],
        edges: Array.isArray(data.edges) ? data.edges : [],
      };
      if (!state.data.nodes.length) throw new Error('No indexed symbols found');
      state.selectedId = null;
      state.focusIds = null;
      state.callGraph = null;
      state.mode = 'graph';
      state.detailCache.clear();
      buildIndexes();
      applyFilters(true);
      $('#loadingState').hidden = true;
      setMessage('Graph ready');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Graph unavailable';
      $('#loadingState').classList.add('error');
      $('#loadingState').innerHTML =
        '<span class="spinner"></span><strong>Graph unavailable</strong><small>' +
        esc(message) +
        '</small>';
      setMessage(message, true);
    } finally {
      state.loading = false;
    }
  }

  const pointers = new Map();
  const interaction = {
    panning: false,
    dragging: null,
    moved: false,
    lastX: 0,
    lastY: 0,
    pinchDistance: 0,
  };

  canvas.addEventListener('pointerdown', function (event) {
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
    interaction.lastX = event.offsetX;
    interaction.lastY = event.offsetY;
    interaction.moved = false;
    if (pointers.size === 1) {
      const node = hitNode(event.offsetX, event.offsetY);
      interaction.dragging = node ? node.id : null;
      interaction.panning = !node;
      if (node) selectNode(node.id, false);
    } else {
      interaction.dragging = null;
      interaction.panning = false;
      interaction.pinchDistance = pointerDistance();
    }
    canvas.classList.add('grabbing');
  });

  canvas.addEventListener('pointermove', function (event) {
    if (pointers.has(event.pointerId))
      pointers.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
    if (pointers.size >= 2) {
      const distance = pointerDistance();
      const center = pointerCenter();
      if (interaction.pinchDistance)
        zoom(distance / interaction.pinchDistance, center.x, center.y);
      interaction.pinchDistance = distance;
      return;
    }
    const dx = event.offsetX - interaction.lastX;
    const dy = event.offsetY - interaction.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) interaction.moved = true;
    if (interaction.dragging) {
      const point = positions().get(interaction.dragging);
      if (point) {
        markMotion();
        point.x += dx / state.camera.scale;
        point.y += dy / state.camera.scale;
        if (state.mode !== 'calls') updateGroupBounds();
        scheduleDraw();
      }
    } else if (interaction.panning) {
      markMotion();
      state.camera.x -= dx / state.camera.scale;
      state.camera.y -= dy / state.camera.scale;
      scheduleDraw();
    } else {
      const hovered = hitNode(event.offsetX, event.offsetY);
      state.hoveredId = hovered ? hovered.id : null;
      if (hovered) {
        tooltip.hidden = false;
        tooltip.style.left =
          Math.min(canvas.clientWidth - 260, event.offsetX + 13) + 'px';
        tooltip.style.top =
          Math.min(canvas.clientHeight - 70, event.offsetY + 13) + 'px';
        tooltip.innerHTML =
          '<strong>' +
          esc(hovered.name) +
          '</strong><small>' +
          esc(kindOf(hovered) + ' · ' + shortPath(hovered.file_path)) +
          '<br>' +
          degree(hovered.id) +
          ' relationships</small>';
      } else tooltip.hidden = true;
      scheduleDraw();
    }
    interaction.lastX = event.offsetX;
    interaction.lastY = event.offsetY;
  });

  function releasePointer(event) {
    pointers.delete(event.pointerId);
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
    interaction.dragging = null;
    interaction.panning = false;
    interaction.pinchDistance = pointers.size > 1 ? pointerDistance() : 0;
    canvas.classList.remove('grabbing');
  }
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('pointerleave', function () {
    if (!pointers.size) {
      state.hoveredId = null;
      tooltip.hidden = true;
      scheduleDraw();
    }
  });
  canvas.addEventListener('dblclick', function (event) {
    const node = hitNode(event.offsetX, event.offsetY);
    if (node) {
      selectNode(node.id, false);
      focusNearby();
    }
  });
  canvas.addEventListener(
    'wheel',
    function (event) {
      event.preventDefault();
      zoom(event.deltaY < 0 ? 1.12 : 0.89, event.offsetX, event.offsetY);
    },
    { passive: false },
  );

  function pointerDistance() {
    const values = Array.from(pointers.values());
    return values.length < 2
      ? 0
      : Math.hypot(values[1].x - values[0].x, values[1].y - values[0].y);
  }
  function pointerCenter() {
    const values = Array.from(pointers.values());
    return {
      x: (values[0].x + values[1].x) / 2,
      y: (values[0].y + values[1].y) / 2,
    };
  }

  minimap.addEventListener('pointerdown', function (event) {
    if (!state.miniBounds) return;
    const rect = minimap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    state.camera.x =
      (x - state.miniBounds.padX) / state.miniBounds.scale +
      state.miniBounds.minX;
    state.camera.y =
      (y - state.miniBounds.padY) / state.miniBounds.scale +
      state.miniBounds.minY;
    scheduleDraw();
  });

  function setupPanelResize(handleSelector, side) {
    const handle = $(handleSelector);
    handle.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      handle.classList.add('dragging');
      const startX = event.clientX;
      const root = document.documentElement;
      const initial = parseFloat(
        getComputedStyle(root).getPropertyValue(
          side === 'left' ? '--left-w' : '--right-w',
        ),
      );
      function move(moveEvent) {
        const delta = moveEvent.clientX - startX;
        let next = side === 'left' ? initial + delta : initial - delta;
        next = Math.max(220, Math.min(460, next));
        root.style.setProperty(
          side === 'left' ? '--left-w' : '--right-w',
          next + 'px',
        );
        resize();
      }
      function end(endEvent) {
        handle.releasePointerCapture(endEvent.pointerId);
        handle.classList.remove('dragging');
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', end);
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end);
    });
  }

  function toggleLeft(forceClosed) {
    const close =
      forceClosed == null
        ? !app.classList.contains('left-closed')
        : forceClosed;
    app.classList.toggle('left-closed', close);
    $('#leftToggle').classList.toggle('active', !close);
    requestAnimationFrame(resize);
  }
  function toggleRight(forceClosed) {
    const close =
      forceClosed == null
        ? !app.classList.contains('right-closed')
        : forceClosed;
    app.classList.toggle('right-closed', close);
    $('#rightToggle').classList.toggle('active', !close);
    requestAnimationFrame(resize);
  }

  search.addEventListener('input', function () {
    applyFilters(false);
  });
  ['#kind', '#group', '#edge'].forEach(function (selector) {
    $(selector).addEventListener('change', function () {
      applyFilters(false);
    });
  });
  $('#clearSearch').onclick = function () {
    search.value = '';
    $('#kind').value = '';
    $('#group').value = '';
    $('#edge').value = '';
    applyFilters(false);
    search.focus();
  };
  $('#zoomIn').onclick = function () {
    zoom(1.25, canvas.clientWidth / 2, canvas.clientHeight / 2);
  };
  $('#zoomOut').onclick = function () {
    zoom(0.8, canvas.clientWidth / 2, canvas.clientHeight / 2);
  };
  $('#fit').onclick = fitGraph;
  $('#focus').onclick = focusNearby;
  $('#path').onclick = pathAction;
  $('#calls').onclick = showCallFlow;
  $('#repoCalls').onclick = showExecutionFlow;
  $('#clear').onclick = clearSelection;
  $('#exitView').onclick = function () {
    exitSpecialView(true);
  };
  $('#reload').onclick = load;
  $('#edgeLabels').onclick = function () {
    state.edgeLabels = !state.edgeLabels;
    this.classList.toggle('active', state.edgeLabels);
    scheduleDraw();
  };
  $('#legendToggle').onclick = function () {
    const legend = $('#legend');
    legend.hidden = !legend.hidden;
    this.classList.toggle('active', !legend.hidden);
  };
  $('#minimapToggle').onclick = function () {
    const wrap = $('#minimapWrap');
    wrap.hidden = !wrap.hidden;
    this.classList.toggle('active', !wrap.hidden);
    scheduleDraw();
  };
  $('#leftToggle').onclick = function () {
    toggleLeft();
  };
  $('#rightToggle').onclick = function () {
    toggleRight();
  };
  $('#closeLeft').onclick = function () {
    toggleLeft(true);
  };
  $('#closeRight').onclick = function () {
    toggleRight(true);
  };
  $('#exportPng').onclick = function () {
    draw();
    canvas.toBlob(function (blob) {
      if (!blob) return;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'vedh-graph.png';
      link.click();
      setTimeout(function () {
        URL.revokeObjectURL(link.href);
      }, 1000);
      setMessage('Graph exported');
    }, 'image/png');
  };
  $$('.tab').forEach(function (button) {
    button.onclick = function () {
      setTab(button.dataset.tab);
    };
  });
  setupPanelResize('#resizeLeft', 'left');
  setupPanelResize('#resizeRight', 'right');
  window.addEventListener('keydown', function (event) {
    if (event.key === '/' && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    } else if (
      event.key.toLowerCase() === 'f' &&
      document.activeElement !== search
    )
      fitGraph();
    else if (event.key === 'Escape') clearSelection();
  });
  new ResizeObserver(resize).observe(stage);
  load();
})();
