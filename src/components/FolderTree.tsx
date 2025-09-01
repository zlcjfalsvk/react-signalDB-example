import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Edit2, Trash2, Plus } from 'lucide-react';
import { createUseReactivityHook } from '@signaldb/react';
import { effect } from '@maverick-js/signals';

import { Folder as FolderType, Todo } from '../types/folder';
import { foldersCollection, todosCollection } from '../db/collections';
import { folderService } from '../services/folderService';

interface FolderTreeItemProps {
  folder: FolderType;
  todos: Todo[];
  level: number;
  onSelectFolder: (folderId: string) => void;
  selectedFolderId: string | null;
  onDrop: (todoId: string, folderId: string) => void;
}

const useReactivity = createUseReactivityHook(effect);

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  todos,
  level,
  onSelectFolder,
  selectedFolderId,
  onDrop
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [editColor, setEditColor] = useState(folder.color);
  const [isDragOver, setIsDragOver] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && editRef.current && !editRef.current.contains(event.target as Node)) {
        handleSaveEdit();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, editName, editColor]);

  const childFolders = useReactivity(() => 
    foldersCollection
      .find({ parentId: folder.id })
      .fetch()
      .sort((a, b) => a.name.localeCompare(b.name)), 
    []
  );

  const folderTodos = todos
    .filter(todo => todo.folderId === folder.id)
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleEdit = () => {
    if (folder.id === 'root') return;
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    folderService.updateFolder(folder.id, { name: editName, color: editColor });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(folder.name);
    setEditColor(folder.color);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (folder.id === 'root') return;
    if (confirm(`Delete folder "${folder.name}" and all its contents?`)) {
      folderService.deleteFolder(folder.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const todoId = e.dataTransfer.getData('todoId');
    const draggedFolderId = e.dataTransfer.getData('folderId');
    
    if (todoId) {
      onDrop(todoId, folder.id);
    } else if (draggedFolderId && draggedFolderId !== folder.id) {
      // Check if trying to move a folder to its own descendant
      const isDescendant = (parentId: string, checkId: string): boolean => {
        if (parentId === checkId) return true;
        const childFolders = foldersCollection.find({ parentId }).fetch();
        return childFolders.some(child => isDescendant(child.id, checkId));
      };
      
      if (!isDescendant(draggedFolderId, folder.id)) {
        folderService.moveFolder(draggedFolderId, folder.id);
      }
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
          selectedFolderId === folder.id ? 'bg-blue-50' : ''
        } ${isDragOver ? 'bg-blue-100' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => onSelectFolder(folder.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5"
        >
          {childFolders.length > 0 || folderTodos.length > 0 ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <div className="w-4" />
          )}
        </button>

        {isEditing ? (
          <div ref={editRef} className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-6 h-6 cursor-pointer"
            />
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-2 py-0.5 border rounded"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <button
              onClick={handleSaveEdit}
              className="text-green-600 hover:text-green-700"
            >
              ✓
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-red-600 hover:text-red-700"
            >
              ✗
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 flex-1"
            draggable={folder.id !== 'root'}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('folderId', folder.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            {isExpanded ? (
              <FolderOpen size={16} color={folder.color} />
            ) : (
              <Folder size={16} color={folder.color} />
            )}
            <span className="flex-1">{folder.name}</span>
            <span className="text-xs text-gray-500">
              ({folderTodos.length})
            </span>
            {folder.id !== 'root' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div>
          {childFolders.map(childFolder => (
            <FolderTreeItem
              key={childFolder.id}
              folder={childFolder}
              todos={todos}
              level={level + 1}
              onSelectFolder={onSelectFolder}
              selectedFolderId={selectedFolderId}
              onDrop={onDrop}
            />
          ))}
          {folderTodos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
              style={{ paddingLeft: `${(level + 1) * 16 + 20}px` }}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('todoId', todo.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <span className={todo.completed ? 'line-through' : ''}>
                {todo.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface FolderTreeProps {
  onSelectFolder: (folderId: string) => void;
  selectedFolderId: string | null;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ onSelectFolder, selectedFolderId }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const folders = useReactivity(() => foldersCollection.find({}).fetch(), []);
  const todos = useReactivity(() => todosCollection.find({}).fetch(), []);
  
  const rootFolder = folders.find(f => f.id === 'root');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      folderService.createFolder(newFolderName.trim(), selectedFolderId || 'root');
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleDropTodo = (todoId: string, folderId: string) => {
    todosCollection.updateOne({ id: todoId }, { $set: { folderId } });
  };

  if (!rootFolder) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Folders</h3>
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus size={18} />
          </button>
        </div>
        
        {showNewFolder && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="flex-1 px-2 py-1 border rounded text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setNewFolderName('');
                  setShowNewFolder(false);
                }
              }}
            />
            <button
              onClick={handleCreateFolder}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <FolderTreeItem
          folder={rootFolder}
          todos={todos}
          level={0}
          onSelectFolder={onSelectFolder}
          selectedFolderId={selectedFolderId}
          onDrop={handleDropTodo}
        />
      </div>
    </div>
  );
};