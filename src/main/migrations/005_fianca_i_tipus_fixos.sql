-- 005: fiança de contracte (camps nous) i tipus de document fixos al codi.
-- Les columnes noves de contractes s'afegeixen amb ADD COLUMN (no es reconstrueix la taula: esborrar-la faria que el
-- ON DELETE CASCADE s'emportés els documents). Les regles noves es validen a l'app i al Main, no a la BD.
-- documents_contracte es reconstrueix: id_tipus (FK a tipus_document) passa a `tipus` (text, la classe de l'antic tipus,
-- validat pel Main). Es copien les files amb els mateixos id (el nom del fitxer al disc en porta el prefix).
-- tipus_document s'elimina: ja no hi ha sembrat ni classes.

ALTER TABLE contractes ADD COLUMN fianca_adicional NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE contractes ADD COLUMN fianca_comentari TEXT;
ALTER TABLE contractes ADD COLUMN devolucio_nc TEXT;
ALTER TABLE contractes ADD COLUMN motiu_fi TEXT;

-- Guarda el comptador d'AUTOINCREMENT: en recrear la taula es reiniciaria al màxim de les files copiades.
CREATE TEMP TABLE seq_documents_contracte AS
    SELECT seq FROM sqlite_sequence WHERE name = 'documents_contracte';

CREATE TABLE documents_contracte_nou (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_contracte  INTEGER NOT NULL,
    tipus         TEXT NOT NULL,
    nom_original  TEXT NOT NULL,
    ruta          TEXT NOT NULL,
    comentaris    TEXT,
    data_document TEXT CHECK (data_document IS NULL OR date(data_document) IS data_document),
    afegit_el     TEXT NOT NULL DEFAULT (datetime('now')),
    ultima_mod    TEXT,
    FOREIGN KEY (id_contracte) REFERENCES contractes(id) ON DELETE CASCADE
);

INSERT INTO documents_contracte_nou
    (id, id_contracte, tipus, nom_original, ruta, comentaris, data_document, afegit_el, ultima_mod)
SELECT d.id, d.id_contracte, t.classe, d.nom_original, d.ruta, d.comentaris, d.data_document, d.afegit_el, d.ultima_mod
FROM documents_contracte d
JOIN tipus_document t ON t.id = d.id_tipus;

-- Guarda: si en copiar s'ha perdut alguna fila, la migració s'atura i es desfà tota.
CREATE TEMP TABLE guarda_005 (
    ok INTEGER,
    CONSTRAINT documents_copiats_tots CHECK (ok = 1)
);
INSERT INTO guarda_005
SELECT (SELECT count(*) FROM documents_contracte_nou) = (SELECT count(*) FROM documents_contracte);
DROP TABLE guarda_005;

-- En esborrar la taula vella se'n van també l'índex i el trigger: es tornen a crear a sota.
DROP TABLE documents_contracte;
ALTER TABLE documents_contracte_nou RENAME TO documents_contracte;

UPDATE sqlite_sequence
SET seq = (SELECT max(seq) FROM seq_documents_contracte)
WHERE name = 'documents_contracte'
  AND seq < (SELECT max(seq) FROM seq_documents_contracte);
DROP TABLE seq_documents_contracte;

CREATE INDEX idx_documents_contracte ON documents_contracte (id_contracte);

CREATE TRIGGER documents_contracte_ultima_mod AFTER UPDATE ON documents_contracte
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE documents_contracte SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;

-- Ja no hi ha tipus de document a la BD (en esborrar-la se'n van també els seus triggers).
DROP TABLE tipus_document;
DELETE FROM sqlite_sequence WHERE name = 'tipus_document';