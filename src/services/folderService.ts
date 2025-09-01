import { foldersCollection, todosCollection } from '../db/collections';
import { Folder } from '../types/folder';

export const folderService = {
  // Create a new folder
  createFolder: (name: string, parentId: string = 'root', color: string = '#3B82F6') => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    foldersCollection.insert(newFolder);
    return newFolder;
  },

  // Update folder (name or color)
  updateFolder: (id: string, updates: { name?: string; color?: string }) => {
    const updateData: any = { updatedAt: new Date() };
    if (updates.name) updateData.name = updates.name;
    if (updates.color) updateData.color = updates.color;
    
    foldersCollection.updateOne({ id }, { $set: updateData });
  },

  // Delete folder and all its children (folders and todos)
  deleteFolder: (id: string) => {
    if (id === 'root') {
      console.error('Cannot delete root folder');
      return;
    }

    // Get all child folders recursively
    const getAllChildFolders = (parentId: string): string[] => {
      const childFolders = foldersCollection.find({ parentId }).fetch();
      let allChildIds = childFolders.map(f => f.id);
      
      childFolders.forEach(folder => {
        allChildIds = [...allChildIds, ...getAllChildFolders(folder.id)];
      });
      
      return allChildIds;
    };

    const folderIdsToDelete = [id, ...getAllChildFolders(id)];
    
    // Delete all todos in these folders
    folderIdsToDelete.forEach(folderId => {
      todosCollection.removeMany({ folderId });
    });
    
    // Delete all folders
    folderIdsToDelete.forEach(folderId => {
      foldersCollection.removeOne({ id: folderId });
    });
  },

  // Move folder to a new parent
  moveFolder: (folderId: string, newParentId: string) => {
    if (folderId === 'root') {
      console.error('Cannot move root folder');
      return;
    }

    // Check for circular reference
    const isDescendant = (parentId: string, checkId: string): boolean => {
      if (parentId === checkId) return true;
      const parent = foldersCollection.findOne({ id: parentId });
      if (!parent || !parent.parentId) return false;
      return isDescendant(parent.parentId, checkId);
    };

    if (isDescendant(newParentId, folderId)) {
      console.error('Cannot move folder to its own descendant');
      return;
    }

    foldersCollection.updateOne(
      { id: folderId },
      { $set: { parentId: newParentId, updatedAt: new Date() } }
    );
  },

  // Get all folders
  getAllFolders: () => {
    return foldersCollection.find({}).fetch();
  },

  // Get folder by ID
  getFolderById: (id: string) => {
    return foldersCollection.findOne({ id });
  },

  // Get child folders
  getChildFolders: (parentId: string) => {
    return foldersCollection.find({ parentId }).fetch();
  }
};