--
-- PostgreSQL database dump
--

\restrict kw19agrYTJe8BuSBH6DceQqn3nGlkkFhMK4GDmARe1YbPRQDozf0ERQ96wjjIeZ

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accommodations (
    id bigint NOT NULL,
    name character varying(60) NOT NULL,
    slug character varying(60) NOT NULL,
    capacity smallint NOT NULL,
    sort_order smallint DEFAULT '0'::smallint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: COLUMN accommodations.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accommodations.name IS 'Nombre visible: Sencilla, Doble, Triple, Cuádruple';


--
-- Name: COLUMN accommodations.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accommodations.slug IS 'Identificador estable usado por la lógica de negocio';


--
-- Name: COLUMN accommodations.capacity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accommodations.capacity IS 'Número de huéspedes que admite la acomodación';


--
-- Name: COLUMN accommodations.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.accommodations.sort_order IS 'Orden de presentación en la interfaz';


--
-- Name: accommodations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accommodations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accommodations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accommodations_id_seq OWNED BY public.accommodations.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    dane_code character varying(8),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: COLUMN cities.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cities.name IS 'Nombre de la ciudad';


--
-- Name: COLUMN cities.dane_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cities.dane_code IS 'Código DANE oficial del municipio';


--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: hotel_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotel_rooms (
    id bigint NOT NULL,
    hotel_id bigint NOT NULL,
    room_type_id bigint NOT NULL,
    accommodation_id bigint NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT hotel_rooms_quantity_positive CHECK ((quantity > 0))
);


--
-- Name: COLUMN hotel_rooms.hotel_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotel_rooms.hotel_id IS 'Hotel al que pertenece la configuración';


--
-- Name: COLUMN hotel_rooms.room_type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotel_rooms.room_type_id IS 'Tipo de habitación';


--
-- Name: COLUMN hotel_rooms.accommodation_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotel_rooms.accommodation_id IS 'Acomodación asignada al tipo';


--
-- Name: COLUMN hotel_rooms.quantity; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotel_rooms.quantity IS 'Número de habitaciones con esta configuración';


--
-- Name: hotel_rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hotel_rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hotel_rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hotel_rooms_id_seq OWNED BY public.hotel_rooms.id;


--
-- Name: hotels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hotels (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    address character varying(200) NOT NULL,
    city_id bigint NOT NULL,
    nit character varying(20) NOT NULL,
    max_rooms integer NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT hotels_max_rooms_positive CHECK ((max_rooms > 0))
);


--
-- Name: COLUMN hotels.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.name IS 'Razón comercial del hotel; único entre los hoteles activos';


--
-- Name: COLUMN hotels.address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.address IS 'Dirección física del inmueble';


--
-- Name: COLUMN hotels.city_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.city_id IS 'Ciudad donde se ubica el hotel';


--
-- Name: COLUMN hotels.nit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.nit IS 'NIT con dígito de verificación; texto, nunca numérico';


--
-- Name: COLUMN hotels.max_rooms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.max_rooms IS 'Capacidad física declarada: tope de habitaciones configurables';


--
-- Name: COLUMN hotels.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.hotels.deleted_at IS 'Borrado lógico para conservar trazabilidad';


--
-- Name: hotels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hotels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hotels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hotels_id_seq OWNED BY public.hotels.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: room_type_accommodation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_type_accommodation (
    room_type_id bigint NOT NULL,
    accommodation_id bigint NOT NULL
);


--
-- Name: COLUMN room_type_accommodation.room_type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.room_type_accommodation.room_type_id IS 'Tipo de habitación';


--
-- Name: COLUMN room_type_accommodation.accommodation_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.room_type_accommodation.accommodation_id IS 'Acomodación permitida para ese tipo';


--
-- Name: room_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_types (
    id bigint NOT NULL,
    name character varying(60) NOT NULL,
    slug character varying(60) NOT NULL,
    sort_order smallint DEFAULT '0'::smallint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: COLUMN room_types.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.room_types.name IS 'Nombre visible: Estándar, Junior, Suite';


--
-- Name: COLUMN room_types.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.room_types.slug IS 'Identificador estable usado por la lógica de negocio';


--
-- Name: COLUMN room_types.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.room_types.sort_order IS 'Orden de presentación en la interfaz';


--
-- Name: room_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_types_id_seq OWNED BY public.room_types.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: accommodations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations ALTER COLUMN id SET DEFAULT nextval('public.accommodations_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: hotel_rooms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_rooms ALTER COLUMN id SET DEFAULT nextval('public.hotel_rooms_id_seq'::regclass);


--
-- Name: hotels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotels ALTER COLUMN id SET DEFAULT nextval('public.hotels_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: room_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types ALTER COLUMN id SET DEFAULT nextval('public.room_types_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accommodations (id, name, slug, capacity, sort_order, created_at, updated_at) FROM stdin;
1	Sencilla	sencilla	1	1	2026-09-09 23:13:21	2026-09-09 23:13:21
2	Doble	doble	2	2	2026-09-09 23:13:21	2026-09-09 23:13:21
3	Triple	triple	3	3	2026-09-09 23:13:21	2026-09-09 23:13:21
4	Cuádruple	cuadruple	4	4	2026-09-09 23:13:21	2026-09-09 23:13:21
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cache (key, value, expiration) FROM stdin;
decameron-hotels-api-cache-5c785c036466adea360111aa28563bfd556b5fba:timer	i:1788997725;	1788997725
decameron-hotels-api-cache-5c785c036466adea360111aa28563bfd556b5fba	i:1;	1788997725
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, name, dane_code, created_at, updated_at) FROM stdin;
1	Barranquilla	08001	2026-09-09 23:13:21	2026-09-09 23:13:21
2	Bogotá D.C.	11001	2026-09-09 23:13:21	2026-09-09 23:13:21
3	Bucaramanga	68001	2026-09-09 23:13:21	2026-09-09 23:13:21
4	Cali	76001	2026-09-09 23:13:21	2026-09-09 23:13:21
5	Cartagena	13001	2026-09-09 23:13:21	2026-09-09 23:13:21
6	Cúcuta	54001	2026-09-09 23:13:21	2026-09-09 23:13:21
7	Girardot	25307	2026-09-09 23:13:21	2026-09-09 23:13:21
8	Medellín	05001	2026-09-09 23:13:21	2026-09-09 23:13:21
9	Melgar	73449	2026-09-09 23:13:21	2026-09-09 23:13:21
10	Montería	23001	2026-09-09 23:13:21	2026-09-09 23:13:21
11	Pereira	66001	2026-09-09 23:13:21	2026-09-09 23:13:21
12	Providencia	88564	2026-09-09 23:13:21	2026-09-09 23:13:21
13	Riohacha	44001	2026-09-09 23:13:21	2026-09-09 23:13:21
14	San Andrés	88001	2026-09-09 23:13:21	2026-09-09 23:13:21
15	Santa Marta	47001	2026-09-09 23:13:21	2026-09-09 23:13:21
16	Santiago de Tolú	70823	2026-09-09 23:13:21	2026-09-09 23:13:21
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: hotel_rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hotel_rooms (id, hotel_id, room_type_id, accommodation_id, quantity, created_at, updated_at) FROM stdin;
1	1	1	1	25	2026-09-09 23:13:21	2026-09-09 23:13:21
2	1	2	3	12	2026-09-09 23:13:21	2026-09-09 23:13:21
3	1	1	2	5	2026-09-09 23:13:21	2026-09-09 23:13:21
4	2	1	2	20	2026-09-09 23:13:21	2026-09-09 23:13:21
5	2	2	4	15	2026-09-09 23:13:21	2026-09-09 23:13:21
6	2	3	3	15	2026-09-09 23:13:21	2026-09-09 23:13:21
7	2	3	1	10	2026-09-09 23:13:21	2026-09-09 23:13:21
8	3	1	2	30	2026-09-09 23:13:21	2026-09-09 23:13:21
9	3	3	2	12	2026-09-09 23:13:21	2026-09-09 23:13:21
\.


--
-- Data for Name: hotels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hotels (id, name, address, city_id, nit, max_rooms, created_at, updated_at, deleted_at) FROM stdin;
1	Decameron Cartagena	Calle 23 58-25	5	12345678-9	42	2026-09-09 23:13:21	2026-09-09 23:13:21	\N
2	Decameron San Luis	Carretera San Luis Km 8	14	900123456-7	60	2026-09-09 23:13:21	2026-09-09 23:13:21	\N
3	Decameron Galeón	Vía Ciénaga Km 12	15	830987654-3	80	2026-09-09 23:13:21	2026-09-09 23:13:21	\N
4	Decameron Barú	Playa Blanca, Isla Barú	5	901456789-1	120	2026-09-09 23:13:21	2026-09-09 23:13:21	\N
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_01_01_000100_create_cities_table	1
5	2025_01_01_000200_create_room_types_table	1
6	2025_01_01_000300_create_accommodations_table	1
7	2025_01_01_000400_create_room_type_accommodation_table	1
8	2025_01_01_000500_create_hotels_table	1
9	2025_01_01_000600_create_hotel_rooms_table	1
10	2026_09_09_225919_create_personal_access_tokens_table	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: room_type_accommodation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_type_accommodation (room_type_id, accommodation_id) FROM stdin;
1	1
1	2
2	3
2	4
3	1
3	2
3	3
\.


--
-- Data for Name: room_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_types (id, name, slug, sort_order, created_at, updated_at) FROM stdin;
1	Estándar	estandar	1	2026-09-09 23:13:21	2026-09-09 23:13:21
2	Junior	junior	2	2026-09-09 23:13:21	2026-09-09 23:13:21
3	Suite	suite	3	2026-09-09 23:13:21	2026-09-09 23:13:21
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) FROM stdin;
1	Gerente de Operaciones	gerente@decameron.test	\N	$2y$12$ahg3Vck122icOlhddN40V.Suh/J5YOpQpLiPk3W8jR2hZVNmFnkj6	\N	2026-09-09 23:13:21	2026-09-09 23:13:21
\.


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
-- Name: accommodations accommodations_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_name_unique UNIQUE (name);


--
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- Name: accommodations accommodations_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_slug_unique UNIQUE (slug);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: cities cities_dane_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_dane_code_unique UNIQUE (dane_code);


--
-- Name: cities cities_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_unique UNIQUE (name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: hotel_rooms hotel_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_pkey PRIMARY KEY (id);


--
-- Name: hotel_rooms hotel_rooms_unique_configuration; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_unique_configuration UNIQUE (hotel_id, room_type_id, accommodation_id);


--
-- Name: hotels hotels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: room_type_accommodation room_type_accommodation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_type_accommodation
    ADD CONSTRAINT room_type_accommodation_pkey PRIMARY KEY (room_type_id, accommodation_id);


--
-- Name: room_types room_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_name_unique UNIQUE (name);


--
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (id);


--
-- Name: room_types room_types_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_slug_unique UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: cities_name_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cities_name_index ON public.cities USING btree (name);


--
-- Name: hotel_rooms_hotel_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hotel_rooms_hotel_id_index ON public.hotel_rooms USING btree (hotel_id);


--
-- Name: hotels_city_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hotels_city_id_index ON public.hotels USING btree (city_id);


--
-- Name: hotels_deleted_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hotels_deleted_at_index ON public.hotels USING btree (deleted_at);


--
-- Name: hotels_name_unique_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX hotels_name_unique_active ON public.hotels USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: hotels_nit_unique_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX hotels_nit_unique_active ON public.hotels USING btree (nit) WHERE (deleted_at IS NULL);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: hotel_rooms hotel_rooms_accommodation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_accommodation_id_foreign FOREIGN KEY (accommodation_id) REFERENCES public.accommodations(id) ON DELETE RESTRICT;


--
-- Name: hotel_rooms hotel_rooms_hotel_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_hotel_id_foreign FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE CASCADE;


--
-- Name: hotel_rooms hotel_rooms_room_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_room_type_id_foreign FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE RESTRICT;


--
-- Name: hotels hotels_city_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_city_id_foreign FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE RESTRICT;


--
-- Name: room_type_accommodation room_type_accommodation_accommodation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_type_accommodation
    ADD CONSTRAINT room_type_accommodation_accommodation_id_foreign FOREIGN KEY (accommodation_id) REFERENCES public.accommodations(id) ON DELETE CASCADE;


--
-- Name: room_type_accommodation room_type_accommodation_room_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_type_accommodation
    ADD CONSTRAINT room_type_accommodation_room_type_id_foreign FOREIGN KEY (room_type_id) REFERENCES public.room_types(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kw19agrYTJe8BuSBH6DceQqn3nGlkkFhMK4GDmARe1YbPRQDozf0ERQ96wjjIeZ

