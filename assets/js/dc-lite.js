/* dc-lite: renders the prototype's page templates in a plain browser.
   Supports {{holes}} in text and attributes, <sc-if value>, <sc-for list as>,
   onClick / onChange handlers and a small DCLogic component with setState. */
(function () {
  'use strict';

  var BOOL = { disabled: 1, checked: 1, hidden: 1, readonly: 1, required: 1, open: 1, selected: 1, multiple: 1 };
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var ONE = /^\{\{\s*([^}]+?)\s*\}\}$/;
  var EVENTS = ['click', 'input', 'change', 'keydown'];

  var comp = null, tpl = null, root = null, handlers = [], queued = false;

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    var p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, p);
    schedule();
  };
  window.DCLogic = DCLogic;

  function schedule() {
    if (queued) return;
    queued = true;
    Promise.resolve().then(function () { queued = false; render(); });
  }

  function lookup(scopes, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    var parts = path.split('.');
    for (var i = 0; i < scopes.length; i++) {
      var s = scopes[i];
      if (s && typeof s === 'object' && parts[0] in s) {
        var v = s;
        for (var j = 0; j < parts.length; j++) { v = v == null ? undefined : v[parts[j]]; }
        return v;
      }
    }
    return undefined;
  }

  function interp(str, scopes) {
    var m = str.match(ONE);
    if (m) return { single: true, value: lookup(scopes, m[1]) };
    return { single: false, value: str.replace(HOLE, function (_, k) { var v = lookup(scopes, k); return v == null ? '' : String(v); }) };
  }

  function truthy(v) { return !!v && v !== 'false'; }

  function build(node, scopes, out) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      out.appendChild(document.createTextNode(t.indexOf('{{') < 0 ? t : interp(t, scopes).value));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    var kids = node.childNodes, i;
    if (tag === 'sc-if') {
      if (truthy(interp(node.getAttribute('value') || '', scopes).value)) {
        for (i = 0; i < kids.length; i++) build(kids[i], scopes, out);
      }
      return;
    }
    if (tag === 'sc-for') {
      var list = interp(node.getAttribute('list') || '', scopes).value || [];
      var as = node.getAttribute('as') || 'item';
      for (var n = 0; n < list.length; n++) {
        var sc = {}; sc[as] = list[n]; sc[as + 'Index'] = n;
        var inner = [sc].concat(scopes);
        for (i = 0; i < kids.length; i++) build(kids[i], inner, out);
      }
      return;
    }
    var el = document.createElementNS(node.namespaceURI, node.localName);
    var type = (node.getAttribute('type') || '').toLowerCase();
    var isField = tag === 'input' || tag === 'textarea' || tag === 'select';
    var bound = false;
    for (i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], name = a.name, val = a.value;
      if (name.indexOf('hint-') === 0) continue;
      if (name.length > 2 && name.indexOf('on') === 0 && val.indexOf('{{') >= 0) {
        var evt = name.slice(2);
        if (evt === 'change' && (tag === 'textarea' || (tag === 'input' && type !== 'checkbox' && type !== 'radio'))) evt = 'input';
        handlers.push(interp(val, scopes).value);
        el.setAttribute('data-dc-' + evt, String(handlers.length - 1));
        continue;
      }
      if (val.indexOf('{{') >= 0) {
        var r = interp(val, scopes);
        if (isField && (name === 'value' || name === 'checked')) bound = true;
        if (r.single) {
          var v = r.value;
          if (BOOL[name]) {
            if (truthy(v)) el.setAttribute(name, '');
            if (name === 'checked') el.checked = truthy(v);
            continue;
          }
          if (name === 'value' && tag === 'textarea') { el.value = v == null ? '' : String(v); continue; }
          if (v == null || v === false) continue;
          el.setAttribute(name, String(v));
          if (name === 'value' && isField) el.value = String(v);
        } else {
          el.setAttribute(name, r.value);
        }
      } else if (a.namespaceURI) {
        el.setAttributeNS(a.namespaceURI, name, val);
      } else {
        el.setAttribute(name, val);
      }
    }
    if (isField && !bound) el.setAttribute('data-dc-free', '');
    var src = tag === 'template' ? node.content.childNodes : kids;
    for (i = 0; i < src.length; i++) build(src[i], scopes, el);
    out.appendChild(el);
  }

  function render() {
    handlers = [];
    var vals = comp && comp.renderVals ? (comp.renderVals() || {}) : {};
    var next = document.createElement('div');
    var nodes = tpl.content.childNodes;
    for (var i = 0; i < nodes.length; i++) build(nodes[i], [vals], next);
    if (!root.firstChild) {
      while (next.firstChild) root.appendChild(next.firstChild);
      return;
    }
    window.morphdom(root, next, {
      childrenOnly: true,
      onBeforeElUpdated: function (from, to) {
        if (from.hasAttribute && from.hasAttribute('data-dc-free') && to.hasAttribute('data-dc-free')) return false;
        return true;
      }
    });
  }

  function delegate(type) {
    root.addEventListener(type, function (e) {
      var t = e.target;
      while (t && t !== root) {
        var id = t.getAttribute && t.getAttribute('data-dc-' + type);
        if (id != null) {
          var fn = handlers[+id];
          if (typeof fn === 'function') fn(e);
          return;
        }
        t = t.parentNode;
      }
    });
  }

  window.DCLite = {
    mount: function (Component, props) {
      tpl = document.getElementById('dc-template');
      root = document.getElementById('dc-root');
      comp = Component ? new Component(props || {}) : null;
      EVENTS.forEach(delegate);
      root.addEventListener('submit', function (e) { e.preventDefault(); });
      render();
    }
  };
})();
