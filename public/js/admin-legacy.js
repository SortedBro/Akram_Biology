(function initAdminLegacy() {
  const main = document.getElementById('adminMain');
  if (!main) return;

  const activeTab = main.dataset.activeTab || 'dashboard';
  const tabButtons = Array.from(document.querySelectorAll('[data-tab-btn]'));
  const tabs = Array.from(document.querySelectorAll('.a-tab'));

  function showTab(tabName) {
    tabs.forEach((tab) => {
      const isMatch = tab.id === `tab-${tabName}`;
      tab.style.display = isMatch ? 'block' : 'none';
      tab.classList.toggle('active', isMatch);
    });
    tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tabBtn === tabName);
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showTab(btn.dataset.tabBtn);
    });
  });

  function setFormAction(formId, basePath, id) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.action = id ? `${basePath}/${id}?_method=PATCH` : basePath;
  }

  window.openModal = function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  };

  window.closeModal = function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  };

  window.openStudModal = function openStudModal() {
    const title = document.getElementById('studModalTitle');
    if (title) title.textContent = 'Add Student';

    setFormAction('studForm', '/admin/students');
    const ids = ['s-name', 's-guardian', 's-class', 's-phone', 's-address', 's-status', 's-board', 's-whatsapp', 's-email'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 's-status') el.value = 'active';
      else el.value = '';
    });
    openModal('studModal');
  };

  document.querySelectorAll('.js-edit-student').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = document.getElementById('studModalTitle');
      if (title) title.textContent = 'Edit Student';

      setFormAction('studForm', '/admin/students', btn.dataset.id);
      const values = {
        's-name': btn.dataset.fullName,
        's-guardian': btn.dataset.guardianName,
        's-class': btn.dataset.classLevel,
        's-phone': btn.dataset.phone,
        's-address': btn.dataset.address,
        's-status': btn.dataset.status,
        's-board': btn.dataset.board,
        's-whatsapp': btn.dataset.whatsapp,
        's-email': btn.dataset.email
      };
      Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
      });
      openModal('studModal');
    });
  });

  window.openBatchModal = function openBatchModal() {
    setFormAction('batchForm', '/admin/batches');
    const ids = ['b-name', 'b-class', 'b-time', 'b-days', 'b-capacity', 'b-status'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === 'b-capacity') el.value = '20';
      else if (id === 'b-status') el.value = 'active';
      else el.value = '';
    });
    openModal('batchModal');
  };

  document.querySelectorAll('.js-edit-batch').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFormAction('batchForm', '/admin/batches', btn.dataset.id);
      const values = {
        'b-name': btn.dataset.name,
        'b-class': btn.dataset.classLevel,
        'b-time': btn.dataset.timing,
        'b-days': btn.dataset.days,
        'b-capacity': btn.dataset.capacity,
        'b-status': btn.dataset.status
      };
      Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
      });
      openModal('batchModal');
    });
  });

  window.openFeeModal = function openFeeModal() {
    setFormAction('feeForm', '/admin/fees');
    const values = {
      'f-student': '',
      'f-month': '',
      'f-amount': '',
      'f-status': 'paid',
      'f-note': ''
    };
    Object.entries(values).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });
    openModal('feeModal');
  };

  document.querySelectorAll('.js-edit-fee').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFormAction('feeForm', '/admin/fees', btn.dataset.id);
      const values = {
        'f-student': btn.dataset.student,
        'f-month': btn.dataset.month,
        'f-amount': btn.dataset.amount,
        'f-status': btn.dataset.status,
        'f-note': btn.dataset.note
      };
      Object.entries(values).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
      });
      openModal('feeModal');
    });
  });

  document.querySelectorAll('.modal-bg').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.classList.remove('open');
    });
  });

  const studentSearch = document.getElementById('studentSearch');
  if (studentSearch) {
    studentSearch.addEventListener('input', () => {
      const query = studentSearch.value.trim().toLowerCase();
      document.querySelectorAll('#studTbody tr[data-student-row]').forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  const feeSearch = document.getElementById('feeSearch');
  if (feeSearch) {
    feeSearch.addEventListener('input', () => {
      const query = feeSearch.value.trim().toLowerCase();
      document.querySelectorAll('#feeTbody tr[data-fee-row]').forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  showTab(activeTab);
})();
