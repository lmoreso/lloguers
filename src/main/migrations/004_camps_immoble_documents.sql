-- 004: camps nous a inmobles (cadastre, compra, superfície útil de la cèdula) i documents_immoble sense CHECK
-- de tipus (el tipus el valida el Main) i amb el comentari opcional.
-- Les columnes noves no porten CHECK: les validacions són a l'app i al Main.
-- documents_immoble es reconstrueix copiant-ne les files (mateixos id: el nom del fitxer al disc en porta el prefix).

ALTER TABLE inmobles ADD COLUMN val_cadastral_total NUMERIC;
ALTER TABLE inmobles ADD COLUMN val_cadastral_constr NUMERIC;
ALTER TABLE inmobles ADD COLUMN any_construccio INTEGER;
ALTER TABLE inmobles ADD COLUMN data_compra TEXT;
ALTER TABLE inmobles ADD COLUMN valor_compra NUMERIC;
ALTER TABLE inmobles ADD COLUMN ced_hab_superficie_util NUMERIC;

-- Guarda el comptador d'AUTOINCREMENT: en recrear la taula es reiniciaria al màxim de les files copiades.
CREATE TEMP TABLE seq_documents_immoble AS
    SELECT seq FROM sqlite_sequence WHERE name = 'documents_immoble';

CREATE TABLE documents_immoble_nou (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_inmoble    INTEGER NOT NULL,
    tipus         TEXT NOT NULL,
    nom_original  TEXT NOT NULL,
    ruta          TEXT NOT NULL,
    comentaris    TEXT,
    data_document TEXT CHECK (data_document IS NULL OR date(data_document) IS data_document),
    afegit_el     TEXT NOT NULL DEFAULT (datetime('now')),
    ultima_mod    TEXT,
    FOREIGN KEY (id_inmoble) REFERENCES inmobles(id) ON DELETE CASCADE
);

INSERT INTO documents_immoble_nou
    (id, id_inmoble, tipus, nom_original, ruta, comentaris, data_document, afegit_el, ultima_mod)
SELECT id, id_inmoble, tipus, nom_original, ruta, comentaris, data_document, afegit_el, ultima_mod
FROM documents_immoble;

-- En esborrar la taula vella se'n van també l'índex i el trigger: es tornen a crear a sota.
DROP TABLE documents_immoble;
ALTER TABLE documents_immoble_nou RENAME TO documents_immoble;

UPDATE sqlite_sequence
SET seq = (SELECT max(seq) FROM seq_documents_immoble)
WHERE name = 'documents_immoble'
  AND seq < (SELECT max(seq) FROM seq_documents_immoble);
DROP TABLE seq_documents_immoble;

CREATE INDEX idx_documents_immoble ON documents_immoble (id_inmoble);

CREATE TRIGGER documents_immoble_ultima_mod AFTER UPDATE ON documents_immoble
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE documents_immoble SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;
