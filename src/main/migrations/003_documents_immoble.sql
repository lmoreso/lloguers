-- 003: documents adjunts d'un immoble (certificat energètic, cèdula d'habitabilitat, fotos...).
-- Només afegeix una taula, un índex i un trigger: no toca cap taula existent.
-- Els fitxers viuen a documents/immobles/<id_inmoble>/<id_document>_<nom>; a la BD només la ruta relativa.
-- Els tipus són una llista fixa (el nom visible surt de la traducció); afegir-ne un exigeix una migració nova.

CREATE TABLE documents_immoble (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_inmoble    INTEGER NOT NULL,
    tipus         TEXT NOT NULL
                  CHECK (tipus IN ('certificat_energetic', 'cedula_habitabilitat', 'fotos', 'altres')),
    nom_original  TEXT NOT NULL,
    ruta          TEXT NOT NULL,
    -- Obligatori: en adjuntar diversos fitxers de cop, el comentari els identifica.
    comentaris    TEXT NOT NULL CHECK (trim(comentaris) <> ''),
    data_document TEXT CHECK (data_document IS NULL OR date(data_document) IS data_document),
    afegit_el     TEXT NOT NULL DEFAULT (datetime('now')),
    ultima_mod    TEXT,
    FOREIGN KEY (id_inmoble) REFERENCES inmobles(id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_immoble ON documents_immoble (id_inmoble);

-- Camp d'auditoria (UTC), com a la resta de taules. afegit_el ja porta DEFAULT.
CREATE TRIGGER documents_immoble_ultima_mod AFTER UPDATE ON documents_immoble
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE documents_immoble SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;
