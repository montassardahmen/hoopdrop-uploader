const fileInput = document.getElementById('fileInput');
const cameraInput = document.getElementById('cameraInput');
const browseButton = document.getElementById('browseButton');
const cameraButton = document.getElementById('cameraButton');
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const emptyState = document.getElementById('emptyState');
const uploadCount = document.getElementById('uploadCount');
const fileSummary = document.getElementById('fileSummary');
const clearButton = document.getElementById('clearButton');
const ball = document.getElementById('ball');
const successBadge = document.getElementById('successBadge');
const toast = document.getElementById('toast');

let files = [];
let toastTimer;

browseButton.addEventListener('click', () => fileInput.click());
cameraButton.addEventListener('click', () => cameraInput.click());
fileInput.addEventListener('change', event => addFiles(event.target.files));
cameraInput.addEventListener('change', event => addFiles(event.target.files));
clearButton.addEventListener('click', () => {
  files = [];
  renderFiles();
  showToast('All files cleared.');
});

['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.add('dragover');
}));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault();
  if (type === 'drop') addFiles(event.dataTransfer.files);
  dropZone.classList.remove('dragover');
}));
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

function addFiles(fileCollection) {
  const incoming = Array.from(fileCollection || []);
  if (!incoming.length) return;
  let added = 0;
  incoming.forEach(file => {
    const duplicate = files.some(item => item.name === file.name && item.size === file.size);
    if (!duplicate) {
      files.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, file });
      added++;
    }
  });
  renderFiles();
  if (added > 0) shoot();
  showToast(added ? `${added} file${added > 1 ? 's' : ''} landed. Nice shot!` : 'Those files are already in your list.');
  fileInput.value = '';
  cameraInput.value = '';
}

function renderFiles() {
  fileList.innerHTML = '';
  uploadCount.textContent = files.length;
  fileSummary.textContent = files.length
    ? `${files.length} file${files.length > 1 ? 's' : ''} ready`
    : 'Nothing uploaded yet';
  clearButton.disabled = files.length === 0;
  if (!files.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<span class="empty-icon">＋</span><span>Your files will appear here</span>';
    fileList.appendChild(empty);
    return;
  }
  files.forEach(({ id, file }) => {
    const item = document.createElement('article');
    item.className = 'file-item';
    const type = file.name.includes('.') ? file.name.split('.').pop().slice(0, 4).toUpperCase() : 'FILE';
    item.innerHTML = `
      <div class="file-type">${escapeHTML(type)}</div>
      <div class="file-info">
        <div class="file-name" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</div>
        <div class="file-size">${formatSize(file.size)}</div>
      </div>
      <button class="remove-file" type="button" aria-label="Remove ${escapeHTML(file.name)}">×</button>`;
    item.querySelector('button').addEventListener('click', () => {
      files = files.filter(entry => entry.id !== id);
      renderFiles();
    });
    fileList.appendChild(item);
  });
}

function shoot() {
  dropZone.classList.remove('shooting');
  successBadge.classList.remove('show');
  void dropZone.offsetWidth;
  dropZone.classList.add('shooting');
  setTimeout(() => {
    dropZone.classList.remove('shooting');
    successBadge.classList.add('show');
  }, 900);
  setTimeout(() => successBadge.classList.remove('show'), 2600);
}

function formatSize(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
