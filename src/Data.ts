export interface Item {
  id: number;
  kids?: number[];
  text: string;
  title: string;
  by: string;
  url: string;
  descendants: number;
}

export type IndexedItem = {
  index: number;
  id: number;
  item?: Item;
  type: ItemType;
  parentId?: number;
  depth?: number;
  loading?: boolean;
};

export type ItemType = 'comment' | 'story';
