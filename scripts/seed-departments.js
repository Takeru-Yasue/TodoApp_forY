"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const department_entity_1 = require("../src/departments/entities/department.entity");
const user_entity_1 = require("../src/users/entities/user.entity");
const todo_entity_1 = require("../src/todos/entities/todo.entity");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [department_entity_1.Department, user_entity_1.User, todo_entity_1.Todo],
    synchronize: false,
});
const INITIAL_DEPARTMENTS = [
    { name: '1年1組', description: '1年1組' },
    { name: '1年2組', description: '1年2組' },
    { name: '2年1組', description: '2年1組' },
    { name: '2年2組', description: '2年2組' },
    { name: '3年1組', description: '3年1組' },
    { name: '3年2組', description: '3年2組' },
    { name: '生徒会', description: '生徒会役員' },
    { name: '委員会', description: '各種委員会' },
];
async function seed() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(department_entity_1.Department);
    for (const dept of INITIAL_DEPARTMENTS) {
        const exists = await repo.findOne({ where: { name: dept.name } });
        if (!exists) {
            await repo.save(repo.create(dept));
            console.log(`✅ 部署追加: ${dept.name}`);
        }
        else {
            console.log(`⏭️  スキップ（既存）: ${dept.name}`);
        }
    }
    await AppDataSource.destroy();
    console.log('シード完了');
}
seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed-departments.js.map