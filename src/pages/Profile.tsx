import React, { useState } from 'react';
import { UserIcon, MoonIcon, SunIcon, BellIcon, FileTextIcon, LogOutIcon, ChevronRightIcon, CameraIcon, XIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { showToast } from '../components/ui/Toaster';
const Profile: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode
  } = useTheme();
  const {
    user,
    updateUser
  } = useData();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const handleNameSubmit = () => {
    if (newName.trim()) {
      updateUser({
        name: newName.trim()
      });
      setIsEditingName(false);
      showToast('Nome atualizado com sucesso', 'success');
    }
  };
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulate photo upload
    setIsUploadingPhoto(false);
    showToast('Foto atualizada com sucesso', 'success');
  };
  const handleLogout = () => {
    showToast('Logout realizado com sucesso', 'success');
  };
  return <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Perfil</h1>
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 flex items-center">
          <div className="relative">
            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>}
            <button onClick={() => setIsUploadingPhoto(true)} className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              <CameraIcon className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
          <div className="ml-4 flex-grow">
            {isEditingName ? <div className="flex">
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" autoFocus />
                <button onClick={handleNameSubmit} className="ml-2 px-3 bg-yellow-500 text-black rounded-lg">
                  Salvar
                </button>
              </div> : <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-medium text-lg">{user.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <button onClick={() => setIsEditingName(true)} className="text-yellow-500 text-sm">
                  Editar
                </button>
              </div>}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {darkMode ? <SunIcon className="w-5 h-5 text-yellow-500 mr-3" /> : <MoonIcon className="w-5 h-5 text-yellow-500 mr-3" />}
              <span>Modo escuro</span>
            </div>
            <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full relative ${darkMode ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'} transition-colors duration-300`} aria-label="Toggle dark mode">
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <BellIcon className="w-5 h-5 text-yellow-500 mr-3" />
              <span>Notificações</span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <FileTextIcon className="w-5 h-5 text-yellow-500 mr-3" />
              <span>Termos de uso</span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-red-500">
        <LogOutIcon className="w-5 h-5 mr-2" />
        <span>Sair da conta</span>
      </button>
      {/* Photo Upload Modal */}
      {isUploadingPhoto && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Alterar foto de perfil</h2>
              <button onClick={() => setIsUploadingPhoto(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-4">
              <CameraIcon className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                Clique para selecionar uma imagem ou arraste e solte aqui
              </p>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg cursor-pointer">
                Escolher foto
              </label>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setIsUploadingPhoto(false)} className="text-gray-600 dark:text-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default Profile;