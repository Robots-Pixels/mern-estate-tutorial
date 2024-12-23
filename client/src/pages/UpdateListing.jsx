import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address:"",
    type: "rent",
    bedrooms: 1, 
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading]  = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const {currentUser} = useSelector(state => state.user);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
        const listingId = params.listingId;
        const res = await fetch(`/api/listing/get/${listingId}`);

        const data = await res.json();
        if(data.success === false){
            console.log(data.message);
            return;
        }

        setFormData(data);
    }
    fetchListing();
  }, []);

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

  const handleImageSubmit = async (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      const promises = Array.from(files).map((file) => storeImage(file));

      try {
        setUploading(true);
        setImageUploadError(false);

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

  const handleRemoveImage = (index) => {
    setFormData({
        ...formData,
        imageUrls : formData.imageUrls.filter((_, i) => i !== index)
    })
  }

  const handleChange = (e) => {
    if(e.target.id === "sale" ||  e.target.id === "rent"){
        setFormData({
            ...formData,
            type: e.target.id
        })
    }

    if(e.target.id === "parking" || e.target.id === "furnished" || e.target.id === "offer" ){
        setFormData({
            ...formData,
            [e.target.id] : e.target.checked
        })
    }

    if(e.target.type === "number" || e.target.type === "text" || e.target.type === "textarea"){
        setFormData({
            ...formData,
            [e.target.id] : e.target.value
        })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

        if(formData.imageUrls.length < 1) {
            setError("You must upload at least one image");
            return;
        }

        if(formData.regularPrice < +formData.discountPrice) {
            setError("Discout must be lower than regular price");
            return;
        }

        setLoading(true);
        setError(false);
        const res = await fetch(`/api/listing/update/${params.listingId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                ...formData,
                userRef: currentUser._id
            })
        })

        const data = await res.json();

        setLoading(false);
        if (data.success === false){
            setError(data.message);
        }

        navigate(`/listing/${data._id}`);

    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Update a Listing</h1>

      <form onSubmit={handleSubmit} 
      className="flex flex-col sm:flex-row gap-4"
      >

        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="p-3 rounded-lg border border-gray-300"
            id="name"
            maxLength="62"
            minLength="5"
            required
            onChange={handleChange}
            value={formData.name}
          />

          <textarea
            type="text"
            placeholder="Description"
            className="p-3 rounded-lg border border-gray-300"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />

          <input
            type="text"
            placeholder="Address"
            className="p-3 rounded-lg border border-gray-300"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}

          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input 
              type="checkbox" 
              id="sale" 
              className="w-5" 
              onChange={handleChange}
              checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>

            <div className="flex gap-2">
              <input 
              type="checkbox" 
              id="rent" 
              className="w-5" 
              onChange={handleChange}
              checked={formData.type === "rent"}/>
              <span>Rent</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" 
              onChange={handleChange}
              checked={formData.parking}/>
              <span>Parking Spot</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" 
              onChange={handleChange}
              checked={formData.furnished} />
              <span>Furnished</span>
            </div>

            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" 
              onChange={handleChange}
              checked={formData.offer}/>
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
                onChange={handleChange}
                value={formData.bedrooms}
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
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                {formData.type === "rent" && (
                    <span className="text-xs">($ / month)</span>
                )}
              </div>
            </div>

            {formData.offer 
            && 
            <div className="flex items-center gap-2">
            <input
              className="p-3 border border-gray-300 rounded-lg"
              type="number"
              id="discountPrice"
              min="0"
              max="1000000"
              required
              onChange={handleChange}
              value={formData.discountPrice}
            />
            <div className="flex flex-col items-center">
              <p>Discounted Price</p>
              {formData.type === "rent" && (
                    <span className="text-xs">($ / month)</span>
                )}
            </div>
          </div>
            }

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

          <button 
          disabled={loading || uploading}
          className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? "Updating..." : "Update Listing"}
          </button>

          {
            error && <p className="text-red-700 text-sm">{error}</p>
          }

        </div>
      </form>
    </main>
  );
}
