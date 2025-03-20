import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddFieldsToOrderOperation1679258567890 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
