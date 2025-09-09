import express from "express";
import cors from "cors";
import { AppDataSource } from "./datasource";
import { List } from "./entities/list.entity";

const listRepository = AppDataSource.getRepository(List);

const app = express();
const PORT = 8888;
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/lists", async (req, res) => {
  try {
    const lists = await listRepository.find({
      order: { position: "ASC" },
    });
    res.status(201).json(lists);
  } catch (error) {
    console.error("リスト取得エラー：", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

app.post("/lists", async (req, res) => {
  try {
    const { title } = req.body;

    const maxPositionListArray = await listRepository.find({
      order: { position: "DESC" },
      take: 1,
    });

    const maxPositionList = maxPositionListArray[0];

    const nextPosition =
      maxPositionList != null ? maxPositionList.position + 1 : 0;

    const list = await listRepository.save({ title, position: nextPosition });

    res.status(201).json(list);
  } catch (error) {
    console.error("リスト作成エラー：", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

app.delete("/lists/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existingList = await listRepository.findOne({ where: { id } });

    if (existingList == null) {
      res.status(404).json({ message: "リストが見つかりませんでした" });
      return;
    }

    await listRepository.delete(id);

    res.status(200).json({ message: "リストを削除しました" });
  } catch (error) {
    console.error("リスト削除エラー：", error);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

AppDataSource.initialize().then(() => {
  console.log("データベースに接続しました");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
