import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

export default function Contact({listing}) {
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchLandlord = async () =>{
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                setLandlord(data);

            } catch (error) {
                console.log(error);
            }
        }

        fetchLandlord();
    }, [listing.userRef])

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

  return (
    <>
        {landlord 
        &&
        <div className='flex flex-col gap-2'>
            <p>Contact <span className='font-semibold'>{landlord.username}</span> for <span className='font-semibold'>{listing.name.toLowerCase()}</span></p>
            <textarea
            onChange={handleChange}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-lg'
            name="message" id="message" rows="2" value={message}>

            </textarea>

            <Link 
             to={`mailto:${encodeURIComponent(landlord.email)}?subject=${encodeURIComponent(`Regarding ${listing.name}`)}&body=${encodeURIComponent(message)}`}
            className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'
            >
            Send Message
            </Link>

        </div>
        }
    </>
  )
}
