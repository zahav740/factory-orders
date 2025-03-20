"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFieldsToOrderOperation1679258567890 = void 0;
class AddFieldsToOrderOperation1679258567890 {
    constructor() {
        this.name = 'AddFieldsToOrderOperation1679258567890';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "order_operations" ADD "assigned_machine" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "order_operations" ADD "start_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order_operations" ADD "end_date" TIMESTAMP`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "order_operations" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "order_operations" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "order_operations" DROP COLUMN "assigned_machine"`);
    }
}
exports.AddFieldsToOrderOperation1679258567890 = AddFieldsToOrderOperation1679258567890;
//# sourceMappingURL=1679258567890-AddFieldsToOrderOperation.js.map