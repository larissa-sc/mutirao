import { MigrationInterface, QueryRunner } from 'typeorm';

export class Inicial1794353055390 implements MigrationInterface {
  name = 'Inicial1794353055390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."categorias_tipo_enum" AS ENUM('material', 'servico', 'documento')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categorias" ("id" SERIAL NOT NULL, "nome" character varying(80) NOT NULL, "tipo" "public"."categorias_tipo_enum" NOT NULL, CONSTRAINT "UQ_de8a2d8979f7820616e31dc1e15" UNIQUE ("nome"), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."historico_status_statusanterior_enum" AS ENUM('solicitado', 'emAnalise', 'aprovado', 'encaminhado', 'atendido', 'negado', 'cancelado')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."historico_status_statusnovo_enum" AS ENUM('solicitado', 'emAnalise', 'aprovado', 'encaminhado', 'atendido', 'negado', 'cancelado')`,
    );
    await queryRunner.query(
      `CREATE TABLE "historico_status" ("id" SERIAL NOT NULL, "pedidoId" integer NOT NULL, "statusAnterior" "public"."historico_status_statusanterior_enum", "statusNovo" "public"."historico_status_statusnovo_enum" NOT NULL, "observacao" text, "responsavelId" integer NOT NULL, "data" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1791a2349274227665a8eb90361" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."usuarios_papel_enum" AS ENUM('morador', 'associacao')`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "firebaseUid" character varying(128) NOT NULL, "nome" character varying(120) NOT NULL, "email" character varying(255) NOT NULL, "papel" "public"."usuarios_papel_enum" NOT NULL DEFAULT 'morador', "dataCriacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c51e8744218e37acb402c7a751c" UNIQUE ("firebaseUid"), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "localizacoes" ("id" SERIAL NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, CONSTRAINT "CHK_e3c6ee918dbad8d7ec512f314d" CHECK ("longitude" BETWEEN -180 AND 180), CONSTRAINT "CHK_6958e6594c2c72d1edf5e250f7" CHECK ("latitude" BETWEEN -90 AND 90), CONSTRAINT "PK_5e2419abda79feb978bbfa7ea41" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "itens" ("id" SERIAL NOT NULL, "nome" character varying(120) NOT NULL, "unidadePadrao" character varying(30) NOT NULL, CONSTRAINT "UQ_37df0f766d449421da9317b2d9d" UNIQUE ("nome"), CONSTRAINT "PK_b090d1e0e0721a15b3f9f0c6f0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pedido_itens" ("id" SERIAL NOT NULL, "pedidoId" integer NOT NULL, "itemId" integer NOT NULL, "quantidade" numeric(12,2) NOT NULL, "unidade" character varying(30) NOT NULL, CONSTRAINT "UQ_240ca3a8e5ae0de0e69c052f0c1" UNIQUE ("pedidoId", "itemId"), CONSTRAINT "CHK_81cb20448c4b9c54632f5d927d" CHECK ("quantidade" > 0), CONSTRAINT "PK_82e4f6ce11df2878bc7a54c5797" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pedidos_status_enum" AS ENUM('solicitado', 'emAnalise', 'aprovado', 'encaminhado', 'atendido', 'negado', 'cancelado')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pedidos" ("id" SERIAL NOT NULL, "categoriaId" integer NOT NULL, "titulo" character varying(120) NOT NULL, "descricao" text, "dataDesejada" date, "localizacaoId" integer, "autorId" integer NOT NULL, "status" "public"."pedidos_status_enum" NOT NULL DEFAULT 'solicitado', "dataCriacao" TIMESTAMP NOT NULL DEFAULT now(), "dataAtualizacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_5cce0b8be8fd11aeb3bcaddfc3" UNIQUE ("localizacaoId"), CONSTRAINT "PK_ebb5680ed29a24efdc586846725" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "historico_status" ADD CONSTRAINT "FK_037452ba6b6e465ca536510eeb1" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "historico_status" ADD CONSTRAINT "FK_f26c8e437a3884b20f94bf03057" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido_itens" ADD CONSTRAINT "FK_4905b2c69d25dcaffa46110e0c0" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido_itens" ADD CONSTRAINT "FK_b31cf3a899b660c595b4ae4330f" FOREIGN KEY ("itemId") REFERENCES "itens"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD CONSTRAINT "FK_15c7cb1a9e995849c77ee2f3adb" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD CONSTRAINT "FK_5cce0b8be8fd11aeb3bcaddfc31" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" ADD CONSTRAINT "FK_3d02706555f9dfa9070fca89e79" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pedidos" DROP CONSTRAINT "FK_3d02706555f9dfa9070fca89e79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" DROP CONSTRAINT "FK_5cce0b8be8fd11aeb3bcaddfc31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedidos" DROP CONSTRAINT "FK_15c7cb1a9e995849c77ee2f3adb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido_itens" DROP CONSTRAINT "FK_b31cf3a899b660c595b4ae4330f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido_itens" DROP CONSTRAINT "FK_4905b2c69d25dcaffa46110e0c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "historico_status" DROP CONSTRAINT "FK_f26c8e437a3884b20f94bf03057"`,
    );
    await queryRunner.query(
      `ALTER TABLE "historico_status" DROP CONSTRAINT "FK_037452ba6b6e465ca536510eeb1"`,
    );
    await queryRunner.query(`DROP TABLE "pedidos"`);
    await queryRunner.query(`DROP TYPE "public"."pedidos_status_enum"`);
    await queryRunner.query(`DROP TABLE "pedido_itens"`);
    await queryRunner.query(`DROP TABLE "itens"`);
    await queryRunner.query(`DROP TABLE "localizacoes"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TYPE "public"."usuarios_papel_enum"`);
    await queryRunner.query(`DROP TABLE "historico_status"`);
    await queryRunner.query(
      `DROP TYPE "public"."historico_status_statusnovo_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."historico_status_statusanterior_enum"`,
    );
    await queryRunner.query(`DROP TABLE "categorias"`);
    await queryRunner.query(`DROP TYPE "public"."categorias_tipo_enum"`);
  }
}
