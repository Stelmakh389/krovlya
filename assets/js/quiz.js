(function () {
  const quiz = document.querySelector('[data-quiz]');

  if (!quiz) {
    return;
  }

  const steps = Array.from(quiz.querySelectorAll('[data-quiz-step]'));
  const progress = quiz.querySelector('[data-quiz-progress]');
  const progressText = quiz.querySelector('[data-quiz-progress-text]');
  const prevButton = quiz.querySelector('[data-quiz-prev]');
  const nextButton = quiz.querySelector('[data-quiz-next]');
  const form = quiz.querySelector('[data-quiz-form]');
  const phoneInput = quiz.querySelector('[data-quiz-phone]');
  const success = quiz.querySelector('[data-quiz-success]');
  let currentStep = 0;

  const updateProgress = () => {
    const percent = Math.round(((currentStep + 1) / steps.length) * 100);

    progress.style.width = `${percent}%`;
    progressText.textContent = currentStep === steps.length - 1
      ? 'Расчет пройден на 100%'
      : `Расчет пройден на ${percent}%`;
  };

  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));

    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === currentStep;

      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    });

    prevButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    updateProgress();
  };

  const markSelected = (option) => {
    const step = option.closest('[data-quiz-step]');

    step.querySelectorAll('[data-quiz-option]').forEach((item) => {
      item.classList.toggle('is-selected', item === option);
    });
  };

  const canGoNext = () => {
    const step = steps[currentStep];
    const requiredInput = step.querySelector('[data-quiz-required]');
    const skipInput = step.querySelector('[data-quiz-skip]');

    if (!requiredInput || (skipInput && skipInput.checked)) {
      return true;
    }

    const isValid = requiredInput.value.trim().length > 0;
    requiredInput.classList.toggle('is-invalid', !isValid);

    if (!isValid) {
      requiredInput.focus();
    }

    return isValid;
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
    const normalized = digits.startsWith('7') ? digits : `7${digits}`;
    const parts = [
      normalized.slice(1, 4),
      normalized.slice(4, 7),
      normalized.slice(7, 9),
      normalized.slice(9, 11),
    ];

    let result = '+7';

    if (parts[0]) {
      result += ` (${parts[0]}`;
    }

    if (parts[0].length === 3) {
      result += ')';
    }

    if (parts[1]) {
      result += ` ${parts[1]}`;
    }

    if (parts[2]) {
      result += `-${parts[2]}`;
    }

    if (parts[3]) {
      result += `-${parts[3]}`;
    }

    return result;
  };

  quiz.addEventListener('click', (event) => {
    const option = event.target.closest('[data-quiz-option]');

    if (option && quiz.contains(option)) {
      markSelected(option);
    }
  });

  prevButton.addEventListener('click', () => {
    showStep(currentStep - 1);
  });

  nextButton.addEventListener('click', () => {
    if (canGoNext()) {
      showStep(currentStep + 1);
    }
  });

  quiz.addEventListener('input', (event) => {
    if (event.target.matches('[data-quiz-required]')) {
      event.target.classList.remove('is-invalid');
    }
  });

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = formatPhone(phoneInput.value);
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      success.hidden = false;
      form.querySelector('[type="submit"]').disabled = true;
    });
  }

  showStep(0);
}());
