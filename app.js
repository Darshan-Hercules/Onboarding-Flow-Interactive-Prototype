/* -------------------------------------------------------------
   Aether AI Onboarding Prototype & Dev Mode Logic
   ------------------------------------------------------------- */

// --- Global Application State ---
let currentScreen = 1;
let currentMode = 'prototype'; // 'prototype' | 'inspect'
let selectedInterests = new Set();
let permissionState = {
  notify: true,
  camera: false,
  location: false
};

// --- SVG Raw Database (For Asset Exporter Copying) ---
const svgAssets = {
  'assets/welcome_img.svg': `<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coreGrad" x1="60" y1="60" x2="260" y2="260" ...>
    ...
  </defs>
  <!-- Interactive glowing AI core welcome vector representation -->
  <circle cx="160" cy="160" r="50" fill="url(#coreGrad)" />
</svg>`,
  'assets/success_img.svg': `<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="successGrad" x1="80" y1="80" x2="240" y2="240" ...>
  </defs>
  <!-- Celebrate check shield vector representation -->
  <polygon points="160,75 233,117 233,202 160,245 87,202 87,117" fill="#1E1B4B" stroke="url(#successGrad)" stroke-width="2.5" />
  <path d="M125 160 L148 183 L198 133" stroke="#ffffff" stroke-width="2" />
</svg>`,
  'assets/icon_bell.svg': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="url(#bellGrad)" />
  <path d="M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="url(#bellGrad)" />
  <circle cx="18" cy="6" r="3.5" fill="#EF4444" stroke="#1E1B4B" stroke-width="1" />
</svg>`,
  'assets/icon_camera.svg': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z" fill="url(#camGrad)" />
</svg>`,
  'assets/icon_location.svg': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="url(#locGrad)" />
</svg>`,
  'assets/icon_google.svg': `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
</svg>`,
  'assets/icon_apple.svg': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.48C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5ZM15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C15.85 1.04 14.51 1.73 13.73 2.64C13.07 3.41 12.49 4.52 12.64 5.78C13.87 5.87 15.12 5.17 15.97 4.17Z" fill="currentColor"/>
</svg>`,
  'assets/icon_email.svg': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="url(#emailGrad)" />
</svg>`
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Sync status bar clock in real-time
  updateClock();
  setInterval(updateClock, 30000);

  // Set initial screen
  navigateToScreen(1);
  
  // Set up event listeners for Inspector Mode
  setupInspectListeners();
});

// Update the simulated iPhone clock
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('status-time').innerText = `${hours}:${minutes}`;
}

// --- SIMULATOR NAVIGATION CONTROLLERS ---
function navigateToScreen(screenNum) {
  if (currentMode === 'inspect') {
    // Clear inspector states on screen switch
    clearInspectSelection();
  }

  // Deactivate all screens
  const screens = document.querySelectorAll('.screen-slide');
  screens.forEach(s => s.classList.remove('active'));

  // Activate target screen
  const targetScreen = document.getElementById(`screen-${screenNum}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    currentScreen = screenNum;
  }

  // Update design handoff references based on active screen
  updateJumpButtonsActiveState(screenNum);
}

function updateJumpButtonsActiveState(screenNum) {
  const jumpContainer = document.querySelector('.jump-buttons');
  if (jumpContainer) {
    const buttons = jumpContainer.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
      if (idx + 1 === screenNum) {
        btn.style.background = '#3B82F6';
        btn.style.color = '#FFFFFF';
      } else {
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.color = 'var(--text-medium)';
      }
    });
  }
}

function resetPrototype() {
  // Reset local interactive values
  selectedInterests.clear();
  permissionState = { notify: true, camera: false, location: false };

  // Reset toggles visual
  document.getElementById('chk-perm-notify').checked = true;
  document.getElementById('chk-perm-camera').checked = false;
  document.getElementById('chk-perm-location').checked = false;
  
  document.getElementById('card-perm-notify').classList.add('active-border');
  document.getElementById('card-perm-camera').classList.remove('active-border');
  document.getElementById('card-perm-location').classList.remove('active-border');

  // Reset chips visual
  const chips = document.querySelectorAll('.interest-chip');
  chips.forEach(c => c.classList.remove('active'));
  
  // Disable continue button on Screen 3
  const continueBtn = document.getElementById('btn-personal-continue');
  continueBtn.classList.add('disabled');
  continueBtn.disabled = true;
  document.getElementById('interest-reminder').style.display = 'block';

  // Collapse email login card
  const emailContainer = document.getElementById('email-form-container');
  emailContainer.classList.remove('expanded');
  document.getElementById('txt-input-email').value = '';
  document.getElementById('btn-submit-email').classList.add('disabled');
  document.getElementById('btn-submit-email').disabled = true;

  // Jump to screen 1
  navigateToScreen(1);
  showToast('🔄 Prototype states reset.');
}

// --- SCREEN 2: PERMISSIONS ---
function togglePermission(type) {
  const checkbox = document.getElementById(`chk-perm-${type}`);
  const card = document.getElementById(`card-perm-${type}`);
  
  if (checkbox && card) {
    checkbox.checked = !checkbox.checked;
    permissionState[type] = checkbox.checked;
    
    if (checkbox.checked) {
      card.classList.add('active-border');
    } else {
      card.classList.remove('active-border');
    }
  }
}

function handlePermissionAllow() {
  showToast('✓ Permissions updated');
  navigateToScreen(3);
}

function handlePermissionNotNow() {
  const overlay = document.getElementById('perm-reminder-overlay');
  overlay.classList.add('active');
}

function hidePermReminder() {
  const overlay = document.getElementById('perm-reminder-overlay');
  overlay.classList.remove('active');
}

function confirmSkipPermissions() {
  hidePermReminder();
  
  // Turn off all switches visually
  permissionState = { notify: false, camera: false, location: false };
  document.getElementById('chk-perm-notify').checked = false;
  document.getElementById('chk-perm-camera').checked = false;
  document.getElementById('chk-perm-location').checked = false;
  document.getElementById('card-perm-notify').classList.remove('active-border');
  document.getElementById('card-perm-camera').classList.remove('active-border');
  document.getElementById('card-perm-location').classList.remove('active-border');
  
  showToast('⚠ Skipped context setup');
  navigateToScreen(3);
}

// --- SCREEN 3: PERSONALIZATION ---
function toggleInterest(interestId) {
  const chip = document.getElementById(`chip-${interestId}`);
  if (chip) {
    if (selectedInterests.has(interestId)) {
      selectedInterests.delete(interestId);
      chip.classList.remove('active');
    } else {
      selectedInterests.add(interestId);
      chip.classList.add('active');
    }
    
    // Validate if continue button should be enabled
    const continueBtn = document.getElementById('btn-personal-continue');
    const reminder = document.getElementById('interest-reminder');
    
    if (selectedInterests.size > 0) {
      continueBtn.classList.remove('disabled');
      continueBtn.disabled = false;
      reminder.style.opacity = '0';
      setTimeout(() => { reminder.style.display = 'none'; }, 200);
    } else {
      continueBtn.classList.add('disabled');
      continueBtn.disabled = true;
      reminder.style.display = 'block';
      setTimeout(() => { reminder.style.opacity = '1'; }, 10);
    }
  }
}

function handlePersonalizationContinue() {
  navigateToScreen(4);
}

// --- SCREEN 4: ACCOUNT SETUP ---
function expandEmailInput() {
  const emailContainer = document.getElementById('email-form-container');
  emailContainer.classList.add('expanded');
  document.getElementById('txt-input-email').focus();
}

function validateEmail() {
  const emailVal = document.getElementById('txt-input-email').value;
  const submitBtn = document.getElementById('btn-submit-email');
  
  // Basic email pattern check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailPattern.test(emailVal)) {
    submitBtn.classList.remove('disabled');
    submitBtn.disabled = false;
  } else {
    submitBtn.classList.add('disabled');
    submitBtn.disabled = true;
  }
}

function triggerMockLogin(provider) {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  
  // Set loading text dynamically
  loadingText.innerText = `Connecting with ${provider}...`;
  overlay.classList.add('active');
  
  // Simulate OAuth delay
  setTimeout(() => {
    overlay.classList.remove('active');
    navigateToScreen(5);
  }, 1600);
}

// --- SCREEN 5: SUCCESS ---
function handleFinishOnboarding() {
  // Fire confetti!
  startConfetti();
  showToast('🎉 Onboarding Complete! Welcome to Aether.');
}

// --- GENERAL UTILITIES & TABS SWITCHER ---
function switchMainMode(mode) {
  currentMode = mode;
  const btnProto = document.getElementById('btn-proto-mode');
  const btnInspect = document.getElementById('btn-inspect-mode');
  const deviceFrame = document.getElementById('device-frame');

  if (mode === 'prototype') {
    btnProto.classList.add('active');
    btnInspect.classList.remove('active');
    deviceFrame.classList.remove('dev-mode-active');
    
    // Clear inspector HUD
    document.getElementById('inspector-overlay-box').style.display = 'none';
    clearInspectSelection();
    
    // Switch back to handoff tab on prototype activation
    switchRightTab('handoff');
  } else {
    btnProto.classList.remove('active');
    btnInspect.classList.add('active');
    deviceFrame.classList.add('dev-mode-active');
    
    // Auto shift to element inspector tab
    switchRightTab('inspector');
    showToast('🔍 Dev Mode active. Click elements in device to inspect.');
  }
}

function switchRightTab(tabId) {
  // Update nav tabs visual
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  const targetTab = document.getElementById(`tab-btn-${tabId}`);
  if (targetTab) targetTab.classList.add('active');

  // Update panes visual
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(p => p.classList.remove('active'));
  
  const targetPane = document.getElementById(`pane-${tabId}`);
  if (targetPane) targetPane.classList.add('active');
}

// Custom Toast System
function showToast(text) {
  // Remove existing toast if alive
  const oldToast = document.querySelector('.toast-msg');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<span>⚡</span> ${text}`;
  
  // Append to panel
  document.querySelector('.simulator-panel').appendChild(toast);
  
  // Animate show
  setTimeout(() => { toast.classList.add('show'); }, 50);
  
  // Close toast automatically
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.remove(); }, 300);
  }, 2500);
}

// Copy simple text helper
function copyText(str) {
  navigator.clipboard.writeText(str).then(() => {
    showToast(`Copied: ${str}`);
  });
}

// Copy SVG raw assets
function copyAssetCode(assetPath) {
  const code = svgAssets[assetPath];
  if (code) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`✓ SVG code for ${assetPath.split('/').pop()} copied!`);
    });
  } else {
    showToast('Failed to find asset code.');
  }
}

// --- CODES INSPECT MODE CONTROLLER ---
let inspectedElement = null;

function setupInspectListeners() {
  const device = document.getElementById('device-frame');
  const hudBox = document.getElementById('inspector-overlay-box');
  const hudName = document.getElementById('hud-element-name');
  const hudDims = document.getElementById('hud-dimensions-label');

  device.addEventListener('mouseover', (e) => {
    if (currentMode !== 'inspect') return;
    
    const target = e.target.closest('.hover-inspectable');
    if (!target) return;
    
    // Highlight overlay
    const rect = target.getBoundingClientRect();
    const parentRect = device.getBoundingClientRect();
    
    // Calc relative offsets
    const top = rect.top - parentRect.top;
    const left = rect.left - parentRect.left;
    
    hudBox.style.top = `${rect.top + window.scrollY}px`;
    hudBox.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
    hudBox.style.display = 'flex';
    
    hudName.innerText = getElementTagLabel(target);
    hudDims.innerText = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;
  });

  device.addEventListener('mouseout', (e) => {
    if (currentMode !== 'inspect') return;
    hudBox.style.display = 'none';
  });

  device.addEventListener('click', (e) => {
    if (currentMode !== 'inspect') return;
    
    const target = e.target.closest('.hover-inspectable');
    if (!target) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Clear old selection
    clearInspectSelection();
    
    // Set selection
    inspectedElement = target;
    target.classList.add('inspect-selected');
    
    // Fill values in Elements tab
    populateElementInspector(target);
    hudBox.style.display = 'none';
  });
}

function clearInspectSelection() {
  const selected = document.querySelectorAll('.inspect-selected');
  selected.forEach(el => el.classList.remove('inspect-selected'));
  inspectedElement = null;
  
  // Hide panel elements
  document.getElementById('inspector-content').classList.add('inspector-inactive');
  document.getElementById('inspector-instruction').style.display = 'block';
}

function getElementTagLabel(el) {
  let label = el.tagName.toLowerCase();
  if (el.id) {
    label += `#${el.id}`;
  } else if (el.className) {
    // Grab first class
    const firstClass = el.className.split(' ').filter(c => c !== 'hover-inspectable' && c !== 'inspect-selected')[0];
    if (firstClass) label += `.${firstClass}`;
  }
  return label;
}

// Convert CSS structures to Figma Auto Layout metrics
function populateElementInspector(el) {
  document.getElementById('inspector-instruction').style.display = 'none';
  document.getElementById('inspector-content').classList.remove('inspector-inactive');
  
  const tagLabel = getElementTagLabel(el);
  const rect = el.getBoundingClientRect();
  const compStyles = window.getComputedStyle(el);
  
  // Basic Node tag and sizes
  document.getElementById('ins-tag-name').innerText = tagLabel;
  document.getElementById('ins-dimensions').innerText = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;

  // Read paddings
  const pTop = compStyles.paddingTop;
  const pRight = compStyles.paddingRight;
  const pBottom = compStyles.paddingBottom;
  const pLeft = compStyles.paddingLeft;
  
  document.getElementById('ins-pad-top').innerText = pTop;
  document.getElementById('ins-pad-right').innerText = pRight;
  document.getElementById('ins-pad-bottom').innerText = pBottom;
  document.getElementById('ins-pad-left').innerText = pLeft;

  // Read gap
  const gap = compStyles.gap;
  document.getElementById('ins-gap').innerText = (gap && gap !== 'normal') ? `${gap} gap` : '0px gap';

  // Read Auto Layout specs (Figma maps directly to Flex layout)
  const isFlex = compStyles.display === 'flex' || compStyles.display === 'inline-flex';
  
  document.getElementById('ins-direction').innerText = isFlex 
    ? (compStyles.flexDirection === 'column' ? 'Vertical' : 'Horizontal') 
    : 'None (Absolute)';
    
  document.getElementById('ins-align').innerText = isFlex 
    ? (compStyles.alignItems || 'Stretch') 
    : 'N/A';

  // Width specs
  let widthSpec = 'Fixed width';
  if (compStyles.width.includes('%') || compStyles.width === '100%' || el.style.width === '100%') {
    widthSpec = 'Fill container';
  } else if (compStyles.width === 'auto' || compStyles.width === 'max-content' || compStyles.display.includes('inline')) {
    widthSpec = 'Hug contents';
  }
  document.getElementById('ins-width').innerText = widthSpec;

  // Height specs
  let heightSpec = 'Fixed height';
  if (compStyles.height === 'auto' || compStyles.height === 'fit-content' || compStyles.height.includes('px')) {
    // If it's a wrapper, it usually hugs contents
    if (el.children.length > 0) {
      heightSpec = 'Hug contents';
    }
  }
  document.getElementById('ins-height').innerText = heightSpec;

  // Pretty Clean CSS snippet
  const cleanCSS = generateCleanCSS(el, compStyles);
  document.getElementById('ins-css-code').innerText = cleanCSS;

  // Pretty Clean HTML snippet
  const cleanHTML = generateCleanHTML(el);
  document.getElementById('ins-html-code').innerText = cleanHTML;
}

function generateCleanCSS(el, computed) {
  let selector = `.${el.className.split(' ').filter(c => c !== 'hover-inspectable' && c !== 'inspect-selected')[0] || el.tagName.toLowerCase()}`;
  
  // Extract key CSS properties that matter for handoff
  let cssRules = [];
  
  if (computed.display === 'flex') {
    cssRules.push(`  display: flex;`);
    cssRules.push(`  flex-direction: ${computed.flexDirection};`);
    cssRules.push(`  align-items: ${computed.alignItems};`);
    if (computed.justifyContent !== 'normal') cssRules.push(`  justify-content: ${computed.justifyContent};`);
    if (computed.gap !== 'normal' && computed.gap !== '0px') cssRules.push(`  gap: ${computed.gap};`);
  }
  
  // Padding
  if (computed.padding !== '0px') {
    cssRules.push(`  padding: ${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft};`);
  }
  
  // Borders
  if (computed.borderRadius !== '0px') {
    cssRules.push(`  border-radius: ${computed.borderRadius};`);
  }
  
  // Backgrounds / Borders
  if (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
    cssRules.push(`  background-color: ${computed.backgroundColor};`);
  }
  
  // Gradients
  if (computed.backgroundImage && computed.backgroundImage !== 'none') {
    cssRules.push(`  background: ${computed.backgroundImage};`);
  }
  
  // Text Styles
  if (el.children.length === 0 || el.tagName.match(/H[1-6]|P|SPAN|BUTTON/i)) {
    cssRules.push(`  font-family: ${computed.fontFamily.split(',')[0]};`);
    cssRules.push(`  font-size: ${computed.fontSize};`);
    cssRules.push(`  font-weight: ${computed.fontWeight};`);
    cssRules.push(`  color: ${computed.color};`);
  }

  return `${selector} {\n${cssRules.join('\n')}\n}`;
}

function generateCleanHTML(el) {
  // Return a formatted, simplified element skeleton
  const clone = el.cloneNode(false);
  clone.classList.remove('hover-inspectable', 'inspect-selected');
  
  let openingTag = clone.outerHTML;
  // If element has inner text and no children, include text in preview
  if (el.children.length === 0 && el.innerText.trim()) {
    return `${openingTag.replace('></', `>${el.innerText.trim()}</`)}`;
  }
  
  return `${openingTag.replace('></', '>\n  ...\n</')}`;
}

function copyCSS() {
  const code = document.getElementById('ins-css-code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    showToast('✓ CSS copied to clipboard');
  });
}

function copyHTML() {
  const code = document.getElementById('ins-html-code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    showToast('✓ HTML copied to clipboard');
  });
}

// --- HIGH-FIDELITY CANVAS CONFETTI ENGINE ---
function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  
  // Resize canvas to cover window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  const particles = [];
  
  // Create particles
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 50,
      y: canvas.height + 20,
      radius: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 15 - 12,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }
  
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let active = false;
    
    particles.forEach(p => {
      if (p.opacity <= 0) return;
      
      active = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // Gravity
      p.vx *= 0.98; // Friction
      p.rotation += p.rotationSpeed;
      
      // Fade out near the bottom or after peaks
      if (p.vy > 2) {
        p.opacity -= 0.015;
      }
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      
      // Draw rectangular confetti piece
      ctx.fillRect(-p.radius, -p.radius * 1.5, p.radius * 2, p.radius * 3);
      
      ctx.restore();
    });
    
    if (active) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  update();
}
