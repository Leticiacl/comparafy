// src/context/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createList,
  fetchLists,
  updateListName,
} from '../services/firestoreService'
import { auth } from "../services/firebase";

export interface ListType {
  id: string
  name: string
  items: any[]
}

interface DataContextType {
  lists: ListType[]
  createNewList: (name: string) => Promise<string | null>
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadLists()
      }
    })
    return () => unsubscribe()
  }, [])

  const createNewList = async (name: string) => {
    const userId = auth.currentUser?.uid
    if (!userId) return null
    const newList = await createList(userId, name)
    if (newList) {
      setLists((prev) => [...prev, newList])
      return newList.id
    }
    return null
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
