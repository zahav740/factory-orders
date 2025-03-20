"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_operation_entity_1 = require("./entities/order-operation.entity");
let OrdersService = class OrdersService {
    constructor(orderRepository, operationRepository) {
        this.orderRepository = orderRepository;
        this.operationRepository = operationRepository;
    }
    async create(createOrderDto) {
        const { operations } = createOrderDto, orderData = __rest(createOrderDto, ["operations"]);
        const newOrder = this.orderRepository.create(Object.assign(Object.assign({}, orderData), { start_date: orderData.start_date ? new Date(orderData.start_date) : new Date(), deadline: new Date(orderData.deadline) }));
        const savedOrder = await this.orderRepository.save(newOrder);
        if (operations === null || operations === void 0 ? void 0 : operations.length) {
            const ops = operations.map((op) => this.operationRepository.create({
                op_number: op.op_number,
                op_time: op.op_time,
                op_axes: op.op_axes,
                assigned_machine: op.assigned_machine,
                start_date: op.start_date ? new Date(op.start_date) : undefined,
                end_date: op.end_date ? new Date(op.end_date) : undefined,
                order: savedOrder,
            }));
            await this.operationRepository.save(ops);
        }
        return this.findOne(savedOrder.id);
    }
    async findAll() {
        return this.orderRepository.find({ relations: ['operations'] });
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['operations'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async update(id, updateData, operations) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const allowedFields = [
            'machine_name', 'blueprint_number', 'start_date', 'deadline',
            'quantity', 'pdf_path', 'drawing_url', 'preview_url',
            'estimated_completion', 'estimated_workdays', 'will_meet_deadline',
            'time_margin', 'completed_quantity', 'remaining_quantity',
            'priority', 'material_type', 'status'
        ];
        const sanitizedUpdate = {};
        for (const key of Object.keys(updateData)) {
            if (allowedFields.includes(key)) {
                sanitizedUpdate[key] = updateData[key];
            }
            else {
                console.log(`Поле '${key}' не допустимо для обновления и будет проигнорировано`);
            }
        }
        if (sanitizedUpdate.start_date) {
            sanitizedUpdate.start_date = new Date(sanitizedUpdate.start_date);
        }
        if (sanitizedUpdate.deadline) {
            sanitizedUpdate.deadline = new Date(sanitizedUpdate.deadline);
        }
        if (sanitizedUpdate.estimated_completion) {
            sanitizedUpdate.estimated_completion = new Date(sanitizedUpdate.estimated_completion);
        }
        await this.orderRepository.update(id, sanitizedUpdate);
        if (operations && operations.length >= 0) {
            await this.operationRepository.delete({ order: { id } });
            if (operations.length > 0) {
                const operationsToSave = operations.map(op => this.operationRepository.create({
                    op_number: op.op_number,
                    op_time: op.op_time,
                    op_axes: op.op_axes,
                    assigned_machine: op.assigned_machine,
                    start_date: op.start_date ? new Date(op.start_date) : undefined,
                    end_date: op.end_date ? new Date(op.end_date) : undefined,
                    order: { id }
                }));
                await this.operationRepository.save(operationsToSave);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.operationRepository.delete({ order: { id } });
        await this.orderRepository.delete(id);
        return { message: 'Order and operations deleted' };
    }
};
OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_operation_entity_1.OrderOperation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders.service.js.map