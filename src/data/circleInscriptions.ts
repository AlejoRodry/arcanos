export interface CircleInscription {
  id: string;
  themeTitle: string;
  outerLatin: string;
  innerLatin: string;
  translationOuter: string;
  translationInner: string;
  origins: string;
}

export const circleInscriptions: CircleInscription[] = [
  {
    id: "metamorfosis-eterna",
    themeTitle: "El Ciclo y la Metamorfosis Eterna",
    outerLatin: "OMNIA MUTANTUR NIHIL INTERIT · FATO PRUDENTIA MINOR · IN GIRUM IMUS NOCTE ET CONSUMIMUR IGNI · MEMENTO MORI · ",
    innerLatin: "PER ASPERA AD ASTRA · POST TENEBRAS LUX · TEMPORE NIHIL PRETIOSIUS · ",
    translationOuter: "«Todo cambia, nada perece · La prudencia es menor que el destino · Damos vueltas en la noche y somos consumidos por el fuego · Recuerda que eres mortal»",
    translationInner: "«A través de las dificultades hacia las estrellas · Tras las tinieblas, la luz · Nada es más valioso que el tiempo»",
    origins: "Ovidio (Metamorfosis), Virgilio, Palíndromo Medieval y Séneca"
  },
  {
    id: "tabla-esmeralda",
    themeTitle: "La Tabla Esmeralda & El Principio Hermético",
    outerLatin: "QUOD EST INFERIUS EST SICUT QUOD EST SUPERIUS · VISITA INTERIORA TERRAE RECTIFICANDO INVENIES OCCULTUM LAPIDEM · ",
    innerLatin: "SOLVE ET COAGULA · LUX EX OCCULTO · IGNIS NATURAM RENOVAT INTEGRAM · ",
    translationOuter: "«Como es abajo, es arriba · Visita el interior de la tierra y rectificando hallarás la piedra oculta (V.I.T.R.I.O.L.)»",
    translationInner: "«Disuelve y coagula · La luz de lo oculto · El fuego renueva toda la naturaleza (I.N.R.I.)»",
    origins: "Hermes Trismegisto (Tabula Smaragdina) y la tradición alquímica clásica"
  },
  {
    id: "oraculo-del-sabio",
    themeTitle: "El Espejo Interior & El Amor Fati",
    outerLatin: "NOSCE TE IPSUM ET NOSCES UNIVERSUM ET DEOS · AMOR FATI · AUDACES FORTUNA IUVAT · FORTUNA CAECA EST · ",
    innerLatin: "VERITAS VINCIT OMNIA · SAPIENTIA AETERNITATIS RADIUS · NON OMNIS MORIAR · ",
    translationOuter: "«Conócete a ti mismo y conocerás el universo y a los dioses · Ama a tu destino · La fortuna favorece a los audaces · La fortuna es ciega»",
    translationInner: "«La verdad lo vence todo · La sabiduría es el rayo de la eternidad · No moriré del todo (Horacio)»",
    origins: "Oráculo de Delfos, Friedrich Nietzsche, Virgilio y Horacio"
  },
  {
    id: "leyes-cosmicas",
    themeTitle: "El Laberinto Cósmico & La Vía Estelar",
    outerLatin: "SIC ITUR AD ASTRA · AD AUGUSTA PER ANGUSTA · AUREA MEDIOCRITAS · SUB SPECIE AETERNITATIS · ",
    innerLatin: "OCULUS MUNDI SOMNIUM EST · NIHIL SUB SOLE NOVUM · SPECULUM COSMICUM · ",
    translationOuter: "«Así se va a las estrellas · A las cumbres por caminos estrechos · El dorado término medio · Bajo la mirada de la eternidad»",
    translationInner: "«El ojo del mundo es un sueño · Nada nuevo hay bajo el sol · Espejo cósmico»",
    origins: "Virgilio (Eneida), Baruch Spinoza, Eclesiastés y la Astrología Medieval"
  },
  {
    id: "rueda-del-tarot",
    themeTitle: "La Rueda del Arcano & El Gran Secreto",
    outerLatin: "ROTA TAROT ORAT TORA ATOR · VIA SILENTII PRIMA SAPIENTIA · MUNDUS VULT DECIPI · ",
    innerLatin: "ARCANA ARCANORUM · CLAVIS CAELORUM · IANUA MAGNA APERITUR · ",
    translationOuter: "«La Rueda (ROTA) del TAROT anuncia (ORAT) la Ley (TORA) de HATHOR (ATOR) · El camino del silencio es la primera sabiduría · El mundo quiere ser engañado»",
    translationInner: "«El arcano de los arcanos · La llave de los cielos · La gran puerta se abre»",
    origins: "Guillaume Postel (Anagrama de la Rota Tarot), Eliphas Lévi y la Cábala Hermética"
  },
  {
    id: "fuego-sagrado",
    themeTitle: "La Noche Primordial & El Fuego Secreto",
    outerLatin: "LUX IN TENEBRIS LUCET · PULVIS ET UMBRA SUMUS · AETERNA FACTA RESURGUNT · FLAMMA VITA EST · ",
    innerLatin: "ASTRIS DUCEBATUR ITER · DE PROFUNDIS AD STELLAS · UNUS MUNDUS UNUS AMOR · ",
    translationOuter: "«La luz brilla en las tinieblas · Polvo y sombra somos · Las obras eternas resurgen · La llama es la vida»",
    translationInner: "«Por los astros era guiado el sendero · Desde los abismos hacia las estrellas · Un solo mundo, un solo amor»",
    origins: "Evangelio según San Juan, Horacio (Odas) y Carl Gustav Jung (Unus Mundus)"
  },
  {
    id: "sendero-del-errante",
    themeTitle: "El Sendero del Errante & El Destino Inmortal",
    outerLatin: "QUI AUDET ADIT ABYSSUM · VITA SOMNIUM BREVE · ARS LONGA VITA BREVIS · TENEBRAE LUX NOSTRA · ",
    innerLatin: "VOLENTEM DUCUNT FATA NOLENTEM TRAHUNT · CORRIGE TE IPSUM · OMNIA VINCIT AMOR · ",
    translationOuter: "«Quien se atreve penetra el abismo · La vida es un sueño breve · El arte es largo, la vida corta · Las tinieblas son nuestra luz»",
    translationInner: "«Al que consiente, el destino lo guía; al que se resiste, lo arrastra · Corrígete a ti mismo · El amor todo lo vence»",
    origins: "Cleantes de Aso, Hipócrates, Calderón de la Barca y la Filosofía Estoica"
  },
  {
    id: "esfera-armonica",
    themeTitle: "La Armonía de las Esferas & La Bóveda Celeste",
    outerLatin: "AURA SACRA CAELORUM · SIDERUM CONCORDIA DISCORS · HARMONIA MUNDI · SPIRO DUM SPERO · ",
    innerLatin: "STELLAE REGUNT HOMINES SAPIENS DOMINABITUR ASTRIS · AXIS MUNDI · ",
    translationOuter: "«Aura sagrada de los cielos · Armonía discordante de los astros · La armonía del mundo · Respiro mientras tengo esperanza»",
    translationInner: "«Las estrellas rigen a los hombres, mas el sabio dominará a los astros · El eje del mundo»",
    origins: "Pitágoras, Johannes Kepler (Harmonices Mundi) y Ptolomeo"
  }
];

export function getNextCircleInscription(): CircleInscription {
  try {
    const stored = localStorage.getItem('radiant_astrolabe_phrase_index');
    let nextIdx = 0;
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        nextIdx = (parsed + 1) % circleInscriptions.length;
      }
    } else {
      // First visit: pick random to surprise or 0
      nextIdx = Math.floor(Math.random() * circleInscriptions.length);
    }
    localStorage.setItem('radiant_astrolabe_phrase_index', nextIdx.toString());
    return circleInscriptions[nextIdx];
  } catch {
    return circleInscriptions[0];
  }
}
