CREATE TABLE inmobles (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    via              TEXT NOT NULL,
    num_via          TEXT NOT NULL,
    pis              TEXT NOT NULL,
    porta            TEXT,
    codi_postal      TEXT NOT NULL,
    localitat        TEXT NOT NULL,
    provincia        TEXT NOT NULL,
    ref_catastral    TEXT NOT NULL,
    superficie_m2    NUMERIC NOT NULL,
    superficie_pati  NUMERIC,
    cert_en_reg      TEXT,
    cert_en_class    TEXT,
    cert_en_data     TEXT,   -- fecha ISO AAAA-MM-DD
    cert_en_caduc    TEXT,
    ced_hab_reg      TEXT,
    ced_hab_data     TEXT,
    ced_hab_caduc    TEXT
, afegit_el TEXT, ultima_mod TEXT);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE inquilins (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nom              TEXT,
    cognoms          TEXT,
    nif              TEXT,
    telefon_1        TEXT,
    ck_tel1_wassap   INTEGER CHECK (ck_tel1_wassap IN (0,1)),
    ck_tel1_bizum    INTEGER CHECK (ck_tel1_bizum IN (0,1))
, afegit_el TEXT, ultima_mod TEXT);
CREATE TABLE contractes (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_inmoble       INTEGER NOT NULL,
    data_inici       TEXT NOT NULL CHECK (date(data_inici) = data_inici),
    data_fi          TEXT CHECK (data_fi IS NULL OR date(data_fi) = data_fi),
    id_inquili       INTEGER NOT NULL,
    d_fi_prevista    TEXT NOT NULL CHECK (date(d_fi_prevista) = d_fi_prevista),
    lloguer_inicial  NUMERIC NOT NULL,
    comentaris       TEXT, afegit_el TEXT, ultima_mod TEXT,
    CHECK (data_fi IS NULL OR data_fi >= data_inici),
    CHECK (d_fi_prevista >= data_inici),
    FOREIGN KEY (id_inmoble) REFERENCES inmobles(id),
    FOREIGN KEY (id_inquili) REFERENCES inquilins(id)
);
CREATE INDEX idx_contractes_inmoble ON contractes (id_inmoble, data_inici);
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
CREATE TABLE documents_contracte (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_contracte  INTEGER NOT NULL,
    tipus         TEXT NOT NULL DEFAULT 'altres'
                  CHECK (tipus IN ('contracte','annex','fiança','rebut','altres')),
    nom_original  TEXT NOT NULL,
    ruta          TEXT NOT NULL,
    afegit_el     TEXT NOT NULL DEFAULT (datetime('now')),
    comentaris    TEXT, data_document TEXT
    CHECK (data_document IS NULL OR date(data_document) = data_document), ultima_mod TEXT,
    FOREIGN KEY (id_contracte) REFERENCES contractes(id) ON DELETE CASCADE
);
CREATE INDEX idx_documents_contracte ON documents_contracte (id_contracte);
CREATE TRIGGER inmobles_afegit_el AFTER INSERT ON inmobles
WHEN NEW.afegit_el IS NULL
BEGIN
    UPDATE inmobles SET afegit_el = datetime('now') WHERE id = NEW.id;
END;
CREATE TRIGGER inquilins_afegit_el AFTER INSERT ON inquilins
WHEN NEW.afegit_el IS NULL
BEGIN
    UPDATE inquilins SET afegit_el = datetime('now') WHERE id = NEW.id;
END;
CREATE TRIGGER contractes_afegit_el AFTER INSERT ON contractes
WHEN NEW.afegit_el IS NULL
BEGIN
    UPDATE contractes SET afegit_el = datetime('now') WHERE id = NEW.id;
END;
CREATE TRIGGER inmobles_ultima_mod AFTER UPDATE ON inmobles
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE inmobles SET ultima_mod = datetime('now') WHERE id = NEW.id;
END;
CREATE TRIGGER inquilins_ultima_mod AFTER UPDATE ON inquilins
WHEN NEW.ultima_mod IS OLD.ultima_mod
BEGIN
    UPDATE inquilins SET ultima_mod = datetime('now') WHERE id = NEW.id;
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
