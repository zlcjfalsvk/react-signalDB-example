export interface Folder {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
  todos?: Todo[];
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  folderId: string;
  createdAt: Date;
}