(function () {
  'use strict';

  const form = document.getElementById('customerForm');
  const formCard = document.getElementById('formCard');
  const stampCard = document.getElementById('stampCard');
  const submitBtn = document.getElementById('submitBtn');
  const formBanner = document.getElementById('formBanner');

  function clearFieldErrors() {
    document.querySelectorAll('.field.error').forEach((el) => el.classList.remove('error'));
  }

  function showBanner(messages) {
    formBanner.innerHTML =
      '<strong>We couldn\'t submit your details:</strong><ul>' +
      messages.map((m) => `<li>${escapeHtml(m)}</li>`).join('') +
      '</ul>';
    formBanner.classList.add('show');
  }

  function hideBanner() {
    formBanner.classList.remove('show');
    formBanner.innerHTML = '';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Maps a validation error message back to the relevant field for
  // inline highlighting, based on keywords the backend uses.
  const FIELD_KEYWORDS = [
    ['fullName', /full name/i],
    ['phoneNumber', /phone number/i],
    ['email', /email/i],
    ['dateOfBirth', /date of birth/i],
    ['address', /address/i],
    ['governmentId', /government id/i],
    ['accountType', /account type/i],
  ];

  function highlightFields(messages) {
    messages.forEach((msg) => {
      const match = FIELD_KEYWORDS.find(([, re]) => re.test(msg));
      if (match) {
        const wrapper = document.querySelector(`[data-field="${match[0]}"]`);
        if (wrapper) wrapper.classList.add('error');
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideBanner();
    clearFieldErrors();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        const errors = data.errors && data.errors.length ? data.errors : ['Something went wrong. Please try again.'];
        showBanner(errors);
        highlightFields(errors);
        return;
      }

      renderConfirmation(data.customer);
    } catch (err) {
      showBanner(['Could not reach the server. Please check your connection and try again.']);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit & generate customer ID';
    }
  });

  function renderConfirmation(customer) {
    document.getElementById('outCustomerId').textContent = customer.customerId;
    document.getElementById('outFullName').textContent = customer.fullName;
    document.getElementById('outAccountType').textContent = customer.accountType;

    const created = new Date(customer.createdAt.replace(' ', 'T') + 'Z');
    document.getElementById('outCreatedAt').textContent = Number.isNaN(created.getTime())
      ? customer.createdAt
      : created.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    formCard.hidden = true;
    stampCard.hidden = false;
    stampCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const copyBtn = document.getElementById('copyIdBtn');
  const copyToast = document.getElementById('copyToast');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const id = document.getElementById('outCustomerId').textContent;
      try {
        await navigator.clipboard.writeText(id);
        copyToast.classList.add('show');
        setTimeout(() => copyToast.classList.remove('show'), 1800);
      } catch (err) {
        // Clipboard API may be unavailable (e.g. non-HTTPS); fail silently.
      }
    });
  }
})();
