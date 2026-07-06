(function () {
  const root = document.querySelector('[data-projects]');

  if (!root) {
    return;
  }

  const tabs = Array.from(root.querySelectorAll('[data-project-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-project-panel]'));

  const updateSlider = (slider, index) => {
    const slides = Array.from(slider.querySelectorAll('.project-slider__slide'));
    const counter = slider.querySelector('[data-project-counter]');
    const nextIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === nextIndex);
    });

    slider.dataset.slide = String(nextIndex);

    if (counter) {
      counter.textContent = `${nextIndex + 1} / ${slides.length}`;
    }
  };

  const showProject = (index) => {
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;

      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;

      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      showProject(Number(tab.dataset.projectTab));
    });
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project-prev], [data-project-next]');

    if (!button || !root.contains(button)) {
      return;
    }

    const slider = button.closest('[data-project-slider]');
    const currentIndex = Number(slider.dataset.slide || 0);
    const direction = button.matches('[data-project-next]') ? 1 : -1;

    updateSlider(slider, currentIndex + direction);
  });

  root.querySelectorAll('[data-project-slider]').forEach((slider) => {
    updateSlider(slider, 0);
  });

  showProject(0);
}());
