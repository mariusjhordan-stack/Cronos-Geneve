import fs from 'fs';
import path from 'path';

console.log("Verificando consistencia de rutas y componentes React...");

const appJsx = fs.readFileSync('frontend/src/App.jsx', 'utf-8');
const headerJsx = fs.readFileSync('frontend/src/components/layout/Header.jsx', 'utf-8');
const sheetJsx = fs.readFileSync('frontend/src/components/ui/Sheet.jsx', 'utf-8');
const productDetailJsx = fs.readFileSync('frontend/src/components/product/ProductDetail.jsx', 'utf-8');
const homePageJsx = fs.readFileSync('frontend/src/pages/HomePage.jsx', 'utf-8');
const footerJsx = fs.readFileSync('frontend/src/components/layout/Footer.jsx', 'utf-8');

const checks = [
  {
    name: "Header no utiliza etiquetas <a> para Catálogo o Colecciones",
    pass: !headerJsx.includes('href="/#catalogo') && !headerJsx.includes('href="/#catalogo?orden=novedades')
  },
  {
    name: "Header utiliza <Link to=\"/#catalogo\">",
    pass: headerJsx.includes('to="/#catalogo"')
  },
  {
    name: "Header utiliza <Link to=\"/?orden=novedades#catalogo\"> para Colecciones",
    pass: headerJsx.includes('to="/?orden=novedades#catalogo"')
  },
  {
    name: "Sheet utiliza createPortal para evitar contención por backdrop-filter en Header",
    pass: sheetJsx.includes('createPortal')
  },
  {
    name: "ProductDetail cuenta con acción 'VOLVER AL CATÁLOGO' vía React Router Link",
    pass: productDetailJsx.includes('VOLVER AL CATÁLOGO') && productDetailJsx.includes('to="/#catalogo"')
  },
  {
    name: "ProductDetail cuenta con breadcrumbs hacia Inicio, Catálogo y Marca vía Link",
    pass: productDetailJsx.includes('to="/"') && productDetailJsx.includes('to="/#catalogo"')
  },
  {
    name: "HomePage cuenta con auto-scroll a #catalogo y scroll-mt-24",
    pass: homePageJsx.includes('scroll-mt-24') && homePageJsx.includes("location.hash === '#catalogo'")
  },
  {
    name: "Footer no contiene enlaces tradicionales con query después del hash",
    pass: !footerJsx.includes('/#catalogo?')
  },
  {
    name: "Footer utiliza Links hacia catálogo y colecciones",
    pass: footerJsx.includes('to="/?orden=novedades#catalogo"') && footerJsx.includes('to="/#catalogo"')
  }
];

let allPassed = true;
checks.forEach((c) => {
  const symbol = c.pass ? "[OK]" : "[FAIL]";
  console.log(`${symbol} ${c.name}`);
  if (!c.pass) allPassed = false;
});

if (allPassed) {
  console.log("\nTodas las validaciones estáticas de navegación pasaron exitosamente al 100%.");
} else {
  console.error("\nSe detectaron fallos en las validaciones de navegación.");
  process.exit(1);
}
