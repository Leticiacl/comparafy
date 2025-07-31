// src/pages/Profile.tsx
import React, { useState, useEffect, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, storage } from '../services/firebase'
import { updateProfile, signOut } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import BottomNav from '../components/BottomNav'
import { CameraIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const Profile: React.FC = () => {
  const nav = useNavigate()
  const user = auth.currentUser

  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(user?.displayName || '')
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
    }
  }, [user])

  const handleNameSave = async () => {
    if (user && name.trim()) {
      await updateProfile(user, { displayName: name.trim() })
      setEditingName(false)
    }
  }

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return
    setUploading(true)
    const file = e.target.files[0]
    const avatarRef = ref(storage, `avatars/${user.uid}`)
    await uploadBytes(avatarRef, file)
    const url = await getDownloadURL(avatarRef)
    await updateProfile(user, { photoURL: url })
    setPhotoURL(url)
    setUploading(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    nav('/login')
  }

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* Card com foto, nome e e-mail */}
      <div className="bg-white rounded-xl shadow flex items-center p-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
            {photoURL && <img src={photoURL} className="h-full w-full object-cover" />}
          </div>
          <label className="absolute bottom-0 right-0 bg-yellow-500 p-1 rounded-full cursor-pointer">
            <CameraIcon className="h-4 w-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <div className="ml-4 flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                className="border px-2 py-1 rounded-lg flex-1"
              />
              <button onClick={handleNameSave} className="text-yellow-600 font-medium">
                Salvar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{user?.displayName || '—'}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={() => setEditingName(true)}
                className="text-yellow-600 hover:underline"
              >
                Editar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de opções */}
      <div className="bg-white rounded-xl shadow divide-y">
        <button
          onClick={() => nav('/notifications')}
          className="flex items-center justify-between w-full px-4 py-3"
        >
          Notificações <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>
        <button
          onClick={() => nav('/terms')}
          className="flex items-center justify-between w-full px-4 py-3"
        >
          Termos de uso <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium"
      >
        Sair da conta
      </button>

      {/* Bottom nav */}
      <BottomNav activeTab="profile" />
    </div>
  )
}

export default Profile
