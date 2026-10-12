-- Esquema inicial: histórico de avaliações e auditoria (Fase 6).
-- Cada avaliação guarda a versão da base de conhecimento (kjar) e o rasto das regras disparadas,
-- para que a decisão possa ser reconstruída mesmo depois de as regras mudarem.

create table avaliacao (
    id                      uuid            primary key,
    pedido_id               varchar(64)     not null,
    criada_em               timestamp       not null,
    loja_codigo             varchar(32),
    colaborador_id          varchar(64),
    versao_base_conhecimento varchar(200)   not null,
    elegibilidade           varchar(20),
    tipo_verificacao        varchar(20),
    tipo_transacao          varchar(30),
    valor_devolucao         numeric(12, 2),
    base_valor              varchar(30),
    meio_reembolso          varchar(30),
    aprovacao               varchar(30),
    processo                varchar(30),
    terminal                boolean         not null default false,
    excecao_recusada        boolean         not null default false,
    pedido_json             jsonb           not null,
    indicadores_fraude_json jsonb           not null default '[]'::jsonb,
    decisao_json            jsonb           not null
);

create index ix_avaliacao_pedido on avaliacao (pedido_id);
create index ix_avaliacao_criada_em on avaliacao (criada_em desc);
create index ix_avaliacao_loja on avaliacao (loja_codigo);

create table registo_regra (
    id              bigserial       primary key,
    avaliacao_id    uuid            not null references avaliacao (id) on delete cascade,
    ordem           integer         not null,
    codigo_regra    varchar(20)     not null,
    nome_regra      varchar(200)    not null,
    modulo          varchar(20),
    artigo_id       varchar(64),
    resultado       varchar(20),
    mensagem        text,
    instante        timestamp       not null,
    constraint uk_registo_regra_ordem unique (avaliacao_id, ordem)
);

create index ix_registo_regra_codigo on registo_regra (codigo_regra);

create table excecao_aprovada (
    id                  uuid            primary key,
    avaliacao_id        uuid            not null references avaliacao (id) on delete cascade,
    registada_em        timestamp       not null,
    motivo              text,
    aprovador           varchar(200),
    valor               numeric(12, 2),
    resultado           varchar(30),
    preocupacao_cliente text,
    destino_produto     varchar(200),
    registo             text            not null
);

create index ix_excecao_aprovada_avaliacao on excecao_aprovada (avaliacao_id);
