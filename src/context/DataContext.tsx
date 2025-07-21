import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createList,
  fetchLists,
  updateListName,
} from '../services/firestoreService'
import { auth } from '@/firebase' // ✅ caminho absoluto com alias

export interface ListType {
  id: string
  name: string
  items: any[]
}

interface DataContextType {
  lists: ListType[]
  createNewList: (name: string) => Promise<void>
  updateListNameInContext: (id: string, newName: string) => Promise<void>
}

export const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [lists, setLists] = useState<ListType[]>([])

  const loadLists = async () => {
    const userId = auth.currentUser?.uid
    if (!userId) return
    const fetchedLists = await fetchLists(userId)
    setLists(fetchedLists)
  }

  useEffect(() => {
    loadLists()
  }, [])

  const createNewList = async (name: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return
    const newList = await createList(userId, name)
    setLists((prev) => [...prev, newList])
  }

  const updateListNameInContext = async (id: string, newName: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return
    await updateListName(userId, id, newName)
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === id ? { ...list, name: newName } : list
      )
    )
  }

  return (
    <DataContext.Provider value={{ lists, createNewList, updateListNameInContext }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider')
  }
  return context
}
