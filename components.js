(function () {
  const page = document.body.dataset.page || "";
  const nav = [
    ["movimento", "/movimento/", "Movimento"],
    ["treinos", "/treinos/", "Treinos"],
    ["corrida", "/corrida-2026/", "Corrida"],
    ["comunidade", "/comunidade/", "Comunidade"],
    ["historias", "/historias/", "Historias"],
    ["galeria", "/galeria/", "Galeria"],
    ["parceiros", "/parceiros/", "Parceiros"],
    ["app", "/app/", "App"],
  ];

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `
      <a class="brand" href="/" aria-label="LEGADO RUN - inicio"><span class="brand-mark">LR</span><span>LEGADO RUN</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" data-menu-toggle><span></span><span></span><span></span><b class="sr-only">Abrir menu</b></button>
      <nav class="main-nav" id="main-nav" aria-label="Navegacao principal" data-main-nav>
        ${nav.map(([id, href, label]) => `<a href="${href}"${page === id ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a class="mobile-app-link" href="https://legado-run.vercel.app/" target="_blank" rel="noopener noreferrer" data-track="click_app">Acessar o app</a>
      </nav>
      <a class="header-cta" href="/comunidade/" data-track="click_whatsapp">Fazer parte</a>`;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `
      <div class="footer-lead"><a class="brand footer-brand" href="/"><span class="brand-mark">LR</span><span>LEGADO RUN</span></a><p>Correndo com proposito. Deixando marcas por onde passamos.</p></div>
      <div><strong>Explore</strong><a href="/movimento/">Movimento</a><a href="/treinos/">Treinos</a><a href="/corrida-2026/">Corrida 2026</a><a href="/galeria/">Galeria</a><a href="/app/">Aplicativo</a></div>
      <div><strong>Conecte-se</strong><a href="https://instagram.com/legadorun" target="_blank" rel="noopener noreferrer" data-track="click_instagram">Instagram</a><a href="https://chat.whatsapp.com/IEJSDWF9a0ZLIFcD13W5qf" target="_blank" rel="noopener noreferrer" data-track="click_whatsapp">Comunidade no WhatsApp</a><a href="mailto:legadorunn@gmail.com">legadorunn@gmail.com</a><a href="/contato/">Contato</a></div>
      <div><strong>Institucional</strong><span>Realizacao: LEGADO</span><span>Organizacao: YOAV SOLUCOES E SERVICOS LTDA</span><span>CNPJ 60.502.538/0001-26</span><a href="/imprensa/">Imprensa</a><a href="/privacidade/">Privacidade</a><a href="/termos/">Termos</a><a href="/regulamento/">Regulamento</a></div>
      <p class="footer-bottom">© 2026 LEGADO RUN. Todos os direitos reservados.</p>`;
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
