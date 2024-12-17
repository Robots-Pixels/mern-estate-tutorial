import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
   UpdateUserStart, 
   UpdateUserSuccess, 
   UpdateUserFailure,
   deleteUserStart,
   deleteUserSuccess,
   deleteUserFailure,
   signOutUserStart,
   signOutUserFailure,
   signOutUserSuccess
 } from '../redux/user/userSlice';


import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [updateSuccess, setUpdateSuccess] = useState(null)

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    const formDataObject = new FormData();
    formDataObject.append('file', file);
    formDataObject.append('upload_preset', "mern_estate");
    formDataObject.append('cloud_name', 'diievnipd');

    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/diievnipd/image/upload", 
        formDataObject,
        {
          onUploadProgress: (progressEvent) => {
            console.log(formDataObject);
            const progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
            setFilePerc(progress);
          }
        }
      )
      setFormData({ ...formData, avatar: res.data.secure_url });
      setFileUploadError(false);
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      setFileUploadError(true);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]:e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(UpdateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json();
      if(data.success === false){
        dispatch(UpdateUserFailure(data.message));
        return;
      }

      dispatch(UpdateUserSuccess(data));
      setUpdateSuccess(true);

    } catch (error) {
      dispatch(UpdateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch (`/api/user/delete/${currentUser._id}`,
        {method: "DELETE"});

      const data = await res.json();
      if(data.success === false){
        dispatch(deleteUserFailure(data.message));
      }

      dispatch(deleteUserSuccess());

    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOut = async() =>{
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signOut");
      const data = await res.json();

      if(data.success === false){
        dispatch(signOutUserFailure(data.message ));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(data.message));
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form 
      onSubmit={handleSubmit}
      className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='text'
          placeholder='username'
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          defaultValue={currentUser.email}
          id='email'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        
        <input
          type='password'
          placeholder='password'
          id='password'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? "Loading..." : "Update"}
        </button>

        <Link
        className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95' 
        to={"/create-listing"}>
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span 
        onClick={handleDeleteUser}
        className='text-red-700 cursor-pointer'>Delete account</span>

        <span
        onClick={handleSignOut} 
        className='text-red-700 cursor-pointer'>Sign out</span>

      </div>

        {error && <p className="text-red-700 mt-5">{error}</p>}

        {updateSuccess && <p className='text-green-700'>User Updated Successfully</p>}

    </div>
  );
}
