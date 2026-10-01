// Arabica Coffee Quality - Interactive Visualizations Engine
// Implements Figures 1 through 8 with responsive Chart.js and Custom Canvas renderers

const ChartEngine = {
  instances: {},

  initAllCharts() {
    this.renderFigure1();
    this.renderFigure2();
    this.renderFigure3();
    this.renderFigure4();
    this.renderFigure5();
    this.renderFigure6();
    this.renderFigure7();
    this.renderFigure8();
    this.setupViewToggles();
    this.setupCategoryFilters();
  },

  // FIGURE 1: Distribution of Total Cup Points (Histogram)
  renderFigure1() {
    const ctx = document.getElementById('chart-fig1');
    if (!ctx) return;
    
    const histData = PROJECT_DATA.figures.fig1;
    const labels = histData.map(d => `${d.bin_start}-${d.bin_end}`);
    const counts = histData.map(d => d.count);
    
    // Highlight the bin containing the mean (82.18)
    const backgroundColors = histData.map(d => {
      if (82.18 >= d.bin_start && 82.18 < d.bin_end) {
        return '#e29547'; // Highlight amber
      }
      return 'rgba(212, 163, 115, 0.65)';
    });

    this.instances.fig1 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Coffee Samples',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: 'rgba(212, 163, 115, 0.9)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1c1a16',
            titleColor: '#d4a373',
            bodyColor: '#fbf9f5',
            borderColor: 'rgba(212, 163, 115, 0.3)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              title: (items) => `Total Cup Points: ${items[0].label}`,
              label: (item) => `Count: ${item.raw} samples`,
              afterLabel: (item) => {
                const bin = histData[item.dataIndex];
                if (82.18 >= bin.bin_start && 82.18 < bin.bin_end) {
                  return '★ Contains Mean (82.18)';
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Total Cup Points (Binned)', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c', maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 16 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            title: { display: true, text: 'Number of Coffee Samples', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  // FIGURE 2: Correlation Heatmap of Numerical Variables
  renderFigure2() {
    const canvas = document.getElementById('chart-fig2');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const vars = PROJECT_DATA.figures.fig2.vars;
    const matrix = PROJECT_DATA.figures.fig2.matrix;
    
    // Draw custom high-definition interactive canvas heatmap
    function drawHeatmap(hoverRow = -1, hoverCol = -1) {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement.clientWidth;
      const height = 340;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      const n = vars.length;
      const paddingLeft = 110;
      const paddingBottom = 80;
      const gridWidth = width - paddingLeft - 20;
      const gridHeight = height - paddingBottom - 10;
      
      const cellW = gridWidth / n;
      const cellH = gridHeight / n;
      
      ctx.clearRect(0, 0, width, height);
      
      // Color interpolator: -0.3 (deep indigo) to 0 (slate) to +1.0 (bright gold/yellow)
      function getColor(val) {
        if (val < 0) {
          const t = Math.min(1, Math.abs(val) / 0.35);
          return `rgba(${Math.round(45 + 30*t)}, ${Math.round(30 + 15*t)}, ${Math.round(90 + 70*t)}, 0.9)`;
        } else {
          const t = val; // 0 to 1
          const r = Math.round(35 + 200 * t);
          const g = Math.round(50 + 160 * t);
          const b = Math.round(80 - 40 * t);
          return `rgb(${r}, ${g}, ${b})`;
        }
      }
      
      // Draw cells
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const rowVar = vars[i];
          const colVar = vars[j];
          const val = matrix[rowVar][colVar];
          
          const x = paddingLeft + j * cellW;
          const y = 10 + i * cellH;
          
          ctx.fillStyle = getColor(val);
          ctx.fillRect(x, y, cellW - 1, cellH - 1);
          
          // Hover border
          if (i === hoverRow && j === hoverCol) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellW - 1, cellH - 1);
          }
        }
      }
      
      // Draw Row Labels (Y axis)
      ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const y = 10 + i * cellH + cellH / 2;
        ctx.fillStyle = (i === hoverRow) ? '#d4a373' : '#8e877c';
        const cleanName = vars[i].replace(/\./g, ' ');
        ctx.fillText(cleanName, paddingLeft - 8, y);
      }
      
      // Draw Col Labels (X axis rotated)
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let j = 0; j < n; j++) {
        const x = paddingLeft + j * cellW + cellW / 2;
        const y = 10 + gridHeight + 6;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 3);
        ctx.fillStyle = (j === hoverCol) ? '#d4a373' : '#8e877c';
        const cleanName = vars[j].replace(/\./g, ' ');
        ctx.fillText(cleanName, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
    
    drawHeatmap();
    window.addEventListener('resize', () => drawHeatmap());
    
    // Tooltip handling on mousemove
    const tooltipEl = document.getElementById('heatmap-tooltip');
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const n = vars.length;
      const paddingLeft = 110;
      const gridWidth = rect.width - paddingLeft - 20;
      const gridHeight = 340 - 90;
      const cellW = gridWidth / n;
      const cellH = gridHeight / n;
      
      if (x >= paddingLeft && x <= paddingLeft + gridWidth && y >= 10 && y <= 10 + gridHeight) {
        const col = Math.floor((x - paddingLeft) / cellW);
        const row = Math.floor((y - 10) / cellH);
        if (row >= 0 && row < n && col >= 0 && col < n) {
          drawHeatmap(row, col);
          const rVar = vars[row].replace(/\./g, ' ');
          const cVar = vars[col].replace(/\./g, ' ');
          const val = matrix[vars[row]][vars[col]];
          
          if (tooltipEl) {
            tooltipEl.style.display = 'block';
            tooltipEl.style.left = `${e.clientX + 14}px`;
            tooltipEl.style.top = `${e.clientY - 28}px`;
            tooltipEl.innerHTML = `<strong>${rVar}</strong> × <strong>${cVar}</strong><br>Pearson r = <strong>${val.toFixed(3)}</strong>`;
          }
          return;
        }
      }
      if (tooltipEl) tooltipEl.style.display = 'none';
      drawHeatmap();
    });

    canvas.addEventListener('mouseleave', () => {
      if (tooltipEl) tooltipEl.style.display = 'none';
      drawHeatmap();
    });
  },

  // FIGURE 3: Total Cup Points by Processing Method (Boxplot summary)
  renderFigure3() {
    const ctx = document.getElementById('chart-fig3');
    if (!ctx) return;
    
    const pmStats = PROJECT_DATA.figures.fig3;
    const methods = Object.keys(pmStats);
    
    const means = methods.map(m => pmStats[m].mean);
    const medians = methods.map(m => pmStats[m].median);
    const q25s = methods.map(m => pmStats[m].q25);
    const q75s = methods.map(m => pmStats[m].q75);
    
    this.instances.fig3 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: methods,
        datasets: [
          {
            label: 'Median Total Cup Points',
            data: medians,
            backgroundColor: 'rgba(212, 163, 115, 0.75)',
            borderColor: '#d4a373',
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.55
          },
          {
            label: 'Group Mean',
            data: means,
            type: 'line',
            borderColor: '#e29547',
            backgroundColor: '#e29547',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointStyle: 'rectRot',
            borderDash: [4, 4]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#c9c3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            backgroundColor: '#1c1a16',
            titleColor: '#d4a373',
            bodyColor: '#fbf9f5',
            borderColor: 'rgba(212, 163, 115, 0.3)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              afterBody: (items) => {
                const method = items[0].label;
                const s = pmStats[method];
                return [
                  `Samples (n): ${s.n}`,
                  `Mean: ${s.mean.toFixed(2)} | Median: ${s.median.toFixed(2)}`,
                  `IQR: [${s.q25.toFixed(2)} - ${s.q75.toFixed(2)}]`,
                  `Min: ${s.min.toFixed(2)} | Max: ${s.max.toFixed(2)}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#8e877c', maxRotation: 20 },
            grid: { display: false }
          },
          y: {
            min: 78,
            max: 86,
            title: { display: true, text: 'Total Cup Points', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c', stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  // FIGURE 4: Category Two Defects vs Total Cup Points (Scatter + Regression line)
  renderFigure4() {
    const ctx = document.getElementById('chart-fig4');
    if (!ctx) return;
    
    const fig4 = PROJECT_DATA.figures.fig4;
    const scatterData = fig4.points.map(p => ({ x: p.defects, y: p.cup_points }));
    
    // Generate regression line endpoints
    const maxDefects = Math.max(...fig4.points.map(p => p.defects));
    const lineData = [
      { x: 0, y: fig4.line.intercept },
      { x: maxDefects, y: fig4.line.intercept + fig4.line.slope * maxDefects }
    ];

    this.instances.fig4 = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Arabica Coffee Sample',
            data: scatterData,
            backgroundColor: 'rgba(212, 163, 115, 0.4)',
            borderColor: 'rgba(212, 163, 115, 0.7)',
            pointRadius: 3.5,
            pointHoverRadius: 6
          },
          {
            label: `OLS Fit: Slope = ${fig4.line.slope} (p < 0.001)`,
            data: lineData,
            type: 'line',
            borderColor: '#3b82f6',
            borderWidth: 2.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#c9c3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            backgroundColor: '#1c1a16',
            titleColor: '#d4a373',
            callbacks: {
              label: (item) => `Defects: ${item.parsed.x} | Cup Points: ${item.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Category Two Defects (Count)', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            title: { display: true, text: 'Total Cup Points', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  // FIGURE 5: Country-wise Average Total Cup Points (Top 10, n>=20)
  renderFigure5() {
    const ctx = document.getElementById('chart-fig5');
    if (!ctx) return;
    
    const countries = PROJECT_DATA.figures.fig5.slice(0, 10);
    const labels = countries.map(c => c.country);
    const means = countries.map(c => c.mean);
    
    this.instances.fig5 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mean Total Cup Points',
          data: means,
          backgroundColor: countries.map((_, i) => i < 3 ? 'rgba(226, 149, 71, 0.85)' : 'rgba(212, 163, 115, 0.65)'),
          borderColor: '#d4a373',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1c1a16',
            titleColor: '#d4a373',
            callbacks: {
              label: (item) => {
                const c = countries[item.dataIndex];
                return `Mean: ${c.mean.toFixed(2)} | Median: ${c.median.toFixed(2)} (n = ${c.n})`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 80,
            max: 86.5,
            title: { display: true, text: 'Mean Total Cup Points', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: { color: '#c9c3b8', font: { weight: '600' } },
            grid: { display: false }
          }
        }
      }
    });
  },

  // FIGURE 6: Actual vs Predicted Values — Ridge Regression
  renderFigure6() {
    const ctx = document.getElementById('chart-fig6');
    if (!ctx) return;
    
    const pts = PROJECT_DATA.figures.fig6;
    const scatter = pts.map(p => ({ x: p.actual, y: p.predicted }));
    
    // Diagonal 45-degree reference line
    const minVal = 68;
    const maxVal = 88;
    const refLine = [{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }];

    this.instances.fig6 = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Test Samples (Hold-Out 20%)',
            data: scatter,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 0.85)',
            pointRadius: 4,
            pointHoverRadius: 7
          },
          {
            label: 'Ideal 1:1 Identity Reference (y = x)',
            data: refLine,
            type: 'line',
            borderColor: '#e29547',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#c9c3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            backgroundColor: '#1c1a16',
            titleColor: '#d4a373',
            callbacks: {
              label: (item) => {
                const res = (item.parsed.x - item.parsed.y).toFixed(2);
                return `Actual: ${item.parsed.x.toFixed(2)} | Predicted: ${item.parsed.y.toFixed(2)} | Error: ${res}`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 68,
            max: 88,
            title: { display: true, text: 'Actual Total Cup Points', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            min: 68,
            max: 88,
            title: { display: true, text: 'Predicted Total Cup Points', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  // FIGURE 7: LDA Confusion Matrix (Heatmap grid)
  renderFigure7() {
    const canvas = document.getElementById('chart-fig7');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const cm = PROJECT_DATA.figures.fig7;
    const labels = cm.classes;
    const matrix = cm.matrix; // [[24, 14, 0], [45, 146, 14], [2, 11, 6]]
    
    function drawCM() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement.clientWidth;
      const height = 340;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      ctx.clearRect(0, 0, width, height);
      
      const paddingLeft = 100;
      const paddingBottom = 70;
      const paddingTop = 30;
      const gridWidth = Math.min(width - paddingLeft - 30, 320);
      const gridHeight = 240;
      
      const cellW = gridWidth / 3;
      const cellH = gridHeight / 3;
      
      const maxVal = 146; // highest cell count
      
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const val = matrix[r][c];
          const x = paddingLeft + c * cellW;
          const y = paddingTop + r * cellH;
          
          // Color scale: low values deep purple/dark, diagonal peak bright gold
          const t = val / maxVal;
          if (r === c) {
            // Correct predictions: emerald/gold blend
            ctx.fillStyle = `rgba(226, 149, 71, ${0.3 + 0.65 * t})`;
          } else {
            // Off-diagonal errors: subtle dark violet/gray
            ctx.fillStyle = `rgba(59, 130, 246, ${0.1 + 0.4 * t})`;
          }
          
          ctx.fillRect(x, y, cellW - 2, cellH - 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.strokeRect(x, y, cellW - 2, cellH - 2);
          
          // Number label
          ctx.font = '700 18px "Outfit", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x + cellW / 2, y + cellH / 2);
        }
      }
      
      // Actual Class Labels (Y)
      ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#d4a373';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let r = 0; r < 3; r++) {
        ctx.fillText(`Actual ${labels[r]}`, paddingLeft - 12, paddingTop + r * cellH + cellH / 2);
      }
      
      // Predicted Class Labels (X)
      ctx.textAlign = 'center';
      for (let c = 0; c < 3; c++) {
        ctx.fillText(`Pred ${labels[c]}`, paddingLeft + c * cellW + cellW / 2, paddingTop + gridHeight + 22);
      }
      
      // Title
      ctx.font = '700 13px "Outfit", sans-serif';
      ctx.fillStyle = '#fbf9f5';
      ctx.textAlign = 'center';
      ctx.fillText('LDA Quality Band Matrix (Test Set n=262)', paddingLeft + gridWidth / 2, 16);
    }
    
    drawCM();
    window.addEventListener('resize', drawCM);
  },

  // FIGURE 8: OLS Residual Analysis (Residuals vs Fitted Values)
  renderFigure8() {
    const ctx = document.getElementById('chart-fig8');
    if (!ctx) return;
    
    const pts = PROJECT_DATA.figures.fig8;
    const scatter = pts.map(p => ({ x: p.fitted, y: p.residual }));
    
    // Zero residual horizontal reference line
    const minFitted = 78;
    const maxFitted = 88;
    const zeroLine = [{ x: minFitted, y: 0 }, { x: maxFitted, y: 0 }];

    this.instances.fig8 = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Residuals (e = y - ŷ)',
            data: scatter,
            backgroundColor: 'rgba(212, 163, 115, 0.45)',
            borderColor: 'rgba(212, 163, 115, 0.8)',
            pointRadius: 3.5,
            pointHoverRadius: 6
          },
          {
            label: 'Zero Residual Baseline (e = 0)',
            data: zeroLine,
            type: 'line',
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#c9c3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            backgroundColor: '#1c1a16',
            titleColor: '#d4a373',
            callbacks: {
              label: (item) => `Fitted ŷ: ${item.parsed.x.toFixed(2)} | Residual: ${item.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Fitted Values (Predicted Total Cup Points)', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            title: { display: true, text: 'Residuals (Actual - Fitted)', color: '#8e877c', font: { weight: '600' } },
            ticks: { color: '#8e877c' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  // Toggle between Interactive Chart and Original Report Image
  setupViewToggles() {
    document.querySelectorAll('.fig-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.figure-card');
        const view = e.target.getAttribute('data-view');
        
        card.querySelectorAll('.fig-toggle-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const chartWrapper = card.querySelector('.chart-wrapper');
        const imgWrapper = card.querySelector('.report-img-wrapper');
        
        if (view === 'report') {
          chartWrapper.style.display = 'none';
          imgWrapper.classList.add('active');
        } else {
          chartWrapper.style.display = 'block';
          imgWrapper.classList.remove('active');
        }
      });
    });
  },

  // Figure Filter Tabs (All, Univariate, Relationships, Diagnostics)
  setupCategoryFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const filter = e.target.getAttribute('data-filter');
        document.querySelectorAll('.figure-card').forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};
