"""Genera versiones livianas (WebP) de las imágenes del portfolio en img/.

Uso:  python3 tools/optimizar_imagenes.py
Lee los originales de assets/ y assets2/ (no los modifica).
Para sumar un proyecto, agregalo a PROYECTOS y a js/proyectos.js.
"""
import os
from PIL import Image, ImageOps

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RAIZ, "img")

# slug: (portada, foco_y, [galería])
PROYECTOS = {
    "el-viaje-de-ulises": ("assets/ulises1.png", .5, [f"assets/ulises{i}.png" for i in range(1, 15)]),
    "sync": ("assets/syncportada.png", .5, ["assets/syncportada.png"]),
    "fungi": ("assets2/fungiportada.jpg", .5, ["assets2/fungiportada.jpg", "assets2/fungipartes.jpg"] + [f"assets2/fungifoto{i}.jpg" for i in range(1, 7)]),
    "giroptico": ("assets2/Giropticomockup1.jpg", .35, ["assets2/Giroptico.jpg", "assets2/Giropticofoto1.jpg", "assets2/Giropticofoto5.jpg", "assets2/Giropticofoto3.jpg", "assets2/Giropticofoto4.jpg", "assets2/Giropticomockup2.png", "assets2/Giropticomockup4.png", "assets2/Giropticomockup1.jpg"]),
    "el-viaje-de-totoro": ("assets/totoro12.jpg", .5, ["assets/totoro1.jpg"] + [f"assets/totoro{i}.jpg" for i in (12, 14, 16, 18, 20, 22, 24, 26, 36)]),
    "hockey-di-tella": ("assets2/instautdt.png", .5, ["assets2/instautdt.png", "assets/ttutdt.png"]),
    "squizo": ("assets/squizo2.png", .5, [f"assets/squizo{i}.png" for i in range(1, 5)]),
    "deartentonine": ("assets/deartentonine.png", .5, ["assets/deartentonine.png"]),
    "revista-kill-bill": ("assets2/kb0.jpg", .5, [f"assets2/kb{i}.jpg" for i in range(0, 11)]),
    "fast-fashion": ("assets/fastfashion1.png", .5, [f"assets/fastfashion{i}.png" for i in range(1, 10)]),
    "oniria": ("assets/oniriaportada.png", .5, ["assets/oniriaportada.png", "assets/oniriaelementos7.png", "assets/oniriaelementos4.png", "assets/oniriaelementos1.png", "assets/oniriafoto1.png", "assets/oniriaelementos6.png", "assets/oniriaelementos5.png", "assets/oniriaelementos2.png"]),
    "caprichismo": ("assets/caprichismo6.png", .3, [f"assets/caprichismo{i}.png" for i in range(5, 13)]),
    "metal-y-piedra": ("assets/mypfotos.jpg", .5, ["assets/mypfotos.jpg", "assets/mypafiche.jpg", "assets/mypafichetas.jpg", "assets/mypitinerario.jpg", "assets/mypsouvenirs.jpg", "assets/mypposts.jpg", "assets/mypstorys.jpg", "assets/myptoolkit.jpg"]),
}


def abrir(ruta):
    im = Image.open(os.path.join(RAIZ, ruta))
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        if im.getextrema()[3][0] == 255:  # sin transparencia real
            im = im.convert("RGB")
    else:
        im = im.convert("RGB")
    return im


def recorte(im, w, h, foco_y=.5):
    if im.mode == "RGBA":
        fondo = Image.new("RGB", im.size, (12, 16, 40))
        fondo.paste(im, mask=im.split()[3])
        im = fondo
    return ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(.5, foco_y))


def guardar(im, ruta, q=80):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    im.save(ruta, "WEBP", quality=q, method=6)


def main():
    for slug, (portada, foco, galeria) in PROYECTOS.items():
        d = os.path.join(OUT, slug)
        p = abrir(portada)
        guardar(recorte(p, 1200, 900, foco), f"{d}/portada.webp", 82)
        guardar(recorte(p, 520, 390, foco), f"{d}/mini.webp", 78)
        for i, src in enumerate(galeria, 1):
            im = abrir(src)
            if im.width > 1800:
                im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
            if im.height > 2400:
                im = im.resize((round(im.width * 2400 / im.height), 2400), Image.LANCZOS)
            guardar(im, f"{d}/{i:02d}.webp")
        print(slug, len(galeria))
    yo = abrir("assets/yo.png").convert("RGB")
    guardar(ImageOps.fit(yo, (900, 1100), Image.LANCZOS, centering=(.5, .62)), f"{OUT}/yo.webp", 84)


if __name__ == "__main__":
    main()
