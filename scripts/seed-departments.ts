/**
 * 部署の初期データを投入するシードスクリプト
 * 使い方: npx ts-node scripts/partments.ts
 *
 * ※ DATABASE_URL 環境変数が必要です（.env が読み込まれます）
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Department } from '../src/departments/entities/department.entity';
import { User } from '../src/users/entities/user.entity';
import { Todo } from '../src/todos/entities/todo.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Department, User, Todo],
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
  const repo = AppDataSource.getRepository(Department);

  for (const dept of INITIAL_DEPARTMENTS) {
    const exists = await repo.findOne({ where: { name: dept.name } });
    if (!exists) {
      await repo.save(repo.create(dept));
      console.log(`✅ 部署追加: ${dept.name}`);
    } else {
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
