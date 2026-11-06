document.addEventListener('DOMContentLoaded', function () {
    const year = new Date().getFullYear();
    document.querySelector('footer p').innerHTML = `&copy; ${year} Meu Portfólio. Todos os direitos reservados.`;

    // Cabeçalho compacto ao rolar
    const header = document.querySelector('header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Brilho que acompanha o mouse nos cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });
});
