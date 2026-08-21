---
title: Playground
description: Live workbench for testing TypeFlow options interactively.
eyebrow: Workbench
---

<div class="playground-layout">
  <div class="playground-controls">
    <div class="control-group">
      <label for="pg-text">Text / HTML</label>
      <textarea id="pg-text" rows="3">Build <strong>modern</strong> interfaces with <span class="highlight">TypeFlow</span>.</textarea>
    </div>

    <div class="control-row">
      <div class="control-group">
        <label for="pg-speed">Speed &mdash; <span id="pg-speed-val">40</span> ms/char</label>
        <input type="range" id="pg-speed" min="5" max="150" value="40">
      </div>
      <div class="control-group">
        <label for="pg-erase-style">Erase Style</label>
        <select id="pg-erase-style">
          <option value="end">end</option>
          <option value="start">start</option>
          <option value="scramble">scramble</option>
          <option value="fade">fade</option>
          <option value="instant">instant</option>
        </select>
      </div>
    </div>

    <div class="control-row">
      <label class="checkbox-label">
        <input type="checkbox" id="pg-html" checked>
        HTML mode
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="pg-cursor-blink" checked>
        Cursor blink
      </label>
    </div>

    <div class="button-bar">
      <button type="button" id="pg-btn-type" class="button button-primary">Type</button>
      <button type="button" id="pg-btn-erase" class="button button-secondary">Erase</button>
      <button type="button" id="pg-btn-stop" class="button button-danger">Stop</button>
      <button type="button" id="pg-btn-rotator" class="button button-secondary">Rotate</button>
    </div>
  </div>

  <div class="playground-preview">
    <div class="preview-header">Live Output</div>
    <div class="preview-stage" id="pg-stage"></div>
  </div>
</div>
