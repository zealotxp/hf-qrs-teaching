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
    'mod-micro': '进阶篇-微观',
    'mod-reading': '判读篇',
    'mod-macro': '应用篇-宏观',
    'mod-exam': '考核篇'
  };
  const bc = document.getElementById('breadcrumb-current');
  if (bc) bc.textContent = tabNames[moduleId] || '';

  // 触发进度圆圈动画
  setTimeout(() => animateProgressCircles(), 200);
}

// ===== 侧面板 =====
function openPanel(data) {
  const panel = document.getElementById('detailPanel');
  const overlay = document.getElementById('panelOverlay');
  const panelTitle = document.getElementById('panelTitle');
  const panelContent = document.getElementById('panelContent');

  if (panelTitle) panelTitle.textContent = data.title || '';
  if (panelContent) panelContent.innerHTML = data.html || '';

  panel.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closePanel() {
  document.getElementById('detailPanel').classList.remove('open');
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
function drawECG(canvasId, color = '#00ff88', speed = 2) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 80;
  function generateECGPoint(t) {
    // 简化的QRS波形
    const base = Math.sin(t * 0.05) * 3;
    const p = Math.sin(t * 0.3) * 8;
    const qrs = (t % 60 < 5) ? -8 + Math.sin((t % 60) * Math.PI / 5) * 30 : 0;
    const t_wave = (t % 60 > 10 && t % 60 < 25) ? Math.sin((t % 60 - 10) * Math.PI / 15) * 10 : 0;
    return base + p + qrs + t_wave;
  }

  let points = [];
  let t = 0;

  function draw() {
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

    points.push({ x: W - 1, y: H / 2 - generateECGPoint(t) });
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

// ===== 流程步骤点击 =====
function handleStepClick(el) {
  const parent = el.closest('.flow-steps');
  if (parent) {
    parent.querySelectorAll('.flow-step').forEach(s => s.classList.remove('active'));
  }
  el.classList.add('active');
}

// ===== 面板内容数据 =====
const PANEL_DATA = {
  prepare: {
    title: '检测前准备 - 关键训练点',
    html: `
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
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">心肌缺血→粒粒功能障碍</div>
          <div class="key-point-body">心肌缺血→线粒体功能障碍→ATP合成减少→离子泵（Na-K-ATP酶）活性下降→细胞膜电位不稳定→高频碎裂信号产生。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">高频幅域减弱→QRS波碎裂（链式反应动画）</div>
          <div class="key-point-body">正常：高频成分振幅随运动增加；缺血：ATP减少→通道功能减弱→去极化不同步→高频分量衰减→出现碎裂波（f-QRS）。</div>
        </div>
      </div>`
  },
  case_study: {
    title: '案例库学习 - 典型病例解析',
    html: `
      <div class="key-point-list">
        <div class="key-point">
          <div class="key-point-title">5-10个典型案例</div>
          <div class="key-point-body">冠心病微循环、冠微血管病、心肌桥、心衰、药前后对比等典型案例，每个案例包含完整检测报告+解析。</div>
        </div>
        <div class="key-point">
          <div class="key-point-title">判读方法：史→检→高频QRS判读→微观机制→诊断/决策</div>
          <div class="key-point-body">完整的临床判读链：病史收集→体格检查→高频QRS报告→三角模型定位病变→最终诊断意见→治疗方案建议。</div>
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
    drawECG('ecg-canvas-1', '#00ff88', 1.5);
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

  // 面板关闭
  document.getElementById('panelOverlay')?.addEventListener('click', closePanel);
});

// ===== 打开内容面板 =====
function openContentPanel(key) {
  const data = PANEL_DATA[key];
  if (data) openPanel(data);
}

// ===== 考核功能 =====
function startExam(mode) {
  const msg = mode === 'A'
    ? '即将开始模式A：每篇章节考核\n\n本次考核包含4个章节，每章节约10-15道题目，请确认开始。'
    : '即将开始模式B：剧情化穿插考核\n\n将模拟一名患者从急诊到出院的完整诊疗流程，在关键决策点进行考核，请确认开始。';

  if (confirm(msg)) {
    alert('考核功能开发中，敬请期待！\n\n当前为原型演示版本。');
  }
}
