import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'mern_estate'); 

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/diievnipd/image/upload', 
        formData
      );
      console.log('Image uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading the file:', error);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />

        <img
          onClick={() => fileRef.current.click()}
          src={currentUser.avatar || 'default-avatar-url'}
          alt="profile"
          className="rounded-full h-27 w-27 object-cover cursor-pointer self-center mt-2"
        />

        <input type="text" placeholder="username" id="username" className="border p-3 rounded-lg" />

        <input type="email" placeholder="email" id="email" className="border p-3 rounded-lg" />

        <input type="password" placeholder="password" id="password" className="border p-3 rounded-lg" />

        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">
          UPDATE
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer">Delete account</span>
        <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
}
