import React, { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { FiEdit2, FiUploadCloud, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

function UserProfile() {
  const { user, setUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const fileInputRef = useRef(null);

  if (!user) {
    return <div className="p-4">Please login to see your profile.</div>;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        toast.success('Photo preview updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = { ...user, name, photo };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Your Profile</h2>

      <div className="flex flex-col items-center space-y-4">
        {/* Profile Image */}
        <div className="relative">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 border-4 border-blue-500">
              <FiUser className="text-4xl text-gray-600 dark:text-white" />
            </div>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                title="Upload Photo"
              >
                <FiUploadCloud />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* User Name */}
        <div className="w-full text-center">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
          {isEditing ? (
            <input
              type="text"
              className="mt-1 w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{name}</p>
          )}
        </div>

        {/* User Email */}
        <div className="w-full text-center">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
          <p className="mt-1 text-gray-600 dark:text-gray-200">{user.email}</p>
        </div>

        {/* Buttons */}
        <div className="mt-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiEdit2 /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
