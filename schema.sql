-- =====================================================================
-- Schema REST API Pencatatan Peminjaman Buku Perpustakaan
-- Jalankan di Supabase: SQL Editor -> New query -> paste -> Run
-- =====================================================================

-- Ekstensi untuk gen_random_uuid()
create extension if not exists pgcrypto;

-- Tipe enum status peminjaman
create type status_peminjaman as enum ('Dipinjam', 'Dikembalikan', 'Terlambat');

-- ---------------------------------------------------------------------
-- Tabel: anggota (anggota perpustakaan yang meminjam buku)
-- ---------------------------------------------------------------------
create table if not exists anggota (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  nim        text not null unique,
  email      text unique,
  no_hp      text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tabel: buku (koleksi buku yang dapat dipinjam)
-- ---------------------------------------------------------------------
create table if not exists buku (
  id           uuid primary key default gen_random_uuid(),
  judul        text not null,
  penulis      text not null,
  isbn         text unique,
  tahun_terbit int,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tabel: peminjaman (data peminjaman buku oleh anggota)
-- ---------------------------------------------------------------------
create table if not exists peminjaman (
  id                  uuid primary key default gen_random_uuid(),
  anggota_id          uuid not null references anggota(id) on delete cascade,
  buku_id             uuid not null references buku(id) on delete cascade,
  tanggal_pinjam      date not null default current_date,
  tanggal_jatuh_tempo date not null,
  tanggal_kembali     date,
  status              status_peminjaman not null default 'Dipinjam',
  created_at          timestamptz not null default now()
);

create index if not exists idx_peminjaman_status on peminjaman(status);
create index if not exists idx_peminjaman_anggota on peminjaman(anggota_id);
create index if not exists idx_peminjaman_buku on peminjaman(buku_id);

-- ---------------------------------------------------------------------
-- Trigger: hitung status otomatis berdasarkan tanggal
--   - tanggal_kembali terisi          -> 'Dikembalikan'
--   - lewat jatuh tempo & belum kembali -> 'Terlambat'
--   - lainnya                          -> 'Dipinjam'
-- ---------------------------------------------------------------------
create or replace function set_status_peminjaman()
returns trigger as $$
begin
  if new.tanggal_kembali is not null then
    new.status := 'Dikembalikan'::status_peminjaman;
  elsif new.tanggal_jatuh_tempo < current_date then
    new.status := 'Terlambat'::status_peminjaman;
  else
    new.status := 'Dipinjam'::status_peminjaman;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_status_peminjaman on peminjaman;
create trigger trg_set_status_peminjaman
before insert or update on peminjaman
for each row execute function set_status_peminjaman();

-- ---------------------------------------------------------------------
-- Seed data contoh (opsional, hapus jika tidak diperlukan)
-- ---------------------------------------------------------------------
insert into anggota (nama, nim, email, no_hp) values
  ('Budi Santoso',  '24060119120001', 'budi.santoso@student.undip.ac.id', '081234567890'),
  ('Siti Nurhaliza','24060119120002', 'siti.nurhaliza@student.undip.ac.id', '081234567891'),
  ('Ahmad Fauzi',   '24060119120003', 'ahmad.fauzi@student.undip.ac.id', '081234567892')
on conflict (nim) do nothing;

insert into buku (judul, penulis, isbn, tahun_terbit) values
  ('Pemrograman JavaScript Modern', 'Andi Wijaya',  '978-602-01-1234-5', 2022),
  ('Basis Data Relasional',         'Rina Kartika', '978-602-01-5678-9', 2021),
  ('Jaringan Komputer',             'Budi Raharjo', '978-602-01-9876-5', 2020),
  ('Struktur Data dan Algoritma',   'Dewi Lestari', '978-602-01-1111-3', 2023)
on conflict (isbn) do nothing;

-- Peminjaman dengan tanggal relatif agar selalu merepresentasikan
-- ketiga status: Terlambat, Dipinjam, dan Dikembalikan.
insert into peminjaman (anggota_id, buku_id, tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali) values
  ((select id from anggota where nim = '24060119120001'),
   (select id from buku where isbn = '978-602-01-1234-5'),
   current_date - 10, current_date - 3, null),

  ((select id from anggota where nim = '24060119120002'),
   (select id from buku where isbn = '978-602-01-5678-9'),
   current_date - 2, current_date + 5, null),

  ((select id from anggota where nim = '24060119120003'),
   (select id from buku where isbn = '978-602-01-9876-5'),
   current_date - 20, current_date - 13, current_date - 15);
