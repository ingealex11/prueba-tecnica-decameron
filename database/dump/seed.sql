--
-- PostgreSQL database dump
--

\restrict LsagZjybUy8Lk3gOZqyBoDl1y1MtnXFZPHkJE8fces5KCyUye6CFnAiCwsYybE3

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.accommodations (id, name, slug, capacity, sort_order, created_at, updated_at) VALUES (1, 'Sencilla', 'sencilla', 1, 1, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.accommodations (id, name, slug, capacity, sort_order, created_at, updated_at) VALUES (2, 'Doble', 'doble', 2, 2, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.accommodations (id, name, slug, capacity, sort_order, created_at, updated_at) VALUES (3, 'Triple', 'triple', 3, 3, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.accommodations (id, name, slug, capacity, sort_order, created_at, updated_at) VALUES (4, 'Cuádruple', 'cuadruple', 4, 4, '2026-09-09 23:13:21', '2026-09-09 23:13:21');


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cache (key, value, expiration) VALUES ('decameron-hotels-api-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1788997725;', 1788997725);
INSERT INTO public.cache (key, value, expiration) VALUES ('decameron-hotels-api-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1788997725);


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (1, 'Barranquilla', '08001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (2, 'Bogotá D.C.', '11001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (3, 'Bucaramanga', '68001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (4, 'Cali', '76001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (5, 'Cartagena', '13001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (6, 'Cúcuta', '54001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (7, 'Girardot', '25307', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (8, 'Medellín', '05001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (9, 'Melgar', '73449', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (10, 'Montería', '23001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (11, 'Pereira', '66001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (12, 'Providencia', '88564', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (13, 'Riohacha', '44001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (14, 'San Andrés', '88001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (15, 'Santa Marta', '47001', '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.cities (id, name, dane_code, created_at, updated_at) VALUES (16, 'Santiago de Tolú', '70823', '2026-09-09 23:13:21', '2026-09-09 23:13:21');


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: hotels; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hotels (id, name, address, city_id, nit, max_rooms, created_at, updated_at, deleted_at) VALUES (1, 'Decameron Cartagena', 'Calle 23 58-25', 5, '12345678-9', 42, '2026-09-09 23:13:21', '2026-09-09 23:13:21', NULL);
INSERT INTO public.hotels (id, name, address, city_id, nit, max_rooms, created_at, updated_at, deleted_at) VALUES (2, 'Decameron San Luis', 'Carretera San Luis Km 8', 14, '900123456-7', 60, '2026-09-09 23:13:21', '2026-09-09 23:13:21', NULL);
INSERT INTO public.hotels (id, name, address, city_id, nit, max_rooms, created_at, updated_at, deleted_at) VALUES (3, 'Decameron Galeón', 'Vía Ciénaga Km 12', 15, '830987654-3', 80, '2026-09-09 23:13:21', '2026-09-09 23:13:21', NULL);
INSERT INTO public.hotels (id, name, address, city_id, nit, max_rooms, created_at, updated_at, deleted_at) VALUES (4, 'Decameron Barú', 'Playa Blanca, Isla Barú', 5, '901456789-1', 120, '2026-09-09 23:13:21', '2026-09-09 23:13:21', NULL);


--
-- Data for Name: room_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.room_types (id, name, slug, sort_order, created_at, updated_at) VALUES (1, 'Estándar', 'estandar', 1, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.room_types (id, name, slug, sort_order, created_at, updated_at) VALUES (2, 'Junior', 'junior', 2, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.room_types (id, name, slug, sort_order, created_at, updated_at) VALUES (3, 'Suite', 'suite', 3, '2026-09-09 23:13:21', '2026-09-09 23:13:21');


--
-- Data for Name: hotel_rooms; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (1, 1, 1, 1, 25, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (2, 1, 2, 3, 12, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (3, 1, 1, 2, 5, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (4, 2, 1, 2, 20, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (5, 2, 2, 4, 15, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (6, 2, 3, 3, 15, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (7, 2, 3, 1, 10, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (8, 3, 1, 2, 30, '2026-09-09 23:13:21', '2026-09-09 23:13:21');
INSERT INTO public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) VALUES (9, 3, 3, 2, 12, '2026-09-09 23:13:21', '2026-09-09 23:13:21');


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.migrations (id, migration, batch) VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (4, '2025_01_01_000100_create_cities_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (5, '2025_01_01_000200_create_room_types_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (6, '2025_01_01_000300_create_accommodations_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (7, '2025_01_01_000400_create_room_type_accommodation_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (8, '2025_01_01_000500_create_hotels_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (9, '2025_01_01_000600_create_hotel_rooms_table', 1);
INSERT INTO public.migrations (id, migration, batch) VALUES (10, '2026_09_09_225919_create_personal_access_tokens_table', 1);


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: room_type_accommodation; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (1, 1);
INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (1, 2);
INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (2, 3);
INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (2, 4);
INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (3, 1);
INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (3, 2);
INSERT INTO public.room_type_accommodation (room_type_id, accommodation_id) VALUES (3, 3);


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) VALUES (1, 'Gerente de Operaciones', 'gerente@decameron.test', NULL, '$2y$12$ahg3Vck122icOlhddN40V.Suh/J5YOpQpLiPk3W8jR2hZVNmFnkj6', NULL, '2026-09-09 23:13:21', '2026-09-09 23:13:21');


--
-- Name: accommodations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accommodations_id_seq', 4, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cities_id_seq', 16, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: hotel_rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hotel_rooms_id_seq', 10, true);


--
-- Name: hotels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hotels_id_seq', 4, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 10, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: room_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.room_types_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict LsagZjybUy8Lk3gOZqyBoDl1y1MtnXFZPHkJE8fces5KCyUye6CFnAiCwsYybE3

