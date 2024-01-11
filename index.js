const pup = require("puppeteer");

const searchFor = "macbook";
const url = "https://www.mercadolivre.com.br/";
var c = 1; // Renomeei a variável para evitar conflito
const list = [];

(async () => {
  
  const browser = await pup.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Iniciei!");

  await page.goto(url);
  console.log("Fui para a URL!");

  // Escrever a constante searchFor na pesquisa
  await page.waitForSelector("#cb1-edit");
  await page.type("#cb1-edit", searchFor);

  console.log("Escrevi no selector!");

  // Clicar no botão de pesquisa e navegar até a próxima página
  await Promise.all([
    page.waitForNavigation(), 
    page.click(".nav-icon-search")
  ]);

  console.log("Cheguei na Página de Produtos");

  // Mostrar o Preço e o Título no console

  let links; // Declara a variável links fora do bloco try

  try {
    
    // Aguarde a presença do seletor dentro do contêiner pai
    await page.waitForSelector('.ui-search-result__content .ui-search-result__content-wrapper .ui-search-item__group a', { timeout: 5000 });

    // Use page.evaluate para obter os links
    links = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('.ui-search-result__content .ui-search-result__content-wrapper .ui-search-item__group a');
      return Array.from(linkElements).map(link => link.href);
    });

    //console.log(links);
  } catch (error) {
    console.error("Erro ao extrair links:", error);
  }

  // ...

  for (const link of links) {
    if (c === 10) continue
    console.log("Página ", c);
    await page.goto(link);
    await page.waitForSelector('.ui-pdp-title'); // Espera pelo título

    const title = await page.$eval('.ui-pdp-title', element => element.innerText);
    const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

    const seller = await page.evaluate(() => {
      const el = document.querySelector('.ui-pdp-seller__link-trigger');
      if (!el) return null;
      return el.innerText;
    });

    const obj = {
      title,
      price,
      seller,
    };

    list.push(obj);

    c++; // Mova a lógica de incremento da variável c para dentro do loop
  }

  console.log(list);

  await page.waitForTimeout(3000);
  await browser.close();
})();
