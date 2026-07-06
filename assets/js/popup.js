(function () {
  const popup = document.querySelector('[data-popup="consultation"]');
  if (!popup) return;

  const openButtons = document.querySelectorAll('[data-popup-open="consultation"]');
  const closeButtons = popup.querySelectorAll('[data-popup-close]');
  const firstInput = popup.querySelector('input[name="name"]');
  const phoneInput = popup.querySelector('input[name="phone"]');

  function openPopup(event) {
    if (event) event.preventDefault();
    popup.hidden = false;
    document.body.classList.add('popup-open');
    window.setTimeout(() => firstInput?.focus(), 0);
  }

  function closePopup() {
    popup.hidden = true;
    document.body.classList.remove('popup-open');
  }

  openButtons.forEach((button) => button.addEventListener('click', openPopup));
  closeButtons.forEach((button) => button.addEventListener('click', closePopup));

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').replace(/^8/, '7').replace(/^7/, '').slice(0, 10);
    let result = '+7';

    if (digits.length > 0) result += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) result += ')';
    if (digits.length > 3) result += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) result += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) result += `-${digits.slice(8, 10)}`;

    return result;
  }

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  phoneInput?.addEventListener('focus', () => {
    if (!phoneInput.value) phoneInput.value = '+7';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !popup.hidden) {
      closePopup();
    }
  });
})();
