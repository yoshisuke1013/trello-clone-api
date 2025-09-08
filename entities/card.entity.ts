import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { List } from "./list.entity";

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  position!: number;

  @Column({ default: false })
  completed: boolean = false;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column()
  listId!: number;

  @ManyToOne(() => List, (list) => list.cards, { onDelete: "CASCADE" })
  list!: List;

  @CreateDateColumn()
  readonly createdAt?: Date;

  @UpdateDateColumn()
  readonly updatedAt?: Date;
}
