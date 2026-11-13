-- 006: historial de revisions del lloguer i vistes per a les cartes (LibreOffice).
-- Només AFEGEIX objectes: no toca cap taula existent.
-- Cada fila és una revisió: el lloguer anterior i la data de l'última revisió anterior es desen perquè, en eliminar
-- la darrera revisió d'un contracte, es pugui restaurar exactament el que hi havia. `data_enviament` buida = la
-- carta encara és pendent. `percentatge` és el que ha introduït l'usuari (pot ser NULL); l'efectiu es calcula.

CREATE TABLE revisions_lloguer (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_contracte           INTEGER NOT NULL,
    data_efecte            TEXT NOT NULL CHECK (date(data_efecte) IS data_efecte),
    lloguer_anterior       NUMERIC NOT NULL CHECK (lloguer_anterior >= 0),
    data_revisio_anterior  TEXT NOT NULL CHECK (date(data_revisio_anterior) IS data_revisio_anterior),
    percentatge            NUMERIC,
    increment_aplicat      NUMERIC NOT NULL,
    lloguer_nou            NUMERIC NOT NULL CHECK (lloguer_nou >= 0),
    data_enviament         TEXT CHECK (data_enviament IS NULL OR date(data_enviament) IS data_enviament),
    comentari              TEXT,
    afegit_el              TEXT NOT NULL DEFAULT (datetime('now')),
    ultima_mod             TEXT,
    CHECK (round(lloguer_nou - lloguer_anterior - increment_aplicat, 2) = 0),
    FOREIGN KEY (id_contracte) REFERENCES contractes(id) ON DELETE CASCADE
);

CREATE INDEX idx_revisions_contracte ON revisions_lloguer (id_contracte, data_efecte);

-- Camp d'auditoria (UTC), com a la resta de taules. afegit_el ja porta DEFAULT.
CREATE TRIGGER revisions_lloguer_ultima_mod AFTER UPDATE ON revisions_lloguer
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE revisions_lloguer SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;

-- Totes les revisions, amb les dades de l'inquilí (i del segon, si n'hi ha) i les bàsiques de l'immoble.
-- Cada dada ve en dues versions: la crua (per ordenar o calcular) i una de text ja formatada (..._text) per a les
-- cartes: dates DD/MM/AAAA i imports amb punt de milers i coma decimal (sense el símbol de l'euro).
CREATE VIEW v_revisions_lloguer AS
SELECT
    r.id                  AS id_revisio,
    r.id_contracte        AS id_contracte,
    r.data_efecte         AS data_efecte,
    strftime('%d/%m/%Y', r.data_efecte) AS data_efecte_text,
    r.lloguer_anterior    AS lloguer_anterior,
    CASE WHEN r.cts_anterior >= 100000
         THEN printf('%d.%03d,%02d', r.cts_anterior / 100000, r.cts_anterior / 100 % 1000, r.cts_anterior % 100)
         ELSE printf('%d,%02d', r.cts_anterior / 100, r.cts_anterior % 100) END AS lloguer_anterior_text,
    r.increment_aplicat   AS increment_aplicat,
    CASE WHEN r.increment_aplicat < 0 THEN '-' ELSE '' END ||
    CASE WHEN r.cts_increment >= 100000
         THEN printf('%d.%03d,%02d', r.cts_increment / 100000, r.cts_increment / 100 % 1000, r.cts_increment % 100)
         ELSE printf('%d,%02d', r.cts_increment / 100, r.cts_increment % 100) END AS increment_text,
    r.lloguer_nou         AS lloguer_nou,
    CASE WHEN r.cts_nou >= 100000
         THEN printf('%d.%03d,%02d', r.cts_nou / 100000, r.cts_nou / 100 % 1000, r.cts_nou % 100)
         ELSE printf('%d,%02d', r.cts_nou / 100, r.cts_nou % 100) END AS lloguer_nou_text,
    r.percentatge         AS percentatge,
    CASE WHEN r.percentatge IS NOT NULL
         THEN replace(printf('%.2f', r.percentatge), '.', ',') END AS percentatge_text,
    r.pct_efectiu         AS percentatge_efectiu,
    CASE WHEN r.pct_efectiu IS NOT NULL
         THEN replace(printf('%.2f', r.pct_efectiu), '.', ',') END AS percentatge_efectiu_text,
    r.data_enviament      AS data_enviament,
    strftime('%d/%m/%Y', r.data_enviament) AS data_enviament_text,
    r.comentari           AS comentari,
    c.data_inici          AS contracte_data_inici,
    strftime('%d/%m/%Y', c.data_inici) AS contracte_data_inici_text,

    q.id                  AS inquili_id,
    q.nom                 AS inquili_nom,
    q.cognoms             AS inquili_cognoms,
    trim(coalesce(q.nom, '') || ' ' || coalesce(q.cognoms, '')) AS inquili_nom_complet,
    q.nif                 AS inquili_nif,
    q.telefon_1           AS inquili_telefon,
    q.ck_tel1_wassap      AS inquili_whatsapp,
    q.ck_tel1_bizum       AS inquili_bizum,

    q2.id                 AS inquili2_id,
    q2.nom                AS inquili2_nom,
    q2.cognoms            AS inquili2_cognoms,
    CASE WHEN q2.id IS NOT NULL
         THEN trim(coalesce(q2.nom, '') || ' ' || coalesce(q2.cognoms, '')) END AS inquili2_nom_complet,
    q2.nif                AS inquili2_nif,
    q2.telefon_1          AS inquili2_telefon,
    q2.ck_tel1_wassap     AS inquili2_whatsapp,
    q2.ck_tel1_bizum      AS inquili2_bizum,

    CASE WHEN q2.id IS NULL
         THEN trim(coalesce(q.nom, '') || ' ' || coalesce(q.cognoms, ''))
         ELSE trim(coalesce(q.nom, '') || ' ' || coalesce(q.cognoms, ''))
              || ' i ' || trim(coalesce(q2.nom, '') || ' ' || coalesce(q2.cognoms, '')) END AS inquilins_noms,

    i.id                  AS immoble_id,
    i.via                 AS immoble_via,
    i.num_via             AS immoble_num_via,
    i.pis                 AS immoble_pis,
    i.porta               AS immoble_porta,
    i.codi_postal         AS immoble_codi_postal,
    i.localitat           AS immoble_localitat,
    i.provincia           AS immoble_provincia,
    i.ref_catastral       AS immoble_ref_catastral,
    i.via || ' ' || i.num_via || ', ' || i.pis
        || CASE WHEN i.porta IS NOT NULL AND i.porta <> '' THEN ' ' || i.porta ELSE '' END AS immoble_adreca
FROM (
    SELECT r.*,
           CAST(round(abs(r.lloguer_anterior) * 100) AS INTEGER) AS cts_anterior,
           CAST(round(abs(r.increment_aplicat) * 100) AS INTEGER) AS cts_increment,
           CAST(round(abs(r.lloguer_nou) * 100) AS INTEGER) AS cts_nou,
           CASE WHEN r.lloguer_anterior > 0
                THEN round(r.increment_aplicat * 100.0 / r.lloguer_anterior, 2) END AS pct_efectiu
    FROM revisions_lloguer r
) r
JOIN contractes c ON c.id = r.id_contracte
JOIN inquilins q ON q.id = c.id_inquili
LEFT JOIN inquilins q2 ON q2.id = c.id_inquili_2
JOIN inmobles i ON i.id = c.id_inmoble;

-- Les cartes pendents d'enviar: sense data d'enviament i sense increments de 0 € (un lloguer congelat no porta carta).
-- Aquesta és la vista que fa servir el LibreOffice.
CREATE VIEW v_cartes_pendents AS
SELECT * FROM v_revisions_lloguer
WHERE data_enviament IS NULL AND round(increment_aplicat, 2) <> 0
ORDER BY data_efecte, inquili_cognoms, inquili_nom;