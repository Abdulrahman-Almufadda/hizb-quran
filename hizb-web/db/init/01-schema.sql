-- Runs once, the first time the Postgres container starts with an empty data volume.
CREATE TABLE surahs (
    id         integer PRIMARY KEY,
    name_ar    text    NOT NULL,
    name_en    text,
    ayah_count integer NOT NULL
);

CREATE TABLE ayahs (
    id            integer PRIMARY KEY,
    surah_id      integer NOT NULL REFERENCES surahs (id),
    ayah_number   integer NOT NULL,
    text_ar       text    NOT NULL,
    text_ar_plain text    NOT NULL,   -- diacritics stripped, alef/yaa normalized (used by search)
    page          integer NOT NULL,   -- Mushaf page 1..604
    UNIQUE (surah_id, ayah_number)
);
CREATE INDEX ix_ayahs_page ON ayahs (page);
CREATE INDEX ix_ayahs_fts ON ayahs USING gin (to_tsvector('simple', text_ar_plain));

CREATE TABLE bookmarks (
    id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    surah_id    integer     NOT NULL REFERENCES surahs (id),
    ayah_number integer     NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    note        text,
    UNIQUE (surah_id, ayah_number)
);
