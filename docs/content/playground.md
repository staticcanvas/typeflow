---
title: Playground
description: Live interactive testing workbench for TypeFlow options, speeds, erase styles, and HTML markup.
eyebrow: Workbench
---

<div class="playground-layout">
  <div class="playground-controls">
    <div class="control-group">
      <label for="pg-text">Input Text / HTML</label>
      <textarea id="pg-text" rows="3">Build <strong>modern</strong> interfaces with <span class="highlight">TypeFlow</span>.</textarea>
    </div>

    <div class="control-row">
      <div class="control-group">
        <label for="pg-speed">Speed (ms/char): <span id="pg-speed-val">40</span></label>
        <input type="range" id="pg-speed" min="5" max="150" value="40">
      </div>
      <div class="control-group">
        <label for="pg-variance">Speed Variance (+/- ms): <span id="pg-var-val">10</span></label>
        <input type="range" id="pg-variance" min="0" max="50" value="10">
      </div>
    </div>

    <div class="control-row">
      <div class="control-group">
        <label for="pg-erase-style">Erase Style</label>
        <select id="pg-erase-style">
          <option value="end">end (Backspace right-to-left)</option>
          <option value="start">start (Erosion left-to-right)</option>
          <option value="fade">fade (CSS opacity fade)</option>
          <option value="instant">instant (Clear immediately)</option>
        </select>
      </div>
      <div class="control-group">
        <label for="pg-cursor">Cursor Glyph</label>
        <input type="text" id="pg-cursor" value="|">
      </div>
    </div>

    <div class="control-row">
      <label class="checkbox-label">
        <input type="checkbox" id="pg-html" checked>
        Enable HTML Mode
      </label>
      <label class="checkbox-label">
        <input type="checkbox" id="pg-cursor-blink" checked>
        Cursor Blink
      </label>
    </div>

    <div class="button-bar">
      <button type="button" id="pg-btn-type" class="button button-primary">Type Text</button>
      <button type="button" id="pg-btn-erase" class="button button-secondary">Erase</button>
      <button type="button" id="pg-btn-stop" class="button button-danger">Stop</button>
      <button type="button" id="pg-btn-rotator" class="button button-secondary">Run Rotator Demo</button>
    </div>
  </div>

  <div class="playground-preview">
    <div class="preview-header">Live Output Stage</div>
    <div class="preview-stage" id="pg-stage"></div>
  </div>
</div>
