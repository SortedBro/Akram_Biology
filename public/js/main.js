document.querySelectorAll('.js-confirm').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const msg = btn.dataset.confirm || 'Are you sure?';
    const ok = window.confirm(msg);
    if (!ok) {
      event.preventDefault();
    }
  });
});

window.setTimeout(() => {
  document.querySelectorAll('.alert').forEach((alert) => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.4s ease';
    window.setTimeout(() => {
      alert.remove();
    }, 420);
  });
}, 3800);
