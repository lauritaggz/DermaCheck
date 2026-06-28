from datetime import date

from app.services.product_search.filters import (
    is_prescription_product,
    is_skincare_product,
    normalize_query,
)
from app.schemas.product_search import ProductPrices
from app.services.product_search.detail_parser import (
    parse_detail_prices,
    parse_product_description,
    parse_product_image,
)
from app.services.product_search.parsers import (
    compute_min_price,
    merge_precios,
    parse_clp_price,
    parse_farmacompara_html,
)

DETAIL_HTML = """
<div id="precios">
  <span>Ahumada: Sin stock</span>
  <span>Cruz Verde: $9.490</span>
  <span>Salcobrand: $9.390</span>
</div>
<div class="product-contain p-3">
  <p>Loción hidratante de 473 ml con ceramidas y ácido hialurónico para piel seca.</p>
  <img src="https://www.farmacompara.cl/img/producto-detalle.png" class="product-img" alt="Loción">
</div>
<script type="application/ld+json">
{"@context":"https://schema.org/","@type":"Product","description":"Desde JSON-LD","image":"https://static.example.cl/product.jpg"}
</script>
<meta property="og:image" content="https://static.example.cl/og-product.jpg">
"""

SAMPLE_HTML = """
<div class="prod" data-id="1" data-price="8990" data-name="Limpiador Facial Gel 200 mL">
  <div class="img-container">
    <a href="https://www.farmacompara.cl/producto/limpiador-facial" class="product-name">
      <img src="https://www.farmacompara.cl/img/limpiador.png" class="product-img" alt="Limpiador Facial Gel 200 mL">
    </a>
  </div>
  <a href="https://www.farmacompara.cl/producto/limpiador-facial" class="product-name">Limpiador Facial Gel 200 mL</a>
  <div class="price-comparison">
    <div class="price-row"><span class="pharmacy-name">Ahumada</span><span class="price-value">$8.990</span></div>
    <div class="price-row"><span class="pharmacy-name">Salcobrand</span><span class="price-value">$9.390</span></div>
    <div class="price-row"><span class="pharmacy-name">Cruz Verde</span><span class="price-value">Sin Stock</span></div>
  </div>
</div>
<div class="prod" data-id="2" data-price="5000" data-name="Losartan 50 mg Comprimidos">
  <a href="https://www.farmacompara.cl/producto/losartan" class="product-name">Losartan 50 mg Comprimidos</a>
  <div class="price-comparison">
    <div class="price-row"><span class="pharmacy-name">Ahumada</span><span class="price-value">$5.000</span></div>
  </div>
</div>
"""


def test_parse_clp_price():
    assert parse_clp_price("$8.990") == 8990
    assert parse_clp_price("Sin Stock") is None
    assert parse_clp_price("-") is None


def test_parse_farmacompara_html():
    products = parse_farmacompara_html(SAMPLE_HTML, "limpiador facial")
    assert len(products) == 2
    assert products[0].nombre.startswith("Limpiador Facial")
    assert products[0].precio_minimo == 8990
    assert products[0].precios.ahumada == 8990
    assert products[0].precios.salcobrand == 9390
    assert products[0].precios.cruz_verde is None
    assert products[0].imagen_url == "https://www.farmacompara.cl/img/limpiador.png"
    assert products[0].fecha_consulta == date.today()


def test_skincare_and_prescription_filters():
    assert is_skincare_product("Limpiador Facial Gel", "limpiador")
    assert not is_skincare_product("Losartan 50 mg", "losartan")
    assert is_prescription_product("Losartan 50 mg Comprimidos")
    assert not is_prescription_product("Crema Hidratante Facial")


def test_normalize_query():
    assert normalize_query("  Limpiador   Facial  ") == "limpiador facial"


def test_merge_precios_and_compute_min():
    base = merge_precios(
        ProductPrices(ahumada=8990, salcobrand=None, cruz_verde=None),
        ProductPrices(ahumada=None, salcobrand=9390, cruz_verde=9490),
    )
    assert base.ahumada == 8990
    assert base.salcobrand == 9390
    assert base.cruz_verde == 9490
    precio, farmacia = compute_min_price(base)
    assert precio == 8990
    assert farmacia == "ahumada"


def test_parse_product_description_and_detail_prices():
    description = parse_product_description(DETAIL_HTML)
    assert description is not None
    assert "ceramidas" in description

    detail_prices = parse_detail_prices(DETAIL_HTML)
    assert detail_prices.ahumada is None
    assert detail_prices.salcobrand == 9390
    assert detail_prices.cruz_verde == 9490


def test_parse_product_image():
    image = parse_product_image(DETAIL_HTML)
    assert image == "https://static.example.cl/product.jpg"
