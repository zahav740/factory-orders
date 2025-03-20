import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToOrderOperation1679258567890 implements MigrationInterface {
    name = 'AddFieldsToOrderOperation1679258567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавление поля assigned_machine в таблицу order_operations
        await queryRunner.query(`ALTER TABLE "order_operations" ADD "assigned_machine" character varying(255)`);
        
        // Добавление поля start_date в таблицу order_operations
        await queryRunner.query(`ALTER TABLE "order_operations" ADD "start_date" TIMESTAMP`);
        
        // Добавление поля end_date в таблицу order_operations
        await queryRunner.query(`ALTER TABLE "order_operations" ADD "end_date" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаление полей в обратном порядке при откате миграции
        await queryRunner.query(`ALTER TABLE "order_operations" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "order_operations" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "order_operations" DROP COLUMN "assigned_machine"`);
    }
}
