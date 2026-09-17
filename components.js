(function () {
  const page = document.body.dataset.page || "";
  const nav = [
    ["home", "/", "Início"],
    ["movimento", "/movimento/", "O Movimento"],
    ["eventos", "/eventos/", "Eventos"],
    ["treinos", "/treinos/", "Treinos"],
    ["comunidade", "/comunidade/", "Comunidade"],
    ["galeria", "/galeria/", "Galeria"],
    ["parceiros", "/parceiros/", "Parceiros"],
    ["app", "/app/", "App"],
  ];

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `
      <a class="brand" href="/" aria-label="LR LEGADO RUN - início"><span class="brand-mark">LR</span><span>LEGADO RUN</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-menu-toggle><span></span><span></span><span></span><b class="sr-only">Abrir menu</b></button>
      <nav class="main-nav" id="main-nav" aria-label="Navegacao principal" data-main-nav>
        ${nav.map(([id, href, label]) => `<a href="${href}"${page === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a class="mobile-app-link" href="https://legado-run.vercel.app/" target="_blank" rel="noopener noreferrer" data-track="click_app">Acessar o app</a>
      </nav>
      <a class="header-cta" href="https://site.ticketsports.com.br/Inscricao/Categoria.aspx?__idEvento=87806&amp;lang=pt-BR" target="_blank" rel="noopener noreferrer" data-track="click_registration begin_checkout" data-utm-content="header"><strong>Inscreva-se</strong><span>01 NOV</span></a>`;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `
      <div class="footer-lead"><a class="brand footer-brand" href="/"><span class="brand-mark">LR</span><span>LEGADO RUN</span></a><p>Esporte, saúde, comunidade e propósito. Um movimento construído por pessoas.</p><span>YOAV SOLUÇÕES E SERVIÇOS LTDA<br>CNPJ 60.502.538/0001-26</span></div>
      <div><strong>Movimento</strong><a href="/movimento/">Sobre</a><a href="/treinos/">Treinos</a><a href="/comunidade/">Comunidade</a><a href="/galeria/">Galeria</a></div>
      <div><strong>Eventos</strong><a href="/eventos/legado-run-2026/">1ª Corrida</a><a href="/eventos/legado-run-2026/#percursos">Percursos</a><a href="/eventos/legado-run-2026/#programacao">Programação</a><a href="/regulamento/">Regulamento</a></div>
      <div><strong>Conecte-se</strong><a href="https://instagram.com/legadorun" target="_blank" rel="noopener noreferrer" data-track="click_instagram">Instagram</a><a href="https://legado-run.vercel.app/" target="_blank" rel="noopener noreferrer" data-track="click_app">Aplicativo</a><a href="/contato/">Contato</a><a href="/parceiros/">Parceiros</a><a href="/privacidade/">Privacidade</a><a href="/termos/">Termos</a></div>
      <p class="footer-bottom">© 2026 LEGADO RUN. Todos os direitos reservados.</p>`;
  }

  if (!document.querySelector("[data-mobile-registration]")) {
    document.body.insertAdjacentHTML("beforeend", `<a class="mobile-registration" data-mobile-registration href="https://site.ticketsports.com.br/Inscricao/Categoria.aspx?__idEvento=87806&amp;lang=pt-BR" target="_blank" rel="noopener noreferrer" data-track="click_registration begin_checkout" data-utm-content="mobile_sticky"><span>01 NOV</span><strong>Inscreva-se</strong></a>`);
  }

  if (page && page !== "home") {
    const label = nav.find(([id]) => id === page)?.[2] || document.title.split("|")[0].trim();
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: "https://legadorun.com.br/" },
        { "@type": "ListItem", position: 2, name: label, item: window.location.href.split("?")[0] },
      ],
    });
    document.head.appendChild(schema);
  }
})();
