// Arabica Coffee Quality Analysis & Prediction - Master Application Engine
// Handles Navigation, Table Filtering, Interactive Predictor, and Statistical Calculators

const App = {
  currentPage: 'home',
  filteredSamples: [],
  samplesPerPage: 15,
  currentSamplePage: 1,

  init() {
    this.setupRouting();
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupDatasetExplorer();
    this.setupPredictor();
    this.setupStatisticalTools();
    this.setupVivaAccordion();
    
    // Initialize charts once DOM is fully ready
    if (window.ChartEngine) {
      window.ChartEngine.initAllCharts();
    }
  },

  // Routing and Section Switching
  setupRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.switchSection(hash);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  },

  switchSection(sectionId) {
    const validSections = [
      'home', 'dataset', 'eda', 'statistical', 
      'regression', 'ridge', 'lda', 'comparison', 
      'conclusions', 'about'
    ];
    
    const target = validSections.includes(sectionId) ? sectionId : 'home';
    this.currentPage = target;

    // Toggle active section in DOM
    document.querySelectorAll('.page-section').forEach(sec => {
      sec.classList.remove('active');
    });
    
    const targetSec = document.getElementById(`section-${target}`);
    if (targetSec) {
      targetSec.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav links
    document.querySelectorAll('.nav-item a, .mobile-drawer a').forEach(a => {
      if (a.getAttribute('href') === `#${target}`) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.remove('open');
  },

  // Setup Navigation listeners
  setupNavigation() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });
    }

    // Modal Predictor Trigger Buttons
    document.querySelectorAll('.btn-open-predictor').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('predictor-modal');
        if (modal) modal.classList.add('open');
      });
    });

    const closeBtn = document.getElementById('close-predictor-btn');
    const modal = document.getElementById('predictor-modal');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  },

  // Dark/Light Theme Switching
  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('coffee_sml_theme') || 'dark';
    
    if (savedTheme === 'light') {
      document.body.setAttribute('data-theme', 'light');
      if (toggleBtn) toggleBtn.innerHTML = '🌙';
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme');
        if (current === 'light') {
          document.body.removeAttribute('data-theme');
          localStorage.setItem('coffee_sml_theme', 'dark');
          toggleBtn.innerHTML = '☀️';
        } else {
          document.body.setAttribute('data-theme', 'light');
          localStorage.setItem('coffee_sml_theme', 'light');
          toggleBtn.innerHTML = '🌙';
        }
      });
    }
  },

  // Dataset Table & Interactive Explorer
  setupDatasetExplorer() {
    this.filteredSamples = [...PROJECT_DATA.samples];
    this.renderSamplesTable();

    const searchInput = document.getElementById('sample-search');
    const methodFilter = document.getElementById('sample-filter-method');
    const classFilter = document.getElementById('sample-filter-class');

    const applyFilters = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const method = methodFilter?.value || 'all';
      const qClass = classFilter?.value || 'all';

      this.filteredSamples = PROJECT_DATA.samples.filter(item => {
        const matchesQuery = !q || 
          item.country.toLowerCase().includes(q) || 
          item.variety.toLowerCase().includes(q);
        const matchesMethod = method === 'all' || item.processing === method;
        const matchesClass = qClass === 'all' || item.quality_class === qClass;
        return matchesQuery && matchesMethod && matchesClass;
      });

      this.currentSamplePage = 1;
      this.renderSamplesTable();
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (methodFilter) methodFilter.addEventListener('change', applyFilters);
    if (classFilter) classFilter.addEventListener('change', applyFilters);

    // Pagination buttons
    const prevBtn = document.getElementById('sample-prev-page');
    const nextBtn = document.getElementById('sample-next-page');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentSamplePage > 1) {
          this.currentSamplePage--;
          this.renderSamplesTable();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredSamples.length / this.samplesPerPage);
        if (this.currentSamplePage < totalPages) {
          this.currentSamplePage++;
          this.renderSamplesTable();
        }
      });
    }
  },

  renderSamplesTable() {
    const tbody = document.getElementById('samples-table-body');
    const pageIndicator = document.getElementById('sample-page-info');
    const prevBtn = document.getElementById('sample-prev-page');
    const nextBtn = document.getElementById('sample-next-page');

    if (!tbody) return;

    const total = this.filteredSamples.length;
    const totalPages = Math.max(1, Math.ceil(total / this.samplesPerPage));
    const startIdx = (this.currentSamplePage - 1) * this.samplesPerPage;
    const endIdx = Math.min(startIdx + this.samplesPerPage, total);
    const pageItems = this.filteredSamples.slice(startIdx, endIdx);

    if (pageIndicator) {
      pageIndicator.innerText = `Showing ${startIdx + 1}–${endIdx} of ${total} records (Page ${this.currentSamplePage} / ${totalPages})`;
    }

    if (prevBtn) prevBtn.disabled = this.currentSamplePage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentSamplePage >= totalPages;

    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2rem; color: var(--text-muted);">No coffee samples found matching your filter criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = pageItems.map(item => {
      let badgeClass = 'badge-gold';
      if (item.quality_class === 'High') badgeClass = 'badge-success';
      if (item.quality_class === 'Low') badgeClass = 'badge-danger';

      return `
        <tr>
          <td><strong>#${item.id}</strong></td>
          <td><span style="font-weight:600; color:var(--text-primary);">${item.country}</span></td>
          <td>${item.variety}</td>
          <td><span class="badge badge-gold">${item.processing}</span></td>
          <td>${item.altitude.toLocaleString()} m</td>
          <td>${item.moisture}</td>
          <td>${item.cat2}</td>
          <td><strong>${item.cup_points.toFixed(2)}</strong></td>
          <td><span class="badge ${badgeClass}">${item.quality_class}</span></td>
        </tr>
      `;
    }).join('');
  },

  // Interactive SML Coffee Quality Predictor
  setupPredictor() {
    const inputs = ['pred-defects', 'pred-altitude', 'pred-bags', 'pred-moisture', 'pred-method', 'pred-country'];
    const updatePrediction = () => {
      const defects = parseFloat(document.getElementById('pred-defects')?.value || 0);
      const altitude = parseFloat(document.getElementById('pred-altitude')?.value || 1200);
      const bags = parseFloat(document.getElementById('pred-bags')?.value || 100);
      const moisture = parseFloat(document.getElementById('pred-moisture')?.value || 0.11);
      const method = document.getElementById('pred-method')?.value || 'Washed / Wet';
      const country = document.getElementById('pred-country')?.value || 'Other';

      // Update displayed live value tags
      const defValTag = document.getElementById('val-pred-defects');
      const altValTag = document.getElementById('val-pred-altitude');
      const bagsValTag = document.getElementById('val-pred-bags');
      const moistValTag = document.getElementById('val-pred-moisture');
      if (defValTag) defValTag.innerText = defects;
      if (altValTag) altValTag.innerText = `${altitude} m`;
      if (bagsValTag) bagsValTag.innerText = `${bags} bags`;
      if (moistValTag) moistValTag.innerText = `${(moisture * 100).toFixed(1)}%`;

      // Ridge regression prediction equation (standardized baseline = 82.20)
      let score = 82.18;
      
      // Category 2 defects coefficient (-0.1204 per defect)
      score += -0.1204 * (defects - 3.5);
      
      // Number of bags coefficient (-0.0019)
      score += -0.0019 * (bags - 150);
      
      // Altitude coefficient (+0.0003 per meter)
      score += 0.0003 * (altitude - 1300);
      
      // Moisture coefficient (-2.14)
      score += -2.1433 * (moisture - 0.11);
      
      // Processing Method adjustment
      if (method === 'Natural / Dry') score += 0.38;
      else if (method === 'Washed / Wet') score -= 0.15;
      else if (method === 'Pulped natural / honey') score += 0.50;
      
      // Country of origin premium effects
      if (country === 'Ethiopia') score += 3.16;
      else if (country === 'Kenya') score += 3.47;
      else if (country === 'Uganda') score += 2.34;
      else if (country === 'Colombia') score += 0.85;
      else if (country === 'Guatemala') score += 0.10;
      else if (country === 'Mexico') score -= 0.95;

      // Bound score within realistic physical coffee range
      score = Math.max(68.0, Math.min(91.5, score));

      // Display Predicted Score
      const scoreEl = document.getElementById('predicted-score-display');
      const bandEl = document.getElementById('predicted-band-display');
      const ciEl = document.getElementById('predicted-ci-display');

      if (scoreEl) scoreEl.innerText = score.toFixed(2);
      
      // LDA Quality Band Assignment
      let band = 'Medium Quality (80–85)';
      let bandBadge = 'badge-gold';
      if (score > 85.0) {
        band = 'High Quality (> 85)';
        bandBadge = 'badge-success';
      } else if (score <= 80.0) {
        band = 'Low Quality (≤ 80)';
        bandBadge = 'badge-danger';
      }

      if (bandEl) {
        bandEl.innerText = band;
        bandEl.className = `result-class-badge badge ${bandBadge}`;
      }

      if (ciEl) {
        const lower = Math.max(65.0, score - 2.328).toFixed(2);
        const upper = Math.min(94.0, score + 2.328).toFixed(2);
        ciEl.innerText = `Prediction 95% Confidence Band: [${lower} – ${upper}] pts (RMSE = 2.328)`;
      }
    };

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updatePrediction);
        el.addEventListener('change', updatePrediction);
      }
    });

    updatePrediction();
  },

  // Confidence Interval Calculator Slider
  setupStatisticalTools() {
    const ciSlider = document.getElementById('ci-level-slider');
    const ciLevelDisplay = document.getElementById('ci-level-display');
    const ciBoundsDisplay = document.getElementById('ci-bounds-display');

    if (ciSlider && ciLevelDisplay && ciBoundsDisplay) {
      ciSlider.addEventListener('input', (e) => {
        const level = parseInt(e.target.value);
        ciLevelDisplay.innerText = `${level}%`;

        // Z-critical values
        let z = 1.96;
        if (level === 90) z = 1.645;
        if (level === 95) z = 1.96;
        if (level === 99) z = 2.576;

        const mean = 82.18;
        const se = 2.686 / Math.sqrt(1310);
        const margin = z * se;
        const lower = (mean - margin).toFixed(2);
        const upper = (mean + margin).toFixed(2);

        ciBoundsDisplay.innerHTML = `[${lower} – ${upper}] <span style="font-size:0.85rem; color:var(--text-muted);">(Margin of Error: ±${margin.toFixed(3)})</span>`;
      });
    }
  },

  // Viva Voce Accordion
  setupVivaAccordion() {
    const container = document.getElementById('viva-accordion-container');
    if (!container) return;

    container.innerHTML = PROJECT_DATA.viva_questions.map((item, idx) => `
      <div class="accordion-item ${idx === 0 ? 'open' : ''}">
        <button class="accordion-trigger" type="button">
          <span>Q${idx + 1}: ${item.q}</span>
          <span class="accordion-icon">▼</span>
        </button>
        <div class="accordion-content">
          <p>${item.a}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        const item = e.target.closest('.accordion-item');
        item.classList.toggle('open');
      });
    });
  }
};

// Launch Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
