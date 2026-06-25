/* ===== 高频QRS虚拟仿真教学系统 - 交互逻辑 ===== */

// ===== 模块切换 =====
function switchModule(moduleId) {
  document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const view = document.getElementById(moduleId);
  if (view) {
    view.classList.add('active');
    view.classList.remove('animate-in');
    void view.offsetWidth;
    view.classList.add('animate-in');
  }
  const tab = document.querySelector(`[data-module="${moduleId}"]`);
  if (tab) tab.classList.add('active');

  // 更新面包屑
  const tabNames = {
    'mod-basic': '基础实操篇',
    'mod-micro': '微观理论篇',
    'mod-reading': '判读篇',
    'mod-macro': '宏观应用篇',
    'mod-exam': '考核篇'
  };
  const bc = document.getElementById('breadcrumb-current');
  if (bc) bc.textContent = tabNames[moduleId] || '';

  // 触发进度圆圈动画
  setTimeout(() => animateProgressCircles(), 200);
}

// ===== 模态弹窗 =====
function openPanel(data) {
  const overlay = document.getElementById('panelOverlay');
  const panelTitle = document.getElementById('panelTitle');
  const panelContent = document.getElementById('panelContent');

  if (panelTitle) panelTitle.textContent = data.title || '';
  if (panelContent) panelContent.innerHTML = data.html || '';

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';

  // 初始化弹窗内的 ECG / 动画
  setTimeout(() => initModalAnimations(), 50);
}
function closePanel() {
  document.getElementById('panelOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

// ===== 进度圆圈动画 =====
function animateProgressCircles() {
  document.querySelectorAll('.progress-circle .fill').forEach(el => {
    const pct = parseInt(el.getAttribute('data-pct') || '0');
    const circumference = 188;
    const offset = circumference - (pct / 100) * circumference;
    el.style.strokeDashoffset = offset;
  });
}

// ===== ECG模拟波形 =====
function drawECGCanvas(canvas, color = '#00ff88', speed = 2, amplitude = 1) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || canvas.clientWidth || 200;
  const H = canvas.height = canvas.offsetHeight || canvas.clientHeight || 80;

  function generateECGPoint(t, abnormal = false) {
    const base = Math.sin(t * 0.05) * 3;
    const p = Math.sin(t * 0.3) * (8 * amplitude);
    const beat = t % 60;
    let qrs = 0;
    if (beat < 5) qrs = -8 + Math.sin(beat * Math.PI / 5) * (30 * amplitude);
    let t_wave = 0;
    if (beat > 10 && beat < 25) t_wave = Math.sin((beat - 10) * Math.PI / 15) * (10 * amplitude);

    // 异常：高频碎裂（叠加高频噪声）+ 振幅下降
    if (abnormal) {
      const noise = Math.sin(t * 2.5) * 6 + Math.cos(t * 3.1) * 4;
      return (base + p * 0.6 + qrs * 0.7 + t_wave * 0.5 + noise) * amplitude;
    }
    return (base + p + qrs + t_wave) * amplitude;
  }

  const isAbnormal = canvas.dataset.abnormal === 'true';
  let points = [];
  let t = 0;

  function draw() {
    // 如果 canvas 已被移除则停止
    if (!canvas.isConnected) return;
    ctx.fillStyle = 'rgba(10,22,40,0.15)';
    ctx.fillRect(0, 0, W, H);

    // 网格
    ctx.strokeStyle = 'rgba(0,100,50,0.15)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < W; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 20) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    points.push({ x: W - 1, y: H / 2 - generateECGPoint(t, isAbnormal) });
    t += speed;

    if (points.length > W) points.shift();
    points.forEach((pt, i) => { pt.x = i; });

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
  }
  draw();
}

function drawECG(canvasId, color = '#00ff88', speed = 2, amplitude = 1) {
  drawECGCanvas(document.getElementById(canvasId), color, speed, amplitude);
}

// ===== 弹窗内动画初始化 =====
function initModalAnimations() {
  document.querySelectorAll('.modal-ecg-canvas').forEach(canvas => {
    const color = canvas.dataset.color || '#00ff88';
    const speed = parseFloat(canvas.dataset.speed || '1.5');
    const amplitude = parseFloat(canvas.dataset.amplitude || '1');
    drawECGCanvas(canvas, color, speed, amplitude);
  });
}

// ===== 流程步骤点击 =====
function handleStepClick(el) {
  const parent = el.closest('.flow-steps');
  if (parent) {
    parent.querySelectorAll('.flow-step').forEach(s => s.classList.remove('active'));
  }
  el.classList.add('active');
}

// ===== 面板内容数据（图文+动画学习资源） =====
const PANEL_DATA = {
  prepare: {
    title: '检测前准备 - 关键训练点',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🛏️ 标准检测流程示意图</div>
        <svg class="modal-diagram" viewBox="0 0 640 180" style="max-width:100%;height:auto">
          <rect x="20" y="40" width="120" height="100" rx="10" fill="rgba(99,179,237,0.12)" stroke="#63b3ed" stroke-width="1.5"/>
          <text x="80" y="75" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">仰卧位</text>
          <text x="80" y="95" text-anchor="middle" fill="#90afc5" font-size="11">静息 ≥1.5min</text>
          <text x="80" y="115" text-anchor="middle" fill="#90afc5" font-size="11">稳定基线</text>
          <path d="M140 90 L180 90" stroke="#2d4a6b" stroke-width="2" marker-end="url(#arr)"/>

          <rect x="190" y="40" width="140" height="100" rx="10" fill="rgba(229,62,62,0.12)" stroke="#fc8181" stroke-width="1.5"/>
          <text x="260" y="75" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">禁忌症排查</text>
          <text x="260" y="95" text-anchor="middle" fill="#90afc5" font-size="11">高血压 / 心绞痛</text>
          <text x="260" y="115" text-anchor="middle" fill="#90afc5" font-size="11">心律失常 / 主动脉狭窄</text>
          <path d="M330 90 L370 90" stroke="#2d4a6b" stroke-width="2" marker-end="url(#arr)"/>

          <rect x="380" y="40" width="240" height="100" rx="10" fill="rgba(56,161,105,0.12)" stroke="#68d391" stroke-width="1.5"/>
          <text x="500" y="75" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">12导联电极精准粘贴</text>
          <text x="500" y="95" text-anchor="middle" fill="#90afc5" font-size="11">Wilson改良导联</text>
          <text x="500" y="115" text-anchor="middle" fill="#90afc5" font-size="11">V1-V6 + RA/LA/RL/LL</text>

          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8" fill="#2d4a6b"/>
            </marker>
          </defs>
        </svg>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">① 静息1.5分钟</div>
          <div class="key-point-body">患者取仰卧位，静息至少1.5分钟，确保基线稳定，排除运动伪差。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">② 相对/绝对禁忌症排查</div>
          <div class="key-point-body">询问病史：心绞痛、严重心律失常、未控制的高血压（>200/110mmHg）、主动脉狭窄等禁忌证。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">③ 贴电极片</div>
          <div class="key-point-body">12导联电极正确放置：Wilson改良导联系统，胸前导联V1-V6精准定位，肢体导联RA/LA/RL/LL。</div>
        </div>
      </div>`
  },
  rest_collect: {
    title: '高频QRS Rest采集 - 操作要点',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">📡 高频信号质量：正常 vs 异常</div>
        <div class="modal-ecg-wrap">
          <div class="modal-ecg-box">
            <div class="modal-ecg-label"><span class="normal"></span>正常高频QRS</div>
            <canvas class="modal-ecg-canvas" data-color="#00ff88" data-speed="1.2"></canvas>
          </div>
          <div class="modal-ecg-box">
            <div class="modal-ecg-label"><span class="abnormal"></span>异常：碎裂 + 噪声</div>
            <canvas class="modal-ecg-canvas" data-color="#fc8181" data-speed="1.2" data-abnormal="true"></canvas>
          </div>
        </div>
        <div class="modal-caption">右侧波形可见高频碎裂（f-QRS）及肌电噪声叠加，需重新调整电极或让患者放松。</div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">采集时长</div>
          <div class="key-point-body">静息状态采集1.5分钟高频QRS信号，确保采集到足够的心跳周期（≥30次）。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">关键训练点：高频信号干扰噪声识别</div>
          <div class="key-point-body">高频成分（150-250Hz）易受肌电、电源干扰。需识别：50Hz工频干扰、肌电伪差（>150Hz高频噪声）、基线漂移（<1Hz低频干扰）。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">运动风险防控高危指征</div>
          <div class="key-point-body">静息QRS碎裂波（f-QRS）提示高风险；ST段压低>0.1mV需暂停；多形性室速/室颤立即终止检测。</div>
        </div>
      </div>`
  },
  stress_collect: {
    title: '高频QRS Stress采集 - 关键步骤',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🏃 改良Bruce方案：运动-恢复时间轴</div>
        <svg class="modal-diagram" viewBox="0 0 640 130" style="max-width:100%;height:auto">
          <line x1="40" y1="80" x2="600" y2="80" stroke="#2d4a6b" stroke-width="2"/>
          <circle cx="40" cy="80" r="5" fill="#63b3ed"/>
          <circle cx="160" cy="80" r="5" fill="#63b3ed"/>
          <circle cx="280" cy="80" r="5" fill="#63b3ed"/>
          <circle cx="400" cy="80" r="5" fill="#63b3ed"/>
          <circle cx="520" cy="80" r="5" fill="#68d391"/>
          <circle cx="600" cy="80" r="5" fill="#68d391"/>

          <text x="40" y="55" text-anchor="middle" fill="#fff" font-size="11">0-3min</text>
          <text x="40" y="110" text-anchor="middle" fill="#90afc5" font-size="10">1.7mph / 0%</text>

          <text x="160" y="55" text-anchor="middle" fill="#fff" font-size="11">3-6min</text>
          <text x="160" y="110" text-anchor="middle" fill="#90afc5" font-size="10">1.7mph / 10%</text>

          <text x="280" y="55" text-anchor="middle" fill="#fff" font-size="11">6-9min</text>
          <text x="280" y="110" text-anchor="middle" fill="#90afc5" font-size="10">2.5mph / 12%</text>

          <text x="400" y="55" text-anchor="middle" fill="#fff" font-size="11">9-12min</text>
          <text x="400" y="110" text-anchor="middle" fill="#90afc5" font-size="10">3.4mph / 14%</text>

          <text x="560" y="55" text-anchor="middle" fill="#68d391" font-size="11">12-15min</text>
          <text x="560" y="110" text-anchor="middle" fill="#90afc5" font-size="10">恢复期</text>

          <path d="M40 80 Q220 35 400 60 T600 85" fill="none" stroke="#fc8181" stroke-width="2" stroke-dasharray="4 3" opacity="0.7">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite"/>
          </path>
          <text x="320" y="25" text-anchor="middle" fill="#fc8181" font-size="11">目标心率 ≈ 85% × (220-年龄)</text>
        </svg>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">运动方案：13分钟改良Bruce方案</div>
          <div class="key-point-body">阶段0（0-3min）：1.7mph/0%坡度；阶段1（3-6min）：1.7mph/10%坡度；阶段2（6-9min）：2.5mph/12%；阶段3（9-12min）：3.4mph/14%；恢复期（12-15min）。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">关键训练点：钟恢复</div>
          <div class="key-point-body">恢复期首分钟心率下降<12次/min提示自主神经功能异常，是独立死亡预测因子。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">关键训练点：运动负荷风险防范</div>
          <div class="key-point-body">目标心率=85%×（220-年龄），监测终止标准：收缩压>230mmHg、胸痛2级、眩晕、室速≥3个连发。</div>
        </div>
      </div>`
  },
  improvement: {
    title: '操作规范有效性提升',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">⚙️ 影响检测准确性的因素链</div>
        <div class="flow-chain">
          <div class="flow-node">BMI >30</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">电极接触不良</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">室温过低</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">操作差异</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">药物影响</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">信号伪差</div>
        </div>
        <div style="margin-top:12px;text-align:center">
          <span class="modal-tag green">标准化培训</span>
          <span class="modal-tag blue">定期设备校准</span>
          <span class="modal-tag gold">规范操作流程</span>
          <span class="modal-tag red">停药 / 记录用药</span>
        </div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">1 分钟训练点</div>
          <div class="key-point-body">心肌缺血动态生理变化：从静息到峰值运动，观察QRS高频成分（150-250Hz）振幅变化规律，正常人运动后振幅增加≥20%。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">高频QRS对药物的高敏感性</div>
          <div class="key-point-body">β受体阻滞剂、钙通道阻滞剂可影响HF-QRS振幅，检测前需记录用药情况，建议停用非必需药物48小时。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">影响高频QRS检测结果的因素及解决方案</div>
          <div class="key-point-body">体重指数（BMI>30）、电极接触不良、室内温度（<20°C）、检测者操作差异。解决：标准化培训、定期设备校准。</div>
        </div>
      </div>`
  },
  triangle_tech: {
    title: '技术基础原理 - 高频QRS机制',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">⚗️ 高频QRS产生的链式反应动画</div>
        <div class="flow-chain">
          <div class="flow-node">心肌缺血</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">线粒体功能障碍</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">ATP减少</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">离子通道失活</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">高频幅域减弱</div>
          <span class="flow-arrow">→</span>
          <div class="flow-node">QRS碎裂</div>
        </div>
        <div class="modal-ecg-wrap" style="margin-top:14px">
          <div class="modal-ecg-box">
            <div class="modal-ecg-label"><span class="normal"></span>正常心肌：高频同步</div>
            <canvas class="modal-ecg-canvas" data-color="#00ff88" data-speed="1"></canvas>
          </div>
          <div class="modal-ecg-box">
            <div class="modal-ecg-label"><span class="abnormal"></span>缺血心肌：碎裂波</div>
            <canvas class="modal-ecg-canvas" data-color="#fc8181" data-speed="1" data-abnormal="true"></canvas>
          </div>
        </div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">心肌缺血→线粒体功能障碍</div>
          <div class="key-point-body">心肌缺血→线粒体功能障碍→ATP合成减少→离子泵（Na-K-ATP酶）活性下降→细胞膜电位不稳定→高频碎裂信号产生。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">高频幅域减弱→QRS波碎裂（链式反应动画）</div>
          <div class="key-point-body">正常：高频成分振幅随运动增加；缺血：ATP减少→通道功能减弱→去极化不同步→高频分量衰减→出现碎裂波（f-QRS）。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">高频成分（150-250Hz）的生理来源</div>
          <div class="key-point-body">高频QRS信号来源于心肌细胞去极化和复极化过程中的快速离子通道活动，反映心肌电活动的微观同步性。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">QRS碎裂波（f-QRS）的病理意义</div>
          <div class="key-point-body">f-QRS是心肌瘢痕、纤维化或传导障碍的标志，提示心肌结构性病变，是预后不良的独立预测因子。</div>
        </div>
      </div>`
  },
  triangle_inner: {
    title: 'a · 内三角：心血管疾病底层机制分析模型',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🔬 内三角：分子-电生理-波形链路</div>
        <div class="triangle-diagram">
          <svg class="triangle-svg" viewBox="0 0 220 190">
            <polygon points="110,20 20,170 200,170" fill="none" stroke="#63b3ed" stroke-width="2" stroke-dasharray="4 2" opacity="0.5">
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite"/>
            </polygon>
            <circle cx="110" cy="20" r="28" fill="#162236" stroke="#63b3ed" stroke-width="2"/>
            <text x="110" y="16" class="tri-vertex-text" font-size="10">心肌缺血</text>
            <text x="110" y="28" class="tri-vertex-text" font-size="9" fill="#90afc5">供血不足</text>

            <circle cx="20" cy="170" r="28" fill="#162236" stroke="#63b3ed" stroke-width="2"/>
            <text x="20" y="166" class="tri-vertex-text" font-size="10">线粒体障碍</text>
            <text x="20" y="178" class="tri-vertex-text" font-size="9" fill="#90afc5">ATP↓</text>

            <circle cx="200" cy="170" r="28" fill="#162236" stroke="#63b3ed" stroke-width="2"/>
            <text x="200" y="166" class="tri-vertex-text" font-size="10">离子通道</text>
            <text x="200" y="178" class="tri-vertex-text" font-size="9" fill="#90afc5">失活</text>

            <circle cx="110" cy="110" r="36" fill="rgba(99,179,237,0.15)" stroke="#63b3ed" stroke-width="1.5"/>
            <text x="110" y="106" class="tri-center-text" fill="#fff" font-size="11" font-weight="600">高频QRS</text>
            <text x="110" y="120" class="tri-center-text" font-size="9">幅域减弱 / 碎裂</text>
          </svg>
        </div>
        <div class="modal-caption">内三角揭示：从心肌缺血到高频QRS改变的分子-电生理链路。</div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">链式反应机制</div>
          <div class="key-point-body">心肌缺血→线粒体功能障碍→ATP减少→离子通道失活→高频幅域减弱→QRS波碎裂。此为高频QRS信号改变的核心分子机制。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">动画演示要点</div>
          <div class="key-point-body">动画分6个阶段逐步展示链式反应过程，每个阶段配有分子层面示意图和对应的心电波形变化，帮助理解从分子到宏观的完整路径。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">临床意义</div>
          <div class="key-point-body">理解这一链式反应是掌握全部诊断逻辑的基础。高频QRS能在此链式反应的早期阶段（ATP减少阶段）即捕捉到信号变化，早于常规心电图3-6个月。</div>
        </div>
      </div>`
  },
  triangle_iron: {
    title: 'b · 铁三角：心脏整体功能分析模型',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🔺 铁三角：三维心脏功能评估模型</div>
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;align-items:center">
          <div class="triangle-diagram" style="width:240px;height:200px;margin:0">
            <svg class="triangle-svg" viewBox="0 0 240 200">
              <polygon points="120,20 30,170 210,170" fill="rgba(214,158,46,0.08)" stroke="#f6c358" stroke-width="2"/>
              <circle cx="120" cy="20" r="32" fill="#162236" stroke="#f6c358" stroke-width="2"/>
              <text x="120" y="16" class="tri-vertex-text">EF 收缩功能</text>
              <text x="120" y="30" class="tri-vertex-text" font-size="9" fill="#90afc5">射血分数</text>

              <circle cx="30" cy="170" r="32" fill="#162236" stroke="#f6c358" stroke-width="2"/>
              <text x="30" y="166" class="tri-vertex-text">E/A 舒张功能</text>
              <text x="30" y="180" class="tri-vertex-text" font-size="9" fill="#90afc5">二尖瓣血流</text>

              <circle cx="210" cy="170" r="32" fill="#162236" stroke="#f6c358" stroke-width="2"/>
              <text x="210" y="166" class="tri-vertex-text">GLS 纤维化</text>
              <text x="210" y="180" class="tri-vertex-text" font-size="9" fill="#90afc5">整体纵向应变</text>

              <path d="M120 20 L120 110" stroke="#f6c358" stroke-width="1" opacity="0.4" stroke-dasharray="3 2"/>
              <path d="M30 170 L120 110" stroke="#f6c358" stroke-width="1" opacity="0.4" stroke-dasharray="3 2"/>
              <path d="M210 170 L120 110" stroke="#f6c358" stroke-width="1" opacity="0.4" stroke-dasharray="3 2"/>
              <circle cx="120" cy="110" r="30" fill="rgba(214,158,46,0.2)" stroke="#f6c358" stroke-width="1.5" class="heart-pulse"/>
              <text x="120" y="106" class="tri-center-text" fill="#fff" font-size="11" font-weight="600">高频QRS</text>
              <text x="120" y="120" class="tri-center-text" font-size="9">r=0.78 预警</text>
            </svg>
          </div>
          <div>
            <div style="font-size:13px;color:var(--gold);font-weight:600;margin-bottom:10px">预警价值</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
                <div style="font-size:12px;color:#fff">EF 降低</div>
                <div style="font-size:11px;color:var(--text-muted)">HF-QRS 幅度下降早于常规ECG 3-6个月</div>
              </div>
              <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
                <div style="font-size:12px;color:#fff">E/A 异常</div>
                <div style="font-size:11px;color:var(--text-muted)">舒张功能障碍时高频成分同步性下降</div>
              </div>
              <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
                <div style="font-size:12px;color:#fff">GLS 恶化</div>
                <div style="font-size:11px;color:var(--text-muted)">心肌纤维化导致碎裂波增多</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">心室功能整合评估</div>
          <div class="key-point-body">铁三角涵盖：心肌收缩功能（EF）、舒张功能（E/A比值）、心肌纤维化程度（GLS），三维立体评估心脏整体功能状态。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">高频QRS与铁三角关联</div>
          <div class="key-point-body">HF-QRS幅度下降与EF降低高度相关（r=0.78），可早期预测心功能恶化，先于常规心电图3-6个月出现异常。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">动画演示要点</div>
          <div class="key-point-body">动画展示心脏三维模型中收缩功能、舒张功能、纤维化程度三个维度的协同评估方法，以及高频QRS在每个维度中的预警价值。</div>
        </div>
      </div>`
  },
  triangle_outer: {
    title: 'c · 外三角：七种心肌梗死合并分型',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🫀 外三角：7种心肌梗死分型与病变定位</div>
        <svg class="modal-diagram" viewBox="0 0 640 220" style="max-width:100%;height:auto">
          <!-- 简化的心脏轮廓 -->
          <path d="M320 60 C360 20 430 40 430 100 C430 150 380 180 320 190 C260 180 210 150 210 100 C210 40 280 20 320 60" fill="rgba(229,62,62,0.08)" stroke="#fc8181" stroke-width="2"/>
          <!-- 分区标注 -->
          <circle cx="280" cy="80" r="14" fill="rgba(99,179,237,0.2)" stroke="#63b3ed" stroke-width="1.5"/>
          <text x="280" y="84" text-anchor="middle" fill="#63b3ed" font-size="9">1型</text>

          <circle cx="360" cy="80" r="14" fill="rgba(56,161,105,0.2)" stroke="#68d391" stroke-width="1.5"/>
          <text x="360" y="84" text-anchor="middle" fill="#68d391" font-size="9">2型</text>

          <circle cx="320" cy="130" r="14" fill="rgba(214,158,46,0.2)" stroke="#f6c358" stroke-width="1.5"/>
          <text x="320" y="134" text-anchor="middle" fill="#f6c358" font-size="9">3型</text>

          <text x="320" y="30" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">心脏3D模型 · 心肌梗死分型定位</text>

          <g transform="translate(460, 50)">
            <rect x="0" y="0" width="160" height="140" rx="8" fill="var(--bg-card2)" stroke="var(--border)" stroke-width="1"/>
            <text x="80" y="22" text-anchor="middle" fill="#fff" font-size="12" font-weight="600">高频QRS特征</text>
            <text x="10" y="48" fill="#63b3ed" font-size="10">● 1型：斑块破裂/侵蚀</text>
            <text x="10" y="68" fill="#68d391" font-size="10">● 2型：供需失衡/微血管病</text>
            <text x="10" y="88" fill="#f6c358" font-size="10">● 3型：恶性心律失常/猝死</text>
            <text x="10" y="108" fill="#90afc5" font-size="10">● 4-7型：合并分型见动画</text>
          </g>
        </svg>
        <div class="modal-caption">动画将逐型展示病变位置、心电图演变及高频QRS碎裂模式。</div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">七型心肌梗死分型</div>
          <div class="key-point-body">1型（斑块破裂/侵蚀）、2型（供需失衡/微循环障碍/结构性心肌病）、3型（恶性心律失常/猝死）及其合并分型在高频QRS中的特异性表现。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">合并分型诊断要点</div>
          <div class="key-point-body">合并分型在高频QRS中表现为多导联碎裂波分布特征不同，动画演示各型特征性波形模式及鉴别诊断流程。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">动画演示要点</div>
          <div class="key-point-body">动画分7个场景展示各型心肌梗死的高频QRS特征，配合心脏3D模型标注病变位置，直观展示分型差异。</div>
        </div>
      </div>`
  },
  consensus_2024: {
    title: '2024版高频QRS专家共识',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">📊 高频QRS核心指标与参考范围</div>
        <svg class="modal-diagram" viewBox="0 0 640 180" style="max-width:100%;height:auto">
          <rect x="20" y="40" width="180" height="110" rx="10" fill="rgba(99,179,237,0.1)" stroke="#63b3ed" stroke-width="1.5"/>
          <text x="110" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">振幅 Amplitude</text>
          <text x="110" y="95" text-anchor="middle" fill="#90afc5" font-size="11">单位：μV</text>
          <text x="110" y="120" text-anchor="middle" fill="#90afc5" font-size="11">反映高频信号强度</text>

          <rect x="230" y="40" width="180" height="110" rx="10" fill="rgba(214,158,46,0.1)" stroke="#f6c358" stroke-width="1.5"/>
          <text x="320" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">频率 Frequency</text>
          <text x="320" y="95" text-anchor="middle" fill="#90afc5" font-size="11">范围：150-250 Hz</text>
          <text x="320" y="120" text-anchor="middle" fill="#90afc5" font-size="11">高频形态指数评分</text>

          <rect x="440" y="40" width="180" height="110" rx="10" fill="rgba(229,62,62,0.1)" stroke="#fc8181" stroke-width="1.5"/>
          <text x="530" y="70" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">碎裂度 f-QRS</text>
          <text x="530" y="95" text-anchor="middle" fill="#90afc5" font-size="11">计数 / 导联分布</text>
          <text x="530" y="120" text-anchor="middle" fill="#90afc5" font-size="11">提示瘢痕/纤维化</text>
        </svg>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">高频QRS各项指标定义</div>
          <div class="key-point-body">振幅（μV）、频率（Hz）、碎裂度（f-QRS计数）三大核心指标的标准化定义与测量方法。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">Rest/Stress检测正常参考值范围</div>
          <div class="key-point-body">静息状态：振幅参考值范围、频率分布特征；运动状态：振幅变化率、恢复期指标的正常区间。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">专家推荐的临床应用场景与适应证</div>
          <div class="key-point-body">包括冠心病筛查、心肌缺血诊断、PCI围术期评估、药物治疗监测、预后随访等推荐适应证。</div>
        </div>
      </div>`
  },
  case_study: {
    title: '案例库学习 - 典型病例解析',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🗃️ 5个典型案例快速导航</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
          <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:24px;margin-bottom:6px">🫀</div>
            <div style="font-size:12px;color:#fff;font-weight:600">冠心病</div>
            <div style="font-size:10px;color:var(--text-muted)">微血管病</div>
          </div>
          <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:24px;margin-bottom:6px">🏗️</div>
            <div style="font-size:12px;color:#fff;font-weight:600">心肌桥</div>
            <div style="font-size:10px;color:var(--text-muted)">运动诱发缺血</div>
          </div>
          <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:24px;margin-bottom:6px">💔</div>
            <div style="font-size:12px;color:#fff;font-weight:600">心力衰竭</div>
            <div style="font-size:10px;color:var(--text-muted)">收缩/舒张障碍</div>
          </div>
          <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:24px;margin-bottom:6px">💊</div>
            <div style="font-size:12px;color:#fff;font-weight:600">药前后对比</div>
            <div style="font-size:10px;color:var(--text-muted)">疗效评估</div>
          </div>
          <div style="background:var(--bg-card2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
            <div style="font-size:24px;margin-bottom:6px">📋</div>
            <div style="font-size:12px;color:#fff;font-weight:600">综合案例</div>
            <div style="font-size:10px;color:var(--text-muted)">完整诊疗链</div>
          </div>
        </div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">5个典型案例</div>
          <div class="key-point-body">冠心病微血管病、心肌桥、心衰、药前后对比、综合案例。每个案例包含完整检测报告+动画解析。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">判读方法：病史→检查→高频QRS判读→微观机制→诊断/决策</div>
          <div class="key-point-body">完整的临床判读链：病史收集→体格检查→高频QRS报告→三角模型定位病变→最终诊断意见→治疗方案建议。</div>
        </div>
      </div>`
  },
  rest_8_looks: {
    title: '高频QRS Rest八看原则',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">👁️ Rest八看：逐项检查清单</div>
        <div class="look-checklist">
          <div class="look-item"><div class="look-num">1</div><div class="look-text"><b>看振幅</b><br/>最大电压 / 颜色 / 阳性导联数</div></div>
          <div class="look-item"><div class="look-num">2</div><div class="look-text"><b>看频率</b><br/>高频形态指数评分</div></div>
          <div class="look-item"><div class="look-num">3</div><div class="look-text"><b>看导联</b><br/>碎裂分布模式</div></div>
          <div class="look-item"><div class="look-num">4</div><div class="look-text"><b>看QRS时限</b><br/>波宽均值 / 传导异常</div></div>
          <div class="look-item"><div class="look-num">5</div><div class="look-text"><b>看ST</b><br/>最大压低值 / 导联范围</div></div>
          <div class="look-item"><div class="look-num">6</div><div class="look-text"><b>看波峰</b><br/>用药 / 最大电压 / 颜色</div></div>
          <div class="look-item"><div class="look-num">7</div><div class="look-text"><b>看节律</b><br/>波谷/波峰平均电压比</div></div>
          <div class="look-item"><div class="look-num">8</div><div class="look-text"><b>看整体</b><br/>时域时频整合分析</div></div>
        </div>
      </div>
      <div class="modal-visual">
        <div class="modal-visual-title">📈 模拟高频QRS报告片段</div>
        <canvas class="modal-ecg-canvas" data-color="#63b3ed" data-speed="1.5" style="height:90px"></canvas>
        <div class="modal-caption">动画模拟多导联高频QRS波形，训练时按八看原则逐项核对。</div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">判读口诀</div>
          <div class="key-point-body">“振幅频率导联位，时限ST波峰追；节律整体综合看，静息八看判是非。”</div>
        </div>
      </div>`
  },
  stress_7_looks: {
    title: '高频QRS Stress七看原则',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🏃 Stress七看：运动负荷判读要点</div>
        <div class="look-checklist">
          <div class="look-item"><div class="look-num">1</div><div class="look-text"><b>振幅变化趋势</b><br/>运动态增/减/平</div></div>
          <div class="look-item"><div class="look-num">2</div><div class="look-text"><b>钟恢复 HRR</b><br/>恢复首分钟心率下降</div></div>
          <div class="look-item"><div class="look-num">3</div><div class="look-text"><b>用药·电压·颜色</b><br/>用药前后对比</div></div>
          <div class="look-item"><div class="look-num">4</div><div class="look-text"><b>最大心率 MHR%</b><br/>目标心率达成率</div></div>
          <div class="look-item"><div class="look-num">5</div><div class="look-text"><b>颜色·阳性数量</b><br/>各阶段阳性导联数</div></div>
          <div class="look-item"><div class="look-num">6</div><div class="look-text"><b>波形·振幅/电压</b><br/>运动-恢复曲线</div></div>
          <div class="look-item"><div class="look-num">7</div><div class="look-text"><b>ST段变化</b><br/>压低值 / 出现导联</div></div>
          <div class="look-item"><div class="look-num">✓</div><div class="look-text"><b>综合判断</b><br/>结合Rest八看</div></div>
        </div>
      </div>
      <div class="modal-visual">
        <div class="modal-visual-title">📉 运动-恢复高频QRS趋势动画</div>
        <svg class="modal-diagram" viewBox="0 0 640 130" style="max-width:100%;height:auto">
          <line x1="40" y1="100" x2="600" y2="100" stroke="#2d4a6b" stroke-width="1"/>
          <line x1="40" y1="100" x2="40" y2="20" stroke="#2d4a6b" stroke-width="1"/>
          <text x="30" y="15" fill="#90afc5" font-size="10">振幅</text>
          <text x="600" y="115" fill="#90afc5" font-size="10">时间</text>

          <path d="M40 80 Q120 75 200 60 Q280 40 360 50 Q440 65 520 85 Q580 95 600 90" fill="none" stroke="#00ff88" stroke-width="2"/>
          <circle cx="200" cy="60" r="4" fill="#63b3ed"/>
          <text x="200" y="50" text-anchor="middle" fill="#63b3ed" font-size="10">运动中</text>
          <circle cx="440" cy="65" r="4" fill="#fc8181"/>
          <text x="440" y="55" text-anchor="middle" fill="#fc8181" font-size="10">异常下降</text>
          <circle cx="600" cy="90" r="4" fill="#68d391"/>
          <text x="600" y="110" text-anchor="end" fill="#68d391" font-size="10">恢复期</text>
        </svg>
        <div class="modal-caption">正常：运动后高频振幅升高；缺血：运动中/恢复期振幅异常下降。</div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">判读口诀</div>
          <div class="key-point-body">“运动振幅看趋势，钟恢复率莫忽视；药压颜色心率比，ST变化定乾坤。”</div>
        </div>
      </div>`
  },
  case_method: {
    title: '案例分析方法',
    html: `
      <div class="modal-visual">
        <div class="modal-visual-title">🔗 完整临床判读链</div>
        <div class="case-timeline">
          <div class="case-tl-item">
            <div class="case-tl-title">1. 病史采集</div>
            <div class="case-tl-body">症状、危险因素、既往史、用药史</div>
          </div>
          <div class="case-tl-item">
            <div class="case-tl-title">2. 体格检查与实验室</div>
            <div class="case-tl-body">血压、心率、心肺听诊、肌钙蛋白、血脂等</div>
          </div>
          <div class="case-tl-item">
            <div class="case-tl-title">3. 高频QRS报告分析</div>
            <div class="case-tl-body">Rest八看 + Stress七看，识别异常模式</div>
          </div>
          <div class="case-tl-item">
            <div class="case-tl-title">4. 三角模型定位病变</div>
            <div class="case-tl-body">内三角（机制）→ 铁三角（功能）→ 外三角（分型）</div>
          </div>
          <div class="case-tl-item">
            <div class="case-tl-title">5. 诊断 / 治疗决策</div>
            <div class="case-tl-body">结合证据形成诊断意见，制定个体化治疗方案</div>
          </div>
        </div>
      </div>
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">完整临床判读链</div>
          <div class="key-point-body">病史采集 → 检查结果 → HF-QRS分析 → 微观机制回溯 → 诊断/决策。系统化的临床判读思维路径。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">判读步骤</div>
          <div class="key-point-body">第一步：收集病史与症状；第二步：体格检查与实验室结果；第三步：高频QRS报告分析（Rest八看+Stress七看）；第四步：三角模型定位病变；第五步：形成诊断意见与治疗建议。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">思维训练要点</div>
          <div class="key-point-body">从静态到动态、从宏观到微观、从单一指标到综合分析，逐步建立完整的临床判读思维体系。</div>
        </div>
      </div>`
  }
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 默认显示第一个模块
  switchModule('mod-basic');

  // 启动ECG波形动画
  setTimeout(() => {
    drawECG('ecg-canvas-2', '#63b3ed', 2);
  }, 300);

  // 进度条动画
  setTimeout(() => {
    const fills = document.querySelectorAll('.progress-fill');
    fills.forEach(el => {
      const w = el.getAttribute('data-width') || '0';
      el.style.width = w + '%';
    });
    animateProgressCircles();
  }, 400);

  // 模态弹窗：点击遮罩层关闭（排除对话框内部）
  document.getElementById('panelOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePanel();
  });
});

// ===== 打开内容面板 =====
function openContentPanel(key) {
  const data = PANEL_DATA[key];
  if (data) openPanel(data);
}

// ===== 考核功能 =====
function startExam(mode) {
  const msg = mode === 'A'
    ? '即将开始模式A：每篇章考核\n\n所有题目答题。包含4个章节单元考核，每章节约10-15道题目，请确认开始。'
    : '即将开始模式B：剧情化穿插考核\n\n虚拟仿真+部分题目答题。模拟患者从急诊到出院的完整诊疗流程，在关键决策点穿插考核，请确认开始。';

  if (confirm(msg)) {
    if (mode === 'B') {
      location.href = 'simulation.html';
    } else {
      alert('考核功能开发中，敬请期待！\n\n当前为原型演示版本。');
    }
  }
}
