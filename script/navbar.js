const menuToggle = document.querySelector('.menu-toggle');
      const navBar = document.querySelector('.nav-bar');
      menuToggle.addEventListener('click', () => {
        const aberto = navBar.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(aberto));
        menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          navBar.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('poppins', 'Abrir menu');
        }
      });