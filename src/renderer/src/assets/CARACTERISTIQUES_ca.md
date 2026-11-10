## Funcionalitats de la versió 1.0.xx

### Gestió d'immobles
- Crea i edita immobles.
- Introdueix les dades cadastrals, les dades del certificat energètic i de la cèdula d'habitabilitat.
  L'aplicació t'avisarà quan el certificat o la cèdula estiguin a punt de caducar o ja hagin caducat.
- Adjunta-hi documents com la fitxa cadastral, el certificat energètic o la cèdula d'habitabilitat.
  L'aplicació t'avisarà si tens pendent d'adjuntar el certificat o la cèdula.
- Adjunta-hi tota mena de documents i visualitza'ls des de la mateixa aplicació.

### Gestió d'inquilins
- Crea i edita inquilins.
- Introdueix les dades necessàries per als contractes de lloguer.
- Informa del telèfon i de si disposen de WhatsApp i Bizum.

### Gestió de contractes
- Crea i edita contractes, relacionant un immoble amb un o dos inquilins.
- L'aplicació t'avisarà quan un contracte estigui a punt de caducar o ja hagi caducat, o quan toqui revisar el lloguer.
- Adjunta-hi el document del contracte i visualitza'l des de l'aplicació.

#### Gestió de les fiances de l'INCASÒL
- Introdueix les dades de l'ingrés de la fiança a l'INCASÒL i adjunta-hi el document corresponent (en aquest cas, el model 2).
- Informa de la data de pagament i adjunta-hi el rebut del banc.
- Informa de la notificació de l'ingrés que retorna la Generalitat i adjunta-hi el document corresponent.
- Introdueix les dades per a la devolució de la fiança i adjunta-hi el document corresponent (en aquest cas, el model 3).

#### Gestió d'altres documents relacionats amb el contracte
- Fotografies.
- Annexos.
- Documents de l'inquilí necessaris per al primer contracte (DNI, vida laboral, nòmina, etc.).

## Característiques de l'aplicació

### Aplicació multiplataforma
- Disponible per a Linux, Windows i macOS.
- Actualment només s'ha provat a Linux (Ubuntu, Ubuntu Cinnamon i Linux Mint).

### Ús individual
- Aplicació dissenyada per a un sol usuari i un únic ordinador.
- No permet l'ús simultani des de diversos ordinadors ni compartir les dades entre usuaris.
- No disposa de sincronització automàtica entre dispositius.

### Emmagatzematge de les dades
- Les dades es guarden localment a l'ordinador, en una base de dades SQLite.
- El fitxer de base de dades, el de configuració i les carpetes que contenen els documents adjunts es guarden dins de la carpeta **Lloguers**, situada a la carpeta personal de l'usuari.
- Aquesta organització facilita la realització de còpies de seguretat, ja que tots els fitxers necessaris es troben agrupats en una mateixa ubicació.
- No necessita connexió a Internet per al funcionament habitual.
- L'usuari és responsable de mantenir còpies de seguretat actualitzades de les dades.

## Funcionalitats previstes d'implementar
- Generar un llistat amb tots els avisos dels immobles i dels contractes.
- Generar un fitxer CSV o un full de càlcul amb totes les dades necessàries per redactar un contracte. Aquestes dades es podran combinar amb una plantilla de document per generar el contracte.
- Afegir plantilles de contractes que permetin generar directament el contracte des de l'aplicació.
- Gestionar dinàmicament les clàusules i els apartats dels contractes.
- Generar, instal·lar i provar les versions per a Windows i macOS.
