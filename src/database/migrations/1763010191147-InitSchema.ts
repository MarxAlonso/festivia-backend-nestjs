import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1763010191147 implements MigrationInterface {
    name = 'InitSchema1763010191147'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."templates_type_enum" AS ENUM('wedding_classic', 'wedding_modern', 'birthday_fun', 'birthday_elegant', 'corporate_formal', 'corporate_casual', 'custom')`);
        await queryRunner.query(`CREATE TYPE "public"."templates_status_enum" AS ENUM('active', 'inactive', 'draft')`);
        await queryRunner.query(`CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "type" "public"."templates_type_enum" NOT NULL, "status" "public"."templates_status_enum" NOT NULL DEFAULT 'active', "design" jsonb NOT NULL, "content" jsonb, "price" numeric(10,2) NOT NULL DEFAULT '0', "previewImage" character varying, "eventId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."guests_type_enum" AS ENUM('adult', 'child', 'infant')`);
        await queryRunner.query(`CREATE TYPE "public"."guests_status_enum" AS ENUM('pending', 'confirmed', 'declined', 'maybe')`);
        await queryRunner.query(`CREATE TABLE "guests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "phone" character varying, "type" "public"."guests_type_enum" NOT NULL DEFAULT 'adult', "status" "public"."guests_status_enum" NOT NULL DEFAULT 'pending', "plusOne" boolean, "plusOneName" character varying, "dietaryRestrictions" text, "notes" text, "invitationId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4948267e93869ddcc6b340a2c46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_type_enum" AS ENUM('digital', 'printed', 'hybrid')`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum" AS ENUM('draft', 'sent', 'delivered', 'viewed', 'expired')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "message" text, "type" "public"."invitations_type_enum" NOT NULL DEFAULT 'digital', "status" "public"."invitations_status_enum" NOT NULL DEFAULT 'draft', "eventId" uuid NOT NULL, "createdById" uuid NOT NULL, "templateId" uuid, "customDesign" jsonb, "qrCode" character varying, "uniqueLink" character varying, "sentAt" TIMESTAMP, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_type_enum" AS ENUM('wedding', 'birthday', 'corporate', 'graduation', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "type" "public"."events_type_enum" NOT NULL, "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft', "eventDate" TIMESTAMP NOT NULL, "location" character varying, "address" jsonb, "settings" jsonb, "coverImage" character varying, "organizerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'organizer', 'provider', 'guest')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'pending')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phone" character varying, "avatar" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'organizer', "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending', "metadata" jsonb, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."rsvps_status_enum" AS ENUM('attending', 'not_attending', 'maybe')`);
        await queryRunner.query(`CREATE TABLE "rsvps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "guestId" uuid NOT NULL, "invitationId" uuid NOT NULL, "status" "public"."rsvps_status_enum" NOT NULL, "numberOfGuests" integer, "notes" text, "preferences" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d5dda5a5f9fc2f6ba17eefbf86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash', 'digital_wallet')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_provider_enum" AS ENUM('culqi', 'mercadopago', 'stripe', 'paypal')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "method" "public"."payments_method_enum" NOT NULL, "provider" "public"."payments_provider_enum" NOT NULL, "userId" uuid, "eventId" uuid, "templateId" uuid, "providerTransactionId" character varying, "providerResponse" jsonb, "metadata" jsonb, "failureReason" text, "paidAt" TIMESTAMP, "refundedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_af929a5f2a400fdb6913b4967e1" UNIQUE ("orderId"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "templates" ADD CONSTRAINT "FK_966a76161f12900849c9a559c19" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guests" ADD CONSTRAINT "FK_f1a1e3ce7ddcd20c0d27a61b86b" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_8dfdd031adb35b7e19733430b6f" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_d5bc6e2af606d5aaaa4ef4e6be5" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_0aad0a3d2486c04dea163f7fe51" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_1024d476207981d1c72232cf3ca" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rsvps" ADD CONSTRAINT "FK_022ebe5463d80df2a8b8db2af16" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rsvps" ADD CONSTRAINT "FK_3f66175f48c60c4c54c70ce6b71" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rsvps" DROP CONSTRAINT "FK_3f66175f48c60c4c54c70ce6b71"`);
        await queryRunner.query(`ALTER TABLE "rsvps" DROP CONSTRAINT "FK_022ebe5463d80df2a8b8db2af16"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_1024d476207981d1c72232cf3ca"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_0aad0a3d2486c04dea163f7fe51"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_d5bc6e2af606d5aaaa4ef4e6be5"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_8dfdd031adb35b7e19733430b6f"`);
        await queryRunner.query(`ALTER TABLE "guests" DROP CONSTRAINT "FK_f1a1e3ce7ddcd20c0d27a61b86b"`);
        await queryRunner.query(`ALTER TABLE "templates" DROP CONSTRAINT "FK_966a76161f12900849c9a559c19"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "rsvps"`);
        await queryRunner.query(`DROP TYPE "public"."rsvps_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."events_type_enum"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_type_enum"`);
        await queryRunner.query(`DROP TABLE "guests"`);
        await queryRunner.query(`DROP TYPE "public"."guests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."guests_type_enum"`);
        await queryRunner.query(`DROP TABLE "templates"`);
        await queryRunner.query(`DROP TYPE "public"."templates_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."templates_type_enum"`);
    }

}
