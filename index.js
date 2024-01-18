const pup = require("puppeteer");
const fs = require('fs');
const searchFor = "macbook";
const url = "https://www.mercadolivre.com.br/";
var c = 1; // Renomeei a variável para evitar conflito
const list = [];

(async () => {
  
  const browser = await pup.launch();
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

// ...

let links; // Declare a variável links fora do bloco try

try {
  // Aguarde a presença do seletor dentro do contêiner pai
  await page.waitForSelector('.ui-search-result__content .ui-search-result__content-wrapper .ui-search-item__group a', { timeout: 5000 });

  // Use page.evaluate para obter os links diretamente da página de resultados
  links = await page.evaluate(() => {
    const linkElements = document.querySelectorAll('.ui-search-result__content .ui-search-result__content-wrapper .ui-search-item__group a');
    return Array.from(linkElements).map(link => link.href);
  });

  //console.log(links);
} catch (error) {
  console.error("Erro ao extrair links:", error);
}

// ...


  // ...

  for (const link of links) {
    if (c === 50) continue
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
      link,
    };

    list.push(obj);

    c++; // Mova a lógica de incremento da variável c para dentro do loop
  }

  // Filtrar apenas os produtos Macbook
  const macbookList = list.filter(product => product.title.toLowerCase().includes("macbook"));

  // Ordenar a lista de Macbooks por preço crescente
  macbookList.sort((a, b) => parseFloat(a.price.replace(',', '.')) - parseFloat(b.price.replace(',', '.')));

  // Mostrar a lista final de Macbooks ordenados por preço
  console.log("Lista de Macbooks Ordenados por Preço Crescente:");
  console.log(macbookList);

  console.log(list);

    // Após a exibição da lista no console
  const jsonFileName = 'macbooks.json';

  fs.writeFile(jsonFileName, JSON.stringify(macbookList, null, 2), (err) => {
    if (err) {
      console.error('Erro ao escrever no arquivo JSON:', err);
    } else {
      console.log(`Dados salvos em ${jsonFileName}`);
    }
  });


  await page.waitForTimeout(3000);
  await browser.close();
})();
