/**
 * PinNote Official Website Client Scripts
 * Interactive Widgets, Theme Switching, SEO signals & Demo Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initOsDetection();
  initPinNoteDemo();
  initFaqAccordion();
  initCopyChecksum();
  initMobileNav();
});

/* ==========================================================================
   1. Theme Management (Dark & Light Mode with Persisted Preference)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or system preference
  const savedTheme = localStorage.getItem('pinnote-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('pinnote-theme', newTheme);
    });
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    if (themeIconSun && themeIconMoon) {
      if (theme === 'dark') {
        themeIconSun.style.display = 'block';
        themeIconMoon.style.display = 'none';
        themeToggleBtn?.setAttribute('aria-label', 'Switch to light mode');
      } else {
        themeIconSun.style.display = 'none';
        themeIconMoon.style.display = 'block';
        themeToggleBtn?.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }

  // Listen for OS system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('pinnote-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ==========================================================================
   2. OS Detection & Dynamic Download Recommendation
   ========================================================================== */
function initOsDetection() {
  const userAgent = navigator.userAgent || navigator.platform || '';
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent);
  const isWindows = /Win32|Win64|Windows|WinCE/i.test(userAgent);

  const heroWinCta = document.getElementById('hero-download-win');
  const heroMacCta = document.getElementById('hero-download-mac');
  const cardWin = document.getElementById('card-download-win');
  const cardMac = document.getElementById('card-download-mac');

  if (isMac) {
    if (heroMacCta && heroWinCta) {
      heroMacCta.classList.add('btn-primary');
      heroMacCta.classList.remove('btn-secondary');
      heroWinCta.classList.remove('btn-primary');
      heroWinCta.classList.add('btn-secondary');
    }
    if (cardMac && cardWin) {
      cardMac.classList.add('featured');
      cardWin.classList.remove('featured');
    }
  } else if (isWindows) {
    if (cardWin) cardWin.classList.add('featured');
  }
}

/* ==========================================================================
   3. Interactive PinNote Live Widget Demo
   ========================================================================== */
function initPinNoteDemo() {
  const mockup = document.getElementById('pinnote-mockup');
  const pinBtn = document.getElementById('mockup-pin-btn');
  const pinStatusText = document.getElementById('pin-status-text');
  const mockupEditor = document.getElementById('mockup-editor');
  const wordCountEl = document.getElementById('demo-word-count');
  const charCountEl = document.getElementById('demo-char-count');
  const copyBtn = document.getElementById('demo-copy-btn');
  const clearBtn = document.getElementById('demo-clear-btn');
  const undoBanner = document.getElementById('demo-undo-banner');
  const undoActionBtn = document.getElementById('demo-undo-btn');
  const fontDecBtn = document.getElementById('demo-font-dec');
  const fontIncBtn = document.getElementById('demo-font-inc');
  const demoThemeToggle = document.getElementById('demo-theme-toggle');
  const simTransparencyBtn = document.getElementById('demo-sim-transparency');
  const simIdleStatus = document.getElementById('demo-idle-status');

  let isPinned = true;
  let currentFontSize = 14;
  let cachedEditorHtml = '';
  let undoTimeout = null;
  let isTransparencyActive = false;
  let idleTimer = null;

  // 1. Always-on-Top Pin Toggle
  if (pinBtn && mockup) {
    pinBtn.addEventListener('click', () => {
      isPinned = !isPinned;
      pinBtn.classList.toggle('is-pinned', isPinned);
      if (pinStatusText) {
        pinStatusText.textContent = isPinned ? 'Always-on-Top: Active (Pinned)' : 'Always-on-Top: Inactive';
      }
      showToast(isPinned ? '📌 Always-on-Top Enabled: PinNote floats above all apps' : '📌 Pin disabled: Window operates normally');
    });
  }

  // 2. Real-time Word & Character Counter
  function updateCounters() {
    if (!mockupEditor || !wordCountEl || !charCountEl) return;
    const text = mockupEditor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    wordCountEl.textContent = `${words} words`;
    charCountEl.textContent = `${chars} chars`;
  }

  if (mockupEditor) {
    mockupEditor.addEventListener('input', () => {
      updateCounters();
      wakeFromIdle();
    });
    updateCounters();
  }

  // 3. Font Size Scaling (A- / A+)
  if (fontDecBtn && mockupEditor) {
    fontDecBtn.addEventListener('click', () => {
      if (currentFontSize > 11) {
        currentFontSize -= 1;
        mockupEditor.style.fontSize = `${currentFontSize}px`;
        showToast(`Font size: ${currentFontSize}px`);
      }
    });
  }

  if (fontIncBtn && mockupEditor) {
    fontIncBtn.addEventListener('click', () => {
      if (currentFontSize < 22) {
        currentFontSize += 1;
        mockupEditor.style.fontSize = `${currentFontSize}px`;
        showToast(`Font size: ${currentFontSize}px`);
      }
    });
  }

  // 4. Copy Note to Clipboard with Toast
  if (copyBtn && mockupEditor) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = mockupEditor.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('📋 Copied formatted note to clipboard!');
      }).catch(() => {
        showToast('📋 Note content ready!');
      });
    });
  }

  // 5. Clear with 6-Second Undo Toast
  if (clearBtn && mockupEditor && undoBanner) {
    clearBtn.addEventListener('click', () => {
      cachedEditorHtml = mockupEditor.innerHTML;
      mockupEditor.innerHTML = '<p style="color:#71717A;"><em>Note cleared. Click Undo below to restore.</em></p>';
      updateCounters();

      undoBanner.classList.add('active');
      clearTimeout(undoTimeout);
      undoTimeout = setTimeout(() => {
        undoBanner.classList.remove('active');
      }, 6000);
    });
  }

  if (undoActionBtn && mockupEditor && undoBanner) {
    undoActionBtn.addEventListener('click', () => {
      if (cachedEditorHtml) {
        mockupEditor.innerHTML = cachedEditorHtml;
        updateCounters();
        undoBanner.classList.remove('active');
        clearTimeout(undoTimeout);
        showToast('↺ Restored note content!');
      }
    });
  }

  // 6. Demo Theme Switcher inside Mockup
  if (demoThemeToggle && mockup) {
    demoThemeToggle.addEventListener('click', () => {
      const currentMockTheme = mockup.getAttribute('data-mockup-theme') || 'dark';
      const newMockTheme = currentMockTheme === 'dark' ? 'light' : 'dark';
      mockup.setAttribute('data-mockup-theme', newMockTheme);
      demoThemeToggle.classList.toggle('active', newMockTheme === 'light');
      demoThemeToggle.textContent = newMockTheme === 'light' ? 'Theme: Light' : 'Theme: Dark';
    });
  }

  // 7. Auto-Transparency Simulation
  function wakeFromIdle() {
    if (isTransparencyActive && mockup) {
      mockup.style.opacity = '1.0';
      if (simIdleStatus) simIdleStatus.textContent = 'Active (100% Opacity)';
      resetIdleTimer();
    }
  }

  function triggerIdleFade() {
    if (isTransparencyActive && mockup) {
      mockup.style.opacity = '0.45';
      if (simIdleStatus) simIdleStatus.textContent = 'Idle (45% Auto-Transparency)';
    }
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (isTransparencyActive) {
      idleTimer = setTimeout(triggerIdleFade, 2500); // Quick 2.5s simulation for demo
    }
  }

  if (simTransparencyBtn && mockup) {
    simTransparencyBtn.addEventListener('click', () => {
      isTransparencyActive = !isTransparencyActive;
      simTransparencyBtn.classList.toggle('active', isTransparencyActive);

      if (isTransparencyActive) {
        simTransparencyBtn.textContent = 'Auto-Fade: ON (Simulating)';
        showToast('👻 Auto-Transparency enabled! Move your mouse away to see it fade.');
        resetIdleTimer();
      } else {
        simTransparencyBtn.textContent = 'Auto-Fade: OFF';
        mockup.style.opacity = '1.0';
        clearTimeout(idleTimer);
        if (simIdleStatus) simIdleStatus.textContent = 'Active (100% Opacity)';
        showToast('Auto-Transparency simulation stopped.');
      }
    });

    // Detect mouse motion inside the demo area to simulate waking up
    const demoWrapper = document.querySelector('.demo-wrapper');
    if (demoWrapper) {
      demoWrapper.addEventListener('mousemove', wakeFromIdle);
      demoWrapper.addEventListener('mouseenter', wakeFromIdle);
      demoWrapper.addEventListener('mouseleave', () => {
        if (isTransparencyActive) {
          triggerIdleFade();
        }
      });
    }
  }
}

/* ==========================================================================
   4. FAQ Accordion Logic with ARIA Accessibility
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const currentItem = trigger.closest('.faq-item');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all items
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.classList.remove('active');
        item.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });

      // If clicked item was not expanded, open it
      if (!isExpanded) {
        currentItem.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   5. Copy SHA256 Checksum Helper
   ========================================================================== */
function initCopyChecksum() {
  const copyHashBtns = document.querySelectorAll('.btn-copy-hash');
  copyHashBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const hashText = btn.getAttribute('data-hash') || '';
      if (hashText) {
        navigator.clipboard.writeText(hashText).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '✓ Copied Hash';
          showToast('🔒 Checksum copied to clipboard!');
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2500);
        });
      }
    });
  });
}

/* ==========================================================================
   6. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close when clicking nav link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

/* ==========================================================================
   7. Toast Notification Utility
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
