function loadImg(primarySrc, fallbackSrc) {
  const img = new Image();
  img.src = primarySrc.trim();
  if (fallbackSrc) {
    img.onerror = () => { img.onerror = null; img.src = fallbackSrc.trim(); };
  }
  return img;
}

const assets = {
  bathSky: loadImg("sky.png", "1.png"),
  bathFloor: loadImg("water.png", "2.png"),
  duckSitting: loadImg("water duck.png", "3.png"),
  soapBubbles: loadImg("bubbles.png", "4.png"),
  clickerFX: loadImg("clicker.png", "5.png"),

  gardenSky: loadImg("background.png", "12.png"),
  gardenSun: loadImg("sun.png", "sun 2.png"),
  gardenHills: loadImg("patio 2 floor.png", "14.png"),
  gardenGrass: loadImg("patio.png", "15.png"),

  mounds: loadImg("dirt.png", "16.png"),
  seeds: loadImg("seeds.png", "17.png"),
  sprouts: loadImg("plantss.png", "18.png"),
  crops: loadImg("plants carrots.png", "19.png"),

  roomBg: loadImg("room bg.png", "20.png"),
  roomFloor: loadImg("floor.png", "floor 2.png"),
  wardrobe: loadImg("closet.png", "22.png"),
  roomBorder: loadImg("game widget.png", "23.png"),
  rug: loadImg("button 1.png", "26.png"),
  petBed: loadImg("comfy seat.png", "9.png"),
  pottedPlant: loadImg("plant.png", "10.png"),
  poster: loadImg("poster.png", "11.png"),

  menuBackdrop: loadImg("bgg.png", "30.png"),
  btnPlay: loadImg("play button.png", "29.png"),
  btnStoreMenu: loadImg("store 2.png", "28.png"),
  btnQuit: loadImg("quit .png", "27.png"),
  btnPill1: loadImg("button 1.png"),
  btnPill2: loadImg("button 2.png"),
  btnPill3: loadImg("button 3.png"),

  storeFrame: loadImg("widget store.png", "31.png"),
  storeSpotlight: loadImg("coin slot.png", "32.png"),
  storeWidgets: loadImg("shop store widgets.png", "33.png"),
  arrowLeft: loadImg("left.png", "34.png"),
  arrowRight: loadImg("right.png", "35.png"),
  storeTitle: loadImg("store .png", "36.png"),

  duckLegs: loadImg("duck legs.png", "37.png"),
  duckBody: loadImg("duck.png", "38.png"),

  ribbon: loadImg("outfit bow.png", "39.png"),
  hatParty: loadImg("clothes hat.png", "40.png"),
  tuxedo: loadImg("outfit toxido.png", "41.png"),
  shoesRed: loadImg("red boots.png", "42.png"),
  shoesBlack: loadImg("black shoes.png", "43.png"),
  shoesGreen: loadImg("green boots.png", "44.png"),
  shoesBlue: loadImg("blue boots.png", "45.png")
};

const shoeCatalog = [
  { name: "Barefoot", img: null },
  { name: "Red Boots", img: assets.shoesRed },
  { name: "Black Shoes", img: assets.shoesBlack },
  { name: "Green Boots", img: assets.shoesGreen },
  { name: "Blue Boots", img: assets.shoesBlue }
];