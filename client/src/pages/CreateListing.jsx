import React, { useState } from "react";
import axios from "axios";

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading]  = useState(false);

  // Fonction pour uploader une image sur Cloudinary
  const storeImage = async (file) => {
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/diievnipd/image/upload";
    const uploadPreset = "mern_estate"; // Remplace par ton upload preset

    // FormData pour envoyer le fichier
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(cloudinaryUrl, data, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload de ${file.name} : ${progress}% terminé`);
        },
      });
      return response.data.secure_url; 
    } catch (error) {
      console.error("Erreur lors de l'upload sur Cloudinary :", error);
      throw error;
    }
  };

  // Gestion de la soumission des images
  const handleImageSubmit = async (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {

        setUploading(true);
        setImageUploadError(false);

      const promises = Array.from(files).map((file) => storeImage(file));

      try {
        const urls = await Promise.all(promises);
        setFormData((prev) => ({
          ...prev,
          imageUrls: prev.imageUrls.concat(urls),
        }));

        setImageUploadError(false);
        setUploading(false);
      } catch (error) {
        setImageUploadError("Image upload failed (2mb max per image):", error);
        setUploading(false);
      }
    } else {
        setImageUploadError("You can only upload 6 images per listing");
        setUploading(false);
    }
  };
//   console.log(formData.imageUrls.length );

  const handleRemoveImage = (index) => {
    setFormData({
        ...formData,
        imageUrls : formData.imageUrls.filter((_, i) => i !== index)
    })
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>

      <form className="flex flex-col sm:flex-row gap-4">

        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="p-3 rounded-lg border border-gray-300"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />

          <textarea
            type="text"
            placeholder="Description"
            className="p-3 rounded-lg border border-gray-300"
            id="description"
            required
          />

          <input
            type="text"
            placeholder="Address"
            className="p-3 rounded-lg border border-gray-300"
            id="address"
            required
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking Spot</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
              />
              <p>Beds</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
              />
              <p>Baths</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="regularPrice"
                min="1"
                max="10"
                required
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="discountPrice"
                min="1"
                max="10"
                required
              />
              <div className="flex flex-col items-center">
                <p>Discounted Price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:{" "}
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />

            <button
                disabled = {uploading}
              onClick={handleImageSubmit}
              type="button"
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <p 
          className="text-red-700 text-sm"
          >{imageUploadError && imageUploadError}
          </p>

        {
            (formData.imageUrls.length > 0) && formData.imageUrls.map((url, index) => (
                <div 
                className="flex justify-between p-3 border items-center"
                key={url}
                >
                    <img 
                    src={url} 
                    alt="listing image" 
                    className="w-28 h-28 object-contain rounded-lg"/>

                    <button 
                    type ="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75">Delete</button>
                </div>
                
            ))
        }

          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-80">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
