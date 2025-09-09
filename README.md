## Trello Clone API (TypeScript + Express + TypeORM)

シンプルな Trello 風のリスト/カード管理 API です。Express、TypeORM、SQLite を使用し、最小構成で CRUD と並び順（position）を扱えます。

### 主な機能

- リストの作成・取得・更新(複数同時)・削除
- カードの作成・取得・更新(複数同時)・削除
- 各リソースは `position` により並び順を保持
- SQLite ファイルでローカル実行が容易

## 技術スタック

- Runtime: Node.js
- Language: TypeScript
- Web Framework: Express 5
- ORM: TypeORM 0.3
- DB: SQLite (`trello-clone.sqlite`)
- Dev: ts-node-dev

## 動作要件

- Node.js 18 以上を推奨
- npm / pnpm / yarn のいずれか

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバ起動（ホットリロード）
npm run dev
```

- サーバは `http://localhost:8888` で起動します。
- 初回起動時に `trello-clone.sqlite` がリポジトリ直下に作成・更新されます。

## スクリプト

- `npm run dev`: ts-node-dev で開発サーバを起動（ホットリロード）

## ディレクトリ構成（抜粋）

```
entities/
  ├─ card.entity.ts
  └─ list.entity.ts
datasource.ts
index.ts
trello-clone.sqlite  ← 実行時に作成/更新
```

## 環境・データベース

`TypeORM` のデータソース設定は `datasource.ts` に定義されています。

```
 type: sqlite
 database: trello-clone.sqlite
 synchronize: true
 entities: entities/*.entity.ts
```

- `synchronize: true` のため、起動時にエンティティ定義に基づいてテーブルが同期されます（本番では無効化推奨）。

## エンティティ概要

### List

- `id: number` (PK)
- `title: string`
- `position: number`
- `cards: Card[]` (1 対多、cascade: true)
- `createdAt: Date`
- `updatedAt: Date`

### Card

- `id: number` (PK)
- `title: string`
- `description?: string`
- `position: number`
- `completed: boolean` (既定: false)
- `dueDate?: Date`
- `listId: number` (FK)
- `list: List` (多対 1, onDelete: CASCADE)
- `createdAt: Date`
- `updatedAt: Date`

## API 仕様

ベース URL: `http://localhost:8888`

### ヘルスチェック

- GET `/` → `"Hello World"`

### リスト

- GET `/lists` → 位置順で全件取得
- POST `/lists` → リスト作成（`position` は自動採番）
  - Body: `{ "title": string }`
- PUT `/lists` → 複数/単一のリストを一括更新
  - Body 例: `{ "lists": [{ "id": number, "title": string, "position": number }, ...] }`
- DELETE `/lists/:id` → リスト削除（存在しない場合は 404）

### カード

- GET `/cards` → 位置順で全件取得
- POST `/cards` → カード作成（同一 `listId` 内で `position` 自動採番）
  - Body: `{ "title": string, "listId": number }`
- PUT `/cards` → 複数/単一のカードを一括更新
  - Body 例: `{ "cards": [{ "id": number, "title"?: string, "position"?: number, "listId"?: number, "completed"?: boolean, "description"?: string, "dueDate"?: string }, ...] }`
- DELETE `/cards/:id` → カード削除（存在しない場合は 404）

## リクエスト/レスポンス例（curl）

### リスト取得

```bash
curl -s http://localhost:8888/lists | jq
```

### リスト作成

```bash
curl -s -X POST http://localhost:8888/lists \
  -H 'Content-Type: application/json' \
  -d '{"title":"バックログ"}' | jq
```

### リスト一括更新（position や title の更新）

```bash
curl -s -X PUT http://localhost:8888/lists \
  -H 'Content-Type: application/json' \
  -d '{
    "lists": [
      { "id": 1, "title": "やること", "position": 0 },
      { "id": 2, "title": "作業中", "position": 1 }
    ]
  }' | jq
```

### リスト削除

```bash
curl -s -X DELETE http://localhost:8888/lists/1 | jq
```

### カード取得

```bash
curl -s http://localhost:8888/cards | jq
```

### カード作成（listId 必須）

```bash
curl -s -X POST http://localhost:8888/cards \
  -H 'Content-Type: application/json' \
  -d '{"title":"APIを実装する","listId":1}' | jq
```

### カード一括更新

```bash
curl -s -X PUT http://localhost:8888/cards \
  -H 'Content-Type: application/json' \
  -d '{
    "cards": [
      { "id": 1, "title": "単体テストを書く", "position": 0, "listId": 1 },
      { "id": 2, "title": "E2Eを準備", "position": 1, "listId": 1, "completed": true }
    ]
  }' | jq
```

### カード削除

```bash
curl -s -X DELETE http://localhost:8888/cards/1 | jq
```

## CORS

`index.ts` で `cors()` を利用しています。必要に応じて許可オリジン等のオプションを設定してください。

## エラーハンドリング

- 500: サーバ内部エラー時に `{ message: "サーバーエラーが発生しました" }` を返します。
- 404: 削除対象が存在しない場合に返します。

## 開発のヒント

- 並び替えは `position` を更新することで実現できます。PUT の一括更新エンドポイントを利用すると効率よく更新可能です。
- 本番運用では `synchronize: false` にし、マイグレーション運用を推奨します。

## ライセンス

ISC
