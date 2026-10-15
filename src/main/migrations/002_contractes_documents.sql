-- 002: contractes ampliats (segon inquilí, lloguer actual, fiança, devolució),
-- documents amb tipus i taula tipus_document.
-- Reconstrueix contractes i documents_contracte (buides en aplicar-la): SQLite no permet
-- afegir CHECK entre columnes amb ALTER. En esborrar una taula s'esborren també els seus
-- índexs i triggers, que es tornen a crear aquí.
-- Els CHECK de dates fan servir `IS` i no `=`: date() retorna NULL per a un text que no entén
-- ('2025-13-45', '2025-1-1') i un CHECK només falla quan dona 0, no NULL. Amb `IS`, NULL IS 'text'
-- dona 0 i la data es rebutja.

DROP TABLE documents_contracte;
DROP TABLE contractes;

-- Tipus de document. `classe` és un codi intern que valida el Main (llista tancada al codi);
-- la taula la sembra l'app a l'arrencada, no aquesta migració.
CREATE TABLE tipus_document (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT NOT NULL,
    classe     TEXT NOT NULL,
    afegit_el  TEXT,
    ultima_mod TEXT
);

CREATE TABLE contractes (
    id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_inmoble                 INTEGER NOT NULL,
    data_inici                 TEXT NOT NULL CHECK (date(data_inici) IS data_inici),
    data_fi                    TEXT CHECK (data_fi IS NULL OR date(data_fi) IS data_fi),
    id_inquili                 INTEGER NOT NULL,
    id_inquili_2               INTEGER,
    d_fi_prevista              TEXT NOT NULL CHECK (date(d_fi_prevista) IS d_fi_prevista),
    lloguer_inicial            NUMERIC NOT NULL,
    lloguer_actual             NUMERIC NOT NULL,
    data_ultima_revisio        TEXT NOT NULL CHECK (date(data_ultima_revisio) IS data_ultima_revisio),
    fianca_import              NUMERIC,
    fianca_nc                  TEXT,
    fianca_data_model2         TEXT CHECK (fianca_data_model2 IS NULL OR date(fianca_data_model2) IS fianca_data_model2),
    fianca_data_ingres         TEXT CHECK (fianca_data_ingres IS NULL OR date(fianca_data_ingres) IS fianca_data_ingres),
    fianca_data_notificacio    TEXT CHECK (fianca_data_notificacio IS NULL OR date(fianca_data_notificacio) IS fianca_data_notificacio),
    fianca_num_registre        TEXT,
    devolucio_data_sollicitud  TEXT CHECK (devolucio_data_sollicitud IS NULL OR date(devolucio_data_sollicitud) IS devolucio_data_sollicitud),
    devolucio_data_cobrament   TEXT CHECK (devolucio_data_cobrament IS NULL OR date(devolucio_data_cobrament) IS devolucio_data_cobrament),
    devolucio_import           NUMERIC,
    devolucio_motiu            TEXT,
    comentaris                 TEXT,
    afegit_el                  TEXT,
    ultima_mod                 TEXT,
    CHECK (data_fi IS NULL OR data_fi >= data_inici),
    CHECK (d_fi_prevista >= data_inici),
    CHECK (data_ultima_revisio >= data_inici),
    CHECK (id_inquili_2 IS NULL OR id_inquili_2 <> id_inquili),
    -- Fiança: o les dues dades o cap.
    CHECK ((fianca_nc IS NULL) = (fianca_data_model2 IS NULL)),
    CHECK ((fianca_num_registre IS NULL) = (fianca_data_notificacio IS NULL)),
    -- La devolució només es pot informar amb el contracte tancat.
    CHECK (data_fi IS NOT NULL OR (
        devolucio_data_sollicitud IS NULL AND devolucio_data_cobrament IS NULL
        AND devolucio_import IS NULL AND devolucio_motiu IS NULL)),
    FOREIGN KEY (id_inmoble)   REFERENCES inmobles(id),
    FOREIGN KEY (id_inquili)   REFERENCES inquilins(id),
    FOREIGN KEY (id_inquili_2) REFERENCES inquilins(id)
);

CREATE INDEX idx_contractes_inmoble ON contractes (id_inmoble, data_inici);

CREATE TABLE documents_contracte (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_contracte  INTEGER NOT NULL,
    id_tipus      INTEGER NOT NULL,
    nom_original  TEXT NOT NULL,
    ruta          TEXT NOT NULL,
    afegit_el     TEXT NOT NULL DEFAULT (datetime('now')),
    comentaris    TEXT,
    data_document TEXT CHECK (data_document IS NULL OR date(data_document) IS data_document),
    ultima_mod    TEXT,
    FOREIGN KEY (id_contracte) REFERENCES contractes(id) ON DELETE CASCADE,
    -- Sense ON DELETE: no es pot esborrar un tipus de document en ús.
    FOREIGN KEY (id_tipus) REFERENCES tipus_document(id)
);

CREATE INDEX idx_documents_contracte ON documents_contracte (id_contracte);
CREATE INDEX idx_documents_tipus ON documents_contracte (id_tipus);

-- Un immoble no pot tenir contractes amb períodes solapats (el dia final és inclusiu;
-- data_fi buida = vigent). Només intervenen data_inici i data_fi.
CREATE TRIGGER contractes_no_solapar_ins
BEFORE INSERT ON contractes
BEGIN
    SELECT RAISE(ABORT, 'El període se solapa amb un altre contracte d''aquest immoble')
    WHERE EXISTS (
        SELECT 1 FROM contractes c
        WHERE c.id_inmoble = NEW.id_inmoble
          AND NEW.data_inici <= COALESCE(c.data_fi, '9999-12-31')
          AND COALESCE(NEW.data_fi, '9999-12-31') >= c.data_inici
    );
END;

CREATE TRIGGER contractes_no_solapar_upd
BEFORE UPDATE ON contractes
BEGIN
    SELECT RAISE(ABORT, 'El període se solapa amb un altre contracte d''aquest immoble')
    WHERE EXISTS (
        SELECT 1 FROM contractes c
        WHERE c.id_inmoble = NEW.id_inmoble
          AND c.id <> NEW.id
          AND NEW.data_inici <= COALESCE(c.data_fi, '9999-12-31')
          AND COALESCE(NEW.data_fi, '9999-12-31') >= c.data_inici
    );
END;

-- Camps d'auditoria (UTC), com a la resta de taules.
CREATE TRIGGER contractes_afegit_el AFTER INSERT ON contractes
WHEN NEW.afegit_el IS NULL
BEGIN
    UPDATE contractes SET afegit_el = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER contractes_ultima_mod AFTER UPDATE ON contractes
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE contractes SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER documents_contracte_ultima_mod AFTER UPDATE ON documents_contracte
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE documents_contracte SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER tipus_document_afegit_el AFTER INSERT ON tipus_document
WHEN NEW.afegit_el IS NULL
BEGIN
    UPDATE tipus_document SET afegit_el = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER tipus_document_ultima_mod AFTER UPDATE ON tipus_document
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE tipus_document SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;
